"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportPayrollRunCsv = exports.saveCountryPolicy = exports.getCountryPolicies = exports.recordSalaryRevision = exports.getSalaryHistory = exports.getMyPayslips = exports.finalizePayrollRun = exports.updatePayrollRunStatus = exports.processPayrollRun = exports.simulatePayrollRun = exports.getPayrollPrecheck = exports.getPayrollRunById = exports.getPayrollRuns = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const audit_js_1 = require("../../utils/audit.js");
const getPayrollRuns = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const runs = await prisma_js_1.prisma.payrollRun.findMany({
            where: { organizationId: orgId },
            include: {
                _count: { select: { payslips: true } },
            },
            orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        });
        return res.json({ success: true, data: runs });
    }
    catch (err) {
        next(err);
    }
};
exports.getPayrollRuns = getPayrollRuns;
const getPayrollRunById = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        const runId = id;
        const run = await prisma_js_1.prisma.payrollRun.findFirst({
            where: { id: runId, organizationId: orgId },
            include: {
                payslips: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                employeeCode: true,
                                firstName: true,
                                lastName: true,
                                department: { select: { name: true } },
                                designation: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!run)
            return next(new errorHandler_js_1.AppError('Payroll run not found', 404));
        return res.json({ success: true, data: run });
    }
    catch (err) {
        next(err);
    }
};
exports.getPayrollRunById = getPayrollRunById;
/**
 * Smart Payroll Pre-Check (Differentiating Feature D)
 * Detects missing salary profiles, unapproved overtime, pending attendance corrections,
 * pending leaves, and duplicate finalized periods before running payroll.
 */
const getPayrollPrecheck = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const month = parseInt(req.query.month || String(new Date().getMonth() + 1), 10);
        const year = parseInt(req.query.year || String(new Date().getFullYear()), 10);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const [activeEmployees, existingRun, pendingOvertime, approvedOvertime, pendingCorrections, pendingLeaves,] = await Promise.all([
            prisma_js_1.prisma.employee.findMany({
                where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
                include: { salaryRecord: true, department: { select: { name: true } } },
            }),
            prisma_js_1.prisma.payrollRun.findUnique({
                where: {
                    organizationId_periodMonth_periodYear: {
                        organizationId: orgId,
                        periodMonth: month,
                        periodYear: year,
                    },
                },
            }),
            prisma_js_1.prisma.overtimeRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: 'PENDING',
                    date: { gte: startDate, lte: endDate },
                },
                include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
            }),
            prisma_js_1.prisma.overtimeRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: 'APPROVED',
                    date: { gte: startDate, lte: endDate },
                },
            }),
            prisma_js_1.prisma.attendanceCorrectionRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: 'PENDING',
                    date: { gte: startDate, lte: endDate },
                },
                include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
            }),
            prisma_js_1.prisma.leaveRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: 'PENDING',
                    startDate: { lte: endDate },
                    endDate: { gte: startDate },
                },
                include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
            }),
        ]);
        const errors = [];
        const warnings = [];
        // 1. Missing Salary Records or Zero Base Salary
        const missingSalaryEmployees = activeEmployees.filter((e) => !e.salaryRecord || !e.salaryRecord.baseSalary || e.salaryRecord.baseSalary <= 0);
        if (missingSalaryEmployees.length > 0) {
            missingSalaryEmployees.forEach((emp) => {
                errors.push({
                    type: 'MISSING_SALARY_RECORD',
                    message: `${emp.firstName} ${emp.lastName} (${emp.employeeCode}) has no configured base salary record.`,
                    employeeId: emp.id,
                });
            });
        }
        // 2. Duplicate Finalized Payroll
        if (existingRun && ['APPROVED', 'FINALIZED', 'PAID'].includes(existingRun.status)) {
            errors.push({
                type: 'DUPLICATE_FINALIZED_RUN',
                message: `Payroll run for period ${month}/${year} is already ${existingRun.status} and cannot be re-processed.`,
                details: { runId: existingRun.id, status: existingRun.status },
            });
        }
        // 3. Pending Overtime Warnings
        if (pendingOvertime.length > 0) {
            warnings.push({
                type: 'PENDING_OVERTIME_REQUESTS',
                message: `${pendingOvertime.length} overtime request(s) are pending review and will not be paid unless approved.`,
                count: pendingOvertime.length,
                details: pendingOvertime.map((o) => ({
                    employee: `${o.employee.firstName} ${o.employee.lastName}`,
                    hours: o.hours,
                    date: o.date,
                })),
            });
        }
        // 4. Pending Attendance Correction Warnings
        if (pendingCorrections.length > 0) {
            warnings.push({
                type: 'PENDING_ATTENDANCE_CORRECTIONS',
                message: `${pendingCorrections.length} attendance correction request(s) are pending review for this period.`,
                count: pendingCorrections.length,
            });
        }
        // 5. Pending Leaves Warnings
        if (pendingLeaves.length > 0) {
            warnings.push({
                type: 'PENDING_LEAVE_REQUESTS',
                message: `${pendingLeaves.length} leave application(s) are still pending a decision.`,
                count: pendingLeaves.length,
            });
        }
        const canProceed = errors.length === 0;
        return res.json({
            success: true,
            data: {
                canProceed,
                month,
                year,
                employeeCount: activeEmployees.length,
                existingRunStatus: existingRun ? existingRun.status : null,
                errors,
                warnings,
                approvedOvertimeHours: approvedOvertime.reduce((sum, o) => sum + o.hours, 0),
                approvedOvertimeCount: approvedOvertime.length,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPayrollPrecheck = getPayrollPrecheck;
/**
 * Advanced Payroll Simulation
 * Calculates projected numbers with connected approved overtime without persisting to DB
 */
const simulatePayrollRun = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { month, year, countryCode } = req.body;
        const monthNum = parseInt(month || new Date().getMonth() + 1, 10);
        const yearNum = parseInt(year || new Date().getFullYear(), 10);
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
        // Fetch active employees, salary records, and approved overtime
        const [employees, approvedOvertimes] = await Promise.all([
            prisma_js_1.prisma.employee.findMany({
                where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
                include: {
                    salaryRecord: true,
                    department: { select: { name: true } },
                },
            }),
            prisma_js_1.prisma.overtimeRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: 'APPROVED',
                    date: { gte: startDate, lte: endDate },
                },
            }),
        ]);
        const otHoursByEmp = {};
        for (const ot of approvedOvertimes) {
            otHoursByEmp[ot.employeeId] = (otHoursByEmp[ot.employeeId] || 0) + ot.hours;
        }
        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        let totalTax = 0;
        let totalPf = 0;
        let totalOvertimePay = 0;
        const projections = employees.map((emp) => {
            const baseSalary = emp.salaryRecord?.baseSalary || 5000;
            const approvedOtHours = otHoursByEmp[emp.id] || 0;
            // Standard hourly rate based on 240 hours/month (30 days * 8h) with 1.5x overtime multiplier
            const hourlyRate = baseSalary > 0 ? baseSalary / 240 : 0;
            const overtimePay = Number((approvedOtHours * hourlyRate * 1.5).toFixed(2));
            const basicPay = Number((baseSalary * 0.5).toFixed(2));
            const allowances = Number((baseSalary * 0.5).toFixed(2));
            const grossPay = Number((basicPay + allowances + overtimePay).toFixed(2));
            const pfDeduction = Number((basicPay * 0.12).toFixed(2));
            const taxDeducted = Number((grossPay * 0.05).toFixed(2));
            const deductions = Number((pfDeduction + taxDeducted).toFixed(2));
            const netPay = Number((grossPay - deductions).toFixed(2));
            totalGross += grossPay;
            totalDeductions += deductions;
            totalNet += netPay;
            totalTax += taxDeducted;
            totalPf += pfDeduction;
            totalOvertimePay += overtimePay;
            return {
                employeeId: emp.id,
                employeeCode: emp.employeeCode,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                department: emp.department?.name || 'General',
                baseSalary,
                basicPay,
                allowances,
                overtimePay,
                approvedOtHours,
                grossPay,
                pfDeduction,
                taxDeducted,
                deductions,
                netPay,
            };
        });
        return res.json({
            success: true,
            data: {
                month: monthNum,
                year: yearNum,
                countryCode: countryCode || 'US',
                employeeCount: employees.length,
                summary: {
                    totalGross: Number(totalGross.toFixed(2)),
                    totalDeductions: Number(totalDeductions.toFixed(2)),
                    totalPf: Number(totalPf.toFixed(2)),
                    totalTax: Number(totalTax.toFixed(2)),
                    totalOvertimePay: Number(totalOvertimePay.toFixed(2)),
                    totalNet: Number(totalNet.toFixed(2)),
                },
                projections,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.simulatePayrollRun = simulatePayrollRun;
const processPayrollRun = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { month, year } = req.body;
        if (!month || !year) {
            return next(new errorHandler_js_1.AppError('Month and year are required', 400));
        }
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        const existing = await prisma_js_1.prisma.payrollRun.findUnique({
            where: {
                organizationId_periodMonth_periodYear: {
                    organizationId: orgId,
                    periodMonth: monthNum,
                    periodYear: yearNum,
                },
            },
        });
        if (existing && (existing.status === 'APPROVED' || existing.status === 'FINALIZED' || existing.status === 'PAID')) {
            return next(new errorHandler_js_1.AppError(`Payroll for ${monthNum}/${yearNum} is already ${existing.status} and locked from re-processing.`, 400));
        }
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
        const [employees, approvedOvertimes] = await Promise.all([
            prisma_js_1.prisma.employee.findMany({
                where: {
                    organizationId: orgId,
                    employmentStatus: 'ACTIVE',
                },
                include: {
                    salaryRecord: true,
                },
            }),
            prisma_js_1.prisma.overtimeRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: 'APPROVED',
                    date: { gte: startDate, lte: endDate },
                },
            }),
        ]);
        const otHoursByEmp = {};
        for (const ot of approvedOvertimes) {
            otHoursByEmp[ot.employeeId] = (otHoursByEmp[ot.employeeId] || 0) + ot.hours;
        }
        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        const computedItems = [];
        for (const emp of employees) {
            const baseSalary = emp.salaryRecord?.baseSalary || 5000;
            const approvedOtHours = otHoursByEmp[emp.id] || 0;
            const hourlyRate = baseSalary > 0 ? baseSalary / 240 : 0;
            const overtimePay = Number((approvedOtHours * hourlyRate * 1.5).toFixed(2));
            const basicPay = Number((baseSalary * 0.5).toFixed(2));
            const allowances = Number((baseSalary * 0.5).toFixed(2));
            const grossPay = Number((basicPay + allowances + overtimePay).toFixed(2));
            const pfDeduction = Number((basicPay * 0.12).toFixed(2));
            const taxDeducted = Number((grossPay * 0.05).toFixed(2));
            const deductions = Number((pfDeduction + taxDeducted).toFixed(2));
            const netPay = Number((grossPay - deductions).toFixed(2));
            totalGross += grossPay;
            totalDeductions += deductions;
            totalNet += netPay;
            computedItems.push({
                employeeId: emp.id,
                basicPay,
                allowances,
                overtimePay,
                grossPay,
                deductions,
                taxDeducted,
                netPay,
            });
        }
        totalGross = Number(totalGross.toFixed(2));
        totalDeductions = Number(totalDeductions.toFixed(2));
        totalNet = Number(totalNet.toFixed(2));
        const resultRun = await prisma_js_1.prisma.$transaction(async (tx) => {
            const run = await tx.payrollRun.upsert({
                where: {
                    organizationId_periodMonth_periodYear: {
                        organizationId: orgId,
                        periodMonth: monthNum,
                        periodYear: yearNum,
                    },
                },
                create: {
                    organizationId: orgId,
                    periodMonth: monthNum,
                    periodYear: yearNum,
                    startDate,
                    endDate,
                    totalGross,
                    totalDeductions,
                    totalNet,
                    status: 'DRAFT',
                },
                update: {
                    totalGross,
                    totalDeductions,
                    totalNet,
                    status: 'DRAFT',
                },
            });
            await tx.payslip.deleteMany({ where: { payrollRunId: run.id } });
            for (const item of computedItems) {
                await tx.payslip.create({
                    data: {
                        organizationId: orgId,
                        payrollRunId: run.id,
                        employeeId: item.employeeId,
                        periodMonth: monthNum,
                        periodYear: yearNum,
                        basicPay: item.basicPay,
                        allowances: item.allowances,
                        overtimePay: item.overtimePay,
                        grossPay: item.grossPay,
                        deductions: item.deductions,
                        taxDeducted: item.taxDeducted,
                        netPay: item.netPay,
                        paymentStatus: 'UNPAID',
                    },
                });
            }
            return run;
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'PAYROLL_CALCULATED',
            entityType: 'PAYROLL_RUN',
            entityId: resultRun.id,
            details: { monthNum, yearNum, totalGross, totalNet, employeeCount: computedItems.length },
        });
        return res.status(201).json({
            success: true,
            message: `Payroll run computed and set to DRAFT for ${monthNum}/${yearNum}`,
            data: resultRun,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.processPayrollRun = processPayrollRun;
/**
 * State Transition: DRAFT -> REVIEWED -> APPROVED -> PAID
 */
const updatePayrollRunStatus = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const id = req.params.id;
        const { status } = req.body; // 'REVIEWED' | 'APPROVED' | 'PAID' | 'FINALIZED'
        const validStatuses = ['DRAFT', 'REVIEWED', 'APPROVED', 'FINALIZED', 'PAID'];
        if (!validStatuses.includes(status)) {
            return next(new errorHandler_js_1.AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
        }
        const run = await prisma_js_1.prisma.payrollRun.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!run)
            return next(new errorHandler_js_1.AppError('Payroll run not found', 404));
        const updated = await prisma_js_1.prisma.$transaction(async (tx) => {
            const updatedRun = await tx.payrollRun.update({
                where: { id },
                data: {
                    status,
                    approvedAt: status === 'APPROVED' || status === 'FINALIZED' || status === 'PAID' ? new Date() : undefined,
                },
            });
            if (status === 'PAID' || status === 'FINALIZED') {
                await tx.payslip.updateMany({
                    where: { payrollRunId: id },
                    data: {
                        paymentStatus: 'PAID',
                        paymentDate: new Date(),
                    },
                });
            }
            return updatedRun;
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: `PAYROLL_STATUS_${status}`,
            entityType: 'PAYROLL_RUN',
            entityId: id,
        });
        return res.json({
            success: true,
            message: `Payroll status updated to ${status}`,
            data: updated,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePayrollRunStatus = updatePayrollRunStatus;
const finalizePayrollRun = async (req, res, next) => {
    return (0, exports.updatePayrollRunStatus)(req, res, next);
};
exports.finalizePayrollRun = finalizePayrollRun;
const getMyPayslips = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const employeeId = req.user?.employeeId;
        if (!employeeId)
            return res.json({ success: true, data: [] });
        const payslips = await prisma_js_1.prisma.payslip.findMany({
            where: {
                organizationId: orgId,
                employeeId,
            },
            include: {
                payrollRun: true,
            },
            orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        });
        return res.json({ success: true, data: payslips });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyPayslips = getMyPayslips;
/**
 * Salary Revision History
 */
const getSalaryHistory = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const employeeId = req.params.employeeId;
        const revisions = await prisma_js_1.prisma.salaryRevision.findMany({
            where: { organizationId: orgId, employeeId },
            orderBy: { effectiveDate: 'desc' },
        });
        return res.json({ success: true, data: revisions });
    }
    catch (err) {
        next(err);
    }
};
exports.getSalaryHistory = getSalaryHistory;
const recordSalaryRevision = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { employeeId, effectiveDate, newBase, changeReason } = req.body;
        if (!employeeId || !newBase || !changeReason) {
            return next(new errorHandler_js_1.AppError('employeeId, newBase, and changeReason are required', 400));
        }
        const currentSalary = await prisma_js_1.prisma.employeeSalary.findUnique({
            where: { employeeId },
        });
        const previousBase = currentSalary?.baseSalary || 0;
        const revision = await prisma_js_1.prisma.$transaction(async (tx) => {
            const rev = await tx.salaryRevision.create({
                data: {
                    organizationId: orgId,
                    employeeId,
                    effectiveDate: new Date(effectiveDate || Date.now()),
                    previousBase,
                    newBase: Number(newBase),
                    changeReason,
                    changedBy: req.user?.email || 'HR Admin',
                },
            });
            await tx.employeeSalary.upsert({
                where: { employeeId },
                create: {
                    organizationId: orgId,
                    employeeId,
                    baseSalary: Number(newBase),
                    currency: 'USD',
                },
                update: {
                    baseSalary: Number(newBase),
                },
            });
            return rev;
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'SALARY_REVISION_RECORDED',
            entityType: 'SALARY_REVISION',
            entityId: revision.id,
            details: { employeeId, previousBase, newBase, changeReason },
        });
        return res.status(201).json({ success: true, data: revision });
    }
    catch (err) {
        next(err);
    }
};
exports.recordSalaryRevision = recordSalaryRevision;
/**
 * Country-Specific Payroll Policies
 */
const getCountryPolicies = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const policies = await prisma_js_1.prisma.countryPayrollPolicy.findMany({
            where: { organizationId: orgId },
            orderBy: { countryName: 'asc' },
        });
        return res.json({ success: true, data: policies });
    }
    catch (err) {
        next(err);
    }
};
exports.getCountryPolicies = getCountryPolicies;
const saveCountryPolicy = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { countryCode, countryName, currency, statutoryRulesJson, isReviewed } = req.body;
        const policy = await prisma_js_1.prisma.countryPayrollPolicy.upsert({
            where: {
                organizationId_countryCode: {
                    organizationId: orgId,
                    countryCode,
                },
            },
            create: {
                organizationId: orgId,
                countryCode,
                countryName,
                currency,
                statutoryRulesJson: typeof statutoryRulesJson === 'object' ? JSON.stringify(statutoryRulesJson) : statutoryRulesJson,
                isReviewed: isReviewed ?? true,
                reviewedBy: req.user?.email || 'Payroll Lead',
                reviewedAt: new Date(),
            },
            update: {
                countryName,
                currency,
                statutoryRulesJson: typeof statutoryRulesJson === 'object' ? JSON.stringify(statutoryRulesJson) : statutoryRulesJson,
                isReviewed: isReviewed ?? true,
                reviewedBy: req.user?.email || 'Payroll Lead',
                reviewedAt: new Date(),
            },
        });
        return res.json({ success: true, data: policy });
    }
    catch (err) {
        next(err);
    }
};
exports.saveCountryPolicy = saveCountryPolicy;
/**
 * Secure CSV Export of Payroll Run
 */
const exportPayrollRunCsv = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const id = req.params.id;
        const run = (await prisma_js_1.prisma.payrollRun.findFirst({
            where: { id, organizationId: orgId },
            include: {
                payslips: {
                    include: {
                        employee: {
                            select: {
                                employeeCode: true,
                                firstName: true,
                                lastName: true,
                                department: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        }));
        if (!run)
            return next(new errorHandler_js_1.AppError('Payroll run not found', 404));
        const headers = 'Employee Code,Name,Department,Basic Pay,Allowances,Gross Pay,Deductions,Tax Withheld,Net Pay,Status\n';
        const rows = (run.payslips || [])
            .map((p) => {
            const name = `"${p.employee?.firstName || ''} ${p.employee?.lastName || ''}"`;
            const dept = `"${p.employee?.department?.name || 'General'}"`;
            return `${p.employee?.employeeCode || ''},${name},${dept},${p.basicPay},${p.allowances},${p.grossPay},${p.deductions},${p.taxDeducted},${p.netPay},${p.paymentStatus}`;
        })
            .join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payroll-${run.periodYear}-${run.periodMonth}.csv`);
        return res.status(200).send(headers + rows);
    }
    catch (err) {
        next(err);
    }
};
exports.exportPayrollRunCsv = exportPayrollRunCsv;
