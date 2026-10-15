import React, { useState } from 'react';
import { Mail, Lock, Shield, ArrowRight, Loader2, Dumbbell, Award, Key, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { ForgotPasswordModal } from './ForgotPasswordModal.tsx';

interface AdminLoginPageProps {
  onSwitchToAthlete: () => void;
  onSwitchToCoach: () => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSwitchToAthlete,
  onSwitchToCoach,
  onBackToHome,
}) => {
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return;

    setIsLoading(true);
    try {
      const loggedUser = await login(cleanEmail, password, 'ADMIN');
      success(`Security clearance verified: Welcome ${loggedUser.name}!`, 'Admin Clearance Granted');
    } catch (err: any) {
      error(err.message || 'Invalid administrator security credentials.', 'Admin Login Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminDemo = async () => {
    setEmail('admin@pulsefit.com');
    setPassword('admin123');
    setIsLoading(true);
    try {
      const loggedUser = await login('admin@pulsefit.com', 'admin123', 'ADMIN');
      success(`Logged in as Administrator ${loggedUser.name}!`, 'Admin Demo Active');
    } catch (err: any) {
      error(err.message || 'Admin login failed', 'Demo Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow in purple */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Navigation & switcher bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <button
            onClick={onBackToHome}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Back to Home
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToAthlete}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Dumbbell className="w-3.5 h-3.5" /> Athlete Portal →
            </button>
            <span className="text-zinc-600">|</span>
            <button
              onClick={onSwitchToCoach}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Award className="w-3.5 h-3.5" /> Coach Portal →
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-extrabold shadow-xl shadow-purple-600/25">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              PulseFit <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">ADMIN COMMAND</span>
            </span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-white tracking-tight">
          System Administration Login
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-400">
          Superuser console: User account governance, audit logs, coach accreditations, and system configuration.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-zinc-950 border border-purple-500/25 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          {/* Quick Demo Admin Card */}
          <div className="mb-6 p-3.5 rounded-2xl bg-purple-950/25 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> 1-Click Platform Superadmin:
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Password: admin123</span>
            </div>
            <button
              type="button"
              onClick={handleQuickAdminDemo}
              disabled={isLoading}
              className="w-full p-2.5 rounded-xl bg-zinc-900/90 hover:bg-purple-500/20 border border-zinc-800 hover:border-purple-500/60 text-xs font-semibold text-zinc-200 transition-all text-left flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-white text-[12px]">Jane Sterling</div>
                <div className="text-[10px] text-zinc-400 font-mono">admin@pulsefit.com</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                CLEARANCE: LEVEL 5
              </span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500 font-semibold tracking-wider">
                Or Enter Admin Security Pass
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pulsefit.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-400">Admin Security Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-purple-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Security Clearance...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Admin Notice */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Not a system administrator?{' '}
              <button
                type="button"
                onClick={onSwitchToAthlete}
                className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Go to Athlete Portal
              </button>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
      />
    </div>
  );
};
