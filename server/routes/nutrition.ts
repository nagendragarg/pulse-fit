import { Router, Response } from 'express';
import { db, NutritionLog } from '../db.ts';
import { authenticateToken, AuthenticatedRequest } from '../auth.ts';
import { detectFoodNutrients, estimateNutrientsFallback } from '../services/gemini.ts';

const router = Router();

// GET /api/nutrition - get logs for a given date (defaults to today) + daily analytics
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const user = db.getUserById(userId);
  const logs = db.getNutritionLogs(userId, targetDate);

  // Calculate totals for targetDate
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  logs.forEach((item) => {
    totalCalories += item.calories;
    totalProtein += item.proteinG;
    totalCarbs += item.carbsG;
    totalFat += item.fatG;
  });

  // Calculate dynamic target based on user fitness goal and current weight
  const weight = user?.currentWeightKg || 75;
  let targetCalories = 2400;
  let targetProtein = Math.round(weight * 2.0); // 2g per kg
  let targetCarbs = 260;
  let targetFat = 65;

  if (user?.fitnessGoal === 'WEIGHT_LOSS') {
    targetCalories = 2000;
    targetCarbs = 180;
    targetFat = 55;
  } else if (user?.fitnessGoal === 'MUSCLE_GAIN') {
    targetCalories = 2800;
    targetCarbs = 340;
    targetFat = 75;
  }

  // Calculate weekly trend for charts (past 7 days)
  const allUserLogs = db.getNutritionLogs(userId);
  const past7Days: { date: string; calories: number; protein: number; carbs: number; fat: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const dayLogs = allUserLogs.filter((l) => l.date === d);
    past7Days.push({
      date: d,
      calories: dayLogs.reduce((acc, c) => acc + c.calories, 0),
      protein: dayLogs.reduce((acc, c) => acc + c.proteinG, 0),
      carbs: dayLogs.reduce((acc, c) => acc + c.carbsG, 0),
      fat: dayLogs.reduce((acc, c) => acc + c.fatG, 0),
    });
  }

  res.json({
    date: targetDate,
    logs,
    summary: {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      targets: {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
      },
      macroPercentages: {
        protein: totalCalories > 0 ? Math.round(((totalProtein * 4) / totalCalories) * 100) : 0,
        carbs: totalCalories > 0 ? Math.round(((totalCarbs * 4) / totalCalories) * 100) : 0,
        fat: totalCalories > 0 ? Math.round(((totalFat * 9) / totalCalories) * 100) : 0,
      },
    },
    weeklyTrend: past7Days,
  });
});

// POST /api/nutrition - log a new food item
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { date, mealType, foodName, calories, proteinG, carbsG, fatG, portionSize } = req.body;

  if (!foodName || calories === undefined) {
    return res.status(400).json({ error: 'Food name and calories are required.' });
  }

  const logDate = date || new Date().toISOString().split('T')[0];
  const newLog: NutritionLog = {
    id: `nut-${Date.now()}`,
    userId,
    date: logDate,
    mealType: mealType || 'SNACK',
    foodName: foodName.trim(),
    calories: Number(calories) || 0,
    proteinG: Number(proteinG) || 0,
    carbsG: Number(carbsG) || 0,
    fatG: Number(fatG) || 0,
    portionSize: portionSize || '1 serving',
  };

  db.addNutritionLog(newLog);
  res.status(201).json(newLog);
});

// DELETE /api/nutrition/:id - delete meal item
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const removed = db.deleteNutritionLog(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Meal entry not found.' });
  }
  res.json({ message: 'Meal entry deleted.' });
});

// POST /api/nutrition/ai-detect - Automatically detect foods & calculate nutrients via Gemini 3.8 Flash
router.post('/ai-detect', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = db.getUserById(userId);
  const userGoal = user?.fitnessGoal || 'GENERAL_FITNESS';

  try {
    const { imageBase64, mimeType, textDescription } = req.body;

    if (!imageBase64 && (!textDescription || !textDescription.trim())) {
      return res.status(400).json({
        error: 'Please provide either a food photo/image or a description of your meal.',
      });
    }

    const detectionResult = await detectFoodNutrients({
      imageBase64,
      mimeType,
      textDescription: textDescription?.trim(),
      userGoal,
    });

    res.json(detectionResult);
  } catch (_err: any) {
    const fallbackResult = estimateNutrientsFallback(
      req.body?.textDescription || 'Athletic Nutrition Plate',
      userGoal
    );
    res.json(fallbackResult);
  }
});

export default router;
