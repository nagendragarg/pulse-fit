import React, { useState, useEffect, useRef } from 'react';
import {
  Apple,
  Plus,
  Trash2,
  TrendingUp,
  PieChart as PieIcon,
  Flame,
  Calendar,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';
import { Modal } from '../../components/Modal.tsx';
import { NutritionSummary, NutritionLog } from '../../types/index.ts';
import { AiFoodNutrientDetector } from '../../components/AiFoodNutrientDetector.tsx';

export const NutritionalAnalyticsPage: React.FC = () => {
  const { success, error } = useToast();
  const [data, setData] = useState<NutritionSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding food item
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('BREAKFAST');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number>(350);
  const [proteinG, setProteinG] = useState<number>(30);
  const [carbsG, setCarbsG] = useState<number>(35);
  const [fatG, setFatG] = useState<number>(10);
  const [portionSize, setPortionSize] = useState('1 serving (250g)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNutrition = async (dateStr: string) => {
    setIsLoading(true);
    try {
      const res = await api.get<NutritionSummary>(`/nutrition?date=${dateStr}`);
      setData(res);
    } catch (err: any) {
      error(err.message || 'Failed to load nutrition logs', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNutrition(selectedDate);
  }, [selectedDate]);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    setIsSubmitting(true);
    try {
      await api.post('/nutrition', {
        date: selectedDate,
        mealType,
        foodName,
        calories: Number(calories),
        proteinG: Number(proteinG),
        carbsG: Number(carbsG),
        fatG: Number(fatG),
        portionSize,
      });

      success(`Added ${foodName} to today's nutrition log!`, 'Meal Logged');
      setShowAddModal(false);
      setFoodName('');
      loadNutrition(selectedDate);
    } catch (err: any) {
      error(err.message || 'Failed to log meal', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await api.delete(`/nutrition/${id}`);
      success('Meal entry deleted', 'Removed');
      loadNutrition(selectedDate);
    } catch (err: any) {
      error(err.message || 'Failed to delete meal', 'Error');
    }
  };

  const summary = data?.summary;
  const targets = summary?.targets || { calories: 2400, protein: 160, carbs: 260, fat: 65 };
  const totalCal = summary?.totalCalories || 0;
  const calPercent = Math.min(100, Math.round((totalCal / targets.calories) * 100));
  const scannerRef = useRef<HTMLDivElement | null>(null);

  const scrollToScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Nutritional & Macro Analytics</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time caloric balance, macronutrient targets, and AI automated food detection
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={scrollToScanner}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Food Scanner
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log Meal
          </button>
        </div>
      </div>

      {/* AI Food & Nutrient Auto-Detector Section */}
      <div ref={scannerRef}>
        <AiFoodNutrientDetector
          selectedDate={selectedDate}
          onMealLogged={() => loadNutrition(selectedDate)}
          defaultExpanded={true}
        />
      </div>

      {/* Calories Overview Banner */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Daily Caloric Balance
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {totalCal} <span className="text-base text-zinc-400 font-normal">/ {targets.calories} kcal ({calPercent}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                totalCal > targets.calories
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {totalCal <= targets.calories
                ? `${targets.calories - totalCal} kcal Remaining`
                : `${totalCal - targets.calories} kcal Over Target`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totalCal > targets.calories ? 'bg-rose-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${calPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Macro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Protein */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Protein</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono">
              {summary?.macroPercentages.protein || 0}% of kcal
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {summary?.totalProtein || 0}g <span className="text-xs text-zinc-400 font-normal">/ {targets.protein}g</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-900 mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{
                width: `${Math.min(100, ((summary?.totalProtein || 0) / targets.protein) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Carbohydrates</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-mono">
              {summary?.macroPercentages.carbs || 0}% of kcal
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {summary?.totalCarbs || 0}g <span className="text-xs text-zinc-400 font-normal">/ {targets.carbs}g</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-900 mt-3 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{
                width: `${Math.min(100, ((summary?.totalCarbs || 0) / targets.carbs) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dietary Fats</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono">
              {summary?.macroPercentages.fat || 0}% of kcal
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {summary?.totalFat || 0}g <span className="text-xs text-zinc-400 font-normal">/ {targets.fat}g</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-900 mt-3 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{
                width: `${Math.min(100, ((summary?.totalFat || 0) / targets.fat) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-1">7-Day Caloric & Macro Intake Trend</h3>
        <p className="text-xs text-zinc-400 mb-6">Daily nutrient distribution across the past week</p>

        <div className="h-64 w-full">
          {data?.weeklyTrend && data.weeklyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="protein" name="Protein (g)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="carbs" name="Carbs (g)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fat" name="Fat (g)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No trend data available.
            </div>
          )}
        </div>
      </div>

      {/* Meals Logged Table for Selected Day */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-4">
          Meals Logged on {selectedDate}
        </h3>

        {data?.logs && data.logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Food Item & Portion</th>
                  <th className="pb-3">Calories</th>
                  <th className="pb-3">Protein</th>
                  <th className="pb-3">Carbs</th>
                  <th className="pb-3">Fat</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {data.logs.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {item.mealType}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-white">{item.foodName}</div>
                      <div className="text-[10px] text-zinc-500">{item.portionSize}</div>
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-400">{item.calories} kcal</td>
                    <td className="py-3 font-mono text-zinc-300">{item.proteinG}g</td>
                    <td className="py-3 font-mono text-zinc-300">{item.carbsG}g</td>
                    <td className="py-3 font-mono text-zinc-300">{item.fatG}g</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteMeal(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No meals logged yet for this date. Click "Log Meal" to record your food intake!
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Food Intake" maxWidth="md">
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Have a meal photo or food plate? Let AI auto-detect nutrients!</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowAddModal(false);
              scrollToScanner();
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black text-[11px] font-bold shrink-0 hover:bg-emerald-400 transition-colors"
          >
            Use AI Scanner
          </button>
        </div>

        <form onSubmit={handleAddMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Meal Timing</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack / Post-Workout</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Food Name *</label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Grilled Chicken Breast with Jasmine Rice"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Portion Description</label>
            <input
              type="text"
              value={portionSize}
              onChange={(e) => setPortionSize(e.target.value)}
              placeholder="e.g. 200g chicken, 1 cup rice"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Calories (kcal) *</label>
              <input
                type="number"
                required
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Protein (g)</label>
              <input
                type="number"
                value={proteinG}
                onChange={(e) => setProteinG(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbsG}
                onChange={(e) => setCarbsG(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Fat (g)</label>
              <input
                type="number"
                value={fatG}
                onChange={(e) => setFatG(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs text-center"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Meal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
