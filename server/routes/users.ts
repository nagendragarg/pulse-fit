import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, verifyPassword, hashPassword } from '../auth.ts';
import { sanitizeUser } from './auth.ts';

const router = Router();

// GET /api/users/profile
router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // If role is USER and has a coachId, attach coach info
  let coachInfo = null;
  if (user.coachId) {
    const coach = db.getUserById(user.coachId);
    if (coach) {
      coachInfo = sanitizeUser(coach);
    }
  }

  res.json({
    user: sanitizeUser(user),
    coach: coachInfo,
  });
});

// PUT /api/users/profile
router.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const {
    name,
    phone,
    bio,
    avatarUrl,
    fitnessGoal,
    activityLevel,
    heightCm,
    currentWeightKg,
    targetWeightKg,
  } = req.body;

  const updates: any = {};
  if (name) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (fitnessGoal) updates.fitnessGoal = fitnessGoal;
  if (activityLevel) updates.activityLevel = activityLevel;
  if (heightCm !== undefined) updates.heightCm = Number(heightCm);
  if (currentWeightKg !== undefined) updates.currentWeightKg = Number(currentWeightKg);
  if (targetWeightKg !== undefined) updates.targetWeightKg = Number(targetWeightKg);

  const updated = db.updateUser(userId, updates);
  if (!updated) return res.status(404).json({ error: 'User not found' });

  // Sync with user's target weight fitness goal if present
  if (currentWeightKg !== undefined || targetWeightKg !== undefined) {
    try {
      const userGoals = db.getFitnessGoals(userId);
      const weightGoal = userGoals.find((g) => g.type === 'WEIGHT');
      if (weightGoal) {
        db.updateFitnessGoal(weightGoal.id, {
          ...(currentWeightKg !== undefined ? { currentValue: Number(currentWeightKg) } : {}),
          ...(targetWeightKg !== undefined ? { targetValue: Number(targetWeightKg) } : {}),
        });
      }
    } catch (e) {
      console.warn('Could not sync fitness weight goal on profile update:', e);
    }
  }

  res.json({
    user: sanitizeUser(updated),
    message: 'Profile updated successfully!',
  });
});

// PUT /api/users/change-password
router.put('/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = verifyPassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password does not match.' });
  }

  db.updateUser(userId, {
    passwordHash: hashPassword(newPassword),
  });

  res.json({ message: 'Password updated successfully!' });
});

// GET /api/users/coaches
router.get('/coaches', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const coaches = db.getUsers()
    .filter((u) => u.role === 'COACH' && u.status === 'ACTIVE')
    .map(sanitizeUser);

  res.json(coaches);
});

// PUT /api/users/assign-coach
router.put('/assign-coach', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { coachId } = req.body;

  if (!coachId) {
    return res.status(400).json({ error: 'Coach ID is required.' });
  }

  const coach = db.getUserById(coachId);
  if (!coach || coach.role !== 'COACH' || coach.status !== 'ACTIVE') {
    return res.status(404).json({ error: 'Selected coach is not available.' });
  }

  db.updateUser(userId, { coachId });

  // Also check if coach has plans, assign the first published one
  const plans = db.getWorkoutPlans().filter((p) => p.coachId === coachId && p.isPublished);
  if (plans.length > 0) {
    // Check if assignment already exists
    const existing = db.getAssignmentsByUserId(userId).find((a) => a.planId === plans[0].id);
    if (!existing) {
      const user = db.getUserById(userId);
      db.addAssignment({
        id: `asg-${Date.now()}`,
        userId,
        userName: user?.name || 'Athlete',
        planId: plans[0].id,
        planTitle: plans[0].title,
        coachId,
        assignedAt: new Date().toISOString(),
        status: 'ACTIVE',
      });
    }
  }

  res.json({ message: `Successfully connected with Coach ${coach.name}!` });
});

export default router;
