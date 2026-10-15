import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Video,
  Apple,
  User,
  Users,
  PlusCircle,
  MessageSquare,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  if (!user) return null;

  type NavItem = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  };

  let items: NavItem[] = [];

  if (user.role === 'USER') {
    items = [
      { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
      { id: 'workout-plans', label: 'Workouts', icon: Dumbbell },
      { id: 'ai-videos', label: 'Videos', icon: Video },
      { id: 'nutrition', label: 'Macros', icon: Apple },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  } else if (user.role === 'COACH') {
    items = [
      { id: 'coach-dashboard', label: 'Home', icon: LayoutDashboard },
      { id: 'coach-clients', label: 'Athletes', icon: Users },
      { id: 'plan-builder', label: 'Builder', icon: PlusCircle },
      { id: 'coach-messages', label: 'Chat', icon: MessageSquare },
      { id: 'coach-analytics', label: 'Analytics', icon: BarChart3 },
    ];
  } else if (user.role === 'ADMIN') {
    items = [
      { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'admin-users', label: 'Users', icon: Users },
      { id: 'ai-videos', label: 'Videos', icon: Video },
      { id: 'admin-moderation', label: 'Moderate', icon: ShieldCheck },
      { id: 'admin-feedback', label: 'Feedback', icon: MessageSquare },
    ];
  }

  const roleAccent = {
    USER: 'text-emerald-400',
    COACH: 'text-cyan-400',
    ADMIN: 'text-purple-400',
  }[user.role];

  const roleDot = {
    USER: 'bg-emerald-400',
    COACH: 'bg-cyan-400',
    ADMIN: 'bg-purple-400',
  }[user.role];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 lg:hidden px-1 safe-area-inset-bottom shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all duration-150 active:scale-95 group relative"
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-zinc-900 shadow-inner' : 'group-hover:bg-zinc-900/40'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? `${roleAccent} scale-110` : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
              </div>

              <span
                className={`text-[10px] font-semibold tracking-tight transition-colors mt-0.5 truncate max-w-full ${
                  isActive ? `${roleAccent} font-bold` : 'text-zinc-400 group-hover:text-zinc-200'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${roleDot}`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
