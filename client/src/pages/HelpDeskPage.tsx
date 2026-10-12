import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  CheckCircle2,
  X,
  Send,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

export const HelpDeskPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/helpdesk/tickets');
      setTickets(res?.data || []);
      if (selectedTicket) {
        const refreshed = res?.data?.find((t: any) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/helpdesk/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketForm),
      });
      setShowCreateModal(false);
      setActionMessage('Support ticket created successfully');
      setTicketForm({ subject: '', description: '', category: 'GENERAL', priority: 'MEDIUM' });
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to create ticket');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    try {
      await apiRequest(`/helpdesk/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ message: commentText }),
      });
      setCommentText('');
      loadData();
    } catch (err: any) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      await apiRequest(`/helpdesk/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setActionMessage(`Ticket status updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Workplace Operations', to: '/helpdesk' },
          { label: 'HR Help Desk' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <HelpCircle className="text-[#ff6f32]" size={22} />
            <span>HR Help Desk & Service Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal inquiries, workplace requests, IT provisioning, and service-level tracking.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>Submit Support Ticket</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-[#ff6f32]/10 border border-[#ff6f32]/30 text-[#ff6f32] px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-[#ff6f32]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#14425b] flex items-center justify-between">
            <h2 className="font-bold text-white text-xs uppercase tracking-wider">Active Tickets</h2>
            <span className="text-[11px] text-slate-400">{tickets.length} Registered</span>
          </div>

          <div className="divide-y divide-[#14425b]">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400 text-xs">Loading support tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No active tickets found.</div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 hover:bg-[#071c26]/60 transition cursor-pointer flex items-center justify-between ${
                    selectedTicket?.id === t.id ? 'bg-[#ff6f32]/10 border-l-4 border-[#ff6f32]' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-white">{t.subject}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          t.priority === 'URGENT'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-[#071c26] text-slate-300 border border-[#14425b]'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>Submitted by: {t.employee?.firstName} {t.employee?.lastName}</span>
                      <span>•</span>
                      <span>Category: {t.category}</span>
                      <span>•</span>
                      <span>{t.comments?.length || 0} messages</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      t.status === 'RESOLVED' || t.status === 'CLOSED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-xl flex flex-col justify-between overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-[#14425b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{selectedTicket.subject}</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="text-[11px] font-semibold bg-[#051822] border border-[#14425b] text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="OPEN" className="bg-[#08222f] text-white">OPEN</option>
                    <option value="IN_PROGRESS" className="bg-[#08222f] text-white">IN_PROGRESS</option>
                    <option value="RESOLVED" className="bg-[#08222f] text-white">RESOLVED</option>
                    <option value="CLOSED" className="bg-[#08222f] text-white">CLOSED</option>
                  </select>
                </div>
                <p className="text-xs text-slate-300 bg-[#051720] p-2.5 rounded-lg border border-[#14425b]">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Thread Messages */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-72">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Conversation & Updates
                </div>
                {selectedTicket.comments?.length === 0 ? (
                  <div className="text-slate-400 text-xs italic">No messages yet. Add a reply below.</div>
                ) : (
                  selectedTicket.comments?.map((c: any) => (
                    <div key={c.id} className="bg-[#051720] p-2.5 rounded-xl border border-[#14425b] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-white">{c.user?.firstName} {c.user?.lastName}</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-slate-200">{c.message}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="p-3 border-t border-[#14425b] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type an update or resolution note..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl disabled:opacity-40 cursor-pointer transition"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <MessageSquare size={32} className="text-[#ff6f32]" />
              <span>Select a ticket from the left to view resolution history and reply.</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#14425b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Submit HR Service Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Query regarding Health Insurance coverage"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="GENERAL" className="bg-[#08222f] text-white">General HR</option>
                    <option value="PAYROLL" className="bg-[#08222f] text-white">Payroll & Salary</option>
                    <option value="BENEFITS" className="bg-[#08222f] text-white">Benefits & Insurance</option>
                    <option value="IT" className="bg-[#08222f] text-white">IT & Hardware</option>
                    <option value="WORKPLACE" className="bg-[#08222f] text-white">Workplace Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="LOW" className="bg-[#08222f] text-white">Low</option>
                    <option value="MEDIUM" className="bg-[#08222f] text-white">Medium</option>
                    <option value="HIGH" className="bg-[#08222f] text-white">High</option>
                    <option value="URGENT" className="bg-[#08222f] text-white">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Details & Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your inquiry or request in detail..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
