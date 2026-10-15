import React, { useState } from 'react';
import {
  Dumbbell,
  Scale,
  MessageSquare,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  ShieldAlert,
  Zap,
  Lock,
  Award,
  Shield,
  KeyRound,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import { BmiCalculatorModal } from './BmiCalculatorModal.tsx';
import { FeedbackModal } from './FeedbackModal.tsx';
import { RoleAuthModal } from './RoleAuthModal.tsx';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showBmiModal, setShowBmiModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showRoleAuthModal, setShowRoleAuthModal] = useState(false);
  const [targetAuthRole, setTargetAuthRole] = useState<UserRole>('COACH');

  if (!user) return null;

  const roleBadgeStyles = {
    ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    COACH: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    USER: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }[user.role];

  const handleOpenRoleAuth = (role: UserRole) => {
    setShowRoleSwitcher(false);
    setTargetAuthRole(role);
    setShowRoleAuthModal(true);
  };

  return (
    <>
      {/* Overlay backdrop when dropdowns are open */}
      {(showRoleSwitcher || showProfileMenu) && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => {
            setShowRoleSwitcher(false);
            setShowProfileMenu(false);
          }}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-30 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile hamburger with >=44px touch target */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo brand */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-extrabold shadow-md shadow-emerald-500/20 shrink-0">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                PulseFit <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 hidden sm:inline-block">PRO</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Authenticated Role / Portal Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                setShowRoleSwitcher(!showRoleSwitcher);
              }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 text-xs text-zinc-300 font-medium transition-all shadow-sm min-h-[38px]"
              title="Secure Role Switch - Authentication Required"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline text-zinc-400">Portal:</span>
              <span className="font-semibold text-white uppercase">{user.role}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showRoleSwitcher && (
              <div
                className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-zinc-950 border border-zinc-700/90 shadow-2xl p-2 z-50 text-xs text-zinc-200"
              >
                <div className="px-2.5 py-2 border-b border-zinc-800/80 mb-1.5">
                  <div className="text-[11px] text-white font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Role Switch Authentication</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Password verification required to access Coach or Admin privileges
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Athlete Option */}
                  <button
                    onClick={() => handleOpenRoleAuth('USER')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all ${
                      user.role === 'USER' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold' : 'text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Athlete Portal</div>
                        <div className="text-[10px] text-zinc-400">Personal workouts & logs</div>
                      </div>
                    </div>
                    {user.role === 'USER' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Login
                      </span>
                    )}
                  </button>

                  {/* Coach Option */}
                  <button
                    onClick={() => handleOpenRoleAuth('COACH')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all ${
                      user.role === 'COACH' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-semibold' : 'text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Coach Headquarters</div>
                        <div className="text-[10px] text-zinc-400">Assign workout plans & clients</div>
                      </div>
                    </div>
                    {user.role === 'COACH' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400 flex items-center gap-1 font-semibold">
                        <Lock className="w-2.5 h-2.5" /> Auth Req
                      </span>
                    )}
                  </button>

                  {/* Admin Option */}
                  <button
                    onClick={() => handleOpenRoleAuth('ADMIN')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all ${
                      user.role === 'ADMIN' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-semibold' : 'text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Admin Console</div>
                        <div className="text-[10px] text-zinc-400">User management & settings</div>
                      </div>
                    </div>
                    {user.role === 'ADMIN' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-purple-400 flex items-center gap-1 font-semibold">
                        <Lock className="w-2.5 h-2.5" /> Auth Req
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-800/80 px-1">
                  <button
                    onClick={() => handleOpenRoleAuth('COACH')}
                    className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-colors border border-zinc-800"
                  >
                    <KeyRound className="w-3 h-3 text-amber-400" />
                    <span>Open Authentication Dialog</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BMI Quick Calculator Trigger */}
          <button
            onClick={() => setShowBmiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 text-xs text-zinc-300 font-medium transition-all"
            title="Launch BMI Calculator"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">BMI Calculator</span>
          </button>

          {/* Feedback Trigger */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            title="Submit Feedback"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleSwitcher(false);
                setShowProfileMenu(!showProfileMenu);
              }}
              className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 sm:pl-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition-colors min-h-[38px]"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-zinc-700 shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <span className="text-xs font-semibold text-zinc-200 hidden md:inline max-w-[100px] truncate">
                {user.name}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase hidden sm:inline-block ${roleBadgeStyles}`}>
                {user.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50 text-xs"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                  <div className="font-bold text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-medium min-h-[40px]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <BmiCalculatorModal isOpen={showBmiModal} onClose={() => setShowBmiModal(false)} />
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
      <RoleAuthModal
        isOpen={showRoleAuthModal}
        onClose={() => setShowRoleAuthModal(false)}
        initialRole={targetAuthRole}
      />
    </>
  );
};
