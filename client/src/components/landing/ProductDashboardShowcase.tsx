import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CreditCard,
  CalendarCheck,
  Briefcase,
  ShieldCheck,
  Search,
  Bell,
  CheckCircle2,
  XCircle,
  Building2,
  ArrowRight,
  TrendingUp,
  Lock,
} from 'lucide-react';

export const ProductDashboardShowcase: React.FC = () => {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      name: 'David Kim',
      role: 'Staff Frontend Engineer',
      type: 'Annual Leave',
      dates: 'Oct 14 – Oct 16 (3 days)',
      status: 'pending',
    },
    {
      id: 2,
      name: 'Sarah Miller',
      role: 'Financial Analyst',
      type: 'Sick Leave',
      dates: 'Today (1 day)',
      status: 'pending',
    },
  ]);

  const handleAction = (id: number, action: 'approved' | 'rejected') => {
    setApprovals((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: action } : app))
    );
  };

  return (
    <section className="py-20 lg:py-28 bg-[#061b24] text-white transition-colors border-t border-[#0e3547]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left max-w-3xl mb-12 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f32]" />
            <span className="text-[#ff6f32] font-mono text-xs font-bold tracking-widest uppercase">
              AUTHENTIC PRODUCT ARCHITECTURE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.18]">
            Built as a Production-Grade Enterprise Platform
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Experience the actual SmartHCM application shell. Every dashboard component connects live to multi-branch data, attendance hardware, and tax calculation engines.
          </p>
        </div>

        {/* Dashboard Shell Preview Window */}
        <div className="rounded-2xl border border-[#14425b] bg-[#08222f] shadow-2xl overflow-hidden text-left">
          {/* Simulated Browser Chrome Top Bar */}
          <div className="bg-[#051720] px-4 py-3 border-b border-[#0f3446] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                SmartHCM Enterprise Shell
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-[#092736] border border-[#16435c] px-3 py-1 rounded-md text-[11px] font-mono text-slate-300">
              <Lock size={11} className="text-emerald-400" />
              <span>app.smarthcm.io/w/acme-global/dashboard</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#ff6f32] bg-[#ff6f32]/10 px-2 py-0.5 rounded border border-[#ff6f32]/30">
                Tenant: acme-global
              </span>
            </div>
          </div>

          {/* Internal Shell Grid: Sidebar + Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left Mock Sidebar (3 cols) */}
            <div className="lg:col-span-3 bg-[#071c26] border-r border-[#0f3446] p-4 hidden md:block">
              {/* Workspace Badge */}
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-[#0a2736] border border-[#14425b] mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#ff6f32] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  AG
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">Acme Global Technologies</div>
                  <div className="text-[10px] text-slate-400">Headquarters NY</div>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <div className="space-y-1">
                {[
                  { label: 'Dashboard', icon: LayoutDashboard, active: true },
                  { label: 'Employee Directory', icon: Users, count: '1,428' },
                  { label: 'Biometric Attendance', icon: Clock, count: '96.4%' },
                  { label: 'Payroll & Taxes', icon: CreditCard },
                  { label: 'Leave Approvals', icon: CalendarCheck, count: '3 pending' },
                  { label: 'Recruitment ATS', icon: Briefcase },
                  { label: 'Compliance Audit', icon: ShieldCheck },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        item.active
                          ? 'bg-[#ff6f32] text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </div>
                      {item.count && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            item.active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Application Area (9 cols) */}
            <div className="lg:col-span-9 p-5 sm:p-6 space-y-6">
              {/* Workspace Top Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">Workforce Executive Dashboard</h3>
                  <p className="text-xs text-slate-400">
                    Live operational overview for Headquarters & Distributed Branches.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-1.5 text-xs bg-[#051822] border border-white/10 px-2.5 py-1.5 rounded-lg text-slate-300 font-mono">
                    <Search size={13} className="text-slate-400" />
                    <span>Search records... (⌘K)</span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <span>Open Live App</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* 4 KPIs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#051822] border border-white/10 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Total Workforce</span>
                    <Users size={13} className="text-[#ff6f32]" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1">1,428</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">↑ +38 this quarter</div>
                </div>

                <div className="bg-[#051822] border border-white/10 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Attendance Rate</span>
                    <Clock size={13} className="text-teal-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1">96.4%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">1,377 on premise</div>
                </div>

                <div className="bg-[#051822] border border-white/10 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Current Payroll</span>
                    <CreditCard size={13} className="text-sky-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1">$512,400</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">✓ Ready for transfer</div>
                </div>

                <div className="bg-[#051822] border border-white/10 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Pending Leaves</span>
                    <CalendarCheck size={13} className="text-amber-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1">3 Queue</div>
                  <div className="text-[10px] text-amber-300 mt-0.5">Requires manager review</div>
                </div>
              </div>

              {/* Middle Row: Employee Directory Table Preview + Approvals Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Employee Directory Preview (7 cols) */}
                <div className="lg:col-span-7 bg-[#051822] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Users size={14} className="text-[#ff6f32]" />
                      <span>Employee Directory Preview</span>
                    </span>
                    <Link
                      to="/employees"
                      className="text-[11px] text-[#ff6f32] hover:underline font-semibold"
                    >
                      View all 1,428 →
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase font-mono">
                          <th className="pb-2">Employee</th>
                          <th className="pb-2">Department</th>
                          <th className="pb-2">Designation</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          {
                            name: 'Alex Morgan',
                            dept: 'Engineering',
                            role: 'Lead Architect',
                            status: 'ACTIVE',
                          },
                          {
                            name: 'Elena Rostova',
                            dept: 'People Ops',
                            role: 'HR Partner',
                            status: 'ACTIVE',
                          },
                          {
                            name: 'Marcus Vance',
                            dept: 'Finance',
                            role: 'Senior Analyst',
                            status: 'ACTIVE',
                          },
                          {
                            name: 'Priya Patel',
                            dept: 'Product',
                            role: 'Product Designer',
                            status: 'ON_LEAVE',
                          },
                        ].map((emp, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="py-2.5 flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-[#12394d] text-slate-200 text-[10px] font-bold flex items-center justify-center">
                                {emp.name[0]}
                              </div>
                              <span className="font-semibold text-white">{emp.name}</span>
                            </td>
                            <td className="py-2.5 text-slate-300">{emp.dept}</td>
                            <td className="py-2.5 text-slate-400">{emp.role}</td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                  emp.status === 'ACTIVE'
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                    : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                }`}
                              >
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pending Approvals Interactive Queue (5 cols) */}
                <div className="lg:col-span-5 bg-[#051822] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <CalendarCheck size={14} className="text-amber-400" />
                        <span>Quick Approvals Queue</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">1-Click Actions</span>
                    </div>

                    <div className="space-y-2.5">
                      {approvals.map((app) => (
                        <div
                          key={app.id}
                          className="p-2.5 rounded-lg bg-[#08222f] border border-white/10 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-white">{app.name}</div>
                            <span className="text-[10px] text-[#ff6f32] font-mono bg-[#ff6f32]/10 px-1.5 py-0.5 rounded">
                              {app.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{app.dates}</div>

                          {app.status === 'pending' ? (
                            <div className="flex items-center space-x-2 pt-1">
                              <button
                                onClick={() => handleAction(app.id, 'approved')}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1 rounded transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(app.id, 'rejected')}
                                className="flex-1 bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-[10px] py-1 rounded transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`text-[10px] font-bold uppercase py-0.5 rounded text-center ${
                                app.status === 'approved'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {app.status}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Audit Trail Logged</span>
                    <Link to="/leaves" className="text-[#ff6f32] hover:underline font-semibold">
                      Leave Queue →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
