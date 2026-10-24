import React from 'react';
import Icon from '../../../components/AppIcon';

const CATEGORY_COLORS = {
  work: '#3B82F6', languages: '#FBBF24', literature: '#F97316',
  coding: '#10B981', leadership: '#A855F7', spirituality: '#8B5CF6',
  chores: '#F43F5E', meals: '#EAB308', leisure: '#94A3B8',
  health: '#14B8A6', family: '#EC4899', social: '#06B6D4',
};

const NoActiveTask = ({ nextTask, secondsUntilNext }) => {
  const h = Math.floor(secondsUntilNext / 3600);
  const m = Math.floor((secondsUntilNext % 3600) / 60);
  const s = secondsUntilNext % 60;
  const fmt = (n) => String(n)?.padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <Icon name="Coffee" size={36} color="rgba(255,255,255,0.6)" />
      </div>
      <div>
        <h2 className="font-heading text-2xl font-bold text-white mb-2">No active task right now</h2>
        <p className="font-body text-white/60">Take a breather — you're between blocks.</p>
      </div>
      {nextTask && secondsUntilNext > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="font-caption text-xs text-white/50 uppercase tracking-widest">Next task starts in</p>
          <p className="font-data text-3xl font-bold text-white">
            {h > 0 ? `${fmt(h)}:` : ''}{fmt(m)}:{fmt(s)}
          </p>
          <div
            className="mt-2 rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS?.[nextTask?.category] || '#6366F1' }}
            />
            <div>
              <p className="font-heading text-sm font-semibold text-white">{nextTask?.title}</p>
              <p className="font-data text-xs text-white/60">{nextTask?.startTime}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoActiveTask;
