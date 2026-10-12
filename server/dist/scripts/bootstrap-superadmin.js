"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function bootstrapSuperAdmin() {
    const email = (process.env.SUPERADMIN_EMAIL || 'superadmin@smarthcm.io').toLowerCase().trim();
    const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin2026!Secure';
    const firstName = process.env.SUPERADMIN_FIRST_NAME || 'Platform';
    const lastName = process.env.SUPERADMIN_LAST_NAME || 'SuperAdmin';
    const phone = process.env.SUPERADMIN_PHONE || '+1 800-555-0100';
    console.log(`🔐 Initializing Super Administrator provisioner for: ${email}`);
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        const updated = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                isSuperAdmin: true,
                isActive: true,
                passwordHash,
            },
        });
        console.log(`✅ Existing user ${updated.email} successfully elevated to Platform Super Administrator.`);
    }
    else {
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                phone,
                isActive: true,
                isSuperAdmin: true,
            },
        });
        console.log(`🎉 New Platform Super Administrator account provisioned: ${newUser.email}`);
    }
    await prisma.$disconnect();
}
bootstrapSuperAdmin().catch((err) => {
    console.error('❌ Failed to provision Super Admin:', err);
    process.exit(1);
});
