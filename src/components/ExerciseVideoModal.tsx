import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Dumbbell,
  Wind,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { Modal } from './Modal.tsx';
import { Exercise } from '../types/index.ts';
import { WorkoutVideoPlayer } from './WorkoutVideoPlayer.tsx';

interface ExerciseVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  isOpen,
  onClose,
  exercise,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'video' | 'form-breakdown'>('video');
  const [videoError, setVideoError] = useState<boolean>(false);

  if (!exercise) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
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
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Default AI cues if not specified
  const aiCues = exercise.aiFormCues || [
    'Lock core and retract scapulae firmly to establish a stable pressing/pulling base.',
    'Control the eccentric lowering phase for 2 to 3 seconds under full tension.',
    'Drive explosively through the concentric phase while exhaling forcefully.',
    'Maintain stacked joint alignment throughout the full range of motion.',
  ];

  const commonMistakes = exercise.commonMistakes || [
    'Rushing repetitions and relying on rebound momentum',
    'Compromising spinal neutrality under load',
    'Flaring elbows outward beyond 70 degrees',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise.name}
      subtitle={`${exercise.muscleGroup} • ${exercise.equipment} • Video Demonstration & AI Form Breakdown`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Tab switch */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Video Movement Demo
          </button>
          <button
            onClick={() => setActiveTab('form-breakdown')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'form-breakdown'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Form Coach Checkpoints
          </button>
        </div>

        {activeTab === 'video' ? (
          <div className="space-y-4">
            {/* Unified Video & AI Kinematics Player */}
            <WorkoutVideoPlayer
              exerciseName={exercise.name}
              exerciseId={exercise.id}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />

            {/* Quick Instruction Bar */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">Execution Summary:</span>
              {exercise.instructions}
            </div>
          </div>
        ) : (
          /* AI Form Coach Checkpoints */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                AI Biomechanical Analysis: These form cues are tailored for maximum muscle recruitment and spinal safety.
              </span>
            </div>

            {/* Cues List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Key Biomechanical Checkpoints
              </h4>
              <div className="space-y-2">
                {aiCues.map((cue, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed">{cue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Common Form Pitfalls to Avoid
              </h4>
              <div className="space-y-2">
                {commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5"
                  >
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breathing Cadence */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">Optimal Breathing Cadence:</span>
              </div>
              <span className="font-mono text-zinc-300 text-[11px]">
                Inhale on eccentric descent • Exhale on concentric drive
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </Modal>
  );
};
