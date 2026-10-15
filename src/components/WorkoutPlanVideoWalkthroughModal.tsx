import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Clock,
  Flame,
  ChevronRight,
  ListVideo,
  Layers,
  Wind,
  Info,
} from 'lucide-react';
import { Modal } from './Modal.tsx';
import { WorkoutPlan, WorkoutRoutine, Exercise } from '../types/index.ts';
import { api } from '../api/client.ts';
import { WorkoutVideoPlayer } from './WorkoutVideoPlayer.tsx';

interface WorkoutPlanVideoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkoutPlan | null;
  initialRoutineId?: string;
  onStartRoutine?: (routineId: string) => void;
}

export const WorkoutPlanVideoWalkthroughModal: React.FC<WorkoutPlanVideoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  plan,
  initialRoutineId,
  onStartRoutine,
}) => {
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number>(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showFormCues, setShowFormCues] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch full exercise library to match exercise details, cues and video URLs
  useEffect(() => {
    let isMounted = true;
    async function fetchLib() {
      try {
        const lib = await api.get<Exercise[]>('/workouts/exercises');
        if (isMounted) setExerciseLibrary(lib);
      } catch (err) {
        console.error('Failed to load exercise library in walkthrough modal:', err);
      }
    }
    if (isOpen) {
      fetchLib();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Set initial routine when opened
  useEffect(() => {
    if (plan && plan.routines && plan.routines.length > 0) {
      if (initialRoutineId) {
        const rIdx = plan.routines.findIndex((r) => r.id === initialRoutineId);
        if (rIdx >= 0) {
          setSelectedRoutineIndex(rIdx);
        } else {
          setSelectedRoutineIndex(0);
        }
      } else {
        setSelectedRoutineIndex(0);
      }
      setCurrentExerciseIndex(0);
      setVideoError(false);
      setIsPlaying(true);
    }
  }, [plan, initialRoutineId, isOpen]);

  // Reset video error when exercise changes
  useEffect(() => {
    setVideoError(false);
    setIsPlaying(true);
  }, [currentExerciseIndex, selectedRoutineIndex]);

  if (!plan || !plan.routines || plan.routines.length === 0) return null;

  const currentRoutine: WorkoutRoutine | undefined = plan.routines[selectedRoutineIndex] || plan.routines[0];
  const routineExercises = currentRoutine?.exercises || [];
  const currentPlanEx = routineExercises[currentExerciseIndex] || routineExercises[0];

  // Match full library exercise if available
  const libraryMatch = exerciseLibrary.find(
    (e) => e.name.toLowerCase() === currentPlanEx?.exerciseName?.toLowerCase() || e.id === currentPlanEx?.exerciseId
  );

  const activeVideoUrl =
    libraryMatch?.videoUrl ||
    'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg&playsinline=1&controls=1&rel=0';

  const activeThumbnail =
    libraryMatch?.thumbnailUrl ||
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';

  const activeAiCues = libraryMatch?.aiFormCues || [
    'Lock core and retract scapulae firmly to establish a stable base.',
    'Control the eccentric lowering phase for 2 to 3 seconds under full tension.',
    'Drive explosively through the concentric phase while exhaling forcefully.',
    'Maintain stacked joint alignment throughout the full range of motion.',
  ];

  const activeCommonMistakes = libraryMatch?.commonMistakes || [
    'Rushing repetitions and relying on rebound momentum',
    'Compromising spinal neutrality under load',
    'Flaring elbows outward beyond 70 degrees',
  ];

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < routineExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Video Walkthrough: ${plan.title}`}
      subtitle={`${plan.difficulty} • ${plan.durationWeeks} Weeks • Programmed by Coach ${plan.coachName}`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Routine Day Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Routine Day:
          </span>
          {plan.routines.map((r, rIdx) => (
            <button
              key={r.id || rIdx}
              onClick={() => {
                setSelectedRoutineIndex(rIdx);
                setCurrentExerciseIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedRoutineIndex === rIdx
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <span>{r.dayLabel}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedRoutineIndex === rIdx ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {r.exercises.length} ex
              </span>
            </button>
          ))}
        </div>

        {/* Main Video & Playlist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Video Player & Controls (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Unified Video & AI Kinematics Player */}
            <WorkoutVideoPlayer
              exerciseName={currentPlanEx?.exerciseName}
              exerciseId={currentPlanEx?.exerciseId}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />

            {/* Exercise Playlist Controls (Prev / Next) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                onClick={handlePrevExercise}
                disabled={currentExerciseIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
                Previous Exercise
              </button>
              <span className="text-xs text-zinc-400 font-medium">
                Exercise {currentExerciseIndex + 1} of {routineExercises.length}
              </span>
              <button
                type="button"
                onClick={handleNextExercise}
                disabled={currentExerciseIndex === routineExercises.length - 1}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                Next Exercise
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Exercise Meta Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Target Protocol
                  </span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {currentPlanEx?.exerciseName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold">
                    {currentPlanEx?.sets} Sets × {currentPlanEx?.reps} Reps
                  </span>
                  {currentPlanEx?.targetWeightKg ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                      {currentPlanEx.targetWeightKg} kg
                    </span>
                  ) : null}
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {currentPlanEx?.restSeconds || 60}s Rest
                  </span>
                </div>
              </div>

              {libraryMatch?.instructions && (
                <p className="text-xs text-zinc-300 leading-relaxed mt-2 border-t border-zinc-900 pt-2">
                  <span className="font-semibold text-white">Execution: </span>
                  {libraryMatch.instructions}
                </p>
              )}
            </div>

            {/* AI Form Cues Bar */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Movement Form Checkpoints
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Biomechanical Alignment</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {activeAiCues.slice(0, 4).map((cue, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-950/90 border border-zinc-850 flex items-start gap-2 text-xs text-zinc-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight text-[11px]">{cue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Routine Exercise Playlist */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                  <ListVideo className="w-4 h-4 text-emerald-400" /> Routine Exercise Queue
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {currentExerciseIndex + 1}/{routineExercises.length}
                </span>
              </div>

              {/* Scrollable list of exercises in this routine */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {routineExercises.map((ex, exIdx) => {
                  const isCurrent = currentExerciseIndex === exIdx;
                  return (
                    <div
                      key={ex.id || exIdx}
                      onClick={() => setCurrentExerciseIndex(exIdx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-500 text-black'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isCurrent ? <Play className="w-3 h-3 fill-current ml-0.5" /> : exIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                            {ex.exerciseName}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {ex.muscleGroup} • {ex.sets} × {ex.reps}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {ex.targetWeightKg ? `${ex.targetWeightKg}kg` : 'BW'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch live routine session button */}
            {onStartRoutine && currentRoutine && (
              <div className="pt-3 border-t border-zinc-850">
                <button
                  onClick={() => {
                    onClose();
                    onStartRoutine(currentRoutine.id);
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" /> Launch Live Session for this Routine
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Movement engine tracks cadence, tempo (3-1-1), and joint safety angles.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold transition-colors"
          >
            Close Walkthrough
          </button>
        </div>
      </div>
    </Modal>
  );
};
