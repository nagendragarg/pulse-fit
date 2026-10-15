import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Target, Award, PlayCircle, ChevronDown, ChevronUp, CheckCircle, Clock, Play, Video, Sparkles } from 'lucide-react';
import { api } from '../../api/client.ts';
import { WorkoutPlan, Exercise } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import { ExerciseVideoModal } from '../../components/ExerciseVideoModal.tsx';
import { WorkoutPlanVideoWalkthroughModal } from '../../components/WorkoutPlanVideoWalkthroughModal.tsx';

interface WorkoutPlansPageProps {
  onStartRoutine: (routineId: string) => void;
}

export const WorkoutPlansPage: React.FC<WorkoutPlansPageProps> = ({ onStartRoutine }) => {
  const { success, error } = useToast();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [activeVideoExercise, setActiveVideoExercise] = useState<Exercise | null>(null);
  const [walkthroughPlan, setWalkthroughPlan] = useState<WorkoutPlan | null>(null);
  const [walkthroughRoutineId, setWalkthroughRoutineId] = useState<string | undefined>(undefined);
  const [assignedPlanId, setAssignedPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      setIsLoading(true);
      try {
        const [allPlans, myAssigned, lib] = await Promise.all([
          api.get<WorkoutPlan[]>('/workouts/plans'),
          api.get('/workouts/my-assigned'),
          api.get<Exercise[]>('/workouts/exercises'),
        ]);

        setPlans(allPlans);
        setExerciseLibrary(lib);
        if (myAssigned.plan) {
          setAssignedPlanId(myAssigned.plan.id);
          setExpandedPlanId(myAssigned.plan.id);
        } else if (allPlans.length > 0) {
          setExpandedPlanId(allPlans[0].id);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load plans', 'Error');
      } finally {
        setIsLoading(false);
      }
    }

    loadPlans();
  }, [error]);

  const toggleExpand = (id: string) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Workout Plans & Splits</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Explore structured periodized programs created by certified PulseFit coaches
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((p) => {
          const isAssigned = p.id === assignedPlanId;
          const isExpanded = p.id === expandedPlanId;

          return (
            <div
              key={p.id}
              className={`rounded-3xl bg-zinc-950 border transition-all ${
                isAssigned ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/20' : 'border-zinc-800'
              }`}
            >
              {/* Header Card */}
              <div
                onClick={() => toggleExpand(p.id)}
                className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                      isAssigned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{p.title}</h3>
                      {isAssigned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Current Active Plan
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase">
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">{p.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2 font-mono">
                      <span>Coach: {p.coachName}</span>
                      <span>• {p.durationWeeks} Weeks</span>
                      <span>• {p.routines?.length || 0} Routine Days</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWalkthroughPlan(p);
                      setWalkthroughRoutineId(undefined);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1.5 shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5" /> Watch AI Plan Videos
                  </button>

                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    {isExpanded ? 'Hide Routines' : 'View Routines'}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </div>
              </div>

              {/* Expanded Routines */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-zinc-900 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Plan Routine Days & Exercise Protocols
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p.routines?.map((r, rIdx) => (
                      <div
                        key={r.id || rIdx}
                        className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-bold text-white">{r.dayLabel}</h5>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {r.exercises.length} Exercises
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mb-3">{r.description}</p>

                          <div className="space-y-1.5 mb-4">
                            {r.exercises.map((ex, eIdx) => (
                              <div
                                key={ex.id || eIdx}
                                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const match = exerciseLibrary.find((l) => l.name === ex.exerciseName) || {
                                        id: ex.exerciseId,
                                        name: ex.exerciseName,
                                        muscleGroup: ex.muscleGroup,
                                        equipment: 'Equipment',
                                        description: 'Resistance exercise movement.',
                                        instructions: 'Maintain core brace, track joints, and control eccentric cadence.',
                                        videoUrl: 'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg&playsinline=1&controls=1&rel=0',
                                      };
                                      setActiveVideoExercise(match);
                                    }}
                                    className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black transition-colors"
                                    title="Watch Exercise Form Video"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                  </button>
                                  <span className="font-semibold text-zinc-200 truncate">{ex.exerciseName}</span>
                                </div>
                                <span className="font-mono text-zinc-400 shrink-0 ml-2">
                                  {ex.sets} × {ex.reps} {ex.targetWeightKg ? `@ ${ex.targetWeightKg}kg` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setWalkthroughPlan(p);
                              setWalkthroughRoutineId(r.id);
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-zinc-700"
                          >
                            <Video className="w-3.5 h-3.5 text-emerald-400" /> Watch Videos
                          </button>
                          <button
                            onClick={() => onStartRoutine(r.id)}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Launch Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ExerciseVideoModal
        isOpen={!!activeVideoExercise}
        onClose={() => setActiveVideoExercise(null)}
        exercise={activeVideoExercise}
      />

      <WorkoutPlanVideoWalkthroughModal
        isOpen={!!walkthroughPlan}
        onClose={() => {
          setWalkthroughPlan(null);
          setWalkthroughRoutineId(undefined);
        }}
        plan={walkthroughPlan}
        initialRoutineId={walkthroughRoutineId}
        onStartRoutine={onStartRoutine}
      />
    </div>
  );
};
