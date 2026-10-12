import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Play,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Printer,
  Download,
  ShieldCheck,
  Globe,
  History,
  Eye,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();
  const isPayrollOrHr =
    user?.isSuperAdmin ||
    ['ORG_ADMIN', 'HR_DIRECTOR', 'PAYROLL_MANAGER', 'AUDITOR', 'PLATFORM_SUPER_ADMIN'].includes(user?.role || '');

  const [activeTab, setActiveTab] = useState<'runs' | 'simulate' | 'policies' | 'history' | 'my-payslips'>(
    isPayrollOrHr ? 'runs' : 'my-payslips'
  );

  const [runs, setRuns] = useState<any[]>([]);
  const [myPayslips, setMyPayslips] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Payroll Run Modal
  const [showRunModal, setShowRunModal] = useState(false);
  const [runMonth, setRunMonth] = useState('11');
  const [runYear, setRunYear] = useState('2026');
  const [isProcessing, setIsProcessing] = useState(false);

  // Smart Pre-Check State
  const [showPrecheckModal, setShowPrecheckModal] = useState(false);
  const [precheckData, setPrecheckData] = useState<any | null>(null);
  const [isPrechecking, setIsPrechecking] = useState(false);

  const runPrecheck = async (m: string, y: string) => {
    setIsPrechecking(true);
    try {
      const res = await apiRequest(`/payroll/precheck?month=${m}&year=${y}`);
      setPrecheckData(res?.data || null);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Pre-check failed' });
    } finally {
      setIsPrechecking(false);
    }
  };

  // Simulation State
  const [simMonth, setSimMonth] = useState('11');
  const [simYear, setSimYear] = useState('2026');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Country Policies State
  const [policies, setPolicies] = useState<any[]>([]);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    country: 'United States',
    taxYear: 2026,
    socialSecurityRate: 6.2,
    medicareRate: 1.45,
    pensionEmployerRate: 5.0,
    statutoryLeaves: 20,
    allowancesEnabled: true,
  });

  // Salary History State
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionForm, setRevisionForm] = useState({
    employeeId: '',
    newBaseSalary: 0,
    reason: 'Annual Performance Appraisal',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isPayrollOrHr && activeTab !== 'my-payslips') {
      setActiveTab('my-payslips');
    }
  }, [isPayrollOrHr]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isPayrollOrHr) {
        const [runsRes, polRes, empRes] = await Promise.all([
          apiRequest('/payroll/runs'),
          apiRequest('/payroll/country-policies'),
          apiRequest('/employees'),
        ]);
        setRuns(runsRes?.data || []);
        setPolicies(polRes?.data || []);
        setEmployees(empRes?.data || []);
        if (Array.isArray(empRes?.data) && empRes.data.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(empRes.data[0].id);
        }
      }
      const myRes = await apiRequest('/payroll/my-payslips');
      setMyPayslips(myRes?.data || []);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedEmployeeId && isPayrollOrHr) {
      apiRequest(`/payroll/salary-history/${selectedEmployeeId}`)
        .then((res) => setSalaryHistory(res?.data || []))
        .catch((err) => console.error('Failed to load salary history:', err));
    }
  }, [selectedEmployeeId]);

  const handleProcessRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setActionMessage(null);

    try {
      const res = await apiRequest('/payroll/runs', {
        method: 'POST',
        body: JSON.stringify({ month: runMonth, year: runYear }),
      });

      setShowRunModal(false);
      setActionMessage({ type: 'success', text: `Payroll run initialized for ${runMonth}/${runYear}` });
      loadData();
      if (res?.data?.id) {
        handleViewRun(res.data.id);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to process payroll' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setActionMessage(null);
    try {
      const res = await apiRequest('/payroll/simulate', {
        method: 'POST',
        body: JSON.stringify({ month: simMonth, year: simYear }),
      });
      setSimResult(res?.data || null);
      setActionMessage({ type: 'success', text: `Simulation generated for ${simMonth}/${simYear} with zero database mutations.` });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Simulation failed' });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCommitSimulatedRun = async () => {
    if (!simResult) return;
    try {
      const res = await apiRequest('/payroll/runs', {
        method: 'POST',
        body: JSON.stringify({ month: simResult.periodMonth, year: simResult.periodYear }),
      });
      setActionMessage({ type: 'success', text: `Payroll run committed successfully as ${res?.data?.status || 'PROCESSED'} for ${simResult.periodMonth}/${simResult.periodYear}` });
      setActiveTab('runs');
      loadData();
      if (res?.data?.id) {
        handleViewRun(res.data.id);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to commit payroll run' });
    }
  };

  const handleUpdateStatus = async (runId: string, newStatus: string) => {
    try {
      await apiRequest(`/payroll/runs/${runId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setActionMessage({ type: 'success', text: `Payroll run updated to stage: ${newStatus}` });
      loadData();
      if (selectedRun?.id === runId) {
        handleViewRun(runId);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to transition payroll status' });
    }
  };

  const handleFinalizeRun = async (runId: string) => {
    if (!window.confirm('Are you sure you want to finalize this payroll run? Once finalized, it is locked.')) return;

    try {
      await apiRequest(`/payroll/runs/${runId}/finalize`, { method: 'POST' });
      setActionMessage({ type: 'success', text: 'Payroll run finalized and payslips published.' });
      loadData();
      if (selectedRun?.id === runId) {
        handleViewRun(runId);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to finalize run' });
    }
  };

  const handleExportCsv = async (runId: string, period: string) => {
    try {
      const res = await apiRequest(`/payroll/export/${runId}`);
      const csvData = res?.data?.csv || '';
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvData);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `payroll_${period.replace('/', '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to export CSV' });
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/payroll/country-policies', {
        method: 'POST',
        body: JSON.stringify(policyForm),
      });
      setShowPolicyModal(false);
      setActionMessage({ type: 'success', text: `Statutory policy saved for ${policyForm.country}` });
      const pRes = await apiRequest('/payroll/country-policies');
      setPolicies(pRes?.data || []);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to save policy' });
    }
  };

  const handleRecordRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/payroll/salary-history', {
        method: 'POST',
        body: JSON.stringify({
          ...revisionForm,
          employeeId: selectedEmployeeId,
          newBaseSalary: Number(revisionForm.newBaseSalary),
        }),
      });
      setShowRevisionModal(false);
      setActionMessage({ type: 'success', text: 'Salary revision recorded successfully.' });
      const histRes = await apiRequest(`/payroll/salary-history/${selectedEmployeeId}`);
      setSalaryHistory(histRes?.data || []);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to record salary revision' });
    }
  };

  const handleViewRun = async (runId: string) => {
    try {
      const res = await apiRequest(`/payroll/runs/${runId}`);
      setSelectedRun(res?.data || null);
    } catch (err) {
      console.error('Failed to load run details:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Compensation', to: '/payroll' },
          { label: 'Payroll & Tax Engine' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <CreditCard className="text-[#ff6f32]" size={24} />
            <span>Advanced Payroll & Statutory Compensation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            4-Stage lifecycle (Draft &rarr; Reviewed &rarr; Approved &rarr; Paid), dry-run simulation, country policies, and salary revision auditing.
          </p>
        </div>

        {isPayrollOrHr && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setShowPrecheckModal(true);
                runPrecheck(runMonth, runYear);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#051720] hover:bg-[#071c26] text-slate-200 border border-[#14425b] hover:border-[#ff6f32]/40 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <ShieldCheck size={14} className="text-[#ff6f32]" />
              <span>Smart Pre-Check</span>
            </button>
            <button
              onClick={() => setActiveTab('simulate')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#071c26] hover:bg-[#0b2b3c] text-slate-200 border border-[#14425b] rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Eye size={14} className="text-[#ff6f32]" />
              <span>Dry-Run Simulation</span>
            </button>
            <button
              onClick={() => setShowRunModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Play size={14} />
              <span>Calculate New Run</span>
            </button>
          </div>
        )}
      </div>

      {actionMessage && (
        <div
          className={`px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 border ${
            actionMessage.type === 'success'
              ? 'bg-[#ff6f32]/10 border-[#ff6f32]/30 text-[#ff6f32]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-[#ff6f32] shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#14425b] space-x-1 text-xs font-semibold">
        {isPayrollOrHr && (
          <>
            <button
              onClick={() => setActiveTab('runs')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition ${
                activeTab === 'runs'
                  ? 'border-[#ff6f32] text-[#ff6f32] bg-[#ff6f32]/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-[#071c26]'
              }`}
            >
              <CreditCard size={15} />
              <span>Payroll Periods & Lifecycle ({runs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulate')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition ${
                activeTab === 'simulate'
                  ? 'border-[#ff6f32] text-[#ff6f32] bg-[#ff6f32]/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-[#071c26]'
              }`}
            >
              <Eye size={15} />
              <span>Pre-Run Simulation Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition ${
                activeTab === 'policies'
                  ? 'border-[#ff6f32] text-[#ff6f32] bg-[#ff6f32]/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-[#071c26]'
              }`}
            >
              <Globe size={15} />
              <span>Country Statutory Policies ({policies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-[#ff6f32] text-[#ff6f32] bg-[#ff6f32]/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-[#071c26]'
              }`}
            >
              <History size={15} />
              <span>Salary Revision History</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('my-payslips')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition ${
            activeTab === 'my-payslips'
              ? 'border-[#ff6f32] text-[#ff6f32] bg-[#ff6f32]/10'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-[#071c26]'
          }`}
        >
          <FileText size={15} />
          <span>My Payslips ({myPayslips.length})</span>
        </button>
      </div>

      {/* Tab 1: Runs & 4-Stage Lifecycle */}
      {activeTab === 'runs' && isPayrollOrHr && (
        <div className="space-y-6">
          <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#14425b] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-xs uppercase tracking-wider">
                  Organization Compensation Ledger
                </h2>
                <p className="text-[11px] text-slate-400">
                  Separation of responsibilities: Draft &rarr; Reviewed &rarr; Approved &rarr; Paid
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Gross Total</th>
                    <th className="py-3 px-4">Deductions (Tax/PF)</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Current Lifecycle Stage</th>
                    <th className="py-3 px-4 text-right">Stage Controls & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14425b]">
                  {runs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No payroll runs created yet. Use "Dry-Run Simulation" or "Calculate New Run" to start.
                      </td>
                    </tr>
                  ) : (
                    runs.map((r) => {
                      const isLocked = r.status === 'FINALIZED' || r.status === 'PAID';
                      return (
                        <tr key={r.id} className="hover:bg-[#071c26]/60 transition">
                          <td className="py-3 px-4 font-bold text-white">
                            {r.periodMonth}/{r.periodYear}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            ${r.totalGross?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-rose-400 font-semibold">
                            -${r.totalDeductions?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-[#ff6f32]">
                            ${r.totalNet?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'PAID' || r.status === 'FINALIZED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : r.status === 'APPROVED'
                                  ? 'bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/40'
                                  : r.status === 'REVIEWED'
                                  ? 'bg-slate-700/50 text-slate-200 border border-slate-600'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleViewRun(r.id)}
                              className="px-2.5 py-1 text-slate-300 hover:text-white bg-[#051822] hover:bg-[#0b2b3c] border border-[#14425b] rounded font-semibold transition"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleExportCsv(r.id, `${r.periodMonth}_${r.periodYear}`)}
                              className="px-2 py-1 text-slate-300 hover:text-white bg-[#051822] hover:bg-[#0b2b3c] border border-[#14425b] rounded font-semibold transition"
                              title="Export CSV"
                            >
                              <Download size={13} className="inline mr-1 text-[#ff6f32]" />
                              CSV
                            </button>

                            {/* Stage Transition Controls */}
                            {r.status === 'DRAFT' && (
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'REVIEWED')}
                                className="px-2.5 py-1 text-white bg-[#071c26] hover:bg-[#0b2b3c] border border-[#14425b] rounded font-semibold transition"
                              >
                                Mark Reviewed
                              </button>
                            )}
                            {r.status === 'REVIEWED' && (
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                className="px-2.5 py-1 text-[#ff6f32] bg-[#ff6f32]/15 hover:bg-[#ff6f32]/25 border border-[#ff6f32]/40 rounded font-semibold transition"
                              >
                                Approve Run
                              </button>
                            )}
                            {r.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'PAID')}
                                className="px-2.5 py-1 text-white bg-[#ff6f32] hover:bg-[#ea580c] rounded font-semibold transition"
                              >
                                Disburse (Paid)
                              </button>
                            )}
                            {!isLocked && (
                              <button
                                onClick={() => handleFinalizeRun(r.id)}
                                className="px-2 py-1 text-slate-300 hover:text-white bg-[#051822] hover:bg-[#071c26] border border-[#14425b] rounded text-[11px] font-medium"
                              >
                                Finalize & Lock
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Selected Run Breakdown */}
          {selectedRun && (
            <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Payroll Breakdown: Period {selectedRun.periodMonth}/{selectedRun.periodYear}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated for {selectedRun.payslips?.length || 0} employees under status{' '}
                    <span className="font-bold text-[#ff6f32]">{selectedRun.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#071c26] text-slate-400 uppercase font-semibold border-b border-[#14425b]">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Base Salary</th>
                      <th className="py-2.5 px-3">Overtime Pay</th>
                      <th className="py-2.5 px-3">Allowances</th>
                      <th className="py-2.5 px-3">Tax & PF Deductions</th>
                      <th className="py-2.5 px-3 font-bold text-white">Net Disbursed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14425b]">
                    {selectedRun.payslips?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-[#071c26]/70">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {p.employee?.firstName} {p.employee?.lastName}
                          <span className="block text-[10px] font-normal text-slate-400 font-mono">
                            {p.employee?.employeeCode || p.employee?.employeeId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {p.employee?.department?.name || 'General'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">${p.grossSalary?.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-[#ff6f32] font-medium">
                          {p.overtimePay > 0 ? `+$${p.overtimePay.toLocaleString()}` : '$0'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-medium">
                          +${p.allowances?.toLocaleString() || '0'}
                        </td>
                        <td className="py-2.5 px-3 text-rose-400 font-medium">
                          -${p.deductions?.toLocaleString() || '0'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#ff6f32]">${p.netSalary?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pre-Run Simulation Engine */}
      {activeTab === 'simulate' && isPayrollOrHr && (
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14425b]">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Eye className="text-[#ff6f32]" size={18} />
                <span>Simulation & Pre-Approval Dry-Run Engine</span>
              </h2>
              <p className="text-xs text-slate-400">
                Execute mathematical payroll verification without mutating the organization ledger or generating locked records.
              </p>
            </div>

            <form onSubmit={handleRunSimulation} className="flex items-center space-x-2 text-xs">
              <select
                value={simMonth}
                onChange={(e) => setSimMonth(e.target.value)}
                className="px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] font-semibold"
              >
                <option value="10" className="bg-[#08222f] text-white">Month 10 (Oct)</option>
                <option value="11" className="bg-[#08222f] text-white">Month 11 (Nov)</option>
                <option value="12" className="bg-[#08222f] text-white">Month 12 (Dec)</option>
              </select>
              <select
                value={simYear}
                onChange={(e) => setSimYear(e.target.value)}
                className="px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] font-semibold"
              >
                <option value="2026" className="bg-[#08222f] text-white">2026</option>
                <option value="2027" className="bg-[#08222f] text-white">2027</option>
              </select>
              <button
                type="submit"
                disabled={isSimulating}
                className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white font-semibold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Play size={14} />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
              </button>
            </form>
          </div>

          {simResult && (
            <div className="space-y-5">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-[#051720] rounded-xl border border-[#14425b]">
                  <span className="text-slate-400 font-medium">Simulated Employees</span>
                  <div className="text-xl font-bold text-white mt-1">{simResult.employeeCount} Staff</div>
                </div>
                <div className="p-4 bg-[#051720] rounded-xl border border-[#14425b]">
                  <span className="text-slate-400 font-medium">Estimated Gross Total</span>
                  <div className="text-xl font-bold text-white mt-1">
                    ${simResult.totalGross?.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-[#051720] rounded-xl border border-[#14425b]">
                  <span className="text-slate-400 font-medium">Total Statutory Deductions</span>
                  <div className="text-xl font-bold text-rose-400 mt-1">
                    -${simResult.totalDeductions?.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-[#ff6f32]/10 rounded-xl border border-[#ff6f32]/30">
                  <span className="text-[#ff6f32] font-medium">Net Estimated Payout</span>
                  <div className="text-xl font-bold text-[#ff6f32] mt-1">
                    ${simResult.totalNet?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Simulation Table */}
              <div className="overflow-x-auto border border-[#14425b] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#071c26] text-slate-400 uppercase font-semibold border-b border-[#14425b]">
                      <th className="py-2.5 px-3">Employee Name</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Base Compensation</th>
                      <th className="py-2.5 px-3">Allowances</th>
                      <th className="py-2.5 px-3">Tax Withholding</th>
                      <th className="py-2.5 px-3">Simulated Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14425b]">
                    {simResult.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#071c26]/60">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {item.employeeName}
                          <span className="block text-[10px] text-slate-400 font-mono">{item.employeeCode}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{item.department}</td>
                        <td className="py-2.5 px-3 text-slate-200">${item.grossSalary?.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-[#ff6f32]">+${item.allowances?.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-rose-400">-${item.deductions?.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-bold text-[#ff6f32]">${item.netSalary?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCommitSimulatedRun}
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Commit Simulation as Draft Payroll Run</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Country Statutory Policies */}
      {activeTab === 'policies' && isPayrollOrHr && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Country-Specific Statutory Payroll Rules</h2>
              <p className="text-xs text-slate-400">
                Configurable labor regulations, social security withholding and annual statutory leave days.
              </p>
            </div>
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center space-x-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus size={14} />
              <span>Configure Statutory Policy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {policies.map((p) => (
              <div key={p.id} className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{p.country}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Tax Year: {p.taxYear}</span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-[#ff6f32]/10 text-[#ff6f32] flex items-center justify-center">
                    <Globe size={16} />
                  </div>
                </div>

                <div className="bg-[#051720] p-3 rounded-xl space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Social Security:</span>
                    <span className="font-bold text-white">{p.socialSecurityRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Medicare/Health:</span>
                    <span className="font-bold text-white">{p.medicareRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pension/Gratuity:</span>
                    <span className="font-bold text-white">{p.pensionEmployerRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statutory Leave:</span>
                    <span className="font-bold text-emerald-400">{p.statutoryLeaves} Days/Year</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Policy Modal */}
          {showPolicyModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#08222f] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#14425b]">
                <h3 className="text-base font-bold text-white mb-4">Configure Country Payroll Policy</h3>
                <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Country Jurisdiction</label>
                    <input
                      type="text"
                      value={policyForm.country}
                      onChange={(e) => setPolicyForm({ ...policyForm, country: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Tax Year</label>
                      <input
                        type="number"
                        value={policyForm.taxYear}
                        onChange={(e) => setPolicyForm({ ...policyForm, taxYear: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Social Security (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={policyForm.socialSecurityRate}
                        onChange={(e) => setPolicyForm({ ...policyForm, socialSecurityRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Medicare / Health (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={policyForm.medicareRate}
                        onChange={(e) => setPolicyForm({ ...policyForm, medicareRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Statutory Leave Days</label>
                      <input
                        type="number"
                        value={policyForm.statutoryLeaves}
                        onChange={(e) => setPolicyForm({ ...policyForm, statutoryLeaves: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t border-[#14425b]">
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal(false)}
                      className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                    >
                      Save Policy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Salary Revision History */}
      {activeTab === 'history' && isPayrollOrHr && (
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#14425b]">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <History className="text-[#ff6f32]" size={18} />
                <span>Salary Revision & Compensation Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-400">
                Track full compensation history, increment percentages, and justification reasons.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] font-semibold"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id} className="bg-[#08222f] text-white">
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setRevisionForm({
                    employeeId: selectedEmployeeId,
                    newBaseSalary: 0,
                    reason: 'Annual Performance Appraisal',
                    effectiveDate: new Date().toISOString().split('T')[0],
                  });
                  setShowRevisionModal(true);
                }}
                className="px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white font-semibold rounded-xl shadow-xs transition flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Record Revision</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {salaryHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No salary revisions logged for this employee yet. Click "Record Revision" to record one.
              </div>
            ) : (
              <div className="divide-y divide-[#14425b] border border-[#14425b] rounded-xl overflow-hidden">
                {salaryHistory.map((rev) => (
                  <div key={rev.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#071c26]/70">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">${rev.newBaseSalary?.toLocaleString()}</span>
                        {rev.oldBaseSalary && (
                          <span className="text-[11px] text-slate-500 line-through">
                            ${rev.oldBaseSalary?.toLocaleString()}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30">
                          +{rev.incrementPercentage}%
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <strong className="text-slate-300">Reason:</strong> {rev.reason}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <div>Effective: {new Date(rev.effectiveDate).toLocaleDateString()}</div>
                      <div>Logged: {new Date(rev.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision Modal */}
          {showRevisionModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#08222f] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#14425b]">
                <h3 className="text-base font-bold text-white mb-4">Record Salary Revision</h3>
                <form onSubmit={handleRecordRevision} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">New Base Salary ($)</label>
                    <input
                      type="number"
                      value={revisionForm.newBaseSalary}
                      onChange={(e) => setRevisionForm({ ...revisionForm, newBaseSalary: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] font-bold text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={revisionForm.effectiveDate}
                      onChange={(e) => setRevisionForm({ ...revisionForm, effectiveDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Adjustment Justification</label>
                    <input
                      type="text"
                      value={revisionForm.reason}
                      onChange={(e) => setRevisionForm({ ...revisionForm, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t border-[#14425b]">
                    <button
                      type="button"
                      onClick={() => setShowRevisionModal(false)}
                      className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                    >
                      Record Revision
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: My Payslips */}
      {activeTab === 'my-payslips' && (
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
            <div>
              <h2 className="text-sm font-bold text-white">Personal Payslip Archives</h2>
              <p className="text-xs text-slate-400">Official monthly compensation receipts and tax breakdowns</p>
            </div>
          </div>

          <div className="space-y-3">
            {myPayslips.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No personal payslips published yet for your employee account.
              </div>
            ) : (
              myPayslips.map((ps) => (
                <div
                  key={ps.id}
                  className="p-4 rounded-xl border border-[#14425b] bg-[#051720] flex items-center justify-between hover:bg-[#071c26]/70 transition"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      Period: {ps.payrollRun?.periodMonth}/{ps.payrollRun?.periodYear}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Net Disbursed: <strong className="text-[#ff6f32] font-bold">${ps.netSalary?.toLocaleString()}</strong>
                      {' '}&bull; Gross: ${ps.grossSalary?.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPayslip(ps)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ff6f32]/15 hover:bg-[#ff6f32]/25 text-[#ff6f32] rounded-lg text-xs font-semibold border border-[#ff6f32]/30 transition"
                  >
                    <FileText size={13} />
                    <span>View Payslip</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#14425b] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <div className="flex items-center space-x-2">
                <CreditCard className="text-[#ff6f32]" size={20} />
                <h3 className="font-bold text-white text-sm">Digital Payslip Receipt</h3>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="p-1 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#051720] p-4 rounded-xl border border-[#14425b] space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#14425b] pb-2">
                <span className="text-slate-400">Period:</span>
                <span className="font-bold text-white">
                  {selectedPayslip.payrollRun?.periodMonth}/{selectedPayslip.payrollRun?.periodYear}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Gross Base Salary:</span>
                <span className="font-semibold text-white">${selectedPayslip.grossSalary?.toLocaleString()}</span>
              </div>
              {selectedPayslip.overtimePay > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Approved Overtime Pay:</span>
                  <span className="font-semibold text-[#ff6f32]">+${selectedPayslip.overtimePay?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-300">Allowances & Bonuses:</span>
                <span className="font-semibold text-[#ff6f32]">+${selectedPayslip.allowances?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Tax & Statutory Deductions:</span>
                <span className="font-semibold text-rose-400">-${selectedPayslip.deductions?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#14425b] text-sm font-bold">
                <span className="text-white">Net Take-Home Pay:</span>
                <span className="text-[#ff6f32]">${selectedPayslip.netSalary?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#14425b]">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 border border-[#14425b] bg-[#051720] hover:bg-[#071c26] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Official Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Payroll Pre-Check Modal */}
      {showPrecheckModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#14425b] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="text-[#ff6f32]" size={20} />
                <h3 className="font-bold text-white text-sm">Smart Payroll Pre-Check Engine</h3>
              </div>
              <button
                onClick={() => setShowPrecheckModal(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Period Month</label>
                <select
                  value={runMonth}
                  onChange={(e) => {
                    setRunMonth(e.target.value);
                    runPrecheck(e.target.value, runYear);
                  }}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="1">01 - January</option>
                  <option value="2">02 - February</option>
                  <option value="3">03 - March</option>
                  <option value="4">04 - April</option>
                  <option value="5">05 - May</option>
                  <option value="6">06 - June</option>
                  <option value="7">07 - July</option>
                  <option value="8">08 - August</option>
                  <option value="9">09 - September</option>
                  <option value="10">10 - October</option>
                  <option value="11">11 - November</option>
                  <option value="12">12 - December</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Period Year</label>
                <select
                  value={runYear}
                  onChange={(e) => {
                    setRunYear(e.target.value);
                    runPrecheck(runMonth, e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            {isPrechecking ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Auditing active salaries, attendance adjustments, overtime records, and leave requests...
              </div>
            ) : precheckData ? (
              <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
                {/* Readiness Banner */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    precheckData.canProceed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {precheckData.canProceed ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold">
                      {precheckData.canProceed
                        ? 'Passed All Pre-Checks — Ready for Payroll Run'
                        : 'Blocked — Fix Required Items Before Calculating'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-300">
                    {precheckData.employeeCount} Employees
                  </span>
                </div>

                {/* Overtime Metric */}
                <div className="bg-[#051720] border border-[#14425b] p-3 rounded-xl flex items-center justify-between">
                  <div className="text-slate-300">
                    <span className="font-semibold text-white">Approved Overtime Detected:</span>{' '}
                    <span className="text-[#ff6f32] font-bold">{precheckData.approvedOvertimeHours || 0} hrs</span> ({precheckData.approvedOvertimeCount || 0} approved requests)
                  </div>
                  <span className="text-[10px] text-slate-400">Auto-fed into payroll</span>
                </div>

                {/* Errors */}
                {precheckData.errors?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
                      Blocking Errors ({precheckData.errors.length})
                    </div>
                    {precheckData.errors.map((err: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg flex items-start space-x-2"
                      >
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-rose-400" />
                        <span>{err.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {precheckData.warnings?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                      Advisory Warnings ({precheckData.warnings.length})
                    </div>
                    {precheckData.warnings.map((warn: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2.5 rounded-lg flex items-start space-x-2"
                      >
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                        <span>{warn.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#14425b]">
              <button
                type="button"
                onClick={() => setShowPrecheckModal(false)}
                className="px-4 py-2 border border-[#14425b] bg-[#051720] hover:bg-[#071c26] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {precheckData?.canProceed && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPrecheckModal(false);
                    setShowRunModal(true);
                  }}
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Proceed to Calculate Run
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calculate Run Modal */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#14425b]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#14425b]">
              <h3 className="text-base font-bold text-white">Calculate New Payroll Run</h3>
              <button
                onClick={() => setShowRunModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleProcessRun} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Period Month</label>
                <select
                  value={runMonth}
                  onChange={(e) => setRunMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="1" className="bg-[#08222f] text-white">01 - January</option>
                  <option value="2" className="bg-[#08222f] text-white">02 - February</option>
                  <option value="3" className="bg-[#08222f] text-white">03 - March</option>
                  <option value="4" className="bg-[#08222f] text-white">04 - April</option>
                  <option value="5" className="bg-[#08222f] text-white">05 - May</option>
                  <option value="6" className="bg-[#08222f] text-white">06 - June</option>
                  <option value="7" className="bg-[#08222f] text-white">07 - July</option>
                  <option value="8" className="bg-[#08222f] text-white">08 - August</option>
                  <option value="9" className="bg-[#08222f] text-white">09 - September</option>
                  <option value="10" className="bg-[#08222f] text-white">10 - October</option>
                  <option value="11" className="bg-[#08222f] text-white">11 - November</option>
                  <option value="12" className="bg-[#08222f] text-white">12 - December</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Period Year</label>
                <select
                  value={runYear}
                  onChange={(e) => setRunYear(e.target.value)}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="2026" className="bg-[#08222f] text-white">2026</option>
                  <option value="2027" className="bg-[#08222f] text-white">2027</option>
                </select>
              </div>

              <div className="p-3 bg-[#051720] border border-[#14425b] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Pre-Check Verification</div>
                  <div className="text-[11px] text-slate-400">Audit salaries, pending leaves & OT</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRunModal(false);
                    setShowPrecheckModal(true);
                    runPrecheck(runMonth, runYear);
                  }}
                  className="px-2.5 py-1.5 bg-[#071c26] hover:bg-[#0b2b3c] border border-[#14425b] text-[#ff6f32] rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Verify Now
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-[#14425b]">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? 'Processing...' : 'Run Calculation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
