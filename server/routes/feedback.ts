import { Router, Response } from 'express';
import { db, Feedback } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.ts';

const router = Router();

// POST /api/feedback - submit user feedback
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.user!.userId);
  const { category, rating, comment } = req.body;

  if (!comment || !rating) {
    return res.status(400).json({ error: 'Rating and comment are required.' });
  }

  const newFeedback: Feedback = {
    id: `fb-${Date.now()}`,
    userId: req.user!.userId,
    userName: user ? user.name : req.user!.name,
    userEmail: user ? user.email : req.user!.email,
    category: category || 'APP_FEATURES',
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    comment: comment.trim(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.addFeedback(newFeedback);
  res.status(201).json({
    feedback: newFeedback,
    message: 'Thank you for your feedback! Our team reviews every suggestion.',
  });
});

// GET /api/feedback - (ADMIN only) list all feedback
router.get('/', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { status, category } = req.query;
  let list = db.getFeedback();

  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter((f) => f.status === status);
  }

  if (category && typeof category === 'string' && category !== 'ALL') {
    list = list.filter((f) => f.category === category);
  }

  list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

// PUT /api/feedback/:id/status - (ADMIN only) update feedback status
router.put('/:id/status', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (!status || !['PENDING', 'REVIEWED', 'RESOLVED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be PENDING, REVIEWED, or RESOLVED.' });
  }

  const updated = db.updateFeedbackStatus(req.params.id, status as any);
  if (!updated) {
    return res.status(404).json({ error: 'Feedback record not found.' });
  }

  res.json({
    feedback: updated,
    message: `Feedback marked as ${status}.`,
  });
});

export default router;
