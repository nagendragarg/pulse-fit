import React, { useState } from 'react';
import { MessageSquare, Star, Send, Loader2 } from 'lucide-react';
import { Modal } from './Modal.tsx';
import { api } from '../api/client.ts';
import { useToast } from './Toast.tsx';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { success, error } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'COACHING' | 'APP_FEATURES' | 'WORKOUT_CONTENT' | 'BUG_REPORT' | 'OTHER'>('APP_FEATURES');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      error('Please provide a comment with your feedback.', 'Validation');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/feedback', {
        category,
        rating,
        comment,
      });
      success('Thank you! Your feedback has been forwarded to platform administrators.', 'Feedback Received');
      setComment('');
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to submit feedback', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Platform Feedback" subtitle="Your insights help us elevate coaching quality" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">Overall Experience Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-zinc-600 hover:text-amber-400 focus:outline-none transition-colors"
              >
                <Star
                  className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
                />
              </button>
            ))}
            <span className="text-xs text-zinc-400 ml-2 font-medium">{rating} of 5 Stars</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Feedback Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="APP_FEATURES">Platform Features & Dashboard UI</option>
            <option value="COACHING">Coaching Quality & Communication</option>
            <option value="WORKOUT_CONTENT">Workout Plans & Exercise Content</option>
            <option value="BUG_REPORT">Technical Issue / Bug Report</option>
            <option value="OTHER">Other Suggestion</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Your Feedback or Suggestions</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
            placeholder="Tell us what you loved or how we can make PulseFit even better for your fitness journey..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Feedback
          </button>
        </div>
      </form>
    </Modal>
  );
};
