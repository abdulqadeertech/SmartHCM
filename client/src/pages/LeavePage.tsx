import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const LeavePage: React.FC = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isHalfDay: false,
    reason: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [balRes, typeRes, reqRes] = await Promise.all([
        apiRequest('/leaves/balances'),
        apiRequest('/leaves/types'),
        apiRequest('/leaves/requests'),
      ]);
      setBalances(balRes?.data || []);
      setTypes(typeRes?.data || []);
      setRequests(reqRes?.data || []);
      if (Array.isArray(typeRes?.data) && typeRes.data.length > 0 && !form.leaveTypeId) {
        setForm((prev) => ({ ...prev, leaveTypeId: typeRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load leave data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setActionMessage(null);

    try {
      await apiRequest('/leaves/requests', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setShowApplyModal(false);
      setActionMessage('Leave request submitted successfully!');
      setForm({
        leaveTypeId: types[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        isHalfDay: false,
        reason: '',
      });
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit leave request');
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionMessage(null);
    try {
      await apiRequest(`/leaves/requests/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          reviewerNotes: `Reviewed by ${user?.firstName}`,
        }),
      });
      setActionMessage(`Leave request ${status.toLowerCase()} successfully`);
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to review request');
    }
  };

  const isManagerOrHr =
    user?.isSuperAdmin ||
    ['ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER', 'DEPT_MANAGER'].includes(user?.role || '');

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Time & Operations', to: '/attendance' },
          { label: 'Leave Management' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <CalendarCheck className="text-[#ff6f32]" size={22} />
            <span>Leave Management & Approvals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statutory leave entitlements, holiday calendar calculations, and manager approval queues.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map((b) => {
          const percent = b.allocatedDays > 0 ? (b.remainingDays / b.allocatedDays) * 100 : 0;
          return (
            <div
              key={b.id}
              className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{b.leaveType.name}</span>
                  <span className="font-mono text-[10px] bg-[#051720] border border-[#14425b] text-[#ff6f32] px-1.5 py-0.5 rounded">
                    {b.leaveType.code}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-extrabold text-[#ff6f32]">{b.remainingDays}</span>
                  <span className="text-xs text-slate-400">/ {b.allocatedDays} days left</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-[#051720] border border-[#14425b] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ff6f32] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>Used: {b.usedDays} days</span>
                  <span>Pending: {b.pendingDays} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Approvals Section for Managers */}
      {isManagerOrHr && pendingRequests.length > 0 && (
        <div className="bg-[#08222f] border border-[#14425b] rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-[#ff6f32] text-xs uppercase tracking-wider mb-3 flex items-center space-x-2">
            <Clock size={15} />
            <span>Pending Leave Requests Requiring Authorization ({pendingRequests.length})</span>
          </h3>

          <div className="space-y-2.5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#051720] p-4 rounded-xl border border-[#14425b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">
                    {req.employee.firstName} {req.employee.lastName} ({req.employee.employeeCode})
                  </div>
                  <div className="text-slate-300 mt-0.5">
                    <span className="font-semibold text-[#ff6f32]">{req.leaveType.name}</span>: {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()} ({req.totalDays} days)
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Reason: "{req.reason}"
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleReview(req.id, 'APPROVED')}
                    className="px-3.5 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReview(req.id, 'REJECTED')}
                    className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer"
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

      {/* Leave History Table */}
      <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#14425b] bg-[#071c26] flex items-center justify-between">
          <h2 className="font-bold text-white text-xs uppercase tracking-wider">Leave Applications History</h2>
          <span className="text-[11px] text-slate-400">{requests.length} Total records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14425b]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No leave requests on record.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#071c26] transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      {r.employee.firstName} {r.employee.lastName}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {r.leaveType.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(r.startDate).toLocaleDateString()} — {new Date(r.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {r.totalDays} {r.isHalfDay ? '(Half Day)' : 'days'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3 py-2 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle size={15} className="text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Leave Category *</label>
                <select
                  required
                  value={form.leaveTypeId}
                  onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#08222f] text-white">
                      {t.name} ({t.daysAllowed} days statutory)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={form.isHalfDay}
                  onChange={(e) => setForm({ ...form, isHalfDay: e.target.checked })}
                  className="rounded text-[#ff6f32] focus:ring-[#ff6f32] bg-[#051822] border-[#14425b]"
                />
                <label htmlFor="halfDay" className="text-slate-300 font-medium">
                  Half-day leave
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reason for Absence *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the purpose of your leave..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-[#14425b] bg-[#051720] rounded-lg text-slate-300 hover:text-white hover:bg-[#071c26] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
