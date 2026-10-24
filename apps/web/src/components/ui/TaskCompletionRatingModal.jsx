import React, { useState } from 'react';
import Icon from '../AppIcon';

const RATING_LABELS = [
  { value: 1, label: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' },
  { value: 2, label: 'Fair', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40' },
  { value: 3, label: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40' },
  { value: 4, label: 'Great', color: 'text-lime-400', bg: 'bg-lime-500/20 border-lime-500/40' },
  { value: 5, label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
];

const TaskCompletionRatingModal = ({ task, onSave, onSkip, onClose, isEditMode = false, initialRating = 0, initialNotes = '' }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState(initialNotes || '');

  const activeRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS?.find((r) => r?.value === activeRating);

  const handleSave = () => {
    onSave?.({ rating: rating || null, completionNotes: notes?.trim() || null });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                {isEditMode ? 'Update Performance' : 'Task Completed!'}
              </p>
              <h3 className="text-lg font-bold text-white leading-tight truncate">{task?.title}</h3>
              {task?.category && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 capitalize">{task?.category}</span>
              )}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all flex-shrink-0">
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="px-6 pb-4">
          <p className="text-sm font-medium text-slate-300 mb-3">How well did you complete this task?</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            {RATING_LABELS?.map((r) => (
              <button
                key={r?.value}
                onClick={() => setRating(r?.value)}
                onMouseEnter={() => setHoverRating(r?.value)}
                onMouseLeave={() => setHoverRating(0)}
                className={`w-11 h-11 rounded-xl border-2 transition-all duration-150 flex items-center justify-center ${
                  activeRating >= r?.value
                    ? r?.bg + 'scale-110' :'border-slate-700 bg-slate-800 hover:border-slate-500'
                }`}
              >
                <Icon
                  name="Star"
                  size={18}
                  className={activeRating >= r?.value ? r?.color : 'text-slate-600'}
                  fill={activeRating >= r?.value ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          {ratingInfo && (
            <p className={`text-center text-sm font-semibold ${ratingInfo?.color} h-5`}>{ratingInfo?.label}</p>
          )}
          {!ratingInfo && <div className="h-5" />}
        </div>

        {/* Notes */}
        <div className="px-6 pb-5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e?.target?.value)}
            placeholder="Any reflections, blockers, or next steps..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          {!isEditMode && (
            <button
              onClick={onSkip}
              className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 active:scale-[0.97]"
            >
              Skip
            </button>
          )}
          {isEditMode && (
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 active:scale-[0.97]"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Icon name={isEditMode ? 'Save' : 'CheckCircle'} size={16} />
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionRatingModal;
