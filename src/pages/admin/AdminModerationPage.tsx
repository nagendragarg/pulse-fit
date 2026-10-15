import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, AlertTriangle, Eye, Loader2, Calendar } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../../components/Toast.tsx';
import { Modal } from '../../components/Modal.tsx';
import { ContentSubmission } from '../../types/index.ts';

export const AdminModerationPage: React.FC = () => {
  const { success, error } = useToast();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Moderate modal
  const [activeItem, setActiveItem] = useState<ContentSubmission | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [moderationNotes, setModerationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ContentSubmission[]>(`/content/all?status=${statusFilter}`);
      setSubmissions(data);
    } catch (err: any) {
      error(err.message || 'Failed to load content queue', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  const handleOpenAction = (item: ContentSubmission, action: 'APPROVED' | 'REJECTED') => {
    setActiveItem(item);
    setActionType(action);
    setModerationNotes(action === 'APPROVED' ? 'Approved by Admin. Complies with guidelines.' : '');
  };

  const handleConfirmModeration = async () => {
    if (!activeItem) return;

    setIsSubmitting(true);
    try {
      await api.put(`/content/${activeItem.id}/moderate`, {
        status: actionType,
        moderationNotes,
      });

      success(`Content marked as ${actionType}.`, 'Moderation Applied');
      setActiveItem(null);
      loadSubmissions();
    } catch (err: any) {
      error(err.message || 'Action failed', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Content Moderation & Safety Queue</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review community fitness guides, recipes, and transformation stories before public distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs"
          >
            <option value="ALL">All Submissions</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      item.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : item.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {item.type.replace('_', ' ')}
                  </span>

                  <span className="text-[11px] text-zinc-500 font-mono">
                    Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{item.content}</p>

                {item.imageUrl && (
                  <div className="w-full max-w-sm rounded-xl overflow-hidden border border-zinc-800 my-2">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-44 object-cover" />
                  </div>
                )}

                <div className="text-xs text-zinc-400 flex items-center gap-4 pt-1">
                  <span>
                    Author: <span className="font-semibold text-white">{item.authorName}</span> ({item.authorRole})
                  </span>
                  {item.moderationNotes && (
                    <span className="text-zinc-500 italic">Reviewer note: "{item.moderationNotes}"</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto pt-3 sm:pt-0 border-t border-zinc-850 sm:border-t-0 md:flex-col shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenAction(item, 'APPROVED')}
                  className="flex-1 sm:flex-initial w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[40px]"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAction(item, 'REJECTED')}
                  className="flex-1 sm:flex-initial w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
          No content submissions currently in this queue filter.
        </div>
      )}

      {/* Moderation Action Modal */}
      <Modal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={`${actionType === 'APPROVED' ? 'Approve' : 'Reject'} Submission`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            You are about to <span className="font-bold text-white uppercase">{actionType}</span> "{activeItem?.title}".
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Moderator Notes / Reason</label>
            <textarea
              value={moderationNotes}
              onChange={(e) => setModerationNotes(e.target.value)}
              rows={3}
              placeholder="Provide context or guidance for this moderation decision..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              onClick={() => setActiveItem(null)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmModeration}
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                actionType === 'APPROVED'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
