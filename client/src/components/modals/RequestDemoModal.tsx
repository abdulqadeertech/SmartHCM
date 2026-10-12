import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UTILITY_BAR_CONFIG } from '../../data/navigationData';

interface RequestDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModule?: string;
  applicationMode?: boolean;
}

export const RequestDemoModal: React.FC<RequestDemoModalProps> = ({
  isOpen,
  onClose,
  defaultModule,
  applicationMode = false,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    companySize: '51 - 200 employees',
    moduleInterest: defaultModule || 'All Modules (Enterprise Suite)',
    implementationTimeline: 'Immediate (Within 30 days)',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      moduleInterest: applicationMode
        ? 'Company onboarding application'
        : defaultModule || 'All Modules (Enterprise Suite)',
    }));
  }, [applicationMode, defaultModule]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Work email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid corporate email format.';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact phone number is required.';
    } else if (!phoneRegex.test(formData.phone.trim().replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (at least 7 digits).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const requestType = applicationMode ? 'Company onboarding application' : 'SmartHCM demo request';
    const subject = `${requestType}: ${formData.companyName}`;
    const body = [
      `Request type: ${requestType}`,
      `Name: ${formData.fullName}`,
      `Work email: ${formData.email}`,
      `Company: ${formData.companyName}`,
      `Phone: ${formData.phone}`,
      `Company size: ${formData.companySize}`,
      `Area of interest: ${formData.moduleInterest}`,
      `Rollout timeline: ${formData.implementationTimeline}`,
    ].join('\n');

    window.location.href = `mailto:${UTILITY_BAR_CONFIG.salesEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setErrors({});
    setFormData({
      fullName: '',
      email: '',
      companyName: '',
      phone: '',
      companySize: '51 - 200 employees',
      moduleInterest: 'All Modules (Enterprise Suite)',
      implementationTimeline: 'Immediate (Within 30 days)',
      notes: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-[#08222f] rounded-2xl shadow-2xl max-w-xl w-full border border-[#14425b] overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-[#071c26] border-b border-[#14425b] text-white px-6 py-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff6f32] animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30">
                VIP Solutions Consultation
              </span>
            </div>
            <h3 id="demo-modal-title" className="text-xl font-extrabold text-white tracking-tight">
              {applicationMode ? 'Apply for company onboarding' : 'Request a SmartHCM demo'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {applicationMode
                ? 'Share your organization details and tell us what your team needs.'
                : 'Tell us about your team and the areas you would like to explore.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-bold text-white">Your email draft is ready</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.fullName}</strong>. Your {applicationMode ? 'company onboarding application' : 'demo request'} for{' '}
                <strong className="text-white">{formData.companyName}</strong> is in your email app. Send the draft to complete your request.
              </p>

              <div className="bg-[#051720] border border-[#14425b] rounded-xl p-4 text-xs text-left max-w-md mx-auto space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Module:</span>
                  <span className="font-semibold text-white">{formData.moduleInterest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Organization Scale:</span>
                  <span className="font-semibold text-white">{formData.companySize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deployment Window:</span>
                  <span className="font-semibold text-white">{formData.implementationTimeline}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      placeholder="e.g. Alex Morgan"
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-[#051822] text-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] transition ${
                        errors.fullName
                          ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10'
                          : 'border-[#14425b] focus:border-[#ff6f32]'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle size={11} />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="alex@enterprise.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-[#051822] text-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] transition ${
                        errors.email
                          ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10'
                          : 'border-[#14425b] focus:border-[#ff6f32]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle size={11} />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => {
                        setFormData({ ...formData, companyName: e.target.value });
                        if (errors.companyName) setErrors({ ...errors, companyName: '' });
                      }}
                      placeholder="e.g. Acme Global Logistics"
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-[#051822] text-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] transition ${
                        errors.companyName
                          ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10'
                          : 'border-[#14425b] focus:border-[#ff6f32]'
                      }`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle size={11} />
                      <span>{errors.companyName}</span>
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="+1 (555) 019-2834"
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-[#051822] text-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] transition ${
                        errors.phone
                          ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10'
                          : 'border-[#14425b] focus:border-[#ff6f32]'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle size={11} />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Size */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Size
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#14425b] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] bg-[#051822] text-white"
                  >
                    <option value="10 - 50 employees" className="bg-[#08222f] text-white">10 - 50 employees</option>
                    <option value="51 - 200 employees" className="bg-[#08222f] text-white">51 - 200 employees</option>
                    <option value="201 - 500 employees" className="bg-[#08222f] text-white">201 - 500 employees</option>
                    <option value="501 - 2000 employees" className="bg-[#08222f] text-white">501 - 2,000 employees</option>
                    <option value="2000+ employees" className="bg-[#08222f] text-white">2,000+ Enterprise employees</option>
                  </select>
                </div>

                {/* Primary Module Interest */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Module of Interest
                  </label>
                  <select
                    value={formData.moduleInterest}
                    onChange={(e) => setFormData({ ...formData, moduleInterest: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#14425b] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] bg-[#051822] text-white"
                  >
                    <option value="All Modules (Enterprise Suite)" className="bg-[#08222f] text-white">All Modules (Enterprise Suite)</option>
                    <option value="Company onboarding application" className="bg-[#08222f] text-white">Company onboarding application</option>
                    <option value="Core HR & Profiles" className="bg-[#08222f] text-white">Core HR & Profiles</option>
                    <option value="Payroll & Benefits" className="bg-[#08222f] text-white">Payroll & Benefits</option>
                    <option value="Attendance & Shifts" className="bg-[#08222f] text-white">Attendance & Biometrics</option>
                    <option value="Leave Management" className="bg-[#08222f] text-white">Leave Management</option>
                    <option value="Recruitment & ATS" className="bg-[#08222f] text-white">Recruitment & ATS</option>
                    <option value="Performance Reviews" className="bg-[#08222f] text-white">Performance Reviews & OKRs</option>
                    <option value="Workflow Automation" className="bg-[#08222f] text-white">Workflow Automation</option>
                  </select>
                </div>
              </div>

              {/* Implementation Window */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expected Rollout Timeline
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Immediate (< 30 days)', '1 - 3 Months', 'Exploring Solutions'].map((timeline) => (
                    <button
                      key={timeline}
                      type="button"
                      onClick={() => setFormData({ ...formData, implementationTimeline: timeline })}
                      className={`py-1.5 px-2 text-[11px] rounded-lg border font-medium transition text-center cursor-pointer ${
                        formData.implementationTimeline === timeline
                          ? 'border-[#ff6f32] bg-[#ff6f32]/15 text-[#ff6f32] font-bold'
                          : 'border-[#14425b] bg-[#051822] text-slate-400 hover:text-white hover:bg-[#071c26]'
                      }`}
                    >
                      {timeline}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-[#051720] p-2.5 rounded-lg border border-[#14425b]">
                <ShieldCheck size={14} className="text-[#ff6f32] shrink-0" />
                <span>Your details are protected by enterprise confidentiality agreements and GDPR compliance.</span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-[#071c26] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-orange-500/25 flex items-center space-x-2 cursor-pointer"
                >
                  <span>{applicationMode ? 'Prepare application email' : 'Prepare demo request email'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
