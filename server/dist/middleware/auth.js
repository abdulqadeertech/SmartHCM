"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const prisma_js_1 = require("../prisma.js");
const errorHandler_js_1 = require("./errorHandler.js");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new errorHandler_js_1.AppError('Authentication required. Missing token.', 401));
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwtSecret);
        }
        catch (err) {
            return next(new errorHandler_js_1.AppError('Invalid or expired authentication token.', 401));
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                memberships: {
                    include: {
                        organization: true,
                    },
                },
                employee: true,
            },
        });
        if (!user || !user.isActive) {
            return next(new errorHandler_js_1.AppError('User account not found or deactivated.', 401));
        }
        // Determine organization context
        let targetOrgId = decoded.organizationId;
        let membership = user.memberships.find((m) => m.organizationId === targetOrgId);
        if (!membership && user.memberships.length > 0) {
            membership = user.memberships.find((m) => m.isDefault) || user.memberships[0];
            targetOrgId = membership.organizationId;
        }
        if (!membership && !user.isSuperAdmin) {
            return next(new errorHandler_js_1.AppError('User has no active organization membership.', 403));
        }
        const role = membership?.role || (user.isSuperAdmin ? 'PLATFORM_SUPER_ADMIN' : 'EMPLOYEE');
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isSuperAdmin: user.isSuperAdmin,
            organizationId: targetOrgId || user.memberships[0]?.organizationId || '',
            role,
            employeeId: user.employee?.id || null,
            organizationStatus: membership?.organization?.status || 'ACTIVE',
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
