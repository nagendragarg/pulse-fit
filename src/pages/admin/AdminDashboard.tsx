import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Dumbbell,
  Award,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Settings,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../../api/client.ts';
import { StatCard } from '../../components/StatCard.tsx';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      setIsLoading(true);
      try {
        const res = await api.get('/admin/stats');
        setData(res);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  const kpis = data?.kpis;
  const registrations = data?.registrationsByMonth || [];
  const activityDistribution = data?.activityDistribution || [];

  const COLORS = ['#10b981', '#06b6d4', '#a855f7', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/40 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-400">
              Platform Governance & Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PulseFit Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
            System overview, user role management, community moderation queue, and platform health telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {kpis?.pendingModeration > 0 && (
            <button
              onClick={() => onNavigateTab('admin-moderation')}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> {kpis.pendingModeration} Pending Reviews
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Athletes (Users)"
          value={kpis?.totalUsers || 0}
          subtitle={`${kpis?.activeUsers || 0} Active accounts`}
          icon={Users}
          accentColor="emerald"
          onClick={() => onNavigateTab('admin-users')}
        />
        <StatCard
          title="Coaching Staff"
          value={kpis?.totalCoaches || 0}
          subtitle="Certified instructors"
          icon={Award}
          accentColor="cyan"
          onClick={() => onNavigateTab('admin-users')}
        />
        <StatCard
          title="Workout Plans"
          value={kpis?.totalPlans || 0}
          subtitle="Published programs"
          icon={Dumbbell}
          accentColor="purple"
        />
        <StatCard
          title="Total Workouts Logged"
          value={kpis?.totalWorkoutsCompleted || 0}
          subtitle="Platform activity"
          icon={CheckCircle2}
          accentColor="amber"
        />
      </div>

      {/* Moderation & Feedback Alert Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigateTab('admin-moderation')}
          className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Content Moderation Queue</div>
              <div className="text-xs text-zinc-400">
                {kpis?.pendingModeration || 0} Submissions awaiting approval
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </div>

        <div
          onClick={() => onNavigateTab('admin-feedback')}
          className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Member Feedback Inbox</div>
              <div className="text-xs text-zinc-400">
                {kpis?.pendingFeedback || 0} Unreviewed suggestions
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
          <h3 className="text-base font-bold text-white mb-1">User Growth & Sign-ups</h3>
          <p className="text-xs text-zinc-400 mb-6">Cumulative registered accounts across past months</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" name="Users" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
          <h3 className="text-base font-bold text-white mb-1">Workout Disciplines Distribution</h3>
          <p className="text-xs text-zinc-400 mb-6">Primary training style chosen by platform members</p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityDistribution}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={5}
                >
                  {activityDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
