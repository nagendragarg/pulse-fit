import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'emerald',
  onClick,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'from-emerald-500/10 to-transparent',
      border: 'hover:border-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-transparent',
      border: 'hover:border-cyan-500/30',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-transparent',
      border: 'hover:border-amber-500/30',
      iconBg: 'bg-amber-500/15 text-amber-400',
    },
    purple: {
      bg: 'from-purple-500/10 to-transparent',
      border: 'hover:border-purple-500/30',
      iconBg: 'bg-purple-500/15 text-purple-400',
    },
    rose: {
      bg: 'from-rose-500/10 to-transparent',
      border: 'hover:border-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-400',
    },
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 bg-gradient-to-b ${
        colorStyles.bg
      } transition-all duration-200 ${colorStyles.border} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">{title}</span>
        <div className={`p-2.5 rounded-xl ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${
              trend.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
    </div>
  );
};
