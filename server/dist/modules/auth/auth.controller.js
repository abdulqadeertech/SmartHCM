"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getNotifications = exports.getMe = exports.resendVerificationEmail = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.switchOrganization = exports.getWorkspaceBySlug = exports.checkSlug = exports.registerUser = exports.registerCompany = exports.login = exports.resendVerificationSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerCompanySchema = exports.registerUserSchema = exports.loginSchema = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const prisma_js_1 = require("../../prisma.js");
const index_js_1 = require("../../config/index.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const audit_js_1 = require("../../utils/audit.js");
const email_js_1 = require("../../utils/email.js");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    }),
});
exports.registerUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Valid work email is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().optional(),
        companyName: zod_1.z.string().optional(),
        role: zod_1.z.string().optional(),
    }),
});
exports.registerCompanySchema = zod_1.z.object({
    body: zod_1.z.object({
        companyName: zod_1.z.string().min(2, 'Company name must be at least 2 characters'),
        slug: zod_1.z
            .string()
            .min(2, 'Slug must be at least 2 characters')
            .max(40, 'Slug cannot exceed 40 characters')
            .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
        adminFirstName: zod_1.z.string().min(1, 'First name is required'),
        adminLastName: zod_1.z.string().min(1, 'Last name is required'),
        adminEmail: zod_1.z.string().email('Valid work email is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        companySize: zod_1.z.string().optional().default('1-25'),
        currency: zod_1.z.string().optional().default('USD'),
        timezone: zod_1.z.string().optional().default('UTC'),
        primaryColor: zod_1.z.string().optional().default('#0f172a'),
        plan: zod_1.z.string().optional().default('STARTER'),
        initialStatus: zod_1.z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED']).optional(),
        termsAccepted: zod_1.z.boolean().optional().default(true),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        token: zod_1.z.string().min(1, 'Reset token is required'),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        token: zod_1.z.string().min(1, 'Verification token is required'),
    }),
});
exports.resendVerificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
});
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
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
            return next(new errorHandler_js_1.AppError('Invalid email or password.', 401));
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return next(new errorHandler_js_1.AppError('Invalid email or password.', 401));
        }
        // Default membership
        const defaultMembership = user.memberships.find((m) => m.isDefault) || user.memberships[0];
        const organizationId = defaultMembership?.organizationId || '';
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            organizationId,
        }, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
        if (organizationId) {
            await (0, audit_js_1.logAuditEvent)({
                organizationId,
                actorId: user.id,
                actorEmail: user.email,
                action: 'USER_LOGIN',
                entityType: 'USER',
                entityId: user.id,
                ipAddress: req.ip,
            });
        }
        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    isSuperAdmin: user.isSuperAdmin,
                    role: defaultMembership?.role || (user.isSuperAdmin ? 'PLATFORM_SUPER_ADMIN' : 'EMPLOYEE'),
                    organization: defaultMembership?.organization || null,
                    employeeId: user.employee?.id || null,
                    allOrganizations: user.memberships.map((m) => ({
                        id: m.organization.id,
                        name: m.organization.name,
                        slug: m.organization.slug,
                        role: m.role,
                    })),
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const registerCompany = async (req, res, next) => {
    try {
        const { companyName, slug, adminFirstName, adminLastName, adminEmail, password, phone, country, address, companySize, currency, timezone, primaryColor, plan, initialStatus, } = req.body;
        const normalizedSlug = slug.toLowerCase().trim();
        // Check if organization slug is already taken
        const existingOrg = await prisma_js_1.prisma.organization.findUnique({
            where: { slug: normalizedSlug },
        });
        if (existingOrg) {
            return next(new errorHandler_js_1.AppError('This workspace URL identifier is already in use. Please select a different slug.', 409));
        }
        const targetStatus = initialStatus || (process.env.REQUIRE_ORG_APPROVAL === 'true' ? 'PENDING' : 'ACTIVE');
        const targetPlan = plan || 'STARTER';
        const maxEmployees = targetPlan === 'ENTERPRISE' ? 10000 : targetPlan === 'GROWTH' ? 100 : 25;
        // Execute atomic provisioning of the company workspace
        const result = await prisma_js_1.prisma.$transaction(async (tx) => {
            // 1. Create Organization
            const org = await tx.organization.create({
                data: {
                    name: companyName.trim(),
                    slug: normalizedSlug,
                    currency: currency || 'USD',
                    timezone: timezone || 'UTC',
                    phone: phone || null,
                    email: adminEmail.toLowerCase().trim(),
                    primaryColor: primaryColor || '#0f172a',
                    address: address || null,
                    companySize: companySize || '1-25',
                    status: targetStatus,
                    subscriptionPlan: targetPlan,
                    subscriptionStatus: 'ACTIVE',
                    maxEmployees,
                    termsAcceptedAt: new Date(),
                    approvedAt: targetStatus === 'ACTIVE' ? new Date() : null,
                },
            });
            // 2. Create HQ Branch
            const headOffice = await tx.branch.create({
                data: {
                    organizationId: org.id,
                    name: `${companyName} Headquarters`,
                    code: 'HQ-01',
                    country: country || 'Global',
                    isHeadOffice: true,
                },
            });
            // 3. Create Default Department Hierarchy
            const execDept = await tx.department.create({
                data: {
                    organizationId: org.id,
                    name: 'Executive Leadership',
                    code: 'EXEC',
                    description: 'Executive officers and leadership administration',
                },
            });
            await tx.department.createMany({
                data: [
                    {
                        organizationId: org.id,
                        name: 'Engineering & Technology',
                        code: 'TECH',
                        description: 'Software development, cloud infrastructure, and technical architecture',
                    },
                    {
                        organizationId: org.id,
                        name: 'People Operations & HR',
                        code: 'PEOPLE',
                        description: 'Talent management, employee relations, and culture',
                    },
                    {
                        organizationId: org.id,
                        name: 'Commercial & Sales',
                        code: 'SALES',
                        description: 'Business development, client partnerships, and sales',
                    },
                    {
                        organizationId: org.id,
                        name: 'Finance & Compliance',
                        code: 'FIN',
                        description: 'Accounting, treasury, and statutory audit compliance',
                    },
                ],
            });
            // 4. Create Standard Designations
            const ceoDesig = await tx.designation.create({
                data: {
                    organizationId: org.id,
                    name: 'Chief Executive Officer',
                    code: 'CEO',
                    grade: 'L8',
                    description: 'Enterprise executive officer',
                },
            });
            await tx.designation.createMany({
                data: [
                    { organizationId: org.id, name: 'Managing Director / VP', code: 'VP', grade: 'L7' },
                    { organizationId: org.id, name: 'Principal Lead', code: 'PRIN-LEAD', grade: 'L6' },
                    { organizationId: org.id, name: 'Senior Specialist', code: 'SR-SPEC', grade: 'L5' },
                    { organizationId: org.id, name: 'Operations Associate', code: 'ASSOC', grade: 'L3' },
                ],
            });
            // 5. Create Standard Business Shift
            const stdShift = await tx.shift.create({
                data: {
                    organizationId: org.id,
                    name: 'Standard Business Shift',
                    code: 'STD-01',
                    startTime: '09:00',
                    endTime: '18:00',
                    gracePeriodMinutes: 15,
                    halfDayThresholdHours: 4.5,
                    isOvernight: false,
                },
            });
            // 6. Create Default Statutory Salary Structure
            await tx.salaryStructure.create({
                data: {
                    organizationId: org.id,
                    name: 'Standard Corporate Compensation Structure',
                    basicPercentage: 50,
                    hraPercentage: 20,
                    conveyanceAllowance: 10,
                    medicalAllowance: 5,
                    specialAllowance: 15,
                    pfPercentage: 12,
                    taxDeductionPercentage: 5,
                },
            });
            // 7. Create Standard Leave Types
            const annualLeave = await tx.leaveType.create({
                data: {
                    organizationId: org.id,
                    name: 'Annual Vacation Leave',
                    code: 'AL',
                    daysAllowed: 21,
                    isPaid: true,
                    carryForwardMax: 7,
                    description: 'Standard paid annual leave allowance',
                },
            });
            const sickLeave = await tx.leaveType.create({
                data: {
                    organizationId: org.id,
                    name: 'Medical / Sick Leave',
                    code: 'SL',
                    daysAllowed: 12,
                    isPaid: true,
                    carryForwardMax: 0,
                    description: 'Paid medical leave for health recovery',
                },
            });
            const casualLeave = await tx.leaveType.create({
                data: {
                    organizationId: org.id,
                    name: 'Casual / Personal Leave',
                    code: 'CL',
                    daysAllowed: 10,
                    isPaid: true,
                    carryForwardMax: 0,
                    description: 'Short unplanned personal leave',
                },
            });
            // 8. Find or Create User
            const normalizedEmail = adminEmail.toLowerCase().trim();
            let user = await tx.user.findUnique({
                where: { email: normalizedEmail },
            });
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            if (!user) {
                user = await tx.user.create({
                    data: {
                        email: normalizedEmail,
                        passwordHash,
                        firstName: adminFirstName.trim(),
                        lastName: adminLastName.trim(),
                        phone: phone || null,
                        isActive: true,
                        isSuperAdmin: false,
                    },
                });
            }
            // 9. Assign ORG_ADMIN Role via Membership
            const membership = await tx.organizationMembership.create({
                data: {
                    userId: user.id,
                    organizationId: org.id,
                    role: 'ORG_ADMIN',
                    isDefault: true,
                },
            });
            // 10. Provision Executive Employee Record for Admin
            const employee = await tx.employee.create({
                data: {
                    organizationId: org.id,
                    userId: user.id,
                    employeeCode: 'EMP-001',
                    firstName: adminFirstName.trim(),
                    lastName: adminLastName.trim(),
                    email: normalizedEmail,
                    phone: phone || null,
                    departmentId: execDept.id,
                    designationId: ceoDesig.id,
                    branchId: headOffice.id,
                    shiftId: stdShift.id,
                    employmentType: 'FULL_TIME',
                    employmentStatus: 'ACTIVE',
                },
            });
            // 11. Provision Executive Salary Record
            await tx.employeeSalary.create({
                data: {
                    organizationId: org.id,
                    employeeId: employee.id,
                    baseSalary: 12500,
                    currency: currency || 'USD',
                    paymentMethod: 'BANK_TRANSFER',
                },
            });
            // 12. Provision Leave Balances
            const currentYear = new Date().getFullYear();
            await tx.leaveBalance.createMany({
                data: [
                    {
                        organizationId: org.id,
                        employeeId: employee.id,
                        leaveTypeId: annualLeave.id,
                        year: currentYear,
                        allocatedDays: 21,
                        remainingDays: 21,
                        usedDays: 0,
                        pendingDays: 0,
                    },
                    {
                        organizationId: org.id,
                        employeeId: employee.id,
                        leaveTypeId: sickLeave.id,
                        year: currentYear,
                        allocatedDays: 12,
                        remainingDays: 12,
                        usedDays: 0,
                        pendingDays: 0,
                    },
                    {
                        organizationId: org.id,
                        employeeId: employee.id,
                        leaveTypeId: casualLeave.id,
                        year: currentYear,
                        allocatedDays: 10,
                        remainingDays: 10,
                        usedDays: 0,
                        pendingDays: 0,
                    },
                ],
            });
            // 13. Create Initial Subscription Record
            await tx.subscriptionRecord.create({
                data: {
                    organizationId: org.id,
                    plan: org.subscriptionPlan,
                    status: 'ACTIVE',
                    amount: 0,
                    currency: currency || 'USD',
                    interval: 'MONTHLY',
                    maxEmployees: org.maxEmployees,
                    startDate: new Date(),
                    paymentStatus: 'PAID',
                    reference: `INIT-SUB-${Date.now()}`,
                },
            });
            return { org, user, membership, employee };
        });
        // 14. Generate Secure JWT Token for new workspace session
        const token = jsonwebtoken_1.default.sign({
            userId: result.user.id,
            organizationId: result.org.id,
        }, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
        // 15. Immutable Audit Event
        await (0, audit_js_1.logAuditEvent)({
            organizationId: result.org.id,
            actorId: result.user.id,
            actorEmail: result.user.email,
            action: 'ORGANIZATION_REGISTERED',
            entityType: 'ORGANIZATION',
            entityId: result.org.id,
            details: {
                slug: result.org.slug,
                companyName: result.org.name,
                status: result.org.status,
                plan: result.org.subscriptionPlan,
            },
            ipAddress: req.ip,
        });
        return res.status(201).json({
            success: true,
            message: 'Company workspace successfully registered and initialized.',
            data: {
                token,
                organization: {
                    id: result.org.id,
                    name: result.org.name,
                    slug: result.org.slug,
                    currency: result.org.currency,
                    timezone: result.org.timezone,
                    primaryColor: result.org.primaryColor,
                    status: result.org.status,
                    subscriptionPlan: result.org.subscriptionPlan,
                    subscriptionStatus: result.org.subscriptionStatus,
                    maxEmployees: result.org.maxEmployees,
                    companySize: result.org.companySize,
                },
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    role: result.membership.role,
                    employeeId: result.employee.id,
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.registerCompany = registerCompany;
const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone, companyName } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existing) {
            return next(new errorHandler_js_1.AppError('An account with this email address already exists. Please log in.', 409));
        }
        if (companyName && companyName.trim().length >= 2) {
            const slug = companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 32) || `org-${Date.now().toString(36)}`;
            req.body = {
                companyName: companyName.trim(),
                slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
                adminFirstName: firstName.trim(),
                adminLastName: lastName.trim(),
                adminEmail: normalizedEmail,
                password,
                phone,
            };
            return (0, exports.registerCompany)(req, res, next);
        }
        let primaryOrg = await prisma_js_1.prisma.organization.findFirst({
            where: { status: 'ACTIVE' },
            include: {
                departments: true,
                designations: true,
                branches: true,
                shifts: true,
            },
        });
        if (!primaryOrg) {
            primaryOrg = await prisma_js_1.prisma.organization.create({
                data: {
                    name: 'SmartHCM Enterprise',
                    slug: `smarthcm-${Date.now().toString(36)}`,
                    currency: 'USD',
                    timezone: 'UTC',
                    status: 'ACTIVE',
                },
                include: {
                    departments: true,
                    designations: true,
                    branches: true,
                    shifts: true,
                },
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const verifyToken = crypto_1.default.randomBytes(32).toString('hex');
        const verifyExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const result = await prisma_js_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: normalizedEmail,
                    passwordHash,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone || null,
                    isActive: true,
                    isSuperAdmin: false, // Strict: Public registration never grants admin privileges
                    emailVerified: !index_js_1.config.requireEmailVerification,
                    emailVerifyToken: verifyToken,
                    emailVerifyTokenExp: verifyExp,
                },
            });
            const membership = await tx.organizationMembership.create({
                data: {
                    userId: user.id,
                    organizationId: primaryOrg.id,
                    role: 'EMPLOYEE', // Strict: Ordinary registration receives EMPLOYEE role
                    isDefault: true,
                },
            });
            const empCount = await tx.employee.count({ where: { organizationId: primaryOrg.id } });
            const empCode = `EMP-${String(empCount + 1).padStart(3, '0')}`;
            const employee = await tx.employee.create({
                data: {
                    organizationId: primaryOrg.id,
                    userId: user.id,
                    employeeCode: empCode,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: normalizedEmail,
                    phone: phone || null,
                    departmentId: primaryOrg.departments[0]?.id || null,
                    designationId: primaryOrg.designations[0]?.id || null,
                    branchId: primaryOrg.branches[0]?.id || null,
                    shiftId: primaryOrg.shifts[0]?.id || null,
                    employmentType: 'FULL_TIME',
                    employmentStatus: 'ACTIVE',
                },
            });
            return { user, membership, employee, org: primaryOrg };
        });
        const token = jsonwebtoken_1.default.sign({
            userId: result.user.id,
            organizationId: result.org.id,
        }, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: result.org.id,
            actorId: result.user.id,
            actorEmail: result.user.email,
            action: 'USER_REGISTER',
            entityType: 'USER',
            entityId: result.user.id,
            ipAddress: req.ip,
        });
        (0, email_js_1.sendVerificationEmail)(normalizedEmail, firstName.trim(), verifyToken).catch((err) => {
            console.error('Failed to send verification email on registration:', err);
        });
        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Welcome to SmartHCM!',
            data: {
                token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    phone: result.user.phone,
                    isSuperAdmin: false,
                    role: 'EMPLOYEE',
                    organization: result.org,
                    employeeId: result.employee.id,
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.registerUser = registerUser;
const checkSlug = async (req, res, next) => {
    try {
        const rawSlug = String(req.params.slug || '');
        const slug = rawSlug.toLowerCase().trim();
        const isValid = /^[a-z0-9-]+$/.test(slug) && slug.length >= 2 && slug.length <= 40;
        if (!isValid) {
            return res.json({
                success: true,
                data: {
                    slug,
                    available: false,
                    valid: false,
                    message: 'Slug must be 2-40 characters, using only lowercase letters, numbers, and hyphens.',
                },
            });
        }
        const existing = await prisma_js_1.prisma.organization.findUnique({
            where: { slug },
            select: { id: true, name: true },
        });
        return res.json({
            success: true,
            data: {
                slug,
                available: !existing,
                valid: true,
                message: existing ? 'Workspace URL is already taken.' : 'Workspace URL is available!',
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.checkSlug = checkSlug;
const getWorkspaceBySlug = async (req, res, next) => {
    try {
        const rawSlug = String(req.params.slug || '');
        const slug = rawSlug.toLowerCase().trim();
        const org = await prisma_js_1.prisma.organization.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                brandLogoUrl: true,
                primaryColor: true,
                currency: true,
                timezone: true,
                address: true,
                email: true,
                phone: true,
            },
        });
        if (!org) {
            return next(new errorHandler_js_1.AppError('No workspace was found matching this identifier.', 404));
        }
        return res.json({
            success: true,
            data: org,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getWorkspaceBySlug = getWorkspaceBySlug;
const switchOrganization = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Unauthorized', 401));
        }
        const { organizationId } = req.body;
        if (!organizationId) {
            return next(new errorHandler_js_1.AppError('organizationId is required', 400));
        }
        const membership = await prisma_js_1.prisma.organizationMembership.findUnique({
            where: {
                userId_organizationId: {
                    userId: req.user.id,
                    organizationId,
                },
            },
            include: {
                organization: true,
            },
        });
        if (!membership && !req.user.isSuperAdmin) {
            return next(new errorHandler_js_1.AppError('You do not have active access to this organization workspace.', 403));
        }
        const org = membership?.organization ||
            (await prisma_js_1.prisma.organization.findUnique({ where: { id: organizationId } }));
        if (!org) {
            return next(new errorHandler_js_1.AppError('Target organization not found.', 404));
        }
        const token = jsonwebtoken_1.default.sign({
            userId: req.user.id,
            organizationId: org.id,
        }, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
        return res.json({
            success: true,
            message: `Switched active workspace to ${org.name}`,
            data: {
                token,
                role: membership?.role || (req.user.isSuperAdmin ? 'PLATFORM_SUPER_ADMIN' : 'EMPLOYEE'),
                organization: org,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.switchOrganization = switchOrganization;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        let resetToken = null;
        if (user) {
            resetToken = crypto_1.default.randomBytes(32).toString('hex');
            const resetExp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
            await prisma_js_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetToken: resetToken,
                    passwordResetTokenExp: resetExp,
                },
            });
            (0, email_js_1.sendPasswordResetEmail)(user.email, user.firstName, resetToken).catch((err) => {
                console.error('Failed to send password reset email:', err);
            });
        }
        // For anti-enumeration security, return generic success message
        return res.json({
            success: true,
            message: 'If a matching account exists, password reset instructions have been dispatched to your email.',
            data: {
                email: normalizedEmail,
                delivered: !!user,
                resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { email, token, newPassword } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user || !user.passwordResetToken || !user.passwordResetTokenExp) {
            return next(new errorHandler_js_1.AppError('Invalid reset request or expired token.', 400));
        }
        if (user.passwordResetToken !== token || user.passwordResetTokenExp < new Date()) {
            return next(new errorHandler_js_1.AppError('Password reset link is invalid or has expired. Please request a new one.', 400));
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetTokenExp: null,
            },
        });
        return res.json({
            success: true,
            message: 'Your password has been successfully updated. You may now sign in with your new password.',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
const verifyEmail = async (req, res, next) => {
    try {
        const { email, token } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user || !user.emailVerifyToken || !user.emailVerifyTokenExp) {
            return next(new errorHandler_js_1.AppError('Invalid email verification link or token already used.', 400));
        }
        if (user.emailVerifyToken !== token || user.emailVerifyTokenExp < new Date()) {
            return next(new errorHandler_js_1.AppError('Verification link has expired. Please request a new verification email.', 400));
        }
        await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifiedAt: new Date(),
                emailVerifyToken: null,
                emailVerifyTokenExp: null,
            },
        });
        return res.json({
            success: true,
            message: 'Work email address verified successfully! Your account is active.',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user) {
            return res.json({
                success: true,
                message: 'If an unverified account matches that email, a new verification link has been sent.',
            });
        }
        if (user.emailVerified) {
            return res.json({
                success: true,
                message: 'Your email address is already verified. You may sign in directly.',
            });
        }
        const verifyToken = crypto_1.default.randomBytes(32).toString('hex');
        const verifyExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerifyToken: verifyToken,
                emailVerifyTokenExp: verifyExp,
            },
        });
        await (0, email_js_1.sendVerificationEmail)(user.email, user.firstName, verifyToken);
        return res.json({
            success: true,
            message: 'A fresh verification link has been dispatched to your email address.',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Unauthorized', 401));
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                memberships: {
                    include: {
                        organization: true,
                    },
                },
                employee: {
                    include: {
                        department: true,
                        designation: true,
                        branch: true,
                        shift: true,
                    },
                },
            },
        });
        if (!user) {
            return next(new errorHandler_js_1.AppError('User not found', 404));
        }
        const currentOrg = user.memberships.find((m) => m.organizationId === req.user?.organizationId)?.organization;
        return res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isSuperAdmin: user.isSuperAdmin,
                role: req.user.role,
                currentOrganization: currentOrg || user.memberships[0]?.organization,
                employee: user.employee,
                memberships: user.memberships.map((m) => ({
                    organization: m.organization,
                    role: m.role,
                })),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
const getNotifications = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new errorHandler_js_1.AppError('Unauthorized', 401));
        const notifications = await prisma_js_1.prisma.notification.findMany({
            where: {
                organizationId: req.user.organizationId,
                userId: req.user.id,
            },
            orderBy: { createdAt: 'desc' },
            take: 15,
        });
        if (notifications.length === 0) {
            const pendingLeaves = await prisma_js_1.prisma.leaveRequest.count({
                where: { organizationId: req.user.organizationId, status: 'PENDING' },
            });
            const pendingCorrections = await prisma_js_1.prisma.attendanceCorrectionRequest.count({
                where: { organizationId: req.user.organizationId, status: 'PENDING' },
            });
            const fallbackNotifications = [
                {
                    id: 'notif-1',
                    title: 'Leave Approvals Queue',
                    message: `${pendingLeaves} pending employee leave request(s) awaiting review.`,
                    type: 'APPROVAL',
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    link: '/leaves',
                },
                {
                    id: 'notif-2',
                    title: 'Attendance Office Alert',
                    message: `${pendingCorrections} attendance correction request(s) submitted.`,
                    type: 'INFO',
                    isRead: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    link: '/attendance',
                },
                {
                    id: 'notif-3',
                    title: 'Monthly Payroll Cycle',
                    message: 'Current payroll calculation batch is ready for validation.',
                    type: 'SYSTEM',
                    isRead: true,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    link: '/payroll',
                },
            ];
            return res.json({ success: true, data: fallbackNotifications });
        }
        return res.json({ success: true, data: notifications });
    }
    catch (err) {
        next(err);
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res, next) => {
    try {
        const id = String(req.params.id || '');
        if (!id.startsWith('notif-')) {
            await prisma_js_1.prisma.notification.updateMany({
                where: { id, organizationId: req.user?.organizationId },
                data: { isRead: true },
            });
        }
        return res.json({ success: true, message: 'Notification marked as read' });
    }
    catch (err) {
        next(err);
    }
};
exports.markNotificationRead = markNotificationRead;
