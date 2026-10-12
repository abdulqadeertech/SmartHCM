import React, { useEffect, useState } from 'react';
import { ShieldCheck, Filter } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const AuditPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const query = selectedAction ? `?action=${selectedAction}` : '';
      const res = await apiRequest(`/audit/events${query}`);
      setEvents(res?.data || []);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, selectedAction]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Security & Compliance', to: '/audit' },
          { label: 'Audit Trail' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldCheck className="text-[#ff6f32]" size={22} />
            <span>Compliance & Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable security event log tracking administrative modifications, authorization decisions, and access events.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={15} className="text-[#ff6f32]" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-[#051822] border border-[#14425b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
          >
            <option value="" className="bg-[#08222f] text-white">All Audit Actions</option>
            <option value="USER_LOGIN" className="bg-[#08222f] text-white">USER_LOGIN</option>
            <option value="EMPLOYEE_CREATE" className="bg-[#08222f] text-white">EMPLOYEE_CREATE</option>
            <option value="CLOCK_IN" className="bg-[#08222f] text-white">CLOCK_IN</option>
            <option value="CLOCK_OUT" className="bg-[#08222f] text-white">CLOCK_OUT</option>
            <option value="PAYROLL_CALCULATED" className="bg-[#08222f] text-white">PAYROLL_CALCULATED</option>
            <option value="PAYROLL_FINALIZED" className="bg-[#08222f] text-white">PAYROLL_FINALIZED</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Change Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14425b] font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">
                    No audit records registered for this filter.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="hover:bg-[#071c26]/60 transition">
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30">
                        {e.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-sans font-medium">
                      {e.actorEmail || 'System'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {e.entityType} {e.entityId ? `#${e.entityId.slice(0, 6)}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{e.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans max-w-xs truncate" title={e.detailsJson}>
                      {e.detailsJson || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
