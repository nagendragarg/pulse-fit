export type UserRole = 'ADMIN' | 'COACH' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  coachId?: string;
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
  muscleGroup: string;
  equipment: string;
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
  videoUrl?: string;
  aiFormCues?: string[];
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  dayNumber: number;
  dayLabel: string;
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
  perceivedEffort: number;
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

export interface DetectedFoodItem {
  name: string;
  estimatedGrams: number;
  portionDesc: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MicronutrientEstimate {
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  potassiumMg: number;
  calciumMg: number;
  ironMg: number;
}

export interface AiFoodDetectionResult {
  dishName: string;
  suggestedMealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  portionSize: string;
  detectedItems: DetectedFoodItem[];
  micronutrients: MicronutrientEstimate;
  dietaryTags: string[];
  glycemicImpact: 'LOW' | 'MODERATE' | 'HIGH';
  healthScore: number;
  confidenceScore: number;
  coachingFeedback: string;
}

export interface NutritionSummary {
  date: string;
  logs: NutritionLog[];
  summary: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    targets: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    macroPercentages: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  weeklyTrend: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
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

export interface ContactItem {
  contact: User;
  latestMessage: Message | null;
  unreadCount: number;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: 'COACHING' | 'APP_FEATURES' | 'WORKOUT_CONTENT' | 'BUG_REPORT' | 'OTHER';
  rating: number;
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

export interface FitnessGoalsSummary {
  goals: FitnessGoal[];
  stats: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    targetWeightGoal: FitnessGoal | null;
    strengthGoalsCount: number;
    nearestTargetDate: string | null;
    daysToNearestDeadline: number | null;
  };
}
