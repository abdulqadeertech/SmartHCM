"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superadmin_controller_js_1 = require("./superadmin.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const router = (0, express_1.Router)();
// Strict platform super administrator security boundary
router.use(auth_js_1.authenticate);
router.use(rbac_js_1.requireSuperAdmin);
// Dashboard metrics & platform overview
router.get('/overview', superadmin_controller_js_1.getPlatformOverview);
// Company management
router.get('/companies', superadmin_controller_js_1.getCompanies);
router.get('/companies/:id', superadmin_controller_js_1.getCompanyDetails);
router.patch('/companies/:id/status', superadmin_controller_js_1.updateCompanyStatus);
router.patch('/companies/:id/subscription', superadmin_controller_js_1.updateCompanySubscription);
// Global platform audit trail
router.get('/audit-logs', superadmin_controller_js_1.getPlatformAuditLogs);
exports.default = router;
