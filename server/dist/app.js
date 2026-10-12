"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const organization_routes_js_1 = __importDefault(require("./modules/organization/organization.routes.js"));
const employee_routes_js_1 = __importDefault(require("./modules/employee/employee.routes.js"));
const attendance_routes_js_1 = __importDefault(require("./modules/attendance/attendance.routes.js"));
const leave_routes_js_1 = __importDefault(require("./modules/leave/leave.routes.js"));
const payroll_routes_js_1 = __importDefault(require("./modules/payroll/payroll.routes.js"));
const recruitment_routes_js_1 = __importDefault(require("./modules/recruitment/recruitment.routes.js"));
const performance_routes_js_1 = __importDefault(require("./modules/performance/performance.routes.js"));
const assets_routes_js_1 = __importDefault(require("./modules/assets/assets.routes.js"));
const helpdesk_routes_js_1 = __importDefault(require("./modules/helpdesk/helpdesk.routes.js"));
const reports_routes_js_1 = __importDefault(require("./modules/reports/reports.routes.js"));
const audit_routes_js_1 = __importDefault(require("./modules/audit/audit.routes.js"));
const workflow_routes_js_1 = __importDefault(require("./modules/workflow/workflow.routes.js"));
const system_routes_js_1 = __importDefault(require("./modules/system/system.routes.js"));
const superadmin_routes_js_1 = __importDefault(require("./modules/superadmin/superadmin.routes.js"));
exports.app = (0, express_1.default)();
// Middlewares
exports.app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Health Check
exports.app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'SmartHCM Enterprise API',
        uptime: process.uptime(),
    });
});
// API Routes
exports.app.use('/api/v1/auth', auth_routes_js_1.default);
exports.app.use('/api/v1/organizations', organization_routes_js_1.default);
exports.app.use('/api/v1/organization', organization_routes_js_1.default);
exports.app.use('/api/v1/employees', employee_routes_js_1.default);
exports.app.use('/api/v1/attendance', attendance_routes_js_1.default);
exports.app.use('/api/v1/leaves', leave_routes_js_1.default);
exports.app.use('/api/v1/payroll', payroll_routes_js_1.default);
exports.app.use('/api/v1/recruitment', recruitment_routes_js_1.default);
exports.app.use('/api/v1/performance', performance_routes_js_1.default);
exports.app.use('/api/v1/assets', assets_routes_js_1.default);
exports.app.use('/api/v1/helpdesk', helpdesk_routes_js_1.default);
exports.app.use('/api/v1/reports', reports_routes_js_1.default);
exports.app.use('/api/v1/audit', audit_routes_js_1.default);
exports.app.use('/api/v1/workflows', workflow_routes_js_1.default);
exports.app.use('/api/v1/system', system_routes_js_1.default);
exports.app.use('/api/v1/superadmin', superadmin_routes_js_1.default);
// Centralized Error Handling
exports.app.use(errorHandler_js_1.errorHandler);
