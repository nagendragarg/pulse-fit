import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Loader2, Award, Phone, Target, Scale, Activity } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { cmToFeetAndInches, kgToLbs } from '../../utils/units.ts';

export const UserProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || 'MUSCLE_GAIN');
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'VERY_ACTIVE');
  const [heightCm, setHeightCm] = useState<number>(user?.heightCm || 178);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(user?.currentWeightKg || 78);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(user?.targetWeightKg || 82);
  const [isUpdating, setIsUpdating] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Coaches list
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(user?.coachId || '');

  useEffect(() => {
    async function fetchCoaches() {
      try {
        const list = await api.get('/users/coaches');
        setCoaches(list);
      } catch (err) {
        console.error('Failed to load coaches:', err);
      }
    }
    fetchCoaches();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        phone,
        bio,
        fitnessGoal,
        activityLevel,
        heightCm,
        currentWeightKg,
        targetWeightKg,
      });

      updateUser(res.user);
      success('Profile details updated successfully!', 'Saved');
    } catch (err: any) {
      error(err.message || 'Failed to update profile', 'Error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setIsChangingPass(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      success('Password changed successfully!', 'Security Updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Password update failed', 'Error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleAssignCoach = async () => {
    if (!selectedCoachId) return;
    try {
      const res = await api.put('/users/assign-coach', { coachId: selectedCoachId });
      success(res.message, 'Coach Assigned');
      updateUser({ coachId: selectedCoachId });
    } catch (err: any) {
      error(err.message || 'Failed to assign coach', 'Error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Profile & Fitness Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your personal information, biometrics, target goals, and security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details Form (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> Personal & Biometric Information
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Athlete Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Share a brief summary of your fitness background..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Fitness Goal</label>
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value="MUSCLE_GAIN">Hypertrophy & Muscle Gain</option>
                    <option value="WEIGHT_LOSS">Fat Loss & Conditioning</option>
                    <option value="ENDURANCE">Endurance & Marathon Stamina</option>
                    <option value="MAINTENANCE">Health & Longevity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Daily Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value="SEDENTARY">Sedentary (Desk Job)</option>
                    <option value="LIGHT">Lightly Active</option>
                    <option value="MODERATE">Moderately Active</option>
                    <option value="VERY_ACTIVE">Very Active (Daily Training)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs text-center"
                  />
                  <span className="block text-[10px] text-zinc-500 font-mono mt-1 text-center truncate">
                    {heightCm ? `${cmToFeetAndInches(heightCm).feet}'${cmToFeetAndInches(heightCm).inches}" (${cmToFeetAndInches(heightCm).totalInches}")` : ''}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Current (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs text-center"
                  />
                  <span className="block text-[10px] text-zinc-500 font-mono mt-1 text-center truncate">
                    {currentWeightKg ? `${kgToLbs(currentWeightKg)} lbs` : ''}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Target (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs text-center"
                  />
                  <span className="block text-[10px] text-zinc-500 font-mono mt-1 text-center truncate">
                    {targetWeightKg ? `${kgToLbs(targetWeightKg)} lbs` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> Account Security
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
                >
                  {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Coach Assignment */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Assigned Fitness Coach</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Choose your personal coach to oversee your programs, nutrition, and chat interactions.
          </p>

          <div className="space-y-2">
            {coaches.map((c) => (
              <label
                key={c.id}
                className={`p-3 rounded-2xl border cursor-pointer block transition-all ${
                  selectedCoachId === c.id
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="assignedCoach"
                    value={c.id}
                    checked={selectedCoachId === c.id}
                    onChange={() => setSelectedCoachId(c.id)}
                    className="accent-emerald-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{c.name}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-1">{c.bio}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAssignCoach}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md"
          >
            Update Assigned Coach
          </button>
        </div>
      </div>
    </div>
  );
};
