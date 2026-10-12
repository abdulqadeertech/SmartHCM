"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGoalProgress = exports.createGoal = exports.getGoals = exports.getReviewCycles = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const getReviewCycles = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const cycles = await prisma_js_1.prisma.performanceReviewCycle.findMany({
            where: { organizationId: orgId },
            include: {
                _count: { select: { reviews: true } },
            },
            orderBy: { startDate: 'desc' },
        });
        return res.json({ success: true, data: cycles });
    }
    catch (err) {
        next(err);
    }
};
exports.getReviewCycles = getReviewCycles;
const getGoals = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { employeeId } = req.query;
        const isHrOrManager = req.user?.isSuperAdmin ||
            ['ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER', 'DEPT_MANAGER'].includes(req.user?.role || '');
        const where = { organizationId: orgId };
        if (!isHrOrManager && req.user?.employeeId) {
            where.employeeId = req.user.employeeId;
        }
        else if (employeeId) {
            where.employeeId = employeeId;
        }
        const goals = await prisma_js_1.prisma.employeeGoal.findMany({
            where,
            include: {
                employee: { select: { firstName: true, lastName: true, employeeCode: true } },
            },
            orderBy: { targetDate: 'asc' },
        });
        return res.json({ success: true, data: goals });
    }
    catch (err) {
        next(err);
    }
};
exports.getGoals = getGoals;
const createGoal = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const employeeId = req.body.employeeId || req.user?.employeeId;
        if (!employeeId)
            return next(new errorHandler_js_1.AppError('Target employee is required', 400));
        const { title, description, targetDate } = req.body;
        if (!title || !targetDate)
            return next(new errorHandler_js_1.AppError('Title and target date are required', 400));
        const goal = await prisma_js_1.prisma.employeeGoal.create({
            data: {
                organizationId: orgId,
                employeeId,
                title,
                description,
                targetDate: new Date(targetDate),
                progressPercentage: 0,
                status: 'IN_PROGRESS',
            },
        });
        return res.status(201).json({ success: true, data: goal });
    }
    catch (err) {
        next(err);
    }
};
exports.createGoal = createGoal;
const updateGoalProgress = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        const { progressPercentage, status } = req.body;
        const goalId = id;
        const goal = await prisma_js_1.prisma.employeeGoal.findFirst({
            where: { id: goalId, organizationId: orgId },
        });
        if (!goal)
            return next(new errorHandler_js_1.AppError('Goal not found', 404));
        const updated = await prisma_js_1.prisma.employeeGoal.update({
            where: { id: goalId },
            data: {
                progressPercentage: progressPercentage !== undefined ? parseInt(progressPercentage, 10) : goal.progressPercentage,
                status: status || (progressPercentage === 100 ? 'COMPLETED' : goal.status),
            },
        });
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateGoalProgress = updateGoalProgress;
