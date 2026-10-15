import React, { useState, useEffect } from 'react';
import {
  Target,
  Trophy,
  Scale,
  Dumbbell,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Award,
  Zap,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { FitnessGoal, FitnessGoalsSummary, GoalCategory } from '../types/index.ts';
import { Modal } from './Modal.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface FitnessGoalsCardProps {
  onWeightUpdated?: (newWeightKg: number, newTargetKg?: number) => void;
}

const PRESET_STRENGTH_LIFTS = [
  { name: 'Barbell Bench Press', category: 'CHEST', defaultReps: 5, defaultTarget: 100 },
  { name: 'Barbell Back Squat', category: 'LEGS', defaultReps: 3, defaultTarget: 140 },
  { name: 'Conventional Deadlift', category: 'BACK', defaultReps: 1, defaultTarget: 180 },
  { name: 'Standing Overhead Press', category: 'SHOULDERS', defaultReps: 5, defaultTarget: 65 },
  { name: 'Barbell Bent-Over Row', category: 'BACK', defaultReps: 6, defaultTarget: 90 },
  { name: 'Weighted Pull-Ups', category: 'BACK', defaultReps: 5, defaultTarget: 25 },
  { name: 'Incline Dumbbell Press', category: 'CHEST', defaultReps: 8, defaultTarget: 36 },
  { name: 'Romanian Deadlift', category: 'LEGS', defaultReps: 8, defaultTarget: 120 },
];

export const FitnessGoalsCard: React.FC<FitnessGoalsCardProps> = ({ onWeightUpdated }) => {
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [summaryStats, setSummaryStats] = useState<FitnessGoalsSummary['stats'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'STRENGTH' | 'WEIGHT' | 'COMPLETED'>('ALL');

  // Modals state
  const [isStrengthModalOpen, setIsStrengthModalOpen] = useState<boolean>(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState<boolean>(false);
  const [isLogProgressModalOpen, setIsLogProgressModalOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);
  const [editingGoal, setEditingGoal] = useState<FitnessGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<FitnessGoal | null>(null);
  const [isDeletingGoal, setIsDeletingGoal] = useState<boolean>(false);

  // Form states for Strength Goal Modal
  const [formExerciseName, setFormExerciseName] = useState<string>('Barbell Bench Press');
  const [formCategory, setFormCategory] = useState<GoalCategory>('CHEST');
  const [formTargetWeight, setFormTargetWeight] = useState<string>('100');
  const [formCurrentWeight, setFormCurrentWeight] = useState<string>('85');
  const [formStartWeight, setFormStartWeight] = useState<string>('75');
  const [formTargetReps, setFormTargetReps] = useState<number>(5);
  const [formUnit, setFormUnit] = useState<'kg' | 'lbs'>('kg');
  const [formTargetDate, setFormTargetDate] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states for Target Weight Modal
  const [weightCurrent, setWeightCurrent] = useState<string>('81.5');
  const [weightTarget, setWeightTarget] = useState<string>('85.0');
  const [weightStart, setWeightStart] = useState<string>('78.0');
  const [weightTargetDate, setWeightTargetDate] = useState<string>('');
  const [weightNotes, setWeightNotes] = useState<string>('');

  // Form states for Quick Log Lift Modal
  const [logValue, setLogValue] = useState<string>('');
  const [logNotes, setLogNotes] = useState<string>('');
  const [markCompleteChecked, setMarkCompleteChecked] = useState<boolean>(false);

  // Load goals from API
  const fetchGoals = async () => {
    try {
      const res = await api.get<FitnessGoalsSummary>('/goals');
      setGoals(res.goals);
      setSummaryStats(res.stats);
    } catch (err) {
      console.error('Failed to load fitness goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Quick helper to format relative deadline
  const formatDeadline = (targetDateStr: string, isCompleted: boolean, completedAt?: string) => {
    if (isCompleted) {
      const dateText = completedAt
        ? new Date(completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Achieved';
      return {
        label: `Completed on ${dateText}`,
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        urgency: 'completed',
        icon: CheckCircle2,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `${Math.abs(diffDays)}d overdue`,
        badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        urgency: 'overdue',
        icon: AlertCircle,
      };
    } else if (diffDays === 0) {
      return {
        label: 'Target deadline is today',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
        urgency: 'today',
        icon: Clock,
      };
    } else if (diffDays <= 7) {
      return {
        label: `${diffDays} days left`,
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        urgency: 'soon',
        icon: Clock,
      };
    } else {
      return {
        label: `${diffDays} days left`,
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        urgency: 'normal',
        icon: Calendar,
      };
    }
  };

  // Calculate percentage progression
  const calculateProgress = (start: number, current: number, target: number) => {
    if (target === start) return current >= target ? 100 : 0;
    // For weight loss (target < start)
    if (target < start) {
      const totalLoss = start - target;
      const currentLoss = start - current;
      const pct = Math.max(0, Math.min(100, Math.round((currentLoss / totalLoss) * 100)));
      return pct;
    }
    // For weight gain or strength lift increase (target > start)
    const totalGain = target - start;
    const currentGain = current - start;
    const pct = Math.max(0, Math.min(100, Math.round((currentGain / totalGain) * 100)));
    return pct;
  };

  // Open Strength Goal modal in create or edit mode
  const openStrengthModal = (goalToEdit?: FitnessGoal) => {
    if (goalToEdit) {
      setEditingGoal(goalToEdit);
      setFormExerciseName(goalToEdit.exerciseName || goalToEdit.title);
      setFormCategory(goalToEdit.category || 'OTHER');
      setFormTargetWeight(goalToEdit.targetValue.toString());
      setFormCurrentWeight(goalToEdit.currentValue.toString());
      setFormStartWeight(goalToEdit.startValue.toString());
      setFormTargetReps(goalToEdit.targetReps || 1);
      setFormUnit(goalToEdit.unit || 'kg');
      setFormTargetDate(goalToEdit.targetDate);
      setFormNotes(goalToEdit.notes || '');
    } else {
      setEditingGoal(null);
      setFormExerciseName('Barbell Bench Press');
      setFormCategory('CHEST');
      setFormTargetWeight('100');
      setFormCurrentWeight('85');
      setFormStartWeight('75');
      setFormTargetReps(5);
      setFormUnit('kg');
      // Default target date: 45 days from today
      const d = new Date();
      d.setDate(d.getDate() + 45);
      setFormTargetDate(d.toISOString().split('T')[0]);
      setFormNotes('');
    }
    setIsStrengthModalOpen(true);
  };

  // Open Target Weight modal
  const openWeightModal = () => {
    const existing = goals.find((g) => g.type === 'WEIGHT');
    if (existing) {
      setWeightCurrent(existing.currentValue.toString());
      setWeightTarget(existing.targetValue.toString());
      setWeightStart(existing.startValue.toString());
      setWeightTargetDate(existing.targetDate);
      setWeightNotes(existing.notes || '');
    } else {
      setWeightCurrent('81.5');
      setWeightTarget('85.0');
      setWeightStart('78.0');
      const d = new Date();
      d.setDate(d.getDate() + 60);
      setWeightTargetDate(d.toISOString().split('T')[0]);
      setWeightNotes('Target athlete body weight composition.');
    }
    setIsWeightModalOpen(true);
  };

  // Save Strength Goal
  const handleSaveStrengthGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExerciseName || !formTargetWeight || !formTargetDate) return;

    setIsSubmitting(true);
    try {
      const payload = {
        type: 'STRENGTH',
        title: formExerciseName,
        exerciseName: formExerciseName,
        category: formCategory,
        startValue: Number(formStartWeight) || Number(formCurrentWeight),
        currentValue: Number(formCurrentWeight),
        targetValue: Number(formTargetWeight),
        unit: formUnit,
        targetReps: Number(formTargetReps) || 1,
        targetDate: formTargetDate,
        notes: formNotes,
      };

      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, payload);
      } else {
        await api.post('/goals', payload);
      }

      await fetchGoals();
      setIsStrengthModalOpen(false);
    } catch (err) {
      console.error('Failed to save strength goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Target Weight Goal
  const handleSaveWeightGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightTarget || !weightTargetDate) return;

    setIsSubmitting(true);
    try {
      const existingWeightGoal = goals.find((g) => g.type === 'WEIGHT');
      const payload = {
        type: 'WEIGHT',
        title: 'Target Body Weight',
        startValue: Number(weightStart) || Number(weightCurrent),
        currentValue: Number(weightCurrent),
        targetValue: Number(weightTarget),
        unit: 'kg',
        targetDate: weightTargetDate,
        notes: weightNotes,
      };

      if (existingWeightGoal) {
        await api.put(`/goals/${existingWeightGoal.id}`, payload);
      } else {
        await api.post('/goals', payload);
      }

      await fetchGoals();
      if (onWeightUpdated) {
        onWeightUpdated(Number(weightCurrent), Number(weightTarget));
      }
      setIsWeightModalOpen(false);
    } catch (err) {
      console.error('Failed to save weight goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Log Lift handler
  const openLogProgressModal = (goal: FitnessGoal) => {
    setSelectedGoal(goal);
    setLogValue(goal.currentValue.toString());
    setLogNotes(goal.notes || '');
    setMarkCompleteChecked(goal.currentValue >= goal.targetValue);
    setIsLogProgressModalOpen(true);
  };

  const handleSaveProgressLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !logValue) return;

    setIsSubmitting(true);
    try {
      const val = Number(logValue);
      await api.patch(`/goals/${selectedGoal.id}/log-progress`, {
        currentValue: val,
        notes: logNotes,
        markCompleted: markCompleteChecked || val >= selectedGoal.targetValue,
      });

      await fetchGoals();
      if (selectedGoal.type === 'WEIGHT' && onWeightUpdated) {
        onWeightUpdated(val, selectedGoal.targetValue);
      }
      setIsLogProgressModalOpen(false);
    } catch (err) {
      console.error('Failed to log progress:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle goal completion
  const handleToggleComplete = async (goal: FitnessGoal) => {
    try {
      await api.patch(`/goals/${goal.id}/toggle`);
      await fetchGoals();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  // Delete goal
  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    setIsDeletingGoal(true);
    try {
      await api.delete(`/goals/${goalToDelete.id}`);
      await fetchGoals();
      setGoalToDelete(null);
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      setIsDeletingGoal(false);
    }
  };

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    if (filterTab === 'STRENGTH') return g.type === 'STRENGTH';
    if (filterTab === 'WEIGHT') return g.type === 'WEIGHT';
    if (filterTab === 'COMPLETED') return g.status === 'COMPLETED';
    return true;
  });

  const weightGoal = goals.find((g) => g.type === 'WEIGHT');

  return (
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-7 relative overflow-hidden shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Component Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              Athlete Milestones
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Fitness & Strength Goals
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Track target body weight, key compound strength targets, and upcoming completion deadlines.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openWeightModal}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 text-zinc-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Set Target Weight</span>
          </button>
          <button
            type="button"
            onClick={() => openStrengthModal()}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Strength Goal</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      {summaryStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-850">
            <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Active Goals</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">{summaryStats.activeGoals}</span>
              <span className="text-[10px] text-zinc-500">in progress</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-850">
            <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Achieved</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-400">{summaryStats.completedGoals}</span>
              <span className="text-[10px] text-emerald-500/80">milestones hit</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-850">
            <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Strength Lifts</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-cyan-400">{summaryStats.strengthGoalsCount}</span>
              <span className="text-[10px] text-zinc-500">benchmarks</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-850">
            <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Next Deadline</span>
            <div className="flex items-baseline gap-1.5 truncate">
              {summaryStats.daysToNearestDeadline !== null ? (
                <>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {summaryStats.daysToNearestDeadline >= 0
                      ? `${summaryStats.daysToNearestDeadline}d`
                      : 'Due'}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate">
                    {summaryStats.nearestTargetDate
                      ? new Date(summaryStats.nearestTargetDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'soon'}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-zinc-500">None pending</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Target Weight Highlight Card (if exists) */}
      {weightGoal && (
        <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-cyan-950/30 border border-cyan-500/25 relative overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    Body Composition Target
                  </span>
                  {weightGoal.status === 'COMPLETED' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Goal Achieved
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-medium border border-cyan-500/20">
                      On Track
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Target Weight: <span className="font-mono text-cyan-400">{weightGoal.targetValue} kg</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                  {weightGoal.notes || 'Progressive body recomposition and mass milestone.'}
                </p>
              </div>
            </div>

            {/* Target Date & Quick Update Action */}
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              {(() => {
                const deadline = formatDeadline(weightGoal.targetDate, weightGoal.status === 'COMPLETED', weightGoal.completedAt);
                const DeadlineIcon = deadline.icon;
                return (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${deadline.badgeClass}`}>
                    <DeadlineIcon className="w-3.5 h-3.5" />
                    <span>Target Date: {new Date(weightGoal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-[10px] opacity-80 font-mono">({deadline.label})</span>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={openWeightModal}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust Target</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Measurements */}
          {(() => {
            const pct = calculateProgress(weightGoal.startValue, weightGoal.currentValue, weightGoal.targetValue);
            const deltaNeeded = Number((weightGoal.targetValue - weightGoal.currentValue).toFixed(1));
            return (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-zinc-400">
                      Baseline: <strong className="font-mono text-zinc-300">{weightGoal.startValue} kg</strong>
                    </span>
                    <span className="text-zinc-400">
                      Current: <strong className="font-mono text-white text-sm">{weightGoal.currentValue} kg</strong>
                    </span>
                    <span className="text-cyan-400 font-mono font-medium">
                      ({deltaNeeded > 0 ? `+${deltaNeeded}` : deltaNeeded} kg to goal)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-cyan-300 text-sm">{pct}% Complete</span>
                </div>

                <div className="h-3 rounded-full bg-zinc-950/80 p-0.5 border border-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 shadow-sm"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Filter Tabs with Mobile Scroll */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap min-w-max">
          {(
            [
              { key: 'ALL', label: 'All Goals', count: goals.length },
              { key: 'STRENGTH', label: 'Strength Lifts', count: goals.filter((g) => g.type === 'STRENGTH').length },
              { key: 'WEIGHT', label: 'Weight Goal', count: goals.filter((g) => g.type === 'WEIGHT').length },
              { key: 'COMPLETED', label: 'Achieved', count: goals.filter((g) => g.status === 'COMPLETED').length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                filterTab === tab.key
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  filterTab === tab.key ? 'bg-zinc-700 text-white' : 'bg-zinc-850 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals List / Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const isCompleted = goal.status === 'COMPLETED';
            const progressPct = calculateProgress(goal.startValue, goal.currentValue, goal.targetValue);
            const deadline = formatDeadline(goal.targetDate, isCompleted, goal.completedAt);
            const DeadlineIcon = deadline.icon;

            return (
              <div
                key={goal.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-zinc-900/40 border-emerald-500/25 hover:border-emerald-500/40'
                    : 'bg-zinc-900/70 border-zinc-850 hover:border-zinc-750'
                }`}
              >
                <div>
                  {/* Top Badges & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                        {goal.type === 'WEIGHT' ? 'BODY WEIGHT' : goal.category || 'STRENGTH'}
                      </span>
                      {goal.targetReps && goal.targetReps > 1 ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          {goal.targetReps} Reps
                        </span>
                      ) : goal.type === 'STRENGTH' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                          1RM Max
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(goal)}
                        title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}
                        className={`p-1.5 rounded-lg transition-colors border ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-emerald-400 hover:border-emerald-500/40'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openStrengthModal(goal)}
                        title="Edit Goal"
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalToDelete(goal)}
                        title="Delete Goal"
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Target Values */}
                  <div className="mb-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{goal.title}</span>
                      {isCompleted && (
                        <span title="Milestone Achieved" className="inline-flex items-center">
                          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </h4>
                    {goal.notes && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {goal.notes}
                      </p>
                    )}
                  </div>

                  {/* Target vs Current Values */}
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-850 mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">Current Lift</span>
                      <div className="text-sm font-bold text-white font-mono">
                        {goal.currentValue} {goal.unit}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">Baseline</span>
                      <div className="text-xs font-semibold text-zinc-400 font-mono">
                        {goal.startValue} {goal.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 block uppercase font-mono">Target Benchmark</span>
                      <div className="text-sm font-extrabold text-emerald-400 font-mono">
                        {goal.targetValue} {goal.unit}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400">Progress</span>
                      <span className="font-mono font-bold text-zinc-200">{progressPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-850 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Completion Date Badge & Log Lift button */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium truncate ${deadline.badgeClass}`}>
                    <DeadlineIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{deadline.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openLogProgressModal(goal)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-200 text-xs font-bold transition-all border border-zinc-700 hover:border-emerald-400 flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <Zap className="w-3 h-3 text-emerald-400 fill-current" />
                    <span>Log Progress</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
          <div className="w-12 h-12 rounded-2xl bg-zinc-850 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">No goals found for this filter</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Create customized strength benchmarks and target weight completion deadlines to track your athletic progress.
          </p>
          <button
            type="button"
            onClick={() => openStrengthModal()}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Set New Strength Goal
          </button>
        </div>
      )}

      {/* ===================== MODAL: ADD / EDIT STRENGTH GOAL ===================== */}
      <Modal
        isOpen={isStrengthModalOpen}
        onClose={() => setIsStrengthModalOpen(false)}
        title={editingGoal ? 'Edit Strength Milestone' : 'Set New Strength Goal'}
        subtitle="Define targeted compound lift benchmarks and assign completion dates."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStrengthGoal} className="space-y-5">
          {/* Preset Buttons for Quick Lift Selection */}
          {!editingGoal && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Popular Strength Lifts (Presets)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_STRENGTH_LIFTS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFormExerciseName(preset.name);
                      setFormCategory(preset.category as GoalCategory);
                      setFormTargetReps(preset.defaultReps);
                      setFormTargetWeight(preset.defaultTarget.toString());
                      setFormCurrentWeight((preset.defaultTarget * 0.85).toFixed(0));
                      setFormStartWeight((preset.defaultTarget * 0.75).toFixed(0));
                    }}
                    className={`p-2 rounded-xl text-left border transition-all text-xs ${
                      formExerciseName === preset.name
                        ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                        : 'bg-zinc-850/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="truncate font-semibold">{preset.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {preset.defaultTarget}kg × {preset.defaultReps}r
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exercise / Goal Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
              Exercise / Movement Name *
            </label>
            <input
              type="text"
              required
              value={formExerciseName}
              onChange={(e) => setFormExerciseName(e.target.value)}
              placeholder="e.g. Barbell Bench Press"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category & Reps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                Muscle Group
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as GoalCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="CHEST">Chest</option>
                <option value="LEGS">Legs (Quads/Glutes)</option>
                <option value="BACK">Back & Lats</option>
                <option value="SHOULDERS">Shoulders</option>
                <option value="ARMS">Arms</option>
                <option value="CORE">Core</option>
                <option value="FULL_BODY">Full Body</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                Target Rep Scheme
              </label>
              <select
                value={formTargetReps}
                onChange={(e) => setFormTargetReps(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Rep Max (1RM Test)</option>
                <option value={3}>3 Reps (Power / Triple)</option>
                <option value={5}>5 Reps (Strength Working Set)</option>
                <option value={8}>8 Reps (Hypertrophy / Volume)</option>
                <option value={10}>10 Reps</option>
                <option value={12}>12 Reps</option>
              </select>
            </div>
          </div>

          {/* Target Weight, Current Best, Starting Baseline */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                Starting (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={formStartWeight}
                onChange={(e) => setFormStartWeight(e.target.value)}
                placeholder="70"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                Current Best (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={formCurrentWeight}
                onChange={(e) => setFormCurrentWeight(e.target.value)}
                placeholder="85"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 font-mono">
                Target Lift (kg) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formTargetWeight}
                onChange={(e) => setFormTargetWeight(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-emerald-500/40 text-emerald-400 font-bold text-sm font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Completion Target Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                Target Completion Date *
              </label>
              {/* Quick shortcut buttons */}
              <div className="flex items-center gap-1.5">
                {[
                  { label: '+30 Days', days: 30 },
                  { label: '+60 Days', days: 60 },
                  { label: '+90 Days', days: 90 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + s.days);
                      setFormTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="date"
              required
              value={formTargetDate}
              onChange={(e) => setFormTargetDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Coaching Notes / Form focus */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
              Technique Focus & Coaching Notes
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Pause on chest for 1 second, drive heels into the floor, maintain core brace."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsStrengthModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Goal...' : editingGoal ? 'Update Strength Goal' : 'Save Strength Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ===================== MODAL: SET TARGET WEIGHT ===================== */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="Set Target Body Weight"
        subtitle="Establish target body mass, track weigh-in progress, and define completion date."
        maxWidth="md"
      >
        <form onSubmit={handleSaveWeightGoal} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2.5">
            <Scale className="w-5 h-5 shrink-0" />
            <span>
              Updating target weight synchronizes across your user profile, BMI analytics, and coaching logs.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightCurrent}
                onChange={(e) => setWeightCurrent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5 font-mono">
                Target Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightTarget}
                onChange={(e) => setWeightTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-cyan-500/40 text-cyan-300 font-bold font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
              Starting Baseline Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightStart}
              onChange={(e) => setWeightStart(e.target.value)}
              placeholder="e.g. 78.0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                Target Completion Date *
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '+30d', days: 30 },
                  { label: '+60d', days: 60 },
                  { label: '+90d', days: 90 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + s.days);
                      setWeightTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="date"
              required
              value={weightTargetDate}
              onChange={(e) => setWeightTargetDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
              Strategy / Nutrition Notes
            </label>
            <textarea
              rows={2}
              value={weightNotes}
              onChange={(e) => setWeightNotes(e.target.value)}
              placeholder="e.g. Clean caloric surplus of +250 kcal, tracking 2g/kg protein daily."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsWeightModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Target...' : 'Save Target Weight'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ===================== MODAL: QUICK LOG PROGRESS ===================== */}
      <Modal
        isOpen={isLogProgressModalOpen}
        onClose={() => setIsLogProgressModalOpen(false)}
        title={selectedGoal ? `Log Progress: ${selectedGoal.title}` : 'Log Progress'}
        subtitle="Record your latest weight or PR lift to update your completion metrics."
        maxWidth="md"
      >
        <form onSubmit={handleSaveProgressLog} className="space-y-4">
          {selectedGoal && (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Current Recorded</span>
                <div className="text-sm font-bold text-white font-mono">
                  {selectedGoal.currentValue} {selectedGoal.unit}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 uppercase font-mono">Target Milestone</span>
                <div className="text-sm font-extrabold text-emerald-400 font-mono">
                  {selectedGoal.targetValue} {selectedGoal.unit}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
              New Recorded Value ({selectedGoal?.unit || 'kg'}) *
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={logValue}
              onChange={(e) => setLogValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-emerald-500/40 text-emerald-400 font-bold font-mono text-base focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
              Session Performance Notes
            </label>
            <input
              type="text"
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="e.g. Felt very strong, controlled eccentric cadence."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="markCompleteCheck"
              checked={markCompleteChecked}
              onChange={(e) => setMarkCompleteChecked(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-700"
            />
            <label htmlFor="markCompleteCheck" className="text-xs text-zinc-300 select-none cursor-pointer">
              Mark this goal as completed and achieved!
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsLogProgressModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Log Progress'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Goal Dialog */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={confirmDeleteGoal}
        title="Remove Fitness Goal?"
        message={`Are you sure you want to remove "${goalToDelete?.title}"? All logged progressive overload history for this goal will be cleared.`}
        confirmText="Remove Goal"
        cancelText="Keep Goal"
        isDestructive={true}
        isLoading={isDeletingGoal}
      />
    </div>
  );
};
