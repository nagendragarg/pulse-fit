import { Router, Response } from 'express';
import { db, User } from '../db.ts';
import { generateToken, verifyPassword, hashPassword, authenticateToken, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// Sanitizer helper
export function sanitizeUser(user: User) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// POST /api/auth/login
router.post('/login', (req, res: Response) => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. No account found with this email.' });
  }

  if (user.status === 'INACTIVE') {
    return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
  }

  const isMatch = verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your password.' });
  }

  if (expectedRole && user.role !== expectedRole) {
    const roleNames: Record<string, string> = {
      ADMIN: 'System Administration Portal',
      COACH: 'Certified Coach Portal',
      USER: 'Athlete / Member Portal',
    };
    const targetPortal = roleNames[user.role] || `${user.role} Portal`;
    return res.status(403).json({
      error: `Access Denied: This portal is exclusively for ${roleNames[expectedRole] || expectedRole}. Your account is registered as ${user.role}. Please log in using the ${targetPortal}.`,
      roleMismatch: true,
      actualRole: user.role,
      expectedRole,
    });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: sanitizeUser(user),
    message: `Welcome back, ${user.name}!`,
  });
});

// POST /api/auth/register
router.post('/register', (req, res: Response) => {
  const settings = db.getSettings();
  if (!settings.allowNewRegistrations) {
    return res.status(403).json({ error: 'New user registrations are currently disabled by system administration.' });
  }

  const { name, email, password, role = 'USER', fitnessGoal, heightCm, currentWeightKg, targetWeightKg, coachId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  // Check valid role (clients cannot register directly as ADMIN)
  const assignedRole = role === 'COACH' ? 'COACH' : 'USER';

  // Default coach assignment for new athletes if available
  let assignedCoachId = coachId;
  if (assignedRole === 'USER' && !assignedCoachId) {
    const coaches = db.getUsers().filter(u => u.role === 'COACH' && u.status === 'ACTIVE');
    if (coaches.length > 0) {
      assignedCoachId = coaches[0].id; // Assign first active coach
    }
  }

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role: assignedRole,
    status: 'ACTIVE',
    coachId: assignedCoachId,
    fitnessGoal: fitnessGoal || 'MUSCLE_GAIN',
    heightCm: heightCm ? Number(heightCm) : 175,
    currentWeightKg: currentWeightKg ? Number(currentWeightKg) : 75,
    targetWeightKg: targetWeightKg ? Number(targetWeightKg) : 75,
    createdAt: new Date().toISOString(),
  };

  db.addUser(newUser);

  // If user provided height and weight, record initial BMI
  if (newUser.heightCm && newUser.currentWeightKg) {
    const heightM = newUser.heightCm / 100;
    const bmiVal = Number((newUser.currentWeightKg / (heightM * heightM)).toFixed(1));
    let cat: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity' = 'Normal weight';
    if (bmiVal < 18.5) cat = 'Underweight';
    else if (bmiVal < 25) cat = 'Normal weight';
    else if (bmiVal < 30) cat = 'Overweight';
    else cat = 'Obesity';

    db.addBmiRecord({
      id: `bmi-${Date.now()}`,
      userId: newUser.id,
      date: new Date().toISOString().split('T')[0],
      heightCm: newUser.heightCm,
      weightKg: newUser.currentWeightKg,
      bmiValue: bmiVal,
      category: cat,
      healthRisk: cat === 'Normal weight' ? 'Low health risk' : 'Monitored risk level',
    });

    db.addProgressRecord({
      id: `prog-${Date.now()}`,
      userId: newUser.id,
      date: new Date().toISOString().split('T')[0],
      weightKg: newUser.currentWeightKg,
      notes: 'Initial registration baseline',
    });
  }

  // If assigned a coach, assign the coach's primary plan automatically
  if (assignedRole === 'USER' && assignedCoachId) {
    const plans = db.getWorkoutPlans().filter(p => p.coachId === assignedCoachId && p.isPublished);
    if (plans.length > 0) {
      db.addAssignment({
        id: `asg-${Date.now()}`,
        userId: newUser.id,
        userName: newUser.name,
        planId: plans[0].id,
        planTitle: plans[0].title,
        coachId: assignedCoachId,
        assignedAt: new Date().toISOString(),
        status: 'ACTIVE',
      });
    }
  }

  const token = generateToken(newUser);
  res.status(201).json({
    token,
    user: sanitizeUser(newUser),
    message: 'Account created successfully! Welcome to PulseFit.',
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = db.getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: sanitizeUser(user) });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    // For privacy, still return success message
    return res.json({
      message: 'If an account exists with this email, password reset instructions have been generated.',
    });
  }

  res.json({
    message: `Password reset instructions dispatched. For this demo, your account password can be reset below or you can login using demo credentials.`,
    demoResetToken: `reset-${Math.random().toString(36).substring(2, 9)}`,
    email: user.email,
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Account not found with this email.' });
  }

  db.updateUser(user.id, {
    passwordHash: hashPassword(newPassword),
  });

  res.json({ message: 'Password has been updated successfully. You can now login.' });
});

export default router;
