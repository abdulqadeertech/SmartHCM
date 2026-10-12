import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const PerformancePage: React.FC = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cycRes, goalRes] = await Promise.all([
        apiRequest('/performance/cycles'),
        apiRequest('/performance/goals'),
      ]);
      setCycles(cycRes?.data || []);
      setGoals(goalRes?.data || []);
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/performance/goals', {
        method: 'POST',
        body: JSON.stringify(goalForm),
      });
      setShowGoalModal(false);
      setActionMessage('Strategic goal set successfully');
      setGoalForm({
        title: '',
        description: '',
        targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      });
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to create goal');
    }
  };

  const handleUpdateProgress = async (id: string, current: number, delta: number) => {
    const nextVal = Math.min(100, Math.max(0, current + delta));
    try {
      await apiRequest(`/performance/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ progressPercentage: nextVal }),
      });
      loadData();
    } catch (err: any) {
      console.error('Failed to update goal progress:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Talent & Development', to: '/performance' },
          { label: 'Performance & Goals' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <TrendingUp className="text-[#ff6f32]" size={22} />
            <span>Performance & Goal Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Key Performance Indicators (KPIs), review cycles, self-evaluations, and manager feedback.
          </p>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>Set New KPI Goal</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-[#ff6f32]/10 border border-[#ff6f32]/30 text-[#ff6f32] px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-[#ff6f32]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Review Cycles Overview */}
      <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl p-5">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Organizational Appraisal Cycles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cycles.map((c) => (
            <div key={c.id} className="p-4 bg-[#051720] rounded-xl border border-[#14425b] flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs">{c.title}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Timeline: {new Date(c.startDate).toLocaleDateString()} to {new Date(c.endDate).toLocaleDateString()}
                </div>
              </div>
              <span className="text-[10px] font-semibold bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30 px-2.5 py-1 rounded-full uppercase">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Goals */}
      <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#14425b] flex items-center justify-between">
          <h2 className="font-bold text-white text-xs uppercase tracking-wider">
            Quarterly Performance Objectives
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Continuous milestone tracking</span>
        </div>

        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading performance goals...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No active goals found. Set one above!</div>
          ) : (
            goals.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl border border-[#14425b] bg-[#051720] hover:bg-[#071c26] transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{g.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        g.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{g.description || 'Target performance milestone'}</p>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Calendar size={12} className="text-[#ff6f32]" />
                    <span>Target completion: {new Date(g.targetDate).toLocaleDateString()}</span>
                    {g.employee && <span className="pl-2">| Assigned: {g.employee.firstName} {g.employee.lastName}</span>}
                  </div>
                </div>

                {/* Progress bar + Interactive controls */}
                <div className="w-full md:w-64 space-y-1.5 shrink-0">
                  <div className="flex justify-between font-semibold text-slate-300 text-xs">
                    <span>Progress</span>
                    <span className="text-[#ff6f32] font-bold">{g.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-[#071c26] h-2 rounded-full overflow-hidden border border-[#14425b]">
                    <div
                      className="bg-[#ff6f32] h-full rounded-full transition-all duration-300"
                      style={{ width: `${g.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-1 pt-1">
                    <button
                      onClick={() => handleUpdateProgress(g.id, g.progressPercentage, -10)}
                      disabled={g.progressPercentage <= 0}
                      className="px-2 py-0.5 bg-[#051822] hover:bg-[#071c26] text-slate-300 border border-[#14425b] rounded font-bold disabled:opacity-30 cursor-pointer"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(g.id, g.progressPercentage, +10)}
                      disabled={g.progressPercentage >= 100}
                      className="px-2 py-0.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded font-bold disabled:opacity-30 cursor-pointer"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Set Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Define New Objective (KPI)</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deliver Zero-Trust API authentication module"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Completion Date *</label>
                <input
                  type="date"
                  required
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Key Deliverables & Success Metrics</label>
                <textarea
                  rows={3}
                  placeholder="Specify quantifiable targets and evaluation criteria..."
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
