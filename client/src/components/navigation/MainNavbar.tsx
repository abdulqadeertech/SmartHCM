import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Search,
  Menu,
  CalendarDays,
  User,
  LayoutDashboard,
  Building2,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  FileText,
  BookOpen,
  Code2,
  Globe2,
  Users2,
  Layers,
} from 'lucide-react';
import { UTILITY_BAR_CONFIG } from '../../data/navigationData';
import { MegaMenu } from './MegaMenu';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface MainNavbarProps {
  onRequestDemo: () => void;
  onApplyAsCompany: () => void;
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  onContactSales?: () => void;
}

export const MainNavbar: React.FC<MainNavbarProps> = ({
  onRequestDemo,
  onApplyAsCompany,
  onOpenSearch,
  onOpenMobileMenu,
  onContactSales,
}) => {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const solutionsRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  const isLandingPage = location.pathname === '/' || location.pathname === '/home';

  const handleNavClick = (anchorId: string) => {
    setMegaMenuOpen(false);
    setSolutionsDropdownOpen(false);
    setResourcesDropdownOpen(false);
    if (isLandingPage) {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/#${anchorId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(event.target as Node)) {
        setSolutionsDropdownOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="relative bg-[#071c26]/95 backdrop-blur-md border-b border-[#0e3547] sticky top-0 z-40 transition-colors shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Left Brand & Logo */}
          <div className="flex items-center space-x-2 sm:space-x-6 lg:space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-3 group rounded-lg p-1"
              aria-label="SmartHCM Home"
            >
              {/* Modern Enterprise HR Platform Emblem */}
              <div className="relative flex items-center justify-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0a2736] border border-[#14425b] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
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
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#ff6f32] border-2 border-[#071c26] shadow-2xs" />
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                    Smart<span className="text-[#ff6f32]">HCM</span>
                  </span>
                  <span className="hidden sm:inline text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-[#0a2736] text-[#ff6f32] rounded border border-[#14425b]">
                    Enterprise
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] font-medium text-slate-400 tracking-tight leading-none">
                  Human Capital Management Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 text-slate-300">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg text-xs font-semibold hover:text-[#ff6f32] hover:bg-white/5 transition cursor-pointer"
              >
                Home
              </Link>

              {/* Platform Dropdown Trigger */}
              <button
                type="button"
                onClick={() => {
                  setMegaMenuOpen(!megaMenuOpen);
                  setSolutionsDropdownOpen(false);
                  setResourcesDropdownOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  megaMenuOpen
                    ? 'text-[#ff6f32] bg-[#ff6f32]/10 border border-[#ff6f32]/30'
                    : 'hover:text-[#ff6f32] hover:bg-white/5'
                }`}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
              >
                <span>Platform</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    megaMenuOpen ? 'rotate-180 text-[#ff6f32]' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Solutions Dropdown */}
              <div className="relative" ref={solutionsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setSolutionsDropdownOpen(!solutionsDropdownOpen);
                    setMegaMenuOpen(false);
                    setResourcesDropdownOpen(false);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    solutionsDropdownOpen
                      ? 'text-[#ff6f32] bg-[#ff6f32]/10 border border-[#ff6f32]/30'
                      : 'hover:text-[#ff6f32] hover:bg-white/5'
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      solutionsDropdownOpen ? 'rotate-180 text-[#ff6f32]' : 'text-slate-400'
                    }`}
                  />
                </button>

                {solutionsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-[#08222f] border border-[#14425b] rounded-2xl shadow-2xl py-2 z-50 text-left animate-fadeIn">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#0f3446]">
                      Organizational Solutions
                    </div>
                    {[
                      {
                        title: 'Small & Medium Businesses',
                        desc: 'Automate core records and zero-error payroll.',
                        icon: Users2,
                        id: 'solutions',
                      },
                      {
                        title: 'High-Growth Scaleups',
                        desc: 'Rapid hiring pipelines and automated onboarding.',
                        icon: Briefcase,
                        id: 'solutions',
                      },
                      {
                        title: 'Corporate HR Departments',
                        desc: 'Strict labor policies, hierarchies & compliance.',
                        icon: Building2,
                        id: 'solutions',
                      },
                      {
                        title: 'Multi-Location Organizations',
                        desc: 'Branch-level shifts, calendars & local tax codes.',
                        icon: Globe2,
                        id: 'solutions',
                      },
                      {
                        title: 'Distributed & Remote Teams',
                        desc: 'GPS-geofenced mobile check-ins & self-service.',
                        icon: Layers,
                        id: 'solutions',
                      },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleNavClick(item.id)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-[#ff6f32]/10 flex items-start space-x-3 transition group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-[#071c26] border border-[#14425b] text-[#ff6f32] mt-0.5 group-hover:scale-105 group-hover:border-[#ff6f32]/40 transition-transform">
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-[#ff6f32] transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 leading-tight">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative" ref={resourcesRef}>
                <button
                  type="button"
                  onClick={() => {
                    setResourcesDropdownOpen(!resourcesDropdownOpen);
                    setMegaMenuOpen(false);
                    setSolutionsDropdownOpen(false);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    resourcesDropdownOpen
                      ? 'text-[#ff6f32] bg-[#ff6f32]/10 border border-[#ff6f32]/30'
                      : 'hover:text-[#ff6f32] hover:bg-white/5'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      resourcesDropdownOpen ? 'rotate-180 text-[#ff6f32]' : 'text-slate-400'
                    }`}
                  />
                </button>

                {resourcesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#08222f] border border-[#14425b] rounded-2xl shadow-2xl py-2 z-50 text-left animate-fadeIn">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#0f3446]">
                      Knowledge & Trust
                    </div>
                    {[
                      {
                        title: 'Statutory Compliance Hub',
                        desc: 'Labor law formulas and tax rules.',
                        icon: ShieldCheck,
                        action: () => handleNavClick('trust'),
                      },
                      {
                        title: 'HCM Wiki & Knowledge Base',
                        desc: 'Formulas, overtime laws & guides.',
                        icon: BookOpen,
                        action: () => handleNavClick('faq'),
                      },
                      {
                        title: 'Implementation Methodology',
                        desc: '14-day zero downtime migration guide.',
                        icon: FileText,
                        action: () => handleNavClick('how-it-works'),
                      },
                      {
                        title: 'REST API & Webhooks',
                        desc: 'Biometric terminals and ERP connectors.',
                        icon: Code2,
                        action: () => handleNavClick('platform'),
                      },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setResourcesDropdownOpen(false);
                            item.action();
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-[#ff6f32]/10 flex items-start space-x-3 transition group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-[#071c26] border border-[#14425b] text-[#ff6f32] mt-0.5 group-hover:scale-105 group-hover:border-[#ff6f32]/40 transition-transform">
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-[#ff6f32] transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 leading-tight">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('pricing')}
                className="px-3 py-2 rounded-lg text-xs font-semibold hover:text-[#ff6f32] hover:bg-white/5 transition cursor-pointer"
              >
                Pricing
              </button>

              <button
                onClick={() => {
                  if (onContactSales) {
                    onContactSales();
                  } else {
                    handleNavClick('contact');
                  }
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold hover:text-[#ff6f32] hover:bg-white/5 transition cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-300 bg-[#0a2736] hover:bg-[#0c2f42] border border-[#14425b] hover:border-[#ff6f32]/40 text-xs font-medium items-center space-x-2 transition cursor-pointer"
              title="Search Modules & Tools (Ctrl+K)"
              aria-label="Search"
            >
              <Search size={14} className="text-slate-400" />
              <span className="text-[11px] text-slate-400 font-mono">⌘K</span>
            </button>

            {/* User Session status or Log In */}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-[#14425b] bg-[#0a2736] text-xs font-semibold text-slate-200 hover:border-[#ff6f32]/50 transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#071c26] text-white border border-[#14425b] flex items-center justify-center text-[10px] font-bold">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <span className="hidden md:inline">{user?.firstName || 'Dashboard'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-[#ff6f32] hover:bg-white/5 transition"
              >
                <User size={14} className="text-slate-400" />
                <span>Log in</span>
              </Link>
            )}

            {/* Book a Demo Button (Red Brand Accent) */}
            <button
              onClick={onRequestDemo}
              className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs py-2 px-3.5 sm:px-4 sm:py-2.5 rounded-xl shadow-md transition-all duration-200 flex items-center space-x-1.5 cursor-pointer group hover:shadow-lg hover:shadow-orange-950/40"
              aria-label="Book a Guided Demo"
            >
              <CalendarDays size={14} className="text-white" />
              <span className="hidden sm:inline">Book a Demo</span>
              <span className="sm:hidden">Demo</span>
              <ArrowRight size={13} className="hidden sm:inline group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#0a2736] border border-[#14425b] transition cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Platform Mega-Menu */}
      <MegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        onRequestDemo={onRequestDemo}
      />
    </nav>
  );
};
