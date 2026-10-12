import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Briefcase,
  HelpCircle,
  ArrowUpRight,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Calendar,
  AlertTriangle,
  CheckSquare,
  ChevronRight,
  Plus,
  UserCheck,
  Check,
  X,
  Building2,
  ShieldCheck,
  Activity,
  Timer,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [viewMode, setViewMode] = useState<'executive' | 'ess'>(
    user?.role === 'EMPLOYEE' ? 'ess' : 'executive'
  );

  const [summary, setSummary] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [expiries, setExpiries] = useState<any[]>([]);
  const [essSummary, setEssSummary] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [actionCenter, setActionCenter] = useState<any>(null);
  const [healthCheck, setHealthCheck] = useState<any>(null);

  const [isClocking, setIsClocking] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Announcement Modal State
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [newAnnounce, setNewAnnounce] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
  });

  const isHrOrAdmin =
    user?.isSuperAdmin ||
    ['PLATFORM_SUPER_ADMIN', 'ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER', 'DEPT_MANAGER'].includes(
      user?.role || ''
    );

  const loadData = async () => {
    try {
      const [sumRes, attRes, annRes, calRes] = await Promise.all([
        apiRequest('/reports/summary'),
        apiRequest('/attendance/today'),
        apiRequest('/employees/announcements'),
        apiRequest('/employees/company-calendar'),
      ]);
      setSummary(sumRes?.data);
      setTodayAttendance(attRes?.data);
      setAnnouncements(annRes?.data || []);

      const calendarData = calRes?.data;
      if (Array.isArray(calendarData)) {
        setCalendarEvents(calendarData);
      } else {
        const { holidays = [], approvedLeaves = [], announcements: calendarAnnouncements = [] } =
          calendarData || {};
        setCalendarEvents([
          ...(Array.isArray(holidays)
            ? holidays.map((holiday: any) => ({
                title: holiday.name,
                type: 'HOLIDAY',
                date: holiday.date,
              }))
            : []),
          ...(Array.isArray(approvedLeaves)
            ? approvedLeaves.map((leave: any) => ({
                title: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''} - ${
                  leave.leaveType?.name || 'Leave'
                }`.trim(),
                type: 'APPROVED LEAVE',
                date: leave.startDate,
              }))
            : []),
          ...(Array.isArray(calendarAnnouncements)
            ? calendarAnnouncements.map((announcement: any) => ({
                title: announcement.title,
                type: announcement.category || 'ANNOUNCEMENT',
                date: announcement.publishedAt,
              }))
            : []),
        ]);
      }

      if (isHrOrAdmin) {
        apiRequest('/employees/expiries')
          .then((res) => setExpiries(res?.data || []))
          .catch(() => {});

        // Load pending leave requests for quick approval queue
        apiRequest('/leaves/requests')
          .then((res) => {
            const pending = (res?.data || []).filter((l: any) => l.status === 'PENDING');
            setPendingLeaves(pending);
          })
          .catch(() => {});

        // Load Smart HR Action Center
        apiRequest('/system/action-center')
          .then((res) => setActionCenter(res?.data || null))
          .catch(() => {});

        // Load Company HR Health Check
        apiRequest('/system/health-check')
          .then((res) => setHealthCheck(res?.data || null))
          .catch(() => {});
      }

      // Load ESS info
      const essRes = await apiRequest('/employees/ess/summary');
      setEssSummary(essRes?.data || null);

      if (essRes?.data?.employee?.id) {
        const checkRes = await apiRequest(`/employees/checklists/${essRes.data.employee.id}`);
        setChecklists(checkRes?.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  };

  useEffect(() => {
    loadData();
    if (!isHrOrAdmin) {
      setViewMode('ess');
    }
  }, [user, isHrOrAdmin]);

  const handleClockIn = async () => {
    setIsClocking(true);
    setActionMessage(null);
    try {
      const res = await apiRequest('/attendance/clock-in', { method: 'POST' });
      setTodayAttendance(res?.data || null);
      success('Successfully clocked in for today!');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    setIsClocking(true);
    setActionMessage(null);
    try {
      const res = await apiRequest('/attendance/clock-out', { method: 'POST' });
      setTodayAttendance(res?.data || null);
      success('Successfully clocked out for today!');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to clock out');
    } finally {
      setIsClocking(false);
    }
  };

  const handleQuickReviewLeave = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(`/leaves/requests/${leaveId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewerNotes: `Reviewed from dashboard by ${user?.firstName}` }),
      });
      success(`Leave request ${status.toLowerCase()} successfully`);
      setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId));
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to review leave request');
    }
  };

  const handleToggleChecklist = async (itemId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/employees/checklists/${itemId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });
      if (essSummary?.employee?.id) {
        const checkRes = await apiRequest(`/employees/checklists/${essSummary.employee.id}`);
        setChecklists(checkRes?.data || []);
      }
    } catch (err: any) {
      console.error('Failed to toggle checklist:', err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/employees/announcements', {
        method: 'POST',
        body: JSON.stringify(newAnnounce),
      });
      setShowAnnounceModal(false);
      setNewAnnounce({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL' });
      const annRes = await apiRequest('/employees/announcements');
      setAnnouncements(annRes?.data || []);
      success('Company announcement broadcasted successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to post announcement');
    }
  };

  const chartData =
    summary?.departmentDistribution?.map((d: any) => ({
      name: d.name.split(' ')[0],
      fullName: d.name,
      employees: d.count,
    })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: viewMode === 'executive' ? 'Executive HR Dashboard' : 'Employee Self-Service Hub' },
        ]}
      />

      {/* Welcome Banner with Role View Switcher */}
      <div className="bg-[#08222f] rounded-2xl p-6 border border-[#14425b] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.firstName} {user?.lastName}
            </h1>
            <Badge variant="brand" size="xs">
              {user?.role}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
            <Building2 size={13} className="text-[#ff6f32]" />
            <span>
              Workspace: <strong className="text-white">{user?.organization?.name}</strong> &bull; Multi-Tenant Scoped
            </span>
          </p>
        </div>

        {/* View Switcher & Live Punch Clock */}
        <div className="flex flex-wrap items-center gap-3">
          {isHrOrAdmin && (
            <div className="flex bg-[#051720] border border-[#14425b] p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('executive')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'executive'
                    ? 'bg-[#ff6f32] text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Executive HR View
              </button>
              <button
                onClick={() => setViewMode('ess')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'ess'
                    ? 'bg-[#ff6f32] text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Employee ESS Hub
              </button>
            </div>
          )}

          {/* Live Punch Clock Terminal Widget */}
          <div className="flex items-center space-x-3 bg-[#051720] p-2.5 rounded-xl border border-[#14425b]">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Biometric Punch
              </div>
              <div className="text-xs font-semibold text-white">
                {todayAttendance?.clockIn
                  ? `In: ${new Date(todayAttendance.clockIn).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Not Clocked In'}
                {todayAttendance?.clockOut &&
                  ` | Out: ${new Date(todayAttendance.clockOut).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </div>
            </div>

            {!todayAttendance?.clockIn ? (
              <button
                onClick={handleClockIn}
                disabled={isClocking}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Play size={13} />
                <span>Clock In</span>
              </button>
            ) : !todayAttendance?.clockOut ? (
              <button
                onClick={handleClockOut}
                disabled={isClocking}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Square size={13} />
                <span>Clock Out</span>
              </button>
            ) : (
              <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle2 size={13} />
                <span>Shift Done</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* EXECUTIVE HR VIEW */}
      {viewMode === 'executive' && (
        <>
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-card hover:border-[#ff6f32]/40 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Headcount
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#051720] border border-[#14425b] text-[#ff6f32] flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary?.headcount ?? '...'}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Active roster headcount</span>
                <Link
                  to="/employees"
                  className="text-[#ff6f32] hover:underline flex items-center font-semibold"
                >
                  Directory <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-card hover:border-[#ff6f32]/40 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Attendance Rate
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#051720] border border-[#14425b] text-[#ff6f32] flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary?.attendanceToday ? `${summary.attendanceToday.ratePercentage}%` : '...'}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{summary?.attendanceToday?.present || 0} clocked in today</span>
                <Link
                  to="/attendance"
                  className="text-[#ff6f32] hover:underline flex items-center font-semibold"
                >
                  View Log <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-card hover:border-[#ff6f32]/40 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pending Leaves
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#051720] border border-[#14425b] text-[#ff6f32] flex items-center justify-center">
                  <CalendarCheck size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary?.pendingLeaves ?? pendingLeaves.length}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Awaiting authorization</span>
                <Link
                  to="/leaves"
                  className="text-[#ff6f32] hover:underline flex items-center font-semibold"
                >
                  Approvals <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-card hover:border-[#ff6f32]/40 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Monthly Payroll
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#051720] border border-[#14425b] text-[#ff6f32] flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                ${summary?.latestPayroll?.totalNet?.toLocaleString() || '0'}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <Badge variant="brand" size="xs">
                  {summary?.latestPayroll?.status || 'NO RUN'}
                </Badge>
                <Link
                  to="/payroll"
                  className="text-[#ff6f32] hover:underline flex items-center font-semibold"
                >
                  Payroll Run <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Differentiating Feature: Smart HR Action Center & Company HR Health Check */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Smart HR Action Center */}
            <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Activity className="text-[#ff6f32]" size={18} />
                    <span>Smart HR Action Center</span>
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (actionCenter?.totalActionItems || 0) > 0
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {(actionCenter?.totalActionItems || 0) > 0
                      ? `${actionCenter?.totalActionItems} Actions Required`
                      : 'Zero Backlog'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Aggregated real-time operational workflows requiring manager intervention.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    to="/leaves"
                    className="p-3 bg-[#051720] hover:bg-[#071c26] rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#08222f] flex items-center justify-center text-[#ff6f32]">
                        <CalendarCheck size={14} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Pending Leaves</div>
                        <div className="text-[10px] text-slate-400">Time off decisions</div>
                      </div>
                    </div>
                    <span className="font-bold text-white bg-[#08222f] px-2 py-0.5 rounded border border-[#14425b]">
                      {actionCenter?.pendingLeaves?.count ?? 0}
                    </span>
                  </Link>

                  <Link
                    to="/attendance"
                    className="p-3 bg-[#051720] hover:bg-[#071c26] rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#08222f] flex items-center justify-center text-[#ff6f32]">
                        <Timer size={14} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Overtime Requests</div>
                        <div className="text-[10px] text-slate-400">Awaiting supervisor review</div>
                      </div>
                    </div>
                    <span className="font-bold text-white bg-[#08222f] px-2 py-0.5 rounded border border-[#14425b]">
                      {actionCenter?.pendingOvertime?.count ?? 0}
                    </span>
                  </Link>

                  <Link
                    to="/attendance"
                    className="p-3 bg-[#051720] hover:bg-[#071c26] rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#08222f] flex items-center justify-center text-[#ff6f32]">
                        <Clock size={14} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Punch Corrections</div>
                        <div className="text-[10px] text-slate-400">Biometric adjustments</div>
                      </div>
                    </div>
                    <span className="font-bold text-white bg-[#08222f] px-2 py-0.5 rounded border border-[#14425b]">
                      {actionCenter?.pendingCorrections?.count ?? 0}
                    </span>
                  </Link>

                  <Link
                    to="/employees"
                    className="p-3 bg-[#051720] hover:bg-[#071c26] rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#08222f] flex items-center justify-center text-[#ff6f32]">
                        <CheckSquare size={14} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Incomplete Onboarding</div>
                        <div className="text-[10px] text-slate-400">Pending checklists</div>
                      </div>
                    </div>
                    <span className="font-bold text-white bg-[#08222f] px-2 py-0.5 rounded border border-[#14425b]">
                      {actionCenter?.incompleteOnboarding?.count ?? 0}
                    </span>
                  </Link>

                  <Link
                    to="/employees"
                    className="p-3 bg-[#051720] hover:bg-[#071c26] rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#08222f] flex items-center justify-center text-[#ff6f32]">
                        <FileText size={14} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Expiring Documents</div>
                        <div className="text-[10px] text-slate-400">Expiring in &le; 30 days</div>
                      </div>
                    </div>
                    <span className="font-bold text-white bg-[#08222f] px-2 py-0.5 rounded border border-[#14425b]">
                      {actionCenter?.expiringDocuments?.count ?? 0}
                    </span>
                  </Link>

                  <Link
                    to="/payroll"
                    className="p-3 bg-[#051720] hover:bg-[#071c26] rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#08222f] flex items-center justify-center text-[#ff6f32]">
                        <CreditCard size={14} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Draft Payrolls</div>
                        <div className="text-[10px] text-slate-400">Unfinalized periods</div>
                      </div>
                    </div>
                    <span className="font-bold text-white bg-[#08222f] px-2 py-0.5 rounded border border-[#14425b]">
                      {actionCenter?.draftPayrolls?.count ?? 0}
                    </span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#14425b] flex items-center justify-between text-[11px] text-slate-400">
                <span>Multi-tenant synchronized queue</span>
                <span className="text-[#ff6f32] font-semibold">● Live Database</span>
              </div>
            </div>

            {/* Company HR Health Check */}
            <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="text-[#ff6f32]" size={18} />
                    <span>Company HR Health Check</span>
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-extrabold text-white">
                      {healthCheck?.score ?? 100}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        healthCheck?.rating === 'EXCELLENT'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : healthCheck?.rating === 'HEALTHY'
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                          : healthCheck?.rating === 'NEEDS_ATTENTION'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {healthCheck?.rating || 'HEALTHY'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Multi-dimensional compliance score across profiles, payroll, documents, and attendance.
                </p>

                {/* Dimension Gauges */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Employee Profile Completeness</span>
                      <span className="font-semibold text-white">
                        {healthCheck?.metrics?.profileCompleteness?.percentage ?? 100}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#051720] rounded-full overflow-hidden border border-[#14425b]/50">
                      <div
                        className="h-full bg-[#ff6f32] rounded-full transition-all"
                        style={{ width: `${healthCheck?.metrics?.profileCompleteness?.percentage ?? 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Salary Structure Coverage</span>
                      <span className="font-semibold text-white">
                        {healthCheck?.metrics?.salaryConfiguration?.percentage ?? 100}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#051720] rounded-full overflow-hidden border border-[#14425b]/50">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${healthCheck?.metrics?.salaryConfiguration?.percentage ?? 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Document Compliance (ID / Contract)</span>
                      <span className="font-semibold text-white">
                        {healthCheck?.metrics?.documentCompliance?.percentage ?? 100}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#051720] rounded-full overflow-hidden border border-[#14425b]/50">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all"
                        style={{ width: `${healthCheck?.metrics?.documentCompliance?.percentage ?? 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Onboarding Checklist Completion</span>
                      <span className="font-semibold text-white">
                        {healthCheck?.metrics?.onboardingProgress?.percentage ?? 100}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#051720] rounded-full overflow-hidden border border-[#14425b]/50">
                      <div
                        className="h-full bg-purple-400 rounded-full transition-all"
                        style={{ width: `${healthCheck?.metrics?.onboardingProgress?.percentage ?? 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {healthCheck?.recommendations?.length > 0 && (
                  <div className="mt-3 p-2.5 bg-[#051720] border border-[#14425b] rounded-xl text-[11px] text-slate-300 space-y-1">
                    <div className="font-bold text-[#ff6f32] text-[10px] uppercase tracking-wider">
                      Recommended Action
                    </div>
                    <div className="truncate text-slate-300">
                      &bull; {healthCheck.recommendations[0]}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#14425b] flex items-center justify-between text-[11px] text-slate-400">
                <span>Enterprise compliance audit</span>
                <span className="text-emerald-400 font-semibold">● Active Engine</span>
              </div>
            </div>
          </div>

          {/* Quick Approvals Queue & Department Workforce Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Workforce Chart */}
            <div className="lg:col-span-2 bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Department Workforce Distribution
                  </h2>
                  <p className="text-xs text-slate-400">
                    Active team members allocated across operational divisions
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#14425b" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#071c26',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: '1px solid #14425b',
                      }}
                      formatter={(value: any) => [`${value} Members`, 'Headcount']}
                    />
                    <Bar dataKey="employees" fill="#ff6f32" radius={[6, 6, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Action: Pending Leave Approvals Queue */}
            <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <CalendarCheck className="text-[#ff6f32]" size={17} />
                    <span>Quick Leave Approvals</span>
                  </h2>
                  <Badge variant="warning" size="xs">
                    {pendingLeaves.length} Pending
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Direct 1-click approvals for team requests
                </p>

                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {pendingLeaves.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      All leave requests have been authorized. Queue clear!
                    </div>
                  ) : (
                    pendingLeaves.slice(0, 4).map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl bg-[#051720] border border-[#14425b] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {req.employee?.firstName} {req.employee?.lastName}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {req.daysRequested}d ({req.leaveType?.code})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {req.reason || 'Personal time off'}
                        </p>
                        <div className="flex items-center justify-end space-x-2 pt-1 border-t border-[#14425b]">
                          <button
                            onClick={() => handleQuickReviewLeave(req.id, 'REJECTED')}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleQuickReviewLeave(req.id, 'APPROVED')}
                            className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#ff6f32] hover:bg-[#ea580c] text-white shadow-2xs cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#14425b] flex items-center justify-between text-xs">
                <Link
                  to="/leaves"
                  className="text-[#ff6f32] hover:underline font-semibold flex items-center"
                >
                  Manage All Leave Requests <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* EMPLOYEE SELF-SERVICE (ESS) HUB */}
      {viewMode === 'ess' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ESS Overview & Checklists */}
          <div className="lg:col-span-2 space-y-6">
            {/* ESS Balances Card */}
            <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card">
              <h2 className="text-sm font-bold text-white mb-1">
                My Leave Entitlements & Balances
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Available vacation and personal quotas for the current year
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#051720] rounded-xl border border-[#14425b]">
                  <span className="text-slate-300 font-semibold">Annual Vacation</span>
                  <div className="text-2xl font-bold text-[#ff6f32] mt-1">
                    {essSummary?.leaveBalances?.annual || 21} <span className="text-xs font-normal">days</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Paid statutory compensation</span>
                </div>

                <div className="p-4 bg-[#051720] rounded-xl border border-[#14425b]">
                  <span className="text-slate-300 font-semibold">Sick Leave</span>
                  <div className="text-2xl font-bold text-white mt-1">
                    {essSummary?.leaveBalances?.sick || 12} <span className="text-xs font-normal">days</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Medical cert required &gt; 2d</span>
                </div>

                <div className="p-4 bg-[#051720] rounded-xl border border-[#14425b]">
                  <span className="text-slate-300 font-semibold">Casual / Personal</span>
                  <div className="text-2xl font-bold text-white mt-1">
                    {essSummary?.leaveBalances?.casual || 10} <span className="text-xs font-normal">days</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Personal emergencies</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  to="/leaves"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <CalendarCheck size={14} />
                  <span>Apply for Time Off</span>
                </Link>
              </div>
            </div>

            {/* Onboarding Checklist Progress */}
            <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckSquare className="text-[#ff6f32]" size={17} />
                  <span>Employee Journey & Onboarding Checklist</span>
                </h2>
                <Badge variant="brand" size="xs">
                  Self-Service
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Verify and complete your corporate onboarding items
              </p>

              <div className="space-y-2.5">
                {checklists.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No active onboarding checklists assigned. You are fully compliant!
                  </div>
                ) : (
                  checklists.map((list) => (
                    <div key={list.id} className="space-y-2">
                      <div className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
                        {list.title} ({list.type})
                      </div>
                      <div className="divide-y divide-[#14425b] border border-[#14425b] rounded-xl overflow-hidden bg-[#051720]">
                        {list.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="p-3 flex items-center justify-between text-xs hover:bg-[#071c26]"
                          >
                            <label className="flex items-center space-x-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => handleToggleChecklist(item.id, item.isCompleted)}
                                className="rounded text-[#ff6f32] focus:ring-[#ff6f32] h-4 w-4 bg-[#08222f] border-[#14425b]"
                              />
                              <span
                                className={
                                  item.isCompleted
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-200 font-medium'
                                }
                              >
                                {item.title}
                              </span>
                            </label>
                            {item.isCompleted && (
                              <Badge variant="success" size="xs">
                                Verified Done
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ESS Right Column: Recent Payslips & Quick Actions */}
          <div className="space-y-6">
            <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card">
              <h2 className="text-sm font-bold text-white mb-1">
                My Recent Payslips
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Itemized compensation disbursements
              </p>

              <div className="space-y-2.5">
                {essSummary?.recentPayslips?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">No payslips found yet.</div>
                ) : (
                  essSummary?.recentPayslips?.slice(0, 3).map((ps: any) => (
                    <div
                      key={ps.id}
                      className="p-3 rounded-xl bg-[#051720] border border-[#14425b] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          Period {ps.payrollRun?.periodMonth}/{ps.payrollRun?.periodYear}
                        </div>
                        <div className="text-[#ff6f32] font-bold">
                          ${ps.netSalary?.toLocaleString()} Net
                        </div>
                      </div>
                      <Link
                        to="/payroll"
                        className="px-2.5 py-1 bg-[#08222f] hover:bg-[#0a2736] text-slate-200 rounded-lg border border-[#14425b] font-semibold text-[11px]"
                      >
                        Receipt
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions for ESS */}
            <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card space-y-3">
              <h2 className="text-sm font-bold text-white">Self-Service Actions</h2>
              <div className="space-y-2 text-xs">
                <Link
                  to="/leaves"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#051720] hover:bg-[#071c26] text-slate-200 hover:text-[#ff6f32] border border-[#14425b] font-medium transition"
                >
                  <span>Submit Leave Request</span>
                  <ArrowUpRight size={14} className="text-[#ff6f32]" />
                </Link>
                <Link
                  to="/helpdesk"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#051720] hover:bg-[#071c26] text-slate-200 hover:text-[#ff6f32] border border-[#14425b] font-medium transition"
                >
                  <span>Open HR Service Ticket</span>
                  <ArrowUpRight size={14} className="text-[#ff6f32]" />
                </Link>
                <Link
                  to="/attendance"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#051720] hover:bg-[#071c26] text-slate-200 hover:text-[#ff6f32] border border-[#14425b] font-medium transition"
                >
                  <span>Request Punch Correction</span>
                  <ArrowUpRight size={14} className="text-[#ff6f32]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARED SECTION: ANNOUNCEMENTS FEED & COMPANY CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Announcements Feed */}
        <div className="lg:col-span-2 bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Megaphone className="text-[#ff6f32]" size={17} />
                <span>Company Broadcasts & Announcements</span>
              </h2>
              <p className="text-xs text-slate-400">
                Corporate notices and executive updates
              </p>
            </div>
            {isHrOrAdmin && (
              <button
                onClick={() => setShowAnnounceModal(true)}
                className="flex items-center space-x-1 bg-[#ff6f32] hover:bg-[#ea580c] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus size={13} />
                <span>Post Notice</span>
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No company announcements posted.
              </div>
            ) : (
              announcements.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-[#051720] border border-[#14425b] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{a.title}</span>
                    <Badge variant={a.priority === 'URGENT' ? 'danger' : 'neutral'} size="xs">
                      {a.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{a.content}</p>
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>Category: {a.category}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Company Calendar & Holidays */}
        <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Calendar className="text-[#ff6f32]" size={17} />
                <span>Company Calendar</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold">2026/2027</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Official holidays and scheduled team absences
            </p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {calendarEvents.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No scheduled holidays.</div>
              ) : (
                calendarEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#051720] border border-[#14425b] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{evt.title}</div>
                      <div className="text-[10px] text-slate-400">{evt.type}</div>
                    </div>
                    <Badge variant="brand" size="xs">
                      {new Date(evt.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#14425b] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Multi-Tenant Calendar</span>
            <span className="text-emerald-400 font-semibold">● Synced</span>
          </div>
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#14425b] text-left">
            <h3 className="text-base font-bold text-white mb-4">
              Broadcast Company Announcement
            </h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={newAnnounce.title}
                  onChange={(e) => setNewAnnounce({ ...newAnnounce, title: e.target.value })}
                  placeholder="e.g. Q4 Townhall & Benefits Review"
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newAnnounce.category}
                    onChange={(e) => setNewAnnounce({ ...newAnnounce, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="GENERAL" className="bg-[#08222f] text-white">General Notice</option>
                    <option value="POLICY" className="bg-[#08222f] text-white">HR Policy</option>
                    <option value="EVENT" className="bg-[#08222f] text-white">Corporate Event</option>
                    <option value="MAINTENANCE" className="bg-[#08222f] text-white">System Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newAnnounce.priority}
                    onChange={(e) => setNewAnnounce({ ...newAnnounce, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="NORMAL" className="bg-[#08222f] text-white">Normal</option>
                    <option value="URGENT" className="bg-[#08222f] text-white">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Announcement Body
                </label>
                <textarea
                  value={newAnnounce.content}
                  onChange={(e) => setNewAnnounce({ ...newAnnounce, content: e.target.value })}
                  rows={4}
                  placeholder="Write clear company announcement..."
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-[#14425b]">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 border border-[#14425b] bg-[#051720] rounded-xl text-slate-300 hover:bg-[#071c26] hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
