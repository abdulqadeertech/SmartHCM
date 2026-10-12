"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveWorkspace = exports.requireSuperAdmin = exports.requireRole = void 0;
const errorHandler_js_1 = require("./errorHandler.js");
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Unauthorized. Please log in.', 401));
        }
        if (req.user.isSuperAdmin || req.user.role === 'PLATFORM_SUPER_ADMIN') {
            return next();
        }
        if (req.user.role === 'ORG_ADMIN') {
            return next();
        }
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }
        return next(new errorHandler_js_1.AppError('Forbidden. Insufficient permissions for this operation.', 403));
    };
};
exports.requireRole = requireRole;
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new errorHandler_js_1.AppError('Unauthorized. Please log in.', 401));
    }
    if (!req.user.isSuperAdmin && req.user.role !== 'PLATFORM_SUPER_ADMIN') {
        return next(new errorHandler_js_1.AppError('Forbidden. Platform Super Administrator privileges required.', 403));
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
const requireActiveWorkspace = (req, res, next) => {
    if (!req.user) {
        return next(new errorHandler_js_1.AppError('Unauthorized. Please log in.', 401));
    }
    // Super Admin can inspect any workspace
    if (req.user.isSuperAdmin || req.user.role === 'PLATFORM_SUPER_ADMIN') {
        return next();
    }
    // The organization status check can be attached to req.user during authenticate
    const orgStatus = req.user.organizationStatus || 'ACTIVE';
    if (orgStatus === 'PENDING') {
        return next(new errorHandler_js_1.AppError('Workspace registration is pending administrative approval.', 403));
    }
    if (orgStatus === 'SUSPENDED') {
        return next(new errorHandler_js_1.AppError('This workspace is suspended. Please contact platform administration.', 403));
    }
    if (orgStatus === 'REJECTED') {
        return next(new errorHandler_js_1.AppError('This workspace application was not approved.', 403));
    }
    next();
};
exports.requireActiveWorkspace = requireActiveWorkspace;
