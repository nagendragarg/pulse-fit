export interface ExerciseVideoMeta {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  youtubeId: string;
  youtubeEmbedUrl: string;
  mp4BackupUrl?: string;
  thumbnailUrl: string;
  cadence: {
    eccentricSec: number;
    pauseSec: number;
    concentricSec: number;
  };
  keyAngles: {
    label: string;
    minDeg: number;
    maxDeg: number;
  }[];
  aiFormCues: string[];
  commonMistakes: string[];
}

export const EXERCISE_MEDIA_MAP: Record<string, ExerciseVideoMeta> = {
  'barbell bench press': {
    exerciseId: 'ex-1',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    youtubeId: 'rT7DgCr-3pg',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 3, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Elbow Flexion', minDeg: 75, maxDeg: 175 },
      { label: 'Shoulder Abduction', minDeg: 45, maxDeg: 70 },
      { label: 'Arch Support', minDeg: 15, maxDeg: 25 },
    ],
    aiFormCues: [
      'Retract and depress scapulae firmly against the bench pad.',
      'Maintain stacked wrists directly over forearms.',
      'Touch barbell smoothly to sternum/lower chest without bouncing.',
      'Drive aggressively through heels with quad tension.',
    ],
    commonMistakes: [
      'Flaring elbows 90 degrees outward toward ears',
      'Bouncing the bar off ribs to generate momentum',
      'Lifting hips off the bench under heavy loads',
    ],
  },
  'incline dumbbell press': {
    exerciseId: 'ex-2',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    youtubeId: '8iPEnn-ltC8',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/8iPEnn-ltC8?autoplay=1&mute=1&loop=1&playlist=8iPEnn-ltC8&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 3, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Bench Incline', minDeg: 30, maxDeg: 45 },
      { label: 'Elbow Depth', minDeg: 80, maxDeg: 170 },
    ],
    aiFormCues: [
      'Set bench between 30 and 45 degrees to target upper chest.',
      'Keep wrists straight with dumbbells aligned over elbows.',
      'Press upward in a slight converging arc without banging weights together.',
    ],
    commonMistakes: [
      'Setting bench angle too steep (>45 deg) shifting load to front delts',
      'Dropping elbows below shoulder level excessively',
    ],
  },
  'triceps rope pushdown': {
    exerciseId: 'ex-3',
    name: 'Triceps Rope Pushdown',
    muscleGroup: 'Arms',
    youtubeId: '2-LAMcpzODU',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/2-LAMcpzODU?autoplay=1&mute=1&loop=1&playlist=2-LAMcpzODU&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 2, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Elbow Hinge', minDeg: 60, maxDeg: 180 },
      { label: 'Torso Incline', minDeg: 10, maxDeg: 15 },
    ],
    aiFormCues: [
      'Glue elbows tight to ribcage; do not allow shoulders to travel forward.',
      'Spread the rope laterally at bottom extension for full tricep contraction.',
      'Control the 2-second return without letting weight stack slam.',
    ],
    commonMistakes: [
      'Using shoulder swinging momentum to force the rope downward',
      'Flaring elbows out to side',
    ],
  },
  'barbell back squat': {
    exerciseId: 'ex-4',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    youtubeId: 'bEv6CCg2BC8',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/bEv6CCg2BC8?autoplay=1&mute=1&loop=1&playlist=bEv6CCg2BC8&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 3, pauseSec: 1, concentricSec: 1.5 },
    keyAngles: [
      { label: 'Knee Flexion', minDeg: 75, maxDeg: 175 },
      { label: 'Hip Depth', minDeg: 80, maxDeg: 170 },
      { label: 'Torso Angle', minDeg: 45, maxDeg: 65 },
    ],
    aiFormCues: [
      'Inhale deep 360-degree belly breath and brace core (Valsalva).',
      'Hinge hips back while allowing knees to travel forward tracking toes.',
      'Break parallel with hip crease just below knee joint.',
      'Drive up through whole foot, keeping chest proud.',
    ],
    commonMistakes: [
      'Knees collapsing inward (valgus) on ascent',
      'Hips shooting up first (good-morning squat)',
      'Heels lifting off ground',
    ],
  },
  'romanian deadlift (rdl)': {
    exerciseId: 'ex-5',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    youtubeId: 'op9kVnSso6Q',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/op9kVnSso6Q?autoplay=1&mute=1&loop=1&playlist=op9kVnSso6Q&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 3, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Hip Hinge', minDeg: 70, maxDeg: 180 },
      { label: 'Knee Soft Bend', minDeg: 15, maxDeg: 25 },
    ],
    aiFormCues: [
      'Initiate with pure hip push backward towards wall.',
      'Keep bar in physical contact with thighs and shins.',
      'Halt descent when hips stop traveling backward (usually below knee).',
      'Squeeze glutes forward to lock out; do not hyperextend lower back.',
    ],
    commonMistakes: [
      'Rounding lumbar spine during the stretch',
      'Squatting down instead of hinging hips back',
    ],
  },
  'lat pulldown': {
    exerciseId: 'ex-6',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    youtubeId: 'CAwf7n6Luuc',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/CAwf7n6Luuc?autoplay=1&mute=1&loop=1&playlist=CAwf7n6Luuc&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 2.5, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Shoulder Adduction', minDeg: 80, maxDeg: 175 },
      { label: 'Torso Lean', minDeg: 10, maxDeg: 20 },
    ],
    aiFormCues: [
      'Depress scapulae first before pulling down with elbows.',
      'Pull bar down to upper clavicle while squeezing lats.',
      'Maintain slight 15-degree backward torso lean throughout.',
    ],
    commonMistakes: [
      'Swinging upper body backward to yank weight down',
      'Pulling bar behind the head causing neck strain',
    ],
  },
  'barbell bent-over row': {
    exerciseId: 'ex-7',
    name: 'Barbell Bent-Over Row',
    muscleGroup: 'Back',
    youtubeId: 'G8l_8chR5BE',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/G8l_8chR5BE?autoplay=1&mute=1&loop=1&playlist=G8l_8chR5BE&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 2.5, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Torso Hinge', minDeg: 40, maxDeg: 55 },
      { label: 'Elbow Pull', minDeg: 75, maxDeg: 170 },
    ],
    aiFormCues: [
      'Hinge hips to 45 degrees with strong hamstring and core brace.',
      'Pull bar toward lower abdomen/belly button.',
      'Squeeze shoulder blades together at apex with zero jerking.',
    ],
    commonMistakes: [
      'Standing too upright and turning it into a shrug',
      'Rounding lower spine under tension',
    ],
  },
  'overhead dumbbell shoulder press': {
    exerciseId: 'ex-8',
    name: 'Overhead Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    youtubeId: 'qEwKCR5JCog',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/qEwKCR5JCog?autoplay=1&mute=1&loop=1&playlist=qEwKCR5JCog&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 2.5, pauseSec: 0.5, concentricSec: 1 },
    keyAngles: [
      { label: 'Elbow Overhead', minDeg: 80, maxDeg: 175 },
      { label: 'Forearm Verticality', minDeg: 85, maxDeg: 95 },
    ],
    aiFormCues: [
      'Keep core braced and ribs locked down to avoid lower back arching.',
      'Press dumbbells overhead along ear line to full extension.',
      'Lower smoothly until elbows reach 90 degrees.',
    ],
    commonMistakes: [
      'Arching lower back into an incline bench position',
      'Banging dumbbells together overhead',
    ],
  },
  'standing dumbbell lateral raise': {
    exerciseId: 'ex-9',
    name: 'Standing Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    youtubeId: '3VcKaXpzqRo',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/3VcKaXpzqRo?autoplay=1&mute=1&loop=1&playlist=3VcKaXpzqRo&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 2, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Lateral Elevation', minDeg: 15, maxDeg: 90 },
      { label: 'Elbow Slight Bend', minDeg: 10, maxDeg: 15 },
    ],
    aiFormCues: [
      'Slight forward lean (10 degrees) with soft knees.',
      'Lead with elbows, keeping hands level or slightly lower than elbows.',
      'Pause for 1 second at shoulder height before controlled lowering.',
    ],
    commonMistakes: [
      'Shrugging traps to raise arms',
      'Swinging body for momentum instead of strict deltoid tension',
    ],
  },
  'hanging knee/leg raise': {
    exerciseId: 'ex-10',
    name: 'Hanging Knee/Leg Raise',
    muscleGroup: 'Core',
    youtubeId: 'hdng3Nm1x_E',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/hdng3Nm1x_E?autoplay=1&mute=1&loop=1&playlist=hdng3Nm1x_E&playsinline=1&controls=1&rel=0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    cadence: { eccentricSec: 2, pauseSec: 1, concentricSec: 1 },
    keyAngles: [
      { label: 'Hip Flexion', minDeg: 0, maxDeg: 95 },
      { label: 'Pelvic Tilt', minDeg: 15, maxDeg: 30 },
    ],
    aiFormCues: [
      'Posteriorly tilt pelvis before lifting knees to engage lower abdominals.',
      'Pull knees up to chest height with controlled tempo.',
      'Avoid swinging or using kipping momentum.',
    ],
    commonMistakes: [
      'Swinging body like a pendulum',
      'Only raising knees with hip flexors without curling the pelvis',
    ],
  },
};

export function getExerciseVideoMeta(nameOrId?: string): ExerciseVideoMeta {
  if (!nameOrId) return EXERCISE_MEDIA_MAP['barbell bench press'];

  const normalized = nameOrId.toLowerCase().trim();

  // Direct match by key
  if (EXERCISE_MEDIA_MAP[normalized]) {
    return EXERCISE_MEDIA_MAP[normalized];
  }

  // Substring match
  const foundKey = Object.keys(EXERCISE_MEDIA_MAP).find(
    (key) => normalized.includes(key) || key.includes(normalized)
  );

  if (foundKey) {
    return EXERCISE_MEDIA_MAP[foundKey];
  }

  // Match by id
  const byId = Object.values(EXERCISE_MEDIA_MAP).find((item) => item.exerciseId === nameOrId);
  if (byId) return byId;

  // Fallback defaults to Bench Press
  return EXERCISE_MEDIA_MAP['barbell bench press'];
}
