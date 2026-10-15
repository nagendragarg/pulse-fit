import React, { useState } from 'react';
import { Activity, Scale, Heart, Save, Check } from 'lucide-react';
import { Modal } from './Modal.tsx';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from './Toast.tsx';
import {
  cmToFeetAndInches,
  feetAndInchesToCm,
  inchesToCm,
  kgToLbs,
  lbsToKg,
} from '../utils/units.ts';

interface BmiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const BmiCalculatorModal: React.FC<BmiCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightCm, setHeightCm] = useState<number>(user?.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(user?.currentWeightKg || 78);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Computed imperial values
  const { feet, inches, totalInches } = cmToFeetAndInches(heightCm);
  const weightLbs = kgToLbs(weightKg);

  // Computed values
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 0;

  let category = 'Normal weight';
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  let healthRisk = 'Low risk. Optimal body composition for metabolic vitality.';
  let meterPercentage = 50; // out of 100 on standard 15 to 40 scale

  if (bmi < 18.5) {
    category = 'Underweight';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    healthRisk = 'Increased risk of nutritional deficiency. Caloric surplus with hypertrophy training recommended.';
    meterPercentage = Math.max(5, ((bmi - 15) / 25) * 100);
  } else if (bmi < 25) {
    category = 'Normal weight';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    healthRisk = 'Optimal range. Balanced cardiovascular profile and muscle function.';
    meterPercentage = ((bmi - 15) / 25) * 100;
  } else if (bmi < 30) {
    category = 'Overweight';
    badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    healthRisk = 'Moderate cardiovascular load. Slight caloric deficit and conditioning recommended.';
    meterPercentage = ((bmi - 15) / 25) * 100;
  } else {
    category = 'Obesity';
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    healthRisk = 'Elevated metabolic and joint stress. Structured low-impact program advised.';
    meterPercentage = Math.min(95, ((bmi - 15) / 25) * 100);
  }

  const minHealthyKg = heightM > 0 ? Number((18.5 * heightM * heightM).toFixed(1)) : 0;
  const maxHealthyKg = heightM > 0 ? Number((24.9 * heightM * heightM).toFixed(1)) : 0;
  const minHealthyLbs = kgToLbs(minHealthyKg);
  const maxHealthyLbs = kgToLbs(maxHealthyKg);

  const handleSaveToProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await api.post('/bmi/calculate', {
        heightCm,
        weightKg,
        saveRecord: true,
      });

      // Also record to progress tracking if user
      await api.post('/progress', {
        weightKg,
        notes: `BMI evaluation recorded: ${bmi} (${category})`,
      });

      success('BMI evaluation saved to your health history!', 'Saved');
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    } catch (err: any) {
      error(err.message || 'Failed to save record', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Precision BMI Calculator & Health Evaluator" maxWidth="lg">
      <div className="space-y-6">
        {/* Sliders / Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Height Input Box with Inch / cm measurement toggle */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Height Measurement
                </label>
                {/* Unit toggle buttons */}
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
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-bold text-white font-mono">{heightCm} <span className="text-sm text-zinc-400">cm</span></span>
                    <span className="text-xs font-mono text-emerald-400/90 font-medium">
                      {feet}&apos;{inches}&quot; ({totalInches} in)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>120 cm (3&apos;11&quot;)</span>
                    <span>170 cm (5&apos;7&quot;)</span>
                    <span>220 cm (7&apos;3&quot;)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-bold text-white font-mono">
                      {feet}&apos;{inches}&quot; <span className="text-sm text-emerald-400 font-normal">({totalInches} in)</span>
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      = {heightCm} cm
                    </span>
                  </div>

                  {/* Feet & Inches controls */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 font-medium mb-1 flex justify-between">
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
                    <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 font-medium mb-1 flex justify-between">
                        <span>Inches</span>
                        <span className="text-white font-mono font-bold">{inches} in</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="11"
                        value={inches}
                        onChange={(e) => setHeightCm(feetAndInchesToCm(feet, Number(e.target.value)))}
                        className="w-full accent-emerald-500 cursor-pointer h-4"
                      />
                    </div>
                  </div>

                  {/* Total Inches fine slider */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                      <span>Total Inches Slider:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{totalInches} inches</span>
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
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                      <span>48 in (4&apos;0&quot;)</span>
                      <span>67 in (5&apos;7&quot;)</span>
                      <span>86 in (7&apos;2&quot;)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weight Input Box with kg / lbs toggle */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" /> Weight Measurement
                </label>
                {/* Weight unit toggle */}
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
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-bold text-white font-mono">{weightKg} <span className="text-sm text-zinc-400">kg</span></span>
                    <span className="text-xs font-mono text-cyan-400/90 font-medium">
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
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>40 kg (88 lbs)</span>
                    <span>100 kg (220 lbs)</span>
                    <span>160 kg (353 lbs)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-bold text-white font-mono">{weightLbs} <span className="text-sm text-cyan-400">lbs</span></span>
                    <span className="text-xs font-mono text-zinc-400 font-medium">
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
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>88 lbs (40 kg)</span>
                    <span>220 lbs (100 kg)</span>
                    <span>350 lbs (159 kg)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center text-center relative overflow-hidden">
          <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-1">
            Calculated Body Mass Index
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight my-1">
            {bmi} <span className="text-base text-zinc-500 font-normal">kg/m²</span>
          </div>

          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 mb-3 ${badgeColor}`}>
            {category}
          </div>

          {/* Reference display of current inputs */}
          <div className="text-[11px] text-zinc-400 font-mono mb-2">
            Height: <span className="text-zinc-200">{heightCm} cm ({feet}&apos;{inches}&quot; / {totalInches} in)</span>
            {' • '}
            Weight: <span className="text-zinc-200">{weightKg} kg ({weightLbs} lbs)</span>
          </div>

          {/* Visual Gauge Bar */}
          <div className="w-full max-w-md my-2">
            <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex relative">
              <div className="h-full w-1/4 bg-amber-500/50" title="Underweight (<18.5)" />
              <div className="h-full w-1/3 bg-emerald-500/80" title="Normal (18.5 - 24.9)" />
              <div className="h-full w-1/4 bg-orange-500/70" title="Overweight (25 - 29.9)" />
              <div className="h-full w-1/6 bg-rose-500/80" title="Obese (>=30)" />
              <div
                className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-lg -translate-x-1/2 transition-all duration-300 border border-black"
                style={{ left: `${Math.min(98, Math.max(2, meterPercentage))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1.5 px-0.5">
              <span>Under (&lt;18.5)</span>
              <span className="text-emerald-400 font-medium">Normal (18.5 - 24.9)</span>
              <span>Over (25-29.9)</span>
              <span>Obese (30+)</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 max-w-md leading-relaxed mt-2">{healthRisk}</p>
        </div>

        {/* Healthy Weight Benchmark */}
        <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-zinc-300">
            <Heart className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Optimal Weight Range for {heightCm} cm ({feet}&apos;{inches}&quot; / {totalInches} in):</span>
          </div>
          <span className="font-semibold text-emerald-400 font-mono">
            {minHealthyKg} kg ({minHealthyLbs} lbs) – {maxHealthyKg} kg ({maxHealthyLbs} lbs)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
          {user && (
            <button
              type="button"
              onClick={handleSaveToProfile}
              disabled={isSaving || savedSuccess}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save to Progress History
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

