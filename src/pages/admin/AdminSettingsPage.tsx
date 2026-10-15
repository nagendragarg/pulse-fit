import React, { useState, useEffect } from 'react';
import { Sliders, Save, Loader2, ShieldCheck, Mail, Bell, Globe } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';
import { SystemSettings } from '../../types/index.ts';

export const AdminSettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const data = await api.get<SystemSettings>('/settings');
        setSettings(data);
      } catch (err: any) {
        error(err.message || 'Failed to load settings', 'Error');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await api.put('/settings', settings);
      setSettings(res.settings);
      success('System settings saved successfully!', 'Settings Applied');
    } catch (err: any) {
      error(err.message || 'Failed to save settings', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
        Loading system configuration...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System & Platform Governance Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Configure global platform parameters, registration policies, and community moderation rules
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Identity */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" /> Platform Brand & Identity
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Platform Brand Name</label>
            <input
              type="text"
              required
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Official Support Email</label>
            <input
              type="email"
              required
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Athlete Welcome Banner Text</label>
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs resize-none"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> Operational Controls & Toggles
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Allow Public Registrations</span>
                <span className="text-[11px] text-zinc-400">
                  Allow new athletes and coaches to register from the landing page
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Mandatory Content Moderation Queue</span>
                <span className="text-[11px] text-zinc-400">
                  User transformation posts and fitness guides require admin approval before publishing
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireContentModeration}
                onChange={(e) => setSettings({ ...settings, requireContentModeration: e.target.checked })}
                className="w-4 h-4 accent-purple-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">System Maintenance Mode</span>
                <span className="text-[11px] text-zinc-400">
                  Temporary maintenance banner and lock down of new plan assignments
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Automated Email & SMS Notifications</span>
                <span className="text-[11px] text-zinc-400">
                  Send alert summaries when coaches review workouts or send messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emailAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, emailAlertsEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-extrabold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save System Configurations
          </button>
        </div>
      </form>
    </div>
  );
};
