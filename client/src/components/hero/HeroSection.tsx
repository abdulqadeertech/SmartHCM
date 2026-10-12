import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Clock,
  CreditCard,
  Building2,
  Lock,
} from 'lucide-react';

interface HeroSectionProps {
  onRequestDemo: () => void;
  onWatchVideo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRequestDemo,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden bg-[#071c26]">
      {/* 1. Edge-to-Edge Corporate Workplace Photograph */}
      <div className="absolute inset-0 z-0">
        {!imgError ? (
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=85"
            alt="Corporate team collaborating in a modern conference workplace"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          />
        ) : (
          /* Reliable High-Fidelity SVG Fallback */
          <div className="w-full h-full bg-gradient-to-br from-[#05151e] via-[#092736] to-[#0d3448] flex items-center justify-center">
            <svg
              className="w-full h-full opacity-15"
              viewBox="0 0 1440 800"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="1440" height="800" fill="#071c26" />
              <circle cx="950" cy="350" r="280" fill="#ff6f32" fillOpacity="0.2" />
              <circle cx="450" cy="600" r="380" fill="#0284c7" fillOpacity="0.15" />
              <path
                d="M0 450L480 320L960 480L1440 280V800H0V450Z"
                fill="#04121a"
                fillOpacity="0.4"
              />
            </svg>
          </div>
        )}

        {/* 2. Deep Dark Teal / Blue Photographic Overlay (Preserves Realism) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#051720]/95 via-[#08222f]/88 to-[#051720]/75 z-1" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,111,50,0.12),transparent_50%)] z-2" />
      </div>

      {/* 3. Main Hero Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 relative z-10 w-full text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Enterprise Category Label */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#ff6f32] animate-pulse" />
              <span>Next-Gen Enterprise Cloud</span>
              <span className="text-[10px] uppercase font-bold text-[#ff6f32] bg-[#ff6f32]/15 px-2 py-0.5 rounded-full border border-[#ff6f32]/30">
                Multi-Tenant SaaS
              </span>
            </div>

            {/* Main Headline with Selective Warm Orange Highlight */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.12]">
              Bring Your People and Business Into{' '}
              <span className="text-[#ff6f32]">Better Alignment</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200/95 font-normal leading-relaxed max-w-2xl">
              Manage your workforce, payroll, attendance, and people operations through one connected Human Capital Management platform.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {/* Primary CTA (Warm Orange) */}
              <button
                onClick={onRequestDemo}
                className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-sm sm:text-base px-7 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-200 flex items-center space-x-2.5 cursor-pointer group"
                aria-label="Book a Guided Demo"
              >
                <CalendarDays size={18} className="text-white" />
                <span>Book a Demo</span>
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary CTA (Clean Outline) */}
              <a
                href="#platform"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-6 py-3.5 sm:py-4 rounded-xl border border-white/25 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer"
              >
                <span>Explore the Platform</span>
              </a>

              <Link
                to="/register"
                className="text-xs sm:text-sm text-slate-300 hover:text-white underline underline-offset-4 font-medium transition"
              >
                Register Company Workspace →
              </Link>
            </div>

            {/* Understated Trust & Compliance Indicator */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck size={15} className="text-[#ff6f32] shrink-0" />
                <span>SOC-2 Type II Certified</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>100% Statutory Tax Precision</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Lock size={15} className="text-sky-400 shrink-0" />
                <span>Tenant-Isolated Database</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Enterprise Operational Highlights (5 cols) */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              {/* Subtle Warm Orange Glow Behind Panel */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6f32]/20 to-teal-500/20 rounded-2xl blur-xl opacity-75" />

              {/* Composed Corporate Glass Card */}
              <div className="relative bg-[#08222f]/85 border border-[#14425b] rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5 text-left text-white">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Live Workspace Overview
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#ff6f32] bg-[#ff6f32]/10 px-2 py-0.5 rounded border border-[#ff6f32]/30">
                    Acme Global HQ
                  </span>
                </div>

                {/* 3 Metric Rows */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#051822]/80 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Active Headcount</span>
                      <Users size={13} className="text-[#ff6f32]" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">1,428</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">● 98.4% Present Today</div>
                  </div>

                  <div className="bg-[#051822]/80 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Monthly Payroll</span>
                      <CreditCard size={13} className="text-teal-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">$512.4K</div>
                    <div className="text-[10px] text-teal-300 mt-0.5">● Tax Batch Reconciled</div>
                  </div>
                </div>

                {/* Recent Operational Verification */}
                <div className="bg-[#051822]/60 border border-white/5 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Clock size={12} className="text-[#ff6f32]" />
                      <span>Biometric Terminal Sync</span>
                    </span>
                    <span className="text-emerald-400 text-[10px] font-bold">12/12 ONLINE</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#ff6f32] h-full rounded-full w-[98%]" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Audit Trail: SOC2 Compliant</span>
                  <Link
                    to="/dashboard"
                    className="text-[#ff6f32] hover:text-[#ff854d] font-semibold text-xs flex items-center space-x-1"
                  >
                    <span>View Live Sandbox</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
