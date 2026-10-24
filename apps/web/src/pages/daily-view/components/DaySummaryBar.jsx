import React from "react";
import Icon from '../../../components/AppIcon';
import { CATEGORY_COLORS } from "./TimelineBlock";

const DaySummaryBar = ({ blocks, currentMinute }) => {
  const totalMinutes = blocks?.reduce((sum, b) => sum + b?.duration, 0);
  const completedMinutes = blocks?.filter((b) => {
      const [h, m] = b?.endTime?.split(":")?.map(Number);
      return h * 60 + m <= currentMinute;
    })?.reduce((sum, b) => sum + b?.duration, 0);

  const progress = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

  const categoryTotals = blocks?.reduce((acc, b) => {
    acc[b.category] = (acc?.[b?.category] || 0) + b?.duration;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)?.sort((a, b) => b?.[1] - a?.[1])?.slice(0, 4);

  return (
    <div className="px-4 md:px-6 py-3 bg-[var(--color-card)] border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {topCategories?.map(([cat, mins]) => {
            const colors = CATEGORY_COLORS?.[cat] || CATEGORY_COLORS?.work;
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors?.dot }} />
                <span className="font-caption text-xs text-[var(--color-muted-foreground)] capitalize">{cat}</span>
                <span className="font-data text-xs text-[var(--color-foreground)]">{(mins / 60)?.toFixed(1)}h</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Icon name="CheckCircle" size={14} color="var(--color-success)" />
          <span className="font-caption text-xs text-[var(--color-muted-foreground)]">
            {progress}% complete
          </span>
          <div className="w-20 h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-success)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaySummaryBar;