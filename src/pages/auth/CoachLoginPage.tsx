import React, { useState } from 'react';
import { Mail, Lock, Award, ArrowRight, Loader2, Dumbbell, Shield, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { ForgotPasswordModal } from './ForgotPasswordModal.tsx';

interface CoachLoginPageProps {
  onSwitchToAthlete: () => void;
  onSwitchToAdmin: () => void;
  onBackToHome: () => void;
}

export const CoachLoginPage: React.FC<CoachLoginPageProps> = ({
  onSwitchToAthlete,
  onSwitchToAdmin,
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
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const loggedUser = await login(email, password, 'COACH');
      success(`Welcome Coach ${loggedUser.name}!`, 'Coach Portal Active');
    } catch (err: any) {
      error(err.message || 'Invalid credentials for Coach Portal.', 'Coach Login Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCoachDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('coach123');
    setIsLoading(true);
    try {
      const loggedUser = await login(demoEmail, 'coach123', 'COACH');
      success(`Welcome back, Coach ${loggedUser.name}!`, 'Coach Demo Active');
    } catch (err: any) {
      error(err.message || 'Coach login failed', 'Demo Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow in cyan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

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
              onClick={onSwitchToAdmin}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" /> Admin →
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-black font-extrabold shadow-xl shadow-cyan-500/25">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              PulseFit <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">COACH COMMAND</span>
            </span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-white tracking-tight">
          Certified Coach Portal Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-400">
          Restricted staff area: Program routines, monitor athlete progression, review logs, and provide direct feedback.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-zinc-950 border border-cyan-500/25 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          {/* Quick Demo Coach Accounts */}
          <div className="mb-6 p-3.5 rounded-2xl bg-cyan-950/25 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> 1-Click Certified Coach Demo:
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Password: coach123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickCoachDemo('coach.alex@pulsefit.com')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-cyan-500/20 border border-zinc-800 hover:border-cyan-500/60 text-xs font-semibold text-zinc-200 transition-all text-left flex flex-col justify-between"
              >
                <div className="font-bold text-white text-[12px]">Alex Morgan, CSCS</div>
                <div className="text-[10px] text-zinc-400 font-mono">coach.alex@pulsefit.com</div>
                <span className="text-[9px] text-cyan-400 font-semibold mt-1">Strength & Hypertrophy</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCoachDemo('coach.elena@pulsefit.com')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-cyan-500/20 border border-zinc-800 hover:border-cyan-500/60 text-xs font-semibold text-zinc-200 transition-all text-left flex flex-col justify-between"
              >
                <div className="font-bold text-white text-[12px]">Elena Vance, CPT</div>
                <div className="text-[10px] text-zinc-400 font-mono">coach.elena@pulsefit.com</div>
                <span className="text-[9px] text-cyan-400 font-semibold mt-1">Functional & Mobility</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500 font-semibold tracking-wider">
                Or Sign In With Coach Credentials
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Coach Staff Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach.name@pulsefit.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-400">Coach Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-cyan-400 hover:underline"
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Coach Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Coach Command</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Coach Notice */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Not a coach?{' '}
              <button
                type="button"
                onClick={onSwitchToAthlete}
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Go to Athlete & Member Portal
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
