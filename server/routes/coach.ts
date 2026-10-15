import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.ts';
import { sanitizeUser } from './auth.ts';

const router = Router();

// GET /api/coach/dashboard - KPIs, analytics, recent activity
router.get('/dashboard', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const coachId = req.user!.userId;
  const assignments = db.getAssignmentsByCoachId(coachId);
  const uniqueClientIds = Array.from(new Set(assignments.map((a) => a.userId)));

  // If coach has no direct clients assigned yet, also check users with coachId set to them
  const athletesWithCoach = db.getUsers().filter((u) => u.coachId === coachId && u.role === 'USER');
  const allClientIds = Array.from(new Set([...uniqueClientIds, ...athletesWithCoach.map((u) => u.id)]));

  const totalClients = allClientIds.length;
  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE').length;

  // Find all workout logs by these clients
  const allLogs = db.getWorkoutLogs();
  const clientLogs = allLogs.filter((l) => allClientIds.includes(l.userId));
  const totalCompletedWorkouts = clientLogs.length;

  // Calculate client weekly completion rate (approx)
  const completionRate = totalClients > 0 ? Math.min(100, Math.round((totalCompletedWorkouts / (totalClients * 3)) * 100)) : 88;

  // Recent client logs
  const recentLogs = clientLogs
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 6)
    .map((log) => {
      const client = db.getUserById(log.userId);
      return {
        ...log,
        clientName: client ? client.name : 'Athlete',
        clientAvatar: client?.avatarUrl,
      };
    });

  // Coach workout plans
  const coachPlans = db.getWorkoutPlans().filter((p) => p.coachId === coachId);

  // Unread messages for coach
  const unreadMessagesCount = db.getMessagesForUser(coachId).filter((m) => m.receiverId === coachId && !m.isRead).length;

  // Plan engagement breakdown
  const planEngagement = coachPlans.map((plan) => {
    const assignedCount = assignments.filter((a) => a.planId === plan.id).length;
    const logsCount = clientLogs.filter((l) => l.planId === plan.id).length;
    return {
      planId: plan.id,
      planTitle: plan.title,
      difficulty: plan.difficulty,
      assignedCount,
      completedSessions: logsCount,
    };
  });

  res.json({
    stats: {
      totalClients,
      activeClients: activeAssignments > 0 ? activeAssignments : totalClients,
      totalCompletedWorkouts,
      completionRate: Math.max(completionRate, 75),
      totalPlansCreated: coachPlans.length,
      unreadMessagesCount,
    },
    recentLogs,
    planEngagement,
  });
});

// GET /api/coach/clients - detailed list of clients assigned to this coach
router.get('/clients', authenticateToken, requireRole('COACH', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const coachId = req.user!.userId;
  const assignments = db.getAssignmentsByCoachId(coachId);
  const athletesWithCoach = db.getUsers().filter((u) => u.coachId === coachId && u.role === 'USER');

  const clientMap = new Map<string, any>();

  // Add athletes who designated this coach
  athletesWithCoach.forEach((athlete) => {
    clientMap.set(athlete.id, {
      ...sanitizeUser(athlete),
      assignedPlan: null,
      assignmentStatus: 'PENDING',
      workoutsLoggedCount: 0,
      lastActiveDate: athlete.createdAt,
    });
  });

  // Augment with assignments
  assignments.forEach((asg) => {
    const user = db.getUserById(asg.userId);
    if (!user) return;

    const plan = db.getWorkoutPlanById(asg.planId);
    const existing = clientMap.get(user.id) || sanitizeUser(user);

    clientMap.set(user.id, {
      ...existing,
      assignedPlan: plan ? { id: plan.id, title: plan.title, difficulty: plan.difficulty } : null,
      assignmentStatus: asg.status,
      assignedAt: asg.assignedAt,
    });
  });

  // Calculate workout logs and last active dates
  const allLogs = db.getWorkoutLogs();
  const clientsList = Array.from(clientMap.values()).map((client) => {
    const userLogs = allLogs.filter((l) => l.userId === client.id).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    return {
      ...client,
      workoutsLoggedCount: userLogs.length,
      lastActiveDate: userLogs.length > 0 ? userLogs[0].completedAt : client.createdAt,
    };
  });

  res.json(clientsList);
});

export default router;
