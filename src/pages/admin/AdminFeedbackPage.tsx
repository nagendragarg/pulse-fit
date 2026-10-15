import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';
import { Feedback } from '../../types/index.ts';

export const AdminFeedbackPage: React.FC = () => {
  const { success, error } = useToast();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Feedback[]>(
        `/feedback?status=${statusFilter}&category=${categoryFilter}`
      );
      setFeedbackList(data);
    } catch (err: any) {
      error(err.message || 'Failed to load feedback', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [statusFilter, categoryFilter]);

  const handleUpdateStatus = async (id: string, newStatus: 'PENDING' | 'REVIEWED' | 'RESOLVED') => {
    try {
      await api.put(`/feedback/${id}/status`, { status: newStatus });
      success(`Feedback marked as ${newStatus}.`, 'Status Updated');
      loadFeedback();
    } catch (err: any) {
      error(err.message || 'Failed to update feedback status', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Member Feedback & Bug Reports</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review user experience submissions, coaching ratings, and platform feature requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="COACHING">Coaching Quality</option>
            <option value="APP_FEATURES">App Features</option>
            <option value="WORKOUT_CONTENT">Workout Content</option>
            <option value="BUG_REPORT">Bug Reports</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {feedbackList.length > 0 ? (
        <div className="space-y-4">
          {feedbackList.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      item.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : item.status === 'REVIEWED'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {item.category.replace('_', ' ')}
                  </span>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed pt-1">"{item.comment}"</p>

                <div className="text-xs text-zinc-400">
                  From: <span className="font-semibold text-white">{item.userName}</span> ({item.userEmail})
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t border-zinc-850 sm:border-t-0 sm:flex-col shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(item.id, 'REVIEWED')}
                  className="flex-1 sm:flex-initial w-full sm:w-auto px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-400 text-xs font-semibold transition-colors min-h-[38px] text-center"
                >
                  Mark Reviewed
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                  className="flex-1 sm:flex-initial w-full sm:w-auto px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-black text-xs font-semibold transition-colors min-h-[38px] text-center"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
          No feedback records match the current filters.
        </div>
      )}
    </div>
  );
};
