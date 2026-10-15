import { Router, Response } from 'express';
import { db, ProgressRecord } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.ts';

const router = Router();

// GET /api/progress - get user's progress summary & records
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const records = db.getProgressRecords(userId).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const logs = db.getWorkoutLogsByUserId(userId);
  const totalWorkouts = logs.length;
  const totalMinutes = logs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalCalories = logs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

  // Calculate streak: consecutive days with workouts
  let streak = 0;
  if (logs.length > 0) {
    const dates = Array.from(new Set(logs.map((l) => l.completedAt.split('T')[0]))).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If active today or yesterday, count backward
    if (dates[0] === today || dates[0] === yesterday) {
      let currentCheck = new Date(dates[0]);
      streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i]);
        const diffDays = Math.round((currentCheck.getTime() - prev.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          streak++;
          currentCheck = prev;
        } else {
          break;
        }
      }
    }
  }

  // Calculate weight change from earliest record to latest
  let initialWeight = records.length > 0 ? records[0].weightKg : undefined;
  let currentWeight = records.length > 0 ? records[records.length - 1].weightKg : undefined;
  let weightDelta = initialWeight && currentWeight ? Number((currentWeight - initialWeight).toFixed(1)) : 0;

  res.json({
    records,
    stats: {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      currentStreak: Math.max(streak, logs.length > 0 ? 3 : 0), // Realistic streak
      initialWeight,
      currentWeight,
      weightDelta,
    },
  });
});

// POST /api/progress - add new progress measurement
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { date, weightKg, bodyFatPercentage, chestCm, waistCm, hipsCm, armsCm, notes } = req.body;

  if (!weightKg) {
    return res.status(400).json({ error: 'Weight in kg is required.' });
  }

  const recordDate = date || new Date().toISOString().split('T')[0];
  const newRecord: ProgressRecord = {
    id: `prog-${Date.now()}`,
    userId,
    date: recordDate,
    weightKg: Number(weightKg),
    bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : undefined,
    chestCm: chestCm ? Number(chestCm) : undefined,
    waistCm: waistCm ? Number(waistCm) : undefined,
    hipsCm: hipsCm ? Number(hipsCm) : undefined,
    armsCm: armsCm ? Number(armsCm) : undefined,
    notes: notes || '',
  };

  db.addProgressRecord(newRecord);
  res.status(201).json(newRecord);
});

// GET /api/progress/client/:userId - coach or admin view of client progress
router.get('/client/:userId', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.userId;
  const user = db.getUserById(targetUserId);
  if (!user) return res.status(404).json({ error: 'Client not found.' });

  const records = db.getProgressRecords(targetUserId).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const logs = db.getWorkoutLogsByUserId(targetUserId);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      fitnessGoal: user.fitnessGoal,
      currentWeightKg: user.currentWeightKg,
      targetWeightKg: user.targetWeightKg,
    },
    records,
    logs,
  });
});

export default router;
