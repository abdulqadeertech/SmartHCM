import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  Command,
  ChevronRight,
} from 'lucide-react';
import { MEGA_MENU_MODULES, MegaMenuModule } from '../../data/navigationData';
import { DynamicIcon } from '../common/DynamicIcon';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredModules = MEGA_MENU_MODULES.filter((mod: MegaMenuModule) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      mod.title.toLowerCase().includes(q) ||
      mod.description.toLowerCase().includes(q) ||
      mod.category.toLowerCase().includes(q) ||
      (mod.badge && mod.badge.toLowerCase().includes(q))
    );
  });

  const handleSelect = (mod: MegaMenuModule) => {
    onClose();
    navigate(mod.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredModules.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(0, filteredModules.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredModules[selectedIndex]) {
        handleSelect(filteredModules[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fadeIn"
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative bg-[#08222f] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#14425b] overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-label="Search SmartHCM Modules & Documentation"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#14425b] bg-[#071c26]">
          <Search size={18} className="text-[#ff6f32] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search all 16 HCM modules, payroll, attendance, workflows..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white mr-2"
              title="Clear search"
            >
              <X size={15} />
            </button>
          ) : null}
          <div className="flex items-center space-x-1 text-[10px] font-semibold text-slate-400 bg-[#051720] border border-[#14425b] px-1.5 py-0.5 rounded shadow-2xs">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {filteredModules.length > 0 ? (
            filteredModules.map((mod, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={mod.id}
                  onClick={() => handleSelect(mod)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#ff6f32]/15 text-white border border-[#ff6f32]/40 shadow-2xs'
                      : 'hover:bg-[#071c26] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border ${mod.iconBg} ${mod.iconBorder} shrink-0`}
                    >
                      <DynamicIcon name={mod.iconName} size={18} className={mod.iconColor} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate">
                          {mod.title}
                        </span>
                        {mod.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30">
                            {mod.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{mod.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3 text-xs text-slate-400">
                    <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                      {mod.path}
                    </span>
                    <ChevronRight size={14} className={isSelected ? 'text-[#ff6f32]' : 'text-slate-500'} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 px-4">
              <Search size={32} className="text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matching HCM modules found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for "payroll", "leave", "attendance", "recruitment", or "audit".
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#071c26] border-t border-[#14425b] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6f32]" />
            <span>SmartHCM Fast Navigator</span>
          </span>
        </div>
      </div>
    </div>
  );
};
