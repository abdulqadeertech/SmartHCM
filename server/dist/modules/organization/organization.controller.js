"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShift = exports.updateShift = exports.createShift = exports.getShifts = exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getBranches = exports.deleteDesignation = exports.updateDesignation = exports.deleteDepartment = exports.updateDepartment = exports.createDesignation = exports.getDesignations = exports.createDepartment = exports.getDepartments = exports.updateCurrentOrg = exports.getCurrentOrg = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const audit_js_1 = require("../../utils/audit.js");
const getCurrentOrg = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const organization = await prisma_js_1.prisma.organization.findUnique({
            where: { id: orgId },
            include: {
                branches: {
                    include: { _count: { select: { employees: true } } },
                },
                departments: {
                    include: { _count: { select: { employees: true } } },
                },
                designations: {
                    include: { _count: { select: { employees: true } } },
                },
                shifts: {
                    include: { _count: { select: { employees: true } } },
                },
                countryPolicies: true,
            },
        });
        if (!organization)
            return next(new errorHandler_js_1.AppError('Organization not found', 404));
        return res.json({ success: true, data: organization });
    }
    catch (err) {
        next(err);
    }
};
exports.getCurrentOrg = getCurrentOrg;
const updateCurrentOrg = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { name, timezone, currency, address, phone, email, primaryColor, brandLogoUrl, dateFormat, fiscalYearStartMonth, policiesJson, } = req.body;
        const updated = await prisma_js_1.prisma.organization.update({
            where: { id: orgId },
            data: {
                name,
                timezone,
                currency,
                address,
                phone,
                email,
                primaryColor,
                brandLogoUrl,
                dateFormat,
                fiscalYearStartMonth,
                policiesJson: typeof policiesJson === 'object' ? JSON.stringify(policiesJson) : policiesJson,
            },
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'UPDATE_ORGANIZATION_SETTINGS',
            entityType: 'ORGANIZATION',
            entityId: orgId,
            details: { name, timezone, currency, primaryColor },
        });
        return res.json({ success: true, data: updated, message: 'Organization updated successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.updateCurrentOrg = updateCurrentOrg;
const getDepartments = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const departments = await prisma_js_1.prisma.department.findMany({
            where: { organizationId: orgId },
            include: { _count: { select: { employees: true } } },
            orderBy: { name: 'asc' },
        });
        return res.json({ success: true, data: departments });
    }
    catch (err) {
        next(err);
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { name, code, description } = req.body;
        if (!name || !code)
            return next(new errorHandler_js_1.AppError('Name and code are required', 400));
        const existing = await prisma_js_1.prisma.department.findUnique({
            where: { organizationId_code: { organizationId: orgId, code } },
        });
        if (existing)
            return next(new errorHandler_js_1.AppError('Department code already exists', 400));
        const department = await prisma_js_1.prisma.department.create({
            data: { organizationId: orgId, name, code, description },
        });
        return res.status(201).json({ success: true, data: department });
    }
    catch (err) {
        next(err);
    }
};
exports.createDepartment = createDepartment;
const getDesignations = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const designations = await prisma_js_1.prisma.designation.findMany({
            where: { organizationId: orgId },
            include: { _count: { select: { employees: true } } },
            orderBy: { name: 'asc' },
        });
        return res.json({ success: true, data: designations });
    }
    catch (err) {
        next(err);
    }
};
exports.getDesignations = getDesignations;
const createDesignation = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { name, title, code, grade, description } = req.body;
        const finalName = name || title;
        if (!finalName)
            return next(new errorHandler_js_1.AppError('Designation name is required', 400));
        const finalCode = code || finalName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        const designation = await prisma_js_1.prisma.designation.create({
            data: {
                organizationId: orgId,
                name: finalName,
                code: finalCode,
                grade: grade || 'L1',
                description: description || null,
            },
        });
        return res.status(201).json({ success: true, data: designation });
    }
    catch (err) {
        next(err);
    }
};
exports.createDesignation = createDesignation;
const updateDepartment = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, code, description } = req.body;
        const department = await prisma_js_1.prisma.department.update({
            where: { id },
            data: { name, code, description },
        });
        return res.json({ success: true, data: department });
    }
    catch (err) {
        next(err);
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res, next) => {
    try {
        const id = req.params.id;
        const count = await prisma_js_1.prisma.employee.count({ where: { departmentId: id } });
        if (count > 0) {
            return next(new errorHandler_js_1.AppError(`Cannot delete department with ${count} assigned employees. Please reassign them first.`, 400));
        }
        await prisma_js_1.prisma.department.delete({ where: { id } });
        return res.json({ success: true, message: 'Department deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteDepartment = deleteDepartment;
const updateDesignation = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, title, code, grade, description } = req.body;
        const designation = await prisma_js_1.prisma.designation.update({
            where: { id },
            data: { name: name || title, code, grade, description },
        });
        return res.json({ success: true, data: designation });
    }
    catch (err) {
        next(err);
    }
};
exports.updateDesignation = updateDesignation;
const deleteDesignation = async (req, res, next) => {
    try {
        const id = req.params.id;
        const count = await prisma_js_1.prisma.employee.count({ where: { designationId: id } });
        if (count > 0) {
            return next(new errorHandler_js_1.AppError(`Cannot delete designation with ${count} assigned employees. Please reassign them first.`, 400));
        }
        await prisma_js_1.prisma.designation.delete({ where: { id } });
        return res.json({ success: true, message: 'Designation deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteDesignation = deleteDesignation;
const getBranches = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const branches = await prisma_js_1.prisma.branch.findMany({
            where: { organizationId: orgId },
            include: { _count: { select: { employees: true } } },
            orderBy: { name: 'asc' },
        });
        return res.json({ success: true, data: branches });
    }
    catch (err) {
        next(err);
    }
};
exports.getBranches = getBranches;
const createBranch = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { name, code, address, city, country, isHeadOffice } = req.body;
        if (!name || !code)
            return next(new errorHandler_js_1.AppError('Branch name and code are required', 400));
        const branch = await prisma_js_1.prisma.branch.create({
            data: {
                organizationId: orgId,
                name,
                code,
                address,
                city,
                country,
                isHeadOffice: !!isHeadOffice,
            },
        });
        return res.status(201).json({ success: true, data: branch });
    }
    catch (err) {
        next(err);
    }
};
exports.createBranch = createBranch;
const updateBranch = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, address, city, country, isHeadOffice } = req.body;
        const branch = await prisma_js_1.prisma.branch.update({
            where: { id },
            data: { name, address, city, country, isHeadOffice },
        });
        return res.json({ success: true, data: branch });
    }
    catch (err) {
        next(err);
    }
};
exports.updateBranch = updateBranch;
const deleteBranch = async (req, res, next) => {
    try {
        const id = req.params.id;
        await prisma_js_1.prisma.branch.delete({ where: { id } });
        return res.json({ success: true, message: 'Branch deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteBranch = deleteBranch;
const getShifts = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const shifts = await prisma_js_1.prisma.shift.findMany({
            where: { organizationId: orgId },
            include: { _count: { select: { employees: true } } },
            orderBy: { name: 'asc' },
        });
        return res.json({ success: true, data: shifts });
    }
    catch (err) {
        next(err);
    }
};
exports.getShifts = getShifts;
const createShift = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { name, code, startTime, endTime, gracePeriodMinutes, halfDayThresholdHours, isOvernight } = req.body;
        if (!name || !code)
            return next(new errorHandler_js_1.AppError('Shift name and code are required', 400));
        const shift = await prisma_js_1.prisma.shift.create({
            data: {
                organizationId: orgId,
                name,
                code,
                startTime: startTime || '09:00',
                endTime: endTime || '18:00',
                gracePeriodMinutes: gracePeriodMinutes !== undefined ? Number(gracePeriodMinutes) : 15,
                halfDayThresholdHours: halfDayThresholdHours !== undefined ? Number(halfDayThresholdHours) : 4.5,
                isOvernight: !!isOvernight,
            },
        });
        return res.status(201).json({ success: true, data: shift });
    }
    catch (err) {
        next(err);
    }
};
exports.createShift = createShift;
const updateShift = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, code, startTime, endTime, gracePeriodMinutes, halfDayThresholdHours, isOvernight } = req.body;
        const shift = await prisma_js_1.prisma.shift.update({
            where: { id },
            data: {
                name,
                code,
                startTime,
                endTime,
                gracePeriodMinutes: gracePeriodMinutes !== undefined ? Number(gracePeriodMinutes) : undefined,
                halfDayThresholdHours: halfDayThresholdHours !== undefined ? Number(halfDayThresholdHours) : undefined,
                isOvernight: isOvernight !== undefined ? !!isOvernight : undefined,
            },
        });
        return res.json({ success: true, data: shift });
    }
    catch (err) {
        next(err);
    }
};
exports.updateShift = updateShift;
const deleteShift = async (req, res, next) => {
    try {
        const id = req.params.id;
        const count = await prisma_js_1.prisma.employee.count({ where: { shiftId: id } });
        if (count > 0) {
            return next(new errorHandler_js_1.AppError(`Cannot delete shift with ${count} assigned employees. Please reassign them first.`, 400));
        }
        await prisma_js_1.prisma.shift.delete({ where: { id } });
        return res.json({ success: true, message: 'Shift deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteShift = deleteShift;
