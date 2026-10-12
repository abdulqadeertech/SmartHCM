import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showBack?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, showBack = true }) => {
  const navigate = useNavigate();
  const { t, isRtl } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-3 text-xs">
      <nav className="flex items-center space-x-1.5 text-slate-400 flex-wrap" aria-label="Breadcrumb">
        <Link
          to="/dashboard"
          className="hover:text-[#ff6f32] transition flex items-center p-1 rounded hover:bg-white/5"
          title="Dashboard"
        >
          <Home size={13} />
        </Link>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight size={12} className={`text-slate-500 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
              {isLast || !item.to ? (
                <span className="font-semibold text-slate-800 dark:text-white">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-[#ff6f32] text-slate-400 hover:underline transition"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#0a2736] border border-[#14425b] text-slate-300 hover:text-white hover:border-[#ff6f32]/50 transition text-xs font-semibold cursor-pointer shadow-2xs"
          title="Return to previous screen"
        >
          <ArrowLeft size={12} className={isRtl ? 'rotate-180' : ''} />
          <span>{t('action.back', 'Back')}</span>
        </button>
      )}
    </div>
  );
};
