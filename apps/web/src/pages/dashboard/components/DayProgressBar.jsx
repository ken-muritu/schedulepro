import React from "react";
import Icon from '../../../components/AppIcon';

const DayProgressBar = ({ percentage, completedCount, totalCount }) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="TrendingUp" size={16} color="var(--color-primary)" strokeWidth={2} />
          <span className="font-caption text-sm font-medium text-[var(--color-foreground)]">
            Day Progress
          </span>
        </div>
        <span className="font-data text-lg font-semibold text-[var(--color-primary)]">
          {clampedPct}%
        </span>
      </div>
      <div className="w-full h-3 bg-[var(--color-muted)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clampedPct}%`,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
          }}
          role="progressbar"
          aria-valuenow={clampedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Day progress: ${clampedPct}%`}
        />
      </div>
      <p className="font-caption text-xs text-[var(--color-muted-foreground)] mt-2">
        {completedCount} of {totalCount} blocks completed
      </p>
    </div>
  );
};

export default DayProgressBar;