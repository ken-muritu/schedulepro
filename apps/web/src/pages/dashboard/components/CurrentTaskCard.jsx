import React from "react";
import { useNavigate } from "react-router-dom";
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
  health: "var(--color-success)",
  family: "var(--color-family)",
  social: "var(--color-social)",
};

const CATEGORY_ICONS = {
  work: "Briefcase",
  languages: "Languages",
  literature: "BookOpen",
  coding: "Code2",
  leadership: "Users",
  spirituality: "Sparkles",
  chores: "Home",
  meals: "UtensilsCrossed",
  leisure: "Coffee",
  health: "Heart",
  family: "Heart",
  social: "Users",
};

const CurrentTaskCard = ({ task, remainingMinutes }) => {
  const navigate = useNavigate();

  if (!task) {
    return (
      <div className="card p-4 md:p-5 border-l-4" style={{ borderLeftColor: "var(--color-muted)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-muted)] flex items-center justify-center flex-shrink-0">
            <Icon name="Clock" size={18} color="var(--color-muted-foreground)" />
          </div>
          <div>
            <p className="font-caption text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide">Current Block</p>
            <p className="font-heading text-base font-semibold text-[var(--color-muted-foreground)]">No active block</p>
          </div>
        </div>
      </div>
    );
  }

  const color = CATEGORY_COLORS?.[task?.category] || "var(--color-primary)";
  const iconName = CATEGORY_ICONS?.[task?.category] || "Clock";

  return (
    <div className="card p-4 md:p-5 border-l-4 relative overflow-hidden" style={{ borderLeftColor: color }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: color }} />
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
          <Icon name={iconName} size={18} color={color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-caption text-xs uppercase tracking-wide font-medium" style={{ color }}>
              Current Block
            </p>
            <span className="active-time-block flex items-center gap-1 font-data text-xs font-medium text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block" />
              Live
            </span>
          </div>
          <p className="font-heading text-base md:text-lg font-semibold text-[var(--color-foreground)] mt-0.5 truncate">
            {task?.title}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-data text-xs text-[var(--color-muted-foreground)]">
              {task?.startTime} – {task?.endTime}
            </span>
            {remainingMinutes !== null && (
              <span className="font-caption text-xs text-[var(--color-warning)]">
                {remainingMinutes}m remaining
              </span>
            )}
          </div>
          {/* Focus Mode Button */}
          <button
            onClick={() => navigate('/focus')}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 active:scale-95"
            style={{ background: color + '20', color, border: `1px solid ${color}44` }}
          >
            <Icon name="Target" size={13} color="currentColor" />
            Enter Focus Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentTaskCard;