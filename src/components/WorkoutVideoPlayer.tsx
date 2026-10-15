import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Sliders,
  Play,
  Pause,
  AlertCircle,
  Dumbbell,
} from 'lucide-react';
import { ExerciseVideoMeta, getExerciseVideoMeta } from '../utils/workoutVideos.ts';
import { BiomechanicalMotionCanvas } from './BiomechanicalMotionCanvas.tsx';

interface WorkoutVideoPlayerProps {
  exerciseName?: string;
  exerciseId?: string;
  defaultMode?: 'video' | 'simulation';
  className?: string;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const WorkoutVideoPlayer: React.FC<WorkoutVideoPlayerProps> = ({
  exerciseName,
  exerciseId,
  defaultMode = 'video',
  className = '',
  playbackSpeed = 1,
  onSpeedChange,
}) => {
  const meta: ExerciseVideoMeta = getExerciseVideoMeta(exerciseName || exerciseId);
  const [activeMode, setActiveMode] = useState<'video' | 'simulation'>(defaultMode);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // If exercise changed, reset iframeLoaded and auto-reveal after short timeout
  React.useEffect(() => {
    setIframeLoaded(false);
    const timer = setTimeout(() => {
      setIframeLoaded(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [meta.youtubeId]);

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl ${className}`}>
      {/* Top Header Mode Switcher Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/80 z-20">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveMode('video')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMode === 'video'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>HD Video Guide</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('simulation')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMode === 'simulation'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Motion Simulator</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* External YouTube link fallback if user wants full player */}
          {activeMode === 'video' && meta.youtubeId && (
            <a
              href={`https://www.youtube.com/watch?v=${meta.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-zinc-800"
              title="Open video in high resolution"
            >
              <span>Full Player</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Media Screen (Aspect 16:9) */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {activeMode === 'video' ? (
          <div className="relative w-full h-full bg-black">
            {/* YouTube embed */}
            <iframe
              key={meta.youtubeId}
              src={`https://www.youtube-nocookie.com/embed/${meta.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${meta.youtubeId}&playsinline=1&controls=1&rel=0&modestbranding=1`}
              title={`${meta.name} Form Demonstration`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
              className="w-full h-full border-0"
            />

            {/* Quick overlay helper if iframe is taking a moment to load */}
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-white mb-1">Loading HD Exercise Video...</p>
                <p className="text-[11px] text-zinc-400 max-w-xs mb-3">
                  {meta.name} form execution breakdown.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMode('simulation')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-emerald-400 text-xs font-medium border border-zinc-700 transition-colors"
                >
                  Switch to AI Motion Simulator
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Interactive Animated Canvas Simulation */
          <div className="relative w-full h-full">
            <BiomechanicalMotionCanvas
              meta={meta}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              playbackSpeed={playbackSpeed}
            />
            {/* Quick Switch back to HD Video overlay button */}
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setActiveMode('video')}
                className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-emerald-500 hover:text-black border border-zinc-700 hover:border-emerald-400 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Switch to Video Guide</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-700/60 text-[10px] font-bold text-white flex items-center gap-1.5 pointer-events-none z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {activeMode === 'video' ? 'HD Coaching Video' : 'AI Kinematics Active'} • {meta.name}
        </div>
      </div>

      {/* Cadence & Form Checkpoint Quick Bar */}
      <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-white">Target Cadence:</span>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
            {meta.cadence.eccentricSec}s Down • {meta.cadence.pauseSec}s Pause • {meta.cadence.concentricSec}s Drive
          </span>
        </div>

        {/* Speed Selector (0.5x, 1x, 1.5x) */}
        {onSpeedChange && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold mr-1">Speed:</span>
            {[0.5, 1, 1.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
