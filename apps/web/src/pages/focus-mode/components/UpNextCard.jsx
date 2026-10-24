import React from 'react';

const CATEGORY_COLORS = {
  work: '#3B82F6', languages: '#FBBF24', literature: '#F97316',
  coding: '#10B981', leadership: '#A855F7', spirituality: '#8B5CF6',
  chores: '#F43F5E', meals: '#EAB308', leisure: '#94A3B8',
  health: '#14B8A6', family: '#EC4899', social: '#06B6D4',
};

const UpNextCard = ({ task }) => {
  if (!task) return null;
  const color = CATEGORY_COLORS?.[task?.category] || '#6366F1';

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="font-caption text-xs text-white/50 uppercase tracking-widest mb-2 text-center">Up Next</p>
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold text-white truncate">{task?.title}</p>
          <p className="font-data text-xs text-white/60">
            {task?.startTime} – {task?.endTime || 'TBD'}
          </p>
        </div>
        <span
          className="font-caption text-xs px-2 py-0.5 rounded-full capitalize"
          style={{ background: color + '33', color }}
        >
          {task?.category}
        </span>
      </div>
    </div>
  );
};

export default UpNextCard;
