import { Router, Response } from 'express';
import { db, BmiRecord } from '../db.ts';
import { authenticateToken, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// Helper to evaluate BMI metrics
function evaluateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  const bmiValue = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity' = 'Normal weight';
  let healthRisk = 'Low risk. Balanced weight for optimal metabolic health.';

  if (bmiValue < 18.5) {
    category = 'Underweight';
    healthRisk = 'Increased risk of nutritional deficiency and bone mineral loss. Muscle growth focus advised.';
  } else if (bmiValue < 25) {
    category = 'Normal weight';
    healthRisk = 'Optimal healthy weight. Maintain progressive resistance training.';
  } else if (bmiValue < 30) {
    category = 'Overweight';
    healthRisk = 'Moderate cardiovascular risk. Focus on steady caloric balance and conditioning.';
  } else {
    category = 'Obesity';
    healthRisk = 'High risk of insulin resistance and joint strain. Gradual fat loss program recommended.';
  }

  // Ideal weight range based on normal BMI (18.5 to 24.9)
  const minHealthyWeightKg = Number((18.5 * heightM * heightM).toFixed(1));
  const maxHealthyWeightKg = Number((24.9 * heightM * heightM).toFixed(1));

  return {
    bmiValue,
    category,
    healthRisk,
    healthyRange: {
      minKg: minHealthyWeightKg,
      maxKg: maxHealthyWeightKg,
    },
  };
}

// POST /api/bmi/calculate - calculate & optionally persist
router.post('/calculate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { heightCm, weightKg, saveRecord = false, date } = req.body;

  if (!heightCm || !weightKg) {
    return res.status(400).json({ error: 'Height (cm) and Weight (kg) are required.' });
  }

  const h = Number(heightCm);
  const w = Number(weightKg);

  if (h <= 50 || h >= 260 || w <= 20 || w >= 350) {
    return res.status(400).json({ error: 'Please provide realistic human height and weight values.' });
  }

  const evaluation = evaluateBmi(h, w);

  let savedRecord: BmiRecord | null = null;
  if (saveRecord) {
    savedRecord = {
      id: `bmi-${Date.now()}`,
      userId,
      date: date || new Date().toISOString().split('T')[0],
      heightCm: h,
      weightKg: w,
      bmiValue: evaluation.bmiValue,
      category: evaluation.category,
      healthRisk: evaluation.healthRisk,
    };
    db.addBmiRecord(savedRecord);
  }

  res.json({
    heightCm: h,
    weightKg: w,
    ...evaluation,
    savedRecord,
  });
});

// GET /api/bmi/history - get user's past BMI records
router.get('/history', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const records = db.getBmiRecords(userId).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const user = db.getUserById(userId);
  const currentHeight = user?.heightCm || (records.length > 0 ? records[records.length - 1].heightCm : 175);
  const currentWeight = user?.currentWeightKg || (records.length > 0 ? records[records.length - 1].weightKg : 75);

  const latestEvaluation = evaluateBmi(currentHeight, currentWeight);

  res.json({
    records,
    latest: {
      heightCm: currentHeight,
      weightKg: currentWeight,
      ...latestEvaluation,
    },
  });
});

export default router;
