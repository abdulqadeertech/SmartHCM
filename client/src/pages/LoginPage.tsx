import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Phone,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { apiRequest } from '../api/client';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login, register, quickLogin, forgotPassword, isAuthenticated } = useAuth();
  const { t, language, setLanguage, isRtl } = useTranslation();
  const navigate = useNavigate();
  const { workspaceSlug } = useParams<{ workspaceSlug?: string }>();
  const [searchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Primary Mode: 'login' | 'signup'
  const initialMode = searchParams.get('mode') === 'signup' || window.location.pathname.includes('/signup') ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Workspace Specific Branding State
  const [workspaceInfo, setWorkspaceInfo] = useState<{
    name: string;
    slug: string;
    primaryColor?: string;
    logoUrl?: string;
  } | null>(null);

  // Workspace finder toggle
  const [showWorkspaceFinder, setShowWorkspaceFinder] = useState(false);
  const [finderSlug, setFinderSlug] = useState('');

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  // Language Menu dropdown
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      setError('Your authenticated session has expired. Please sign in again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (workspaceSlug) {
      apiRequest(`/auth/workspace/${encodeURIComponent(workspaceSlug)}`)
        .then((res) => {
          if (res?.data) {
            setWorkspaceInfo(res.data);
          }
        })
        .catch(() => {
          // If not found, stay on generic login
        });
    }
  }, [workspaceSlug]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setError('Please provide a valid work email address.');
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword);
      success('Authenticated successfully. Welcome to your workspace!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    if (!signupForm.firstName.trim() || !signupForm.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (!signupForm.email.trim() || !signupForm.email.includes('@')) {
      setError('A valid work email address is required.');
      return;
    }
    if (signupForm.password.length < 6) {
      setError(t('auth.password_min', 'Password must contain at least 6 characters.'));
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: signupForm.firstName.trim(),
        lastName: signupForm.lastName.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        phone: signupForm.phone.trim() || undefined,
        companyName: signupForm.companyName.trim() || undefined,
      });

      success('Account created successfully! Welcome to SmartHCM.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = async (personaEmail: string) => {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      await quickLogin(personaEmail);
      success('Logged in as test persona');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspaceFinderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finderSlug.trim()) return;
    const cleanSlug = finderSlug.toLowerCase().trim();
    navigate(`/w/${cleanSlug}/login`);
    setShowWorkspaceFinder(false);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitting(true);
    try {
      const res = await forgotPassword(forgotEmail);
      success(res?.message || 'Password reset instructions have been dispatched.');
      setForgotModalOpen(false);
      setForgotEmail('');
    } catch (err: any) {
      toastError(err?.message || 'Failed to request password reset.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051720] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative transition-colors text-left selection:bg-[#ff6f32]/30 selection:text-white">
      {/* Top Utility Controls */}
      <div className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center space-x-3">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <span className="w-2 h-2 rounded-full bg-[#ff6f32]" />
          <span>SmartHCM Suite</span>
        </Link>
      </div>

      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 flex items-center space-x-3">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-[#0a2736] border border-[#14425b] hover:border-[#ff6f32]/50 flex items-center space-x-1.5 transition cursor-pointer"
            aria-label="Select Language"
          >
            <Globe size={13} className="text-[#ff6f32]" />
            <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}</span>
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-[#08222f] border border-[#14425b] rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 hover:bg-[#ff6f32]/10 transition ${
                    language === l.code ? 'text-[#ff6f32] font-bold' : 'text-slate-300'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.nativeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real Theme Toggle */}
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-[#071c26] border border-[#14425b] items-center justify-center font-extrabold text-white text-xl shadow-xl mb-3 relative">
          <span>S</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f32] absolute -top-0.5 -right-0.5 ring-2 ring-[#051720]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {workspaceInfo ? (
            <span>
              Smart<span className="text-[#ff6f32]">HCM</span> — {workspaceInfo.name}
            </span>
          ) : (
            <span>
              Smart<span className="text-[#ff6f32]">HCM</span>
            </span>
          )}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          {t('auth.subtitle', 'Enterprise Human Capital Management & Workforce Cloud Suite')}
        </p>

        {/* 2 PRIMARY OPTIONS TABS: 1. Login | 2. Sign Up */}
        <div className="mt-5 p-1 bg-[#051822] border border-[#14425b] rounded-2xl inline-flex w-full max-w-xs shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              mode === 'login'
                ? 'bg-[#ff6f32] text-white shadow-md shadow-[#ff6f32]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={13} />
            <span>1. {t('action.signin', 'Sign In')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              mode === 'signup'
                ? 'bg-[#ff6f32] text-white shadow-md shadow-[#ff6f32]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>2. {t('action.signup', 'Sign Up')}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#08222f] py-7 px-6 shadow-2xl rounded-2xl sm:px-9 border border-[#14425b]">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* TAB 1: LOGIN FORM */
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('label.email', 'Work Email Address')}
                </label>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="block w-full pl-9 pr-3 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t('label.password', 'Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] font-semibold text-[#ff6f32] hover:text-[#ea580c] hover:underline"
                  >
                    {t('auth.forgot_password', 'Forgot password?')}
                  </button>
                </div>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="block w-full pl-9 pr-10 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md shadow-[#ff6f32]/20 text-xs sm:text-sm font-bold text-white bg-[#ff6f32] hover:bg-[#ea580c] disabled:opacity-50 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>{t('auth.signing_in', 'Signing In...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('action.signin', 'Sign In to Workspace')}</span>
                    <ArrowRight size={15} className={`ml-2 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: SIGN UP FORM */
            <form className="space-y-3.5" onSubmit={handleSignupSubmit}>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('label.first_name', 'First Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.firstName}
                    onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                    placeholder="Sarah"
                    className="block w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('label.last_name', 'Last Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    placeholder="Jenkins"
                    className="block w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('label.email', 'Work Email Address')}
                </label>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="block w-full pl-9 pr-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('label.password', 'Password')}
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="block w-full px-3 pr-8 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('label.confirm_password', 'Confirm')}
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="block w-full px-3 pr-8 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Organization <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 size={15} />
                  </div>
                  <input
                    type="text"
                    value={signupForm.companyName}
                    onChange={(e) => setSignupForm({ ...signupForm, companyName: e.target.value })}
                    placeholder="Leave blank to join existing workspace"
                    className="block w-full pl-9 pr-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
                  />
                </div>
              </div>

              {/* RBAC Security Note */}
              <div className="bg-[#051822]/80 border border-[#14425b] rounded-xl p-2.5 text-[11px] text-slate-400 flex items-start space-x-2">
                <ShieldCheck size={14} className="shrink-0 text-[#ff6f32] mt-0.5" />
                <span>
                  Ordinary registrations default securely to standard Employee access. Administrative roles are assigned strictly by authorized system admins.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md shadow-[#ff6f32]/20 text-xs sm:text-sm font-bold text-white bg-[#ff6f32] hover:bg-[#ea580c] disabled:opacity-50 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>{t('auth.creating_account', 'Creating Account...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('action.signup', 'Create HCM Account')}</span>
                    <ArrowRight size={15} className={`ml-2 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Workspace Finder Link */}
          {!workspaceInfo && (
            <div className="mt-4 pt-3 border-t border-[#14425b] text-center">
              <button
                type="button"
                onClick={() => setShowWorkspaceFinder(!showWorkspaceFinder)}
                className="text-xs text-slate-400 hover:text-[#ff6f32] font-medium inline-flex items-center space-x-1 transition cursor-pointer"
              >
                <Building2 size={13} className="text-[#ff6f32]" />
                <span>Sign in using your company workspace URL</span>
              </button>

              {showWorkspaceFinder && (
                <form onSubmit={handleWorkspaceFinderSubmit} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={finderSlug}
                    onChange={(e) => setFinderSlug(e.target.value)}
                    placeholder="company-slug"
                    className="flex-1 px-3 py-1.5 bg-[#051822] border border-[#14425b] rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Pre-Seeded 1-Click Evaluation Personas for Frictionless Testing */}
          <div className="mt-6 border-t border-[#14425b] pt-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <ShieldCheck size={14} className="text-[#ff6f32]" />
                <span>{t('action.quick_persona', '1-Click Test Personas')}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Pre-Seeded</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {[
                { name: 'System Super Admin', email: 'admin@novahcm.io', role: 'Super Admin' },
                { name: 'Sarah Jenkins (HR Manager)', email: 'sarah.jenkins@acmeglobal.com', role: 'HR Admin' },
                { name: 'David Miller (Payroll)', email: 'david.miller@acmeglobal.com', role: 'Payroll Officer' },
                { name: 'Alex Rivers (Dept Manager)', email: 'alex.rivers@acmeglobal.com', role: 'Manager' },
                { name: 'Emily Watson (Engineer)', email: 'emily.watson@acmeglobal.com', role: 'Employee (ESS)' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPersona(p.email)}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 bg-[#051720] hover:bg-[#071c26] border border-[#14425b] hover:border-[#ff6f32]/40 rounded-xl transition flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#ff6f32] transition">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{p.email}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#14425b]/50 text-slate-300 border border-[#14425b]">
                      {p.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title={
          <div className="flex items-center space-x-2">
            <KeyRound className="text-[#ff6f32]" size={18} />
            <span>{t('auth.reset_password', 'Reset Account Password')}</span>
          </div>
        }
        description="Enter your registered work email address to receive password reset instructions."
        maxWidth="md"
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('label.email', 'Work Email Address')}
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
            />
          </div>
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#14425b]">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setForgotModalOpen(false)}
            >
              {t('action.cancel', 'Cancel')}
            </Button>
            <button
              type="submit"
              disabled={forgotSubmitting}
              className="px-4 py-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {forgotSubmitting ? 'Sending...' : t('auth.send_reset_link', 'Send Reset Link')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default LoginPage;
