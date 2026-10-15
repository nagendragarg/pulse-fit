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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'live' | 'accent' | 'default';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  if (!user) return null;

  let sections: NavSection[] = [];

  if (user.role === 'USER') {
    sections = [
      {
        title: 'TRAINING & PERFORMANCE',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'workout-plans', label: 'Workout Plans', icon: Dumbbell },
          { id: 'ai-videos', label: 'Exercise Studio', icon: Video, badge: 'HD', badgeVariant: 'accent' },
          { id: 'active-session', label: 'Active Session', icon: PlayCircle, badge: 'LIVE', badgeVariant: 'live' },
          { id: 'history', label: 'Workout History', icon: History },
        ],
      },
      {
        title: 'BODY & NUTRITION',
        items: [
          { id: 'progress', label: 'Progress & 1RM Goals', icon: TrendingUp },
          { id: 'nutrition', label: 'Macronutrients', icon: Apple, badge: 'AI', badgeVariant: 'accent' },
          { id: 'bmi', label: 'BMI & Composition', icon: Scale },
        ],
      },
      {
        title: 'COACHING',
        items: [
          { id: 'messages', label: 'Coach Messages', icon: MessageSquare },
          { id: 'profile', label: 'Athlete Profile', icon: User },
        ],
      },
    ];
  } else if (user.role === 'COACH') {
    sections = [
      {
        title: 'ATHLETE ROSTER',
        items: [
          { id: 'coach-dashboard', label: 'Command Center', icon: LayoutDashboard },
          { id: 'coach-clients', label: 'My Athletes & Clients', icon: Users },
          { id: 'coach-messages', label: 'Client Messages', icon: MessageSquare },
        ],
      },
      {
        title: 'PROGRAMMING',
        items: [
          { id: 'plan-builder', label: 'Workout Plan Builder', icon: PlusCircle },
          { id: 'ai-videos', label: 'Exercise Video Studio', icon: Video, badge: 'HD', badgeVariant: 'accent' },
          { id: 'coach-analytics', label: 'Plan Analytics', icon: BarChart3 },
        ],
      },
      {
        title: 'PROFILE',
        items: [
          { id: 'coach-profile', label: 'Coach Credentials', icon: User },
        ],
      },
    ];
  } else if (user.role === 'ADMIN') {
    sections = [
      {
        title: 'PLATFORM MANAGEMENT',
        items: [
          { id: 'admin-dashboard', label: 'Executive Overview', icon: LayoutDashboard },
          { id: 'admin-users', label: 'User Directory', icon: Users },
          { id: 'ai-videos', label: 'Video Asset Studio', icon: Video, badge: 'HD', badgeVariant: 'accent' },
        ],
      },
      {
        title: 'GOVERNANCE & AUDIT',
        items: [
          { id: 'admin-moderation', label: 'Content Moderation', icon: ShieldCheck },
          { id: 'admin-feedback', label: 'User Feedback', icon: MessageSquare },
          { id: 'admin-settings', label: 'System Settings', icon: Sliders },
        ],
      },
    ];
  }

  const roleMeta = {
    USER: { title: 'Athlete Portal', dot: 'bg-emerald-400', accent: 'text-emerald-400' },
    COACH: { title: 'Coach Headquarters', dot: 'bg-cyan-400', accent: 'text-cyan-400' },
    ADMIN: { title: 'Admin Console', dot: 'bg-purple-400', accent: 'text-purple-400' },
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
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/70 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3.5 flex-1 overflow-y-auto">
          {/* Header on mobile with close */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60 lg:hidden">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${roleMeta.dot}`} />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{roleMeta.title}</span>
            </div>
            <button onClick={onCloseMobile} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop portal sub-label */}
          <div className="hidden lg:flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <span className={`w-2 h-2 rounded-full ${roleMeta.dot} animate-pulse`} />
              <span>{roleMeta.title}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{user.role}</span>
          </div>

          <div className="space-y-5">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 py-1">
                  {section.title}
                </div>
                <nav className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all group relative ${
                          isActive
                            ? 'bg-zinc-900 text-white font-semibold border border-zinc-700/80 shadow-sm pl-3.5'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 border border-transparent'
                        }`}
                      >
                        {isActive && (
                          <span
                            className="absolute left-1 top-2 bottom-2 w-1 bg-emerald-400 rounded-full"
                            aria-hidden="true"
                          />
                        )}
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              item.badgeVariant === 'live'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
            ))}
          </div>
        </div>

        {/* User Mini Profile Footer */}
        <div className="p-3.5 border-t border-zinc-800/70 bg-zinc-950/70">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-zinc-100 truncate">{user.name}</div>
              <div className="text-[10px] text-zinc-400 truncate capitalize flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot}`} />
                <span>{user.role.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
