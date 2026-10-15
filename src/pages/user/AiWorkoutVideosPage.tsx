import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Sparkles,
  Search,
  Filter,
  Dumbbell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ChevronRight,
  Flame,
  Layers,
  BookOpen,
  Info,
  Calendar,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Exercise, WorkoutPlan } from '../../types/index.ts';
import { ExerciseVideoModal } from '../../components/ExerciseVideoModal.tsx';
import { WorkoutPlanVideoWalkthroughModal } from '../../components/WorkoutPlanVideoWalkthroughModal.tsx';

export const AiWorkoutVideosPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'exercises'>('plans');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [walkthroughPlan, setWalkthroughPlan] = useState<WorkoutPlan | null>(null);
  const [walkthroughRoutineId, setWalkthroughRoutineId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [exList, planList] = await Promise.all([
          api.get<Exercise[]>('/workouts/exercises'),
          api.get<WorkoutPlan[]>('/workouts/plans'),
        ]);
        setExercises(exList);
        setPlans(planList);
      } catch (err) {
        console.error('Failed to load video library data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const muscles = ['ALL', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const filteredExercises = exercises.filter((ex) => {
    const matchMuscle = selectedMuscle === 'ALL' || ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase();
    const matchSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMuscle && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/40 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Motion & Biomechanics Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Exercise & Workout Plan Videos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl leading-relaxed">
            High-definition movement demonstration loops with slow-motion joint analysis, biomechanical setup checkpoints, and AI form cues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
            <div className="text-2xl font-black text-emerald-400 font-mono">{exercises.length}</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">HD Video Guides</div>
          </div>
        </div>
      </div>

      {/* Studio Mode Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'plans'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Workout Plan Video Walkthroughs</span>
          <span className="sm:hidden">Plan Walkthroughs</span>
          <span>({plans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'exercises'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span className="hidden sm:inline">Exercise Movement Library</span>
          <span className="sm:hidden">Exercise Library</span>
          <span>({exercises.length})</span>
        </button>
      </div>

      {/* PLAN WALKTHROUGHS VIEW */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" /> Complete Workout Plan Video Guides
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Watch continuous routine video playlists with set tempos, target weights, and AI biomechanics cues.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              {plans.length} Available Plans
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((p) => {
              const totalExercises = p.routines?.reduce((acc, r) => acc + (r.exercises?.length || 0), 0) || 0;
              return (
                <div
                  key={p.id}
                  className="rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all p-5 flex flex-col justify-between shadow-xl group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 uppercase tracking-wider">
                        {p.difficulty}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {p.durationWeeks} Weeks
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="mt-4 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-1.5 text-xs text-zinc-300">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Coach:</span>
                        <span className="font-semibold text-white">{p.coachName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Routines:</span>
                        <span className="font-mono text-emerald-400">{p.routines?.length || 0} Routine Days</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Exercise Videos:</span>
                        <span className="font-mono text-cyan-400">{totalExercises} HD Movement Videos</span>
                      </div>
                    </div>

                    {/* Routine preview tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.routines?.map((r, rIdx) => (
                        <button
                          key={r.id || rIdx}
                          type="button"
                          onClick={() => {
                            setWalkthroughPlan(p);
                            setWalkthroughRoutineId(r.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition-colors flex items-center gap-1"
                          title="Watch this routine's videos"
                        >
                          <Play className="w-2.5 h-2.5 fill-current text-emerald-400" />
                          <span>{r.dayLabel}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        setWalkthroughPlan(p);
                        setWalkthroughRoutineId(undefined);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Video className="w-3.5 h-3.5" /> Watch AI Plan Video Walkthrough
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXERCISES VIEW */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {muscles.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedMuscle === m
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises by name..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

      {/* Video Cards Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="group rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Video / Thumbnail Header */}
                <div
                  onClick={() => setSelectedExercise(ex)}
                  className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                >
                  {ex.thumbnailUrl ? (
                    <img
                      src={ex.thumbnailUrl}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <Dumbbell className="w-10 h-10 text-zinc-700" />
                    </div>
                  )}

                  {/* Play Overlay Button */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Muscle Badge */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-zinc-700/60 text-[10px] font-bold text-white uppercase tracking-wider">
                    {ex.muscleGroup}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-zinc-700/60 text-[10px] font-mono font-semibold text-emerald-400">
                    60 FPS Video Loop
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      {ex.equipment}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Cues Ready
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {ex.description}
                  </p>

                  {/* Form cues snippet */}
                  {ex.aiFormCues && ex.aiFormCues.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-[11px] text-zinc-300">
                      <div className="font-semibold text-emerald-400 mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Key Cue:
                      </div>
                      <p className="line-clamp-2 text-zinc-400 italic">"{ex.aiFormCues[0]}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedExercise(ex)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black text-xs font-bold transition-all border border-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Watch Video Demonstration & Cues
                </button>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
            No workout exercises match your filter. Try searching for "Bench Press" or "Squat".
          </div>
        )}
      </div>
      )}

      {/* Exercise Video Modal */}
      <ExerciseVideoModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exercise={selectedExercise}
      />

      {/* Workout Plan Video Walkthrough Modal */}
      <WorkoutPlanVideoWalkthroughModal
        isOpen={!!walkthroughPlan}
        onClose={() => {
          setWalkthroughPlan(null);
          setWalkthroughRoutineId(undefined);
        }}
        plan={walkthroughPlan}
        initialRoutineId={walkthroughRoutineId}
      />
    </div>
  );
};
