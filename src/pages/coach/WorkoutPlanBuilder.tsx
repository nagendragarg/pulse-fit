import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Dumbbell,
  Clock,
  Save,
  Loader2,
  Calendar,
  Sparkles,
  Check,
  ChevronDown,
  Play,
  Video,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';
import { Exercise } from '../../types/index.ts';
import { ExerciseVideoModal } from '../../components/ExerciseVideoModal.tsx';

interface ExerciseDraft {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  targetWeightKg: number;
  restSeconds: number;
  notes: string;
}

interface RoutineDraft {
  id: string;
  title: string;
  dayLabel: string;
  description: string;
  exercises: ExerciseDraft[];
}

export const WorkoutPlanBuilder: React.FC<{ onPlanSaved?: () => void }> = ({ onPlanSaved }) => {
  const { success, error } = useToast();
  const [exercisesLibrary, setExercisesLibrary] = useState<Exercise[]>([]);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [goal, setGoal] = useState('Muscle Hypertrophy & Strength');
  const [durationWeeks, setDurationWeeks] = useState<number>(8);

  const [routines, setRoutines] = useState<RoutineDraft[]>([
    {
      id: `rout-draft-1`,
      title: 'Upper Body Power',
      dayLabel: 'Day 1 - Chest, Shoulders & Triceps',
      description: 'Primary compound horizontal and overhead pressing microcycle.',
      exercises: [
        {
          id: `ex-draft-1`,
          exerciseName: 'Barbell Bench Press',
          muscleGroup: 'Chest',
          sets: 4,
          reps: 8,
          targetWeightKg: 80,
          restSeconds: 90,
          notes: 'Lower bar with control to sternum, drive heels into floor.',
        },
        {
          id: `ex-draft-2`,
          exerciseName: 'Incline Dumbbell Press',
          muscleGroup: 'Chest',
          sets: 3,
          reps: 10,
          targetWeightKg: 28,
          restSeconds: 60,
          notes: 'Slight bench incline (30 deg).',
        },
      ],
    },
    {
      id: `rout-draft-2`,
      title: 'Lower Body & Core',
      dayLabel: 'Day 2 - Quads, Hamstrings & Abs',
      description: 'Squat progression followed by posterior chain loading.',
      exercises: [
        {
          id: `ex-draft-3`,
          exerciseName: 'Barbell Back Squat',
          muscleGroup: 'Legs',
          sets: 4,
          reps: 6,
          targetWeightKg: 100,
          restSeconds: 120,
          notes: 'Full depth below parallel, brace core before descent.',
        },
      ],
    },
  ]);

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const list = await api.get<Exercise[]>('/workouts/exercises');
        setExercisesLibrary(list);
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setIsLoadingLibrary(false);
      }
    }
    fetchLibrary();
  }, []);

  const addRoutine = () => {
    const nextDayNum = routines.length + 1;
    const newRoutine: RoutineDraft = {
      id: `rout-draft-${Date.now()}`,
      title: `Workout Day ${nextDayNum}`,
      dayLabel: `Day ${nextDayNum} - Routine`,
      description: 'Focus on progressive overload and strict form.',
      exercises: [
        {
          id: `ex-draft-${Date.now()}`,
          exerciseName: 'Barbell Back Squat',
          muscleGroup: 'Legs',
          sets: 3,
          reps: 10,
          targetWeightKg: 60,
          restSeconds: 60,
          notes: '',
        },
      ],
    };
    setRoutines([...routines, newRoutine]);
  };

  const removeRoutine = (rIdx: number) => {
    if (routines.length <= 1) {
      error('Plan must contain at least one routine day.', 'Validation');
      return;
    }
    setRoutines(routines.filter((_, idx) => idx !== rIdx));
  };

  const updateRoutineField = (rIdx: number, field: keyof RoutineDraft, value: string) => {
    const updated = [...routines];
    (updated[rIdx] as any)[field] = value;
    setRoutines(updated);
  };

  const addExerciseToRoutine = (rIdx: number) => {
    const newEx: ExerciseDraft = {
      id: `ex-draft-${Date.now()}`,
      exerciseName: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      sets: 3,
      reps: 10,
      targetWeightKg: 50,
      restSeconds: 60,
      notes: '',
    };
    const updated = [...routines];
    updated[rIdx].exercises.push(newEx);
    setRoutines(updated);
  };

  const removeExercise = (rIdx: number, exIdx: number) => {
    const updated = [...routines];
    updated[rIdx].exercises = updated[rIdx].exercises.filter((_, idx) => idx !== exIdx);
    setRoutines(updated);
  };

  const updateExerciseField = (
    rIdx: number,
    exIdx: number,
    field: keyof ExerciseDraft,
    value: any
  ) => {
    const updated = [...routines];
    (updated[rIdx].exercises[exIdx] as any)[field] = value;

    // If changing exercise name, auto-detect muscle group from library if present
    if (field === 'exerciseName') {
      const match = exercisesLibrary.find((e) => e.name === value);
      if (match) {
        updated[rIdx].exercises[exIdx].muscleGroup = match.muscleGroup;
      }
    }

    setRoutines(updated);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Please enter a Plan Title.', 'Validation');
      return;
    }

    // Validate that each routine has at least one exercise
    for (const r of routines) {
      if (r.exercises.length === 0) {
        error(`Routine "${r.dayLabel}" must contain at least one exercise.`, 'Validation');
        return;
      }
    }

    setIsSaving(true);
    try {
      await api.post('/workouts/plans', {
        title,
        description,
        difficulty,
        goal,
        durationWeeks,
        routines,
        isPublished: true,
      });

      success(`Workout Plan "${title}" created and published!`, 'Plan Published');
      setTitle('');
      setDescription('');
      if (onPlanSaved) onPlanSaved();
    } catch (err: any) {
      error(err.message || 'Failed to save workout plan', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Workout Plan Builder</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Design multi-week periodized programs with targeted sets, reps, load, and rest periods
          </p>
        </div>

        <button
          onClick={handleSavePlan}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save & Publish Plan
        </button>
      </div>

      <form onSubmit={handleSavePlan} className="space-y-6">
        {/* General Plan Parameters Card */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Plan Parameters</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Plan Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10-Week Athletic Hypertrophy & Power"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Primary Training Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Muscle Mass & 1RM Progression"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Plan Overview & Methodology</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Outline the scientific rationale, split frequency, and recovery requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
              >
                <option value="BEGINNER">Beginner (Foundation)</option>
                <option value="INTERMEDIATE">Intermediate (Progressive)</option>
                <option value="ADVANCED">Advanced (High Intensity)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Routines & Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Workout Routine Days ({routines.length})
            </h3>
            <button
              type="button"
              onClick={addRoutine}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-400 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Routine Day
            </button>
          </div>

          {routines.map((routine, rIdx) => (
            <div key={routine.id} className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                    D{rIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={routine.dayLabel}
                    onChange={(e) => updateRoutineField(rIdx, 'dayLabel', e.target.value)}
                    placeholder="Day Label e.g. Day 1 - Chest & Triceps"
                    className="w-full max-w-sm px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeRoutine(rIdx)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Remove this routine day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={routine.description}
                  onChange={(e) => updateRoutineField(rIdx, 'description', e.target.value)}
                  placeholder="Routine focus note..."
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-850 text-zinc-300 text-xs"
                />
              </div>

              {/* Exercises in this routine */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                  <span>Assigned Exercises ({routine.exercises.length})</span>
                  <button
                    type="button"
                    onClick={() => addExerciseToRoutine(rIdx)}
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> Add Exercise
                  </button>
                </div>

                {routine.exercises.map((ex, exIdx) => (
                  <div
                    key={ex.id || exIdx}
                    className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-850 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-semibold mb-1">
                            Exercise Movement
                          </label>
                          <input
                            type="text"
                            value={ex.exerciseName}
                            onChange={(e) => {
                              const newName = e.target.value;
                              updateExerciseField(rIdx, exIdx, 'exerciseName', newName);
                              const match = exercisesLibrary.find(
                                (l) => l.name.toLowerCase() === newName.toLowerCase()
                              );
                              if (match) {
                                updateExerciseField(rIdx, exIdx, 'muscleGroup', match.muscleGroup);
                              }
                            }}
                            list={`ex-list-${rIdx}-${exIdx}`}
                            placeholder="e.g. Barbell Bench Press"
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold"
                          />
                          <datalist id={`ex-list-${rIdx}-${exIdx}`}>
                            {exercisesLibrary.map((libEx) => (
                              <option key={libEx.id} value={libEx.name} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-400 font-semibold mb-1">
                            Target Muscle Group
                          </label>
                          <input
                            type="text"
                            value={ex.muscleGroup}
                            onChange={(e) => updateExerciseField(rIdx, exIdx, 'muscleGroup', e.target.value)}
                            placeholder="e.g. Chest, Legs, Back"
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-start mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const match = exercisesLibrary.find(
                              (l) => l.name.toLowerCase() === ex.exerciseName.toLowerCase()
                            ) || {
                              id: ex.id,
                              name: ex.exerciseName || 'Exercise Movement',
                              muscleGroup: ex.muscleGroup || 'Full Body',
                              equipment: 'Gym Equipment',
                              description: 'Exercise movement demonstration.',
                              instructions: 'Maintain core brace, track joints, and control eccentric cadence.',
                              videoUrl: 'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg&playsinline=1&controls=1&rel=0',
                            };
                            setPreviewExercise(match);
                          }}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Preview Exercise Video & Cues"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(rIdx, exIdx)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Delete exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Sets</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExerciseField(rIdx, exIdx, 'sets', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Reps</label>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => updateExerciseField(rIdx, exIdx, 'reps', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Target Weight (kg)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={ex.targetWeightKg}
                          onChange={(e) =>
                            updateExerciseField(rIdx, exIdx, 'targetWeightKg', Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Rest (sec)</label>
                        <input
                          type="number"
                          value={ex.restSeconds}
                          onChange={(e) =>
                            updateExerciseField(rIdx, exIdx, 'restSeconds', Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={ex.notes}
                        onChange={(e) => updateExerciseField(rIdx, exIdx, 'notes', e.target.value)}
                        placeholder="Coaching cues (e.g. Pause 1s at bottom, explosive concentric tempo)..."
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs italic"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish Plan
          </button>
        </div>
      </form>

      <ExerciseVideoModal
        isOpen={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
        exercise={previewExercise}
      />
    </div>
  );
};
