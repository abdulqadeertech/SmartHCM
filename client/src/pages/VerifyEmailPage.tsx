import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token && emailParam ? 'verifying' : 'idle'
  );
  const [message, setMessage] = useState<string>('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (token && emailParam) {
      handleVerify(token, emailParam);
    }
  }, [token, emailParam]);

  const handleVerify = async (tok: string, mail: string) => {
    setStatus('verifying');
    try {
      const res = await verifyEmail(mail, tok);
      setStatus('success');
      setMessage(res?.message || 'Your email address has been verified successfully!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Verification link is invalid or has expired.');
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setResending(true);
    setResendSuccess(null);
    try {
      const res = await resendVerification(email);
      setResendSuccess(res?.message || 'A fresh verification email has been dispatched.');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to resend verification link.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051720] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 text-left transition-colors">
      <div className="max-w-md w-full bg-[#08222f] border border-[#14425b] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-[#14425b]">
          <div className="h-9 w-9 rounded-xl bg-[#ff6f32]/15 border border-[#ff6f32]/30 flex items-center justify-center text-[#ff6f32]">
            <Mail size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Work Email Verification</h1>
            <p className="text-xs text-slate-400">SmartHCM Identity & Security Gateway</p>
          </div>
        </div>

        {status === 'verifying' && (
          <div className="text-center py-6 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#ff6f32] mx-auto" />
            <p className="text-sm font-semibold text-white">Confirming email token authenticity...</p>
            <p className="text-xs text-slate-400">Verifying cryptographic signature with identity service</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#ff6f32]/10 border border-[#ff6f32]/30 flex items-start space-x-3">
              <CheckCircle2 size={20} className="text-[#ff6f32] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white text-sm">Email Verified Successfully!</h3>
                <p className="text-xs text-slate-300 mt-1">{message}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Your account is fully activated. You can now access your organization dashboard.
            </p>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/login')}
            >
              Proceed to Sign In
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3">
              <AlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-rose-300 text-sm">Verification Link Expired or Invalid</h3>
                <p className="text-xs text-rose-200 mt-1">{message}</p>
              </div>
            </div>

            <form onSubmit={handleResend} className="space-y-3 text-xs pt-2">
              <label className="block font-semibold text-slate-300">
                Resend verification email to:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="work.email@company.com"
                className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
              />
              {resendSuccess && (
                <p className="text-xs text-[#ff6f32] font-semibold flex items-center space-x-1.5">
                  <CheckCircle2 size={13} />
                  <span>{resendSuccess}</span>
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="w-full"
                isLoading={resending}
                leftIcon={<RefreshCw size={14} />}
              >
                Send New Verification Email
              </Button>
            </form>

            <div className="pt-2 text-center">
              <Link to="/login" className="text-xs text-[#ff6f32] hover:underline">
                &larr; Return to Sign In
              </Link>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <form onSubmit={handleResend} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Enter your work email address below to receive an account confirmation link.
            </p>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Work Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
                className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
              />
            </div>
            {resendSuccess && (
              <p className="text-xs text-[#ff6f32] font-semibold flex items-center space-x-1.5">
                <CheckCircle2 size={13} />
                <span>{resendSuccess}</span>
              </p>
            )}
            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full"
              isLoading={resending}
            >
              Send Verification Email
            </Button>
            <div className="pt-2 text-center">
              <Link to="/login" className="text-xs text-[#ff6f32] hover:underline">
                &larr; Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
