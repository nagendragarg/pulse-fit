import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.ts';

const router = Router();

// GET /api/settings - get public or admin platform settings
router.get('/', (req, res: Response) => {
  const settings = db.getSettings();
  res.json(settings);
});

// PUT /api/settings - (ADMIN only) update system settings
router.put('/', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body;
  const updated = db.updateSettings(updates);
  res.json({
    settings: updated,
    message: 'System settings updated successfully.',
  });
});

export default router;
