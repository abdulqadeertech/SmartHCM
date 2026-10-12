import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ChevronDown,
  CalendarDays,
  Search,
  MessageCircle,
  Mail,
  Phone,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  LogIn,
} from 'lucide-react';
import {
  MEGA_MENU_MODULES,
  UTILITY_BAR_CONFIG,
  SUPPORTED_LANGUAGES,
} from '../../data/navigationData';
import { DynamicIcon } from '../common/DynamicIcon';
import { useAuth } from '../../context/AuthContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestDemo: () => void;
  onOpenSearch: () => void;
  onOpenWiki: () => void;
  onOpenSupport: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  onRequestDemo,
  onOpenSearch,
  onOpenWiki,
  onOpenSupport,
}) => {
  const [modulesExpanded, setModulesExpanded] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end animate-fadeIn lg:hidden">
      <div
        className="relative bg-[#08222f] border-l border-[#14425b] w-full max-w-sm h-full shadow-2xl flex flex-col text-left overflow-y-auto text-slate-200"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-[#0f3446] flex items-center justify-between bg-[#071c26] text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a2736] border border-[#14425b] flex items-center justify-center text-white font-bold text-sm shadow">
              <span className="text-white">S</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6f32] ml-0.5" />
            </div>
            <span className="font-extrabold text-base text-white">
              Smart<span className="text-[#ff6f32]">HCM</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Action CTAs */}
        <div className="p-4 border-b border-[#0f3446] space-y-2 bg-[#071c26]">
          <button
            onClick={() => {
              onClose();
              onRequestDemo();
            }}
            className="w-full bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <CalendarDays size={14} className="text-white" />
            <span>Book a Guided Demo</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="p-2 border border-[#14425b] bg-[#0a2736] rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0c2f42] flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Search size={14} className="text-[#ff6f32]" />
              <span>Search</span>
            </button>
            <a
              href={UTILITY_BAR_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-emerald-800/80 bg-emerald-950/60 text-emerald-300 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 hover:bg-emerald-900/60 transition"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Accordion for Mega Menu Modules */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <button
              onClick={() => setModulesExpanded(!modulesExpanded)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider py-1 cursor-pointer"
            >
              <span>HCM Modules ({MEGA_MENU_MODULES.length})</span>
              <ChevronDown
                size={16}
                className={`transition-transform text-[#ff6f32] ${modulesExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {modulesExpanded && (
              <div className="mt-2 space-y-1 pl-1">
                {MEGA_MENU_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleNav(mod.path)}
                    className="w-full text-left p-2 rounded-xl hover:bg-[#ff6f32]/10 flex items-center space-x-3 transition group cursor-pointer border border-transparent hover:border-[#ff6f32]/30"
                  >
                    <div className="p-1.5 rounded-lg border bg-[#071c26] border-[#14425b] shrink-0 text-[#ff6f32]">
                      <DynamicIcon name={mod.iconName} size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-[#ff6f32] truncate">
                        {mod.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{mod.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="border-t border-[#0f3446] pt-3 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Workspace Access
            </div>
            <button
              onClick={() => handleNav('/dashboard')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center space-x-2 cursor-pointer"
            >
              <LayoutDashboard size={15} className="text-[#ff6f32]" />
              <span>Open Live HR Portal</span>
            </button>
            {!isAuthenticated ? (
              <button
                onClick={() => handleNav('/login')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center space-x-2 cursor-pointer"
              >
                <LogIn size={15} className="text-slate-400" />
                <span>Sign In to Organization</span>
              </button>
            ) : null}
          </div>

          {/* Help & Support */}
          <div className="border-t border-[#0f3446] pt-3 space-y-1 text-xs text-slate-300">
            <button
              onClick={() => {
                onClose();
                onOpenWiki();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/5 rounded-xl flex items-center space-x-2 cursor-pointer"
            >
              <BookOpen size={14} className="text-[#ff6f32]" />
              <span>HCM Knowledge Wiki</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSupport();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/5 rounded-xl flex items-center space-x-2 cursor-pointer"
            >
              <HelpCircle size={14} className="text-[#ff6f32]" />
              <span>Enterprise Support</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#0f3446] bg-[#051720] text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">SmartHCM Cloud Platform Enterprise</div>
          <div className="text-slate-400">{UTILITY_BAR_CONFIG.salesEmail}</div>
        </div>
      </div>
    </div>
  );
};
