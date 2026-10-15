import { Router, Response } from 'express';
import { db, ContentSubmission } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.ts';

const router = Router();

// GET /api/content - get public/approved content feed
router.get('/', (req, res: Response) => {
  const approved = db.getContentSubmissions()
    .filter((c) => c.status === 'APPROVED')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  res.json(approved);
});

// GET /api/content/all - (ADMIN only) get all content submissions (including pending & rejected)
router.get('/all', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { status, type } = req.query;
  let items = db.getContentSubmissions();

  if (status && typeof status === 'string' && status !== 'ALL') {
    items = items.filter((i) => i.status === status);
  }

  if (type && typeof type === 'string' && type !== 'ALL') {
    items = items.filter((i) => i.type === type);
  }

  items = items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  res.json(items);
});

// POST /api/content - submit content (Athlete or Coach)
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.user!.userId);
  const settings = db.getSettings();
  const { title, type, content, imageUrl } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  // If settings do not require moderation, auto-approve
  const initialStatus = settings.requireContentModeration ? 'PENDING' : 'APPROVED';

  const newSubmission: ContentSubmission = {
    id: `cnt-${Date.now()}`,
    title: title.trim(),
    type: type || 'COMMUNITY_POST',
    authorId: req.user!.userId,
    authorName: user ? user.name : req.user!.name,
    authorRole: req.user!.role,
    content: content.trim(),
    imageUrl: imageUrl || undefined,
    status: initialStatus,
    moderationNotes: initialStatus === 'APPROVED' ? 'Auto-approved by platform rule' : undefined,
    submittedAt: new Date().toISOString(),
  };

  db.addContentSubmission(newSubmission);
  res.status(201).json({
    item: newSubmission,
    message:
      initialStatus === 'PENDING'
        ? 'Content submitted for review. It will appear publicly once approved by platform moderation.'
        : 'Content published successfully!',
  });
});

// PUT /api/content/:id/moderate - (ADMIN only) approve or reject
router.put('/:id/moderate', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { status, moderationNotes } = req.body;
  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be APPROVED or REJECTED.' });
  }

  const updated = db.updateContentModeration(
    req.params.id,
    status,
    moderationNotes || (status === 'APPROVED' ? 'Approved by Admin' : 'Rejected due to community guidelines'),
    req.user!.name
  );

  if (!updated) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  res.json({
    item: updated,
    message: `Content has been ${status.toLowerCase()} successfully.`,
  });
});

export default router;
