import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'COACH' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  coachId?: string; // If role === 'USER', assigned coach id
  fitnessGoal?: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'ENDURANCE' | 'MAINTENANCE' | 'FLEXIBILITY';
  activityLevel?: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE';
  targetWeightKg?: number;
  heightCm?: number;
  currentWeightKg?: number;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string; // e.g., 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'
  equipment: string; // 'Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Cable'
  description: string;
  instructions: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  aiFormCues?: string[];
  commonMistakes?: string[];
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  targetWeightKg?: number;
  durationSeconds?: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  dayNumber: number; // Day 1, Day 2, etc.
  dayLabel: string; // e.g. "Monday - Upper Power"
  description: string;
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutPlan {
  id: string;
  coachId: string;
  coachName: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  goal: string;
  durationWeeks: number;
  routines: WorkoutRoutine[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutAssignment {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planTitle: string;
  coachId: string;
  assignedAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
}

export interface ExercisePerformanceLog {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  repsCompleted: number;
  weightUsedKg: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  planId?: string;
  routineId?: string;
  routineTitle: string;
  completedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  perceivedEffort: number; // 1 to 10
  notes: string;
  exerciseLogs: ExercisePerformanceLog[];
}

export interface ProgressRecord {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  notes?: string;
}

export interface BmiRecord {
  id: string;
  userId: string;
  date: string;
  heightCm: number;
  weightKg: number;
  bmiValue: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity';
  healthRisk: string;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  portionSize: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: 'COACHING' | 'APP_FEATURES' | 'WORKOUT_CONTENT' | 'BUG_REPORT' | 'OTHER';
  rating: number; // 1 to 5
  comment: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
}

export interface ContentSubmission {
  id: string;
  title: string;
  type: 'COMMUNITY_POST' | 'FITNESS_GUIDE' | 'RECIPE' | 'TRANSFORMATION';
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  imageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderationNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
}

export interface SystemSettings {
  platformName: string;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  emailAlertsEnabled: boolean;
  welcomeMessage: string;
  supportEmail: string;
  requireContentModeration: boolean;
  defaultPlanDurationWeeks: number;
}

export type GoalCategory = 'CHEST' | 'LEGS' | 'BACK' | 'SHOULDERS' | 'ARMS' | 'CORE' | 'FULL_BODY' | 'OTHER';

export interface FitnessGoal {
  id: string;
  userId: string;
  type: 'WEIGHT' | 'STRENGTH';
  title: string;
  exerciseName?: string;
  category?: GoalCategory;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: 'kg' | 'lbs';
  targetReps?: number;
  targetDate: string; // ISO date string YYYY-MM-DD
  status: 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  workoutAssignments: WorkoutAssignment[];
  workoutLogs: WorkoutLog[];
  progressRecords: ProgressRecord[];
  bmiRecords: BmiRecord[];
  nutritionLogs: NutritionLog[];
  messages: Message[];
  feedback: Feedback[];
  contentSubmissions: ContentSubmission[];
  settings: SystemSettings;
  fitnessGoals: FitnessGoal[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'pulsefit_db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial seed data generator
function generateInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const coachHash = bcrypt.hashSync('coach123', salt);
  const userHash = bcrypt.hashSync('user123', salt);

  const adminId = 'usr-admin-1';
  const coachAlexId = 'usr-coach-1';
  const coachElenaId = 'usr-coach-2';

  const userMarcusId = 'usr-athlete-1';
  const userSarahId = 'usr-athlete-2';
  const userDavidId = 'usr-athlete-3';
  const userPriyaId = 'usr-athlete-4';
  const userJordanId = 'usr-athlete-5';

  const users: User[] = [
    {
      id: adminId,
      name: 'Jane Sterling',
      email: 'admin@pulsefit.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 019-2831',
      bio: 'Head of Operations & Platform Governance at PulseFit.',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: coachAlexId,
      name: 'Alex Morgan, CSCS',
      email: 'coach.alex@pulsefit.com',
      passwordHash: coachHash,
      role: 'COACH',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 432-8819',
      bio: 'Elite Strength & Conditioning Coach. Specializing in progressive overload and athletic power development.',
      createdAt: '2026-01-05T09:00:00Z',
    },
    {
      id: coachElenaId,
      name: 'Elena Vance, CPT',
      email: 'coach.elena@pulsefit.com',
      passwordHash: coachHash,
      role: 'COACH',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 912-7463',
      bio: 'Functional movement specialist & endurance coach. Focus on longevity, mobility, and high-performance cardio.',
      createdAt: '2026-01-08T10:00:00Z',
    },
    {
      id: userMarcusId,
      name: 'Marcus Chen',
      email: 'marcus@pulsefit.com',
      passwordHash: userHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 302-9911',
      bio: 'Dedicated athlete aiming for strength gains and lean muscle hypertrophy.',
      coachId: coachAlexId,
      fitnessGoal: 'MUSCLE_GAIN',
      activityLevel: 'VERY_ACTIVE',
      heightCm: 182,
      currentWeightKg: 81.5,
      targetWeightKg: 85.0,
      createdAt: '2026-01-15T11:00:00Z',
    },
    {
      id: userSarahId,
      name: 'Sarah Jenkins',
      email: 'sarah@pulsefit.com',
      passwordHash: userHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 812-4421',
      bio: 'Marathon trainee working on stamina, metabolic health, and core stability.',
      coachId: coachElenaId,
      fitnessGoal: 'ENDURANCE',
      activityLevel: 'VERY_ACTIVE',
      heightCm: 168,
      currentWeightKg: 62.0,
      targetWeightKg: 60.0,
      createdAt: '2026-01-18T14:00:00Z',
    },
    {
      id: userDavidId,
      name: 'David Rodriguez',
      email: 'david@pulsefit.com',
      passwordHash: userHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 673-1194',
      bio: 'Working professional getting back into consistent weight training.',
      coachId: coachAlexId,
      fitnessGoal: 'WEIGHT_LOSS',
      activityLevel: 'MODERATE',
      heightCm: 175,
      currentWeightKg: 89.2,
      targetWeightKg: 80.0,
      createdAt: '2026-02-01T09:30:00Z',
    },
    {
      id: userPriyaId,
      name: 'Priya Sharma',
      email: 'priya@pulsefit.com',
      passwordHash: userHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 991-8843',
      bio: 'Focusing on total body posture, strength and nutrition balance.',
      coachId: coachElenaId,
      fitnessGoal: 'MAINTENANCE',
      activityLevel: 'MODERATE',
      heightCm: 165,
      currentWeightKg: 58.5,
      targetWeightKg: 58.0,
      createdAt: '2026-02-05T12:00:00Z',
    },
    {
      id: userJordanId,
      name: 'Jordan Taylor',
      email: 'jordan@pulsefit.com',
      passwordHash: userHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 441-2290',
      bio: 'Cross-training enthusiast exploring functional power lifting.',
      coachId: coachAlexId,
      fitnessGoal: 'MUSCLE_GAIN',
      activityLevel: 'VERY_ACTIVE',
      heightCm: 179,
      currentWeightKg: 76.0,
      targetWeightKg: 80.0,
      createdAt: '2026-02-10T16:00:00Z',
    },
  ];

  const exercises: Exercise[] = [
    {
      id: 'ex-1',
      name: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      description: 'Compound horizontal pressing exercise for pectorals, front delts, and triceps.',
      instructions: 'Lie on the bench, grip the bar slightly wider than shoulder-width, lower smoothly to mid-chest, and press explosively while driving heels into floor.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Retract and depress scapulae firmly against the bench pad.',
        'Maintain a slight natural lumbar arch with glutes planted.',
        'Elbows should tuck at approximately 45-60 degrees, not flared 90 degrees.',
        'Drive through heels upon concentric ascent to generate leg drive.',
      ],
      commonMistakes: [
        'Bouncing bar off the sternum',
        'Flaring elbows 90 degrees risking rotator cuff impingement',
        'Lifting glutes off the bench during heavy effort',
      ],
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press',
      muscleGroup: 'Chest',
      equipment: 'Dumbbell',
      description: 'Targets upper clavicular head of the pectoralis major.',
      instructions: 'Set bench to 30-45 degrees. Lower dumbbells until elbows are at roughly 90 degrees, press upward in a slight arc.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/8iPEnn-ltC8?autoplay=1&mute=1&loop=1&playlist=8iPEnn-ltC8&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Keep wrists stacked directly over elbows throughout the press.',
        'Converge dumbbells near top without clanging weights together.',
        'Control the descent with a 3-second eccentric tempo.',
      ],
      commonMistakes: [
        'Setting bench angle too steep (>45 deg) shifting work to anterior deltoids',
        'Collapsing wrists backward',
      ],
    },
    {
      id: 'ex-3',
      name: 'Triceps Rope Pushdown',
      muscleGroup: 'Arms',
      equipment: 'Cable',
      description: 'Isolation exercise targeting all three heads of the triceps.',
      instructions: 'Keep elbows tucked tightly at sides. Push down and flare rope outward at the bottom of the movement.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/2-LAMcpzODU?autoplay=1&mute=1&loop=1&playlist=2-LAMcpzODU&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Pin elbows stationary to ribs, acting strictly as hinges.',
        'Flare the rope outward at full extension for peak contraction.',
        'Keep torso inclined roughly 10 degrees for consistent tension.',
      ],
      commonMistakes: [
        'Using shoulder momentum to initiate the downward movement',
        'Flaring elbows away from the torso',
      ],
    },
    {
      id: 'ex-4',
      name: 'Barbell Back Squat',
      muscleGroup: 'Legs',
      equipment: 'Barbell',
      description: 'Primary compound movement for quadriceps, glutes, and core stability.',
      instructions: 'Rest bar on upper traps. Brace core, sit hips down and back until thighs reach parallel with floor, then drive up through midfoot.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/bEv6CCg2BC8?autoplay=1&mute=1&loop=1&playlist=bEv6CCg2BC8&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Brace 360-degree intra-abdominal pressure (Valsalva) prior to descending.',
        'Knees should track in line with middle toes.',
        'Hit depth where hip crease is at or below the top of the knee.',
        'Drive chest and hips up simultaneously out of the hole.',
      ],
      commonMistakes: [
        'Knee valgus (knees caving inward) during ascent',
        'Good-morning squat (hips shooting up before chest)',
        'Heels lifting off the ground due to limited ankle dorsiflexion',
      ],
    },
    {
      id: 'ex-5',
      name: 'Romanian Deadlift (RDL)',
      muscleGroup: 'Legs',
      equipment: 'Barbell',
      description: 'Hip-hinge movement maximizing hamstring and glute hypertrophy.',
      instructions: 'Slight knee bend, hinge at hips while keeping chest tall and spine neutral. Lower bar just below knees, squeeze glutes to stand.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/op9kVnSso6Q?autoplay=1&mute=1&loop=1&playlist=op9kVnSso6Q&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Initiate the movement by pushing hips backward, not bending knees.',
        'Keep the barbell in continuous contact with thighs and shins.',
        'Maintain a neutral cervical spine (eyes focused 6-10 ft ahead).',
      ],
      commonMistakes: [
        'Rounding lumbar spine during the stretch',
        'Turning the exercise into a standard squat with excessive knee flexion',
      ],
    },
    {
      id: 'ex-6',
      name: 'Lat Pulldown',
      muscleGroup: 'Back',
      equipment: 'Cable',
      description: 'Vertical pull for broad lats and upper back development.',
      instructions: 'Grip bar wide, lean back slightly. Pull bar down toward upper chest while depressing and retracting shoulder blades.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/CAwf7n6Luuc?autoplay=1&mute=1&loop=1&playlist=CAwf7n6Luuc&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Depress shoulder blades before pulling with elbows.',
        'Drive elbows down and slightly inward toward back pockets.',
        'Avoid excessive torso swing beyond 15 degrees backward lean.',
      ],
      commonMistakes: [
        'Pulling the bar behind the neck putting extreme torque on shoulders',
        'Using body momentum rather than lat contraction',
      ],
    },
    {
      id: 'ex-7',
      name: 'Barbell Bent-Over Row',
      muscleGroup: 'Back',
      equipment: 'Barbell',
      description: 'Horizontal pull building back thickness, rhomboids, and rear delts.',
      instructions: 'Hinge torso to roughly 45 degrees. Pull bar toward belly button, pause briefly, control descent.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/G8l_8chR5BE?autoplay=1&mute=1&loop=1&playlist=G8l_8chR5BE&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Maintain isometric hamstring and glute brace to protect lower back.',
        'Pull barbell into navel area, squeezing scapulae at the apex.',
        'Control the eccentric lowering without dropping torso angle.',
      ],
      commonMistakes: [
        'Jerking torso upward to heave the bar',
        'Rounding upper and lower back under heavy load',
      ],
    },
    {
      id: 'ex-8',
      name: 'Overhead Dumbbell Shoulder Press',
      muscleGroup: 'Shoulders',
      equipment: 'Dumbbell',
      description: 'Vertical pressing movement for anterior and lateral deltoids.',
      instructions: 'Sit upright with core tight. Press weights overhead until arms are extended, avoid overarching lower back.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/qEwKCR5JCog?autoplay=1&mute=1&loop=1&playlist=qEwKCR5JCog&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Keep ribcage locked down to prevent lumbar extension.',
        'Press dumbbells in a natural slight arc over the crown of head.',
        'Maintain tension at the bottom—do not let elbows drop below 90 deg.',
      ],
      commonMistakes: [
        'Arching lower back and turning it into an incline chest press',
        'Banging weights together at lockout',
      ],
    },
    {
      id: 'ex-9',
      name: 'Standing Dumbbell Lateral Raise',
      muscleGroup: 'Shoulders',
      equipment: 'Dumbbell',
      description: 'Direct lateral head deltoid builder for shoulder width.',
      instructions: 'Raise dumbbells to shoulder height leading with elbows. Control the eccentric tempo for maximum tension.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/3VcKaXpzqRo?autoplay=1&mute=1&loop=1&playlist=3VcKaXpzqRo&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Slight 10-degree forward hip hinge.',
        'Lead the movement with elbows slightly higher than wrists (pour the pitcher).',
        'Keep traps relaxed—do not shrug during elevation.',
      ],
      commonMistakes: [
        'Swinging hips or knees for momentum',
        'Lifting wrists higher than elbows',
      ],
    },
    {
      id: 'ex-10',
      name: 'Hanging Knee/Leg Raise',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      description: 'Dynamic abdominal and hip flexor core conditioning.',
      instructions: 'Hang from pull-up bar, posteriorly tilt pelvis and draw knees up to chest without swinging.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/hdng3Nm1x_E?autoplay=1&mute=1&loop=1&playlist=hdng3Nm1x_E&playsinline=1&controls=1&rel=0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80',
      aiFormCues: [
        'Posterior pelvic tilt is essential: tuck tailbone before knees elevate.',
        'Engage lats to stabilize shoulder girdle and eliminate body swing.',
        'Pause at peak contraction for 1 second.',
      ],
      commonMistakes: [
        'Using swinging hip momentum like a kip',
        'Failing to posteriorly tilt pelvis, solely engaging hip flexors',
      ],
    },
  ];

  const plan1: WorkoutPlan = {
    id: 'plan-101',
    coachId: coachAlexId,
    coachName: 'Alex Morgan, CSCS',
    title: '8-Week Hypertrophy & Strength Surge',
    description: 'Periodized upper/lower split designed for rapid muscle hypertrophy and foundation strength. Features progressive overload tracking.',
    difficulty: 'INTERMEDIATE',
    goal: 'Muscle Growth & Strength',
    durationWeeks: 8,
    isPublished: true,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-01T12:00:00Z',
    routines: [
      {
        id: 'rout-1',
        title: 'Upper Body Power & Hypertrophy',
        dayNumber: 1,
        dayLabel: 'Day 1 - Chest, Back & Triceps',
        description: 'Heavy compound pressing combined with vertical rowing and arm finishing.',
        exercises: [
          {
            id: 'we-1',
            exerciseId: 'ex-1',
            exerciseName: 'Barbell Bench Press',
            muscleGroup: 'Chest',
            sets: 4,
            reps: 8,
            targetWeightKg: 80,
            restSeconds: 90,
            notes: 'Warm up properly. Aim for RPE 8 on final sets.',
          },
          {
            id: 'we-2',
            exerciseId: 'ex-6',
            exerciseName: 'Lat Pulldown',
            muscleGroup: 'Back',
            sets: 4,
            reps: 10,
            targetWeightKg: 65,
            restSeconds: 75,
            notes: 'Squeeze shoulder blades together at bottom.',
          },
          {
            id: 'we-3',
            exerciseId: 'ex-2',
            exerciseName: 'Incline Dumbbell Press',
            muscleGroup: 'Chest',
            sets: 3,
            reps: 10,
            targetWeightKg: 28,
            restSeconds: 60,
            notes: 'Full stretch at bottom.',
          },
          {
            id: 'we-4',
            exerciseId: 'ex-3',
            exerciseName: 'Triceps Rope Pushdown',
            muscleGroup: 'Arms',
            sets: 3,
            reps: 12,
            targetWeightKg: 25,
            restSeconds: 60,
            notes: 'Lock out elbows and spread rope tips.',
          },
        ],
      },
      {
        id: 'rout-2',
        title: 'Lower Body & Core Domination',
        dayNumber: 2,
        dayLabel: 'Day 2 - Quads, Hamstrings & Abs',
        description: 'Squat pattern focus with heavy posterior chain loading and spinal stabilization.',
        exercises: [
          {
            id: 'we-5',
            exerciseId: 'ex-4',
            exerciseName: 'Barbell Back Squat',
            muscleGroup: 'Legs',
            sets: 4,
            reps: 6,
            targetWeightKg: 105,
            restSeconds: 120,
            notes: 'Focus on hitting depth with upright torso.',
          },
          {
            id: 'we-6',
            exerciseId: 'ex-5',
            exerciseName: 'Romanian Deadlift (RDL)',
            muscleGroup: 'Legs',
            sets: 4,
            reps: 8,
            targetWeightKg: 90,
            restSeconds: 90,
            notes: 'Slow 3-second descent, feel deep stretch in hamstrings.',
          },
          {
            id: 'we-7',
            exerciseId: 'ex-10',
            exerciseName: 'Hanging Knee/Leg Raise',
            muscleGroup: 'Core',
            sets: 3,
            reps: 15,
            restSeconds: 45,
            notes: 'Avoid swinging; initiate each rep from abs.',
          },
        ],
      },
      {
        id: 'rout-3',
        title: 'Shoulders, Back & Arms Conditioning',
        dayNumber: 3,
        dayLabel: 'Day 3 - Delts, Upper Back & Arms',
        description: 'V-taper construction targeting shoulder caps and back thickness.',
        exercises: [
          {
            id: 'we-8',
            exerciseId: 'ex-8',
            exerciseName: 'Overhead Dumbbell Shoulder Press',
            muscleGroup: 'Shoulders',
            sets: 4,
            reps: 10,
            targetWeightKg: 22,
            restSeconds: 75,
            notes: 'Strict form, no leg drive.',
          },
          {
            id: 'we-9',
            exerciseId: 'ex-7',
            exerciseName: 'Barbell Bent-Over Row',
            muscleGroup: 'Back',
            sets: 4,
            reps: 8,
            targetWeightKg: 70,
            restSeconds: 90,
            notes: 'Keep spine flat, pull to lower ribs.',
          },
          {
            id: 'we-10',
            exerciseId: 'ex-9',
            exerciseName: 'Standing Dumbbell Lateral Raise',
            muscleGroup: 'Shoulders',
            sets: 4,
            reps: 15,
            targetWeightKg: 10,
            restSeconds: 45,
            notes: 'Continuous tension, 1 second pause at top.',
          },
        ],
      },
    ],
  };

  const plan2: WorkoutPlan = {
    id: 'plan-102',
    coachId: coachElenaId,
    coachName: 'Elena Vance, CPT',
    title: 'Functional Mobility & Metabolic Conditioning',
    description: 'Dynamic athletic conditioning plan emphasizing joint longevity, core rotational power, and fat oxidation.',
    difficulty: 'BEGINNER',
    goal: 'Endurance & Mobility',
    durationWeeks: 6,
    isPublished: true,
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-02-05T11:00:00Z',
    routines: [
      {
        id: 'rout-201',
        title: 'Metabolic Full-Body Circuit',
        dayNumber: 1,
        dayLabel: 'Day 1 - Total Body Tone',
        description: 'High-density workout combining squatting, pulling, and core intervals.',
        exercises: [
          {
            id: 'we-201',
            exerciseId: 'ex-4',
            exerciseName: 'Barbell Back Squat',
            muscleGroup: 'Legs',
            sets: 3,
            reps: 12,
            targetWeightKg: 60,
            restSeconds: 60,
            notes: 'Controlled tempo, focus on fluid rhythm.',
          },
          {
            id: 'we-202',
            exerciseId: 'ex-6',
            exerciseName: 'Lat Pulldown',
            muscleGroup: 'Back',
            sets: 3,
            reps: 12,
            targetWeightKg: 45,
            restSeconds: 60,
          },
          {
            id: 'we-203',
            exerciseId: 'ex-10',
            exerciseName: 'Hanging Knee/Leg Raise',
            muscleGroup: 'Core',
            sets: 3,
            reps: 12,
            restSeconds: 45,
          },
        ],
      },
    ],
  };

  const workoutPlans: WorkoutPlan[] = [plan1, plan2];

  const workoutAssignments: WorkoutAssignment[] = [
    {
      id: 'asg-1',
      userId: userMarcusId,
      userName: 'Marcus Chen',
      planId: plan1.id,
      planTitle: plan1.title,
      coachId: coachAlexId,
      assignedAt: '2026-01-22T08:00:00Z',
      status: 'ACTIVE',
    },
    {
      id: 'asg-2',
      userId: userSarahId,
      userName: 'Sarah Jenkins',
      planId: plan2.id,
      planTitle: plan2.title,
      coachId: coachElenaId,
      assignedAt: '2026-01-26T09:00:00Z',
      status: 'ACTIVE',
    },
    {
      id: 'asg-3',
      userId: userDavidId,
      userName: 'David Rodriguez',
      planId: plan1.id,
      planTitle: plan1.title,
      coachId: coachAlexId,
      assignedAt: '2026-02-02T10:00:00Z',
      status: 'ACTIVE',
    },
  ];

  // Past workout logs for Marcus Chen
  const workoutLogs: WorkoutLog[] = [
    {
      id: 'log-1',
      userId: userMarcusId,
      planId: plan1.id,
      routineId: 'rout-1',
      routineTitle: 'Upper Body Power & Hypertrophy',
      completedAt: '2026-02-02T18:30:00Z',
      durationMinutes: 52,
      caloriesBurned: 420,
      perceivedEffort: 8,
      notes: 'Felt very explosive on the bench press. Hit all reps cleanly.',
      exerciseLogs: [
        { exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', setNumber: 1, repsCompleted: 8, weightUsedKg: 80 },
        { exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', setNumber: 2, repsCompleted: 8, weightUsedKg: 80 },
        { exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', setNumber: 3, repsCompleted: 8, weightUsedKg: 80 },
        { exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', setNumber: 4, repsCompleted: 7, weightUsedKg: 80 },
        { exerciseId: 'ex-6', exerciseName: 'Lat Pulldown', setNumber: 1, repsCompleted: 10, weightUsedKg: 65 },
        { exerciseId: 'ex-6', exerciseName: 'Lat Pulldown', setNumber: 2, repsCompleted: 10, weightUsedKg: 65 },
        { exerciseId: 'ex-6', exerciseName: 'Lat Pulldown', setNumber: 3, repsCompleted: 10, weightUsedKg: 65 },
        { exerciseId: 'ex-6', exerciseName: 'Lat Pulldown', setNumber: 4, repsCompleted: 9, weightUsedKg: 65 },
      ],
    },
    {
      id: 'log-2',
      userId: userMarcusId,
      planId: plan1.id,
      routineId: 'rout-2',
      routineTitle: 'Lower Body & Core Domination',
      completedAt: '2026-02-04T19:00:00Z',
      durationMinutes: 58,
      caloriesBurned: 480,
      perceivedEffort: 9,
      notes: 'Heavy squats. Kept rest times strictly under 2 minutes.',
      exerciseLogs: [
        { exerciseId: 'ex-4', exerciseName: 'Barbell Back Squat', setNumber: 1, repsCompleted: 6, weightUsedKg: 105 },
        { exerciseId: 'ex-4', exerciseName: 'Barbell Back Squat', setNumber: 2, repsCompleted: 6, weightUsedKg: 105 },
        { exerciseId: 'ex-4', exerciseName: 'Barbell Back Squat', setNumber: 3, repsCompleted: 6, weightUsedKg: 105 },
        { exerciseId: 'ex-4', exerciseName: 'Barbell Back Squat', setNumber: 4, repsCompleted: 6, weightUsedKg: 105 },
      ],
    },
    {
      id: 'log-3',
      userId: userMarcusId,
      planId: plan1.id,
      routineId: 'rout-3',
      routineTitle: 'Shoulders, Back & Arms Conditioning',
      completedAt: '2026-02-06T17:45:00Z',
      durationMinutes: 46,
      caloriesBurned: 380,
      perceivedEffort: 7,
      notes: 'Pump was incredible. Shoulder health feels rock solid.',
      exerciseLogs: [
        { exerciseId: 'ex-8', exerciseName: 'Overhead Dumbbell Shoulder Press', setNumber: 1, repsCompleted: 10, weightUsedKg: 22 },
        { exerciseId: 'ex-8', exerciseName: 'Overhead Dumbbell Shoulder Press', setNumber: 2, repsCompleted: 10, weightUsedKg: 22 },
      ],
    },
    {
      id: 'log-4',
      userId: userSarahId,
      planId: plan2.id,
      routineId: 'rout-201',
      routineTitle: 'Metabolic Full-Body Circuit',
      completedAt: '2026-02-05T08:15:00Z',
      durationMinutes: 40,
      caloriesBurned: 350,
      perceivedEffort: 8,
      notes: 'High heart rate throughout. Really enjoyed the circuit pace.',
      exerciseLogs: [
        { exerciseId: 'ex-4', exerciseName: 'Barbell Back Squat', setNumber: 1, repsCompleted: 12, weightUsedKg: 55 },
      ],
    },
  ];

  // Historical progress records for Marcus Chen (tracking weight & metrics over weeks)
  const progressRecords: ProgressRecord[] = [
    { id: 'prog-1', userId: userMarcusId, date: '2026-01-15', weightKg: 79.5, bodyFatPercentage: 15.2, chestCm: 101, waistCm: 84, armsCm: 37, notes: 'Starting assessment baseline' },
    { id: 'prog-2', userId: userMarcusId, date: '2026-01-22', weightKg: 80.0, bodyFatPercentage: 15.0, chestCm: 101.5, waistCm: 83.5, armsCm: 37.2, notes: 'Feeling energized, appetite up' },
    { id: 'prog-3', userId: userMarcusId, date: '2026-01-29', weightKg: 80.8, bodyFatPercentage: 14.8, chestCm: 102.0, waistCm: 83.0, armsCm: 37.6, notes: 'Noticeable strength progression' },
    { id: 'prog-4', userId: userMarcusId, date: '2026-02-05', weightKg: 81.5, bodyFatPercentage: 14.5, chestCm: 103.0, waistCm: 82.5, armsCm: 38.0, notes: 'Surpassed 81kg milestone with tighter waist' },

    { id: 'prog-5', userId: userSarahId, date: '2026-01-18', weightKg: 63.5, bodyFatPercentage: 23.0, chestCm: 88, waistCm: 72, hipsCm: 96, notes: 'Baseline check' },
    { id: 'prog-6', userId: userSarahId, date: '2026-02-01', weightKg: 62.0, bodyFatPercentage: 22.2, chestCm: 87.5, waistCm: 70.5, hipsCm: 95, notes: 'Good fat loss and recovery' },
  ];

  // BMI records
  const bmiRecords: BmiRecord[] = [
    {
      id: 'bmi-1',
      userId: userMarcusId,
      date: '2026-01-15',
      heightCm: 182,
      weightKg: 79.5,
      bmiValue: 24.0,
      category: 'Normal weight',
      healthRisk: 'Low health risk. Optimal range for athletic progression.',
    },
    {
      id: 'bmi-2',
      userId: userMarcusId,
      date: '2026-02-05',
      heightCm: 182,
      weightKg: 81.5,
      bmiValue: 24.6,
      category: 'Normal weight',
      healthRisk: 'Healthy weight with high proportion of lean muscle mass.',
    },
    {
      id: 'bmi-3',
      userId: userSarahId,
      date: '2026-01-18',
      heightCm: 168,
      weightKg: 63.5,
      bmiValue: 22.5,
      category: 'Normal weight',
      healthRisk: 'Low risk. Excellent cardiovascular endurance baseline.',
    },
    {
      id: 'bmi-4',
      userId: userDavidId,
      date: '2026-02-01',
      heightCm: 175,
      weightKg: 89.2,
      bmiValue: 29.1,
      category: 'Overweight',
      healthRisk: 'Elevated risk. Recommended caloric deficit with progressive resistance.',
    },
  ];

  // Nutritional logs for user
  const nutritionLogs: NutritionLog[] = [
    {
      id: 'nut-1',
      userId: userMarcusId,
      date: '2026-02-06',
      mealType: 'BREAKFAST',
      foodName: 'Oatmeal with Whey Protein & Blueberries',
      calories: 520,
      proteinG: 42,
      carbsG: 68,
      fatG: 9,
      portionSize: '1 large bowl (350g)',
    },
    {
      id: 'nut-2',
      userId: userMarcusId,
      date: '2026-02-06',
      mealType: 'LUNCH',
      foodName: 'Grilled Chicken Breast, Brown Rice & Broccoli',
      calories: 680,
      proteinG: 55,
      carbsG: 75,
      fatG: 14,
      portionSize: 'Plate (400g)',
    },
    {
      id: 'nut-3',
      userId: userMarcusId,
      date: '2026-02-06',
      mealType: 'SNACK',
      foodName: 'Greek Yogurt with Almonds & Honey',
      calories: 310,
      proteinG: 24,
      carbsG: 22,
      fatG: 12,
      portionSize: '1 cup',
    },
    {
      id: 'nut-4',
      userId: userMarcusId,
      date: '2026-02-06',
      mealType: 'DINNER',
      foodName: 'Wild Salmon Fillet, Sweet Potato & Asparagus',
      calories: 640,
      proteinG: 48,
      carbsG: 52,
      fatG: 24,
      portionSize: 'Fillet + sides (380g)',
    },
    {
      id: 'nut-5',
      userId: userMarcusId,
      date: '2026-02-05',
      mealType: 'BREAKFAST',
      foodName: 'Scrambled Eggs with Avocado & Sourdough Toast',
      calories: 560,
      proteinG: 34,
      carbsG: 45,
      fatG: 26,
      portionSize: '3 eggs + 2 slices',
    },
    {
      id: 'nut-6',
      userId: userMarcusId,
      date: '2026-02-05',
      mealType: 'LUNCH',
      foodName: 'Lean Beef Burrito Bowl with Black Beans & Rice',
      calories: 740,
      proteinG: 52,
      carbsG: 82,
      fatG: 20,
      portionSize: 'Bowl (450g)',
    },
    {
      id: 'nut-7',
      userId: userMarcusId,
      date: '2026-02-05',
      mealType: 'DINNER',
      foodName: 'Baked Cod, Quinoa & Steamed Green Beans',
      calories: 510,
      proteinG: 45,
      carbsG: 48,
      fatG: 11,
      portionSize: '1 plate',
    },
  ];

  // Messaging conversations
  const messages: Message[] = [
    {
      id: 'msg-1',
      senderId: coachAlexId,
      senderName: 'Alex Morgan, CSCS',
      senderRole: 'COACH',
      receiverId: userMarcusId,
      receiverName: 'Marcus Chen',
      content: 'Hey Marcus! I reviewed your bench press logs from Monday. Great job maintaining bar speed at 80kg.',
      createdAt: '2026-02-03T10:15:00Z',
      isRead: true,
    },
    {
      id: 'msg-2',
      senderId: userMarcusId,
      senderName: 'Marcus Chen',
      senderRole: 'USER',
      receiverId: coachAlexId,
      receiverName: 'Alex Morgan, CSCS',
      content: 'Thanks Coach Alex! My triceps felt tired on the final set. Should I keep the weight at 80kg next week or try 82.5kg?',
      createdAt: '2026-02-03T11:20:00Z',
      isRead: true,
    },
    {
      id: 'msg-3',
      senderId: coachAlexId,
      senderName: 'Alex Morgan, CSCS',
      senderRole: 'COACH',
      receiverId: userMarcusId,
      receiverName: 'Marcus Chen',
      content: 'Bump it to 82.5kg for the first two sets! If you hit 8 clean reps, keep it there. Also ensure you are getting at least 160g protein daily.',
      createdAt: '2026-02-03T14:40:00Z',
      isRead: true,
    },
    {
      id: 'msg-4',
      senderId: userMarcusId,
      senderName: 'Marcus Chen',
      senderRole: 'USER',
      receiverId: coachAlexId,
      receiverName: 'Alex Morgan, CSCS',
      content: 'Understood! I tracked all my meals today in the nutrition dashboard. Hit 169g protein.',
      createdAt: '2026-02-06T20:10:00Z',
      isRead: false,
    },
    {
      id: 'msg-5',
      senderId: userSarahId,
      senderName: 'Sarah Jenkins',
      senderRole: 'USER',
      receiverId: coachElenaId,
      receiverName: 'Elena Vance, CPT',
      content: 'Coach Elena, the mobility circuit really helped my hip stiffness after yesterday’s long run!',
      createdAt: '2026-02-05T15:00:00Z',
      isRead: true,
    },
    {
      id: 'msg-6',
      senderId: coachElenaId,
      senderName: 'Elena Vance, CPT',
      senderRole: 'COACH',
      receiverId: userSarahId,
      receiverName: 'Sarah Jenkins',
      content: 'That is wonderful news Sarah! Keep up with the post-run glute bridges and hamstring flossing.',
      createdAt: '2026-02-05T16:30:00Z',
      isRead: true,
    },
  ];

  // User feedback
  const feedback: Feedback[] = [
    {
      id: 'fb-1',
      userId: userMarcusId,
      userName: 'Marcus Chen',
      userEmail: 'marcus@pulsefit.com',
      category: 'COACHING',
      rating: 5,
      comment: 'Coach Alex has transformed how I approach progressive overload. The workout builder and set tracker are super smooth!',
      status: 'REVIEWED',
      createdAt: '2026-02-01T14:00:00Z',
    },
    {
      id: 'fb-2',
      userId: userSarahId,
      userName: 'Sarah Jenkins',
      userEmail: 'sarah@pulsefit.com',
      category: 'APP_FEATURES',
      rating: 5,
      comment: 'The BMI and nutrition breakdown with macro graphs makes tracking my daily fueling effortless.',
      status: 'RESOLVED',
      createdAt: '2026-02-03T09:12:00Z',
    },
    {
      id: 'fb-3',
      userId: userDavidId,
      userName: 'David Rodriguez',
      userEmail: 'david@pulsefit.com',
      category: 'WORKOUT_CONTENT',
      rating: 4,
      comment: 'Would love even more video form cues for complex barbell movements like Romanian Deadlifts.',
      status: 'PENDING',
      createdAt: '2026-02-06T11:45:00Z',
    },
  ];

  // Content submissions for moderation
  const contentSubmissions: ContentSubmission[] = [
    {
      id: 'cnt-1',
      title: 'How to Break Through a Bench Press Plateau in 4 Weeks',
      type: 'FITNESS_GUIDE',
      authorId: coachAlexId,
      authorName: 'Alex Morgan, CSCS',
      authorRole: 'COACH',
      content: 'Plateaus occur when neurological adaptation stalls or volume exceeds recovery capacity. Here is the 3-step microcycle adjustment you should apply...',
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      moderationNotes: 'Approved by Admin Jane. Excellent technical guide for members.',
      submittedAt: '2026-01-28T10:00:00Z',
      reviewedAt: '2026-01-29T11:00:00Z',
      reviewerName: 'Jane Sterling',
    },
    {
      id: 'cnt-2',
      title: 'High Protein Post-Workout Chia Seed Parfait Recipe',
      type: 'RECIPE',
      authorId: coachElenaId,
      authorName: 'Elena Vance, CPT',
      authorRole: 'COACH',
      content: 'Ingredients: 35g Vanilla isolate, 150g low-fat Greek yogurt, 2 tbsp chia seeds, unsweetened almond milk. 38g protein, 310 calories.',
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      moderationNotes: 'Verified nutritional facts.',
      submittedAt: '2026-02-02T13:30:00Z',
      reviewedAt: '2026-02-02T16:00:00Z',
      reviewerName: 'Jane Sterling',
    },
    {
      id: 'cnt-3',
      title: 'My 12-Week Transformation: Down 8kg, Up 20kg on Squat!',
      type: 'TRANSFORMATION',
      authorId: userMarcusId,
      authorName: 'Marcus Chen',
      authorRole: 'USER',
      content: 'Huge shoutout to the PulseFit platform and coach Alex. Following the 8-Week surge plan gave me discipline and measurable results.',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      status: 'PENDING',
      moderationNotes: 'Awaiting admin review for community guidelines compliance.',
      submittedAt: '2026-02-06T15:20:00Z',
    },
  ];

  const settings: SystemSettings = {
    platformName: 'PulseFit Coaching SaaS',
    allowNewRegistrations: true,
    maintenanceMode: false,
    emailAlertsEnabled: true,
    welcomeMessage: 'Welcome to PulseFit! Unleash your peak physical potential with dedicated coaching.',
    supportEmail: 'support@pulsefit.com',
    requireContentModeration: true,
    defaultPlanDurationWeeks: 8,
  };

  const fitnessGoals: FitnessGoal[] = generateInitialFitnessGoals();

  return {
    users,
    exercises,
    workoutPlans,
    workoutAssignments,
    workoutLogs,
    progressRecords,
    bmiRecords,
    nutritionLogs,
    messages,
    feedback,
    contentSubmissions,
    settings,
    fitnessGoals,
  };
}

export function generateInitialFitnessGoals(): FitnessGoal[] {
  return [
    {
      id: 'goal-weight-1',
      userId: 'usr-athlete-1',
      type: 'WEIGHT',
      title: 'Target Body Weight',
      startValue: 78.0,
      currentValue: 81.5,
      targetValue: 85.0,
      unit: 'kg',
      targetDate: '2026-11-30',
      status: 'IN_PROGRESS',
      notes: 'Lean hypertrophy surplus: Reach 85kg with controlled caloric surplus and high protein intake.',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-10-10T12:00:00Z',
    },
    {
      id: 'goal-strength-1',
      userId: 'usr-athlete-1',
      type: 'STRENGTH',
      title: 'Barbell Bench Press',
      exerciseName: 'Barbell Bench Press',
      category: 'CHEST',
      startValue: 80.0,
      currentValue: 92.5,
      targetValue: 100.0,
      targetReps: 5,
      unit: 'kg',
      targetDate: '2026-11-15',
      status: 'IN_PROGRESS',
      notes: 'Hit 100kg for 5 working reps with solid 1s chest pause and retracted scapula.',
      createdAt: '2026-09-05T11:00:00Z',
      updatedAt: '2026-10-08T14:30:00Z',
    },
    {
      id: 'goal-strength-2',
      userId: 'usr-athlete-1',
      type: 'STRENGTH',
      title: 'Barbell Back Squat',
      exerciseName: 'Barbell Back Squat',
      category: 'LEGS',
      startValue: 100.0,
      currentValue: 125.0,
      targetValue: 140.0,
      targetReps: 3,
      unit: 'kg',
      targetDate: '2026-12-05',
      status: 'IN_PROGRESS',
      notes: 'Deep hip hinge below parallel, knees tracked over toes, explosive drive out of the hole.',
      createdAt: '2026-09-08T09:15:00Z',
      updatedAt: '2026-10-09T18:00:00Z',
    },
    {
      id: 'goal-strength-3',
      userId: 'usr-athlete-1',
      type: 'STRENGTH',
      title: 'Conventional Deadlift',
      exerciseName: 'Deadlift',
      category: 'BACK',
      startValue: 130.0,
      currentValue: 160.0,
      targetValue: 180.0,
      targetReps: 1,
      unit: 'kg',
      targetDate: '2026-12-20',
      status: 'IN_PROGRESS',
      notes: 'Single rep max (1RM) test. Tight lats, slack pulled from the bar before leg drive.',
      createdAt: '2026-09-10T15:00:00Z',
      updatedAt: '2026-10-07T16:20:00Z',
    },
    {
      id: 'goal-strength-4',
      userId: 'usr-athlete-1',
      type: 'STRENGTH',
      title: 'Standing Overhead Press',
      exerciseName: 'Standing Overhead Press',
      category: 'SHOULDERS',
      startValue: 50.0,
      currentValue: 65.0,
      targetValue: 65.0,
      targetReps: 5,
      unit: 'kg',
      targetDate: '2026-10-05',
      status: 'COMPLETED',
      completedAt: '2026-10-05T17:45:00Z',
      notes: 'Goal unlocked! 65kg strict overhead press for 5 reps with complete lockout.',
      createdAt: '2026-08-15T08:00:00Z',
      updatedAt: '2026-10-05T17:45:00Z',
    },
    {
      id: 'goal-weight-2',
      userId: 'usr-athlete-2',
      type: 'WEIGHT',
      title: 'Target Body Weight',
      startValue: 65.0,
      currentValue: 62.0,
      targetValue: 60.0,
      unit: 'kg',
      targetDate: '2026-11-20',
      status: 'IN_PROGRESS',
      notes: 'Cutting for endurance marathon race weight.',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-10-06T12:00:00Z',
    },
  ];
}

// In-memory cache + persistent disk synchronization
class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.fitnessGoals || this.data.fitnessGoals.length === 0) {
          this.data.fitnessGoals = generateInitialFitnessGoals();
          this.save();
        }
      } catch (err) {
        console.error('Failed to parse database file, resetting to initial seed:', err);
        this.data = generateInitialDatabase();
        this.save();
      }
    } else {
      this.data = generateInitialDatabase();
      this.save();
    }
  }

  public save() {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // --- Users ---
  public getUsers() {
    return this.data.users;
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  public deleteUser(id: string) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      const removed = this.data.users.splice(idx, 1)[0];
      // Clean up assignments, logs, messages
      this.data.workoutAssignments = this.data.workoutAssignments.filter((a) => a.userId !== id);
      this.save();
      return removed;
    }
    return null;
  }

  // --- Exercises ---
  public getExercises() {
    return this.data.exercises;
  }

  public addExercise(exercise: Exercise) {
    this.data.exercises.push(exercise);
    this.save();
    return exercise;
  }

  // --- Workout Plans ---
  public getWorkoutPlans() {
    return this.data.workoutPlans;
  }

  public getWorkoutPlanById(id: string) {
    return this.data.workoutPlans.find((p) => p.id === id);
  }

  public addWorkoutPlan(plan: WorkoutPlan) {
    this.data.workoutPlans.push(plan);
    this.save();
    return plan;
  }

  public updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>) {
    const idx = this.data.workoutPlans.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.workoutPlans[idx] = { ...this.data.workoutPlans[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.workoutPlans[idx];
    }
    return null;
  }

  public deleteWorkoutPlan(id: string) {
    const idx = this.data.workoutPlans.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const removed = this.data.workoutPlans.splice(idx, 1)[0];
      this.data.workoutAssignments = this.data.workoutAssignments.filter((a) => a.planId !== id);
      this.save();
      return removed;
    }
    return null;
  }

  // --- Assignments ---
  public getAssignments() {
    return this.data.workoutAssignments;
  }

  public getAssignmentsByUserId(userId: string) {
    return this.data.workoutAssignments.filter((a) => a.userId === userId);
  }

  public getAssignmentsByCoachId(coachId: string) {
    return this.data.workoutAssignments.filter((a) => a.coachId === coachId);
  }

  public addAssignment(assignment: WorkoutAssignment) {
    this.data.workoutAssignments.push(assignment);
    this.save();
    return assignment;
  }

  public updateAssignmentStatus(id: string, status: 'ACTIVE' | 'COMPLETED' | 'PAUSED') {
    const asg = this.data.workoutAssignments.find((a) => a.id === id);
    if (asg) {
      asg.status = status;
      this.save();
      return asg;
    }
    return null;
  }

  // --- Workout Logs ---
  public getWorkoutLogs() {
    return this.data.workoutLogs;
  }

  public getWorkoutLogsByUserId(userId: string) {
    return this.data.workoutLogs.filter((l) => l.userId === userId);
  }

  public addWorkoutLog(log: WorkoutLog) {
    this.data.workoutLogs.push(log);
    this.save();
    return log;
  }

  // --- Progress Records ---
  public getProgressRecords(userId?: string) {
    if (userId) {
      return this.data.progressRecords.filter((r) => r.userId === userId);
    }
    return this.data.progressRecords;
  }

  public addProgressRecord(record: ProgressRecord) {
    this.data.progressRecords.push(record);
    // Also update current weight on user record
    const user = this.getUserById(record.userId);
    if (user) {
      user.currentWeightKg = record.weightKg;
    }
    this.save();
    return record;
  }

  // --- BMI Records ---
  public getBmiRecords(userId?: string) {
    if (userId) {
      return this.data.bmiRecords.filter((r) => r.userId === userId);
    }
    return this.data.bmiRecords;
  }

  public addBmiRecord(record: BmiRecord) {
    this.data.bmiRecords.push(record);
    const user = this.getUserById(record.userId);
    if (user) {
      user.heightCm = record.heightCm;
      user.currentWeightKg = record.weightKg;
    }
    this.save();
    return record;
  }

  // --- Nutrition Logs ---
  public getNutritionLogs(userId?: string, date?: string) {
    return this.data.nutritionLogs.filter((n) => {
      if (userId && n.userId !== userId) return false;
      if (date && n.date !== date) return false;
      return true;
    });
  }

  public addNutritionLog(log: NutritionLog) {
    this.data.nutritionLogs.push(log);
    this.save();
    return log;
  }

  public deleteNutritionLog(id: string) {
    const idx = this.data.nutritionLogs.findIndex((n) => n.id === id);
    if (idx !== -1) {
      const removed = this.data.nutritionLogs.splice(idx, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  // --- Messages ---
  public getMessagesForUser(userId: string) {
    return this.data.messages.filter((m) => m.senderId === userId || m.receiverId === userId);
  }

  public getConversation(user1Id: string, user2Id: string) {
    return this.data.messages.filter(
      (m) =>
        (m.senderId === user1Id && m.receiverId === user2Id) ||
        (m.senderId === user2Id && m.receiverId === user1Id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public addMessage(msg: Message) {
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  public markMessagesAsRead(senderId: string, receiverId: string) {
    let count = 0;
    this.data.messages.forEach((m) => {
      if (m.senderId === senderId && m.receiverId === receiverId && !m.isRead) {
        m.isRead = true;
        count++;
      }
    });
    if (count > 0) {
      this.save();
    }
    return count;
  }

  // --- Feedback ---
  public getFeedback() {
    return this.data.feedback;
  }

  public addFeedback(fb: Feedback) {
    this.data.feedback.push(fb);
    this.save();
    return fb;
  }

  public updateFeedbackStatus(id: string, status: 'PENDING' | 'REVIEWED' | 'RESOLVED') {
    const fb = this.data.feedback.find((f) => f.id === id);
    if (fb) {
      fb.status = status;
      this.save();
      return fb;
    }
    return null;
  }

  // --- Content Submissions ---
  public getContentSubmissions() {
    return this.data.contentSubmissions;
  }

  public addContentSubmission(sub: ContentSubmission) {
    this.data.contentSubmissions.push(sub);
    this.save();
    return sub;
  }

  public updateContentModeration(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    notes: string,
    reviewerName: string
  ) {
    const item = this.data.contentSubmissions.find((c) => c.id === id);
    if (item) {
      item.status = status;
      item.moderationNotes = notes;
      item.reviewedAt = new Date().toISOString();
      item.reviewerName = reviewerName;
      this.save();
      return item;
    }
    return null;
  }

  // --- Settings ---
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // --- Fitness Goals ---
  public getFitnessGoals(userId?: string) {
    if (!this.data.fitnessGoals) this.data.fitnessGoals = [];
    if (userId) {
      return this.data.fitnessGoals.filter((g) => g.userId === userId);
    }
    return this.data.fitnessGoals;
  }

  public getFitnessGoalById(id: string) {
    if (!this.data.fitnessGoals) this.data.fitnessGoals = [];
    return this.data.fitnessGoals.find((g) => g.id === id);
  }

  public addFitnessGoal(goal: FitnessGoal) {
    if (!this.data.fitnessGoals) this.data.fitnessGoals = [];
    this.data.fitnessGoals.push(goal);
    this.save();
    return goal;
  }

  public updateFitnessGoal(id: string, updates: Partial<FitnessGoal>) {
    if (!this.data.fitnessGoals) this.data.fitnessGoals = [];
    const idx = this.data.fitnessGoals.findIndex((g) => g.id === id);
    if (idx !== -1) {
      this.data.fitnessGoals[idx] = {
        ...this.data.fitnessGoals[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.fitnessGoals[idx];
    }
    return null;
  }

  public deleteFitnessGoal(id: string) {
    if (!this.data.fitnessGoals) this.data.fitnessGoals = [];
    const idx = this.data.fitnessGoals.findIndex((g) => g.id === id);
    if (idx !== -1) {
      const removed = this.data.fitnessGoals.splice(idx, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }
}

export const db = new DatabaseService();
