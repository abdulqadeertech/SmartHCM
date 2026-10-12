import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Workflow,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  const highlights = [
    {
      title: 'Biometric Attendance & Shift Rostering',
      desc: 'Seamlessly capture biometric terminal punch-ins, enforce 15-minute shift grace windows, calculate overtime tiers, and approve attendance corrections.',
      icon: Clock,
      link: '/attendance',
      badge: 'Live Backend API',
      bullets: ['15-minute grace threshold', 'Automated late arrival detection', 'Manager correction requests'],
    },
    {
      title: 'Precision Multi-Tier Payroll Engine',
      desc: 'Execute decimal-accurate monthly payroll runs across all active employees. Calculates gross pay, basic (50%), allowances, 12% PF, and tax withholding.',
      icon: CreditCard,
      link: '/payroll',
      badge: 'Decimal Arithmetic',
      bullets: ['Atomic payslip generation', 'Provident fund (12%) calculation', 'Tamper-evident finalization lock'],
    },
    {
      title: 'Holiday-Aware Leave Management',
      desc: 'Track Annual, Casual, and Sick leave quotas with real-time balance checks. Automatically excludes organizational public holidays from working day deductions.',
      icon: CalendarCheck,
      link: '/leaves',
      badge: 'Atomic Transactions',
      bullets: ['Holiday calendar integration', 'Multi-tier manager approvals', 'Real-time balance synchronization'],
    },
    {
      title: 'Applicant Tracking System (ATS)',
      desc: 'End-to-end recruitment pipeline from requisition creation to candidate staging, applicant scoring, interview scheduling, and instant hiring conversion.',
      icon: Briefcase,
      link: '/recruitment',
      badge: 'Talent Suite',
      bullets: ['5-stage candidate Kanban', 'Resume review & rating system', '1-click employee onboarding'],
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#061b24] border-t border-[#0e3547] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff6f32] bg-[#ff6f32]/10 px-3 py-1 rounded-full border border-[#ff6f32]/30">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            Engineered for Precision, Compliance, and Scale
          </h2>
          <p className="text-base text-slate-300 mt-3 leading-relaxed">
            Every module in SmartHCM is backed by relational data integrity, tenant isolation,
            and real backend logic—not static mockups or superficial wireframes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#08222f] border border-[#14425b] hover:border-[#ff6f32]/50 rounded-2xl p-6 sm:p-8 transition-all duration-200 hover:shadow-xl text-left group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#071c26] border border-[#14425b] flex items-center justify-center text-[#ff6f32] group-hover:scale-105 transition-transform shadow-sm">
                      <Icon size={24} />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider text-[#ff6f32] bg-[#ff6f32]/10 px-2.5 py-0.5 rounded-full border border-[#ff6f32]/30">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#ff6f32] transition">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    {item.desc}
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-[#0f3446] pt-4">
                    {item.bullets.map((b, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle size={14} className="text-[#ff6f32] shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#0f3446] flex items-center justify-between">
                  <Link
                    to={item.link}
                    className="text-xs font-bold text-[#ff6f32] hover:text-[#ea580c] flex items-center space-x-1.5 group-hover:underline"
                  >
                    <span>Launch Live {item.title.split(' ')[0]} Module</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
