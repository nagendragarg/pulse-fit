import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, Flame, Award } from 'lucide-react';
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

export const CoachAnalyticsPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/coach/dashboard');
        setDashboardData(res);
      } catch (err) {
        console.error('Failed to load coach analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const planEngagement = dashboardData?.planEngagement || [];

  // Sample data for muscle group training distribution
  const volumeData = [
    { muscle: 'Chest', volume: 34 },
    { muscle: 'Back', volume: 28 },
    { muscle: 'Legs', volume: 42 },
    { muscle: 'Shoulders', volume: 22 },
    { muscle: 'Arms', volume: 18 },
    { muscle: 'Core', volume: 15 },
  ];

  const adherencePie = [
    { name: 'Completed on Time', value: 78, color: '#10b981' },
    { name: 'Completed Later', value: 14, color: '#06b6d4' },
    { name: 'Skipped / Rest Day', value: 8, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Plan Analytics & Client Adherence</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Detailed metrics evaluating workout plan efficacy, volume distribution, and athlete completion trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Engagement Bar Chart */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
          <h3 className="text-base font-bold text-white mb-1">Athlete Enrollment & Completions by Plan</h3>
          <p className="text-xs text-zinc-400 mb-6">Comparison of total athletes assigned vs sessions completed</p>

          <div className="h-64 w-full">
            {planEngagement.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="planTitle" stroke="#71717a" fontSize={10} tickLine={false} />
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
                  <Bar dataKey="assignedCount" name="Athletes" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completedSessions" name="Sessions Done" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No plan data available.
              </div>
            )}
          </div>
        </div>

        {/* Adherence Distribution */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
          <h3 className="text-base font-bold text-white mb-1">Overall Athlete Adherence Ratio</h3>
          <p className="text-xs text-zinc-400 mb-6">Percentage of assigned weekly workouts fulfilled</p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adherencePie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={5}
                >
                  {adherencePie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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

      {/* Program Volume Breakdown */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-1">Weekly Muscle Group Workload Distribution</h3>
        <p className="text-xs text-zinc-400 mb-6">Total programmed weekly sets across your coaching library</p>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="muscle" stroke="#71717a" fontSize={11} tickLine={false} />
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
              <Bar dataKey="volume" name="Weekly Sets" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
