import React, { useState } from 'react';
import { Mail, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/Modal.tsx';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, defaultEmail = '' }) => {
  const { success, error } = useToast();
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState(defaultEmail);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  React.useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setResetSent(true);
      setStep('RESET');
      success('Reset verification processed. You can now define your new password.', 'Verification Ready');
    } catch (err: any) {
      error(err.message || 'Request failed', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newPassword) return;

    if (newPassword.length < 6) {
      error('Password must be at least 6 characters.', 'Validation');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      success('Your password has been reset successfully. Please sign in.', 'Password Updated');
      onClose();
      setStep('REQUEST');
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to update password', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'REQUEST' ? 'Reset Account Password' : 'Enter New Password'}
      subtitle="Follow the steps to recover access to your PulseFit account"
      maxWidth="md"
    >
      {step === 'REQUEST' ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Enter your registered email address below. We'll verify your account and allow you to set a new password.
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Registered Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@pulsefit.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Instructions
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Account verified for {email}. Please provide a strong new password.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setStep('REQUEST')}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
