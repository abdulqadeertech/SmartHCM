import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MEGA_MENU_MODULES, MegaMenuModule } from '../../data/navigationData';
import { DynamicIcon } from '../common/DynamicIcon';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestDemo: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  isOpen,
  onClose,
  onRequestDemo,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleModuleClick = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 right-0 z-50 bg-[#08222f] border-b border-[#14425b] shadow-mega transition-all duration-200 animate-dropdown-slide text-left"
      role="region"
      aria-label="SmartHCM Modules Mega-Menu"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 max-h-[82vh] overflow-y-auto">
        {/* Top Header inside Mega-Menu */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#0f3446]">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff6f32] bg-[#ff6f32]/10 px-2.5 py-1 rounded-full border border-[#ff6f32]/25">
              Enterprise HCM Suite
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              16 Integrated Cloud Modules with Multi-Tenant Security
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              onRequestDemo();
            }}
            className="text-xs font-semibold text-[#ff6f32] hover:text-[#ea580c] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Need Custom Solution Architecture?</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 4-Column Grid for 16 Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {MEGA_MENU_MODULES.map((module: MegaMenuModule) => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module.path)}
              className="group relative flex items-start space-x-3 p-3 rounded-xl border border-[#14425b] hover:border-[#ff6f32]/60 hover:bg-[#ff6f32]/10 transition-all duration-150 cursor-pointer text-left bg-[#0a2736] shadow-sm hover:shadow-md"
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleModuleClick(module.path);
                }
              }}
            >
              {/* Outline Icon Box */}
              <div
                className={`p-2 rounded-lg border bg-[#071c26] border-[#14425b] group-hover:border-[#ff6f32]/50 transition-transform duration-150 group-hover:scale-105 shrink-0 mt-0.5`}
              >
                <DynamicIcon
                  name={module.iconName}
                  size={18}
                  strokeWidth={2}
                  className="text-[#ff6f32]"
                />
              </div>

              {/* Module Text & Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#ff6f32] transition leading-snug truncate">
                    {module.title}
                  </h4>
                  {module.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#071c26] text-slate-300 border border-[#14425b] group-hover:border-[#ff6f32]/30 transition shrink-0">
                      {module.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {module.description}
                </p>
              </div>

              {/* Subtle Arrow on hover */}
              <div className="text-slate-500 group-hover:text-[#ff6f32] transition shrink-0 self-center">
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Mega-Menu Footer Banner */}
        <div className="mt-5 pt-4 border-t border-[#0f3446] bg-[#051720] text-slate-300 -mx-4 -mb-6 px-6 py-3.5 rounded-b-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={16} className="text-[#ff6f32] shrink-0" />
            <span className="font-medium text-slate-300">
              Enterprise Compliant: SOC2 Type II, GDPR, ISO 27001, and Multi-Currency Decimal Precision.
            </span>
          </div>

          <div className="flex items-center space-x-4 font-semibold text-xs">
            <Link
              to="/reports"
              onClick={onClose}
              className="text-slate-300 hover:text-white transition flex items-center space-x-1"
            >
              <Zap size={13} className="text-[#ff6f32]" />
              <span>Explore Analytics</span>
            </Link>
            <button
              onClick={() => {
                onClose();
                onRequestDemo();
              }}
              className="text-[#ff6f32] hover:text-[#ea580c] hover:underline flex items-center space-x-1 font-bold cursor-pointer"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
