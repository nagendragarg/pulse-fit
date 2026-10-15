import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  TrendingUp,
  Dumbbell,
  PlayCircle,
  Calendar,
  Clock,
  ArrowRight,
  Scale,
  Apple,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  Video,
  Play,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { WorkoutPlan, WorkoutAssignment, WorkoutLog, NutritionSummary, Exercise } from '../../types/index.ts';
import { ExerciseVideoModal } from '../../components/ExerciseVideoModal.tsx';
import { WorkoutPlanVideoWalkthroughModal } from '../../components/WorkoutPlanVideoWalkthroughModal.tsx';
import { FitnessGoalsCard } from '../../components/FitnessGoalsCard.tsx';

interface UserDashboardProps {
  onNavigateTab: (tab: string) => void;
  onStartRoutine: (routineId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigateTab, onStartRoutine }) => {
  const { user, updateUser } = useAuth();
  const [assignedData, setAssignedData] = useState<{
    assignment: WorkoutAssignment | null;
    plan: WorkoutPlan | null;
  } | null>(null);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [activeVideoExercise, setActiveVideoExercise] = useState<Exercise | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [recentLogs, setRecentLogs] = useState<WorkoutLog[]>([]);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
  const [coachInfo, setCoachInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true);
      try {
        const [assignedRes, logsRes, progRes, nutRes, profRes, exLib] = await Promise.all([
          api.get('/workouts/my-assigned'),
          api.get('/workouts/history'),
          api.get('/progress'),
          api.get('/nutrition'),
          api.get('/users/profile'),
          api.get<Exercise[]>('/workouts/exercises'),
        ]);

        setAssignedData(assignedRes);
        setRecentLogs(logsRes.slice(0, 4));
        setProgressStats(progRes.stats);
        setNutritionSummary(nutRes);
        setCoachInfo(profRes.coach);
        setExerciseLibrary(exLib);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const plan = assignedData?.plan;
  const todaysRoutine = plan && plan.routines && plan.routines.length > 0 ? plan.routines[0] : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-emerald-950/40 border border-zinc-800 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Text & Actions */}
          <div className="max-w-2xl relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>Active Training Microcycle</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to train, {user?.name}?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              {plan
                ? `You are currently executing the "${plan.title}" program. Focus on progressive overload and hitting your daily protein targets.`
                : 'Choose a workout plan to begin your customized progression journey with your coach.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              {todaysRoutine && (
                <button
                  onClick={() => onStartRoutine(todaysRoutine.id)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" /> Start Today's Session
                </button>
              )}
              <button
                onClick={() => onNavigateTab('nutrition')}
                className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border border-zinc-700/60 text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Apple className="w-4 h-4 text-emerald-400" /> Log Daily Meal
              </button>
              <button
                onClick={() => onNavigateTab('workout-plans')}
                className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border border-zinc-700/60 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Dumbbell className="w-4 h-4 text-zinc-400" /> View Workout Plans
              </button>
            </div>
          </div>

          {/* Up Next Quick Card */}
          {todaysRoutine && (
            <div className="shrink-0 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 lg:w-80 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Up Next Today
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                  {todaysRoutine.dayLabel || `${todaysRoutine.exercises.length} Exercises`}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{todaysRoutine.title}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{todaysRoutine.description || `${todaysRoutine.exercises.length} focused exercises scheduled`}</p>
              <button
                onClick={() => onStartRoutine(todaysRoutine.id)}
                className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Start Workout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Workouts Completed"
          value={progressStats?.totalWorkouts || recentLogs.length}
          subtitle="Total logged sessions"
          icon={Dumbbell}
          accentColor="emerald"
          onClick={() => onNavigateTab('history')}
        />
        <StatCard
          title="Current Streak"
          value={`${progressStats?.currentStreak || 3} Days`}
          subtitle="Keep the momentum going"
          icon={Flame}
          accentColor="amber"
          trend={{ value: '+1 Day', isPositive: true }}
        />
        <StatCard
          title="Current Weight"
          value={`${user?.currentWeightKg || 78} kg`}
          subtitle={user?.targetWeightKg ? `Target: ${user.targetWeightKg} kg` : 'Tracking progress'}
          icon={Scale}
          accentColor="cyan"
          onClick={() => onNavigateTab('progress')}
        />
        <StatCard
          title="Today's Calories"
          value={`${nutritionSummary?.summary.totalCalories || 0} kcal`}
          subtitle={`Goal: ${nutritionSummary?.summary.targets.calories || 2400} kcal`}
          icon={Apple}
          accentColor="purple"
          onClick={() => onNavigateTab('nutrition')}
        />
      </div>

      {/* Fitness Goals Tracking Component */}
      <FitnessGoalsCard
        onWeightUpdated={(newWeightKg, newTargetKg) => {
          updateUser({
            currentWeightKg: newWeightKg,
            ...(newTargetKg ? { targetWeightKg: newTargetKg } : {}),
          });
        }}
      />

      {/* Main Grid: Today's Workout + Coach / Nutrition Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout Card (2 cols on lg) */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Scheduled Routine</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {todaysRoutine ? todaysRoutine.dayLabel : 'No Routine Scheduled'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {plan && todaysRoutine && (
                  <button
                    type="button"
                    onClick={() => setIsWalkthroughOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1.5 shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5" /> Watch AI Videos
                  </button>
                )}
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
                  {plan?.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>

            {todaysRoutine ? (
              <div className="space-y-3 mb-6">
                <p className="text-xs text-zinc-400">{todaysRoutine.description}</p>
                <div className="space-y-2 mt-4">
                  {todaysRoutine.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between hover:border-zinc-750 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const match = exerciseLibrary.find((l) => l.name === ex.exerciseName) || {
                              id: ex.exerciseId,
                              name: ex.exerciseName,
                              muscleGroup: ex.muscleGroup,
                              equipment: 'Gym Equipment',
                              description: 'Exercise movement demonstration.',
                              instructions: 'Maintain core brace, track joints, and control eccentric cadence.',
                              videoUrl: 'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg&playsinline=1&controls=1&rel=0',
                            };
                            setActiveVideoExercise(match);
                          }}
                          className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black flex items-center justify-center text-xs font-bold transition-all border border-emerald-500/20"
                          title="Watch Exercise Form Video"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-white">{ex.exerciseName}</div>
                          <div className="text-[11px] text-zinc-400">
                            {ex.muscleGroup} • {ex.sets} sets × {ex.reps} reps
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-zinc-300">
                          {ex.targetWeightKg ? `${ex.targetWeightKg} kg` : 'Bodyweight'}
                        </div>
                        <div className="text-[10px] text-zinc-500">{ex.restSeconds}s rest</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 text-sm">
                No routines found for your current plan. Browse available plans to get started.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-850 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {todaysRoutine ? `${todaysRoutine.exercises.length} Exercises (~45-55 mins)` : '0 Exercises'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('workout-plans')}
                className="px-3 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              >
                View Full Plan
              </button>
              {todaysRoutine && (
                <button
                  onClick={() => onStartRoutine(todaysRoutine.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Start Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Coach Card + Macro Quick View */}
        <div className="space-y-6">
          {/* Coach Connection Card */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Your Coach</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20">
                Active
              </span>
            </div>

            {coachInfo ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                    {coachInfo.avatarUrl ? (
                      <img src={coachInfo.avatarUrl} alt={coachInfo.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white">
                        {coachInfo.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{coachInfo.name}</h4>
                    <p className="text-xs text-zinc-400 truncate">{coachInfo.email}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">{coachInfo.bio}</p>
                <button
                  onClick={() => onNavigateTab('messages')}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Message Coach
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-zinc-400 mb-3">No coach assigned yet.</p>
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-xs font-semibold"
                >
                  Select a Coach
                </button>
              </div>
            )}
          </div>

          {/* Today's Nutritional Macro Mini Preview */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Macros Breakdown</span>
              <button
                onClick={() => onNavigateTab('nutrition')}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-0.5"
              >
                Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-medium">Protein</span>
                  <span className="font-mono text-white font-semibold">
                    {nutritionSummary?.summary.totalProtein || 0}g / {nutritionSummary?.summary.targets.protein || 160}g
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((nutritionSummary?.summary.totalProtein || 0) /
                          (nutritionSummary?.summary.targets.protein || 160)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-medium">Carbohydrates</span>
                  <span className="font-mono text-white font-semibold">
                    {nutritionSummary?.summary.totalCarbs || 0}g / {nutritionSummary?.summary.targets.carbs || 260}g
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((nutritionSummary?.summary.totalCarbs || 0) /
                          (nutritionSummary?.summary.targets.carbs || 260)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-medium">Fats</span>
                  <span className="font-mono text-white font-semibold">
                    {nutritionSummary?.summary.totalFat || 0}g / {nutritionSummary?.summary.targets.fat || 65}g
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((nutritionSummary?.summary.totalFat || 0) /
                          (nutritionSummary?.summary.targets.fat || 65)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('nutrition')}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Auto-Detect Food & Nutrients with AI
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Workout History</h3>
            <p className="text-xs text-zinc-400">Past performance logs reviewed by your coach</p>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            View All History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      {new Date(log.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{log.routineTitle}</h4>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                    {log.durationMinutes} min
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/80">
                  <span className="flex items-center gap-1 font-mono text-amber-400">
                    <Flame className="w-3.5 h-3.5" /> {log.caloriesBurned} kcal
                  </span>
                  <span>RPE: {log.perceivedEffort}/10</span>
                  <span>{log.exerciseLogs.length} exercises logged</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No completed sessions recorded yet. Start your first session above!
          </div>
        )}
      </div>

      {/* Exercise Video Modal */}
      <ExerciseVideoModal
        isOpen={!!activeVideoExercise}
        onClose={() => setActiveVideoExercise(null)}
        exercise={activeVideoExercise}
      />

      {/* Routine / Plan Video Walkthrough Modal */}
      <WorkoutPlanVideoWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        plan={plan || null}
        initialRoutineId={todaysRoutine?.id}
        onStartRoutine={onStartRoutine}
      />
    </div>
  );
};
