"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.getTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_js_1 = require("../config/index.js");
let transporterInstance = null;
const getTransporter = async () => {
    if (index_js_1.config.smtpHost && index_js_1.config.smtpUser && index_js_1.config.smtpPass) {
        if (!transporterInstance) {
            transporterInstance = nodemailer_1.default.createTransport({
                host: index_js_1.config.smtpHost,
                port: index_js_1.config.smtpPort,
                secure: index_js_1.config.smtpSecure,
                auth: {
                    user: index_js_1.config.smtpUser,
                    pass: index_js_1.config.smtpPass,
                },
            });
        }
        return { transporter: transporterInstance, isRealSmtp: true };
    }
    // Safe development / fallback mode when real SMTP credentials are not yet configured in .env
    if (!transporterInstance) {
        transporterInstance = nodemailer_1.default.createTransport({
            streamTransport: true,
            newline: 'windows',
            buffer: true,
        });
    }
    return { transporter: transporterInstance, isRealSmtp: false };
};
exports.getTransporter = getTransporter;
const sendVerificationEmail = async (to, firstName, token) => {
    const { transporter, isRealSmtp } = await (0, exports.getTransporter)();
    const verifyUrl = `${index_js_1.config.clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
    const subject = 'Verify your SmartHCM Work Email';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your Email - SmartHCM</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #051720; color: #f8fafc; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background-color: #08222f; border: 1px solid #14425b; border-radius: 16px; padding: 32px; }
        .logo { font-size: 20px; font-weight: bold; color: #ff6f32; margin-bottom: 20px; display: inline-block; }
        h1 { color: #ffffff; font-size: 22px; margin-top: 0; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #ff6f32; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 20px 0; }
        .token-box { background-color: #051822; border: 1px dashed #14425b; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 14px; color: #ff6f32; margin: 15px 0; word-break: break-all; }
        .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #14425b; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ SmartHCM Enterprise</div>
        <h1>Confirm your email address</h1>
        <p>Hello ${firstName || 'there'},</p>
        <p>Thank you for signing up with SmartHCM. Please verify your email to activate all workspace capabilities and access your employee portal.</p>
        <div>
          <a href="${verifyUrl}" class="btn">Verify Work Email</a>
        </div>
        <p>Or copy and paste this verification URL into your browser:</p>
        <div class="token-box">${verifyUrl}</div>
        <p>This verification link is valid for 24 hours. If you did not create this account, you can safely ignore this email.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SmartHCM Cloud Enterprise. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
    try {
        const info = await transporter.sendMail({
            from: index_js_1.config.smtpFrom,
            to,
            subject,
            html,
        });
        return {
            success: true,
            messageId: info.messageId,
            isRealSmtp,
            recipient: to,
            subject,
        };
    }
    catch (err) {
        console.error('Email verification dispatch error:', err);
        return {
            success: false,
            isRealSmtp,
            recipient: to,
            subject,
        };
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (to, firstName, token) => {
    const { transporter, isRealSmtp } = await (0, exports.getTransporter)();
    const resetUrl = `${index_js_1.config.clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
    const subject = 'Reset your SmartHCM Password';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Password - SmartHCM</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #051720; color: #f8fafc; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background-color: #08222f; border: 1px solid #14425b; border-radius: 16px; padding: 32px; }
        .logo { font-size: 20px; font-weight: bold; color: #ff6f32; margin-bottom: 20px; display: inline-block; }
        h1 { color: #ffffff; font-size: 22px; margin-top: 0; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #ff6f32; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 20px 0; }
        .token-box { background-color: #051822; border: 1px dashed #14425b; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 14px; color: #ff6f32; margin: 15px 0; word-break: break-all; }
        .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #14425b; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ SmartHCM Security</div>
        <h1>Password Reset Request</h1>
        <p>Hello ${firstName || 'there'},</p>
        <p>We received a request to reset your SmartHCM portal credentials. Click the button below to choose a new secure password:</p>
        <div>
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        <p>Or copy this link to your browser:</p>
        <div class="token-box">${resetUrl}</div>
        <p>This password reset link will expire in <strong>15 minutes</strong>. If you did not make this request, please contact your company HCM security administrator immediately.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SmartHCM Cloud Enterprise. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
    try {
        const info = await transporter.sendMail({
            from: index_js_1.config.smtpFrom,
            to,
            subject,
            html,
        });
        return {
            success: true,
            messageId: info.messageId,
            isRealSmtp,
            recipient: to,
            subject,
        };
    }
    catch (err) {
        console.error('Password reset dispatch error:', err);
        return {
            success: false,
            isRealSmtp,
            recipient: to,
            subject,
        };
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
