import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
  Loader2,
  KeyRound,
  CheckCircle,
  Dumbbell,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from './Toast.tsx';

interface RoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'COACH',
}) => {
  const { user: currentUser, login } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selectedRole when initialRole changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole);
      setErrorMessage(null);
      setPassword('');
      // Suggest the default email for that role if empty
      if (initialRole === 'COACH') {
        setEmail('coach.alex@pulsefit.com');
      } else if (initialRole === 'ADMIN') {
        setEmail('admin@pulsefit.com');
      } else {
        setEmail('marcus@pulsefit.com');
      }
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'COACH') {
      setEmail('coach.alex@pulsefit.com');
    } else if (role === 'ADMIN') {
      setEmail('admin@pulsefit.com');
    } else {
      setEmail('marcus@pulsefit.com');
    }
    setPassword('');
  };

  const handlePrefillCredentials = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'COACH') {
      setEmail('coach.alex@pulsefit.com');
      setPassword('coach123');
    } else if (role === 'ADMIN') {
      setEmail('admin@pulsefit.com');
      setPassword('admin123');
    } else {
      setEmail('marcus@pulsefit.com');
      setPassword('user123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both login email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loggedUser = await login(email.trim(), password, selectedRole);
      success(
        `Switched to ${loggedUser.role} portal. Welcome back, ${loggedUser.name}!`,
        'Authentication Verified'
      );
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your login ID and password.';
      setErrorMessage(msg);
      toastError(msg, 'Role Access Denied');
    } finally {
      setIsLoading(false);
    }
  };

  const roleMeta = {
    COACH: {
      title: 'Coach Portal Access',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      activeTab: 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-cyan-500/10',
      btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-black',
      icon: Award,
      description: 'Design training splits, manage athlete rosters, and assign progressive workout programs.',
      securityNotice: 'Restricted: Normal athletes cannot access this workspace or assign workouts to themselves without coach authentication.',
      demoHint: 'coach.alex@pulsefit.com / coach123',
    },
    ADMIN: {
      title: 'Admin Console Access',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      activeTab: 'bg-purple-500/15 border-purple-500/50 text-purple-400 shadow-purple-500/10',
      btnBg: 'bg-purple-600 hover:bg-purple-500 text-white',
      icon: Shield,
      description: 'Manage users, moderate content, oversee platform settings, and audit workout assignments.',
      securityNotice: 'High Security: Full administrative authority. Unverified users will be rejected by security policy.',
      demoHint: 'admin@pulsefit.com / admin123',
    },
    USER: {
      title: 'Athlete Portal Access',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      activeTab: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      icon: Dumbbell,
      description: 'Execute coach-assigned training splits, log sets/reps, monitor BMI, and log daily nutrition.',
      securityNotice: 'Member Workspace: Athletes receive personalized plans from coaches and log progress.',
      demoHint: 'marcus@pulsefit.com / user123',
    },
  }[selectedRole];

  const CurrentRoleIcon = roleMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-5 sm:p-7 z-10 text-zinc-100">
        {/* Subtle accent glow */}
        <div
          className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
            selectedRole === 'ADMIN'
              ? 'bg-purple-500'
              : selectedRole === 'COACH'
              ? 'bg-cyan-500'
              : 'bg-emerald-500'
          }`}
        />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${roleMeta.badgeColor}`}
            >
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Role Authentication Required
              </h2>
              <p className="text-xs text-zinc-400">
                Verified login required to switch portals and authorization levels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        {currentUser && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-4 text-xs">
            <span className="text-zinc-400">Currently Active:</span>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <span>{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-300">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Role Selection Tabs */}
        <div className="mb-5">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
            <span>Select Target Workspace:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleTabChange('USER')}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                selectedRole === 'USER'
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Athlete</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('COACH')}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                selectedRole === 'COACH'
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Coach</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('ADMIN')}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                selectedRole === 'ADMIN'
                  ? 'border-purple-500/60 bg-purple-500/10 text-purple-400 shadow-md shadow-purple-500/10'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Security Alert / Role Details Notice */}
        <div
          className={`p-3.5 rounded-2xl border text-xs mb-5 flex items-start gap-3 ${
            selectedRole === 'ADMIN'
              ? 'bg-purple-950/25 border-purple-800/40 text-purple-200'
              : selectedRole === 'COACH'
              ? 'bg-cyan-950/25 border-cyan-800/40 text-cyan-200'
              : 'bg-emerald-950/25 border-emerald-800/40 text-emerald-200'
          }`}
        >
          <CurrentRoleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">{roleMeta.title}</div>
            <p className="text-[11px] opacity-85 leading-relaxed">{roleMeta.description}</p>
            <p className="text-[10px] font-semibold text-zinc-400 mt-1">{roleMeta.securityNotice}</p>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs mb-4 flex items-start gap-2.5 animate-shake">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Login ID / Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'COACH'
                    ? 'coach.alex@pulsefit.com'
                    : selectedRole === 'ADMIN'
                    ? 'admin@pulsefit.com'
                    : 'marcus@pulsefit.com'
                }
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-300">
                Demo Testing Credentials:
              </span>
              <button
                type="button"
                onClick={() => handlePrefillCredentials(selectedRole)}
                className="text-[10px] font-bold text-zinc-400 hover:text-white underline transition-colors"
              >
                Fill for {selectedRole}
              </button>
            </div>
            <div className="font-mono text-[10px] text-zinc-500 mt-1">
              {roleMeta.demoHint}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 disabled:opacity-60 ${roleMeta.btnBg}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate & Switch to {selectedRole}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
