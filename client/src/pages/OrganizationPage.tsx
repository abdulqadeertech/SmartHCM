import React, { useEffect, useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Database,
  Layers,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'branches' | 'departments' | 'shifts' | 'backup'>('profile');

  // Org Profile State
  const [org, setOrg] = useState<any>(null);
  const [orgForm, setOrgForm] = useState({
    name: '',
    legalName: '',
    taxId: '',
    currency: 'USD',
    dateFormat: 'YYYY-MM-DD',
    timeZone: 'UTC',
    primaryColor: '#ff6f32',
  });

  // Branches State
  const [branches, setBranches] = useState<any[]>([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    city: '',
    country: 'United States',
    address: '',
    isHeadquarters: false,
  });

  // Departments & Designations State
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [newDept, setNewDept] = useState({ name: '', code: '' });
  const [newDesig, setNewDesig] = useState({ title: '', departmentId: '' });

  // Dept Edit State
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editDeptForm, setEditDeptForm] = useState({ name: '', code: '' });

  // Desig Edit State
  const [editingDesigId, setEditingDesigId] = useState<string | null>(null);
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [editDesigForm, setEditDesigForm] = useState({ title: '', departmentId: '' });

  // Shifts State
  const [shifts, setShifts] = useState<any[]>([]);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    name: 'Morning Regular Shift',
    code: 'MORN-01',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMins: 15,
    halfDayHours: 4,
    workDays: 'Mon,Tue,Wed,Thu,Fri',
  });

  // Backup & Recovery State
  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canEdit =
    user?.isSuperAdmin ||
    ['PLATFORM_SUPER_ADMIN', 'ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER'].includes(user?.role || '');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orgRes, branchesRes, deptsRes, desigsRes, shiftsRes] = await Promise.all([
        apiRequest('/organization/current'),
        apiRequest('/organization/branches'),
        apiRequest('/organization/departments'),
        apiRequest('/organization/designations'),
        apiRequest('/organization/shifts'),
      ]);

      if (orgRes?.data) {
        setOrg(orgRes.data);
        setOrgForm({
          name: orgRes.data.name || '',
          legalName: orgRes.data.legalName || '',
          taxId: orgRes.data.taxId || '',
          currency: orgRes.data.currency || 'USD',
          dateFormat: orgRes.data.dateFormat || 'YYYY-MM-DD',
          timeZone: orgRes.data.timeZone || 'UTC',
          primaryColor: orgRes.data.primaryColor || '#ff6f32',
        });
      }

      setBranches(branchesRes?.data || []);
      setDepartments(deptsRes?.data || []);
      setDesignations(desigsRes?.data || []);
      setShifts(shiftsRes?.data || []);
    } catch (err: any) {
      console.error('Error loading organization details:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load organization settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Org Save
  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    try {
      const res = await apiRequest('/organization/current', {
        method: 'PATCH',
        body: JSON.stringify(orgForm),
      });
      if (res?.data) {
        setOrg(res.data);
      }
      setMessage({ type: 'success', text: 'Organization profile updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save organization settings.' });
    }
  };

  // Branch Handlers
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranchId) {
        await apiRequest(`/organization/branches/${editingBranchId}`, {
          method: 'PATCH',
          body: JSON.stringify(branchForm),
        });
        setMessage({ type: 'success', text: 'Branch updated successfully.' });
      } else {
        await apiRequest('/organization/branches', {
          method: 'POST',
          body: JSON.stringify(branchForm),
        });
        setMessage({ type: 'success', text: 'New branch created successfully.' });
      }
      setShowBranchModal(false);
      setEditingBranchId(null);
      setBranchForm({ name: '', code: '', city: '', country: 'United States', address: '', isHeadquarters: false });
      const bRes = await apiRequest('/organization/branches');
      setBranches(bRes?.data || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save branch.' });
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await apiRequest(`/organization/branches/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Branch removed successfully.' });
      setBranches(branches.filter((b) => b.id !== id));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete branch.' });
    }
  };

  // Department Handlers
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    try {
      const res = await apiRequest('/organization/departments', {
        method: 'POST',
        body: JSON.stringify(newDept),
      });
      if (res?.data) {
        setDepartments((prev) => [...prev, res.data]);
      }
      setNewDept({ name: '', code: '' });
      setMessage({ type: 'success', text: 'Department created successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add department.' });
    }
  };

  const handleUpdateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeptId) return;
    try {
      const res = await apiRequest(`/organization/departments/${editingDeptId}`, {
        method: 'PATCH',
        body: JSON.stringify(editDeptForm),
      });
      setDepartments((prev) => prev.map((d) => (d.id === editingDeptId ? { ...d, ...res.data } : d)));
      setShowDeptModal(false);
      setEditingDeptId(null);
      setMessage({ type: 'success', text: 'Department updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update department.' });
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department? Employees mapped to this department must be reassigned.')) return;
    try {
      await apiRequest(`/organization/departments/${id}`, { method: 'DELETE' });
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      setMessage({ type: 'success', text: 'Department removed successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete department.' });
    }
  };

  // Designation Handlers
  const handleAddDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesig.title || !newDesig.departmentId) return;
    try {
      const res = await apiRequest('/organization/designations', {
        method: 'POST',
        body: JSON.stringify(newDesig),
      });
      if (res?.data) {
        setDesignations((prev) => [...prev, res.data]);
      }
      setNewDesig({ title: '', departmentId: '' });
      setMessage({ type: 'success', text: 'Designation added successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add designation.' });
    }
  };

  const handleUpdateDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesigId) return;
    try {
      const res = await apiRequest(`/organization/designations/${editingDesigId}`, {
        method: 'PATCH',
        body: JSON.stringify(editDesigForm),
      });
      setDesignations((prev) => prev.map((des) => (des.id === editingDesigId ? { ...des, ...res.data } : des)));
      setShowDesigModal(false);
      setEditingDesigId(null);
      setMessage({ type: 'success', text: 'Designation updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update designation.' });
    }
  };

  const handleDeleteDesig = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this designation?')) return;
    try {
      await apiRequest(`/organization/designations/${id}`, { method: 'DELETE' });
      setDesignations((prev) => prev.filter((des) => des.id !== id));
      setMessage({ type: 'success', text: 'Designation removed successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete designation.' });
    }
  };

  // Shift Handlers
  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShiftId) {
        const res = await apiRequest(`/organization/shifts/${editingShiftId}`, {
          method: 'PATCH',
          body: JSON.stringify(shiftForm),
        });
        setShifts((prev) => prev.map((s) => (s.id === editingShiftId ? { ...s, ...res.data } : s)));
        setMessage({ type: 'success', text: 'Work shift updated successfully.' });
      } else {
        const res = await apiRequest('/organization/shifts', {
          method: 'POST',
          body: JSON.stringify(shiftForm),
        });
        if (res?.data) {
          setShifts((prev) => [...prev, res.data]);
        }
        setMessage({ type: 'success', text: 'Work shift schedule created successfully.' });
      }
      setShowShiftModal(false);
      setEditingShiftId(null);
      setShiftForm({
        name: 'Morning Regular Shift',
        code: 'MORN-01',
        startTime: '09:00',
        endTime: '18:00',
        gracePeriodMins: 15,
        halfDayHours: 4,
        workDays: 'Mon,Tue,Wed,Thu,Fri',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save shift.' });
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shift schedule?')) return;
    try {
      await apiRequest(`/organization/shifts/${id}`, { method: 'DELETE' });
      setShifts((prev) => prev.filter((s) => s.id !== id));
      setMessage({ type: 'success', text: 'Shift removed successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete shift.' });
    }
  };

  // System Backup Trigger
  const handleRunBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);
    try {
      const res = await apiRequest('/system/backup', { method: 'POST' });
      setBackupStatus(res?.data || null);
      if (res?.data?.checksum) {
        setMessage({
          type: 'success',
          text: `Encrypted database snapshot created successfully! Checksum: ${res.data.checksum.slice(0, 16)}...`,
        });
      } else {
        setMessage({ type: 'success', text: 'Encrypted database snapshot created successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Backup failed.' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleTestRestore = async () => {
    if (!backupStatus?.backupId) {
      setMessage({ type: 'error', text: 'Please generate a backup snapshot first to run a restore dry-run.' });
      return;
    }
    try {
      const res = await apiRequest('/system/restore', {
        method: 'POST',
        body: JSON.stringify({
          backupId: backupStatus.backupId,
          checksum: backupStatus.checksum,
          targetOrganizationId: user?.organization?.id,
        }),
      });
      setMessage({
        type: 'success',
        text: `Restore verification complete! Restored ${res?.data?.recordsRestored || 0} records with zero integrity errors.`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Restore verification failed.' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Governance & Operations', to: '/organization' },
          { label: 'Organization & Branches' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="text-[#ff6f32]" size={24} />
            <span>Enterprise Organization & Branches</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-branch tenant administration, organizational structure, shifts, and data isolation controls.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ff6f32]/10 text-[#ff6f32] text-xs font-semibold border border-[#ff6f32]/30">
            <ShieldCheck size={14} className="text-[#ff6f32]" />
            <span>Isolated Tenant: {org?.slug || user?.organization?.slug || 'acme-global'}</span>
          </span>
        </div>
      </div>

      {/* Action Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-[#ff6f32]/10 border-[#ff6f32]/30 text-[#ff6f32]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={16} className="text-[#ff6f32] shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#14425b] space-x-1 text-xs font-semibold overflow-x-auto pb-px">
        {[
          { key: 'profile', label: 'Organization Profile & Branding', icon: Building2 },
          { key: 'branches', label: `Branches & Offices (${branches.length})`, icon: MapPin },
          { key: 'departments', label: `Departments & Designations (${departments.length})`, icon: Layers },
          { key: 'shifts', label: `Work Schedules & Shifts (${shifts.length})`, icon: Clock },
          { key: 'backup', label: 'Data Isolation & Backups', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition whitespace-nowrap rounded-t-lg cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#ff6f32] text-[#ff6f32] bg-[#ff6f32]/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-[#071c26]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organization Profile & Branding */}
      {activeTab === 'profile' && (
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl p-6">
          <form onSubmit={handleSaveOrg} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#14425b]">
              <div>
                <h2 className="text-sm font-bold text-white">Tenant Branding & Global Configuration</h2>
                <p className="text-xs text-slate-400">Settings applied across all branches and modules</p>
              </div>

              {canEdit && (
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Organization</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Display Name</label>
                <input
                  type="text"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Legal Registered Entity Name</label>
                <input
                  type="text"
                  value={orgForm.legalName}
                  onChange={(e) => setOrgForm({ ...orgForm, legalName: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tax ID / Company Registration Number</label>
                <input
                  type="text"
                  value={orgForm.taxId}
                  onChange={(e) => setOrgForm({ ...orgForm, taxId: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Base Currency</label>
                <select
                  value={orgForm.currency}
                  onChange={(e) => setOrgForm({ ...orgForm, currency: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="USD" className="bg-[#08222f] text-white">USD ($) - US Dollar</option>
                  <option value="GBP" className="bg-[#08222f] text-white">GBP (£) - British Pound</option>
                  <option value="AED" className="bg-[#08222f] text-white">AED (د.إ) - UAE Dirham</option>
                  <option value="PKR" className="bg-[#08222f] text-white">PKR (Rs) - Pakistani Rupee</option>
                  <option value="EUR" className="bg-[#08222f] text-white">EUR (€) - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Standard Date Format</label>
                <select
                  value={orgForm.dateFormat}
                  onChange={(e) => setOrgForm({ ...orgForm, dateFormat: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="YYYY-MM-DD" className="bg-[#08222f] text-white">YYYY-MM-DD (ISO 8601)</option>
                  <option value="DD/MM/YYYY" className="bg-[#08222f] text-white">DD/MM/YYYY (International)</option>
                  <option value="MM/DD/YYYY" className="bg-[#08222f] text-white">MM/DD/YYYY (US Format)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Timezone</label>
                <select
                  value={orgForm.timeZone}
                  onChange={(e) => setOrgForm({ ...orgForm, timeZone: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="UTC" className="bg-[#08222f] text-white">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York" className="bg-[#08222f] text-white">America/New_York (EST)</option>
                  <option value="Europe/London" className="bg-[#08222f] text-white">Europe/London (GMT/BST)</option>
                  <option value="Asia/Dubai" className="bg-[#08222f] text-white">Asia/Dubai (GST +4)</option>
                  <option value="Asia/Karachi" className="bg-[#08222f] text-white">Asia/Karachi (PKT +5)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand Accent Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={orgForm.primaryColor}
                    onChange={(e) => setOrgForm({ ...orgForm, primaryColor: e.target.value })}
                    disabled={!canEdit}
                    className="h-9 w-12 rounded cursor-pointer border border-[#14425b] bg-[#051822]"
                  />
                  <input
                    type="text"
                    value={orgForm.primaryColor}
                    onChange={(e) => setOrgForm({ ...orgForm, primaryColor: e.target.value })}
                    disabled={!canEdit}
                    className="px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] font-mono text-xs w-28"
                  />
                  <div
                    className="h-8 px-3 rounded flex items-center text-white text-[11px] font-semibold"
                    style={{ backgroundColor: orgForm.primaryColor }}
                  >
                    Theme Preview
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Multi-Branch Locations</h2>
              <p className="text-xs text-slate-400">Manage regional offices and headquarters with automated tax localization</p>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  setEditingBranchId(null);
                  setBranchForm({ name: '', code: '', city: '', country: 'United States', address: '', isHeadquarters: false });
                  setShowBranchModal(true);
                }}
                className="flex items-center space-x-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Branch Location</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-xl flex flex-col justify-between hover:border-[#ff6f32]/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{b.name}</span>
                        {b.isHeadquarters && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30">
                            HQ
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">Code: {b.code}</span>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-[#ff6f32]/10 text-[#ff6f32] flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-slate-300">
                    <div>
                      <strong className="text-white">City:</strong> {b.city || 'N/A'}, {b.country}
                    </div>
                    <div>
                      <strong className="text-white">Address:</strong> {b.address || 'Standard Corporate Facility'}
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <div className="mt-5 pt-3 border-t border-[#14425b] flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingBranchId(b.id);
                        setBranchForm({
                          name: b.name,
                          code: b.code,
                          city: b.city || '',
                          country: b.country || 'United States',
                          address: b.address || '',
                          isHeadquarters: !!b.isHeadquarters,
                        });
                        setShowBranchModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#071c26] transition cursor-pointer"
                      title="Edit Branch"
                    >
                      <Edit2 size={14} className="text-[#ff6f32]" />
                    </button>
                    {!b.isHeadquarters && (
                      <button
                        onClick={() => handleDeleteBranch(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#071c26] transition cursor-pointer"
                        title="Delete Branch"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Branch Modal */}
          {showBranchModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#08222f] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#14425b]">
                <h3 className="text-base font-bold text-white mb-4">
                  {editingBranchId ? 'Edit Branch Location' : 'Add New Branch Office'}
                </h3>
                <form onSubmit={handleSaveBranch} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                      placeholder="e.g. Dubai Regional Office"
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Branch Code</label>
                      <input
                        type="text"
                        value={branchForm.code}
                        onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                        placeholder="DXB-01"
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">City</label>
                      <input
                        type="text"
                        value={branchForm.city}
                        onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                        placeholder="Dubai"
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Country</label>
                    <select
                      value={branchForm.country}
                      onChange={(e) => setBranchForm({ ...branchForm, country: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    >
                      <option value="United States" className="bg-[#08222f] text-white">United States</option>
                      <option value="United Kingdom" className="bg-[#08222f] text-white">United Kingdom</option>
                      <option value="United Arab Emirates" className="bg-[#08222f] text-white">United Arab Emirates</option>
                      <option value="Pakistan" className="bg-[#08222f] text-white">Pakistan</option>
                      <option value="Germany" className="bg-[#08222f] text-white">Germany</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Office Street Address</label>
                    <textarea
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      rows={2}
                      placeholder="Floor 14, Media One Tower, Dubai Media City"
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="isHq"
                      checked={branchForm.isHeadquarters}
                      onChange={(e) => setBranchForm({ ...branchForm, isHeadquarters: e.target.checked })}
                      className="rounded text-[#ff6f32] focus:ring-[#ff6f32] h-4 w-4 bg-[#051822] border-[#14425b]"
                    />
                    <label htmlFor="isHq" className="font-semibold text-slate-300 cursor-pointer">
                      Designate as Primary Headquarters
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t border-[#14425b]">
                    <button
                      type="button"
                      onClick={() => setShowBranchModal(false)}
                      className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                    >
                      Save Branch
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Departments & Designations */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Departments ({departments.length})</h3>
                <p className="text-xs text-slate-400">Business divisions and functional cost-centers</p>
              </div>
            </div>

            {canEdit && (
              <form onSubmit={handleAddDept} className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Department Name (e.g. Legal)"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="flex-1 px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  required
                />
                <input
                  type="text"
                  placeholder="Code (e.g. LEG)"
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                  className="w-24 px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#ff6f32] hover:bg-[#ea580c] text-white px-3 py-2 rounded-lg font-semibold shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}

            <div className="divide-y divide-[#14425b] max-h-80 overflow-y-auto">
              {departments.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{d.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-300 bg-[#071c26] border border-[#14425b] px-1.5 py-0.5 rounded">
                      {d.code}
                    </span>
                    <span className="ml-2 text-[11px] text-slate-400">
                      ({d._count?.employees ?? 0} employees)
                    </span>
                  </div>
                  {canEdit && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingDeptId(d.id);
                          setEditDeptForm({ name: d.name, code: d.code });
                          setShowDeptModal(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#071c26] transition cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 size={13} className="text-[#ff6f32]" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(d.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#071c26] transition cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Designations */}
          <div className="bg-[#08222f] p-6 rounded-2xl border border-[#14425b] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Job Titles & Designations ({designations.length})</h3>
                <p className="text-xs text-slate-400">Hierarchical roles mapped to departments</p>
              </div>
            </div>

            {canEdit && (
              <form onSubmit={handleAddDesig} className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. Senior Security Specialist)"
                    value={newDesig.title}
                    onChange={(e) => setNewDesig({ ...newDesig, title: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    required
                  />
                  <select
                    value={newDesig.departmentId}
                    onChange={(e) => setNewDesig({ ...newDesig, departmentId: e.target.value })}
                    className="w-40 px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    required
                  >
                    <option value="" className="bg-[#08222f] text-white">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-[#ff6f32] hover:bg-[#ea580c] text-white px-3 py-2 rounded-lg font-semibold shrink-0 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-[#14425b] max-h-80 overflow-y-auto">
              {designations.map((des) => (
                <div key={des.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{des.title || des.name}</span>
                    <span className="ml-2 text-[11px] text-[#ff6f32] bg-[#ff6f32]/15 px-2 py-0.5 rounded border border-[#ff6f32]/30">
                      {des.department?.name || 'General'}
                    </span>
                  </div>
                  {canEdit && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingDesigId(des.id);
                          setEditDesigForm({ title: des.title || des.name, departmentId: des.departmentId || '' });
                          setShowDesigModal(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#071c26] transition cursor-pointer"
                        title="Edit Designation"
                      >
                        <Edit2 size={13} className="text-[#ff6f32]" />
                      </button>
                      <button
                        onClick={() => handleDeleteDesig(des.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#071c26] transition cursor-pointer"
                        title="Delete Designation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Department Edit Modal */}
          {showDeptModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#08222f] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#14425b]">
                <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
                  <h3 className="font-bold text-white text-sm">Edit Department</h3>
                  <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleUpdateDept} className="space-y-3 mt-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Department Name</label>
                    <input
                      type="text"
                      required
                      value={editDeptForm.name}
                      onChange={(e) => setEditDeptForm({ ...editDeptForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Department Code</label>
                    <input
                      type="text"
                      required
                      value={editDeptForm.code}
                      onChange={(e) => setEditDeptForm({ ...editDeptForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-3 border-t border-[#14425b]">
                    <button
                      type="button"
                      onClick={() => setShowDeptModal(false)}
                      className="px-3 py-1.5 border border-[#14425b] rounded-lg text-slate-300 hover:bg-[#071c26]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Designation Edit Modal */}
          {showDesigModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#08222f] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#14425b]">
                <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
                  <h3 className="font-bold text-white text-sm">Edit Designation / Title</h3>
                  <button onClick={() => setShowDesigModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleUpdateDesig} className="space-y-3 mt-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      value={editDesigForm.title}
                      onChange={(e) => setEditDesigForm({ ...editDesigForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Department</label>
                    <select
                      value={editDesigForm.departmentId}
                      onChange={(e) => setEditDesigForm({ ...editDesigForm, departmentId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    >
                      <option value="" className="bg-[#08222f] text-white">Select Dept</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-3 border-t border-[#14425b]">
                    <button
                      type="button"
                      onClick={() => setShowDesigModal(false)}
                      className="px-3 py-1.5 border border-[#14425b] rounded-lg text-slate-300 hover:bg-[#071c26]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Work Schedules & Shifts */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Work Schedules & Biometric Shifts</h2>
              <p className="text-xs text-slate-400">Configurable grace periods, half-day thresholds and working days</p>
            </div>
            {canEdit && (
              <button
                onClick={() => setShowShiftModal(true)}
                className="flex items-center space-x-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Shift Roster</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="bg-[#08222f] p-5 rounded-2xl border border-[#14425b] shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{s.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">Shift Code: {s.code}</span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-[#ff6f32]/10 text-[#ff6f32] flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                </div>

                <div className="bg-[#051720] p-3 rounded-xl space-y-1.5 text-xs text-slate-300 border border-[#14425b]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Working Hours:</span>
                    <span className="font-bold text-white">
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grace Period:</span>
                    <span className="font-semibold text-emerald-400">{s.gracePeriodMins} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Half-day Threshold:</span>
                    <span className="font-semibold text-[#ff6f32]">{s.halfDayHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Days:</span>
                    <span className="font-medium text-slate-300">{s.workDays}</span>
                  </div>
                </div>

                {canEdit && (
                  <div className="mt-3 pt-2 border-t border-[#14425b] flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingShiftId(s.id);
                        setShiftForm({
                          name: s.name,
                          code: s.code,
                          startTime: s.startTime,
                          endTime: s.endTime,
                          gracePeriodMins: s.gracePeriodMins ?? 15,
                          halfDayHours: s.halfDayHours ?? 4,
                          workDays: s.workDays ?? 'Mon,Tue,Wed,Thu,Fri',
                        });
                        setShowShiftModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#071c26] transition cursor-pointer"
                      title="Edit Shift"
                    >
                      <Edit2 size={14} className="text-[#ff6f32]" />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#071c26] transition cursor-pointer"
                      title="Delete Shift"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Shift Modal */}
          {showShiftModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#08222f] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#14425b]">
                <h3 className="text-base font-bold text-white mb-4">
                  {editingShiftId ? 'Edit Work Shift Schedule' : 'Define New Work Shift'}
                </h3>
                <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Shift Name</label>
                    <input
                      type="text"
                      value={shiftForm.name}
                      onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Shift Code</label>
                      <input
                        type="text"
                        value={shiftForm.code}
                        onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Grace Period (Mins)</label>
                      <input
                        type="number"
                        value={shiftForm.gracePeriodMins}
                        onChange={(e) => setShiftForm({ ...shiftForm, gracePeriodMins: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Clock-in Time</label>
                      <input
                        type="time"
                        value={shiftForm.startTime}
                        onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Clock-out Time</label>
                      <input
                        type="time"
                        value={shiftForm.endTime}
                        onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                        className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Weekly Work Days</label>
                    <input
                      type="text"
                      value={shiftForm.workDays}
                      onChange={(e) => setShiftForm({ ...shiftForm, workDays: e.target.value })}
                      placeholder="Mon,Tue,Wed,Thu,Fri"
                      className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t border-[#14425b]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowShiftModal(false);
                        setEditingShiftId(null);
                      }}
                      className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                    >
                      Save Shift
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Data Isolation & Automated Backups */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="text-[#ff6f32]" size={18} />
                  <span>Tenant Isolation & Cryptographic Checksum Backups</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated SHA-256 database snapshots, point-in-time recovery and SOC-2 data verification.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunBackup}
                  disabled={isBackingUp}
                  className="flex items-center space-x-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Database size={14} />
                  <span>{isBackingUp ? 'Generating Snapshot...' : 'Create Encrypted Backup'}</span>
                </button>
                {backupStatus && (
                  <button
                    onClick={handleTestRestore}
                    className="flex items-center space-x-1.5 bg-[#071c26] hover:bg-[#0b2b3c] border border-[#14425b] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <RefreshCw size={14} className="text-[#ff6f32]" />
                    <span>Verify Dry-Run Restore</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#051720] border border-[#14425b] space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tenant Isolation Standard
                </span>
                <div className="font-bold text-white text-sm">Row-Level Foreign Key Isolation</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Guarantees Acme Global data is never accessible across other tenants.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#051720] border border-[#14425b] space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cryptographic Integrity
                </span>
                <div className="font-bold text-white text-sm">SHA-256 Checksum Verification</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Every automated backup verifies payload integrity before and after restoration.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#051720] border border-[#14425b] space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Data Retention Policy
                </span>
                <div className="font-bold text-white text-sm">7-Year Regulatory Compliance</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Compliant with US IRS, UK HMRC, UAE Labor Law and SOC2 audit policies.
                </p>
              </div>
            </div>

            {backupStatus && (
              <div className="p-4 rounded-xl bg-[#ff6f32]/10 border border-[#ff6f32]/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Latest Active Backup Snapshot</span>
                  <span className="text-[11px] font-mono text-[#ff6f32] bg-[#08222f] px-2 py-0.5 rounded border border-[#ff6f32]/40">
                    ID: {backupStatus.backupId}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400">Created:</span>{' '}
                    <strong className="text-white">{new Date(backupStatus.timestamp).toLocaleTimeString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Records Backed Up:</span>{' '}
                    <strong className="text-white">{backupStatus.recordsCount} items</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>{' '}
                    <span className="text-emerald-400 font-bold uppercase">{backupStatus.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Integrity:</span>{' '}
                    <strong className="text-[#ff6f32]">SHA-256 Verified</strong>
                  </div>
                </div>
                <div className="pt-2 text-[11px] font-mono text-slate-400 break-all">
                  Checksum: {backupStatus.checksum}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
