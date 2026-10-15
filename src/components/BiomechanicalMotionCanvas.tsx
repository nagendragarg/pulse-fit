import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Eye, Sparkles, Activity } from 'lucide-react';
import { ExerciseVideoMeta } from '../utils/workoutVideos.ts';

interface BiomechanicalMotionCanvasProps {
  meta: ExerciseVideoMeta;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  playbackSpeed?: number;
}

export const BiomechanicalMotionCanvas: React.FC<BiomechanicalMotionCanvasProps> = ({
  meta,
  isPlaying: externalIsPlaying,
  onTogglePlay: externalTogglePlay,
  playbackSpeed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [internalIsPlaying, setInternalIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'side' | 'front'>('side');
  const [repCount, setRepCount] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<'eccentric' | 'pause' | 'concentric'>('eccentric');
  const [currentAngle, setCurrentAngle] = useState(170);

  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const togglePlay = externalTogglePlay || (() => setInternalIsPlaying(!internalIsPlaying));

  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        timeRef.current += dt * playbackSpeed;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#09090b'; // dark zinc
      ctx.fillRect(0, 0, width, height);

      // Biomechanical Coordinate Grid
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Exercise Cadence Calculations
      const eccentricTime = meta.cadence.eccentricSec;
      const pauseTime = meta.cadence.pauseSec;
      const concentricTime = meta.cadence.concentricSec;
      const cycleDuration = eccentricTime + pauseTime + concentricTime;

      const cycleTime = timeRef.current % cycleDuration;
      const currentCycleRep = Math.floor(timeRef.current / cycleDuration) + 1;
      if (currentCycleRep !== repCount) {
        setRepCount(currentCycleRep);
      }

      // Calculate progress factor [0 -> 1 -> 0]
      // 0 = Start (lockout), 1 = Bottom (full stretch/chest contact)
      let progress = 0;
      let phaseName: 'eccentric' | 'pause' | 'concentric' = 'eccentric';

      if (cycleTime < eccentricTime) {
        phaseName = 'eccentric';
        // Easing down
        const t = cycleTime / eccentricTime;
        progress = t * t * (3 - 2 * t); // smoothstep
      } else if (cycleTime < eccentricTime + pauseTime) {
        phaseName = 'pause';
        progress = 1.0;
      } else {
        phaseName = 'concentric';
        const t = (cycleTime - eccentricTime - pauseTime) / concentricTime;
        // Explosive drive up
        progress = 1.0 - Math.pow(t, 1.2);
      }

      if (phaseName !== currentPhase) {
        setCurrentPhase(phaseName);
      }

      // Center coords
      const cx = width / 2;
      const cy = height / 2;

      // Choose rendering based on exercise name / type
      const exName = meta.name.toLowerCase();

      if (exName.includes('squat')) {
        drawSquat(ctx, cx, cy, progress, viewMode);
      } else if (exName.includes('deadlift') || exName.includes('rdl')) {
        drawDeadlift(ctx, cx, cy, progress, viewMode);
      } else if (exName.includes('pulldown') || exName.includes('pull-up')) {
        drawLatPulldown(ctx, cx, cy, progress, viewMode);
      } else if (exName.includes('overhead') || exName.includes('shoulder') || exName.includes('lateral')) {
        drawOverheadOrLateral(ctx, cx, cy, progress, viewMode, exName.includes('lateral'));
      } else if (exName.includes('raise') || exName.includes('hanging')) {
        drawHangingLegRaise(ctx, cx, cy, progress);
      } else {
        // Default: Bench Press / Chest Press
        drawBenchPress(ctx, cx, cy, progress, viewMode);
      }

      // Draw Top HUD Overlay
      drawHudOverlay(ctx, width, height, phaseName, progress, meta, currentCycleRep);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [meta, isPlaying, playbackSpeed, viewMode, currentPhase, repCount]);

  // Helper drawing routines for Biomechanics
  const drawBenchPress = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    mode: 'side' | 'front'
  ) => {
    // Progress: 0 = arms extended high, 1 = bar at chest
    const barStartY = cy - 80;
    const barEndY = cy - 10;
    const currentBarY = barStartY + (barEndY - barStartY) * progress;

    const elbowAngle = Math.round(175 - (175 - 75) * progress);
    setCurrentAngle(elbowAngle);

    if (mode === 'side') {
      // Bench Pad
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx - 150, cy + 20, 300, 24);
      // Bench Pillars
      ctx.fillStyle = '#27272a';
      ctx.fillRect(cx - 130, cy + 44, 20, 90);
      ctx.fillRect(cx + 100, cy + 44, 20, 90);

      // Barbell Upright Supports
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(cx - 90, cy - 90, 16, 130);
      ctx.fillRect(cx - 96, cy - 90, 28, 8);

      // Athlete Head & Torso
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Head
      ctx.beginPath();
      ctx.arc(cx - 110, cy + 12, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      // Torso with natural arch
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy + 16);
      ctx.quadraticCurveTo(cx - 30, cy - 2, cx + 30, cy + 16); // Lumbar arch
      ctx.stroke();

      // Hips to Feet
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 16);
      ctx.lineTo(cx + 80, cy + 30); // Thigh
      ctx.lineTo(cx + 95, cy + 130); // Shin to ground
      ctx.lineTo(cx + 120, cy + 130); // Foot
      ctx.stroke();

      // Shoulder Joint
      const shoulderX = cx - 50;
      const shoulderY = cy + 10;

      // Elbow Joint moving dynamically
      const elbowX = shoulderX + 25 + 10 * progress;
      const elbowY = cy + 25 * progress;

      // Wrist Joint holding Barbell
      const barX = cx - 40;

      // Arm lines
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(barX, currentBarY);
      ctx.stroke();

      // Draw Barbell Path Line (Plumb line)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barX, barStartY - 10);
      ctx.lineTo(barX, barEndY + 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Barbell Cross Section & Plate
      ctx.fillStyle = '#e4e4e7';
      ctx.beginPath();
      ctx.arc(barX, currentBarY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Plate
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX - 6, currentBarY - 24, 12, 48);

      // Angle indicator arc on elbow
      drawAngleArc(ctx, elbowX, elbowY, `${elbowAngle}°`, '#38bdf8');
    } else {
      // Front View
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx - 140, cy + 20, 280, 20);

      // Torso
      ctx.fillStyle = '#059669';
      ctx.fillRect(cx - 45, cy - 20, 90, 50);

      // Head
      ctx.beginPath();
      ctx.arc(cx, cy - 45, 18, 0, Math.PI * 2);
      ctx.fill();

      // Arms & Barbell
      const leftElbowX = cx - 75 - 15 * progress;
      const rightElbowX = cx + 75 + 15 * progress;
      const elbowY = cy - 20 + 40 * progress;

      const leftHandX = cx - 80;
      const rightHandX = cx + 80;

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';

      // Left Arm
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 10);
      ctx.lineTo(leftElbowX, elbowY);
      ctx.lineTo(leftHandX, currentBarY);
      ctx.stroke();

      // Right Arm
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy - 10);
      ctx.lineTo(rightElbowX, elbowY);
      ctx.lineTo(rightHandX, currentBarY);
      ctx.stroke();

      // Barbell Bar
      ctx.strokeStyle = '#f4f4f5';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 160, currentBarY);
      ctx.lineTo(cx + 160, currentBarY);
      ctx.stroke();

      // Barbell Plates
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 150, currentBarY - 35, 15, 70);
      ctx.fillRect(cx + 135, currentBarY - 35, 15, 70);

      // Chest tension highlight
      ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + 0.5 * (1 - progress)})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 5, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawSquat = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    _mode: 'side' | 'front'
  ) => {
    // Progress: 0 = Standing, 1 = Bottom parallel/sub-parallel squat
    const hipDrop = 70 * progress;
    const kneeForward = 30 * progress;

    const footX = cx - 10;
    const footY = cy + 120;
    const kneeX = cx + 15 + kneeForward;
    const kneeY = cy + 50 + hipDrop * 0.4;
    const hipX = cx - 40 - 25 * progress;
    const hipY = cy - 20 + hipDrop;
    const shoulderX = cx - 10 - 20 * progress;
    const shoulderY = cy - 100 + hipDrop;
    const headX = shoulderX + 15;
    const headY = shoulderY - 25;

    const kneeAngle = Math.round(175 - (175 - 78) * progress);
    setCurrentAngle(kneeAngle);

    // Floor Line
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 150, footY + 4);
    ctx.lineTo(cx + 150, footY + 4);
    ctx.stroke();

    // Body Skeleton
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Leg: Foot to Knee to Hip
    ctx.beginPath();
    ctx.moveTo(footX - 25, footY);
    ctx.lineTo(footX + 15, footY); // Foot plant
    ctx.lineTo(kneeX, kneeY); // Shin
    ctx.lineTo(hipX, hipY); // Thigh
    ctx.lineTo(shoulderX, shoulderY); // Spine / Torso
    ctx.stroke();

    // Head
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(headX, headY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Barbell on upper traps
    const barX = shoulderX;
    const barY = shoulderY - 6;

    // Plumb line over midfoot
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barX, cy - 140);
    ctx.lineTo(barX, cy + 130);
    ctx.stroke();
    ctx.setLineDash([]);

    // Barbell & Plates
    ctx.fillStyle = '#e4e4e7';
    ctx.beginPath();
    ctx.arc(barX, barY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(barX - 8, barY - 30, 16, 60);

    // Knee Angle Arc
    drawAngleArc(ctx, kneeX, kneeY, `Knee: ${kneeAngle}°`, '#10b981');
    if (progress > 0.85) {
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('✓ DEPTH REACHED', cx + 60, hipY);
    }
  };

  const drawDeadlift = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    _mode: 'side' | 'front'
  ) => {
    // 0 = Lockout standing, 1 = Hips hinged back, bar at mid-shin
    const hinge = progress;
    const footX = cx;
    const footY = cy + 120;
    const kneeX = cx + 8 + 8 * hinge;
    const kneeY = cy + 60;
    const hipX = cx - 25 - 45 * hinge;
    const hipY = cy - 10 + 20 * hinge;
    const shoulderX = cx + 10 - 20 * hinge;
    const shoulderY = cy - 80 + 55 * hinge;
    const barX = cx + 18;
    const barY = cy - 20 + 85 * hinge;

    const hipAngle = Math.round(180 - 95 * hinge);
    setCurrentAngle(hipAngle);

    // Floor Line
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 150, footY + 4);
    ctx.lineTo(cx + 150, footY + 4);
    ctx.stroke();

    // Athlete Skeleton
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Lower body
    ctx.beginPath();
    ctx.moveTo(footX - 20, footY);
    ctx.lineTo(footX + 20, footY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(hipX, hipY);
    ctx.lineTo(shoulderX, shoulderY); // Torso line
    ctx.stroke();

    // Head
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(shoulderX + 16, shoulderY - 18, 16, 0, Math.PI * 2);
    ctx.fill();

    // Arms hanging straight to barbell
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(barX, barY);
    ctx.stroke();

    // Barbell & Plate
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(barX - 8, barY - 30, 16, 60);
    ctx.fillStyle = '#f4f4f5';
    ctx.beginPath();
    ctx.arc(barX, barY, 8, 0, Math.PI * 2);
    ctx.fill();

    drawAngleArc(ctx, hipX, hipY, `Hip: ${hipAngle}°`, '#38bdf8');
  };

  const drawLatPulldown = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    _mode: 'side' | 'front'
  ) => {
    // 0 = Arms extended upward, 1 = Bar pulled to upper chest
    const seatX = cx;
    const seatY = cy + 40;

    // Bench / Seat
    ctx.fillStyle = '#18181b';
    ctx.fillRect(cx - 40, seatY, 80, 16);
    ctx.fillRect(cx - 10, seatY + 16, 20, 70);

    // Athlete Torso seated with 15deg lean
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx, seatY);
    ctx.lineTo(cx - 20, cy - 40); // Torso leaning slightly back
    ctx.stroke();

    // Head
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx - 15, cy - 65, 16, 0, Math.PI * 2);
    ctx.fill();

    // Legs secured under pads
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(cx, seatY);
    ctx.lineTo(cx + 35, seatY);
    ctx.lineTo(cx + 40, cy + 120);
    ctx.stroke();

    // Thigh pad
    ctx.fillStyle = '#27272a';
    ctx.fillRect(cx + 20, seatY - 12, 30, 12);

    // Cable & Pulley Bar
    const topPulleyY = cy - 140;
    const barStartY = cy - 110;
    const barEndY = cy - 35;
    const currentBarY = barStartY + (barEndY - barStartY) * progress;

    // Cable line
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, topPulleyY);
    ctx.lineTo(cx, currentBarY);
    ctx.stroke();

    // Overhead Barbell / Lat Bar
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 100, currentBarY + 10);
    ctx.lineTo(cx - 80, currentBarY);
    ctx.lineTo(cx + 80, currentBarY);
    ctx.lineTo(cx + 100, currentBarY + 10);
    ctx.stroke();

    // Arms pulling
    const shoulderX = cx - 20;
    const shoulderY = cy - 40;
    const leftElbowX = shoulderX - 35 * progress;
    const leftElbowY = shoulderY + 25 * progress;

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(leftElbowX, leftElbowY);
    ctx.lineTo(cx - 60, currentBarY);
    ctx.stroke();

    const shoulderAngle = Math.round(175 - 90 * progress);
    setCurrentAngle(shoulderAngle);
    drawAngleArc(ctx, shoulderX, shoulderY, `${shoulderAngle}°`, '#10b981');
  };

  const drawOverheadOrLateral = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    _mode: 'side' | 'front',
    isLateral: boolean
  ) => {
    // 0 = Down/Bottom, 1 = Elevated overhead or lateral 90 deg
    const torsoY = cy + 20;

    // Upright Standing Torso
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, torsoY + 60);
    ctx.lineTo(cx, torsoY - 40);
    ctx.stroke();

    // Legs
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(cx, torsoY + 60);
    ctx.lineTo(cx - 25, cy + 120);
    ctx.moveTo(cx, torsoY + 60);
    ctx.lineTo(cx + 25, cy + 120);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx, torsoY - 65, 16, 0, Math.PI * 2);
    ctx.fill();

    const shoulderY = torsoY - 40;

    if (isLateral) {
      // Lateral Raise: 15 deg to 90 deg arms out to sides
      const elev = progress;
      const angle = (elev * Math.PI) / 2.3;

      const armLen = 70;
      const leftHandX = cx - Math.cos(angle - 0.2) * armLen - 15;
      const leftHandY = shoulderY + Math.sin(angle - 0.2) * armLen * (1 - elev) - elev * 20;
      const rightHandX = cx + Math.cos(angle - 0.2) * armLen + 15;
      const rightHandY = leftHandY;

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(cx - 15, shoulderY);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.moveTo(cx + 15, shoulderY);
      ctx.lineTo(rightHandX, rightHandY);
      ctx.stroke();

      // Dumbbells
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(leftHandX - 8, leftHandY - 14, 16, 28);
      ctx.fillRect(rightHandX - 8, rightHandY - 14, 16, 28);

      const latAngle = Math.round(15 + 75 * progress);
      setCurrentAngle(latAngle);
      drawAngleArc(ctx, cx, shoulderY, `Delts: ${latAngle}°`, '#38bdf8');
    } else {
      // Overhead Press: From shoulders to overhead lockout
      const startHandY = shoulderY + 10;
      const endHandY = shoulderY - 75;
      const currentHandY = startHandY + (endHandY - startHandY) * progress;

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 9;

      ctx.beginPath();
      ctx.moveTo(cx - 18, shoulderY);
      ctx.lineTo(cx - 45 + 10 * progress, shoulderY + 10 - 20 * progress);
      ctx.lineTo(cx - 35, currentHandY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 18, shoulderY);
      ctx.lineTo(cx + 45 - 10 * progress, shoulderY + 10 - 20 * progress);
      ctx.lineTo(cx + 35, currentHandY);
      ctx.stroke();

      // Dumbbells
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 43, currentHandY - 12, 16, 24);
      ctx.fillRect(cx + 27, currentHandY - 12, 16, 24);

      const pressAngle = Math.round(90 + 85 * progress);
      setCurrentAngle(pressAngle);
      drawAngleArc(ctx, cx + 18, shoulderY, `${pressAngle}°`, '#10b981');
    }
  };

  const drawHangingLegRaise = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number
  ) => {
    // Pullup Bar
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy - 130);
    ctx.lineTo(cx + 80, cy - 130);
    ctx.stroke();

    // Arms hanging
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 130);
    ctx.lineTo(cx, cy - 60); // Arms straight down
    ctx.stroke();

    // Head
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx, cy - 75, 15, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx - 5 * progress, cy); // Pelvis tuck
    ctx.stroke();

    // Legs raising to 90 degrees
    const legAngle = progress * (Math.PI / 2.1);
    const kneeX = cx + Math.sin(legAngle) * 55;
    const kneeY = cy + Math.cos(legAngle) * 55;
    const footX = kneeX + Math.sin(legAngle) * 50;
    const footY = kneeY + Math.cos(legAngle) * 50;

    ctx.strokeStyle = '#34d399';
    ctx.beginPath();
    ctx.moveTo(cx - 5 * progress, cy);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    const hipAngle = Math.round(progress * 90);
    setCurrentAngle(hipAngle);
    drawAngleArc(ctx, cx, cy, `Core: ${hipAngle}°`, '#38bdf8');
  };

  const drawAngleArc = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI / 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 11px Inter, monospace';
    ctx.fillText(text, x + 26, y - 6);
  };

  const drawHudOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    phase: 'eccentric' | 'pause' | 'concentric',
    progress: number,
    metaInfo: ExerciseVideoMeta,
    rep: number
  ) => {
    // Top Left: AI Active Cadence Indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect(14, 14, 220, 64, 10);
    ctx.fill();
    ctx.strokeStyle = '#27272a';
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('⚡ AI BIOMECHANICAL KINEMATICS', 24, 30);

    let phaseColor = '#38bdf8';
    let phaseLabel = 'ECCENTRIC DESCENT';
    if (phase === 'pause') {
      phaseColor = '#f59e0b';
      phaseLabel = 'ISOMETRIC HOLD';
    } else if (phase === 'concentric') {
      phaseColor = '#10b981';
      phaseLabel = 'CONCENTRIC DRIVE';
    }

    ctx.fillStyle = phaseColor;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(phaseLabel, 24, 48);

    // Progress bar inside HUD
    ctx.fillStyle = '#27272a';
    ctx.fillRect(24, 56, 195, 6);
    ctx.fillStyle = phaseColor;
    ctx.fillRect(24, 56, 195 * progress, 6);

    // Top Right: Live Joint Angle & Rep Counter
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect(width - 150, 14, 136, 64, 10);
    ctx.fill();
    ctx.strokeStyle = '#27272a';
    ctx.stroke();

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('TARGET REPS', width - 138, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`REP: ${rep}`, width - 138, 48);

    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText(`JOINT: ${currentAngle}°`, width - 138, 64);

    // Bottom telemetry bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height - 28, width, 28);
    ctx.fillStyle = '#71717a';
    ctx.font = '10px monospace';
    ctx.fillText(
      `CADENCE: ${metaInfo.cadence.eccentricSec}s Eccentric • ${metaInfo.cadence.pauseSec}s Pause • ${metaInfo.cadence.concentricSec}s Concentric | PRIMARY: ${metaInfo.muscleGroup.toUpperCase()}`,
      14,
      height - 10
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-950 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full object-contain"
      />

      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
        <button
          onClick={() => setViewMode(viewMode === 'side' ? 'front' : 'side')}
          className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-[10px] font-semibold border border-zinc-700 backdrop-blur-md flex items-center gap-1.5 transition-colors"
          title="Toggle Camera Perspective"
        >
          <Eye className="w-3 h-3 text-emerald-400" />
          <span>{viewMode === 'side' ? 'Sagittal (Side)' : 'Frontal'}</span>
        </button>
      </div>

      {/* Floating Bottom Play/Pause button */}
      <div className="absolute bottom-10 right-4 z-20 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="p-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-black font-bold shadow-lg transition-transform active:scale-95"
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
