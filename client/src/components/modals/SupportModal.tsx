import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { UTILITY_BAR_CONFIG } from '../../data/navigationData';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-[#08222f] rounded-2xl shadow-2xl max-w-lg w-full border border-[#14425b] overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-label="SmartHCM Customer Support & Service Desk"
      >
        <div className="bg-[#071c26] text-white px-6 py-4 flex items-center justify-between border-b border-[#14425b]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#ff6f32]/20 text-[#ff6f32] border border-[#ff6f32]/30">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
                <span>Smart<span className="text-[#ff6f32]">HCM</span> Enterprise Support</span>
              </h3>
              <p className="text-xs text-slate-400">24/7 Dedicated Support & SLA Monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`mailto:${UTILITY_BAR_CONFIG.supportEmail}`}
              className="p-4 rounded-xl border border-[#14425b] bg-[#051720] hover:border-[#ff6f32] hover:bg-[#ff6f32]/10 transition text-left space-y-1 block group"
            >
              <Mail size={18} className="text-[#ff6f32]" />
              <div className="text-xs font-bold text-white group-hover:text-[#ff6f32] transition">Email Support</div>
              <div className="text-[11px] text-slate-400 truncate">
                {UTILITY_BAR_CONFIG.supportEmail}
              </div>
            </a>

            <a
              href={`tel:${UTILITY_BAR_CONFIG.phone.replace(/[^0-9+]/g, '')}`}
              className="p-4 rounded-xl border border-[#14425b] bg-[#051720] hover:border-[#ff6f32] hover:bg-[#ff6f32]/10 transition text-left space-y-1 block group"
            >
              <Phone size={18} className="text-[#ff6f32]" />
              <div className="text-xs font-bold text-white group-hover:text-[#ff6f32] transition">Direct Line</div>
              <div className="text-[11px] text-slate-400">{UTILITY_BAR_CONFIG.phone}</div>
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#051720] border border-[#14425b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <MessageSquare size={14} className="text-[#ff6f32]" />
                <span>Working HR Help Desk Portal</span>
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                Live Module
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Access the project's internal ticketing system to log grievance requests, payroll inquiries,
              and equipment maintenance tickets.
            </p>
            <Link
              to="/helpdesk"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#ff6f32] hover:text-[#ea580c] pt-1"
            >
              <span>Open Help Desk Workspace</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck size={14} className="text-[#ff6f32] shrink-0" />
            <span>Guaranteed 15-minute response SLA for enterprise severity-1 incidents.</span>
          </div>
        </div>

        <div className="p-3 bg-[#071c26] border-t border-[#14425b] text-right">
          <button
            onClick={onClose}
            className="bg-[#0a2736] hover:bg-[#14425b] border border-[#14425b] text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
