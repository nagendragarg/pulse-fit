import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, Flame, Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../api/client.ts';
import { WorkoutLog } from '../../types/index.ts';

export const WorkoutHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const data = await api.get<WorkoutLog[]>('/workouts/history');
        setLogs(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredLogs = logs.filter((l) =>
    l.routineTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Workout History & Performance Logs</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Historical log of all recorded workouts, actual weights moved, and volume
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search workouts..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {filteredLogs.length > 0 ? (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = log.id === expandedLogId;
            return (
              <div
                key={log.id}
                className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden transition-all hover:border-zinc-700"
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {new Date(log.completedAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {new Date(log.completedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{log.routineTitle}</h3>
                      <p className="text-xs text-zinc-400 mt-1 italic">"{log.notes}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" /> {log.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Flame className="w-3.5 h-3.5" /> {log.caloriesBurned} kcal
                        </span>
                        <span className="text-zinc-400">RPE: {log.perceivedEffort}/10</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {log.exerciseLogs.length} Exercise sets logged
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-zinc-900 bg-zinc-950/40">
                    <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Recorded Set Performance
                    </h5>
                    {log.exerciseLogs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {log.exerciseLogs.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-850 text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-semibold text-white truncate max-w-[140px]">
                                {item.exerciseName}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">Set #{item.setNumber}</div>
                            </div>
                            <div className="font-mono text-emerald-400 font-bold text-right">
                              {item.repsCompleted} reps {item.weightUsedKg ? `@ ${item.weightUsedKg}kg` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">No individual set breakdown stored for this record.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs">
          No workout history logs match your search.
        </div>
      )}
    </div>
  );
};
