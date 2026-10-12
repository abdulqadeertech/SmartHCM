import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Phone,
  BookOpen,
  HelpCircle,
  Globe,
  ChevronDown,
  Check,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import {
  UTILITY_BAR_CONFIG,
  SUPPORTED_LANGUAGES,
  LanguageOption,
} from '../../data/navigationData';

interface TopUtilityBarProps {
  onOpenWiki: () => void;
  onOpenSupport: () => void;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  onOpenWiki,
  onOpenSupport,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(() => {
    const saved = localStorage.getItem('smarthcm_lang');
    if (saved) {
      const found = SUPPORTED_LANGUAGES.find((l) => l.code === saved);
      if (found) return found;
    }
    return SUPPORTED_LANGUAGES[0];
  });
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const applyLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    setLangMenuOpen(false);
    localStorage.setItem('smarthcm_lang', lang.code);
    const isRtl = lang.code === 'ar' || lang.code === 'ur';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang.code);
  };

  useEffect(() => {
    const isRtl = selectedLanguage.code === 'ar' || selectedLanguage.code === 'ur';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', selectedLanguage.code);
  }, []);

  // Close language dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-[#071c26] border-b border-[#0e3547] text-slate-300 text-xs transition-colors py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
        {/* Left Section: Corporate Identity, Contact & Business Hours */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-[11px] sm:text-xs">
          {/* Brand Mark in Top Bar */}
          <div className="hidden md:flex items-center space-x-2 text-white font-bold tracking-tight pr-3 border-r border-[#12394d]">
            <span className="w-2 h-2 rounded-full bg-[#ff6f32]" />
            <span className="text-white">Smart<span className="text-[#ff6f32]">HCM</span> Enterprise</span>
          </div>

          <a
            href="mailto:sales@smarthcm.io"
            className="flex items-center space-x-1.5 text-slate-300 hover:text-[#ff6f32] transition font-medium focus-visible:ring-1 focus-visible:ring-[#ff6f32] rounded px-1"
            title="Sales & Enterprise Inquiries"
          >
            <Mail size={13} className="text-[#ff6f32] shrink-0" />
            <span className="hidden sm:inline">sales@smarthcm.io</span>
            <span className="sm:hidden">sales@smarthcm.io</span>
          </a>

          <a
            href="tel:+18008492180"
            className="hidden sm:flex items-center space-x-1.5 text-slate-300 hover:text-[#ff6f32] transition font-medium focus-visible:ring-1 focus-visible:ring-[#ff6f32] rounded px-1"
            title="Corporate Inquiries Line"
          >
            <Phone size={13} className="text-[#ff6f32] shrink-0" />
            <span>+1 (800) 849-2180</span>
          </a>

          <div className="hidden lg:flex items-center space-x-1.5 text-slate-400 pl-3 border-l border-[#12394d]">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="text-[11px]">Mon – Fri: 8:00 AM – 6:00 PM EST</span>
          </div>
        </div>

        {/* Right Section: SLA, Wiki, Support, Language Selector & Socials */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-[11px] sm:text-xs">
          <div className="hidden xl:flex items-center space-x-1.5 text-slate-300 pr-3 border-r border-[#12394d]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300">99.99% SLA Guaranteed</span>
          </div>

          <button
            onClick={onOpenWiki}
            className="flex items-center space-x-1 text-slate-300 hover:text-[#ff6f32] transition font-medium py-0.5 px-1.5 rounded hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-[#ff6f32]"
            title="Browse Knowledge Base & Compliance"
          >
            <BookOpen size={13} className="text-[#ff6f32] shrink-0" />
            <span className="hidden sm:inline">HCM Wiki</span>
          </button>

          <button
            onClick={onOpenSupport}
            className="flex items-center space-x-1 text-slate-300 hover:text-[#ff6f32] transition font-medium py-0.5 px-1.5 rounded hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-[#ff6f32]"
            title="Enterprise Help Center"
          >
            <HelpCircle size={13} className="text-slate-400 shrink-0" />
            <span>Support</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1.5 font-medium py-0.5 px-2 rounded hover:bg-white/10 transition border border-[#16435c] bg-[#0c2837] text-slate-200 focus-visible:ring-1 focus-visible:ring-[#ff6f32]"
              aria-haspopup="true"
              aria-expanded={langMenuOpen}
              title="Select Language"
            >
              <Globe size={13} className="text-[#ff6f32]" />
              <span className="mr-0.5">{selectedLanguage.flag}</span>
              <span className="hidden sm:inline">{selectedLanguage.name}</span>
              <span className="sm:hidden">{selectedLanguage.code.split('-')[0].toUpperCase()}</span>
              <ChevronDown
                size={12}
                className={`text-slate-400 transition-transform duration-200 ${
                  langMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-[#0a2736] border border-[#14425b] rounded-lg shadow-xl py-1 z-50 text-xs animate-dropdown-slide"
                role="menu"
              >
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#14425b]">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => applyLanguage(lang)}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#12394d] transition ${
                      selectedLanguage.code === lang.code
                        ? 'bg-[#12394d] text-[#ff6f32] font-semibold'
                        : 'text-slate-200'
                    }`}
                    role="menuitem"
                  >
                    <span className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {selectedLanguage.code === lang.code && (
                      <Check size={13} className="text-[#ff6f32] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-[#12394d]">
            {UTILITY_BAR_CONFIG.socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#ff6f32] p-1 rounded hover:bg-white/5 transition"
                title={`Follow SmartHCM on ${social.label}`}
                aria-label={social.label}
              >
                {social.platform === 'linkedin' && (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                )}
                {social.platform === 'twitter' && (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                {social.platform === 'facebook' && (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                )}
                {social.platform === 'youtube' && (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
