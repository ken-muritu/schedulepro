import React from "react";
import Icon from '../../../components/AppIcon';

const WeekSummaryBar = ({ totalTasks, totalHours, weekLabel }) => {
  return (
    <div className="flex items-center gap-4 md:gap-6 px-4 py-2 bg-muted/50 border-b border-border">
      <div className="flex items-center gap-1.5">
        <Icon name="CalendarDays" size={14} color="var(--color-muted-foreground)" />
        <span className="font-caption text-xs text-muted-foreground">{weekLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Icon name="ListChecks" size={14} color="var(--color-muted-foreground)" />
        <span className="font-caption text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{totalTasks}</span> tasks
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
        <span className="font-caption text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{totalHours?.toFixed(1)}</span>h scheduled
        </span>
      </div>
    </div>
  );
};

export default WeekSummaryBar;