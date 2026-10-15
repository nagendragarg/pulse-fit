import React, { useState, useEffect } from 'react';
import {
  Users,
  Dumbbell,
  Award,
  TrendingUp,
  MessageSquare,
  PlusCircle,
  Clock,
  Flame,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { StatCard } from '../../components/StatCard.tsx';

interface CoachDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCoachData() {
      setIsLoading(true);
      try {
        const res = await api.get('/coach/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load coach dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCoachData();
  }, []);

  const stats = data?.stats;
  const recentLogs = data?.recentLogs || [];
  const planEngagement = data?.planEngagement || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-cyan-950/40 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" /> Certified Coach Headquarters
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, Coach {user?.name.split(',')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
            Track your athletes' weekly volume, review workout submissions, and design periodized strength splits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('plan-builder')}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs sm:text-sm font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> New Workout Plan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Athletes"
          value={stats?.totalClients || 0}
          subtitle="Assigned clients"
          icon={Users}
          accentColor="cyan"
          onClick={() => onNavigateTab('coach-clients')}
        />
        <StatCard
          title="Active Trainees"
          value={stats?.activeClients || 0}
          subtitle="Currently following plan"
          icon={Dumbbell}
          accentColor="emerald"
          onClick={() => onNavigateTab('coach-clients')}
        />
        <StatCard
          title="Completed Sessions"
          value={stats?.totalCompletedWorkouts || 0}
          subtitle="Client workout logs"
          icon={CheckCircle2}
          accentColor="purple"
        />
        <StatCard
          title="Weekly Adherence"
          value={`${stats?.completionRate || 85}%`}
          subtitle="Client plan consistency"
          icon={TrendingUp}
          accentColor="amber"
          trend={{ value: 'Target > 80%', isPositive: true }}
        />
      </div>

      {/* Main Grid: Client Activity Feed + Plan Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Client Workouts Feed (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Live Client Workout Submissions</h3>
              <p className="text-xs text-zinc-400">Real-time performance logs submitted by your athletes</p>
            </div>
            <button
              onClick={() => onNavigateTab('coach-clients')}
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              View All Athletes <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
                      {log.clientAvatar ? (
                        <img src={log.clientAvatar} alt={log.clientName} className="w-full h-full object-cover" />
                      ) : (
                        log.clientName?.charAt(0) || 'A'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{log.clientName}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(log.completedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-400 font-medium">{log.routineTitle}</div>
                      {log.notes && (
                        <p className="text-[11px] text-zinc-400 italic line-clamp-1 mt-0.5">"{log.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-center">
                    <span className="text-zinc-300">{log.durationMinutes} min</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {log.caloriesBurned} kcal
                    </span>
                    <span className="text-zinc-400">RPE: {log.perceivedEffort}/10</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No client workout submissions logged yet.
            </div>
          )}
        </div>

        {/* Plan Engagement Summary */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Plan Engagement</h3>
            <button
              onClick={() => onNavigateTab('plan-builder')}
              className="text-xs text-cyan-400 font-semibold hover:underline"
            >
              + Create Plan
            </button>
          </div>

          <div className="space-y-3">
            {planEngagement.map((pe: any) => (
              <div key={pe.planId} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{pe.planTitle}</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                    {pe.difficulty}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono">
                  <span>{pe.assignedCount} Athletes Enrolled</span>
                  <span className="text-emerald-400 font-bold">{pe.completedSessions} Sessions Completed</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-850">
            <button
              onClick={() => onNavigateTab('coach-messages')}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Open Athlete Messenger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
