import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Building2,
  Clock,
  Briefcase,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PersonaQuickBar: React.FC = () => {
  const { quickLogin, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const personas = [
    {
      role: 'HR_MANAGER',
      label: 'Sarah Jenkins',
      subtitle: 'HR Manager (Full Admin)',
      email: 'sarah.jenkins@acmeglobal.com',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      role: 'PAYROLL_MANAGER',
      label: 'David Miller',
      subtitle: 'Payroll & Compensation',
      email: 'david.miller@acmeglobal.com',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      role: 'DEPT_MANAGER',
      label: 'Alex Rivers',
      subtitle: 'Engineering Manager',
      email: 'alex.rivers@acmeglobal.com',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      role: 'EMPLOYEE',
      label: 'Emily Watson',
      subtitle: 'Staff Software Engineer',
      email: 'emily.watson@acmeglobal.com',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  const handleSwitch = async (email: string) => {
    setLoadingEmail(email);
    try {
      await quickLogin(email);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Instant 1-Click Evaluation
              </span>
              <span className="text-[10px] bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded font-mono">
                RBAC Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch roles immediately to explore custom permission scopes, approval gates & views:
            </p>
          </div>
        </div>

        {/* 1-Click Persona Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
          {personas.map((p) => {
            const isCurrent = user?.email === p.email;
            const isLoading = loadingEmail === p.email;
            return (
              <button
                key={p.email}
                disabled={isLoading}
                onClick={() => handleSwitch(p.email)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    {p.role.split('_')[0]}
                  </span>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-teal-400" />}
                </div>
                <div className="text-xs font-semibold text-white truncate">{p.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
