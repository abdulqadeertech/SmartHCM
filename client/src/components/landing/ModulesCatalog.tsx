import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { MEGA_MENU_MODULES, MegaMenuModule } from '../../data/navigationData';
import { DynamicIcon } from '../common/DynamicIcon';

interface ModulesCatalogProps {
  onRequestDemo: (moduleName?: string) => void;
}

export const ModulesCatalog: React.FC<ModulesCatalogProps> = ({ onRequestDemo }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All 16 Modules' },
    { id: 'core', label: 'Core HR & Workforce' },
    { id: 'compensation', label: 'Payroll & Time' },
    { id: 'talent', label: 'Talent & Growth' },
    { id: 'analytics', label: 'BI & Governance' },
  ];

  const filtered =
    activeCategory === 'all'
      ? MEGA_MENU_MODULES
      : MEGA_MENU_MODULES.filter((m) => m.category === activeCategory);

  return (
    <section id="modules" className="py-20 bg-[#051720] border-t border-[#14425b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff6f32] bg-[#ff6f32]/10 px-3 py-1 rounded-full border border-[#ff6f32]/30">
            Complete Product Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            16 Specialized Modules. One Unified Cloud.
          </h2>
          <p className="text-base text-slate-300 mt-3 leading-relaxed">
            Eliminate fragmented spreadsheets and disjointed tools. Every department in your organization
            runs on synchronized, real-time employee data.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-[#ff6f32] text-white shadow-xs'
                    : 'bg-[#071c26] text-slate-300 hover:text-white hover:bg-[#0b2b3c] border border-[#14425b]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Grid for Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((mod: MegaMenuModule) => (
            <div
              key={mod.id}
              className="bg-[#08222f] rounded-2xl p-5 border border-[#14425b] hover:border-[#ff6f32]/50 hover:shadow-xl transition-all duration-200 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl border border-[#ff6f32]/30 bg-[#ff6f32]/10 text-[#ff6f32] group-hover:scale-110 transition-transform">
                    <DynamicIcon name={mod.iconName} size={20} className="text-[#ff6f32]" />
                  </div>
                  {mod.badge && (
                    <span className="text-[10px] font-bold text-slate-300 bg-[#051822] border border-[#14425b] px-2 py-0.5 rounded-md">
                      {mod.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#ff6f32] transition">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#14425b] flex items-center justify-between">
                <Link
                  to={mod.path}
                  className="text-xs font-bold text-[#ff6f32] hover:text-[#ea580c] flex items-center space-x-1"
                >
                  <span>Explore Module</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => onRequestDemo(mod.title)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Demo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
