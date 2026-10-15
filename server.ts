import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRouter from './server/routes/auth.ts';
import usersRouter from './server/routes/users.ts';
import workoutsRouter from './server/routes/workouts.ts';
import progressRouter from './server/routes/progress.ts';
import nutritionRouter from './server/routes/nutrition.ts';
import bmiRouter from './server/routes/bmi.ts';
import messagesRouter from './server/routes/messages.ts';
import coachRouter from './server/routes/coach.ts';
import adminRouter from './server/routes/admin.ts';
import contentRouter from './server/routes/content.ts';
import feedbackRouter from './server/routes/feedback.ts';
import settingsRouter from './server/routes/settings.ts';
import goalsRouter from './server/routes/goals.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Mount API router modules
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/workouts', workoutsRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/nutrition', nutritionRouter);
  app.use('/api/bmi', bmiRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/coach', coachRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/feedback', feedbackRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/goals', goalsRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'PulseFit Coaching SaaS', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[PulseFit] Vite dev middlewares mounted successfully.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PulseFit] Full-stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PulseFit] Failed to start server:', err);
  process.exit(1);
});
