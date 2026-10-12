import React from 'react';
import {
  ShieldCheck,
  Lock,
  Award,
  Server,
  FileCheck,
  Key,
} from 'lucide-react';

export const TrustSection: React.FC = () => {
  const credentials = [
    {
      icon: ShieldCheck,
      title: 'SOC 2 Type II Certified',
      description:
        'Independently audited operational controls, system availability, and confidentiality protocols.',
    },
    {
      icon: Lock,
      title: 'Tenant-Isolated Architecture',
      description:
        'Cryptographically verified JWT scoping ensures zero cross-organization data leakage.',
    },
    {
      icon: Award,
      title: 'ISO/IEC 27001 Standard',
      description:
        'Certified information security management systems with AES-256 data encryption at rest.',
    },
    {
      icon: Server,
      title: '99.99% Uptime Guarantee',
      description:
        'High-availability enterprise cloud infrastructure with continuous automated backups.',
    },
    {
      icon: FileCheck,
      title: 'Statutory Labor Alignment',
      description:
        'Pre-configured regulatory deduction schedules, labor law formulas, and tax compliance.',
    },
    {
      icon: Key,
      title: 'Role-Based Access Control',
      description:
        'Granular permission tiers enforcing least-privilege security across all HR and financial modules.',
    },
  ];

  return (
    <section id="trust" className="py-16 sm:py-20 bg-[#061b24] border-t border-[#0e3547] transition-colors text-left text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f32]" />
            <span className="text-[#ff6f32] font-mono text-xs font-bold tracking-widest uppercase">
              ENTERPRISE SECURITY & COMPLIANCE
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for Strict Corporate Governance
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Every layer of SmartHCM is built to satisfy the stringent requirements of enterprise security, audit, and risk committees.
          </p>
        </div>

        {/* 6 Core Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((cred, idx) => {
            const Icon = cred.icon;
            return (
              <div
                key={idx}
                className="flex items-start space-x-4 p-5 rounded-2xl bg-[#08222f] border border-[#14425b] hover:border-[#ff6f32]/50 transition-colors duration-200 shadow-md group"
              >
                <div className="p-2.5 rounded-xl bg-[#071c26] text-[#ff6f32] border border-[#14425b] group-hover:scale-105 group-hover:border-[#ff6f32]/40 transition-transform shrink-0 shadow-sm">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5 leading-snug group-hover:text-[#ff6f32] transition-colors">
                    {cred.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {cred.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
