import React from 'react';
import { ArrowRight, Building2, CheckCircle2, CalendarDays, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyApplicationSectionProps {
  onApply?: () => void;
  onRequestDemo?: () => void;
}

export const CompanyApplicationSection: React.FC<CompanyApplicationSectionProps> = ({
  onApply,
  onRequestDemo,
}) => (
  <section
    id="contact"
    className="border-t border-[#0e3547] bg-[#071c26] text-white py-16 sm:py-24 text-left relative overflow-hidden transition-colors"
  >
    {/* Subtle Background Radial Gradient */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,111,50,0.12),transparent_60%)] pointer-events-none" />

    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8 relative z-10">
      <div className="lg:col-span-7 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0a2736] text-xs font-semibold text-[#ff6f32] border border-[#14425b]">
          <Building2 size={14} />
          <span>ENTERPRISE ADOPTION</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to Bring Your People Into{' '}
          <span className="text-[#ff6f32]">Better Alignment?</span>
        </h2>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
          Register your organization workspace in minutes, or connect with our enterprise solution specialists to evaluate SmartHCM against your current HR and payroll requirements.
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-slate-300">
          <span className="inline-flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-[#ff6f32]" />
            <span>Dedicated Tenant Database Scoping</span>
          </span>
          <span className="inline-flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-[#ff6f32]" />
            <span>Pre-Configured Statutory Tax Rules</span>
          </span>
          <span className="inline-flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-[#ff6f32]" />
            <span>Rapid 14-Day Enterprise Onboarding</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:col-span-5 lg:justify-end">
        <button
          type="button"
          onClick={onRequestDemo || onApply}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-[#ff6f32] hover:bg-[#ea580c] text-white px-7 py-4 text-xs sm:text-sm font-bold transition shadow-lg hover:shadow-orange-500/25 cursor-pointer group"
        >
          <CalendarDays size={16} />
          <span>Book a Guided Demo</span>
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <Link
          to="/register"
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-sm px-6 py-4 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          <span>Register Workspace</span>
        </Link>
      </div>
    </div>
  </section>
);