import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users2,
  Briefcase,
  Globe2,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const SolutionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const solutions = [
    {
      id: 'smb',
      title: 'Small & Medium-Sized Businesses',
      category: 'STARTING & OPTIMIZING',
      heading: 'Eliminate Spreadsheet Chaos with Automated People Ops',
      description:
        'Small businesses cannot afford administrative payroll errors or manual attendance tracking. SmartHCM provides an out-of-the-box system of record that unifies employee records, tracks timecards, and runs error-free payroll in minutes.',
      points: [
        'Automated gross-to-net payroll runs with instant payslips',
        'Self-service mobile leave requests and balance tracking',
        'Pre-configured statutory compliance and tax templates',
      ],
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
      linkText: 'Explore SMB Solution',
      linkPath: '/register',
    },
    {
      id: 'growing',
      title: 'Growing Companies & Scaleups',
      category: 'HEADCOUNT ACCELERATION',
      heading: 'Scale Headcount Rapidly Without Operational Drag',
      description:
        'When onboarding dozens of new hires each month, unstructured workflows cause friction. SmartHCM standardizes digital candidate offers, automated equipment provisioning, departmental ladders, and 30-60-90 day performance goals.',
      points: [
        'Automated digital onboarding and document collection',
        'Departmental hierarchy trees and designation structures',
        'Recruitment ATS pipeline connected directly to payroll',
      ],
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
      linkText: 'Explore Scaleup Workflows',
      linkPath: '/recruitment',
    },
    {
      id: 'corporate',
      title: 'Corporate HR Teams',
      category: 'GOVERNANCE & AUDIT',
      heading: 'Enterprise Governance, Policies & Multi-Tier Approvals',
      description:
        'Corporate human resources requires auditability, strict role boundaries, and defensible compliance logs. SmartHCM enforces role-based permissions, customizable approval chains, and immutable audit logs ready for external auditor review.',
      points: [
        'SOC-2 compliant audit trails with actor and IP logging',
        'Granular role-based permissions for Admins and Managers',
        'Automated end-of-service gratuity and settlement engine',
      ],
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80',
      linkText: 'Explore Corporate Governance',
      linkPath: '/organization',
    },
    {
      id: 'multilocation',
      title: 'Multi-Location Organizations',
      category: 'DISTRIBUTED SITES',
      heading: 'Branch-Level Control with Group-Wide Visibility',
      description:
        'Manage subsidiaries across multiple cities or facilities with branch-specific operating hours, public holiday calendars, localized shift rosters, and consolidated group payroll reporting without data overlap.',
      points: [
        'Independent branch profiles, shifts, and grace periods',
        'Centralized consolidated executive reporting across sites',
        'Multi-currency and localized bank output formatting',
      ],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
      linkText: 'Explore Multi-Branch Setup',
      linkPath: '/organization',
    },
    {
      id: 'distributed',
      title: 'Distributed & Remote Workforces',
      category: 'HYBRID OPERATIONS',
      heading: 'Empower Distributed Teams with Geofenced Mobile Tools',
      description:
        'Ensure operational integrity for field, hybrid, and remote staff. Employees check in via GPS-geofenced mobile punches, review their monthly compensation breakdown, and submit expense receipts directly from their phones.',
      points: [
        'GPS-validated mobile punch terminal with location bounds',
        'Self-service digital payslip archive and tax documents',
        'Asynchronous shift swapping and attendance corrections',
      ],
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80',
      linkText: 'Explore Remote Mobility',
      linkPath: '/attendance',
    },
  ];

  const current = solutions[activeTab];

  return (
    <section id="solutions" className="py-20 lg:py-28 bg-[#061b24] border-t border-[#0e3547] text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left max-w-3xl mb-12 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f32]" />
            <span className="text-[#ff6f32] font-mono text-xs font-bold tracking-widest uppercase">
              INDUSTRY & ORGANIZATIONAL ARCHITECTURE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.18]">
            Solutions Tailored to Your Growth Stage
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            From agile emerging businesses to multi-branch enterprises, SmartHCM adapts to your structural complexity with zero custom code required.
          </p>
        </div>

        {/* Tab Buttons Strip */}
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-10 border-b border-[#0f3446]">
          {solutions.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === idx
                  ? 'bg-[#ff6f32] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Featured Editorial Solution Panel */}
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] p-8 lg:p-12 shadow-xl text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-mono font-bold text-[#ff6f32] tracking-wider uppercase bg-[#ff6f32]/10 px-2.5 py-1 rounded border border-[#ff6f32]/30">
                {current.category}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {current.heading}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {current.description}
              </p>

              <div className="space-y-2.5 pt-2">
                {current.points.map((pt, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 size={16} className="text-[#ff6f32] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to={current.linkPath}
                  className="inline-flex items-center space-x-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md group"
                >
                  <span>{current.linkText}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Photo (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl border border-[#14425b] bg-[#051822]">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071c26]/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#08222f]/95 backdrop-blur-sm rounded-lg p-3 text-left border border-[#14425b]">
                  <div className="text-xs font-bold text-white">
                    {current.title}
                  </div>
                  <div className="text-[11px] text-[#ff6f32] font-semibold">
                    Configured for Operational Accuracy
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
