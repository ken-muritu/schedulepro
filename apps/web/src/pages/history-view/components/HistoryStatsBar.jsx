import React from 'react';
import Icon from '../../../components/AppIcon';

const HistoryStatsBar = ({ blocks }) => {
  const total = blocks?.length || 0;
  const completed = blocks?.filter((b) => b?.isCompleted)?.length || 0;
  const hours = blocks?.reduce((sum, b) => sum + (b?.duration || 0), 0) / 60;

  const stats = [
    { label: 'Blocks', value: total, icon: 'LayoutList', color: '#6366f1' },
    { label: 'Completed', value: completed, icon: 'CheckCircle2', color: '#10b981' },
    { label: 'Hours', value: hours?.toFixed(1) + 'h', icon: 'Clock', color: '#f59e0b' },
  ];

  return (
    <div className="flex gap-3 px-4 py-3">
      {stats?.map((stat) => (
        <div
          key={stat?.label}
          className="flex-1 flex items-center gap-2 rounded-xl p-3"
          style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: stat?.color + '22' }}
          >
            <Icon name={stat?.icon} size={16} color={stat?.color} />
          </div>
          <div className="min-w-0">
            <p className="font-data text-base font-bold text-[var(--color-foreground)]">{stat?.value}</p>
            <p className="font-caption text-xs text-[var(--color-muted-foreground)]">{stat?.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryStatsBar;
