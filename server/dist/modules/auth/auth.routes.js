"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const validate_js_1 = require("../../middleware/validate.js");
const router = (0, express_1.Router)();
// Public Authentication & Onboarding Routes
router.post('/login', (0, validate_js_1.validate)(auth_controller_js_1.loginSchema), auth_controller_js_1.login);
router.post('/register', (0, validate_js_1.validate)(auth_controller_js_1.registerUserSchema), auth_controller_js_1.registerUser);
router.post('/signup', (0, validate_js_1.validate)(auth_controller_js_1.registerUserSchema), auth_controller_js_1.registerUser);
router.post('/register-company', (0, validate_js_1.validate)(auth_controller_js_1.registerCompanySchema), auth_controller_js_1.registerCompany);
router.get('/check-slug/:slug', auth_controller_js_1.checkSlug);
router.get('/workspace/:slug', auth_controller_js_1.getWorkspaceBySlug);
router.post('/forgot-password', (0, validate_js_1.validate)(auth_controller_js_1.forgotPasswordSchema), auth_controller_js_1.forgotPassword);
router.post('/reset-password', (0, validate_js_1.validate)(auth_controller_js_1.resetPasswordSchema), auth_controller_js_1.resetPassword);
router.post('/verify-email', (0, validate_js_1.validate)(auth_controller_js_1.verifyEmailSchema), auth_controller_js_1.verifyEmail);
router.post('/resend-verification', (0, validate_js_1.validate)(auth_controller_js_1.resendVerificationSchema), auth_controller_js_1.resendVerificationEmail);
// Authenticated Session & Tenant Switcher Routes
router.get('/me', auth_js_1.authenticate, auth_controller_js_1.getMe);
router.post('/switch-org', auth_js_1.authenticate, auth_controller_js_1.switchOrganization);
router.get('/notifications', auth_js_1.authenticate, auth_controller_js_1.getNotifications);
router.patch('/notifications/:id/read', auth_js_1.authenticate, auth_controller_js_1.markNotificationRead);
router.post('/logout', auth_js_1.authenticate, (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});
exports.default = router;
