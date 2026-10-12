"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignAsset = exports.createAsset = exports.getAssets = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const getAssets = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { status, category } = req.query;
        const where = { organizationId: orgId };
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        const assets = await prisma_js_1.prisma.asset.findMany({
            where,
            include: {
                assignments: {
                    where: { returnedDate: null },
                    include: {
                        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: assets });
    }
    catch (err) {
        next(err);
    }
};
exports.getAssets = getAssets;
const createAsset = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { name, assetCode, category, serialNumber, cost, condition = 'EXCELLENT' } = req.body;
        if (!name || !assetCode || !category)
            return next(new errorHandler_js_1.AppError('Name, asset code, and category are required', 400));
        const asset = await prisma_js_1.prisma.asset.create({
            data: {
                organizationId: orgId,
                name,
                assetCode,
                category,
                serialNumber,
                cost: cost ? parseFloat(cost) : null,
                condition,
                status: 'AVAILABLE',
            },
        });
        return res.status(201).json({ success: true, data: asset });
    }
    catch (err) {
        next(err);
    }
};
exports.createAsset = createAsset;
const assignAsset = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const { id } = req.params;
        const { employeeId, notes } = req.body;
        if (!employeeId)
            return next(new errorHandler_js_1.AppError('Employee ID is required', 400));
        const assetId = id;
        const result = await prisma_js_1.prisma.$transaction(async (tx) => {
            const assignment = await tx.assetAssignment.create({
                data: {
                    organizationId: orgId,
                    assetId,
                    employeeId,
                    notes,
                },
            });
            await tx.asset.update({
                where: { id: assetId },
                data: { status: 'ASSIGNED' },
            });
            return assignment;
        });
        return res.json({ success: true, message: 'Asset assigned successfully', data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.assignAsset = assignAsset;
