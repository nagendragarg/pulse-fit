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
      borderHover: 'hover:border-emerald-500/40',
      iconBox: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'from-emerald-500/[0.04]',
    },
    cyan: {
      borderHover: 'hover:border-cyan-500/40',
      iconBox: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'from-cyan-500/[0.04]',
    },
    amber: {
      borderHover: 'hover:border-amber-500/40',
      iconBox: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'from-amber-500/[0.04]',
    },
    purple: {
      borderHover: 'hover:border-purple-500/40',
      iconBox: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'from-purple-500/[0.04]',
    },
    rose: {
      borderHover: 'hover:border-rose-500/40',
      iconBox: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'from-rose-500/[0.04]',
    },
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 bg-gradient-to-b ${
        colorStyles.glow
      } to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200 ${colorStyles.borderHover} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase font-mono">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${colorStyles.iconBox}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-md font-mono ${
              trend.isPositive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-zinc-400 mt-1.5">{subtitle}</p>}
    </div>
  );
};
