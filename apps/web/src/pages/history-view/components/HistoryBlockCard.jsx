import React from 'react';
import Icon from '../../../components/AppIcon';

const CATEGORY_COLORS = {
  work: { bg: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-400', text: 'text-blue-700 dark:text-blue-300', dot: '#3B82F6' },
  languages: { bg: 'bg-amber-400', light: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-400', text: 'text-amber-700 dark:text-amber-300', dot: '#FBBF24' },
  literature: { bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-400', text: 'text-orange-700 dark:text-orange-300', dot: '#F97316' },
  coding: { bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-400', text: 'text-emerald-700 dark:text-emerald-300', dot: '#10B981' },
  leadership: { bg: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-400', text: 'text-purple-700 dark:text-purple-300', dot: '#A855F7' },
  spirituality: { bg: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-950', border: 'border-violet-400', text: 'text-violet-700 dark:text-violet-300', dot: '#8B5CF6' },
  chores: { bg: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-950', border: 'border-rose-400', text: 'text-rose-700 dark:text-rose-300', dot: '#F43F5E' },
  meals: { bg: 'bg-yellow-500', light: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', dot: '#EAB308' },
  leisure: { bg: 'bg-slate-400', light: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-400', text: 'text-slate-600 dark:text-slate-300', dot: '#94A3B8' },
  health: { bg: 'bg-teal-500', light: 'bg-teal-50 dark:bg-teal-950', border: 'border-teal-400', text: 'text-teal-700 dark:text-teal-300', dot: '#14B8A6' },
  family: { bg: 'bg-pink-500', light: 'bg-pink-50 dark:bg-pink-950', border: 'border-pink-400', text: 'text-pink-700 dark:text-pink-300', dot: '#EC4899' },
  social: { bg: 'bg-cyan-500', light: 'bg-cyan-50 dark:bg-cyan-950', border: 'border-cyan-400', text: 'text-cyan-700 dark:text-cyan-300', dot: '#06B6D4' },
};

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr?.split(':')?.map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m)?.padStart(2, '0')} ${period}`;
}

const HistoryBlockCard = ({ block, onEditPerformance }) => {
  const colors = CATEGORY_COLORS?.[block?.category] || CATEGORY_COLORS?.work;
  const hasRating = block?.isCompleted && block?.rating;

  return (
    <div
      className={`rounded-lg border-l-4 ${colors?.light} ${colors?.border} p-3 ${
        block?.isCompleted ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion indicator */}
        <div
          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 border-2 ${
            block?.isCompleted
              ? `${colors?.bg} border-transparent`
              : `bg-transparent ${colors?.border}`
          }`}
        >
          {block?.isCompleted && (
            <Icon name="Check" size={12} color="#fff" strokeWidth={3} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-heading font-semibold text-sm ${
                block?.isCompleted ? 'line-through opacity-60' : ''
              } ${colors?.text}`}
            >
              {block?.title}
            </span>
            <span
              className={`text-xs font-caption capitalize px-1.5 py-0.5 rounded ${colors?.bg} text-white`}
            >
              {block?.category}
            </span>
            {hasRating && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-400/20">
                <Icon name="Star" size={9} color="#fbbf24" fill="#fbbf24" />
                <span className="font-data text-xs text-yellow-400">{block?.rating}/5</span>
              </span>
            )}
          </div>
          <p className="font-data text-xs text-muted-foreground mt-0.5">
            {formatTime(block?.startTime)} – {formatTime(block?.endTime)}
            {block?.duration && ` · ${block?.duration}min`}
          </p>
          {block?.completionNotes && (
            <p className="font-body text-xs text-muted-foreground mt-1 italic line-clamp-2">"{block?.completionNotes}"</p>
          )}
        </div>

        {/* Edit performance button */}
        {onEditPerformance && (
          <button
            className="flex-shrink-0 w-7 h-7 rounded-lg border border-slate-400/30 bg-slate-700/30 flex items-center justify-center transition-all hover:bg-indigo-500/20 hover:border-indigo-400/50"
            onClick={() => onEditPerformance?.(block)}
            title="Update performance rating"
            aria-label="Edit performance rating"
          >
            <Icon name="Star" size={12} color="#a5b4fc" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HistoryBlockCard;
