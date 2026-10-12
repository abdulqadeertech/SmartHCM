import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  CalendarDays,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { UTILITY_BAR_CONFIG } from '../../data/navigationData';

interface FooterProps {
  onRequestDemo: () => void;
  onOpenWiki: () => void;
  onOpenSupport: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onRequestDemo,
  onOpenWiki,
  onOpenSupport,
}) => {
  return (
    <footer className="bg-[#051720] text-slate-300 border-t border-[#0d3448] text-left transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Contact (Col 1 - 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a2736] border border-[#14425b] flex items-center justify-center font-extrabold text-white text-lg shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Smart<span className="text-[#ff6f32]">HCM</span>
                </span>
                <span className="ml-2 text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-[#0a2736] text-[#ff6f32] border border-[#14425b] rounded">
                  Enterprise Cloud
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              SmartHCM is an enterprise-grade Human Capital Management platform unifying digital employee records, biometric attendance, decimal-safe payroll processing, and audit trails into a secure multi-tenant architecture.
            </p>

            {/* Direct Contact Details */}
            <div className="space-y-1.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Mail size={13} className="text-[#ff6f32]" />
                <a href="mailto:sales@smarthcm.io" className="hover:text-white transition">
                  sales@smarthcm.io
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={13} className="text-[#ff6f32]" />
                <span>+1 (800) 849-2180 (Inquiries)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Clock size={13} className="text-slate-500" />
                <span>Mon – Fri: 8:00 AM – 6:00 PM EST</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onRequestDemo}
                className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm group"
              >
                <CalendarDays size={13} />
                <span>Book a Guided Demo</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Platform Modules (Col 2) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#ff6f32]">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/employees" className="hover:text-white transition">
                  Core HR & Records
                </Link>
              </li>
              <li>
                <Link to="/attendance" className="hover:text-white transition">
                  Biometric Attendance
                </Link>
              </li>
              <li>
                <Link to="/leaves" className="hover:text-white transition">
                  Leave Management
                </Link>
              </li>
              <li>
                <Link to="/payroll" className="hover:text-white transition">
                  Payroll & Tax Engine
                </Link>
              </li>
              <li>
                <Link to="/recruitment" className="hover:text-white transition">
                  Recruitment & ATS
                </Link>
              </li>
              <li>
                <Link to="/performance" className="hover:text-white transition">
                  Performance Reviews
                </Link>
              </li>
              <li>
                <Link to="/organization" className="hover:text-white transition">
                  Multi-Branch Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & Architecture (Col 3) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#ff6f32]">
              Solutions
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#solutions" className="hover:text-white transition">
                  Small & Medium Businesses
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition">
                  High-Growth Scaleups
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition">
                  Corporate HR Teams
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition">
                  Multi-Location Groups
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition">
                  Remote & Distributed Staff
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#ff6f32] transition font-semibold">
                  Register Company Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Security (Col 4) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#ff6f32]">
              Trust & Governance
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5 text-slate-300">
                <ShieldCheck size={13} className="text-[#ff6f32]" />
                <span>SOC 2 Type II Certified</span>
              </li>
              <li className="flex items-center space-x-1.5 text-slate-300">
                <Lock size={13} className="text-emerald-400" />
                <span>Strict Database Isolation</span>
              </li>
              <li className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>99.99% Availability SLA</span>
              </li>
              <li>
                <button onClick={onOpenWiki} className="hover:text-white transition text-left">
                  Labor Law Formulas Wiki
                </button>
              </li>
              <li>
                <button onClick={onOpenSupport} className="hover:text-white transition text-left">
                  Enterprise Help Center
                </button>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Live Product Sandbox
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="mt-14 pt-8 border-t border-[#0e3547] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} SmartHCM Cloud Technologies. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition cursor-pointer">Security Standards</span>
            <span className="hover:text-white transition cursor-pointer">Status Dashboard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
