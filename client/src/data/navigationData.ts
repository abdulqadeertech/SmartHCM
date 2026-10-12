export interface MegaMenuModule {
  id: string;
  title: string;
  description: string;
  iconName: string;
  path: string;
  badge?: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  category: 'core' | 'compensation' | 'talent' | 'analytics';
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'youtube';
  label: string;
  url: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
}

export const UTILITY_BAR_CONFIG = {
  supportEmail: 'aq0871633@gmail.com',
  salesEmail: 'aq0871633@gmail.com',
  phone: '03273726496',
  whatsappUrl: 'https://wa.me/923273726496?text=Hello%20SmartHCM%20team%2C%20I%20am%20interested%20in%20a%20live%20walkthrough%20of%20the%20SmartHCM%20platform.',
  supportUrl: '#support',
  wikiUrl: '#wiki',
  socialLinks: [
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/company/smarthcm-cloud',
    },
    {
      platform: 'twitter',
      label: 'X (Twitter)',
      url: 'https://twitter.com/smarthcm_cloud',
    },
    {
      platform: 'facebook',
      label: 'Facebook',
      url: 'https://www.facebook.com/smarthcm.cloud',
    },
    {
      platform: 'youtube',
      label: 'YouTube',
      url: 'https://www.youtube.com/@smarthcm-cloud',
    },
  ] as SocialLink[],
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
];

export const MEGA_MENU_MODULES: MegaMenuModule[] = [
  {
    id: 'core-hr',
    title: 'Core HR',
    description: 'Centralized digital employee profiles, org structure hierarchy & designations.',
    iconName: 'Users',
    path: '/employees',
    badge: 'Core',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'core',
  },
  {
    id: 'payroll-benefits',
    title: 'Payroll & Benefits',
    description: 'Statutory salary processing, tax withholding, allowances & one-click payslips.',
    iconName: 'CreditCard',
    path: '/payroll',
    badge: 'Finance',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'compensation',
  },
  {
    id: 'leave-management',
    title: 'Leave Management',
    description: 'Holiday-aware leave allowances, balance tracking & multi-tier approval rules.',
    iconName: 'CalendarCheck',
    path: '/leaves',
    badge: 'Popular',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'compensation',
  },
  {
    id: 'attendance-shifts',
    title: 'Attendance & Shifts',
    description: 'Biometric punches, shift roster scheduling, grace periods & late arrivals.',
    iconName: 'Clock',
    path: '/attendance',
    badge: 'Biometric',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'compensation',
  },
  {
    id: 'workflow-automation',
    title: 'Workflow Automation',
    description: 'Configurable approval paths, automated notifications & escalation triggers.',
    iconName: 'Workflow',
    path: '/workflows',
    badge: 'Automated',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'core',
  },
  {
    id: 'training-learning',
    title: 'Training & Learning',
    description: 'Skill competency matrices, course tracking, LMS catalogs & certification paths.',
    iconName: 'GraduationCap',
    path: '/performance',
    badge: 'Growth',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'talent',
  },
  {
    id: 'performance-reviews',
    title: 'Performance Reviews',
    description: 'Quarterly OKRs, measurable KPI tracking, 360-degree feedback & appraisal cycles.',
    iconName: 'TrendingUp',
    path: '/performance',
    badge: 'OKRs',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'talent',
  },
  {
    id: 'recruitment',
    title: 'Recruitment',
    description: 'Applicant Tracking System (ATS), job requisition stages & candidate scoring.',
    iconName: 'Briefcase',
    path: '/recruitment',
    badge: 'ATS',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'talent',
  },
  {
    id: 'employee-requests',
    title: 'Employee Requests',
    description: 'HR service desk ticketing, salary letters, inquiries & resolution tracker.',
    iconName: 'MessageSquareText',
    path: '/helpdesk',
    badge: 'HelpDesk',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'core',
  },
  {
    id: 'document-center',
    title: 'Document Center',
    description: 'Company equipment custody, hardware warranties, contracts & policy archive.',
    iconName: 'FileText',
    path: '/assets',
    badge: 'Secure',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'core',
  },
  {
    id: 'overtime-management',
    title: 'Overtime Management',
    description: 'Daily and weekend overtime calculations, multiplier tiers & payroll sync.',
    iconName: 'Timer',
    path: '/attendance',
    badge: 'Rules',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'compensation',
  },
  {
    id: 'employee-self-service',
    title: 'Employee Self-Service',
    description: 'Dedicated portal for punch clock, leave requests, personal profile & payslips.',
    iconName: 'UserCheck',
    path: '/dashboard',
    badge: 'ESS',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'core',
  },
  {
    id: 'reports-analytics',
    title: 'Reports & Analytics',
    description: 'Live workforce headcount charts, attendance metrics, turnover & CSV export.',
    iconName: 'BarChart3',
    path: '/reports',
    badge: 'BI',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'analytics',
  },
  {
    id: 'mobile-workforce',
    title: 'Mobile Workforce',
    description: 'Geolocation punch validation, mobile ESS app, shift alerts & offline sync.',
    iconName: 'Smartphone',
    path: '/attendance',
    badge: 'Mobile',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'core',
  },
  {
    id: 'final-settlement',
    title: 'Final Settlement',
    description: 'End-of-service gratuity calculation, leave encashment & offboarding clearance.',
    iconName: 'CheckCheck',
    path: '/payroll',
    badge: 'Exit',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'compensation',
  },
  {
    id: 'all-modules',
    title: 'All Modules',
    description: 'Enterprise catalog with 50+ HCM extensions, API webhooks & custom plugins.',
    iconName: 'LayoutGrid',
    path: '/dashboard',
    badge: 'Suite',
    iconBg: 'bg-[#071c26]',
    iconBorder: 'border-[#14425b]',
    iconColor: 'text-[#ff6f32]',
    category: 'analytics',
  },
];

export const WIKI_ARTICLES: WikiArticle[] = [
  {
    id: 'statutory-payroll',
    title: 'Statutory Payroll Calculation & Tax Formulas',
    category: 'Compensation',
    readTime: '4 min read',
    summary: 'How gross earnings, basic pay (50%), PF withholding (12%) and progressive income tax brackets calculate.',
    content: 'SmartHCM handles decimal-precise monthly payroll calculations across all configured branches. The base formula allocates 50% to Basic Salary and 50% to taxable allowances. Statutory Provident Fund deductions (12% of basic) and income tax withholding (5% base threshold) are calculated atomically and locked upon period finalization.',
  },
  {
    id: 'biometric-attendance',
    title: 'Biometric Integration & Shift Grace Periods',
    category: 'Time & Attendance',
    readTime: '3 min read',
    summary: 'Configuring network biometric terminals, 15-minute grace thresholds, and automated half-day deductions.',
    content: 'SmartHCM syncs biometric punch timestamps via REST webhooks and local agent daemons. Shifts enforce standard 9-hour work days with a default 15-minute grace period. Punch-ins past the grace period mark the attendance record as LATE, while missing checkouts automatically flag an exception for manager review.',
  },
  {
    id: 'leave-entitlement',
    title: 'Holiday-Aware Leave Accrual & Multi-tier Approvals',
    category: 'Leave Management',
    readTime: '5 min read',
    summary: 'Annual, Sick, and Casual leave allocations, holiday calendar exclusions, and workflow escalation.',
    content: 'Leave requests cross-reference official public holidays registered in the organization branch calendar. Working days are accurately computed so weekends and holidays are never deducted from an employee balance. Approvals execute atomically via transactional database updates.',
  },
  {
    id: 'rbac-security',
    title: 'Enterprise Role-Based Access Control (RBAC)',
    category: 'Governance & Security',
    readTime: '6 min read',
    summary: 'Overview of the 10 platform roles, tenant isolation boundaries, and tamper-evident audit trail.',
    content: 'All queries are strictly partitioned by organizationId. Roles span from PLATFORM_SUPER_ADMIN down to department managers and individual employees. Sensitive financial data such as employee base pay is masked from unauthorized viewers, and every change is recorded in the immutable audit log.',
  },
];
