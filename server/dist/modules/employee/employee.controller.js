"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmployeeDocument = exports.getDocumentExpiries = exports.importEmployees = exports.getCompanyCalendar = exports.createAnnouncement = exports.getAnnouncements = exports.getEmployeeExpiries = exports.toggleChecklistItem = exports.getEmployeeChecklists = exports.getEssSummary = exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.getEmployees = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const audit_js_1 = require("../../utils/audit.js");
const getEmployees = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { search, departmentId, status, page = '1', limit = '20', } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {
            organizationId: orgId,
        };
        if (departmentId) {
            where.departmentId = departmentId;
        }
        if (status) {
            where.employmentStatus = status;
        }
        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { employeeCode: { contains: search } },
            ];
        }
        const [total, employees] = await Promise.all([
            prisma_js_1.prisma.employee.count({ where }),
            prisma_js_1.prisma.employee.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    department: true,
                    designation: true,
                    branch: true,
                    reportingManager: {
                        select: { id: true, firstName: true, lastName: true, employeeCode: true },
                    },
                },
                orderBy: { employeeCode: 'asc' },
            }),
        ]);
        return res.json({
            success: true,
            data: employees,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        const employee = await prisma_js_1.prisma.employee.findFirst({
            where: { id: id, organizationId: orgId },
            include: {
                department: true,
                designation: true,
                branch: true,
                shift: true,
                reportingManager: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                subordinates: {
                    select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true },
                },
                salaryRecord: true,
                documents: true,
                leaveBalances: {
                    include: { leaveType: true },
                },
            },
        });
        if (!employee)
            return next(new errorHandler_js_1.AppError('Employee not found', 404));
        // Field-level permission check: mask baseSalary if ordinary employee viewing another peer
        const isHrOrPayrollOrSelf = req.user?.isSuperAdmin ||
            ['ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER', 'PAYROLL_MANAGER'].includes(req.user?.role || '') ||
            req.user?.employeeId === employee.id;
        const empData = { ...employee };
        if (!isHrOrPayrollOrSelf) {
            empData.salaryRecord = null;
        }
        return res.json({ success: true, data: empData });
    }
    catch (err) {
        next(err);
    }
};
exports.getEmployeeById = getEmployeeById;
const createEmployee = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { employeeCode, firstName, lastName, email, phone, departmentId, designationId, branchId, shiftId, reportingManagerId, employmentType = 'FULL_TIME', baseSalary, dateOfJoining, gender, dateOfBirth, } = req.body;
        if (!employeeCode || !firstName || !lastName || !email) {
            return next(new errorHandler_js_1.AppError('Code, first name, last name, and email are required', 400));
        }
        // Check workspace status and subscription limits
        const org = await prisma_js_1.prisma.organization.findUnique({
            where: { id: orgId },
            select: { maxEmployees: true, status: true, subscriptionPlan: true },
        });
        if (org && org.status !== 'ACTIVE' && !req.user?.isSuperAdmin) {
            return next(new errorHandler_js_1.AppError(`Workspace is currently ${org.status.toLowerCase()}. New employee onboarding is restricted.`, 403));
        }
        if (org?.maxEmployees) {
            const activeEmployeeCount = await prisma_js_1.prisma.employee.count({
                where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
            });
            if (activeEmployeeCount >= org.maxEmployees) {
                return next(new errorHandler_js_1.AppError(`Employee subscription limit reached (${org.maxEmployees} max on ${org.subscriptionPlan} tier). Please upgrade your subscription plan to onboard more personnel.`, 403));
            }
        }
        const existing = await prisma_js_1.prisma.employee.findUnique({
            where: {
                organizationId_employeeCode: {
                    organizationId: orgId,
                    employeeCode,
                },
            },
        });
        if (existing) {
            return next(new errorHandler_js_1.AppError('Employee with this employee code already exists', 400));
        }
        const newEmployee = await prisma_js_1.prisma.$transaction(async (tx) => {
            const emp = await tx.employee.create({
                data: {
                    organizationId: orgId,
                    employeeCode,
                    firstName,
                    lastName,
                    email,
                    phone,
                    departmentId: departmentId || null,
                    designationId: designationId || null,
                    branchId: branchId || null,
                    shiftId: shiftId || null,
                    reportingManagerId: reportingManagerId || null,
                    employmentType,
                    employmentStatus: 'ACTIVE',
                    dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
                    gender,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                },
                include: {
                    department: true,
                    designation: true,
                },
            });
            if (baseSalary) {
                await tx.employeeSalary.create({
                    data: {
                        organizationId: orgId,
                        employeeId: emp.id,
                        baseSalary: parseFloat(baseSalary),
                    },
                });
            }
            // Initialize leave balances for active leave types
            const leaveTypes = await tx.leaveType.findMany({ where: { organizationId: orgId } });
            const currentYear = new Date().getFullYear();
            for (const lt of leaveTypes) {
                await tx.leaveBalance.create({
                    data: {
                        organizationId: orgId,
                        employeeId: emp.id,
                        leaveTypeId: lt.id,
                        year: currentYear,
                        allocatedDays: lt.daysAllowed,
                        remainingDays: lt.daysAllowed,
                    },
                });
            }
            return emp;
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'EMPLOYEE_CREATE',
            entityType: 'EMPLOYEE',
            entityId: newEmployee.id,
            details: { employeeCode, email, firstName, lastName },
        });
        return res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: newEmployee,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createEmployee = createEmployee;
const updateEmployee = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        const { firstName, lastName, phone, departmentId, designationId, branchId, shiftId, reportingManagerId, employmentStatus, address, emergencyContactName, emergencyContactPhone, emergencyContactRelation, baseSalary, } = req.body;
        const targetId = id;
        // Strict tenant isolation guard: prevent cross-tenant IDOR updates
        const existingEmp = await prisma_js_1.prisma.employee.findFirst({
            where: { id: targetId, organizationId: orgId },
        });
        if (!existingEmp) {
            return next(new errorHandler_js_1.AppError('Employee not found in your organization workspace', 404));
        }
        const updated = await prisma_js_1.prisma.$transaction(async (tx) => {
            const emp = await tx.employee.update({
                where: { id: targetId },
                data: {
                    firstName,
                    lastName,
                    phone,
                    departmentId,
                    designationId,
                    branchId,
                    shiftId,
                    reportingManagerId,
                    employmentStatus,
                    address,
                    emergencyContactName,
                    emergencyContactPhone,
                    emergencyContactRelation,
                },
            });
            if (baseSalary !== undefined) {
                await tx.employeeSalary.upsert({
                    where: { employeeId: targetId },
                    create: {
                        organizationId: orgId,
                        employeeId: targetId,
                        baseSalary: parseFloat(baseSalary),
                    },
                    update: {
                        baseSalary: parseFloat(baseSalary),
                    },
                });
            }
            return emp;
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'EMPLOYEE_UPDATE',
            entityType: 'EMPLOYEE',
            entityId: targetId,
        });
        return res.json({
            success: true,
            message: 'Employee updated successfully',
            data: updated,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const targetId = id;
        const employee = await prisma_js_1.prisma.employee.findFirst({
            where: { id: targetId, organizationId: orgId },
        });
        if (!employee)
            return next(new errorHandler_js_1.AppError('Employee record not found', 404));
        if (req.user?.employeeId === employee.id) {
            return next(new errorHandler_js_1.AppError('You cannot delete your own employee profile.', 400));
        }
        await prisma_js_1.prisma.$transaction(async (tx) => {
            await tx.employeeDocument.deleteMany({ where: { employeeId: employee.id } });
            await tx.leaveBalance.deleteMany({ where: { employeeId: employee.id } });
            await tx.leaveRequest.deleteMany({ where: { employeeId: employee.id } });
            await tx.attendanceRecord.deleteMany({ where: { employeeId: employee.id } });
            await tx.attendanceCorrectionRequest.deleteMany({ where: { employeeId: employee.id } });
            await tx.overtimeRequest.deleteMany({ where: { employeeId: employee.id } });
            await tx.payslip.deleteMany({ where: { employeeId: employee.id } });
            await tx.employeeSalary.deleteMany({ where: { employeeId: employee.id } });
            await tx.assetAssignment.deleteMany({ where: { employeeId: employee.id } });
            await tx.performanceReview.deleteMany({ where: { employeeId: employee.id } });
            await tx.employeeGoal.deleteMany({ where: { employeeId: employee.id } });
            await tx.trainingEnrollment.deleteMany({ where: { employeeId: employee.id } });
            await tx.employeeLoan.deleteMany({ where: { employeeId: employee.id } });
            await tx.expenseClaim.deleteMany({ where: { employeeId: employee.id } });
            await tx.checklistItem.deleteMany({
                where: {
                    OR: [
                        { onboarding: { employeeId: employee.id } },
                        { offboarding: { employeeId: employee.id } },
                    ],
                },
            });
            await tx.onboardingChecklist.deleteMany({ where: { employeeId: employee.id } });
            await tx.offboardingChecklist.deleteMany({ where: { employeeId: employee.id } });
            await tx.employee.delete({
                where: { id: employee.id },
            });
            if (employee.userId) {
                await tx.organizationMembership.deleteMany({
                    where: { userId: employee.userId, organizationId: orgId },
                });
            }
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'EMPLOYEE_DELETE',
            entityType: 'EMPLOYEE',
            entityId: employee.id,
            details: { employeeCode: employee.employeeCode, name: `${employee.firstName} ${employee.lastName}` },
        });
        return res.json({ success: true, message: 'Employee record successfully removed' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEmployee = deleteEmployee;
/**
 * Employee Self-Service (ESS) Consolidated Hub Summary
 */
const getEssSummary = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return res.json({
                success: true,
                data: {
                    hasEmployeeProfile: false,
                    user: req.user,
                },
            });
        }
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [employee, todayAttendance, leaveBalances, recentPayslips, assignedAssets, supportTickets, onboarding] = await Promise.all([
            prisma_js_1.prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    department: true,
                    designation: true,
                    branch: true,
                    shift: true,
                },
            }),
            prisma_js_1.prisma.attendanceRecord.findFirst({
                where: {
                    employeeId,
                    date: { gte: todayStart },
                },
            }),
            prisma_js_1.prisma.leaveBalance.findMany({
                where: { employeeId },
                include: { leaveType: true },
            }),
            prisma_js_1.prisma.payslip.findMany({
                where: { employeeId },
                take: 3,
                orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
            }),
            prisma_js_1.prisma.assetAssignment.findMany({
                where: { employeeId, returnedDate: null },
                include: { asset: true },
            }),
            prisma_js_1.prisma.supportTicket.findMany({
                where: { employeeId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
                take: 5,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_js_1.prisma.onboardingChecklist.findUnique({
                where: { employeeId },
                include: { items: true },
            }),
        ]);
        return res.json({
            success: true,
            data: {
                hasEmployeeProfile: true,
                employee,
                todayAttendance,
                leaveBalances,
                recentPayslips,
                assignedAssets: assignedAssets.map((a) => a.asset),
                pendingTickets: supportTickets,
                onboarding,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getEssSummary = getEssSummary;
/**
 * Onboarding & Offboarding Checklists
 */
const getEmployeeChecklists = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const employeeId = req.params.employeeId;
        const targetId = employeeId === 'me' ? (req.user?.employeeId ?? undefined) : employeeId;
        if (!targetId)
            return next(new errorHandler_js_1.AppError('Employee ID required', 400));
        // Verify employee belongs to current organization
        const targetEmp = await prisma_js_1.prisma.employee.findFirst({
            where: { id: targetId, organizationId: orgId },
        });
        if (!targetEmp && !req.user?.isSuperAdmin) {
            return next(new errorHandler_js_1.AppError('Employee not found in your organization workspace', 404));
        }
        const [onboarding, offboarding] = await Promise.all([
            prisma_js_1.prisma.onboardingChecklist.findUnique({
                where: { employeeId: targetId },
                include: { items: true },
            }),
            prisma_js_1.prisma.offboardingChecklist.findUnique({
                where: { employeeId: targetId },
                include: { items: true },
            }),
        ]);
        return res.json({ success: true, data: { onboarding, offboarding } });
    }
    catch (err) {
        next(err);
    }
};
exports.getEmployeeChecklists = getEmployeeChecklists;
const toggleChecklistItem = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const itemId = req.params.itemId;
        const { isCompleted } = req.body;
        const item = await prisma_js_1.prisma.checklistItem.findUnique({
            where: { id: itemId },
            include: {
                onboarding: true,
                offboarding: true,
            },
        });
        if (!item)
            return next(new errorHandler_js_1.AppError('Checklist item not found', 404));
        const itemOrgId = item.onboarding?.organizationId || item.offboarding?.organizationId;
        if (itemOrgId && itemOrgId !== orgId && !req.user?.isSuperAdmin) {
            return next(new errorHandler_js_1.AppError('Forbidden: Access denied to this checklist item', 403));
        }
        const updated = await prisma_js_1.prisma.checklistItem.update({
            where: { id: itemId },
            data: {
                isCompleted: !!isCompleted,
                completedBy: isCompleted ? req.user?.email || 'HR Admin' : null,
                completedAt: isCompleted ? new Date() : null,
            },
        });
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleChecklistItem = toggleChecklistItem;
/**
 * Expiry Reminders (Probation & Contracts)
 */
const getEmployeeExpiries = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const now = new Date();
        const in90Days = new Date();
        in90Days.setDate(in90Days.getDate() + 90);
        const expiringEmployees = await prisma_js_1.prisma.employee.findMany({
            where: {
                organizationId: orgId,
                employmentStatus: { in: ['ACTIVE', 'PROBATION'] },
                probationEnd: {
                    not: null,
                    lte: in90Days,
                },
            },
            select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                email: true,
                employmentStatus: true,
                dateOfJoining: true,
                probationEnd: true,
                department: { select: { name: true } },
                designation: { select: { name: true } },
            },
            orderBy: { probationEnd: 'asc' },
        });
        return res.json({ success: true, data: expiringEmployees });
    }
    catch (err) {
        next(err);
    }
};
exports.getEmployeeExpiries = getEmployeeExpiries;
/**
 * Announcements
 */
const getAnnouncements = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const announcements = await prisma_js_1.prisma.announcement.findMany({
            where: { organizationId: orgId },
            orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        });
        return res.json({ success: true, data: announcements });
    }
    catch (err) {
        next(err);
    }
};
exports.getAnnouncements = getAnnouncements;
const createAnnouncement = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { title, content, category, isPinned } = req.body;
        if (!title || !content)
            return next(new errorHandler_js_1.AppError('Title and content are required', 400));
        const announcement = await prisma_js_1.prisma.announcement.create({
            data: {
                organizationId: orgId,
                title,
                content,
                category: category || 'GENERAL',
                authorName: `${req.user?.firstName} ${req.user?.lastName}`,
                isPinned: !!isPinned,
            },
        });
        return res.status(201).json({ success: true, data: announcement });
    }
    catch (err) {
        next(err);
    }
};
exports.createAnnouncement = createAnnouncement;
/**
 * Company Consolidated Calendar (Holidays, Leaves, Events)
 */
const getCompanyCalendar = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { month, year } = req.query;
        const targetYear = parseInt(String(year || new Date().getFullYear()), 10);
        const targetMonth = parseInt(String(month || new Date().getMonth() + 1), 10);
        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        const [holidays, approvedLeaves, announcements] = await Promise.all([
            prisma_js_1.prisma.holiday.findMany({
                where: {
                    organizationId: orgId,
                    date: { gte: startOfMonth, lte: endOfMonth },
                },
            }),
            prisma_js_1.prisma.leaveRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: 'APPROVED',
                    startDate: { lte: endOfMonth },
                    endDate: { gte: startOfMonth },
                },
                include: {
                    employee: {
                        select: { firstName: true, lastName: true, employeeCode: true },
                    },
                    leaveType: { select: { name: true } },
                },
            }),
            prisma_js_1.prisma.announcement.findMany({
                where: {
                    organizationId: orgId,
                    publishedAt: { gte: startOfMonth, lte: endOfMonth },
                },
            }),
        ]);
        return res.json({
            success: true,
            data: {
                year: targetYear,
                month: targetMonth,
                holidays,
                approvedLeaves,
                announcements,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCompanyCalendar = getCompanyCalendar;
/**
 * Validated CSV/Excel Employee Import Workflow
 * Supports preview (dryRun: true), duplicate detection, row-level errors,
 * and transactional batch commit with onboarding checklist initialization.
 */
const importEmployees = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { employees: importList = [], dryRun = false } = req.body;
        if (!Array.isArray(importList) || importList.length === 0) {
            return next(new errorHandler_js_1.AppError('No employee records provided in import payload', 400));
        }
        const org = await prisma_js_1.prisma.organization.findUnique({
            where: { id: orgId },
            select: { maxEmployees: true },
        });
        const currentHeadcount = await prisma_js_1.prisma.employee.count({
            where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
        });
        const maxLimit = org?.maxEmployees || 25;
        // Fetch existing employee codes and emails in the organization
        const existingEmployees = await prisma_js_1.prisma.employee.findMany({
            where: { organizationId: orgId },
            select: { employeeCode: true, email: true },
        });
        const existingCodes = new Set(existingEmployees.map((e) => e.employeeCode.toLowerCase().trim()));
        const existingEmails = new Set(existingEmployees.map((e) => e.email.toLowerCase().trim()));
        const seenCodesInBatch = new Set();
        const seenEmailsInBatch = new Set();
        const rowErrors = [];
        const validRows = [];
        const duplicateRows = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        importList.forEach((raw, index) => {
            const rowNum = index + 1;
            const code = String(raw.employeeCode || '').trim();
            const email = String(raw.email || '').trim().toLowerCase();
            const firstName = String(raw.firstName || '').trim();
            const lastName = String(raw.lastName || '').trim();
            const phone = raw.phone ? String(raw.phone).trim() : null;
            const departmentName = String(raw.department || raw.departmentName || 'General').trim();
            const designationName = String(raw.designation || raw.designationName || 'Specialist').trim();
            const baseSalary = parseFloat(raw.baseSalary || raw.salary || '5000') || 5000;
            const employmentType = raw.employmentType || 'FULL_TIME';
            const errors = [];
            if (!code)
                errors.push('Missing required employeeCode');
            if (!firstName)
                errors.push('Missing required firstName');
            if (!lastName)
                errors.push('Missing required lastName');
            if (!email) {
                errors.push('Missing required email');
            }
            else if (!emailRegex.test(email)) {
                errors.push('Invalid email format');
            }
            const lowerCode = code.toLowerCase();
            let isDuplicate = false;
            // Duplicate check against database
            if (code && existingCodes.has(lowerCode)) {
                errors.push(`Employee code "${code}" already exists in company records`);
                isDuplicate = true;
            }
            if (email && existingEmails.has(email)) {
                errors.push(`Email "${email}" is already registered to another employee`);
                isDuplicate = true;
            }
            // Duplicate check within batch
            if (code && seenCodesInBatch.has(lowerCode)) {
                errors.push(`Duplicate employee code "${code}" found within this import file`);
                isDuplicate = true;
            }
            if (email && seenEmailsInBatch.has(email)) {
                errors.push(`Duplicate email "${email}" found within this import file`);
                isDuplicate = true;
            }
            if (code)
                seenCodesInBatch.add(lowerCode);
            if (email)
                seenEmailsInBatch.add(email);
            const parsedRecord = {
                row: rowNum,
                employeeCode: code,
                firstName,
                lastName,
                email,
                phone,
                departmentName,
                designationName,
                baseSalary,
                employmentType,
                isDuplicate,
                errors,
            };
            if (isDuplicate) {
                duplicateRows.push(parsedRecord);
            }
            if (errors.length > 0) {
                rowErrors.push({ row: rowNum, employeeCode: code, email, errors });
            }
            else {
                validRows.push(parsedRecord);
            }
        });
        // Check capacity quota
        if (currentHeadcount + validRows.length > maxLimit) {
            rowErrors.push({
                row: 0,
                employeeCode: 'SYSTEM_QUOTA',
                email: 'N/A',
                errors: [
                    `Batch import exceeds subscription limit (${maxLimit} max employees). Current: ${currentHeadcount}, Attempting: ${validRows.length}.`,
                ],
            });
        }
        // If dry run, return preview summary
        if (dryRun) {
            return res.json({
                success: true,
                dryRun: true,
                data: {
                    totalRows: importList.length,
                    validCount: validRows.length,
                    errorCount: rowErrors.length,
                    duplicateCount: duplicateRows.length,
                    canImport: rowErrors.length === 0 && validRows.length > 0,
                    preview: validRows.slice(0, 10),
                    errors: rowErrors,
                    duplicates: duplicateRows,
                },
            });
        }
        // If actual import requested but has blocking errors
        if (rowErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Import blocked by validation errors or duplicate records',
                errors: rowErrors,
                validCount: validRows.length,
            });
        }
        // Execute transactional batch creation
        const createdCount = await prisma_js_1.prisma.$transaction(async (tx) => {
            let count = 0;
            for (const item of validRows) {
                // Find or create department
                let dept = await tx.department.findFirst({
                    where: { organizationId: orgId, name: item.departmentName },
                });
                if (!dept) {
                    const deptCode = item.departmentName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 900 + 100);
                    dept = await tx.department.create({
                        data: {
                            organizationId: orgId,
                            name: item.departmentName,
                            code: deptCode,
                        },
                    });
                }
                // Find or create designation
                let desig = await tx.designation.findFirst({
                    where: { organizationId: orgId, name: item.designationName },
                });
                if (!desig) {
                    const desigCode = item.designationName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 900 + 100);
                    desig = await tx.designation.create({
                        data: {
                            organizationId: orgId,
                            name: item.designationName,
                            code: desigCode,
                        },
                    });
                }
                // Create Employee
                const emp = await tx.employee.create({
                    data: {
                        organizationId: orgId,
                        employeeCode: item.employeeCode,
                        firstName: item.firstName,
                        lastName: item.lastName,
                        email: item.email,
                        phone: item.phone,
                        departmentId: dept.id,
                        designationId: desig.id,
                        employmentType: item.employmentType,
                        employmentStatus: 'ACTIVE',
                    },
                });
                // Create Salary Record
                await tx.employeeSalary.create({
                    data: {
                        organizationId: orgId,
                        employeeId: emp.id,
                        baseSalary: item.baseSalary,
                    },
                });
                // Auto-provision standard Onboarding Checklist
                const checklist = await tx.onboardingChecklist.create({
                    data: {
                        organizationId: orgId,
                        employeeId: emp.id,
                        status: 'IN_PROGRESS',
                    },
                });
                await tx.checklistItem.createMany({
                    data: [
                        { onboardingId: checklist.id, title: 'Identity & Tax Forms Submitted', category: 'COMPLIANCE', isCompleted: false },
                        { onboardingId: checklist.id, title: 'Corporate Email & SSO Setup', category: 'IT', isCompleted: false },
                        { onboardingId: checklist.id, title: 'Workstation & Hardware Assignment', category: 'IT', isCompleted: false },
                        { onboardingId: checklist.id, title: 'Company Orientation & Handbook Review', category: 'HR', isCompleted: false },
                    ],
                });
                count++;
            }
            return count;
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'EMPLOYEES_BATCH_IMPORTED',
            entityType: 'EMPLOYEE',
            details: { importedCount: createdCount },
        });
        return res.status(201).json({
            success: true,
            message: `Successfully imported and provisioned ${createdCount} employee profile(s).`,
            data: { importedCount: createdCount },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.importEmployees = importEmployees;
/**
 * Employee Document Expiry Tracker (Differentiating Feature B)
 * Identifies expired documents, upcoming expiries (30/60/90 days),
 * and missing required compliance documents.
 */
const getDocumentExpiries = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const now = new Date();
        const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        const [allDocuments, activeEmployees] = await Promise.all([
            prisma_js_1.prisma.employeeDocument.findMany({
                where: { organizationId: orgId },
                include: {
                    employee: {
                        select: {
                            id: true,
                            employeeCode: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            department: { select: { name: true } },
                        },
                    },
                },
                orderBy: { expiryDate: 'asc' },
            }),
            prisma_js_1.prisma.employee.findMany({
                where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
                include: {
                    documents: { select: { category: true } },
                    department: { select: { name: true } },
                },
            }),
        ]);
        const expired = [];
        const expiringIn30Days = [];
        const expiringIn90Days = [];
        allDocuments.forEach((doc) => {
            if (!doc.expiryDate)
                return;
            const expDate = new Date(doc.expiryDate);
            if (expDate < now) {
                expired.push(doc);
            }
            else if (expDate <= in30Days) {
                expiringIn30Days.push(doc);
            }
            else if (expDate <= in90Days) {
                expiringIn90Days.push(doc);
            }
        });
        // Detect employees missing essential documents (ID_PROOF or CONTRACT)
        const missingComplianceDocs = [];
        activeEmployees.forEach((emp) => {
            const categories = new Set(emp.documents.map((d) => d.category));
            const missingTypes = [];
            if (!categories.has('ID_PROOF'))
                missingTypes.push('ID Proof');
            if (!categories.has('CONTRACT'))
                missingTypes.push('Employment Contract');
            if (missingTypes.length > 0) {
                missingComplianceDocs.push({
                    employeeId: emp.id,
                    employeeCode: emp.employeeCode,
                    employeeName: `${emp.firstName} ${emp.lastName}`,
                    department: emp.department?.name || 'General',
                    missingDocuments: missingTypes,
                });
            }
        });
        return res.json({
            success: true,
            data: {
                summary: {
                    expiredCount: expired.length,
                    expiringIn30DaysCount: expiringIn30Days.length,
                    expiringIn90DaysCount: expiringIn90Days.length,
                    missingComplianceCount: missingComplianceDocs.length,
                },
                expired,
                expiringIn30Days,
                expiringIn90Days,
                missingComplianceDocs,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getDocumentExpiries = getDocumentExpiries;
/**
 * Add Document to Employee Profile
 */
const addEmployeeDocument = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const employeeId = req.params.id;
        const { title, category, fileUrl, expiryDate } = req.body;
        if (!title || !category || !fileUrl) {
            return next(new errorHandler_js_1.AppError('title, category, and fileUrl are required', 400));
        }
        const employee = await prisma_js_1.prisma.employee.findFirst({
            where: { id: employeeId, organizationId: orgId },
        });
        if (!employee)
            return next(new errorHandler_js_1.AppError('Employee not found in your organization workspace', 404));
        const document = await prisma_js_1.prisma.employeeDocument.create({
            data: {
                organizationId: orgId,
                employeeId,
                title,
                category,
                fileUrl,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                isVerified: true,
            },
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'EMPLOYEE_DOCUMENT_UPLOADED',
            entityType: 'DOCUMENT',
            entityId: document.id,
            details: { title, category, employeeId },
        });
        return res.status(201).json({ success: true, data: document });
    }
    catch (err) {
        next(err);
    }
};
exports.addEmployeeDocument = addEmployeeDocument;
