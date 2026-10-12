"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditEvents = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const getAuditEvents = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { page = '1', limit = '50', action } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 50;
        const skip = (pageNum - 1) * limitNum;
        const where = { organizationId: orgId };
        if (action)
            where.action = action;
        const [total, events] = await Promise.all([
            prisma_js_1.prisma.auditEvent.count({ where }),
            prisma_js_1.prisma.auditEvent.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { timestamp: 'desc' },
            }),
        ]);
        return res.json({
            success: true,
            data: events,
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
exports.getAuditEvents = getAuditEvents;
