import React from 'react';
import { Clock, TrendingUp, ShieldCheck, CheckCircle2, Zap, ArrowRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BenefitsSectionProps {
  onOpenDemo: () => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onOpenDemo }) => {
  const metrics = [
    {
      stat: '14 Days',
      label: 'Average Implementation',
      detail: 'Rapid rollout without expensive consulting fees or manual data migration drag.',
      icon: Clock,
    },
    {
      stat: '42%',
      label: 'Reduced HR Ticket Volume',
      detail: 'Employee Self-Service (ESS) resolves payslips, leave queries, and timecards automatically.',
      icon: TrendingUp,
    },
    {
      stat: '100%',
      label: 'Tax & Formula Precision',
      detail: 'Decimal-safe arithmetic guarantees exact statutory provident fund and tax withholdings.',
      icon: ShieldCheck,
    },
    {
      stat: 'Zero-Leak',
      label: 'Tenant Data Isolation',
      detail: 'Cryptographically verified JWT scoping ensures zero cross-company records are ever exposed.',
      icon: Layers,
    },
  ];

  const highlights = [
    'Biometric hardware connector support across all branch offices',
    'Automatic holiday calendar exclusion in leave balance calculations',
    'Immutable audit trail recording every compensation modification',
    'Granular 10-tier Role-Based Access Control security matrix',
    'One-click multi-company tenant switching for corporate group holding entities',
    'Instant PDF-printable payslips with transparent deduction breakdowns',
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#071c26] border-t border-[#0e3547] text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & Proof (5 cols) */}
          <div className="lg:col-span-5 text-left space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0a2736] border border-[#14425b] text-xs font-semibold text-[#ff6f32]">
              <Zap size={14} className="text-[#ff6f32]" />
              <span>MEASURABLE ENTERPRISE ROI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Engineered for Organizations That Value{' '}
              <span className="text-[#ff6f32]">Absolute Precision</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Legacy HR systems slow growing teams down with disconnected spreadsheets, manual attendance reconciliations, and tax calculation discrepancies. SmartHCM unifies people operations into an auditable single source of truth.
            </p>

            <div className="space-y-2.5 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 size={16} className="text-[#ff6f32] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm transition shadow-md hover:shadow-orange-500/25 cursor-pointer group"
              >
                <span>Request Solution Blueprint</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <Link
                to="/register"
                className="text-xs font-bold text-[#ff6f32] hover:underline"
              >
                Register Your Company →
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Stat Cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#08222f] p-6 sm:p-7 rounded-2xl border border-[#14425b] shadow-xl text-left transition-all duration-200 hover:border-[#ff6f32]/60 hover:shadow-2xl group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#071c26] text-[#ff6f32] border border-[#14425b] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Icon size={20} />
                  </div>

                  <div className="text-3xl sm:text-4xl font-extrabold text-[#ff6f32] tracking-tight">
                    {m.stat}
                  </div>

                  <div className="text-sm font-bold text-white mt-1">
                    {m.label}
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {m.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
