import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ThreeFeatureStrip: React.FC = () => {
  const features = [
    {
      number: '01 / CORE FOUNDATION',
      title: 'Core HR & Workforce Management',
      highlight: 'Core HR',
      description:
        'Unified digital employee records, multi-branch organizational hierarchy, designation ladders, and frictionless self-service onboarding.',
      icon: Users,
      link: '/employees',
      actionLabel: 'Explore Core HR',
    },
    {
      number: '02 / FINANCIAL ENGINE',
      title: 'Payroll & Benefits Precision',
      highlight: 'Payroll',
      description:
        'Decimal-safe gross-to-net calculation engine, statutory tax withholdings, direct bank batch outputs, and automated employee payslips.',
      icon: CreditCard,
      link: '/payroll',
      actionLabel: 'Explore Payroll Engine',
    },
    {
      number: '03 / OPERATIONS & TALENT',
      title: 'Attendance & Talent Operations',
      highlight: 'Attendance',
      description:
        'Hardware biometric terminal sync, multi-shift scheduling, grace-period overtime enforcement, and end-to-end recruitment pipelines.',
      icon: Clock,
      link: '/attendance',
      actionLabel: 'Explore Operations',
    },
  ];

  return (
    <section className="bg-[#061b24] border-b border-[#0f3446] text-white py-12 lg:py-16 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-0 lg:divide-x lg:divide-[#0f3446]">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col justify-between text-left lg:px-8 first:lg:pl-0 last:lg:pr-0 transition-transform duration-200"
              >
                <div>
                  {/* Category and Numbering */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#ff6f32] font-mono text-xs font-bold tracking-widest uppercase">
                      {feature.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#0a2736] border border-[#14425b] group-hover:border-[#ff6f32]/60 text-slate-200 group-hover:text-[#ff6f32] flex items-center justify-center transition-colors duration-200 shadow-sm">
                      <Icon size={20} className="transition-transform group-hover:scale-110" />
                    </div>
                  </div>

                  {/* Title with Subtle Hover Effect */}
                  <h3 className="text-xl font-bold text-white group-hover:text-[#ff6f32] transition-colors duration-200 mb-3 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-300/90 leading-relaxed font-normal mb-6">
                    {feature.description}
                  </p>
                </div>

                {/* Text Action Link */}
                <Link
                  to={feature.link}
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-[#ff6f32] hover:text-[#ff854d] transition-colors group/link mt-auto"
                >
                  <span>{feature.actionLabel}</span>
                  <ArrowRight
                    size={14}
                    className="group-hover/link:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
