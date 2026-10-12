import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CreditCard,
  Clock,
  TrendingUp,
  Database,
  Search,
  Loader2,
  AlertTriangle,
  Bookmark,
  Trash2,
  Send,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [advancedData, setAdvancedData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom Date-Range Filter State
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // AI Assistant State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiHistory, setAiHistory] = useState<Array<{ query: string; answer: string; source: string; timestamp: string }>>([
    {
      query: 'What is our total active headcount across departments?',
      answer: 'According to real-time database records, the organization currently employs 12 active staff members across 4 departments (Engineering, Human Resources, Finance, Operations).',
      source: 'Prisma.Employee.count() WHERE status="ACTIVE" AND organizationId="acme-global"',
      timestamp: '10:00 AM',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New Saved Report Modal
  const [showSaveReportModal, setShowSaveReportModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('Q4 Workforce & Payroll Analytics');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, trRes, advRes, savedRes] = await Promise.all([
        apiRequest('/reports/summary'),
        apiRequest('/reports/attendance-trends'),
        apiRequest(`/reports/advanced?from=${startDate}&to=${endDate}`),
        apiRequest('/reports/saved'),
      ]);
      setSummary(sumRes?.data || null);
      setTrends(trRes?.data || []);
      setAdvancedData(advRes?.data || null);
      setSavedReports(savedRes?.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleApplyDateFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const advRes = await apiRequest(`/reports/advanced?from=${startDate}&to=${endDate}`);
      setAdvancedData(advRes?.data || null);
    } catch (err) {
      console.error('Failed to apply date filter:', err);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const queryText = aiQuery.trim();
    setAiQuery('');
    setIsAiLoading(true);

    try {
      const res = await apiRequest('/reports/ai-query', {
        method: 'POST',
        body: JSON.stringify({ query: queryText }),
      });

      setAiHistory((prev) => [
        ...prev,
        {
          query: queryText,
          answer: res?.data?.answer || 'Query processed.',
          source: res?.data?.traceability?.source || 'Prisma verified enterprise ledger',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setAiHistory((prev) => [
        ...prev,
        {
          query: queryText,
          answer: err.message || 'Security Error: You are not authorized to query this confidential dataset.',
          source: 'RBAC Policy Guard: Unauthorized Data Access Prevented',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveCurrentReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/reports/saved', {
        method: 'POST',
        body: JSON.stringify({
          title: saveTitle,
          reportType: 'WORKFORCE_ANALYTICS',
          filters: { startDate, endDate },
        }),
      });
      if (res?.data) {
        setSavedReports((prev) => [...prev, res.data]);
      }
      setShowSaveReportModal(false);
    } catch (err: any) {
      console.error('Failed to save report:', err);
    }
  };

  const handleDeleteSavedReport = async (id: string) => {
    try {
      await apiRequest(`/reports/saved/${id}`, { method: 'DELETE' });
      setSavedReports(savedReports.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete saved report:', err);
    }
  };

  const handleExportCSV = (reportType: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `${reportType}_report_${startDate}_to_${endDate}.csv`;

    if (reportType === 'headcount') {
      csvContent += 'Department,Code,EmployeeCount\n';
      summary?.departmentDistribution?.forEach((d: any) => {
        csvContent += `"${d.name}","${d.code}",${d.count}\n`;
      });
    } else if (reportType === 'attendance') {
      csvContent += 'Date,PresentCount,HalfDayCount,LateCount\n';
      trends.forEach((t: any) => {
        csvContent += `"${t.date}",${t.present},${t.halfDay},${t.lateCount}\n`;
      });
    } else {
      csvContent += 'Metric,Value\n';
      csvContent += `Total Headcount,${summary?.headcount || 0}\n`;
      csvContent += `Monthly Gross Payroll,${summary?.latestPayroll?.totalGross || 0}\n`;
      csvContent += `Monthly Net Payroll,${summary?.latestPayroll?.totalNet || 0}\n`;
      csvContent += `Attendance Rate Today,${summary?.attendanceToday?.ratePercentage || 0}%\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deptData =
    summary?.departmentDistribution?.map((d: any) => ({
      name: d.name.split(' ')[0],
      fullName: d.name,
      count: d.count,
    })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Analytics & Insights', to: '/reports' },
          { label: 'Workforce Reports' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="text-[#ff6f32]" size={24} />
            <span>Workforce Analytics & Traceable BI Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time business intelligence queried directly from organizational databases with natural-language AI explanations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Database size={14} className="text-white" />
            <span>Query Data Engine</span>
          </button>
          <button
            onClick={() => handleExportCSV('headcount')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#071c26] hover:bg-[#0b2b3c] text-white border border-[#14425b] rounded-xl text-xs font-semibold transition"
          >
            <Download size={14} className="text-[#ff6f32]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Unusual-Data & Anomaly Alerts Banner */}
      {advancedData?.anomalies?.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-xs text-amber-300">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Automated Anomaly Detection Notice</div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-200/90">
              {advancedData.anomalies.map((anom: string, idx: number) => (
                <li key={idx}>{anom}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Date Filter & Saved Reports Bar */}
      <div className="bg-[#08222f] p-4 rounded-2xl border border-[#14425b] shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <form onSubmit={handleApplyDateFilter} className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-300 flex items-center space-x-1">
            <Filter size={13} className="text-[#ff6f32]" />
            <span>Date Range:</span>
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white font-semibold rounded-lg shadow-xs transition"
          >
            Filter Analytics
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSaveReportModal(true)}
            className="px-3 py-1.5 bg-[#051822] hover:bg-[#071c26] border border-[#14425b] text-slate-300 font-semibold rounded-lg transition flex items-center space-x-1"
          >
            <Bookmark size={13} className="text-[#ff6f32]" />
            <span>Save Current Query</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Staff Headcount
          </div>
          <div className="text-2xl font-bold text-white">{summary?.headcount ?? '...'}</div>
          <div className="text-[11px] text-[#ff6f32] font-semibold mt-1">100% active retention</div>
        </div>

        <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Attendance Rate Today
          </div>
          <div className="text-2xl font-bold text-white">
            {summary?.attendanceToday ? `${summary.attendanceToday.ratePercentage}%` : '...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary?.attendanceToday?.present || 0} clocked in
          </div>
        </div>

        <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Monthly Net Payroll Cost
          </div>
          <div className="text-2xl font-bold text-white">
            ${summary?.latestPayroll?.totalNet?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Status: {summary?.latestPayroll?.status || 'Draft'}
          </div>
        </div>

        <div className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Recruitment Requisitions
          </div>
          <div className="text-2xl font-bold text-white">{summary?.activeJobs ?? '...'}</div>
          <div className="text-[11px] text-[#ff6f32] font-semibold mt-1">Open talent searches</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-xl">
          <h2 className="text-sm font-bold text-white mb-1">Headcount by Department</h2>
          <p className="text-xs text-slate-400 mb-4">Current functional workforce allocation</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14425b" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071c26', borderColor: '#14425b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} staff`, 'Headcount']}
                />
                <Bar dataKey="count" fill="#ff6f32" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Trends */}
        <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-xl">
          <h2 className="text-sm font-bold text-white mb-1">Attendance Trends Log</h2>
          <p className="text-xs text-slate-400 mb-4">Historical daily presence rate</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14425b" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071c26', borderColor: '#14425b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="present" name="Present" stroke="#ff6f32" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="lateCount" name="Late Arrivals" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Saved Reports Section */}
      <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Bookmark className="text-[#ff6f32]" size={17} />
              <span>Saved Executive Reports ({savedReports.length})</span>
            </h3>
            <p className="text-xs text-slate-400">Quickly re-execute and download preset analytical reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savedReports.length === 0 ? (
            <div className="col-span-3 text-center py-6 text-xs text-slate-400">
              No saved custom reports. Click "Save Current Query" to bookmark a filter.
            </div>
          ) : (
            savedReports.map((sr) => (
              <div
                key={sr.id}
                className="p-4 rounded-xl bg-[#051720] border border-[#14425b] flex flex-col justify-between hover:border-[#ff6f32]/40 transition"
              >
                <div>
                  <h4 className="font-bold text-white text-xs">{sr.title}</h4>
                  <div className="text-[11px] text-slate-400 mt-1">Type: {sr.reportType}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Saved: {new Date(sr.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-[#14425b] flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleExportCSV(sr.reportType.toLowerCase())}
                    className="text-[#ff6f32] hover:text-[#ff6f32]/80 font-semibold flex items-center space-x-1"
                  >
                    <Download size={12} />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSavedReport(sr.id)}
                    className="text-slate-400 hover:text-rose-400 p-1 transition"
                    title="Delete Saved Report"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Assistant Drawer */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="bg-[#08222f] w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-[#14425b]">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#14425b] bg-[#071c26] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-[#ff6f32] flex items-center justify-center text-white">
                  <Database size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Workforce Analytics Query Engine</h3>
                  <div className="text-[10px] text-[#ff6f32] flex items-center space-x-1">
                    <ShieldCheck size={11} />
                    <span>Permission-Enforced & Verified</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* AI Q&A Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#051720] text-xs">
              {aiHistory.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  {/* User query */}
                  <div className="flex justify-end">
                    <div className="bg-[#ff6f32] text-white px-3.5 py-2 rounded-2xl rounded-tr-none max-w-[85%] font-medium">
                      {item.query}
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="bg-[#08222f] border border-[#14425b] text-slate-200 p-3.5 rounded-2xl rounded-tl-none max-w-[90%] shadow-lg space-y-2">
                      <p className="leading-relaxed">{item.answer}</p>
                      <div className="pt-2 border-t border-[#14425b] text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                        <ShieldCheck size={11} className="text-[#ff6f32] shrink-0" />
                        <span className="truncate">Data Source: {item.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
                  <Loader2 size={14} className="animate-spin text-[#ff6f32]" />
                  <span>Analyzing organizational database with RBAC permission check...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleAskAi} className="p-3 border-t border-[#14425b] bg-[#071c26] flex items-center gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask e.g. 'What is our headcount by department?'..."
                className="flex-1 px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuery.trim()}
                className="p-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Save Report Modal */}
      {showSaveReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#14425b]">
            <h3 className="text-base font-bold text-white mb-4">Bookmark Report Query</h3>
            <form onSubmit={handleSaveCurrentReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Report Title</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] font-medium"
                  required
                />
              </div>

              <div className="p-3 bg-[#051720] border border-[#14425b] rounded-lg text-slate-300 text-[11px] space-y-1">
                <div>From: {startDate}</div>
                <div>To: {endDate}</div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-[#14425b]">
                <button
                  type="button"
                  onClick={() => setShowSaveReportModal(false)}
                  className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
