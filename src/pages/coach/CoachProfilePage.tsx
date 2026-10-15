import React, { useState } from 'react';
import { Award, User, Lock, Save, Loader2, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';

export const CoachProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Security password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        phone,
        bio,
        avatarUrl,
      });
      updateUser(res.user);
      success('Coach profile updated successfully!', 'Saved');
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
      success('Password updated successfully!', 'Security Updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Password update failed', 'Error');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Coach Profile & Credentials</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your public faculty profile visible to athletes and athletes matching
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" /> Faculty Credentials & Bio
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Coach Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Direct Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Professional Biography & Specialty Focus
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Highlight certifications (CSCS, CPT), coaching philosophy, and athletic domains..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Coach Profile
            </button>
          </div>
        </form>
      </div>

      {/* Password Management */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" /> Update Password
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
  );
};
