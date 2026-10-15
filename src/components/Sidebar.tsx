import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  PlayCircle,
  History,
  TrendingUp,
  Apple,
  Scale,
  MessageSquare,
  User,
  Users,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  Sliders,
  X,
  Video,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  if (!user) return null;

  // Define nav items per role
  let navItems: { id: string; label: string; icon: any; badge?: string }[] = [];

  if (user.role === 'USER') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'workout-plans', label: 'Workout Plans', icon: Dumbbell },
      { id: 'ai-videos', label: 'AI Workout Videos', icon: Video, badge: 'HD' },
      { id: 'active-session', label: 'Active Session', icon: PlayCircle, badge: 'Live' },
      { id: 'history', label: 'Workout History', icon: History },
      { id: 'progress', label: 'Progress Tracker', icon: TrendingUp },
      { id: 'nutrition', label: 'Nutrition & Macros', icon: Apple, badge: 'AI' },
      { id: 'bmi', label: 'BMI Tracker', icon: Scale },
      { id: 'messages', label: 'Coach Messages', icon: MessageSquare },
      { id: 'profile', label: 'Profile & Goals', icon: User },
    ];
  } else if (user.role === 'COACH') {
    navItems = [
      { id: 'coach-dashboard', label: 'Coach Dashboard', icon: LayoutDashboard },
      { id: 'coach-clients', label: 'My Athletes & Clients', icon: Users },
      { id: 'plan-builder', label: 'Workout Plan Builder', icon: PlusCircle },
      { id: 'ai-videos', label: 'AI Exercise Videos', icon: Video, badge: 'HD' },
      { id: 'coach-messages', label: 'Client Messages', icon: MessageSquare },
      { id: 'coach-analytics', label: 'Plan Analytics', icon: BarChart3 },
      { id: 'coach-profile', label: 'Coach Credentials', icon: User },
    ];
  } else if (user.role === 'ADMIN') {
    navItems = [
      { id: 'admin-dashboard', label: 'Platform Overview', icon: LayoutDashboard },
      { id: 'admin-users', label: 'User Management', icon: Users },
      { id: 'ai-videos', label: 'Exercise Video Studio', icon: Video, badge: 'HD' },
      { id: 'admin-moderation', label: 'Content Moderation', icon: ShieldCheck },
      { id: 'admin-feedback', label: 'User Feedback', icon: MessageSquare },
      { id: 'admin-settings', label: 'System Settings', icon: Sliders },
    ];
  }

  const roleTitle = {
    USER: 'Athlete Portal',
    COACH: 'Coach Headquarters',
    ADMIN: 'Admin Console',
  }[user.role];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Header on mobile with close */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/60 lg:hidden">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{roleTitle}</span>
            <button onClick={onCloseMobile} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2 hidden lg:block">
            {roleTitle}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-black/20 text-black' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-zinc-500 truncate capitalize">{user.role.toLowerCase()}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
