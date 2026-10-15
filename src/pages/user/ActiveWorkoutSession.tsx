import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';
import { WorkoutPlan, WorkoutRoutine, Exercise } from '../../types/index.ts';
import { ExerciseVideoModal } from '../../components/ExerciseVideoModal.tsx';

interface ActiveWorkoutSessionProps {
  routineId?: string;
  onFinishSession: () => void;
  onCancel: () => void;
}

interface SetLog {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  targetWeightKg: number;
  actualWeightKg: number;
  isCompleted: boolean;
}

interface ExerciseSessionState {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  restSeconds: number;
  notes?: string;
  sets: SetLog[];
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  routineId,
  onFinishSession,
  onCancel,
}) => {
  const { success, error } = useToast();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [exercisesState, setExercisesState] = useState<ExerciseSessionState[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [activeVideoExercise, setActiveVideoExercise] = useState<Exercise | null>(null);
  const [perceivedEffort, setPerceivedEffort] = useState<number>(8);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(380);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Rest Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      success('Rest interval complete! Ready for next set.', 'Timer');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, success]);

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    async function loadRoutine() {
      setIsLoading(true);
      try {
        const [res, lib] = await Promise.all([
          api.get('/workouts/my-assigned'),
          api.get<Exercise[]>('/workouts/exercises'),
        ]);
        setExerciseLibrary(lib);

        if (res.plan) {
          setPlan(res.plan);
          let targetRoutine = res.plan.routines[0];
          if (routineId) {
            const found = res.plan.routines.find((r: any) => r.id === routineId);
            if (found) targetRoutine = found;
          }
          setRoutine(targetRoutine);

          // Initialize exercise states
          if (targetRoutine && targetRoutine.exercises) {
            const initialized: ExerciseSessionState[] = targetRoutine.exercises.map((ex: any) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              muscleGroup: ex.muscleGroup,
              restSeconds: ex.restSeconds || 60,
              notes: ex.notes,
              sets: Array.from({ length: ex.sets || 3 }).map((_, sIdx) => ({
                setNumber: sIdx + 1,
                targetReps: ex.reps || 10,
                actualReps: ex.reps || 10,
                targetWeightKg: ex.targetWeightKg || 0,
                actualWeightKg: ex.targetWeightKg || 0,
                isCompleted: false,
              })),
            }));
            setExercisesState(initialized);
          }
        }
      } catch (err: any) {
        error(err.message || 'Failed to load workout routine', 'Error');
      } finally {
        setIsLoading(false);
      }
    }

    loadRoutine();
  }, [routineId, error]);

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = [...exercisesState];
    const currentStatus = updated[exIdx].sets[setIdx].isCompleted;
    updated[exIdx].sets[setIdx].isCompleted = !currentStatus;
    setExercisesState(updated);

    if (!currentStatus) {
      // Trigger rest timer
      startRestTimer(updated[exIdx].restSeconds || 60);
    }
  };

  const updateSetActuals = (
    exIdx: number,
    setIdx: number,
    field: 'actualReps' | 'actualWeightKg',
    val: number
  ) => {
    const updated = [...exercisesState];
    updated[exIdx].sets[setIdx][field] = val;
    setExercisesState(updated);
  };

  const handleFinishWorkout = async () => {
    setIsSubmitting(true);
    try {
      // Collect completed exercise performance logs
      const flatLogs: any[] = [];
      exercisesState.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.isCompleted) {
            flatLogs.push({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              setNumber: s.setNumber,
              repsCompleted: s.actualReps,
              weightUsedKg: s.actualWeightKg,
            });
          }
        });
      });

      // Submit to backend
      await api.post('/workouts/log-completion', {
        planId: plan?.id,
        routineId: routine?.id,
        routineTitle: routine ? routine.dayLabel : 'Workout Session',
        durationMinutes,
        caloriesBurned,
        perceivedEffort,
        notes: sessionNotes || 'Crushed all target sets.',
        exerciseLogs: flatLogs,
      });

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      success('Workout recorded! Your coach has been notified of your completion.', 'Session Completed!');
      onFinishSession();
    } catch (err: any) {
      error(err.message || 'Failed to save workout session', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-zinc-400 text-sm">
        <Dumbbell className="w-8 h-8 mx-auto text-emerald-400 animate-bounce mb-3" />
        Preparing live training environment...
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-lg font-bold text-white mb-2">No Routine Available</h3>
        <p className="text-zinc-400 text-xs mb-4">Please enroll in a workout plan first.</p>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const completedSetsCount = exercisesState.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSetsCount = exercisesState.reduce((acc, ex) => acc + ex.sets.length, 0);
  const percentComplete = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <button
          onClick={onCancel}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Session
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Session
          </span>
          <button
            onClick={handleFinishWorkout}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Finish Workout
          </button>
        </div>
      </div>

      {/* Routine Header Card */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{plan?.title}</span>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">{routine.dayLabel}</h1>
            <p className="text-xs text-zinc-400 mt-1">{routine.description}</p>
          </div>

          {/* Rest Timer Widget */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Rest Timer</div>
              <div className="text-lg font-mono font-extrabold text-white">
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                title={isTimerRunning ? 'Pause' : 'Start'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setTimerSeconds(60);
                  setIsTimerRunning(true);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                title="Reset to 60s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Overall Completion Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-zinc-400">Routine Progress</span>
            <span className="text-emerald-400 font-mono">
              {completedSetsCount} / {totalSetsCount} Sets ({percentComplete}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercises Execution Cards */}
      <div className="space-y-4">
        {exercisesState.map((ex, exIdx) => {
          const completedInThisEx = ex.sets.filter((s) => s.isCompleted).length;
          return (
            <div
              key={ex.exerciseId || exIdx}
              className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden p-5 transition-colors hover:border-zinc-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-sm text-emerald-400 shrink-0">
                    {exIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{ex.exerciseName}</h3>
                    <div className="text-xs text-zinc-400">
                      {ex.muscleGroup} • {completedInThisEx}/{ex.sets.length} Sets Completed • {ex.restSeconds}s rest
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const match = exerciseLibrary.find((l) => l.name === ex.exerciseName) || {
                        id: ex.exerciseId,
                        name: ex.exerciseName,
                        muscleGroup: ex.muscleGroup,
                        equipment: 'Gym Equipment',
                        description: 'Compound resistance movement.',
                        instructions: 'Maintain core brace, track joints, and control eccentric cadence.',
                        videoUrl: 'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg&playsinline=1&controls=1&rel=0',
                      };
                      setActiveVideoExercise(match);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-400 font-semibold transition-colors flex items-center gap-1 min-h-[32px]"
                  >
                    <Play className="w-3 h-3 fill-emerald-400" /> Form Video & AI Guide
                  </button>
                  <button
                    onClick={() => startRestTimer(ex.restSeconds || 60)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 font-medium transition-colors min-h-[32px]"
                  >
                    Rest {ex.restSeconds}s
                  </button>
                </div>
              </div>

              {ex.notes && (
                <div className="text-xs text-zinc-400 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-850 mb-4 leading-relaxed">
                  💡 <span className="font-semibold text-zinc-300">Coaching Note:</span> {ex.notes}
                </div>
              )}

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[340px]">
                  <thead>
                    <tr className="border-b border-zinc-850 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-2 pl-2">Set</th>
                      <th className="pb-2">Target</th>
                      <th className="pb-2">Actual Weight (kg)</th>
                      <th className="pb-2">Actual Reps</th>
                      <th className="pb-2 text-right pr-2">Done</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {ex.sets.map((set, setIdx) => (
                      <tr
                        key={set.setNumber}
                        className={`transition-colors ${set.isCompleted ? 'bg-emerald-950/20' : ''}`}
                      >
                        <td className="py-2.5 pl-2 font-mono font-bold text-zinc-400">#{set.setNumber}</td>
                        <td className="py-2.5 text-zinc-300">
                          {set.targetWeightKg ? `${set.targetWeightKg} kg × ` : ''}
                          {set.targetReps} reps
                        </td>
                        <td className="py-2.5">
                          <input
                            type="number"
                            step="0.5"
                            value={set.actualWeightKg}
                            onChange={(e) =>
                              updateSetActuals(exIdx, setIdx, 'actualWeightKg', Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="py-2.5">
                          <input
                            type="number"
                            value={set.actualReps}
                            onChange={(e) =>
                              updateSetActuals(exIdx, setIdx, 'actualReps', Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="py-2.5 text-right pr-2">
                          <button
                            type="button"
                            onClick={() => toggleSetComplete(exIdx, setIdx)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              set.isCompleted
                                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Finish Metrics */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Session Wrap-up & Effort</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Estimated Calories Burned</label>
            <input
              type="number"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
            <span>Perceived Effort (RPE 1-10)</span>
            <span className="text-emerald-400 font-bold">{perceivedEffort} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={perceivedEffort}
            onChange={(e) => setPerceivedEffort(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>1 (Very Light)</span>
            <span>5 (Moderate)</span>
            <span>8 (Heavy Work)</span>
            <span>10 (Maximum Effort)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Post-Workout Athlete Notes</label>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Bar speed felt explosive on sets 1-3. Left shoulder felt 100%..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleFinishWorkout}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Complete & Save Session
          </button>
        </div>
      </div>

      {/* Exercise Video & Form Guide Modal */}
      <ExerciseVideoModal
        isOpen={!!activeVideoExercise}
        onClose={() => setActiveVideoExercise(null)}
        exercise={activeVideoExercise}
      />
    </div>
  );
};
