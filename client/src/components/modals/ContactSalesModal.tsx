import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Building2, Mail, Phone, Users, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSalesModal: React.FC<ContactSalesModalProps> = ({ isOpen, onClose }) => {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    teamSize: '100-500',
    phone: '',
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      success('Your inquiry has been routed to our enterprise solutions architect.');
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      companyName: '',
      teamSize: '100-500',
      phone: '',
      requirements: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        <div className="flex items-center space-x-2">
          <Building2 className="text-[#ff6f32]" size={20} />
          <span>Connect with Enterprise Sales</span>
        </div>
      }
      description="Speak with an enterprise HCM solution architect about dedicated tenancy, custom integrations, or tailored SLA agreements."
      maxWidth="lg"
    >
      {submitted ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#ff6f32]/15 text-[#ff6f32] border border-[#ff6f32]/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={26} />
          </div>
          <h4 className="text-base font-bold text-white">
            Thank you, {formData.fullName}!
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Our Enterprise Solutions Director will contact you at <strong className="text-white">{formData.email}</strong> within 1 business day with a customized architectural proposal.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleReset}>
              Close Window
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Marcus Vance"
                className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6f32] focus:ring-1 focus:ring-[#ff6f32]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="marcus@company.com"
                className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6f32] focus:ring-1 focus:ring-[#ff6f32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Apex Technologies"
                className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6f32] focus:ring-1 focus:ring-[#ff6f32]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Employee Count *
              </label>
              <select
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white focus:outline-none focus:border-[#ff6f32] focus:ring-1 focus:ring-[#ff6f32]"
              >
                <option value="20-100" className="bg-[#08222f] text-white">20 - 100 Employees</option>
                <option value="100-500" className="bg-[#08222f] text-white">100 - 500 Employees</option>
                <option value="500-2000" className="bg-[#08222f] text-white">500 - 2,000 Employees</option>
                <option value="2000+" className="bg-[#08222f] text-white">2,000+ Employees (Global Enterprise)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Direct Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 555-019-2834"
              className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6f32] focus:ring-1 focus:ring-[#ff6f32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Architecture or Integration Requirements
            </label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="e.g. Multi-branch attendance with ZKTeco biometrics, custom SAP payroll export, private VPC hosting requirements..."
              className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6f32] focus:ring-1 focus:ring-[#ff6f32]"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#14425b]">
            <Button variant="ghost" size="sm" type="button" onClick={handleReset}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-orange-500/25 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Routing Request...' : 'Submit Inquiry'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
