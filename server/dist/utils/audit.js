"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = void 0;
const prisma_js_1 = require("../prisma.js");
const logAuditEvent = async (params) => {
    try {
        await prisma_js_1.prisma.auditEvent.create({
            data: {
                organizationId: params.organizationId,
                actorId: params.actorId || null,
                actorEmail: params.actorEmail || null,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId || null,
                detailsJson: params.details ? JSON.stringify(params.details) : null,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
            },
        });
    }
    catch (err) {
        console.error('Failed to write audit event:', err);
    }
};
exports.logAuditEvent = logAuditEvent;
