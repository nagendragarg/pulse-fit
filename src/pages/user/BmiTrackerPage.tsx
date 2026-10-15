import React, { useState, useEffect } from 'react';
import { Scale, Heart, AlertCircle, Save, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { BmiRecord } from '../../types/index.ts';
import {
  cmToFeetAndInches,
  feetAndInchesToCm,
  inchesToCm,
  kgToLbs,
  lbsToKg,
} from '../../utils/units.ts';

export const BmiTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<BmiRecord[]>([]);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightCm, setHeightCm] = useState<number>(user?.heightCm || 180);
  const [weightKg, setWeightKg] = useState<number>(user?.currentWeightKg || 80);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Imperial conversions
  const { feet, inches, totalInches } = cmToFeetAndInches(heightCm);
  const weightLbs = kgToLbs(weightKg);

  const loadBmiHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/bmi/history');
      setRecords(data.records);
      if (data.latest) {
        setHeightCm(data.latest.heightCm);
        setWeightKg(data.latest.weightKg);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load BMI records', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBmiHistory();
  }, []);

  // Compute live BMI
  const heightM = heightCm / 100;
  const liveBmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 0;

  let category = 'Normal weight';
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  let riskNote = 'Low health risk. Optimal range for cardiovascular endurance and metabolic function.';
  let meterPosition = 50;

  if (liveBmi < 18.5) {
    category = 'Underweight';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    riskNote = 'Risk of nutritional deficiency and decreased muscle mass. Hypertrophy focus advised.';
    meterPosition = Math.max(5, ((liveBmi - 15) / 25) * 100);
  } else if (liveBmi < 25) {
    category = 'Normal weight';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    riskNote = 'Optimal healthy weight. Maintain progressive training and balanced nutrition.';
    meterPosition = ((liveBmi - 15) / 25) * 100;
  } else if (liveBmi < 30) {
    category = 'Overweight';
    badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    riskNote = 'Moderate cardiovascular risk. Focus on steady caloric balance and conditioning.';
    meterPosition = ((liveBmi - 15) / 25) * 100;
  } else {
    category = 'Obesity';
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    riskNote = 'Higher risk of joint strain and insulin resistance. Dedicated conditioning advised.';
    meterPosition = Math.min(95, ((liveBmi - 15) / 25) * 100);
  }

  const minHealthyKg = heightM > 0 ? Number((18.5 * heightM * heightM).toFixed(1)) : 0;
  const maxHealthyKg = heightM > 0 ? Number((24.9 * heightM * heightM).toFixed(1)) : 0;
  const minHealthyLbs = kgToLbs(minHealthyKg);
  const maxHealthyLbs = kgToLbs(maxHealthyKg);

  const handleSaveReading = async () => {
    setIsSaving(true);
    try {
      await api.post('/bmi/calculate', {
        heightCm,
        weightKg,
        saveRecord: true,
      });

      // Also add to general progress records
      await api.post('/progress', {
        weightKg,
        notes: `BMI check: ${liveBmi} (${category})`,
      });

      success('New BMI record and weight successfully logged to profile!', 'Reading Saved');
      loadBmiHistory();
    } catch (err: any) {
      error(err.message || 'Failed to save record', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">BMI & Metabolic Health Tracker</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Evaluate Body Mass Index based on World Health Organization standards with full metric (cm/kg) and imperial (in/ft/lbs) precision
        </p>
      </div>

      {/* Main Interactive Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Biometric Inputs</h3>
          </div>

          {/* Height Input with Unit Switch */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Height Measurement
              </span>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setHeightUnit('cm')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    heightUnit === 'cm'
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setHeightUnit('in')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    heightUnit === 'in'
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  in / ft
                </button>
              </div>
            </div>

            {heightUnit === 'cm' ? (
              <>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-mono text-xl text-white font-bold">{heightCm} <span className="text-sm text-zinc-400 font-normal">cm</span></span>
                  <span className="font-mono text-xs text-emerald-400/90 font-medium">
                    {feet}&apos;{inches}&quot; ({totalInches} in)
                  </span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>130 cm (4&apos;3&quot;)</span>
                  <span>175 cm (5&apos;9&quot;)</span>
                  <span>220 cm (7&apos;3&quot;)</span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-xl text-white font-bold">
                    {feet}&apos;{inches}&quot; <span className="text-sm text-emerald-400 font-normal">({totalInches} in)</span>
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    = {heightCm} cm
                  </span>
                </div>

                {/* Feet buttons */}
                <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 space-y-2">
                  <div>
                    <div className="text-[10px] text-zinc-400 font-semibold mb-1 flex justify-between">
                      <span>Feet</span>
                      <span className="text-white font-mono font-bold">{feet} ft</span>
                    </div>
                    <div className="flex gap-1">
                      {[4, 5, 6, 7].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setHeightCm(feetAndInchesToCm(f, inches))}
                          className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                            feet === f
                              ? 'bg-emerald-500 text-black'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {f}&apos;
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-400 font-semibold mb-1 flex justify-between">
                      <span>Inches</span>
                      <span className="text-white font-mono font-bold">{inches} in</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="11"
                      value={inches}
                      onChange={(e) => setHeightCm(feetAndInchesToCm(feet, Number(e.target.value)))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Fine total inches slider */}
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                    <span>Total Inches:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{totalInches} in</span>
                  </div>
                  <input
                    type="range"
                    min="48"
                    max="86"
                    step="0.5"
                    value={totalInches}
                    onChange={(e) => setHeightCm(inchesToCm(Number(e.target.value)))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>48 in (4&apos;0&quot;)</span>
                    <span>67 in (5&apos;7&quot;)</span>
                    <span>86 in (7&apos;2&quot;)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weight Input with Unit Switch */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-cyan-400" /> Weight Measurement
              </span>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    weightUnit === 'kg'
                      ? 'bg-cyan-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lbs')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    weightUnit === 'lbs'
                      ? 'bg-cyan-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>

            {weightUnit === 'kg' ? (
              <>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-mono text-xl text-white font-bold">{weightKg} <span className="text-sm text-zinc-400 font-normal">kg</span></span>
                  <span className="font-mono text-xs text-cyan-400/90 font-medium">
                    {weightLbs} lbs
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>40 kg (88 lbs)</span>
                  <span>100 kg (220 lbs)</span>
                  <span>160 kg (353 lbs)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-mono text-xl text-white font-bold">{weightLbs} <span className="text-sm text-cyan-400 font-normal">lbs</span></span>
                  <span className="font-mono text-xs text-zinc-400 font-medium">
                    = {weightKg} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="88"
                  max="350"
                  step="1"
                  value={weightLbs}
                  onChange={(e) => setWeightKg(lbsToKg(Number(e.target.value)))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>88 lbs (40 kg)</span>
                  <span>220 lbs (100 kg)</span>
                  <span>350 lbs (159 kg)</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleSaveReading}
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Reading to Health Profile
          </button>
        </div>

        {/* Calculated Result Gauge (2 cols on lg) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Evaluation</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Body Mass Index Gauge</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                {category}
              </span>
            </div>

            <div className="my-6 text-center">
              <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {liveBmi} <span className="text-base text-zinc-500 font-normal">kg/m²</span>
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-2">
                Height: <span className="text-zinc-200">{heightCm} cm ({feet}&apos;{inches}&quot; / {totalInches} in)</span>
                {' • '}
                Weight: <span className="text-zinc-200">{weightKg} kg ({weightLbs} lbs)</span>
              </div>
            </div>

            {/* Visual Bar Gauge */}
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full rounded-full bg-zinc-850 overflow-hidden flex relative">
                <div className="h-full w-1/4 bg-amber-500/50" title="Underweight" />
                <div className="h-full w-1/3 bg-emerald-500/80" title="Normal weight" />
                <div className="h-full w-1/4 bg-orange-500/70" title="Overweight" />
                <div className="h-full w-1/6 bg-rose-500/80" title="Obesity" />
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-lg -translate-x-1/2 transition-all duration-300 border border-black"
                  style={{ left: `${Math.min(98, Math.max(2, meterPosition))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 px-1 font-mono">
                <span>&lt; 18.5 (Under)</span>
                <span className="text-emerald-400 font-semibold">18.5 – 24.9 (Normal)</span>
                <span>25.0 – 29.9 (Over)</span>
                <span>30.0+ (Obese)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-850 leading-relaxed">
              💡 <span className="font-semibold text-white">Clinical Note:</span> {riskNote}
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-emerald-400" /> Optimal Weight for {heightCm} cm ({feet}&apos;{inches}&quot; / {totalInches} in):
            </span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {minHealthyKg} kg ({minHealthyLbs} lbs) – {maxHealthyKg} kg ({maxHealthyLbs} lbs)
            </span>
          </div>
        </div>
      </div>

      {/* Historical BMI Records Table */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-4">Historical BMI Assessments</h3>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Height (cm / in)</th>
                  <th className="pb-3">Weight (kg / lbs)</th>
                  <th className="pb-3">BMI Score</th>
                  <th className="pb-3">Classification</th>
                  <th className="pb-3">Assessment Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {records.slice().reverse().map((rec) => {
                  const recImperial = cmToFeetAndInches(rec.heightCm);
                  const recLbs = kgToLbs(rec.weightKg);
                  return (
                    <tr key={rec.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 font-mono text-zinc-300">{rec.date}</td>
                      <td className="py-3 font-mono text-zinc-300">
                        {rec.heightCm} cm{' '}
                        <span className="text-zinc-500 text-[11px]">
                          ({recImperial.feet}&apos;{recImperial.inches}&quot; / {recImperial.totalInches}&quot;)
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-white">
                        {rec.weightKg} kg{' '}
                        <span className="text-zinc-400 font-normal text-[11px]">({recLbs} lbs)</span>
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{rec.bmiValue}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {rec.category}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400 text-[11px] max-w-sm truncate">{rec.healthRisk}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No past BMI assessments recorded. Save your current reading above!
          </div>
        )}
      </div>
    </div>
  );
};

