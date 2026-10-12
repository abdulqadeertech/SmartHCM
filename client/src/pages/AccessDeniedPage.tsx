import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();
  const { t, isRtl } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center text-left">
      <div className="bg-[#08222f] border border-[#14425b] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
          <ShieldAlert size={36} />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
          {t('access.denied_title', 'Access Denied')}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed">
          {t('access.denied_desc', 'You do not have administrative authorization to view this module.')}
        </p>

        {user && (
          <div className="bg-[#051822] border border-[#14425b] rounded-xl px-4 py-2.5 mb-6 text-xs text-slate-300 font-mono">
            <span>Your current role: </span>
            <strong className="text-[#ff6f32]">{user.role}</strong>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#14425b] bg-[#071c26] text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#0c2f42] transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} className={isRtl ? 'rotate-180' : ''} />
            <span>{t('action.back', 'Back')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ff6f32] hover:bg-[#ea580c] text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-[#ff6f32]/25 cursor-pointer"
          >
            <LayoutDashboard size={14} />
            <span>{t('access.return_dashboard', 'Permitted Dashboard')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
