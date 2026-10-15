import React, { useState } from 'react';
import { Mail, Lock, Dumbbell, ArrowRight, Loader2, UserCheck, Shield, Award, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { ForgotPasswordModal } from './ForgotPasswordModal.tsx';

interface AthleteLoginPageProps {
  onSwitchToCoach: () => void;
  onSwitchToAdmin: () => void;
  onSwitchToRegister: () => void;
  onBackToHome: () => void;
}

export const AthleteLoginPage: React.FC<AthleteLoginPageProps> = ({
  onSwitchToCoach,
  onSwitchToAdmin,
  onSwitchToRegister,
  onBackToHome,
}) => {
  const { login } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const loggedUser = await login(email, password, 'USER');
      success(`Welcome back, Athlete ${loggedUser.name}!`, 'Athlete Portal Active');
    } catch (err: any) {
      error(err.message || 'Invalid email or password for Athlete Portal.', 'Athlete Login Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAthleteDemo = async (demoEmail: string, name: string) => {
    setEmail(demoEmail);
    setPassword('user123');
    setIsLoading(true);
    try {
      const loggedUser = await login(demoEmail, 'user123', 'USER');
      success(`Logged in as Athlete ${loggedUser.name}!`, 'Athlete Portal Demo');
    } catch (err: any) {
      error(err.message || 'Athlete login failed', 'Demo Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow in emerald */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Navigation & portal switcher bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <button
            onClick={onBackToHome}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Back to Home
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToCoach}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Award className="w-3.5 h-3.5" /> Coach Portal →
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold shadow-xl shadow-emerald-500/25">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              PulseFit <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">ATHLETE PORTAL</span>
            </span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-white tracking-tight">
          Athlete & Member Login
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-400">
          Access your personalized training routines, AI food nutrient detector, BMI tracker, and coaching chat.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-zinc-950 border border-emerald-500/20 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          {/* Quick Demo Athlete Account Card */}
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> 1-Click Test Athlete Accounts:
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Password: user123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAthleteDemo('marcus@pulsefit.com', 'Marcus Chen')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/60 text-xs font-semibold text-zinc-200 transition-all text-left flex flex-col justify-between"
              >
                <div className="font-bold text-white text-[12px]">Marcus Chen</div>
                <div className="text-[10px] text-zinc-400 font-mono">marcus@pulsefit.com</div>
                <span className="text-[9px] text-emerald-400 font-semibold mt-1">Goal: Muscle Gain</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickAthleteDemo('sarah@pulsefit.com', 'Sarah Jenkins')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/60 text-xs font-semibold text-zinc-200 transition-all text-left flex flex-col justify-between"
              >
                <div className="font-bold text-white text-[12px]">Sarah Jenkins</div>
                <div className="text-[10px] text-zinc-400 font-mono">sarah@pulsefit.com</div>
                <span className="text-[9px] text-emerald-400 font-semibold mt-1">Goal: Endurance</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500 font-semibold tracking-wider">
                Or Sign In With Athlete Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Athlete Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@pulsefit.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-400">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-emerald-400 hover:underline"
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Athlete Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Athlete</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* New Athlete Link */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              New athlete?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Register for Coaching Roster
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
