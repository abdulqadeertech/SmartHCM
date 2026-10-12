import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  UserPlus,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const RecruitmentPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    departmentId: '',
    location: 'New York HQ / Hybrid',
    salaryMin: '90000',
    salaryMax: '130000',
    description: '',
  });

  const [candidateForm, setCandidateForm] = useState({
    jobRequisitionId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const query = `?jobId=${selectedJob}&stage=${selectedStage}`;
      const [jobsRes, candRes, deptRes] = await Promise.all([
        apiRequest('/recruitment/jobs'),
        apiRequest(`/recruitment/candidates${query}`),
        apiRequest('/organizations/departments'),
      ]);
      setJobs(jobsRes?.data || []);
      setCandidates(candRes?.data || []);
      setDepartments(deptRes?.data || []);
      if (Array.isArray(jobsRes?.data) && jobsRes.data.length > 0 && !candidateForm.jobRequisitionId) {
        setCandidateForm((prev) => ({ ...prev, jobRequisitionId: jobsRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load recruitment data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJob, selectedStage]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/recruitment/jobs', {
        method: 'POST',
        body: JSON.stringify(jobForm),
      });
      setShowJobModal(false);
      setActionMessage('Job opening published successfully');
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to create job');
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/recruitment/candidates', {
        method: 'POST',
        body: JSON.stringify(candidateForm),
      });
      setShowCandidateModal(false);
      setActionMessage('Candidate registered into pipeline');
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to add candidate');
    }
  };

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      await apiRequest(`/recruitment/candidates/${candidateId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
      });
      setActionMessage(`Candidate stage advanced to ${newStage}`);
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update stage');
    }
  };

  const stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Talent Acquisition', to: '/recruitment' },
          { label: 'ATS & Pipelines' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Briefcase className="text-[#ff6f32]" size={22} />
            <span>Recruitment & Applicant Tracking System (ATS)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Job requisitions, applicant pipelines, interview evaluations, and hiring workflows.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCandidateModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#071c26] hover:bg-[#0b2b3c] text-white border border-[#14425b] rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <UserPlus size={14} className="text-[#ff6f32]" />
            <span>Add Candidate</span>
          </button>
          <button
            onClick={() => setShowJobModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus size={14} />
            <span>New Job Opening</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-[#ff6f32]/10 border border-[#ff6f32]/30 text-[#ff6f32] px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-[#ff6f32]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Job Requisitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((j) => (
          <div
            key={j.id}
            onClick={() => setSelectedJob(selectedJob === j.id ? '' : j.id)}
            className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              selectedJob === j.id
                ? 'bg-[#08222f] border-[#ff6f32] shadow-lg shadow-[#ff6f32]/10 ring-1 ring-[#ff6f32]'
                : 'bg-[#08222f] border-[#14425b] hover:border-[#ff6f32]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#ff6f32] bg-[#ff6f32]/15 px-2 py-0.5 rounded text-[10px]">
                  {j.department?.name || 'General'}
                </span>
                <span className="font-semibold text-slate-400 text-[10px] uppercase">{j.status}</span>
              </div>
              <h3 className="font-bold text-white text-sm">{j.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{j.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#14425b] flex items-center justify-between text-xs text-slate-400">
              <span>{j._count?.candidates || 0} Candidates</span>
              <span className="font-semibold text-slate-200">
                ${j.salaryMin ? `${(j.salaryMin / 1000).toFixed(0)}k` : '—'} - $
                {j.salaryMax ? `${(j.salaryMax / 1000).toFixed(0)}k` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Pipeline Table */}
      <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#14425b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white text-xs uppercase tracking-wider">
              Candidate Pipeline
            </h2>
            <span className="text-[11px] text-slate-400">
              {selectedJob ? 'Filtered by selected job requisition' : 'All active candidates'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-[#051822] border border-[#14425b] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
            >
              <option value="" className="bg-[#08222f] text-white">All Stages</option>
              {stages.map((s) => (
                <option key={s} value={s} className="bg-[#08222f] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Job</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Evaluation Notes</th>
                <th className="py-3 px-4 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14425b]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Loading candidates...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No candidates found for this filter.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-[#071c26]/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {c.jobRequisition?.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30">
                        {c.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={c.notes}>
                      {c.notes || 'No review notes yet.'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={c.stage}
                        onChange={(e) => handleStageChange(c.id, e.target.value)}
                        className="bg-[#051822] border border-[#14425b] rounded-lg px-2 py-1 text-[11px] font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s} className="bg-[#08222f] text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Create Job Opening</h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Staff Cloud Architect"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={jobForm.departmentId}
                  onChange={(e) => setJobForm({ ...jobForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="" className="bg-[#08222f] text-white">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    value={jobForm.salaryMin}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={jobForm.salaryMax}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline responsibilities and skills required..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Add Candidate</h3>
              <button onClick={() => setShowCandidateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Opening *</label>
                <select
                  required
                  value={candidateForm.jobRequisitionId}
                  onChange={(e) => setCandidateForm({ ...candidateForm, jobRequisitionId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id} className="bg-[#08222f] text-white">
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.firstName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.lastName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={candidateForm.email}
                  onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Screening Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key background qualifications, interview notes..."
                  value={candidateForm.notes}
                  onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
