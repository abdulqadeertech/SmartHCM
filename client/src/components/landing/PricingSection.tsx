import React, { useState } from 'react';
import { Check, ArrowRight, X, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PricingSectionProps {
  onRequestDemo: () => void;
  onContactSales?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onRequestDemo, onContactSales }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Essential Cloud',
      target: 'Growing companies (20 – 100 staff)',
      monthlyPrice: 6,
      annualPrice: 4.8,
      period: 'per employee / month',
      badge: null,
      description: 'Foundational workforce directory, leave approvals, and punch clock attendance.',
      features: [
        'Core HR & Employee Directory',
        'Live Biometric Punch In / Out',
        'Holiday-Aware Leave Management',
        'Employee Self-Service (ESS) Portal',
        'Standard Email & In-App Support',
        'Multi-Branch Office Support',
      ],
      highlighted: false,
      cta: 'Register Workspace',
      ctaLink: '/register',
    },
    {
      name: 'Enterprise Cloud',
      target: 'Mid-market & enterprises (100 – 1,500 staff)',
      monthlyPrice: 10,
      annualPrice: 8,
      period: 'per employee / month',
      badge: 'Most Popular',
      description: 'The complete 12-module HCM suite with precision decimal payroll and ATS.',
      features: [
        'Everything in Essential Cloud',
        'Decimal-Safe Payroll Engine & Payslips',
        'Recruitment ATS & Kanban Pipeline',
        'Quarterly OKRs & Performance Reviews',
        'Hardware Asset Custodianship Register',
        'HR Service Help Desk Ticketing',
        'Advanced Workforce BI & Analytics',
        'Tamper-Evident Audit Compliance Log',
        'Priority SLA & Dedicated Support',
      ],
      highlighted: true,
      cta: 'Request Enterprise Demo',
      onCtaClick: onRequestDemo,
    },
    {
      name: 'Dedicated Private VPC',
      target: 'Conglomerates & regulated enterprises (1,500+)',
      customPrice: 'Custom',
      period: 'tailored SLA agreement',
      badge: 'Dedicated Tenant',
      description: 'Private cloud infrastructure, customized biometric firmware, and tailored ERP connectors.',
      features: [
        'Unlimited Subsidiaries & Global Entities',
        'Dedicated Isolated Cloud VPC / On-Premise',
        'Custom Biometric Device Hardware Connectors',
        'ERP & Financial Ledger Custom Connectors',
        'Dedicated Solutions Architect & Technical Lead',
        'Guaranteed 99.99% Availability Contract',
        'Custom Regional Data Residency',
      ],
      highlighted: false,
      cta: 'Contact Enterprise Sales',
      onCtaClick: onContactSales || onRequestDemo,
    },
  ];

  const comparisonRows = [
    { feature: 'Core HR & Employee Profiles', essential: true, enterprise: true, custom: true },
    { feature: 'Biometric Time Office & Shifts', essential: true, enterprise: true, custom: true },
    { feature: 'Holiday-Aware Leave Governance', essential: true, enterprise: true, custom: true },
    { feature: 'Employee Self-Service (ESS)', essential: true, enterprise: true, custom: true },
    { feature: 'Decimal-Safe Monthly Payroll Engine', essential: false, enterprise: true, custom: true },
    { feature: 'Printable PDF Payslips & Tax Slabs', essential: false, enterprise: true, custom: true },
    { feature: 'Recruitment ATS & Pipeline Kanban', essential: false, enterprise: true, custom: true },
    { feature: 'Performance Review Cycles & OKRs', essential: false, enterprise: true, custom: true },
    { feature: 'Company Hardware & Asset Register', essential: false, enterprise: true, custom: true },
    { feature: 'HR Support Ticketing Help Desk', essential: false, enterprise: true, custom: true },
    { feature: 'Immutable Compliance Audit Logs', essential: false, enterprise: true, custom: true },
    { feature: 'Custom Biometric Hardware Integrations', essential: false, enterprise: false, custom: true },
    { feature: 'Dedicated Isolated VPC & Custom SLA', essential: false, enterprise: false, custom: true },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#061b24] border-t border-[#0e3547] text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0a2736] border border-[#14425b] text-xs font-semibold text-[#ff6f32] mb-3">
            <Building2 size={14} className="text-[#ff6f32]" />
            <span>TRANSPARENT ENTERPRISE TIERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Pricing for{' '}
            <span className="text-[#ff6f32]">High-Performing Teams</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal">
            Multi-tenant data isolation, regular compliance updates, and transparent billing with zero hidden costs.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 bg-[#0a2736] border border-[#14425b] rounded-xl shadow-md">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                !isAnnual
                  ? 'bg-[#ff6f32] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                isAnnual
                  ? 'bg-[#ff6f32] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20 text-left">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 relative ${
                p.highlighted
                  ? 'bg-[#092736] border-2 border-[#ff6f32] shadow-2xl ring-4 ring-[#ff6f32]/15'
                  : 'bg-[#08222f] border border-[#14425b] shadow-xl hover:border-[#ff6f32]/50'
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ff6f32] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                  {p.badge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{p.target}</p>

                <div className="my-6 pb-6 border-b border-[#0f3446]">
                  {p.customPrice ? (
                    <div className="text-3xl sm:text-4xl font-extrabold text-white">
                      {p.customPrice}
                    </div>
                  ) : (
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        ${isAnnual ? p.annualPrice : p.monthlyPrice}
                      </span>
                      <span className="text-xs text-slate-400">{p.period}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-normal">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Capabilities:
                  </div>
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-200">
                      <Check size={15} className="text-[#ff6f32] shrink-0 mt-0.5 font-bold" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6">
                {p.ctaLink ? (
                  <Link
                    to={p.ctaLink}
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-[#14425b] bg-[#071c26] hover:bg-[#0c2f42] hover:border-[#ff6f32]/50 text-white font-bold text-xs transition shadow-md hover:text-[#ff6f32]"
                  >
                    <span>{p.cta}</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    onClick={p.onCtaClick}
                    className={`w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs transition shadow-md cursor-pointer ${
                      p.highlighted
                        ? 'bg-[#ff6f32] hover:bg-[#ea580c] text-white hover:shadow-orange-500/25'
                        : 'bg-[#071c26] hover:bg-[#0c2f42] text-white border border-[#14425b] hover:border-[#ff6f32]/50'
                    }`}
                  >
                    <span>{p.cta}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="bg-[#08222f] rounded-2xl border border-[#14425b] p-6 sm:p-8 shadow-xl text-left">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">
              Full Feature Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Detailed breakdown of module capabilities across deployment tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#0f3446] text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-4 font-bold">Platform Capability</th>
                  <th className="py-3 px-4 text-center">Essential Cloud</th>
                  <th className="py-3 px-4 text-center text-[#ff6f32] font-bold">Enterprise Cloud</th>
                  <th className="py-3 px-4 text-center">Dedicated Private VPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f3446]">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#0a2736]">
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {row.feature}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.essential ? (
                        <Check size={16} className="text-[#ff6f32] mx-auto font-bold" />
                      ) : (
                        <X size={16} className="text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-[#ff6f32]/5">
                      {row.enterprise ? (
                        <Check size={16} className="text-[#ff6f32] mx-auto font-bold" />
                      ) : (
                        <X size={16} className="text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.custom ? (
                        <Check size={16} className="text-[#ff6f32] mx-auto font-bold" />
                      ) : (
                        <X size={16} className="text-slate-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
