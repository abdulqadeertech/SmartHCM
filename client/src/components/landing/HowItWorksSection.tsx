import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Building2,
  Users,
  Settings2,
  GitBranch,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create Company Account',
      description:
        'Register your organization in under 2 minutes with custom workspace slug, currency, and admin credentials.',
      icon: UserPlus,
    },
    {
      step: '02',
      title: 'Set Up Your Workspace',
      description:
        'Define multi-branch locations, departmental hierarchy trees, and structured designation ladders.',
      icon: Building2,
    },
    {
      step: '03',
      title: 'Invite Your Team',
      description:
        'Bulk-import employee master records via CSV or invite team leads and staff with digital onboarding links.',
      icon: Users,
    },
    {
      step: '04',
      title: 'Configure HR Policies',
      description:
        'Set statutory leave quotas, biometric grace rules, overtime multipliers, and decimal salary structures.',
      icon: Settings2,
    },
    {
      step: '05',
      title: 'Activate HR Workflows',
      description:
        'Enable automated multi-level approval hierarchies for leaves, attendance corrections, and expense claims.',
      icon: GitBranch,
    },
    {
      step: '06',
      title: 'Monitor and Grow',
      description:
        'Review real-time biometric attendance, execute decimal-safe payroll runs, and analyze workforce trends.',
      icon: TrendingUp,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#051720] transition-colors border-t border-[#0e3547] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left max-w-3xl mb-16 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f32]" />
            <span className="text-[#ff6f32] font-mono text-xs font-bold tracking-widest uppercase">
              DEPLOYMENT PROCESS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.18]">
            How SmartHCM Works
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            A structured 6-step framework to transition your workforce from fragmented tools to an auditable enterprise system of record in under two weeks.
          </p>
        </div>

        {/* Desktop Horizontal Timeline & Mobile Vertical Grid */}
        <div className="relative">
          {/* Subtle Horizontal Connecting Bar (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-[#14425b] z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10 text-left">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#08222f] rounded-2xl p-5 border border-[#14425b] shadow-xl flex flex-col justify-between group hover:border-[#ff6f32]/60 transition-all duration-200"
                >
                  <div>
                    {/* Step Number & Icon Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0a2736] border border-[#14425b] text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-[#ff6f32] group-hover:border-[#ff6f32] transition-colors duration-200">
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#ff6f32] bg-[#ff6f32]/10 px-2 py-0.5 rounded border border-[#ff6f32]/30">
                        {item.step}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-[#ff6f32] transition-colors">
                      {item.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#0f3446] text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                    <CheckCircle2 size={12} className="text-[#ff6f32]" />
                    <span>Verified Step</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md transition-all duration-200 group"
          >
            <span>Start Step 1: Register Free Workspace</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
