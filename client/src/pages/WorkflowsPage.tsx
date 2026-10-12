import React, { useState, useEffect } from 'react';
import {
  Workflow,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Filter,
  Plus,
  RefreshCw,
  Calendar,
  Send,
  UserX,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const WorkflowsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'delegations' | 'config'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [delegations, setDelegations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionModal, setActionModal] = useState<{
    request: any;
    action: 'APPROVED' | 'REJECTED';
  } | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Delegation form state
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegationForm, setDelegationForm] = useState({
    delegateEmail: 'sarah.jenkins@acmeglobal.com',
    delegateUserId: 'delegate-id',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Out of office for executive summit',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, wfRes, delRes] = await Promise.all([
        apiRequest('/workflows/requests'),
        apiRequest('/workflows'),
        apiRequest('/workflows/delegations'),
      ]);
      setRequests(reqRes?.data || []);
      setWorkflows(wfRes?.data || []);
      setDelegations(delRes?.data || []);
    } catch (err: any) {
      console.error(err);
      setNotificationMsg({ text: err.message || 'Failed to load workflow data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAction = async () => {
    if (!actionModal) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/workflows/requests/${actionModal.request.id}/act`, {
        method: 'POST',
        body: JSON.stringify({
          action: actionModal.action,
          comments,
        }),
      });

      setNotificationMsg({
        text: `Request successfully ${actionModal.action.toLowerCase()}. Multi-step status updated.`,
        type: 'success',
      });
      setActionModal(null);
      setComments('');
      await loadData();
    } catch (err: any) {
      setNotificationMsg({
        text: err.message || 'Failed to execute workflow action',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/workflows/delegations', {
        method: 'POST',
        body: JSON.stringify(delegationForm),
      });
      setShowDelegationModal(false);
      setNotificationMsg({ text: 'Approval delegation registered with tamper-evident audit history.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setNotificationMsg({ text: err.message || 'Failed to register delegation', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeDelegation = async (id: string) => {
    try {
      await apiRequest(`/workflows/delegations/${id}`, { method: 'DELETE' });
      setNotificationMsg({ text: 'Delegation successfully revoked.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setNotificationMsg({ text: err.message || 'Failed to revoke delegation', type: 'error' });
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Operations & Process', to: '/workflows' },
          { label: 'Workflow Automation' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#ff6f32]/10 text-[#ff6f32] border border-[#ff6f32]/30">
              <Workflow size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Enterprise Workflow Automation
              </h1>
              <p className="text-xs text-slate-400">
                Multi-step approval routing, audit-signed actions, and out-of-office delegation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-[#14425b] bg-[#071c26] text-white hover:bg-[#0b2b3c] transition cursor-pointer"
            title="Refresh workflows"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#ff6f32]' : 'text-slate-300'} />
          </button>
          <button
            onClick={() => setShowDelegationModal(true)}
            className="bg-[#071c26] hover:bg-[#0b2b3c] text-white font-semibold text-xs px-3.5 py-2 rounded-xl border border-[#14425b] transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <UserCheck size={14} className="text-[#ff6f32]" />
            <span>Set Delegation</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notificationMsg.type === 'success'
              ? 'bg-[#ff6f32]/10 text-[#ff6f32] border-[#ff6f32]/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          <span>{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)} className="font-bold ml-2 cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#14425b] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 transition border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'border-[#ff6f32] text-[#ff6f32] font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Approval Queue</span>
          <span className="px-2 py-0.5 rounded-full bg-[#051822] text-slate-300 border border-[#14425b] text-[10px]">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delegations')}
          className={`pb-3 transition border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'delegations'
              ? 'border-[#ff6f32] text-[#ff6f32] font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Approval Delegation</span>
          <span className="px-2 py-0.5 rounded-full bg-[#051822] text-slate-300 border border-[#14425b] text-[10px]">
            {delegations.filter((d) => d.isActive).length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 transition border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'config'
              ? 'border-[#ff6f32] text-[#ff6f32] font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Workflow Rules & Routing</span>
          <span className="px-2 py-0.5 rounded-full bg-[#051822] text-slate-300 border border-[#14425b] text-[10px]">
            {workflows.length} Workflows
          </span>
        </button>
      </div>

      {/* TAB 1: APPROVAL REQUESTS QUEUE */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex items-center justify-between bg-[#08222f] p-3.5 rounded-xl border border-[#14425b] text-xs">
            <div className="flex items-center space-x-2">
              <Filter size={14} className="text-[#ff6f32]" />
              <span className="font-semibold text-slate-300">Filter by status:</span>
              <div className="flex space-x-1.5">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#ff6f32] text-white shadow-xs'
                        : 'bg-[#051822] text-slate-300 hover:bg-[#071c26] border border-[#14425b]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-slate-400 text-[11px] font-mono">
              Role: <strong className="text-white">{user?.role}</strong>
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-[#08222f] rounded-2xl border border-[#14425b] p-12 text-center text-slate-400 shadow-xl">
              <Clock size={36} className="text-[#ff6f32] mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-white text-sm">No approval requests in this view</p>
              <p className="text-xs text-slate-400 mt-1">
                New multi-step requests submitted by employees will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#08222f] rounded-2xl border border-[#14425b] p-5 shadow-xl hover:border-[#ff6f32]/40 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#14425b] pb-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {req.workflow?.name || req.entityType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Step {req.currentStepOrder} of {req.totalSteps}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">{req.summary}</h3>
                    <div className="text-xs text-slate-400 mt-1 flex items-center space-x-4">
                      <span>Requester: <strong className="text-slate-200">{req.requesterName}</strong></span>
                      <span>Entity: <strong className="text-slate-200 font-mono">{req.entityType}</strong></span>
                    </div>
                  </div>

                  {/* Step Progress Visualizer */}
                  <div className="bg-[#051720] rounded-xl p-3 border border-[#14425b]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Multi-Stage Approval Hierarchy
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {req.workflow?.steps?.map((step: any, idx: number) => {
                        const isPast = step.stepOrder < req.currentStepOrder || req.status === 'APPROVED';
                        const isCurrent = step.stepOrder === req.currentStepOrder && req.status === 'PENDING';
                        return (
                          <div key={step.id} className="flex items-center space-x-2">
                            <div
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
                                isPast
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : isCurrent
                                  ? 'bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/40 animate-pulse'
                                  : 'bg-[#071c26] text-slate-400 border border-[#14425b]'
                              }`}
                            >
                              <span>Step {step.stepOrder}: {step.approverRole}</span>
                              {isPast && <CheckCircle2 size={12} className="text-emerald-400" />}
                            </div>
                            {idx < req.workflow.steps.length - 1 && (
                              <ArrowRight size={13} className="text-slate-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions History */}
                  {req.actions && req.actions.length > 0 && (
                    <div className="space-y-1 text-xs border-t border-[#14425b] pt-3">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Audit Trail:</div>
                      {req.actions.map((act: any) => (
                        <div key={act.id} className="text-[11px] text-slate-300 flex items-center space-x-2">
                          <span className="font-semibold text-white">{act.actorEmail} ({act.actorRole}):</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#071c26] border border-[#14425b] font-mono text-[10px] text-slate-200">{act.action}</span>
                          {act.comments && <span className="italic text-slate-400">"{act.comments}"</span>}
                          <span className="text-[10px] text-slate-500">
                            at {new Date(act.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons for Pending */}
                  {req.status === 'PENDING' && (
                    <div className="pt-2 flex items-center justify-end space-x-2.5">
                      <button
                        onClick={() => setActionModal({ request: req, action: 'REJECTED' })}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => setActionModal({ request: req, action: 'APPROVED' })}
                        className="px-4 py-1.5 rounded-xl bg-[#ff6f32] hover:bg-[#ea580c] text-white text-xs font-semibold transition flex items-center space-x-1 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Sign & Approve Step</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DELEGATIONS */}
      {activeTab === 'delegations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#08222f] p-4 rounded-xl border border-[#14425b]">
            <div>
              <h3 className="text-sm font-bold text-white">Out-of-Office Approval Delegation</h3>
              <p className="text-xs text-slate-400">
                Grant temporary approval authority to a deputy while maintaining a complete audit trail.
              </p>
            </div>
            <button
              onClick={() => setShowDelegationModal(true)}
              className="bg-[#ff6f32] hover:bg-[#ea580c] text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>New Delegation</span>
            </button>
          </div>

          <div className="bg-[#08222f] rounded-2xl border border-[#14425b] overflow-hidden shadow-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#071c26] border-b border-[#14425b] text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Delegator</th>
                  <th className="p-3.5">Assigned Deputy</th>
                  <th className="p-3.5">Active Period</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14425b]">
                {delegations.map((d) => (
                  <tr key={d.id} className="hover:bg-[#071c26]/60 transition">
                    <td className="p-3.5 font-semibold text-white">{d.delegatorEmail}</td>
                    <td className="p-3.5 text-slate-300">{d.delegateEmail}</td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(d.startDate).toLocaleDateString()} &rarr; {new Date(d.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-slate-300 italic">{d.reason}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}
                      >
                        {d.isActive ? 'ACTIVE' : 'REVOKED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {d.isActive && (
                        <button
                          onClick={() => handleRevokeDelegation(d.id)}
                          className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW RULES CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-[#08222f] rounded-2xl border border-[#14425b] p-5 space-y-3 text-left shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6f32] bg-[#ff6f32]/15 px-2.5 py-0.5 rounded-full border border-[#ff6f32]/30">
                  {wf.workflowType}
                </span>
                <span className="text-xs text-slate-400">
                  {wf._count?.requests || 0} Total Executions
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{wf.name}</h4>

              <div className="bg-[#051720] rounded-xl p-3 border border-[#14425b] space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  Approval Steps Sequence:
                </div>
                {wf.steps?.map((st: any) => (
                  <div key={st.id} className="flex items-center justify-between text-xs text-slate-200 bg-[#08222f] p-2 rounded-lg border border-[#14425b]">
                    <span className="font-bold text-white">Step {st.stepOrder}</span>
                    <span className="text-[#ff6f32] font-semibold font-mono text-[11px]">
                      Role: {st.approverRole}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center space-x-1 pt-1">
                <ShieldCheck size={14} className="text-[#ff6f32]" />
                <span>Prevents unauthorized approvals & duplicate transaction execution.</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl border border-[#14425b]">
            <h3 className="text-base font-bold text-white">
              Confirm Workflow Action: {actionModal.action}
            </h3>
            <p className="text-xs text-slate-300">
              You are signing off as <strong className="text-white">{user?.role}</strong> for step{' '}
              {actionModal.request.currentStepOrder} of {actionModal.request.totalSteps}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reviewer Comments / Audit Notes
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Budget approved, coverage confirmed..."
                className="w-full text-xs p-2.5 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={isSubmitting}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition cursor-pointer shadow-xs ${
                  actionModal.action === 'APPROVED'
                    ? 'bg-[#ff6f32] hover:bg-[#ea580c]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? 'Signing...' : `Confirm ${actionModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delegation Form Modal */}
      {showDelegationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDelegation}
            className="bg-[#08222f] rounded-2xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl border border-[#14425b]"
          >
            <h3 className="text-base font-bold text-white">Register Approval Delegation</h3>
            <p className="text-xs text-slate-400">
              Delegate your approval authority during planned leave. All signed actions will record both you and your delegate.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delegate Email</label>
              <input
                type="email"
                required
                value={delegationForm.delegateEmail}
                onChange={(e) => setDelegationForm({ ...delegationForm, delegateEmail: e.target.value })}
                className="w-full text-xs p-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={delegationForm.startDate}
                  onChange={(e) => setDelegationForm({ ...delegationForm, startDate: e.target.value })}
                  className="w-full text-xs p-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={delegationForm.endDate}
                  onChange={(e) => setDelegationForm({ ...delegationForm, endDate: e.target.value })}
                  className="w-full text-xs p-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reason</label>
              <input
                type="text"
                required
                value={delegationForm.reason}
                onChange={(e) => setDelegationForm({ ...delegationForm, reason: e.target.value })}
                className="w-full text-xs p-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDelegationModal(false)}
                className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Register Delegation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
