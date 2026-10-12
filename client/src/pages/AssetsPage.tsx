import React, { useEffect, useState } from 'react';
import {
  Laptop,
  Plus,
  UserCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const AssetsPage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const [assetForm, setAssetForm] = useState({
    name: '',
    assetCode: '',
    category: 'LAPTOP',
    cost: '1500',
    serialNumber: '',
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    notes: 'Issued for workstation use',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [astRes, empRes] = await Promise.all([
        apiRequest('/assets'),
        apiRequest('/employees'),
      ]);
      setAssets(astRes?.data || []);
      setEmployees(empRes?.data || []);
      if (Array.isArray(empRes?.data) && empRes.data.length > 0 && !assignForm.employeeId) {
        setAssignForm((prev) => ({ ...prev, employeeId: empRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load asset records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(assetForm),
      });
      setShowCreateModal(false);
      setActionMessage('New company asset registered');
      setAssetForm({ name: '', assetCode: '', category: 'LAPTOP', cost: '1500', serialNumber: '' });
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to create asset');
    }
  };

  const handleAssignAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    try {
      await apiRequest(`/assets/${selectedAssetId}/assign`, {
        method: 'POST',
        body: JSON.stringify(assignForm),
      });
      setShowAssignModal(false);
      setActionMessage('Asset assigned successfully to employee');
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to assign asset');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Equipment & Custody', to: '/assets' },
          { label: 'Asset Register' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Laptop className="text-[#ff6f32]" size={22} />
            <span>Company Assets & Equipment</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware inventory, custody tracking, equipment assignments, and return workflows.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>Register Asset</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-[#ff6f32]/10 border border-[#ff6f32]/30 text-[#ff6f32] px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-[#ff6f32]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Assets Table */}
      <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#14425b] flex items-center justify-between">
          <h2 className="font-bold text-white text-xs uppercase tracking-wider">Asset Register</h2>
          <span className="text-[11px] text-slate-400">{assets.length} Active items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Name / Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost ($)</th>
                <th className="py-3 px-4">Current Custody</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14425b]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading assets...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">No assets registered yet.</td>
                </tr>
              ) : (
                assets.map((a) => {
                  const currentAssignment = a.assignments?.[0];
                  return (
                    <tr key={a.id} className="hover:bg-[#071c26]/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">{a.assetCode}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{a.name}</div>
                        <div className="text-[10px] text-slate-400">SN: {a.serialNumber || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 text-slate-300">
                          <Tag size={12} className="text-[#ff6f32]" />
                          <span>{a.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">
                        ${a.cost ? a.cost.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {currentAssignment ? (
                          <div>
                            <div className="font-semibold text-white">
                              {currentAssignment.employee?.firstName} {currentAssignment.employee?.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Assigned: {new Date(currentAssignment.assignedDate).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">In Inventory</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            a.status === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {a.status === 'AVAILABLE' && (
                          <button
                            onClick={() => {
                              setSelectedAssetId(a.id);
                              setShowAssignModal(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#071c26] hover:bg-[#0b2b3c] text-white border border-[#14425b] rounded font-semibold text-[11px] cursor-pointer"
                          >
                            <UserCheck size={13} className="text-[#ff6f32]" />
                            <span>Assign</span>
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

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Register Company Asset</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Asset Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AST-1004"
                  value={assetForm.assetCode}
                  onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Asset Name / Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dell UltraSharp 32-inch 4K Monitor"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="LAPTOP" className="bg-[#08222f] text-white">Laptop</option>
                    <option value="MONITOR" className="bg-[#08222f] text-white">Monitor</option>
                    <option value="MOBILE" className="bg-[#08222f] text-white">Mobile Phone</option>
                    <option value="FURNITURE" className="bg-[#08222f] text-white">Furniture</option>
                    <option value="OTHER" className="bg-[#08222f] text-white">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    value={assetForm.cost}
                    onChange={(e) => setAssetForm({ ...assetForm, cost: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  placeholder="Manufacturer serial number..."
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Assign Equipment to Custodian</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignAsset} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assign to Employee *</label>
                <select
                  required
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id} className="bg-[#08222f] text-white">
                      {e.firstName} {e.lastName} ({e.employeeCode || e.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Handover Notes</label>
                <textarea
                  rows={2}
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-[#14425b] rounded-xl text-slate-300 hover:bg-[#071c26]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl font-semibold shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
