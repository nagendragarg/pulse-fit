import React, { useState, useEffect } from 'react';
import { Users, Search, Dumbbell, Award, TrendingUp, Calendar, ChevronRight, CheckCircle2, MessageSquare, Plus } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';
import { Modal } from '../../components/Modal.tsx';
import { WorkoutPlan } from '../../types/index.ts';

interface CoachClientsPageProps {
  onStartMessageWith?: (clientId: string) => void;
}

export const CoachClientsPage: React.FC<CoachClientsPageProps> = ({ onStartMessageWith }) => {
  const { success, error } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal inspection
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientProgress, setClientProgress] = useState<any | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Assign plan modal
  const [assigningClient, setAssigningClient] = useState<any | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, plansRes] = await Promise.all([
        api.get('/coach/clients'),
        api.get<WorkoutPlan[]>('/workouts/plans'),
      ]);
      setClients(clientsRes);
      setPlans(plansRes);
      if (plansRes.length > 0) setSelectedPlanId(plansRes[0].id);
    } catch (err: any) {
      error(err.message || 'Failed to load clients data', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspectProgress = async (client: any) => {
    setSelectedClient(client);
    setShowProgressModal(true);
    try {
      const res = await api.get(`/progress/client/${client.id}`);
      setClientProgress(res);
    } catch (err: any) {
      error(err.message || 'Failed to fetch client progress', 'Error');
    }
  };

  const handleAssignPlan = async () => {
    if (!assigningClient || !selectedPlanId) return;

    setIsAssigning(true);
    try {
      const res = await api.post('/workouts/assign', {
        userId: assigningClient.id,
        planId: selectedPlanId,
      });

      success(res.message, 'Plan Assigned');
      setAssigningClient(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Assignment failed', 'Error');
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Athlete Client Management</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Oversee assigned athletes, assign specialized training programs, and inspect biometric logs
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search athletes..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Clients Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        {/* Mobile View: Athlete Cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((client) => (
            <div key={client.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden text-xs">
                    {client.avatarUrl ? (
                      <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      client.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{client.name}</div>
                    <div className="text-[11px] text-zinc-400">{client.email}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-950 text-zinc-300 border border-zinc-800">
                  {client.fitnessGoal?.replace('_', ' ') || 'General Fitness'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-950/80 border border-zinc-850 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Weight</span>
                  <span className="font-mono font-bold text-white">{client.currentWeightKg || 75}kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Sessions</span>
                  <span className="font-mono font-bold text-cyan-400">{client.workoutsLoggedCount || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Program</span>
                  <span className="text-[11px] font-semibold text-emerald-400 truncate block">
                    {client.assignedPlan ? client.assignedPlan.title : 'None'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleInspectProgress(client)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 font-semibold text-xs transition-colors text-center min-h-[40px]"
                >
                  Inspect Progress
                </button>
                <button
                  type="button"
                  onClick={() => setAssigningClient(client)}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-black font-semibold text-xs transition-colors border border-cyan-500/30 text-center min-h-[40px]"
                >
                  Assign Plan
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No athletes match your search.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">Athlete</th>
                <th className="pb-3">Goal</th>
                <th className="pb-3">Weight (kg)</th>
                <th className="pb-3">Active Program</th>
                <th className="pb-3">Sessions Logged</th>
                <th className="pb-3">Last Active</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden text-xs">
                        {client.avatarUrl ? (
                          <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          client.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{client.name}</div>
                        <div className="text-[10px] text-zinc-500">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {client.fitnessGoal?.replace('_', ' ') || 'General Fitness'}
                    </span>
                  </td>
                  <td className="py-4 font-mono">
                    <span className="font-bold text-white">{client.currentWeightKg || 75} kg</span>
                    {client.targetWeightKg && (
                      <span className="text-[10px] text-zinc-500 ml-1">/ {client.targetWeightKg}kg</span>
                    )}
                  </td>
                  <td className="py-4">
                    {client.assignedPlan ? (
                      <div>
                        <div className="font-semibold text-emerald-400 text-xs">{client.assignedPlan.title}</div>
                        <div className="text-[10px] text-zinc-500 uppercase">{client.assignedPlan.difficulty}</div>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-xs">No plan assigned</span>
                    )}
                  </td>
                  <td className="py-4 font-mono font-bold text-zinc-300">
                    {client.workoutsLoggedCount || 0} Sessions
                  </td>
                  <td className="py-4 font-mono text-zinc-400 text-[11px]">
                    {new Date(client.lastActiveDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleInspectProgress(client)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 font-semibold text-[11px] transition-colors"
                      >
                        Inspect Progress
                      </button>
                      <button
                        onClick={() => setAssigningClient(client)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-black font-semibold text-[11px] transition-colors border border-cyan-500/30"
                      >
                        Assign Plan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No athletes found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Inspection Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title={`Athlete Progress: ${selectedClient?.name}`}
        subtitle="Historical weight changes and recent workout session logs"
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {clientProgress ? (
            <>
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 block">Goal</span>
                  <span className="font-bold text-white capitalize">
                    {clientProgress.user.fitnessGoal?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Weight</span>
                  <span className="font-bold text-white font-mono">{clientProgress.user.currentWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Target Weight</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {clientProgress.user.targetWeightKg} kg
                  </span>
                </div>
              </div>

              {/* Weight logs */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Weight Records</h4>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-zinc-850 divide-y divide-zinc-900 text-xs">
                  {clientProgress.records?.length > 0 ? (
                    clientProgress.records.map((r: any) => (
                      <div key={r.id} className="p-2.5 flex items-center justify-between bg-zinc-950/60">
                        <span className="font-mono text-zinc-400">{r.date}</span>
                        <span className="font-mono font-bold text-emerald-400">{r.weightKg} kg</span>
                        <span className="text-zinc-400 truncate max-w-xs">{r.notes || 'Routine check-in'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-zinc-500">No weight records logged yet.</div>
                  )}
                </div>
              </div>

              {/* Workouts logged */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Completed Workout Sessions
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {clientProgress.logs?.length > 0 ? (
                    clientProgress.logs.map((log: any) => (
                      <div key={log.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{log.routineTitle}</span>
                          <span className="font-mono text-zinc-400">
                            {new Date(log.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-4">
                          <span>Duration: {log.durationMinutes}m</span>
                          <span>Calories: {log.caloriesBurned} kcal</span>
                          <span>RPE: {log.perceivedEffort}/10</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-zinc-500 text-xs">No workout sessions logged yet.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">Loading client metrics...</div>
          )}

          <div className="flex justify-end pt-2 border-t border-zinc-850">
            <button
              onClick={() => setShowProgressModal(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Plan Modal */}
      <Modal
        isOpen={!!assigningClient}
        onClose={() => setAssigningClient(null)}
        title={`Assign Workout Plan to ${assigningClient?.name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Select a periodized training program to activate for this athlete. This will become their scheduled routine.
          </p>

          <div className="space-y-2">
            {plans.map((p) => (
              <label
                key={p.id}
                className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${
                  selectedPlanId === p.id
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="assignedPlanChoice"
                    value={p.id}
                    checked={selectedPlanId === p.id}
                    onChange={() => setSelectedPlanId(p.id)}
                    className="accent-cyan-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white">{p.title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {p.durationWeeks} Weeks • {p.difficulty} • {p.routines?.length || 0} Routine Days
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              onClick={() => setAssigningClient(null)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignPlan}
              disabled={isAssigning}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md"
            >
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
