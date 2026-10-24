import React from "react";
import Icon from '../../../components/AppIcon';

const CATEGORY_COLORS = {
  work: "var(--color-work)",
  languages: "var(--color-learning)",
  literature: "var(--color-creative)",
  coding: "var(--color-health)",
  leadership: "var(--color-accent)",
  spirituality: "var(--color-personal)",
  chores: "var(--color-destructive)",
  meals: "var(--color-warning)",
  leisure: "var(--color-secondary)",
};

const NextUpCard = ({ task }) => {
  if (!task) return null;

  const color = CATEGORY_COLORS?.[task?.category] || "var(--color-primary)";

  return (
    <div className="card p-4 md:p-5 flex items-center gap-3">
      <div
        className="w-2 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-caption text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide">
          Next Up
        </p>
        <p className="font-heading text-sm md:text-base font-semibold text-[var(--color-foreground)] truncate">
          {task?.title}
        </p>
        <p className="font-data text-xs text-[var(--color-muted-foreground)] mt-0.5">
          Starts at {task?.startTime}
        </p>
      </div>
      <div className="flex-shrink-0">
        <Icon name="ChevronRight" size={16} color="var(--color-muted-foreground)" />
      </div>
    </div>
  );
};

export default NextUpCard;