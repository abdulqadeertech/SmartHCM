import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users2,
  Zap,
} from 'lucide-react';

interface AboutSmartHcmSectionProps {
  onWhySmartHcm?: () => void;
  onRequestDemo?: () => void;
}

export const AboutSmartHcmSection: React.FC<AboutSmartHcmSectionProps> = ({
  onWhySmartHcm,
  onRequestDemo,
}) => {
  const [mainImgError, setMainImgError] = useState(false);
  const [subImgError, setSubImgError] = useState(false);

  return (
    <section id="about" className="py-20 lg:py-28 bg-[#061b24] border-t border-[#0e3547] text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT SIDE: Editorial Content (6 cols) */}
          <div className="lg:col-span-6 text-left space-y-6">
            {/* Red Section Label */}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f32]" />
              <span className="text-[#ff6f32] font-mono text-xs font-bold tracking-widest uppercase">
                ABOUT SMART HCM
              </span>
            </div>

            {/* Heading with Selective Red Highlight */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.18]">
              A Unified Human Capital Platform Built for{' '}
              <span className="text-[#ff6f32]">Enterprise Agility</span>
            </h2>

            {/* Concise Product Introduction */}
            <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
              Legacy HR operations are held back by fragmented spreadsheets, disconnected timeclocks, and brittle payroll handoffs that create administrative overhead and compliance risk.
            </p>

            {/* Business Value Paragraph */}
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              SmartHCM unifies the complete workforce lifecycle into a single, verified system of record. From digital employee onboarding and biometric time tracking to decimal-accurate payroll runs and multi-tier approval hierarchies, our platform provides executive leadership with real-time workforce visibility while ensuring statutory compliance.
            </p>

            {/* 3 Business Value Checkpoints */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-[#ff6f32] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-white">
                    Statutory Compliance by Design:{' '}
                  </span>
                  <span className="text-sm text-slate-300">
                    Automated local tax calculations, statutory deduction rules, and audit-ready reporting.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-[#ff6f32] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-white">
                    Strict Multi-Tenant Isolation:{' '}
                  </span>
                  <span className="text-sm text-slate-300">
                    Cryptographically scoped JWT auth tokens guarantee zero cross-company data leakage.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-[#ff6f32] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-white">
                    Structured 14-Day Deployment:{' '}
                  </span>
                  <span className="text-sm text-slate-300">
                    Proven migration playbooks that transition complex corporate workforces without downtime.
                  </span>
                </div>
              </div>
            </div>

            {/* Two Compact CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#platform"
                className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition flex items-center space-x-2 group cursor-pointer"
              >
                <span>Our Platform</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </a>

              <button
                onClick={onWhySmartHcm || onRequestDemo}
                className="bg-[#0a2736] hover:bg-[#0c2f42] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 shadow-xs transition flex items-center space-x-2 cursor-pointer"
              >
                <Zap size={15} className="text-[#ff6f32]" />
                <span>Why SmartHCM</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Workplace Image Collage (6 cols) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Workplace Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#14425b] bg-[#08222f] aspect-[4/3]">
                {!mainImgError ? (
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                    alt="Corporate professionals collaborating in a strategy conference meeting"
                    onError={() => setMainImgError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-[#071c26] flex items-center justify-center text-slate-400 p-8 text-center">
                    <div className="space-y-2">
                      <Building2 size={36} className="text-[#ff6f32] mx-auto" />
                      <p className="text-sm font-semibold text-white">Enterprise Workplace Collaboration</p>
                      <p className="text-xs text-slate-400">SmartHCM Unified People Operations</p>
                    </div>
                  </div>
                )}
                {/* Subtle dark gradient overlay on bottom of main image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071c26]/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Overlapping Secondary Image with Red Accent Border */}
              <div className="absolute -bottom-8 -left-6 sm:-left-8 w-48 sm:w-60 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-[#ff6f32] bg-[#08222f] hidden sm:block z-20">
                {!subImgError ? (
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                    alt="HR operations specialist reviewing digital employee analytics"
                    onError={() => setSubImgError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0a2736] flex items-center justify-center p-3 text-center">
                    <span className="text-xs text-white font-semibold">Analytics & Payroll Sync</span>
                  </div>
                )}
              </div>

              {/* Floating Verified Trust Stat Pill */}
              <div className="absolute -top-4 -right-2 sm:-right-4 bg-[#08222f] border border-[#14425b] rounded-xl p-3 sm:p-4 shadow-2xl z-20 flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-[#071c26] border border-[#14425b] text-[#ff6f32] flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">
                    99.98% Precision
                  </div>
                  <div className="text-[11px] text-slate-400">
                    450+ Verified Workspaces
                  </div>
                </div>
              </div>

              {/* Fine Red Geometric Detail Lines */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-[#ff6f32]/40 rounded-br-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
