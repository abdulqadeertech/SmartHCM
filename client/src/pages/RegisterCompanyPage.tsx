import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Globe,
  Loader2,
  AlertCircle,
  Check,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';

export const RegisterCompanyPage: React.FC = () => {
  const { registerCompany } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    country: 'United States',
    address: '',
    companySize: '16-50',
    plan: 'STARTER',
    currency: 'USD',
    timezone: 'UTC',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: true,
  });

  // Slug verification state
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    checked: boolean;
    available: boolean;
    valid: boolean;
    message?: string;
  }>({
    checked: false,
    available: false,
    valid: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate slug from company name if user hasn't explicitly customized slug
  const [slugEditedManually, setSlugEditedManually] = useState(false);

  const handleCompanyNameChange = (name: string) => {
    setFormData((prev) => {
      const updated = { ...prev, companyName: name };
      if (!slugEditedManually) {
        const generated = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 32);
        updated.slug = generated;
      }
      return updated;
    });
  };

  // Debounced slug check
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 2) {
      setSlugStatus({ checked: false, available: false, valid: false });
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await apiRequest(`/auth/check-slug/${encodeURIComponent(formData.slug)}`);
        if (res?.data) {
          setSlugStatus({
            checked: true,
            available: res.data.available,
            valid: res.data.valid,
            message: res.data.message,
          });
        }
      } catch (err) {
        console.error('Slug check failed:', err);
      } finally {
        setSlugChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setErrorMsg('Please enter your official company name.');
      return;
    }
    if (!formData.slug.trim() || !slugStatus.valid) {
      setErrorMsg('Please enter a valid workspace slug (alphanumeric and hyphens only).');
      return;
    }
    if (!slugStatus.available) {
      setErrorMsg('This workspace slug is already taken. Please choose another.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (!formData.termsAccepted) {
      setErrorMsg('You must accept the Terms of Service & Privacy Policy to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      await registerCompany({
        companyName: formData.companyName,
        slug: formData.slug,
        country: formData.country,
        address: formData.address,
        companySize: formData.companySize,
        plan: formData.plan,
        currency: formData.currency,
        timezone: formData.timezone,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        phone: formData.phone,
        password: formData.password,
      });

      success('Company workspace provisioned and initialized successfully!', 'Welcome to SmartHCM');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize company workspace. Please try again.');
      toastError(err?.message || 'Workspace provisioning failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051720] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 transition-colors text-left">
      {/* Top Navigation Strip */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          <span>Back to SmartHCM Portal</span>
        </Link>

        <div className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-[#ff6f32] hover:text-[#ea580c] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="w-full max-w-xl">
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-[#071c26] border border-[#14425b] items-center justify-center font-extrabold text-white text-xl shadow-md mb-3 relative">
            <span>S</span>
            <span className="w-2 h-2 rounded-full bg-[#ff6f32] absolute -top-0.5 -right-0.5 ring-2 ring-[#051720]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Register Company <span className="text-[#ff6f32]">Workspace</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Provision your dedicated multi-tenant HCM environment with isolated databases.
          </p>

          {/* Stepper Indicator */}
          <div className="mt-5 flex items-center justify-center space-x-3 text-xs">
            <span
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold transition ${
                step === 1
                  ? 'bg-[#071c26] text-white border border-[#ff6f32]/40 shadow-xs'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <span className={step === 1 ? 'text-[#ff6f32] font-bold' : ''}>1</span>
              <span>Organization Setup</span>
            </span>
            <span className="text-slate-600">──</span>
            <span
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold transition ${
                step === 2
                  ? 'bg-[#071c26] text-white border border-[#ff6f32]/40 shadow-xs'
                  : 'bg-[#051720] text-slate-400 border border-[#14425b]'
              }`}
            >
              <span className={step === 2 ? 'text-[#ff6f32] font-bold' : ''}>2</span>
              <span>Administrator Account</span>
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#08222f] p-6 sm:p-8 rounded-2xl border border-[#14425b] shadow-2xl">
          {errorMsg && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  placeholder="e.g. Apex Global Technologies"
                  className="w-full px-3.5 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Workspace URL Identifier (Slug) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugEditedManually(true);
                      setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
                    }}
                    placeholder="e.g. apex-global"
                    className="w-full px-3.5 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] pr-10 font-mono"
                  />
                  <div className="absolute right-3 top-2.5">
                    {slugChecking ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : slugStatus.checked && slugStatus.valid && slugStatus.available ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : slugStatus.checked && (!slugStatus.valid || !slugStatus.available) ? (
                      <AlertCircle size={16} className="text-rose-400" />
                    ) : null}
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">
                    Workspace: <strong className="text-white">{formData.slug || 'company'}.smarthcm.cloud</strong>
                  </span>
                  {slugStatus.checked && (
                    <span
                      className={`font-semibold ${
                        slugStatus.available && slugStatus.valid
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {slugStatus.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operating Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="United States" className="bg-[#08222f] text-white">United States</option>
                    <option value="United Kingdom" className="bg-[#08222f] text-white">United Kingdom</option>
                    <option value="Canada" className="bg-[#08222f] text-white">Canada</option>
                    <option value="Australia" className="bg-[#08222f] text-white">Australia</option>
                    <option value="Germany" className="bg-[#08222f] text-white">Germany</option>
                    <option value="United Arab Emirates" className="bg-[#08222f] text-white">United Arab Emirates</option>
                    <option value="Singapore" className="bg-[#08222f] text-white">Singapore</option>
                    <option value="Pakistan" className="bg-[#08222f] text-white">Pakistan</option>
                    <option value="India" className="bg-[#08222f] text-white">India</option>
                    <option value="Saudi Arabia" className="bg-[#08222f] text-white">Saudi Arabia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="USD" className="bg-[#08222f] text-white">USD ($)</option>
                    <option value="EUR" className="bg-[#08222f] text-white">EUR (€)</option>
                    <option value="GBP" className="bg-[#08222f] text-white">GBP (£)</option>
                    <option value="AED" className="bg-[#08222f] text-white">AED (د.إ)</option>
                    <option value="SGD" className="bg-[#08222f] text-white">SGD (S$)</option>
                    <option value="PKR" className="bg-[#08222f] text-white">PKR (Rs)</option>
                    <option value="INR" className="bg-[#08222f] text-white">INR (₹)</option>
                    <option value="SAR" className="bg-[#08222f] text-white">SAR (﷼)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Size (Employees) *
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="1-15" className="bg-[#08222f] text-white">1 – 15 employees</option>
                    <option value="16-50" className="bg-[#08222f] text-white">16 – 50 employees</option>
                    <option value="51-200" className="bg-[#08222f] text-white">51 – 200 employees</option>
                    <option value="201-1000" className="bg-[#08222f] text-white">201 – 1,000 employees</option>
                    <option value="1000+" className="bg-[#08222f] text-white">1,000+ Enterprise scale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subscription Tier *
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="STARTER" className="bg-[#08222f] text-white">Starter (Up to 25 staff)</option>
                    <option value="GROWTH" className="bg-[#08222f] text-white">Growth (Up to 100 staff)</option>
                    <option value="ENTERPRISE" className="bg-[#08222f] text-white">Enterprise (Unlimited scale)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Headquarters Street Address (Optional)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 100 Innovation Way, Suite 400"
                  className="w-full px-3.5 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                />
              </div>

              {/* What gets auto-provisioned preview */}
              <div className="mt-4 p-4 rounded-xl bg-[#051720] border border-[#14425b] space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center space-x-1.5 mb-2">
                  <Layers size={14} className="text-[#ff6f32]" />
                  <span>Automatic Workspace Initialization Includes:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>5 Standard Departments (Exec, Tech, HR, Sales, Finance)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Business Shift (09:00 - 18:00) with 15-min grace rule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Statutory Leave Balances (21d Annual, 12d Sick, 10d Casual)</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={slugChecking || !slugStatus.available || !slugStatus.valid}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white disabled:opacity-50 cursor-pointer shadow-md shadow-[#ff6f32]/20"
                >
                  <span>Continue to Admin Setup</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminFirstName}
                    onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                    placeholder="Marcus"
                    className="w-full px-3 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminLastName}
                    onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                    placeholder="Vance"
                    className="w-full px-3 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Email (Will be Super Admin Account) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="marcus@apexglobal.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Direct Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-019-2834"
                  className="w-full px-3.5 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Master Password (min 6 chars) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-[#14425b] text-[#ff6f32] focus:ring-[#ff6f32] bg-[#051822]"
                  />
                  <span>
                    I confirm that I am authorized to register this organization and accept the{' '}
                    <span className="text-white underline">Terms of Service</span> and{' '}
                    <span className="text-white underline">Enterprise Privacy Policy</span>.
                  </span>
                </label>
              </div>

              <div className="pt-3 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-[#14425b] bg-[#051720] text-slate-300 hover:bg-[#071c26] hover:text-white transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 bg-[#ff6f32] hover:bg-[#ea580c] text-white disabled:opacity-50 cursor-pointer shadow-md shadow-[#ff6f32]/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Provisioning Organization Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Dedicated Workspace</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Assurance */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <ShieldCheck size={15} className="text-[#ff6f32]" />
          <span>Tenant Scoped Data Storage • Bank-Grade Cryptography</span>
        </div>
      </div>
    </div>
  );
};
