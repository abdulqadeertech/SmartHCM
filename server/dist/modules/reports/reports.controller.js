"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAiAssistant = exports.deleteSavedReport = exports.createSavedReport = exports.getSavedReports = exports.getAdvancedAnalytics = exports.getAttendanceTrends = exports.getDashboardSummary = void 0;
const prisma_js_1 = require("../../prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const getDashboardSummary = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [headcount, departmentStats, presentToday, pendingLeaves, activeJobs, payrollTotal, recentTickets,] = await Promise.all([
            prisma_js_1.prisma.employee.count({
                where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
            }),
            prisma_js_1.prisma.department.findMany({
                where: { organizationId: orgId },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    _count: { select: { employees: true } },
                },
            }),
            prisma_js_1.prisma.attendanceRecord.count({
                where: {
                    organizationId: orgId,
                    date: today,
                    status: 'PRESENT',
                },
            }),
            prisma_js_1.prisma.leaveRequest.count({
                where: { organizationId: orgId, status: 'PENDING' },
            }),
            prisma_js_1.prisma.jobRequisition.count({
                where: { organizationId: orgId, status: 'OPEN' },
            }),
            prisma_js_1.prisma.payrollRun.findFirst({
                where: { organizationId: orgId },
                orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
            }),
            prisma_js_1.prisma.supportTicket.count({
                where: { organizationId: orgId, status: 'OPEN' },
            }),
        ]);
        return res.json({
            success: true,
            data: {
                headcount,
                departmentStats,
                departmentDistribution: departmentStats,
                presentToday,
                pendingLeaves,
                activeJobs,
                latestPayroll: req.user?.role === 'EMPLOYEE' ? null : payrollTotal,
                openTickets: recentTickets,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardSummary = getDashboardSummary;
const getAttendanceTrends = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const past7Days = new Date();
        past7Days.setDate(today.getDate() - 7);
        past7Days.setHours(0, 0, 0, 0);
        const records = await prisma_js_1.prisma.attendanceRecord.findMany({
            where: {
                organizationId: orgId,
                date: { gte: past7Days, lte: today },
            },
            orderBy: { date: 'asc' },
        });
        const dayMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dayMap[key] = { date: key, present: 0, late: 0, absent: 0 };
        }
        records.forEach((r) => {
            const key = r.date.toISOString().split('T')[0];
            if (dayMap[key]) {
                if (r.status === 'PRESENT')
                    dayMap[key].present += 1;
                if (r.lateMinutes > 0)
                    dayMap[key].late += 1;
                if (r.status === 'ABSENT')
                    dayMap[key].absent += 1;
            }
        });
        return res.json({ success: true, data: Object.values(dayMap) });
    }
    catch (err) {
        next(err);
    }
};
exports.getAttendanceTrends = getAttendanceTrends;
/**
 * Advanced Business Intelligence Analytics with Date Ranges & Unusual-Data Alerts
 */
const getAdvancedAnalytics = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { startDate, endDate, departmentId } = req.query;
        const start = startDate ? new Date(String(startDate)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(String(endDate)) : new Date();
        const empWhere = { organizationId: orgId, employmentStatus: 'ACTIVE' };
        if (departmentId)
            empWhere.departmentId = String(departmentId);
        const [totalEmployees, attendanceRecords, leaveRequests, payrollRuns, pendingApprovalCount,] = await Promise.all([
            prisma_js_1.prisma.employee.findMany({
                where: empWhere,
                include: { department: true, salaryRecord: true },
            }),
            prisma_js_1.prisma.attendanceRecord.findMany({
                where: {
                    organizationId: orgId,
                    date: { gte: start, lte: end },
                },
            }),
            prisma_js_1.prisma.leaveRequest.findMany({
                where: {
                    organizationId: orgId,
                    startDate: { gte: start },
                },
                include: { leaveType: true },
            }),
            prisma_js_1.prisma.payrollRun.findMany({
                where: { organizationId: orgId },
                take: 3,
                orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
            }),
            prisma_js_1.prisma.approvalRequest.count({
                where: { organizationId: orgId, status: 'PENDING' },
            }),
        ]);
        // Attendance stats
        const totalPunches = attendanceRecords.length;
        const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
        const lateCount = attendanceRecords.filter((a) => a.lateMinutes > 0).length;
        const totalOvertimeMinutes = attendanceRecords.reduce((acc, a) => acc + (a.overtimeMinutes || 0), 0);
        const totalOvertimeHours = Number((totalOvertimeMinutes / 60).toFixed(1));
        // Leave stats by type
        const leaveBreakdown = {};
        for (const req of leaveRequests) {
            const typeName = req.leaveType?.name || 'General';
            leaveBreakdown[typeName] = (leaveBreakdown[typeName] || 0) + req.totalDays;
        }
        // Unusual Data Alerts
        const alerts = [];
        const absenteeismRate = totalPunches > 0 ? ((totalPunches - presentCount) / totalPunches) * 100 : 0;
        if (absenteeismRate > 15) {
            alerts.push({
                id: 'alt-absenteeism',
                level: 'HIGH',
                title: 'Elevated Absenteeism Detected',
                message: `Absenteeism rate is ${absenteeismRate.toFixed(1)}% over the filtered date range, exceeding normal threshold (10%).`,
            });
        }
        if (totalOvertimeHours > 40) {
            alerts.push({
                id: 'alt-overtime',
                level: 'MEDIUM',
                title: 'High Overtime Accumulation',
                message: `Team logged ${totalOvertimeHours} hours of overtime. Recommend reviewing shift allocations to avoid burnout.`,
            });
        }
        if (pendingApprovalCount >= 5) {
            alerts.push({
                id: 'alt-bottleneck',
                level: 'MEDIUM',
                title: 'Approval Queue Bottleneck',
                message: `${pendingApprovalCount} approval requests are pending multi-step sign-off across departments.`,
            });
        }
        if (alerts.length === 0) {
            alerts.push({
                id: 'alt-healthy',
                level: 'INFO',
                title: 'Operations Operating Normally',
                message: 'All attendance, leave, and payroll indicators are within established benchmark thresholds.',
            });
        }
        return res.json({
            success: true,
            data: {
                dateRange: { start, end },
                headcountTotal: totalEmployees.length,
                attendance: {
                    totalPunches,
                    presentCount,
                    lateCount,
                    punctualityRate: totalPunches > 0 ? Number(((presentCount / totalPunches) * 100).toFixed(1)) : 100,
                    totalOvertimeHours,
                },
                leaveBreakdown,
                payrollTrend: payrollRuns.map((r) => ({
                    period: `${r.periodMonth}/${r.periodYear}`,
                    totalGross: r.totalGross,
                    totalNet: r.totalNet,
                    status: r.status,
                })),
                alerts,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAdvancedAnalytics = getAdvancedAnalytics;
/**
 * Saved Reports
 */
const getSavedReports = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        const reports = await prisma_js_1.prisma.savedReport.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: reports });
    }
    catch (err) {
        next(err);
    }
};
exports.getSavedReports = getSavedReports;
const createSavedReport = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { title, reportType, filters } = req.body;
        if (!title || !reportType)
            return next(new errorHandler_js_1.AppError('Title and reportType are required', 400));
        const report = await prisma_js_1.prisma.savedReport.create({
            data: {
                organizationId: orgId,
                userId: req.user?.id || 'admin',
                title,
                reportType,
                filtersJson: typeof filters === 'object' ? JSON.stringify(filters) : filters || '{}',
                isPublic: true,
            },
        });
        return res.status(201).json({ success: true, data: report });
    }
    catch (err) {
        next(err);
    }
};
exports.createSavedReport = createSavedReport;
const deleteSavedReport = async (req, res, next) => {
    try {
        const id = req.params.id;
        await prisma_js_1.prisma.savedReport.delete({ where: { id } });
        return res.json({ success: true, message: 'Saved report deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteSavedReport = deleteSavedReport;
/**
 * Traceable Natural-Language AI Assistant for Organizational Data
 * Strictly permission-checked against user role & org isolation
 */
const queryAiAssistant = async (req, res, next) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId)
            return next(new errorHandler_js_1.AppError('Organization context missing', 400));
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return next(new errorHandler_js_1.AppError('Query text is required', 400));
        }
        const q = query.toLowerCase().trim();
        const userRole = req.user?.role || 'EMPLOYEE';
        // 1. Permission Gate: Salary / Compensation Queries
        const isFinancialQuery = q.includes('salary') || q.includes('payroll') || q.includes('compensation') || q.includes('earnings') || q.includes('bonus') || q.includes('net pay');
        const isAuthorizedForFinance = ['PLATFORM_SUPER_ADMIN', 'ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER', 'PAYROLL_MANAGER'].includes(userRole);
        if (isFinancialQuery && !isAuthorizedForFinance) {
            return res.json({
                success: true,
                data: {
                    query,
                    authorized: false,
                    answer: `Access Restricted: Your current role (${userRole}) does not have permission to query organizational compensation data. Only Payroll Managers and HR Directors may inspect payroll analytics.`,
                    metric: 'Restricted',
                    traceability: {
                        reason: 'RBAC Policy: Financial Data Masking',
                        authorizedRole: userRole,
                        organizationId: orgId,
                        timestamp: new Date().toISOString(),
                    },
                },
            });
        }
        // 2. Headcount & Department Intent
        if (q.includes('headcount') || q.includes('how many employees') || q.includes('total staff') || q.includes('people')) {
            const activeCount = await prisma_js_1.prisma.employee.count({
                where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
            });
            const deptCounts = await prisma_js_1.prisma.department.findMany({
                where: { organizationId: orgId },
                select: { name: true, _count: { select: { employees: true } } },
            });
            const deptSummary = deptCounts.map((d) => `${d.name}: ${d._count.employees}`).join(', ');
            return res.json({
                success: true,
                data: {
                    query,
                    authorized: true,
                    answer: `There are currently ${activeCount} active employees across ${deptCounts.length} departments (${deptSummary}).`,
                    metric: `${activeCount} Active Employees`,
                    breakdown: deptCounts.map((d) => ({ label: d.name, value: d._count.employees })),
                    traceability: {
                        queryExecuted: 'prisma.employee.count({ where: { organizationId, employmentStatus: "ACTIVE" } })',
                        recordCount: activeCount,
                        timestamp: new Date().toISOString(),
                    },
                },
            });
        }
        // 3. Attendance Intent
        if (q.includes('attendance') || q.includes('late') || q.includes('present') || q.includes('punctual')) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const [presentCount, lateCount, totalActive] = await Promise.all([
                prisma_js_1.prisma.attendanceRecord.count({
                    where: { organizationId: orgId, date: { gte: todayStart }, status: 'PRESENT' },
                }),
                prisma_js_1.prisma.attendanceRecord.count({
                    where: { organizationId: orgId, date: { gte: todayStart }, lateMinutes: { gt: 0 } },
                }),
                prisma_js_1.prisma.employee.count({
                    where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
                }),
            ]);
            const rate = totalActive > 0 ? ((presentCount / totalActive) * 100).toFixed(1) : '100';
            return res.json({
                success: true,
                data: {
                    query,
                    authorized: true,
                    answer: `Today, ${presentCount} of ${totalActive} employees (${rate}%) are marked present. ${lateCount} employee(s) arrived past the 15-minute grace threshold.`,
                    metric: `${rate}% Present Today`,
                    breakdown: [
                        { label: 'Present', value: presentCount },
                        { label: 'Late Arrival', value: lateCount },
                        { label: 'Absent/Pending', value: Math.max(0, totalActive - presentCount) },
                    ],
                    traceability: {
                        queryExecuted: 'prisma.attendanceRecord.count({ where: { organizationId, date >= today } })',
                        timestamp: new Date().toISOString(),
                    },
                },
            });
        }
        // 4. Leave Intent
        if (q.includes('leave') || q.includes('vacation') || q.includes('time off') || q.includes('absent')) {
            const [pendingCount, approvedCount] = await Promise.all([
                prisma_js_1.prisma.leaveRequest.count({
                    where: { organizationId: orgId, status: 'PENDING' },
                }),
                prisma_js_1.prisma.leaveRequest.count({
                    where: { organizationId: orgId, status: 'APPROVED' },
                }),
            ]);
            return res.json({
                success: true,
                data: {
                    query,
                    authorized: true,
                    answer: `There are currently ${pendingCount} pending leave applications requiring approval and ${approvedCount} approved leave requests in the system.`,
                    metric: `${pendingCount} Pending Approvals`,
                    traceability: {
                        queryExecuted: 'prisma.leaveRequest.count({ where: { organizationId, status: "PENDING" } })',
                        timestamp: new Date().toISOString(),
                    },
                },
            });
        }
        // 5. Payroll Intent (Authorized Only)
        if (isFinancialQuery && isAuthorizedForFinance) {
            const latestRun = await prisma_js_1.prisma.payrollRun.findFirst({
                where: { organizationId: orgId },
                orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
            });
            if (!latestRun) {
                return res.json({
                    success: true,
                    data: {
                        query,
                        authorized: true,
                        answer: 'No finalized payroll runs found for this organization yet.',
                        metric: '$0.00',
                        traceability: { queryExecuted: 'prisma.payrollRun.findFirst()', timestamp: new Date().toISOString() },
                    },
                });
            }
            return res.json({
                success: true,
                data: {
                    query,
                    authorized: true,
                    answer: `The latest payroll run for ${latestRun.periodMonth}/${latestRun.periodYear} totaled $${latestRun.totalGross.toLocaleString()} in gross earnings with $${latestRun.totalDeductions.toLocaleString()} in deductions, yielding a net payout of $${latestRun.totalNet.toLocaleString()} (${latestRun.status}).`,
                    metric: `$${latestRun.totalNet.toLocaleString()} Net Payroll`,
                    breakdown: [
                        { label: 'Gross Pay', value: latestRun.totalGross },
                        { label: 'Deductions (PF + Tax)', value: latestRun.totalDeductions },
                        { label: 'Net Payout', value: latestRun.totalNet },
                    ],
                    traceability: {
                        queryExecuted: `prisma.payrollRun.findFirst({ where: { organizationId: "${orgId}" } })`,
                        runId: latestRun.id,
                        timestamp: new Date().toISOString(),
                    },
                },
            });
        }
        // 6. Recruitment & ATS Intent
        if (q.includes('job') || q.includes('hire') || q.includes('recruitment') || q.includes('candidate') || q.includes('applicant')) {
            const [openJobs, totalCandidates] = await Promise.all([
                prisma_js_1.prisma.jobRequisition.count({ where: { organizationId: orgId, status: 'OPEN' } }),
                prisma_js_1.prisma.candidate.count({ where: { organizationId: orgId } }),
            ]);
            return res.json({
                success: true,
                data: {
                    query,
                    authorized: true,
                    answer: `SmartHCM ATS has ${openJobs} open job requisition(s) with ${totalCandidates} candidate(s) currently progressing through application stages.`,
                    metric: `${openJobs} Open Positions`,
                    traceability: { queryExecuted: 'prisma.jobRequisition.count() & candidate.count()', timestamp: new Date().toISOString() },
                },
            });
        }
        // 7. General Fallback
        const [empCount, deptCount] = await Promise.all([
            prisma_js_1.prisma.employee.count({ where: { organizationId: orgId, employmentStatus: 'ACTIVE' } }),
            prisma_js_1.prisma.department.count({ where: { organizationId: orgId } }),
        ]);
        return res.json({
            success: true,
            data: {
                query,
                authorized: true,
                answer: `SmartHCM Knowledge Engine: Organization currently has ${empCount} active personnel across ${deptCount} departments. Try asking: "What is our attendance rate today?", "How many leaves are pending?", or "What was our latest payroll?"`,
                metric: `${empCount} Active Personnel`,
                traceability: {
                    queryExecuted: 'General organizational summary verification',
                    timestamp: new Date().toISOString(),
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.queryAiAssistant = queryAiAssistant;
