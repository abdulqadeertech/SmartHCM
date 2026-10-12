import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does SmartHCM guarantee tenant isolation and data security?',
      a: 'Every database record is strictly scoped to an immutable organization identifier. All backend queries use cryptographically verified tenant boundaries, preventing data leakage across companies. Additionally, all traffic is encrypted with TLS 1.3 in transit and AES-256 at rest.',
    },
    {
      q: 'Can our company configure custom workspace domains or subdomains?',
      a: 'Yes. SmartHCM supports configurable workspace routing. Each registered company receives a unique workspace slug (e.g. yourcompany.smarthcm.io or /w/yourcompany/login) with company-specific branding, logos, currency, and shift policies.',
    },
    {
      q: 'How does the payroll engine handle regional taxes and statutory deductions?',
      a: 'The engine uses decimal-safe precision arithmetic with configurable statutory policies. Basic pay, allowances, provident funds, and tax withholding slabs are calculated dynamically and permanently locked with tamper-evident audit logs upon payroll finalization.',
    },
    {
      q: 'Can we integrate physical biometric fingerprint or face-recognition punch clocks?',
      a: 'Yes. SmartHCM includes live punch clock APIs supporting real-time biometric terminal hooks, automatic 15-minute grace period enforcement, late-arrival tagging, and automated half-day deductions based on shift rules.',
    },
    {
      q: 'What roles and permissions are available out of the box?',
      a: 'SmartHCM includes 10 predefined enterprise roles: Platform Super Admin, Org Admin, HR Director, HR Manager, HR Officer, Payroll Manager, Dept Manager, Recruiter, Employee (ESS), and Compliance Auditor.',
    },
    {
      q: 'How long does company migration and data onboarding take?',
      a: 'Standard organization self-onboarding takes under 2 minutes through our automated workspace registration wizard. Full employee history, department hierarchies, and compensation structures can be imported via CSV in 14 days or less.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#051720] border-t border-[#0e3547] text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0a2736] border border-[#14425b] text-xs font-semibold text-[#ff6f32] mb-3">
            <HelpCircle size={14} className="text-[#ff6f32]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions for{' '}
            <span className="text-[#ff6f32]">Enterprise Leaders</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal">
            Everything you need to know about architecture, statutory compliance, and deployment.
          </p>
        </div>

        <div className="space-y-3.5 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl overflow-hidden transition-all duration-200 bg-[#08222f] shadow-sm ${
                  isOpen
                    ? 'border-[#ff6f32] border-l-4 border-l-[#ff6f32] bg-[#092736]'
                    : 'border-[#14425b] hover:border-[#ff6f32]/40'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between space-x-4 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${
                    isOpen ? 'text-[#ff6f32]' : 'text-white'
                  }`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#ff6f32]' : 'text-slate-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#0f3446] bg-[#051822]/70">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
