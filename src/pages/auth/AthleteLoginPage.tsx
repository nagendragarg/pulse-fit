import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Dumbbell,
  ArrowRight,
  Loader2,
  UserCheck,
  Shield,
  Award,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { ForgotPasswordModal } from './ForgotPasswordModal.tsx';
import { api } from '../../api/client.ts';

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

  const [email, setEmail] = useState(() => {
    return localStorage.getItem('pulsefit_last_athlete_email') || 'nagendragarg19@gmail.com';
  });
  const [password, setPassword] = useState('user123');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [canInstantRegister, setCanInstantRegister] = useState<boolean>(false);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('pulsefit_last_athlete_email');
    if (saved) {
      setEmail(saved);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return;

    setIsLoading(true);
    setCanInstantRegister(false);
    try {
      const loggedUser = await login(cleanEmail, password, 'USER');
      localStorage.setItem('pulsefit_last_athlete_email', cleanEmail);
      success(`Welcome back, Athlete ${loggedUser.name}!`, 'Athlete Portal Active');
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password for Athlete Portal.';
      setLastAttemptedEmail(cleanEmail);
      setCanInstantRegister(true);
      error(msg, 'Athlete Login Check');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAthleteDemo = async (demoEmail: string, name: string) => {
    const cleanEmail = demoEmail.trim().toLowerCase();
    setEmail(cleanEmail);
    setPassword('user123');
    setIsLoading(true);
    setCanInstantRegister(false);
    try {
      const loggedUser = await login(cleanEmail, 'user123', 'USER');
      localStorage.setItem('pulsefit_last_athlete_email', cleanEmail);
      success(`Logged in as Athlete ${loggedUser.name}!`, 'Athlete Portal Verified');
    } catch (err: any) {
      error(err.message || 'Athlete login failed', 'Demo Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantRegister = async () => {
    const cleanEmail = (lastAttemptedEmail || email).trim().toLowerCase();
    if (!cleanEmail) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/instant-athlete', {
        email: cleanEmail,
        password: password || 'user123',
      });
      localStorage.setItem('pulsefit_token', res.token);
      localStorage.setItem('pulsefit_last_athlete_email', cleanEmail);
      // Login directly with the token or credentials
      await login(cleanEmail, password || 'user123', 'USER');
      success(`Athlete account activated! Welcome to PulseFit.`, 'Account Created');
    } catch (err: any) {
      error(err.message || 'Failed to auto-register athlete', 'Error');
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-400/20">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              PulseFit <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">ATHLETE PORTAL</span>
            </span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-white tracking-tight">
          Athlete & Member Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-400">
          Access your periodized workout plans, nutritional analytics, BMI progress, and 1-on-1 coach chat.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-zinc-950 border border-zinc-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          {/* Quick 1-Click Access Athlete Accounts */}
          <div className="mb-6 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Verified Athlete Accounts:
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Password: user123</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Primary User Account */}
              <button
                type="button"
                onClick={() => handleQuickAthleteDemo('nagendragarg19@gmail.com', 'Nagendra Garg')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold text-zinc-200 transition-all text-left flex flex-col justify-between group col-span-1 sm:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-[12px] flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Nagendra Garg
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Active Athlete</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">nagendragarg19@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAthleteDemo('marcus@pulsefit.com', 'Marcus Chen')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all text-left flex flex-col justify-between"
              >
                <div className="font-bold text-white text-[12px]">Marcus Chen</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">marcus@pulsefit.com</div>
                <span className="text-[9px] text-zinc-400 mt-0.5">Hypertrophy Split</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAthleteDemo('sarah@pulsefit.com', 'Sarah Jenkins')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all text-left flex flex-col justify-between"
              >
                <div className="font-bold text-white text-[12px]">Sarah Jenkins</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">sarah@pulsefit.com</div>
                <span className="text-[9px] text-zinc-400 mt-0.5">Endurance Split</span>
              </button>
            </div>
          </div>

          {/* Instant Register Option when an email wasn't recognized */}
          {canInstantRegister && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs animate-fade-in">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">First time with this email?</div>
                  <div className="text-zinc-300 text-[11px] mt-0.5">
                    Activate your athlete profile for <strong className="text-emerald-400">{lastAttemptedEmail}</strong> with one tap:
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstantRegister}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Activate & Sign In for "{lastAttemptedEmail}"</span>
              </button>
            </div>
          )}

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-400 font-mono font-semibold text-[10px] tracking-wider">
                Or Sign In With Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Athlete Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nagendragarg19@gmail.com or marcus"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-400"
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
                  placeholder="•••••••• (default: user123)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-bold text-sm transition-all shadow-md shadow-emerald-400/20 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Athlete Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Athlete Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* New Athlete Link */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Need a completely custom split?{' '}
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
