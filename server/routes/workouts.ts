import { Router, Response } from 'express';
import { db, WorkoutPlan, WorkoutAssignment, WorkoutLog, Exercise } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.ts';

const router = Router();

// GET /api/workouts/exercises - list standard exercise library
router.get('/exercises', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const exercises = db.getExercises();
  res.json(exercises);
});

// POST /api/workouts/exercises - coach or admin can add custom exercises
router.post('/exercises', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, muscleGroup, equipment, description, instructions } = req.body;
  if (!name || !muscleGroup) {
    return res.status(400).json({ error: 'Exercise name and muscle group are required.' });
  }

  const newExercise: Exercise = {
    id: `ex-${Date.now()}`,
    name: name.trim(),
    muscleGroup: muscleGroup.trim(),
    equipment: equipment || 'Bodyweight',
    description: description || '',
    instructions: instructions || '',
  };

  db.addExercise(newExercise);
  res.status(201).json(newExercise);
});

// GET /api/workouts/plans - list all available or coach's plans
router.get('/plans', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let plans = db.getWorkoutPlans();

  if (user.role === 'COACH') {
    // Coach sees plans they authored + public plans
    plans = plans.filter((p) => p.coachId === user.userId || p.isPublished);
  } else if (user.role === 'USER') {
    // Athlete sees published plans
    plans = plans.filter((p) => p.isPublished);
  }

  res.json(plans);
});

// GET /api/workouts/plans/:id - get plan with full routines & exercises
router.get('/plans/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const plan = db.getWorkoutPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Workout plan not found.' });
  }
  res.json(plan);
});

// POST /api/workouts/plans - create new plan (Coach / Admin)
router.post('/plans', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { title, description, difficulty, goal, durationWeeks, routines, isPublished = true } = req.body;

  if (!title || !routines || !Array.isArray(routines) || routines.length === 0) {
    return res.status(400).json({ error: 'Title and at least one workout routine are required.' });
  }

  const coach = db.getUserById(req.user!.userId);
  const newPlan: WorkoutPlan = {
    id: `plan-${Date.now()}`,
    coachId: req.user!.userId,
    coachName: coach ? coach.name : 'PulseFit Coach',
    title: title.trim(),
    description: description || '',
    difficulty: difficulty || 'INTERMEDIATE',
    goal: goal || 'General Fitness',
    durationWeeks: Number(durationWeeks) || 6,
    routines: routines.map((r: any, idx: number) => ({
      id: r.id || `rout-${Date.now()}-${idx}`,
      title: r.title || `Day ${idx + 1}`,
      dayNumber: idx + 1,
      dayLabel: r.dayLabel || `Day ${idx + 1} Routine`,
      description: r.description || '',
      exercises: (r.exercises || []).map((e: any, eIdx: number) => ({
        id: e.id || `we-${Date.now()}-${eIdx}`,
        exerciseId: e.exerciseId || `ex-custom-${eIdx}`,
        exerciseName: e.exerciseName || 'Exercise',
        muscleGroup: e.muscleGroup || 'Full Body',
        sets: Number(e.sets) || 3,
        reps: Number(e.reps) || 10,
        targetWeightKg: e.targetWeightKg ? Number(e.targetWeightKg) : 0,
        durationSeconds: e.durationSeconds ? Number(e.durationSeconds) : undefined,
        restSeconds: Number(e.restSeconds) || 60,
        notes: e.notes || '',
      })),
    })),
    isPublished: Boolean(isPublished),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addWorkoutPlan(newPlan);
  res.status(201).json(newPlan);
});

// PUT /api/workouts/plans/:id - update existing plan
router.put('/plans/:id', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const plan = db.getWorkoutPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Workout plan not found.' });
  }

  // Ensure coach owns this plan or is admin
  if (req.user!.role !== 'ADMIN' && plan.coachId !== req.user!.userId) {
    return res.status(403).json({ error: 'You can only edit workout plans created by you.' });
  }

  const { title, description, difficulty, goal, durationWeeks, routines, isPublished } = req.body;
  const updates: Partial<WorkoutPlan> = {};

  if (title) updates.title = title.trim();
  if (description !== undefined) updates.description = description;
  if (difficulty) updates.difficulty = difficulty;
  if (goal) updates.goal = goal;
  if (durationWeeks !== undefined) updates.durationWeeks = Number(durationWeeks);
  if (isPublished !== undefined) updates.isPublished = Boolean(isPublished);
  if (routines && Array.isArray(routines)) {
    updates.routines = routines.map((r: any, idx: number) => ({
      id: r.id || `rout-${Date.now()}-${idx}`,
      title: r.title || `Day ${idx + 1}`,
      dayNumber: idx + 1,
      dayLabel: r.dayLabel || `Day ${idx + 1} Routine`,
      description: r.description || '',
      exercises: (r.exercises || []).map((e: any, eIdx: number) => ({
        id: e.id || `we-${Date.now()}-${eIdx}`,
        exerciseId: e.exerciseId || `ex-custom-${eIdx}`,
        exerciseName: e.exerciseName || 'Exercise',
        muscleGroup: e.muscleGroup || 'Full Body',
        sets: Number(e.sets) || 3,
        reps: Number(e.reps) || 10,
        targetWeightKg: e.targetWeightKg ? Number(e.targetWeightKg) : 0,
        durationSeconds: e.durationSeconds ? Number(e.durationSeconds) : undefined,
        restSeconds: Number(e.restSeconds) || 60,
        notes: e.notes || '',
      })),
    }));
  }

  const updated = db.updateWorkoutPlan(req.params.id, updates);
  res.json(updated);
});

// DELETE /api/workouts/plans/:id - delete plan
router.delete('/plans/:id', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const plan = db.getWorkoutPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Workout plan not found.' });
  }

  if (req.user!.role !== 'ADMIN' && plan.coachId !== req.user!.userId) {
    return res.status(403).json({ error: 'You can only delete plans that you created.' });
  }

  db.deleteWorkoutPlan(req.params.id);
  res.json({ message: 'Workout plan removed successfully.' });
});

// GET /api/workouts/my-assigned - athlete active plan & routines
router.get('/my-assigned', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const assignments = db.getAssignmentsByUserId(userId);
  const activeAssignment = assignments.find((a) => a.status === 'ACTIVE') || assignments[0];

  if (!activeAssignment) {
    // If no assignment yet, check if there's any published plan to assign
    const plans = db.getWorkoutPlans().filter((p) => p.isPublished);
    if (plans.length > 0) {
      const defaultPlan = plans[0];
      const user = db.getUserById(userId);
      const newAsg: WorkoutAssignment = {
        id: `asg-${Date.now()}`,
        userId,
        userName: user?.name || 'Athlete',
        planId: defaultPlan.id,
        planTitle: defaultPlan.title,
        coachId: defaultPlan.coachId,
        assignedAt: new Date().toISOString(),
        status: 'ACTIVE',
      };
      db.addAssignment(newAsg);
      return res.json({
        assignment: newAsg,
        plan: defaultPlan,
      });
    }
    return res.json({ assignment: null, plan: null });
  }

  const plan = db.getWorkoutPlanById(activeAssignment.planId);
  res.json({
    assignment: activeAssignment,
    plan: plan || null,
  });
});

// POST /api/workouts/assign - assign plan to a user
router.post('/assign', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { userId, planId } = req.body;
  if (!userId || !planId) {
    return res.status(400).json({ error: 'User ID and Plan ID are required.' });
  }

  const targetUser = db.getUserById(userId);
  if (!targetUser) return res.status(404).json({ error: 'Target athlete not found.' });

  const targetPlan = db.getWorkoutPlanById(planId);
  if (!targetPlan) return res.status(404).json({ error: 'Target workout plan not found.' });

  // Update existing assignments for this user to PAUSED or COMPLETED
  const userAssignments = db.getAssignmentsByUserId(userId);
  userAssignments.forEach((a) => {
    if (a.status === 'ACTIVE') {
      db.updateAssignmentStatus(a.id, 'PAUSED');
    }
  });

  const assignment: WorkoutAssignment = {
    id: `asg-${Date.now()}`,
    userId: targetUser.id,
    userName: targetUser.name,
    planId: targetPlan.id,
    planTitle: targetPlan.title,
    coachId: req.user!.userId,
    assignedAt: new Date().toISOString(),
    status: 'ACTIVE',
  };

  db.addAssignment(assignment);
  res.status(201).json({
    assignment,
    message: `Plan "${targetPlan.title}" assigned to ${targetUser.name}!`,
  });
});

// POST /api/workouts/log-completion - record workout session
router.post('/log-completion', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { planId, routineId, routineTitle, durationMinutes, caloriesBurned, perceivedEffort, notes, exerciseLogs } = req.body;

  if (!routineTitle) {
    return res.status(400).json({ error: 'Routine title is required.' });
  }

  const newLog: WorkoutLog = {
    id: `log-${Date.now()}`,
    userId,
    planId,
    routineId,
    routineTitle,
    completedAt: new Date().toISOString(),
    durationMinutes: Number(durationMinutes) || 45,
    caloriesBurned: Number(caloriesBurned) || 350,
    perceivedEffort: Number(perceivedEffort) || 7,
    notes: notes || 'Completed workout according to plan.',
    exerciseLogs: Array.isArray(exerciseLogs) ? exerciseLogs : [],
  };

  db.addWorkoutLog(newLog);
  res.status(201).json({
    workoutLog: newLog,
    message: 'Workout session recorded successfully! Great work!',
  });
});

// GET /api/workouts/history - get completed workouts
router.get('/history', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = (req.query.userId as string) || req.user!.userId;

  // If coach or admin querying another user, allow; if user querying someone else, disallow
  if (req.user!.role === 'USER' && userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Cannot view workout history of other athletes.' });
  }

  let logs = db.getWorkoutLogsByUserId(userId);

  // Sorting descending by date
  logs = logs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  res.json(logs);
});

export default router;
