import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
];

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation items
    'nav.dashboard': 'Dashboard',
    'nav.superadmin': 'Super Admin Portal',
    'nav.employees': 'Employee Directory',
    'nav.organization': 'Organization & Structure',
    'nav.assets': 'Hardware Assets',
    'nav.attendance': 'Biometric Attendance',
    'nav.leaves': 'Leave Management',
    'nav.workflows': 'Approval Workflows',
    'nav.payroll': 'Payroll & Tax Engine',
    'nav.recruitment': 'Recruitment & ATS',
    'nav.performance': 'Performance & Goals',
    'nav.helpdesk': 'HR Help Desk',
    'nav.reports': 'Analytics & BI Reports',
    'nav.audit': 'Compliance Audit Trail',

    // Navigation groups
    'navgroup.overview': 'Overview',
    'navgroup.platform': 'Platform Engine',
    'navgroup.core_hr': 'Core HR & Workforce',
    'navgroup.operations': 'Time & Operations',
    'navgroup.compensation': 'Compensation',
    'navgroup.talent': 'Talent & Growth',
    'navgroup.governance': 'Governance & Service',

    // Actions & Common Buttons
    'action.login': 'Log In',
    'action.signin': 'Sign In',
    'action.signup': 'Sign Up',
    'action.register': 'Register Company',
    'action.logout': 'Sign Out',
    'action.back': 'Back',
    'action.save': 'Save Changes',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.submit': 'Submit',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.export': 'Export CSV',
    'action.import': 'Import CSV',
    'action.confirm': 'Confirm',
    'action.close': 'Close',
    'action.refresh': 'Refresh',
    'action.view': 'View Details',
    'action.clock_in': 'Clock In',
    'action.clock_out': 'Clock Out',
    'action.apply_leave': 'Apply for Leave',
    'action.add_employee': 'Provision Employee',
    'action.add_department': 'Add Department',
    'action.add_branch': 'Add Branch',
    'action.add_designation': 'Add Designation',
    'action.add_shift': 'Add Shift',
    'action.create_ticket': 'New Support Ticket',
    'action.create_job': 'Post New Opening',
    'action.create_candidate': 'Add Candidate',
    'action.set_goal': 'Set Strategic Goal',
    'action.register_asset': 'Register Asset',
    'action.assign_asset': 'Assign to Employee',
    'action.run_payroll': 'Run Monthly Payroll',
    'action.switch_workspace': 'Switch Workspace',
    'action.quick_persona': '1-Click Test Personas',

    // Common labels
    'label.status': 'Status',
    'label.active': 'Active',
    'label.pending': 'Pending',
    'label.suspended': 'Suspended',
    'label.rejected': 'Rejected',
    'label.approved': 'Approved',
    'label.action': 'Actions',
    'label.date': 'Date',
    'label.time': 'Time',
    'label.department': 'Department',
    'label.designation': 'Designation',
    'label.branch': 'Branch',
    'label.shift': 'Shift',
    'label.role': 'Role',
    'label.email': 'Work Email Address',
    'label.password': 'Password',
    'label.confirm_password': 'Confirm Password',
    'label.first_name': 'First Name',
    'label.last_name': 'Last Name',
    'label.phone': 'Phone Number',
    'label.company_name': 'Company / Organization Name',
    'label.workspace_slug': 'Workspace Identifier',
    'label.search_placeholder': 'Search records...',
    'label.notifications': 'Notifications',
    'label.all': 'All',
    'label.total': 'Total',
    'label.success': 'Success',
    'label.error': 'Error',
    'label.warning': 'Warning',
    'label.loading': 'Loading data...',
    'label.no_records': 'No records found.',
    'label.theme_light': 'Switch to Light Theme',
    'label.theme_dark': 'Switch to Dark Theme',
    'label.language': 'Language',

    // Access Denied
    'access.denied_title': 'Access Denied',
    'access.denied_desc': 'You do not have administrative authorization to view this module.',
    'access.return_dashboard': 'Return to Permitted Dashboard',

    // Authentication
    'auth.welcome_back': 'Welcome Back to SmartHCM',
    'auth.subtitle': 'Enterprise Human Capital Management & Workforce Cloud Suite',
    'auth.tab_login': 'Sign In',
    'auth.tab_signup': 'Create Account',
    'auth.dont_have_account': "Don't have an account?",
    'auth.already_have_account': 'Already registered?',
    'auth.forgot_password': 'Forgot Password?',
    'auth.reset_password': 'Reset Account Password',
    'auth.send_reset_link': 'Send Reset Link',
    'auth.signing_in': 'Signing in...',
    'auth.creating_account': 'Creating account...',
    'auth.remember_me': 'Remember this session',
    'auth.password_min': 'Password must contain at least 6 characters.',
  },
  ur: {
    // Navigation items
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.superadmin': 'سپر ایڈمن پورٹل',
    'nav.employees': 'ملازمین کی ڈائرکٹری',
    'nav.organization': 'ادارہ اور تنظیمی ڈھانچہ',
    'nav.assets': 'کمپنی اثاثہ جات',
    'nav.attendance': 'بایومیٹرک حاضری',
    'nav.leaves': 'چھٹیوں کا انتظام',
    'nav.workflows': 'منظوری کے ورک فلوز',
    'nav.payroll': 'تنخواہ اور ٹیکس انجن',
    'nav.recruitment': 'بھرتی اور ملازم انتخاب',
    'nav.performance': 'کارکردگی اور اہداف',
    'nav.helpdesk': 'ایچ آر ہیلپ ڈیسک',
    'nav.reports': 'تجزیات اور بزنس رپورٹس',
    'nav.audit': 'آڈٹ اور سیکیورٹی لاگز',

    // Navigation groups
    'navgroup.overview': 'عمومی جائزہ',
    'navgroup.platform': 'پلیٹ فارم انجن',
    'navgroup.core_hr': 'بنیادی ایچ آر اور افرادی قوت',
    'navgroup.operations': 'اوقات کار اور آپریشنز',
    'navgroup.compensation': 'معاوضہ اور تنخواہیں',
    'navgroup.talent': 'ترقی اور صلاحیت',
    'navgroup.governance': 'انتظام اور خدمات',

    // Actions & Common Buttons
    'action.login': 'لاگ ان کریں',
    'action.signin': 'سائن ان',
    'action.signup': 'نیا اکاؤنٹ بنائیں',
    'action.register': 'کمپنی رجسٹر کریں',
    'action.logout': 'لاگ آؤٹ',
    'action.back': 'واپس',
    'action.save': 'تبدیلیاں محفوظ کریں',
    'action.cancel': 'منسوخ کریں',
    'action.delete': 'حذف کریں',
    'action.edit': 'ترمیم کریں',
    'action.submit': 'جمع کرائیں',
    'action.search': 'تلاش کریں',
    'action.filter': 'فلٹر',
    'action.export': 'ایکسپورٹ CSV',
    'action.import': 'امپورٹ CSV',
    'action.confirm': 'تصدیق کریں',
    'action.close': 'بند کریں',
    'action.refresh': 'تازہ کریں',
    'action.view': 'تفصیلات دیکھیں',
    'action.clock_in': 'حاضری لگائیں (Clock In)',
    'action.clock_out': 'رخصتی درج کریں (Clock Out)',
    'action.apply_leave': 'چھٹی کی درخواست دیں',
    'action.add_employee': 'نیا ملازم شامل کریں',
    'action.add_department': 'شعبہ شامل کریں',
    'action.add_branch': 'برانچ شامل کریں',
    'action.add_designation': 'عہدہ شامل کریں',
    'action.add_shift': 'شفٹ شامل کریں',
    'action.create_ticket': 'نیا سپورٹ ٹکٹ',
    'action.create_job': 'نئی اسامی شائع کریں',
    'action.create_candidate': 'امیدوار شامل کریں',
    'action.set_goal': 'نیا ہدف مقرر کریں',
    'action.register_asset': 'نیا اثاثہ درج کریں',
    'action.assign_asset': 'ملازم کو تفویض کریں',
    'action.run_payroll': 'ماہانہ تنخواہ جاری کریں',
    'action.switch_workspace': 'ورک اسپیس تبدیل کریں',
    'action.quick_persona': '1-کلک ٹیسٹ کردار',

    // Common labels
    'label.status': 'حیثیت',
    'label.active': 'فعال',
    'label.pending': 'زیر التواء',
    'label.suspended': 'معطل',
    'label.rejected': 'مسترد',
    'label.approved': 'منظور شدہ',
    'label.action': 'اقدامات',
    'label.date': 'تاریخ',
    'label.time': 'وقت',
    'label.department': 'شعبہ',
    'label.designation': 'عہدہ',
    'label.branch': 'برانچ',
    'label.shift': 'شفٹ',
    'label.role': 'کردار (Role)',
    'label.email': 'دفتری ای میل ایڈریس',
    'label.password': 'پاس ورڈ',
    'label.confirm_password': 'پاس ورڈ کی تصدیق کریں',
    'label.first_name': 'پہلا نام',
    'label.last_name': 'خاندانی نام',
    'label.phone': 'فون نمبر',
    'label.company_name': 'کمپنی / ادارے کا نام',
    'label.workspace_slug': 'ورک اسپیس شناختی نام',
    'label.search_placeholder': 'ریکارڈ تلاش کریں...',
    'label.notifications': 'اطلاعات',
    'label.all': 'سب',
    'label.total': 'کل تعداد',
    'label.success': 'کامیابی',
    'label.error': 'خرابی',
    'label.warning': 'انتباہ',
    'label.loading': 'معلومات لوڈ ہو رہی ہیں...',
    'label.no_records': 'کوئی ریکارڈ نہیں ملا۔',
    'label.theme_light': 'لائٹ موڈ آن کریں',
    'label.theme_dark': 'ڈارک موڈ آن کریں',
    'label.language': 'زبان',

    // Access Denied
    'access.denied_title': 'رسائی ممنوع ہے (Access Denied)',
    'access.denied_desc': 'آپ کے تفویض کردہ کردار کے پاس اس ماڈیول کو کھولنے کی اجازت نہیں ہے۔',
    'access.return_dashboard': 'مجاز ڈیش بورڈ پر واپس جائیں',

    // Authentication
    'auth.welcome_back': 'سمارٹ ایچ سی ایم میں خوش آمدید',
    'auth.subtitle': 'انٹرپرائز ہیومن کیپیٹل مینجمنٹ اور کلاؤڈ سسٹم',
    'auth.tab_login': 'سائن ان',
    'auth.tab_signup': 'نیا اکاؤنٹ بنائیں',
    'auth.dont_have_account': 'کیا آپ کے پاس اکاؤنٹ نہیں ہے؟',
    'auth.already_have_account': 'پہلے سے رجسٹرڈ ہیں؟',
    'auth.forgot_password': 'پاس ورڈ بھول گئے؟',
    'auth.reset_password': 'اکاؤنٹ کا پاس ورڈ دوبارہ ترتیب دیں',
    'auth.send_reset_link': 'ری سیٹ لنک ارسال کریں',
    'auth.signing_in': 'لاگ ان ہو رہا ہے...',
    'auth.creating_account': 'اکاؤنٹ بنایا جا رہا ہے...',
    'auth.remember_me': 'مجھے لاگ ان رکھیں',
    'auth.password_min': 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا ضروری ہے۔',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  selectedLanguage: LanguageOption;
  isRtl: boolean;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('smarthcm_lang');
    if (saved === 'ur' || saved === 'en') return saved;
    return 'en';
  });

  const selectedLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const isRtl = language === 'ur';

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('smarthcm_lang', lang);
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    if (isRtl) {
      document.body.classList.add('font-urdu');
    } else {
      document.body.classList.remove('font-urdu');
    }
  }, [language, isRtl]);

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    if (langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS['en'];
    if (enDict[key]) {
      return enDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        selectedLanguage,
        isRtl,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useTranslation;

