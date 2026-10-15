import { Router, Response } from 'express';
import { db, UserRole, UserStatus } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, requireRole, hashPassword } from '../auth.ts';
import { sanitizeUser } from './auth.ts';

const router = Router();

// Ensure only ADMIN can access these routes
router.use(authenticateToken, requireRole('ADMIN'));

// GET /api/admin/stats - high-level platform analytics
router.get('/stats', (req: AuthenticatedRequest, res: Response) => {
  const allUsers = db.getUsers();
  const allPlans = db.getWorkoutPlans();
  const allLogs = db.getWorkoutLogs();
  const allFeedback = db.getFeedback();
  const allSubmissions = db.getContentSubmissions();

  const totalUsers = allUsers.filter((u) => u.role === 'USER').length;
  const totalCoaches = allUsers.filter((u) => u.role === 'COACH').length;
  const totalAdmins = allUsers.filter((u) => u.role === 'ADMIN').length;
  const activeUsers = allUsers.filter((u) => u.status === 'ACTIVE').length;

  const pendingModeration = allSubmissions.filter((s) => s.status === 'PENDING').length;
  const pendingFeedback = allFeedback.filter((f) => f.status === 'PENDING').length;

  // Monthly user registration simulation/breakdown
  const registrationsByMonth = [
    { month: 'Nov 2025', count: 4 },
    { month: 'Dec 2025', count: 7 },
    { month: 'Jan 2026', count: 12 },
    { month: 'Feb 2026', count: allUsers.length },
  ];

  // Activity distribution
  const activityDistribution = [
    { category: 'Hypertrophy & Strength', value: 48 },
    { category: 'Cardio & Conditioning', value: 26 },
    { category: 'Mobility & Recovery', value: 16 },
    { category: 'General Fitness', value: 10 },
  ];

  res.json({
    kpis: {
      totalUsers,
      totalCoaches,
      totalAdmins,
      activeUsers,
      totalPlans: allPlans.length,
      totalWorkoutsCompleted: allLogs.length,
      pendingModeration,
      pendingFeedback,
    },
    registrationsByMonth,
    activityDistribution,
  });
});

// GET /api/admin/users - list users with search & filters
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const { search, role, status } = req.query;
  let users = db.getUsers();

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  if (role && typeof role === 'string' && role !== 'ALL') {
    users = users.filter((u) => u.role === role);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    users = users.filter((u) => u.status === status);
  }

  res.json(users.map(sanitizeUser));
});

// POST /api/admin/users - create new user
router.post('/users', (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, status = 'ACTIVE', bio, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists.' });
  }

  const newUser = db.addUser({
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role: (role as UserRole) || 'USER',
    status: (status as UserStatus) || 'ACTIVE',
    bio: bio || '',
    phone: phone || '',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(sanitizeUser(newUser));
});

// PUT /api/admin/users/:id/status - toggle active / inactive status
router.put('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ACTIVE or INACTIVE.' });
  }

  if (req.params.id === req.user!.userId) {
    return res.status(400).json({ error: 'You cannot change your own admin account status.' });
  }

  const updated = db.updateUser(req.params.id, { status: status as UserStatus });
  if (!updated) return res.status(404).json({ error: 'User not found.' });

  res.json({
    user: sanitizeUser(updated),
    message: `User status changed to ${status}.`,
  });
});

// PUT /api/admin/users/:id/role - promote or reassign role
router.put('/users/:id/role', (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  if (!role || !['ADMIN', 'COACH', 'USER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  if (req.params.id === req.user!.userId) {
    return res.status(400).json({ error: 'You cannot alter your own admin privileges.' });
  }

  const updated = db.updateUser(req.params.id, { role: role as UserRole });
  if (!updated) return res.status(404).json({ error: 'User not found.' });

  res.json({
    user: sanitizeUser(updated),
    message: `User role modified to ${role}.`,
  });
});

// DELETE /api/admin/users/:id - delete user
router.delete('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  if (req.params.id === req.user!.userId) {
    return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  }

  const deleted = db.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found.' });

  res.json({ message: `Account for ${deleted.name} (${deleted.email}) has been permanently deleted.` });
});

export default router;
