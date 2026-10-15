import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Scale,
  Plus,
  Calendar,
  Flame,
  Award,
  ChevronRight,
  Loader2,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Modal } from '../../components/Modal.tsx';
import { ProgressRecord } from '../../types/index.ts';

export const ProgressTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [newWeight, setNewWeight] = useState<number>(user?.currentWeightKg || 80);
  const [newBodyFat, setNewBodyFat] = useState<string>('');
  const [newChest, setNewChest] = useState<string>('');
  const [newWaist, setNewWaist] = useState<string>('');
  const [newArms, setNewArms] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/progress');
      setRecords(data.records);
      setStats(data.stats);
    } catch (err: any) {
      error(err.message || 'Failed to fetch progress data', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    setIsSubmitting(true);
    try {
      await api.post('/progress', {
        weightKg: Number(newWeight),
        bodyFatPercentage: newBodyFat ? Number(newBodyFat) : undefined,
        chestCm: newChest ? Number(newChest) : undefined,
        waistCm: newWaist ? Number(newWaist) : undefined,
        armsCm: newArms ? Number(newArms) : undefined,
        notes: newNotes,
      });

      success('Progress log recorded successfully!', 'Updated');
      setShowLogModal(false);
      loadProgress();
    } catch (err: any) {
      error(err.message || 'Failed to record entry', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare chart data
  const chartData = records.map((r) => ({
    date: r.date,
    weight: r.weightKg,
    bodyFat: r.bodyFatPercentage,
  }));

  const targetWeight = user?.targetWeightKg || 85;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Progress & Biometrics Tracker</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Monitor body composition shifts, weight trajectories, and physical measurements
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log New Measurement
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Current Weight</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
            {stats?.currentWeight || user?.currentWeightKg || 78} <span className="text-xs text-zinc-400">kg</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">
            Target: {targetWeight} kg
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Baseline Weight</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-300 font-mono mt-1">
            {stats?.initialWeight || 75} <span className="text-xs text-zinc-400">kg</span>
          </div>
          <span className="text-xs text-zinc-400 mt-1 inline-block">Initial check-in</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Delta</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono mt-1">
            {stats?.weightDelta > 0 ? `+${stats?.weightDelta}` : stats?.weightDelta} <span className="text-xs text-zinc-400">kg</span>
          </div>
          <span className="text-xs text-zinc-400 mt-1 inline-block">Net progression</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Workout Streak</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
            {stats?.currentStreak || 3} <span className="text-xs text-zinc-400">days</span>
          </div>
          <span className="text-xs text-zinc-400 mt-1 inline-block">Consistent training</span>
        </div>
      </div>

      {/* Main Weight Progression Chart */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Body Weight Trajectory (kg)</h3>
            <p className="text-xs text-zinc-400">Historical trend towards target goal weight</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-0.5 bg-emerald-400" /> Recorded Weight
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-0.5 border-t border-dashed border-zinc-400" /> Target ({targetWeight}kg)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <ReferenceLine y={targetWeight} stroke="#a1a1aa" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No historical data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* History Log Table */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-4">Measurement Log History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">Date</th>
                <th className="pb-3">Weight (kg)</th>
                <th className="pb-3">Body Fat (%)</th>
                <th className="pb-3">Chest (cm)</th>
                <th className="pb-3">Waist (cm)</th>
                <th className="pb-3">Arms (cm)</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {records.slice().reverse().map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 font-mono text-zinc-300">{r.date}</td>
                  <td className="py-3 font-bold text-white font-mono">{r.weightKg} kg</td>
                  <td className="py-3 font-mono text-zinc-400">
                    {r.bodyFatPercentage ? `${r.bodyFatPercentage}%` : '—'}
                  </td>
                  <td className="py-3 font-mono text-zinc-400">{r.chestCm ? `${r.chestCm} cm` : '—'}</td>
                  <td className="py-3 font-mono text-zinc-400">{r.waistCm ? `${r.waistCm} cm` : '—'}</td>
                  <td className="py-3 font-mono text-zinc-400">{r.armsCm ? `${r.armsCm} cm` : '—'}</td>
                  <td className="py-3 text-zinc-400 italic max-w-xs truncate">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Measurement Modal */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Log New Measurement" maxWidth="md">
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Body Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={newWeight}
              onChange={(e) => setNewWeight(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 14.5"
                value={newBodyFat}
                onChange={(e) => setNewBodyFat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 102"
                value={newChest}
                onChange={(e) => setNewChest(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 83"
                value={newWaist}
                onChange={(e) => setNewWaist(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Arms (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 38"
                value={newArms}
                onChange={(e) => setNewArms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Check-in Notes</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Morning fasted weigh-in. Energy levels feeling prime..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
