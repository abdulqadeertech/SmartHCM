import React, { useEffect, useState } from 'react';
import {
  Clock,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Check,
  X,
  Calendar,
  Timer,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'OVERTIME'>('LOGS');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Correction Request modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    requestedClockIn: '09:00',
    requestedClockOut: '18:00',
    reason: '',
  });

  // Overtime Request modal
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [overtimeForm, setOvertimeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 2,
    reason: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recRes, todayRes, corrRes, otRes] = await Promise.all([
        apiRequest('/attendance'),
        apiRequest('/attendance/today'),
        apiRequest('/attendance/corrections'),
        apiRequest('/attendance/overtime'),
      ]);
      setRecords(recRes?.data || []);
      setTodayAttendance(todayRes?.data || null);
      setCorrections(corrRes?.data || []);
      setOvertimeRequests(otRes?.data || []);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleClockIn = async () => {
    setActionMessage(null);
    try {
      const res = await apiRequest('/attendance/clock-in', { method: 'POST' });
      setTodayAttendance(res?.data || null);
      setActionMessage('Clocked in successfully!');
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error clocking in');
    }
  };

  const handleClockOut = async () => {
    setActionMessage(null);
    try {
      const res = await apiRequest('/attendance/clock-out', { method: 'POST' });
      setTodayAttendance(res?.data || null);
      setActionMessage('Clocked out successfully!');
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error clocking out');
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseDate = correctionForm.date;
      const clockInIso = new Date(`${baseDate}T${correctionForm.requestedClockIn}:00`).toISOString();
      const clockOutIso = new Date(`${baseDate}T${correctionForm.requestedClockOut}:00`).toISOString();

      await apiRequest('/attendance/corrections', {
        method: 'POST',
        body: JSON.stringify({
          date: new Date(baseDate).toISOString(),
          requestedClockIn: clockInIso,
          requestedClockOut: clockOutIso,
          reason: correctionForm.reason,
        }),
      });

      setShowCorrectionModal(false);
      setActionMessage('Correction request submitted for review');
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to submit correction');
    }
  };

  const handleReviewCorrection = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(`/attendance/corrections/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          reviewerNotes: `Reviewed by ${user?.firstName}`,
        }),
      });
      setActionMessage(`Correction ${status.toLowerCase()} successfully`);
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to review correction');
    }
  };

  const handleOvertimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/attendance/overtime', {
        method: 'POST',
        body: JSON.stringify({
          date: new Date(overtimeForm.date).toISOString(),
          hours: Number(overtimeForm.hours),
          reason: overtimeForm.reason,
        }),
      });

      setShowOvertimeModal(false);
      setOvertimeForm({ date: new Date().toISOString().split('T')[0], hours: 2, reason: '' });
      setActionMessage('Overtime request submitted for review');
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to submit overtime request');
    }
  };

  const handleReviewOvertime = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(`/attendance/overtime/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          reviewerNotes: `Reviewed by ${user?.firstName}`,
        }),
      });
      setActionMessage(`Overtime request ${status.toLowerCase()} successfully`);
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to review overtime request');
    }
  };

  const isManagerOrHr =
    user?.isSuperAdmin ||
    ['ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER', 'DEPT_MANAGER'].includes(user?.role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Time & Operations', to: '/attendance' },
          { label: 'Biometric Attendance' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Clock className="text-[#ff6f32]" size={22} />
            <span>Time Office & Attendance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric punch tracking, shifts, late marks, overtime, and attendance adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOvertimeModal(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#051720] hover:bg-[#071c26] text-white border border-[#14425b] hover:border-[#ff6f32]/50 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Timer size={14} className="text-[#ff6f32]" />
            <span>Request Overtime</span>
          </button>
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <FileEdit size={14} />
            <span>Request Attendance Correction</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Clock-in Terminal Card */}
      <div className="bg-[#08222f] rounded-2xl p-6 border border-[#14425b] shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-[#051720] border border-[#14425b] flex items-center justify-center text-[#ff6f32] shadow-xs">
            <Clock size={32} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Shift: Standard Day (09:00 - 18:00)
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {todayAttendance?.clockIn ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 size={18} />
                  <span>Clocked In at {new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              ) : (
                <span className="text-slate-300">Not Clocked In Today</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Grace Period: 15 minutes | Overtime Threshold: 9.0 hrs
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!todayAttendance?.clockIn ? (
            <button
              onClick={handleClockIn}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Play size={16} />
              <span>Punch Clock In</span>
            </button>
          ) : !todayAttendance?.clockOut ? (
            <button
              onClick={handleClockOut}
              className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Square size={16} />
              <span>Punch Clock Out</span>
            </button>
          ) : (
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 rounded-xl flex items-center space-x-2">
              <CheckCircle2 size={16} />
              <span>Shift Complete ({todayAttendance.totalHours} hrs worked)</span>
            </div>
          )}
        </div>
      </div>

      {/* Pending Corrections (for managers) */}
      {corrections.filter((c) => c.status === 'PENDING').length > 0 && isManagerOrHr && (
        <div className="bg-[#08222f] border border-[#14425b] rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-[#ff6f32] text-xs uppercase tracking-wider mb-3 flex items-center space-x-2">
            <AlertCircle size={15} />
            <span>Pending Attendance Correction Requests</span>
          </h3>

          <div className="space-y-2">
            {corrections
              .filter((c) => c.status === 'PENDING')
              .map((corr) => (
                <div
                  key={corr.id}
                  className="bg-[#051720] p-3.5 rounded-xl border border-[#14425b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {corr.employee.firstName} {corr.employee.lastName} ({corr.employee.employeeCode})
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Date: <span className="font-medium text-slate-200">{new Date(corr.date).toLocaleDateString()}</span> | Reason: "{corr.reason}"
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReviewCorrection(corr.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReviewCorrection(corr.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pending Overtime (for managers) */}
      {overtimeRequests.filter((o) => o.status === 'PENDING').length > 0 && isManagerOrHr && (
        <div className="bg-[#08222f] border border-[#14425b] rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-[#ff6f32] text-xs uppercase tracking-wider mb-3 flex items-center space-x-2">
            <Timer size={15} />
            <span>Pending Overtime Requests</span>
          </h3>

          <div className="space-y-2">
            {overtimeRequests
              .filter((o) => o.status === 'PENDING')
              .map((ot) => (
                <div
                  key={ot.id}
                  className="bg-[#051720] p-3.5 rounded-xl border border-[#14425b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {ot.employee.firstName} {ot.employee.lastName} ({ot.employee.employeeCode})
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Date: <span className="font-medium text-slate-200">{new Date(ot.date).toLocaleDateString()}</span> | Requested:{' '}
                      <span className="text-[#ff6f32] font-semibold">{ot.hours} hrs</span> | Reason: "{ot.reason}"
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReviewOvertime(ot.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReviewOvertime(ot.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#14425b] pb-2">
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'LOGS'
              ? 'bg-[#ff6f32] text-white'
              : 'bg-[#08222f] text-slate-400 hover:text-white border border-[#14425b]'
          }`}
        >
          <Clock size={14} />
          <span>Attendance Logs ({records.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('OVERTIME')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'OVERTIME'
              ? 'bg-[#ff6f32] text-white'
              : 'bg-[#08222f] text-slate-400 hover:text-white border border-[#14425b]'
          }`}
        >
          <Timer size={14} />
          <span>Overtime Records ({overtimeRequests.length})</span>
        </button>
      </div>

      {/* Content depending on tab */}
      {activeTab === 'LOGS' ? (
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#14425b] bg-[#071c26] flex items-center justify-between">
            <h2 className="font-bold text-white text-xs uppercase tracking-wider">Attendance Logs</h2>
            <span className="text-[11px] text-slate-400 font-medium">Auto-synced with biometric records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-4">Total Hours</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Late Marks</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14425b]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-[#071c26] transition">
                      <td className="py-3 px-4 font-medium text-white">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {r.employee?.firstName} {r.employee?.lastName}
                        </div>
                        <div className="text-[10px] text-[#ff6f32] font-mono">{r.employee?.employeeCode}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {r.totalHours ? `${r.totalHours} hrs` : '0 hrs'}
                      </td>
                      <td className="py-3 px-4">
                        {r.overtimeMinutes > 0 ? (
                          <span className="text-[#ff6f32] font-semibold bg-[#ff6f32]/10 border border-[#ff6f32]/30 px-2 py-0.5 rounded text-[10px]">
                            {(r.overtimeMinutes / 60).toFixed(1)} hrs
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {r.lateMinutes > 0 ? (
                          <span className="text-amber-300 font-semibold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 text-[10px]">
                            +{r.lateMinutes} mins late
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">On time</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : r.status === 'HALF_DAY'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : r.status === 'ON_LEAVE'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-[#051720] text-slate-300 border border-[#14425b]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#14425b] bg-[#071c26] flex items-center justify-between">
            <h2 className="font-bold text-white text-xs uppercase tracking-wider">Overtime Requests</h2>
            <span className="text-[11px] text-slate-400 font-medium">Approved hours directly feed into payroll</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reviewer Note</th>
                  {isManagerOrHr && <th className="py-3 px-4">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14425b]">
                {isLoading ? (
                  <tr>
                    <td colSpan={isManagerOrHr ? 7 : 6} className="text-center py-8 text-slate-400">
                      Loading overtime requests...
                    </td>
                  </tr>
                ) : overtimeRequests.length === 0 ? (
                  <tr>
                    <td colSpan={isManagerOrHr ? 7 : 6} className="text-center py-8 text-slate-400">
                      No overtime requests recorded.
                    </td>
                  </tr>
                ) : (
                  overtimeRequests.map((ot) => (
                    <tr key={ot.id} className="hover:bg-[#071c26] transition">
                      <td className="py-3 px-4 font-medium text-white">
                        {new Date(ot.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {ot.employee?.firstName} {ot.employee?.lastName}
                        </div>
                        <div className="text-[10px] text-[#ff6f32] font-mono">{ot.employee?.employeeCode}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#ff6f32]">
                        {ot.hours} hrs
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={ot.reason}>
                        {ot.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ot.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : ot.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {ot.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {ot.reviewerNotes || '—'}
                      </td>
                      {isManagerOrHr && (
                        <td className="py-3 px-4">
                          {ot.status === 'PENDING' ? (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleReviewOvertime(ot.id, 'APPROVED')}
                                className="px-2.5 py-1 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded font-bold text-[10px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewOvertime(ot.id, 'REJECTED')}
                                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded font-semibold text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Completed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Attendance Correction Request</h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Date *</label>
                <input
                  type="date"
                  required
                  value={correctionForm.date}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Clock In Time *</label>
                  <input
                    type="time"
                    required
                    value={correctionForm.requestedClockIn}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, requestedClockIn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Clock Out Time *</label>
                  <input
                    type="time"
                    required
                    value={correctionForm.requestedClockOut}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, requestedClockOut: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reason for Missed / Incorrect Punch *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Biometric sensor failure at reception / External client meeting"
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 border border-[#14425b] bg-[#051720] rounded-lg text-slate-300 hover:text-white hover:bg-[#071c26] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overtime Request Modal */}
      {showOvertimeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Timer size={16} className="text-[#ff6f32]" />
                <span>Request Overtime Hours</span>
              </h3>
              <button onClick={() => setShowOvertimeModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOvertimeSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Overtime Date *</label>
                <input
                  type="date"
                  required
                  value={overtimeForm.date}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Number of Hours *</label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  required
                  value={overtimeForm.hours}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Upon approval, hours will automatically calculate into monthly payroll at standard 1.5x rate.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Business Reason / Project Task *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Weekend deployment support / Critical payroll closing"
                  value={overtimeForm.reason}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOvertimeModal(false)}
                  className="px-4 py-2 border border-[#14425b] bg-[#051720] rounded-lg text-slate-300 hover:text-white hover:bg-[#071c26] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Submit Overtime Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
