"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.updateTicket = exports.createTicket = exports.getTickets = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const getTickets = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { status, priority } = req.query;
        const isHrOrManager = req.user?.isSuperAdmin ||
            ['ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER'].includes(req.user?.role || '');
        const where = { organizationId: orgId };
        if (!isHrOrManager && req.user?.employeeId) {
            where.employeeId = req.user.employeeId;
        }
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        const tickets = await prisma_js_1.prisma.supportTicket.findMany({
            where,
            include: {
                employee: {
                    select: { firstName: true, lastName: true, employeeCode: true },
                },
                comments: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: tickets });
    }
    catch (err) {
        next(err);
    }
};
exports.getTickets = getTickets;
const createTicket = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const employeeId = req.user?.employeeId;
        if (!employeeId)
            return next(new errorHandler_js_1.AppError('No employee profile associated with this account', 400));
        const { subject, description, category = 'GENERAL', priority = 'MEDIUM' } = req.body;
        if (!subject || !description)
            return next(new errorHandler_js_1.AppError('Subject and description are required', 400));
        const ticket = await prisma_js_1.prisma.supportTicket.create({
            data: {
                organizationId: orgId,
                employeeId,
                subject,
                description,
                category,
                priority,
                status: 'OPEN',
            },
        });
        return res.status(201).json({ success: true, data: ticket });
    }
    catch (err) {
        next(err);
    }
};
exports.createTicket = createTicket;
const updateTicket = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        const { status, priority, resolutionNotes } = req.body;
        const ticketId = id;
        const ticket = await prisma_js_1.prisma.supportTicket.findFirst({
            where: { id: ticketId, organizationId: orgId },
        });
        if (!ticket)
            return next(new errorHandler_js_1.AppError('Ticket not found', 404));
        const updated = await prisma_js_1.prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                status: status || ticket.status,
                priority: priority || ticket.priority,
                resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : ticket.resolutionNotes,
            },
        });
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateTicket = updateTicket;
const addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        if (!message)
            return next(new errorHandler_js_1.AppError('Message is required', 400));
        const comment = await prisma_js_1.prisma.ticketComment.create({
            data: {
                ticketId: id,
                userId: req.user.id,
                message,
            },
            include: {
                user: { select: { firstName: true, lastName: true } },
            },
        });
        return res.status(201).json({ success: true, data: comment });
    }
    catch (err) {
        next(err);
    }
};
exports.addComment = addComment;
