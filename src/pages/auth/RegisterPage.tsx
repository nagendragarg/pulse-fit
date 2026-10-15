import React, { useState } from 'react';
import { Mail, Lock, User, Dumbbell, ArrowRight, Loader2, Scale, Target, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { cmToFeetAndInches, kgToLbs } from '../../utils/units.ts';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onBackToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onBackToHome }) => {
  const { register } = useAuth();
  const { success, error } = useToast();

  const [role, setRole] = useState<'USER' | 'COACH'>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'ENDURANCE' | 'MAINTENANCE'>('MUSCLE_GAIN');
  const [heightCm, setHeightCm] = useState<number>(178);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(78);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(82);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      error('Password must be at least 6 characters.', 'Validation');
      return;
    }

    setIsLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
        fitnessGoal,
        heightCm,
        currentWeightKg,
        targetWeightKg,
      });

      success(`Welcome to PulseFit, ${user.name}! Your account is active.`, 'Registered Successfully');
    } catch (err: any) {
      error(err.message || 'Registration failed', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <button
          onClick={onBackToHome}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-6 transition-colors"
        >
          ← Back to PulseFit Home
        </button>

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">PulseFit</span>
        </div>

        <h2 className="text-center text-2xl font-bold text-white tracking-tight">
          Create Your PulseFit Account
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-400">
          Personalized training programs, precision tracking, and coach guidance
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-zinc-950 border border-zinc-800/80 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          {/* Role selector tab */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'USER'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Athlete Account
            </button>
            <button
              type="button"
              onClick={() => setRole('COACH')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'COACH'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Coach Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Athlete Specific Fields */}
            {role === 'USER' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Primary Fitness Goal</label>
                  <div className="relative">
                    <Target className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value as any)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="MUSCLE_GAIN">Hypertrophy & Muscle Gain</option>
                      <option value="WEIGHT_LOSS">Fat Loss & Conditioning</option>
                      <option value="ENDURANCE">Endurance & Marathon Stamina</option>
                      <option value="MAINTENANCE">Health & Longevity Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-mono text-center focus:outline-none focus:border-emerald-500"
                    />
                    <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 text-center truncate">
                      {heightCm ? `${cmToFeetAndInches(heightCm).feet}'${cmToFeetAndInches(heightCm).inches}" (${cmToFeetAndInches(heightCm).totalInches}")` : ''}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={currentWeightKg}
                      onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-mono text-center focus:outline-none focus:border-emerald-500"
                    />
                    <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 text-center truncate">
                      {currentWeightKg ? `${kgToLbs(currentWeightKg)} lbs` : ''}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Target (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-mono text-center focus:outline-none focus:border-emerald-500"
                    />
                    <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 text-center truncate">
                      {targetWeightKg ? `${kgToLbs(targetWeightKg)} lbs` : ''}
                    </span>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Create My Account
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-emerald-400 font-bold hover:underline">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
