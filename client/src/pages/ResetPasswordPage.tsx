import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || !email) {
      setError('Password reset token or email parameter is missing from the link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051720] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 text-left transition-colors">
      <div className="max-w-md w-full bg-[#08222f] border border-[#14425b] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-[#14425b]">
          <div className="h-9 w-9 rounded-xl bg-[#ff6f32]/15 border border-[#ff6f32]/30 flex items-center justify-center text-[#ff6f32]">
            <KeyRound size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Reset Account Password</h1>
            <p className="text-xs text-slate-400">SmartHCM Security Gateway</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#ff6f32]/10 border border-[#ff6f32]/30 flex items-start space-x-3">
              <CheckCircle2 size={20} className="text-[#ff6f32] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white text-sm">Password Updated!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your credentials have been securely reset. You can now log into your account with your new password.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/login')}
            >
              Sign In Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-2">
                <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {email && (
              <div className="text-slate-400">
                Resetting password for: <strong className="text-white">{email}</strong>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Update Password
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-[#ff6f32] hover:underline">
                &larr; Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
