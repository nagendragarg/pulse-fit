import { Router, Response } from 'express';
import { db, FitnessGoal, GoalCategory } from '../db.ts';
import { authenticateToken, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// Helper to compute summary stats
function computeGoalsSummary(goals: FitnessGoal[]) {
  const activeGoals = goals.filter((g) => g.status === 'IN_PROGRESS');
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');
  const targetWeightGoal = goals.find((g) => g.type === 'WEIGHT' && g.status === 'IN_PROGRESS') ||
    goals.find((g) => g.type === 'WEIGHT') || null;
  const strengthGoals = goals.filter((g) => g.type === 'STRENGTH');

  // Find nearest upcoming deadline among active goals
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nearestTargetDate: string | null = null;
  let minDiffDays: number | null = null;

  activeGoals.forEach((goal) => {
    if (goal.targetDate) {
      const gDate = new Date(goal.targetDate);
      gDate.setHours(0, 0, 0, 0);
      const diffMs = gDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (minDiffDays === null || (diffDays >= 0 && (minDiffDays < 0 || diffDays < minDiffDays))) {
        minDiffDays = diffDays;
        nearestTargetDate = goal.targetDate;
      }
    }
  });

  return {
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    targetWeightGoal,
    strengthGoalsCount: strengthGoals.length,
    nearestTargetDate,
    daysToNearestDeadline: minDiffDays,
  };
}

// GET /api/goals - list athlete's fitness and strength goals
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const goals = db.getFitnessGoals(userId).sort((a, b) => {
    // Active first
    if (a.status !== b.status) {
      return a.status === 'IN_PROGRESS' ? -1 : 1;
    }
    // Then sorted by target completion date
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });

  const stats = computeGoalsSummary(goals);

  res.json({
    goals,
    stats,
  });
});

// POST /api/goals - create a new fitness or strength goal
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const {
    type,
    title,
    exerciseName,
    category,
    startValue,
    currentValue,
    targetValue,
    unit = 'kg',
    targetReps,
    targetDate,
    notes,
  } = req.body;

  if (!type || !['WEIGHT', 'STRENGTH'].includes(type)) {
    return res.status(400).json({ error: 'Goal type must be WEIGHT or STRENGTH.' });
  }

  if (!targetValue || isNaN(Number(targetValue))) {
    return res.status(400).json({ error: 'Valid target value is required.' });
  }

  if (!targetDate) {
    return res.status(400).json({ error: 'Target completion date is required.' });
  }

  const startVal = startValue !== undefined && !isNaN(Number(startValue)) ? Number(startValue) : Number(currentValue || targetValue);
  const currentVal = currentValue !== undefined && !isNaN(Number(currentValue)) ? Number(currentValue) : startVal;
  const targetVal = Number(targetValue);

  const goalTitle = title?.trim() || (type === 'WEIGHT' ? 'Target Body Weight' : exerciseName?.trim() || 'Strength Goal');

  const now = new Date().toISOString();
  const isAlreadyMet = type === 'STRENGTH' ? currentVal >= targetVal : false;

  const newGoal: FitnessGoal = {
    id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    type,
    title: goalTitle,
    exerciseName: type === 'STRENGTH' ? (exerciseName?.trim() || goalTitle) : undefined,
    category: (category as GoalCategory) || (type === 'STRENGTH' ? 'OTHER' : undefined),
    startValue: startVal,
    currentValue: currentVal,
    targetValue: targetVal,
    unit: unit === 'lbs' ? 'lbs' : 'kg',
    targetReps: targetReps ? Number(targetReps) : (type === 'STRENGTH' ? 1 : undefined),
    targetDate: targetDate.split('T')[0],
    status: isAlreadyMet ? 'COMPLETED' : 'IN_PROGRESS',
    completedAt: isAlreadyMet ? now : undefined,
    notes: notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  db.addFitnessGoal(newGoal);

  // If this is a weight goal, synchronize with user profile
  if (type === 'WEIGHT') {
    const user = db.getUserById(userId);
    if (user) {
      db.updateUser(userId, {
        targetWeightKg: targetVal,
        currentWeightKg: currentVal,
      });
    }
  }

  res.status(201).json(newGoal);
});

// PUT /api/goals/:id - update existing goal
router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  const existing = db.getFitnessGoalById(goalId);
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const {
    title,
    exerciseName,
    category,
    startValue,
    currentValue,
    targetValue,
    unit,
    targetReps,
    targetDate,
    status,
    notes,
  } = req.body;

  const updates: Partial<FitnessGoal> = {};

  if (title) updates.title = title.trim();
  if (exerciseName !== undefined) updates.exerciseName = exerciseName.trim();
  if (category) updates.category = category as GoalCategory;
  if (startValue !== undefined) updates.startValue = Number(startValue);
  if (currentValue !== undefined) updates.currentValue = Number(currentValue);
  if (targetValue !== undefined) updates.targetValue = Number(targetValue);
  if (unit) updates.unit = unit === 'lbs' ? 'lbs' : 'kg';
  if (targetReps !== undefined) updates.targetReps = Number(targetReps);
  if (targetDate) updates.targetDate = targetDate.split('T')[0];
  if (notes !== undefined) updates.notes = notes.trim();

  // Handle status and completion date
  if (status) {
    updates.status = status;
    if (status === 'COMPLETED' && !existing.completedAt) {
      updates.completedAt = new Date().toISOString();
    } else if (status === 'IN_PROGRESS') {
      updates.completedAt = undefined;
    }
  }

  const updated = db.updateFitnessGoal(goalId, updates);

  // If updating weight goal, sync user profile
  if (existing.type === 'WEIGHT') {
    const userUpdates: any = {};
    if (updates.targetValue !== undefined) userUpdates.targetWeightKg = updates.targetValue;
    if (updates.currentValue !== undefined) userUpdates.currentWeightKg = updates.currentValue;
    if (Object.keys(userUpdates).length > 0) {
      db.updateUser(userId, userUpdates);
    }
  }

  res.json(updated);
});

// PATCH /api/goals/:id/log-progress - quick update for current value & notes
router.patch('/:id/log-progress', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  const existing = db.getFitnessGoalById(goalId);
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const { currentValue, notes, markCompleted } = req.body;
  if (currentValue === undefined || isNaN(Number(currentValue))) {
    return res.status(400).json({ error: 'Valid current value is required.' });
  }

  const newCurrent = Number(currentValue);
  const now = new Date().toISOString();

  const isMet = markCompleted !== undefined ? Boolean(markCompleted) : (newCurrent >= existing.targetValue);
  const updates: Partial<FitnessGoal> = {
    currentValue: newCurrent,
    status: isMet ? 'COMPLETED' : existing.status,
    completedAt: isMet ? (existing.completedAt || now) : undefined,
  };

  if (notes) {
    updates.notes = notes.trim();
  }

  const updated = db.updateFitnessGoal(goalId, updates);

  // If weight goal, update user currentWeight and log progress
  if (existing.type === 'WEIGHT') {
    db.updateUser(userId, { currentWeightKg: newCurrent });
    db.addProgressRecord({
      id: `prog-${Date.now()}`,
      userId,
      date: new Date().toISOString().split('T')[0],
      weightKg: newCurrent,
      notes: notes || 'Updated via Fitness Goals tracker',
    });
  }

  res.json(updated);
});

// PATCH /api/goals/:id/toggle - toggle completion status
router.patch('/:id/toggle', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  const existing = db.getFitnessGoalById(goalId);
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const isNowCompleted = existing.status !== 'COMPLETED';
  const updated = db.updateFitnessGoal(goalId, {
    status: isNowCompleted ? 'COMPLETED' : 'IN_PROGRESS',
    completedAt: isNowCompleted ? new Date().toISOString() : undefined,
  });

  res.json(updated);
});

// DELETE /api/goals/:id - remove goal
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  const existing = db.getFitnessGoalById(goalId);
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  db.deleteFitnessGoal(goalId);
  res.json({ success: true, message: 'Goal removed successfully.' });
});

// PUT /api/goals/target-weight - quick helper to sync athlete's target weight and deadline
router.put('/target-weight', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { targetWeightKg, currentWeightKg, targetDate, notes } = req.body;

  if (!targetWeightKg || isNaN(Number(targetWeightKg))) {
    return res.status(400).json({ error: 'Target weight in kg is required.' });
  }

  const targetVal = Number(targetWeightKg);
  const currentVal = currentWeightKg ? Number(currentWeightKg) : undefined;
  const tDate = targetDate ? targetDate.split('T')[0] : new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];

  // Find or create weight goal
  const goals = db.getFitnessGoals(userId);
  const existingWeightGoal = goals.find((g) => g.type === 'WEIGHT');

  let resultGoal: FitnessGoal;

  if (existingWeightGoal) {
    const updates: Partial<FitnessGoal> = {
      targetValue: targetVal,
      targetDate: tDate,
    };
    if (currentVal !== undefined) updates.currentValue = currentVal;
    if (notes !== undefined) updates.notes = notes.trim();
    resultGoal = db.updateFitnessGoal(existingWeightGoal.id, updates)!;
  } else {
    const now = new Date().toISOString();
    resultGoal = db.addFitnessGoal({
      id: `goal-weight-${Date.now()}`,
      userId,
      type: 'WEIGHT',
      title: 'Target Body Weight',
      startValue: currentVal || targetVal,
      currentValue: currentVal || targetVal,
      targetValue: targetVal,
      unit: 'kg',
      targetDate: tDate,
      status: 'IN_PROGRESS',
      notes: notes || 'Target body weight goal',
      createdAt: now,
      updatedAt: now,
    });
  }

  // Sync to user profile
  const userUpdates: any = { targetWeightKg: targetVal };
  if (currentVal !== undefined) userUpdates.currentWeightKg = currentVal;
  db.updateUser(userId, userUpdates);

  res.json(resultGoal);
});

export default router;
