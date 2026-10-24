import React, { useEffect, useRef } from 'react';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WeeklyProgressBar = ({ tasks = [] }) => {
  const barRef = useRef(null);

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t?.isCompleted)?.length || 0;
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dayStats = DAY_NAMES?.map((dayName, idx) => {
    const dayTasks = tasks?.filter(t => t?.day === dayName || t?.dayOfWeek === idx);
    const total = dayTasks?.length || 0;
    const completed = dayTasks?.filter(t => t?.isCompleted)?.length || 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { label: DAY_LABELS?.[idx], dayName, total, completed, pct };
  });

  const isFullyComplete = (stat) => stat?.total > 0 && stat?.completed === stat?.total;

  useEffect(() => {
    if (barRef?.current) {
      barRef.current.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (barRef?.current) barRef.current.style.width = `${overallPct}%`;
        }, 50);
      });
    }
  }, [overallPct]);

  return (
    <div className="px-4 md:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-card)] flex-shrink-0">
      {/* Main progress bar */}
      <div className="flex items-center gap-3 mb-2.5">
        <span className="font-caption text-xs text-[var(--color-muted-foreground)] whitespace-nowrap">
          {completedTasks} of {totalTasks} tasks
        </span>
        <div className="flex-1 h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
          <div
            ref={barRef}
            className="h-full rounded-full transition-all duration-[600ms] ease-out"
            style={{
              width: `${overallPct}%`,
              background: overallPct === 100
                ? 'linear-gradient(90deg, #10B981, #059669)'
                : 'linear-gradient(90deg, #6366F1, #8B5CF6)'
            }}
          />
        </div>
        <span className="font-data text-xs font-semibold text-[var(--color-primary)] w-9 text-right">
          {overallPct}%
        </span>
      </div>
      {/* Per-day mini bars */}
      <div className="grid grid-cols-7 gap-1">
        {dayStats?.map((stat, i) => {
          const isToday = i === new Date()?.getDay();
          const full = isFullyComplete(stat);
          return (
            <div key={i} className="flex flex-col items-center gap-1" title={`${stat?.dayName}: ${stat?.completed}/${stat?.total} completed`}>
              <span className={`font-caption text-xs font-medium ${
                isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'
              }`}>
                {stat?.label}
              </span>
              <div className="w-full h-1.5 bg-[var(--color-muted)] rounded-full overflow-hidden">
                {stat?.total > 0 ? (
                  <div
                    className="h-full rounded-full transition-all duration-[600ms] ease-out"
                    style={{
                      width: `${stat?.pct}%`,
                      background: full
                        ? 'linear-gradient(90deg, #10B981, #059669)'
                        : isToday
                        ? 'linear-gradient(90deg, #6366F1, #8B5CF6)'
                        : '#6366F1'
                    }}
                  />
                ) : null}
              </div>
              <span className="font-data text-xs text-[var(--color-muted-foreground)]">
                {stat?.total > 0 ? `${stat?.completed}/${stat?.total}` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyProgressBar;
