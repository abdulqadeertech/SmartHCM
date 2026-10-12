import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LucideIcon,
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Briefcase,
  TrendingUp,
  Laptop,
  HelpCircle,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  UserCheck,
  Globe,
  Search,
  MessageCircle,
  BookOpen,
  ArrowLeft,
  Check,
  GitBranch,
  Bell,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageOption } from '../../context/LanguageContext';
import { UTILITY_BAR_CONFIG } from '../../data/navigationData';
import { RequestDemoModal } from '../modals/RequestDemoModal';
import { SearchModal } from '../modals/SearchModal';
import { WikiDrawer } from '../modals/WikiDrawer';
import { SupportModal } from '../modals/SupportModal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface NavigationGroup {
  name: string;
  items: {
    to: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }[];
}

export const AppLayout: React.FC = () => {
  const { user, logout, quickLogin, switchOrganization } = useAuth();
  const { t, language, setLanguage, isRtl } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [wikiDrawerOpen, setWikiDrawerOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Live Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close menus on outside click
  const notifRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(target)) {
        setWorkspaceMenuOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(target)) {
        setPersonaMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await apiRequest('/auth/notifications');
      if (res?.data && Array.isArray(res.data)) {
        setNotifications(res.data);
        const unread = res.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await apiRequest(`/auth/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // fallback
    }
  };

  const personas = [
    { name: 'Admin (System)', email: 'admin@novahcm.io', role: 'PLATFORM_SUPER_ADMIN' },
    { name: 'Sarah Jenkins (HR Manager)', email: 'sarah.jenkins@acmeglobal.com', role: 'HR_MANAGER' },
    { name: 'David Miller (Payroll)', email: 'david.miller@acmeglobal.com', role: 'PAYROLL_MANAGER' },
    { name: 'Alex Rivers (Dept Manager)', email: 'alex.rivers@acmeglobal.com', role: 'DEPT_MANAGER' },
    { name: 'Emily Watson (Employee)', email: 'emily.watson@acmeglobal.com', role: 'EMPLOYEE' },
  ];

  const handlePersonaSwitch = async (email: string) => {
    setPersonaMenuOpen(false);
    await quickLogin(email);
    success(`Role switched to ${email}`);
    navigate('/dashboard');
  };

  const handleWorkspaceSwitch = async (orgId: string) => {
    setWorkspaceMenuOpen(false);
    try {
      await switchOrganization(orgId);
      success('Switched active organization workspace');
      navigate('/dashboard');
    } catch (err: any) {
      toastError(err?.message || 'Failed to switch workspace');
    }
  };

  const userRole = user?.role || 'EMPLOYEE';
  const isSuperAdmin = Boolean(user?.isSuperAdmin || userRole === 'PLATFORM_SUPER_ADMIN');
  const isOrgAdmin = userRole === 'ORG_ADMIN';
  const isHr = ['HR_DIRECTOR', 'HR_MANAGER', 'HR_OFFICER'].includes(userRole);
  const isPayroll = userRole === 'PAYROLL_MANAGER';
  const isManager = userRole === 'DEPT_MANAGER';
  const isRecruiter = userRole === 'RECRUITER';
  const isAuditor = userRole === 'AUDITOR';

  // Role-Based Navigation Filtering
  const rawNavigationGroups: NavigationGroup[] = [
    {
      name: t('navgroup.overview', 'Overview'),
      items: [{ to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard }],
    },
    ...(isSuperAdmin
      ? [
          {
            name: t('navgroup.platform', 'Platform Engine'),
            items: [
              {
                to: '/superadmin',
                label: t('nav.superadmin', 'Super Admin Portal'),
                icon: ShieldCheck,
                badge: 'ROOT',
              },
            ],
          },
        ]
      : []),
    {
      name: t('navgroup.core_hr', 'Core HR & Workforce'),
      items: [
        { to: '/employees', label: t('nav.employees', 'Employee Directory'), icon: Users },
        ...((isSuperAdmin || isOrgAdmin || isHr)
          ? [{ to: '/organization', label: t('nav.organization', 'Organization & Structure'), icon: Building2 }]
          : []),
        { to: '/assets', label: t('nav.assets', 'Hardware Assets'), icon: Laptop },
      ],
    },
    {
      name: t('navgroup.operations', 'Time & Operations'),
      items: [
        { to: '/attendance', label: t('nav.attendance', 'Biometric Attendance'), icon: Clock },
        { to: '/leaves', label: t('nav.leaves', 'Leave Management'), icon: CalendarCheck },
        ...((isSuperAdmin || isOrgAdmin || isHr || isManager || isAuditor)
          ? [{ to: '/workflows', label: t('nav.workflows', 'Approval Workflows'), icon: GitBranch }]
          : []),
      ],
    },
    ...((isSuperAdmin || isOrgAdmin || isPayroll || isHr)
      ? [
          {
            name: t('navgroup.compensation', 'Compensation'),
            items: [{ to: '/payroll', label: t('nav.payroll', 'Payroll & Tax Engine'), icon: CreditCard }],
          },
        ]
      : []),
    {
      name: t('navgroup.talent', 'Talent & Growth'),
      items: [
        ...((isSuperAdmin || isOrgAdmin || isHr || isRecruiter)
          ? [{ to: '/recruitment', label: t('nav.recruitment', 'Recruitment & ATS'), icon: Briefcase }]
          : []),
        { to: '/performance', label: t('nav.performance', 'Performance & Goals'), icon: TrendingUp },
      ],
    },
    {
      name: t('navgroup.governance', 'Governance & Service'),
      items: [
        { to: '/helpdesk', label: t('nav.helpdesk', 'HR Help Desk'), icon: HelpCircle },
        ...((isSuperAdmin || isOrgAdmin || isHr || isPayroll || isAuditor)
          ? [{ to: '/reports', label: t('nav.reports', 'Analytics & BI Reports'), icon: BarChart3 }]
          : []),
        ...((isSuperAdmin || isOrgAdmin || isHr || isAuditor)
          ? [{ to: '/audit', label: t('nav.audit', 'Compliance Audit Trail'), icon: ShieldCheck }]
          : []),
      ],
    },
  ];

  const navigationGroups = rawNavigationGroups.filter((g) => g.items.length > 0);

  const currentOrg = user?.organization;
  const memberships = user?.memberships || [];
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#051720] flex flex-col text-left text-slate-100 transition-colors">
      {/* Top Utility Bar inside workspace */}
      <div className="bg-[#071c26] border-b border-[#0e3547] text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-3">
          {/* Universal Back Button */}
          {location.pathname !== '/dashboard' ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-1.5 text-[#ff6f32] hover:text-[#ea580c] font-semibold transition cursor-pointer"
              title="Return to previous screen"
            >
              <ArrowLeft size={13} className={isRtl ? 'rotate-180' : ''} />
              <span>{t('action.back', 'Back')}</span>
            </button>
          ) : (
            <Link
              to="/portal"
              className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition font-medium"
            >
              <span>SmartHCM Enterprise Cloud</span>
            </Link>
          )}

          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            Current Workspace: <strong className="text-white">{currentOrg?.name || 'Acme Global'}</strong>
            <span className="font-mono text-[10px] text-slate-400 ml-1">({currentOrg?.slug || 'acme-global'})</span>
            {currentOrg?.subscriptionPlan && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30">
                {currentOrg.subscriptionPlan}
              </span>
            )}
            {currentOrg?.status && currentOrg.status !== 'ACTIVE' && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  currentOrg.status === 'PENDING'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {currentOrg.status}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Working Centralized Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1 text-slate-300 hover:text-white transition font-medium cursor-pointer px-2 py-0.5 rounded-lg hover:bg-white/5"
            >
              <Globe size={13} className="text-[#ff6f32]" />
              <span>{currentLangObj.flag}</span>
              <span className="hidden sm:inline text-xs">{currentLangObj.nativeName}</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-[#08222f] border border-[#14425b] rounded-xl shadow-2xl py-1 z-50 text-xs animate-dropdown-slide">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#ff6f32]/10 transition cursor-pointer ${
                      language === lang.code ? 'text-[#ff6f32] font-bold' : 'text-slate-200'
                    }`}
                  >
                    <span>
                      {lang.flag} {lang.nativeName}
                    </span>
                    {language === lang.code && <Check size={12} className="text-[#ff6f32]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setWikiDrawerOpen(true)}
            className="hidden sm:flex items-center space-x-1 text-slate-300 hover:text-[#ff6f32] transition cursor-pointer"
          >
            <BookOpen size={12} className="text-[#ff6f32]" />
            <span>HCM Wiki</span>
          </button>
          <button
            onClick={() => setSupportModalOpen(true)}
            className="flex items-center space-x-1 text-slate-300 hover:text-[#ff6f32] transition cursor-pointer"
          >
            <HelpCircle size={12} className="text-[#ff6f32]" />
            <span>Support</span>
          </button>
          <a
            href={UTILITY_BAR_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1 text-emerald-400 hover:underline font-medium"
          >
            <MessageCircle size={12} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Workspace Header Shell */}
      <header className="bg-[#071c26] border-b border-[#0e3547] h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs transition-colors">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#0a2736] border border-transparent hover:border-[#14425b] transition cursor-pointer"
            title="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* SmartHCM Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0a2736] border border-[#14425b] flex items-center justify-center font-extrabold text-white text-sm shadow-xs relative">
              <span>S</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6f32] absolute -top-0.5 -right-0.5 ring-1 ring-[#071c26]" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                Smart<span className="text-[#ff6f32]">HCM</span>
              </span>
            </div>
          </Link>

          {/* Multi-Tenant Workspace Switcher Dropdown */}
          <div className="relative" ref={workspaceRef}>
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#0a2736] hover:bg-[#0c2f42] text-slate-200 rounded-xl text-xs font-semibold border border-[#14425b] hover:border-[#ff6f32]/40 transition cursor-pointer"
              title="Switch Active Company Workspace"
            >
              <Building2 size={13} className="text-[#ff6f32]" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                {currentOrg?.name || 'Select Workspace'}
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#08222f] border border-[#14425b] rounded-2xl shadow-2xl py-2 z-50 text-xs animate-dropdown-slide">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#0f3446]">
                  Company Workspaces
                </div>

                {memberships.length > 0 ? (
                  memberships.map((m: any, idx: number) => {
                    const isCurrent = m.organization.id === currentOrg?.id;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleWorkspaceSwitch(m.organization.id)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-[#ff6f32]/10 transition cursor-pointer ${
                          isCurrent
                            ? 'bg-[#ff6f32]/15 text-white font-bold border-l-2 border-[#ff6f32]'
                            : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{m.organization.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {m.organization.slug}.smarthcm.cloud • {m.role}
                          </div>
                        </div>
                        {isCurrent && <Check size={14} className="text-[#ff6f32]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3.5 py-2 text-slate-400">
                    {currentOrg?.name || 'Default Workspace'}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-[#0f3446] px-2">
                  <Link
                    to="/register"
                    onClick={() => setWorkspaceMenuOpen(false)}
                    className="w-full text-left px-3 py-2 flex items-center space-x-2 text-xs font-semibold text-[#ff6f32] hover:bg-[#ff6f32]/10 rounded-xl transition"
                  >
                    <Plus size={14} />
                    <span>Register New Company Workspace</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header: Search, ThemeToggle, Notifications, Persona, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Search */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 bg-[#0a2736] hover:bg-[#0c2f42] text-slate-300 px-3 py-1.5 rounded-xl text-xs border border-[#14425b] hover:border-[#ff6f32]/40 transition cursor-pointer"
            title="Search modules and employee tools (⌘K)"
          >
            <Search size={13} className="text-[#ff6f32]" />
            <span className="text-xs">Search...</span>
            <span className="text-[10px] font-mono text-slate-400 bg-[#071c26] px-1 py-0.5 rounded border border-[#14425b]">
              ⌘K
            </span>
          </button>

          {/* Real Light / Dark Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0a2736] hover:bg-[#0c2f42] border border-[#14425b] hover:border-[#ff6f32]/40 transition relative cursor-pointer"
              title="Notifications & Operational Alerts"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6f32] animate-pulse" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#08222f] border border-[#14425b] rounded-2xl shadow-2xl py-2 z-50 text-xs animate-dropdown-slide">
                <div className="px-4 py-2 border-b border-[#0f3446] flex items-center justify-between">
                  <div className="font-bold text-white">Operational Alerts</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff6f32]/20 text-[#ff6f32] border border-[#ff6f32]/30 font-bold">
                    {unreadCount} unread
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#0f3446]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className={`p-3 text-left transition hover:bg-[#ff6f32]/10 cursor-pointer ${
                        !n.isRead ? 'bg-[#ff6f32]/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-white leading-snug">
                          {n.title}
                        </div>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6f32] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setNotificationsOpen(false)}
                          className="text-[10px] text-[#ff6f32] font-semibold hover:underline inline-block mt-1"
                        >
                          View module →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Persona Switcher Dropdown */}
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="hidden sm:flex items-center space-x-1.5 bg-[#0a2736] hover:bg-[#0c2f42] text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#14425b] hover:border-[#ff6f32]/40 transition cursor-pointer"
              title="Switch role for testing"
            >
              <UserCheck size={13} className="text-[#ff6f32]" />
              <span className="hidden md:inline text-slate-400">Role:</span>
              <span className="text-[#ff6f32] font-bold">{user?.role}</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#08222f] border border-[#14425b] rounded-2xl shadow-2xl py-2 z-50 text-xs animate-dropdown-slide">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#0f3446]">
                  Test Personas (1-Click)
                </div>
                {personas.map((p) => (
                  <button
                    key={p.email}
                    onClick={() => handlePersonaSwitch(p.email)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#ff6f32]/10 transition cursor-pointer ${
                      user?.email === p.email
                        ? 'bg-[#ff6f32]/15 text-[#ff6f32] font-bold border-l-2 border-[#ff6f32]'
                        : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.email}</div>
                    </div>
                    {user?.email === p.email && <Check size={14} className="text-[#ff6f32]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative pl-1" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-[#0a2736] transition cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-[#0a2736] border border-[#14425b] text-[#ff6f32] flex items-center justify-center text-xs font-bold shadow-2xs">
                {user?.firstName?.[0] || 'U'}
                {user?.lastName?.[0] || ''}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-bold text-white leading-tight">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[10px] text-slate-400">{user?.role}</div>
              </div>
              <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#08222f] border border-[#14425b] rounded-2xl shadow-2xl py-2 z-50 text-xs animate-dropdown-slide">
                <div className="px-3.5 py-2 border-b border-[#0f3446]">
                  <div className="font-bold text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                </div>

                <div className="py-1">
                  {isSuperAdmin && (
                    <Link
                      to="/superadmin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center space-x-2 text-[#ff6f32] hover:text-white hover:bg-[#ff6f32]/10 font-semibold"
                    >
                      <ShieldCheck size={14} className="text-[#ff6f32]" />
                      <span>Super Admin Engine</span>
                    </Link>
                  )}
                  {(isSuperAdmin || isOrgAdmin || isHr) && (
                    <Link
                      to="/organization"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-[#ff6f32]/10"
                    >
                      <Building2 size={14} className="text-[#ff6f32]" />
                      <span>Workspace Settings</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setWikiDrawerOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-[#ff6f32]/10 cursor-pointer"
                  >
                    <BookOpen size={14} className="text-[#ff6f32]" />
                    <span>SmartHCM Wiki</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setSupportModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-[#ff6f32]/10 cursor-pointer"
                  >
                    <HelpCircle size={14} className="text-[#ff6f32]" />
                    <span>Technical Support</span>
                  </button>
                </div>

                <div className="border-t border-[#0f3446] pt-1">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center space-x-2 text-rose-400 hover:bg-rose-950/40 font-semibold cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>{t('action.logout', 'Sign Out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Workspace Pending/Suspended Administrative Banners */}
      {currentOrg?.status === 'PENDING' && (
        <div className="bg-amber-950/60 border-b border-amber-600/30 px-4 sm:px-6 py-2 text-amber-200 text-xs flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span>
              <strong>Workspace Verification Pending:</strong> This organization account is undergoing administrative verification.
            </span>
          </div>
          {isSuperAdmin && (
            <Link
              to="/superadmin"
              className="text-amber-300 hover:text-white underline font-semibold ml-3 shrink-0 text-[11px]"
            >
              Review in Super Admin →
            </Link>
          )}
        </div>
      )}

      {currentOrg?.status === 'SUSPENDED' && (
        <div className="bg-rose-950/70 border-b border-rose-600/40 px-4 sm:px-6 py-2 text-rose-200 text-xs flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <span>
              <strong>Workspace Suspended:</strong> Access for this tenant has been restricted by platform administration{currentOrg.suspendedReason ? `: ${currentOrg.suspendedReason}` : '.'}
            </span>
          </div>
          {isSuperAdmin && (
            <Link
              to="/superadmin"
              className="text-rose-300 hover:text-white underline font-semibold ml-3 shrink-0 text-[11px]"
            >
              Manage in Super Admin →
            </Link>
          )}
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Role-filtered Groups */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-[#071c26] border-r border-[#0e3547] transition-all duration-200 flex flex-col justify-between shrink-0 select-none shadow-card`}
        >
          <div className="py-4 overflow-y-auto">
            {navigationGroups.map((group, gIdx) => (
              <div key={gIdx} className="mb-4">
                {sidebarOpen && (
                  <div className="px-4 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.name}
                  </div>
                )}
                <nav className="space-y-0.5 px-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                            isActive
                              ? 'bg-[#08222f] text-white shadow-xs border-l-[3px] border-[#ff6f32]'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          } ${!sidebarOpen ? 'justify-center px-0' : ''}`
                        }
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              size={17}
                              className={`shrink-0 ${
                                isActive ? 'text-[#ff6f32]' : 'text-slate-400 group-hover:text-white'
                              }`}
                            />
                            {sidebarOpen && <span className="truncate">{item.label}</span>}
                            {sidebarOpen && item.badge && (
                              <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded bg-[#ff6f32]/20 text-[#ff6f32] border border-[#ff6f32]/30 tracking-wider">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Footer info */}
          {sidebarOpen && (
            <div className="p-4 border-t border-[#0e3547] text-xs text-slate-400 bg-[#051720]">
              <div className="font-bold text-slate-200">SmartHCM Enterprise</div>
              <div className="text-[11px] text-slate-400">Multi-Tenant Cloud Suite</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Tenant Boundary Verified</span>
              </div>
            </div>
          )}
        </aside>

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#051720] text-slate-100 transition-colors">
          <Outlet />
        </main>
      </div>

      {/* Workspace Overlays */}
      <RequestDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
      <WikiDrawer
        isOpen={wikiDrawerOpen}
        onClose={() => setWikiDrawerOpen(false)}
      />
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
