"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCandidateStage = exports.createCandidate = exports.getCandidates = exports.createJobRequisition = exports.getJobRequisitions = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const audit_js_1 = require("../../utils/audit.js");
const getJobRequisitions = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const jobs = await prisma_js_1.prisma.jobRequisition.findMany({
            where: { organizationId: orgId },
            include: {
                department: true,
                _count: { select: { candidates: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: jobs });
    }
    catch (err) {
        next(err);
    }
};
exports.getJobRequisitions = getJobRequisitions;
const createJobRequisition = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { title, departmentId, location, jobType, experienceLevel, salaryMin, salaryMax, description, requirements } = req.body;
        if (!title || !description)
            return next(new errorHandler_js_1.AppError('Title and description are required', 400));
        const job = await prisma_js_1.prisma.jobRequisition.create({
            data: {
                organizationId: orgId,
                title,
                departmentId: departmentId || null,
                location: location || 'HQ / Hybrid',
                jobType: jobType || 'FULL_TIME',
                experienceLevel: experienceLevel || 'MID_LEVEL',
                salaryMin: salaryMin ? parseFloat(salaryMin) : null,
                salaryMax: salaryMax ? parseFloat(salaryMax) : null,
                description,
                requirements: requirements || null,
                status: 'OPEN',
            },
        });
        await (0, audit_js_1.logAuditEvent)({
            organizationId: orgId,
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            action: 'JOB_REQUISITION_CREATED',
            entityType: 'JOB_REQUISITION',
            entityId: job.id,
            details: { title },
        });
        return res.status(201).json({ success: true, data: job });
    }
    catch (err) {
        next(err);
    }
};
exports.createJobRequisition = createJobRequisition;
const getCandidates = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { jobId, stage } = req.query;
        const where = { organizationId: orgId };
        if (jobId)
            where.jobRequisitionId = jobId;
        if (stage)
            where.stage = stage;
        const candidates = await prisma_js_1.prisma.candidate.findMany({
            where,
            include: {
                jobRequisition: { select: { title: true } },
                interviews: true,
            },
            orderBy: { appliedAt: 'desc' },
        });
        return res.json({ success: true, data: candidates });
    }
    catch (err) {
        next(err);
    }
};
exports.getCandidates = getCandidates;
const createCandidate = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { jobRequisitionId, firstName, lastName, email, phone, notes, rating = 3 } = req.body;
        if (!jobRequisitionId || !firstName || !lastName || !email) {
            return next(new errorHandler_js_1.AppError('Job, first name, last name, and email are required', 400));
        }
        const candidate = await prisma_js_1.prisma.candidate.create({
            data: {
                organizationId: orgId,
                jobRequisitionId,
                firstName,
                lastName,
                email,
                phone,
                notes,
                rating: parseInt(rating, 10),
                stage: 'APPLIED',
            },
        });
        return res.status(201).json({ success: true, data: candidate });
    }
    catch (err) {
        next(err);
    }
};
exports.createCandidate = createCandidate;
const updateCandidateStage = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        const { stage, notes } = req.body;
        const candidateId = id;
        const candidate = await prisma_js_1.prisma.candidate.findFirst({
            where: { id: candidateId, organizationId: orgId },
        });
        if (!candidate)
            return next(new errorHandler_js_1.AppError('Candidate not found', 404));
        const updated = await prisma_js_1.prisma.candidate.update({
            where: { id: candidateId },
            data: {
                stage,
                notes: notes !== undefined ? notes : candidate.notes,
            },
        });
        return res.json({ success: true, message: 'Candidate stage updated', data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateCandidateStage = updateCandidateStage;
