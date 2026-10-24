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
  family: "Users",
  social: "MessageCircle",
};

const UpcomingTasksList = ({ tasks, onTaskClick, onToggleComplete }) => {
  if (!tasks || tasks?.length === 0) {
    return (
      <div className="card p-4 md:p-5">
        <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)] mb-3">
          Upcoming Blocks
        </h2>
        <p className="font-body text-sm text-[var(--color-muted-foreground)]">
          No more blocks scheduled for today.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4 md:p-5">
      <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)] mb-3">
        Upcoming Blocks
      </h2>
      <div className="flex flex-col gap-2">
        {tasks?.map((task, idx) => {
          const color = CATEGORY_COLORS?.[task?.category] || "var(--color-primary)";
          const iconName = CATEGORY_ICONS?.[task?.category] || "Clock";
          const isCompleted = task?.isCompleted === true;
          return (
            <div
              key={task?.id || idx}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-muted)] transition-smooth ${
                isCompleted ? 'opacity-60' : ''
              }`}
            >
              {/* Completion toggle */}
              <button
                onClick={(e) => onToggleComplete && onToggleComplete(task?.id, e)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                    : 'bg-transparent border-[var(--color-border)] hover:border-[var(--color-success)]'
                }`}
                aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                {isCompleted && <Icon name="Check" size={12} color="#fff" strokeWidth={3} />}
              </button>

              {/* Task info button */}
              <button
                onClick={() => onTaskClick && onTaskClick(task)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left group"
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color + "22" }}
                >
                  <Icon name={iconName} size={14} color={color} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-caption text-sm font-medium text-[var(--color-foreground)] truncate group-hover:text-[var(--color-primary)] transition-smooth ${
                    isCompleted ? 'line-through' : ''
                  }`}>
                    {task?.title}
                  </p>
                  <p className="font-data text-xs text-[var(--color-muted-foreground)]">
                    {task?.startTime} – {task?.endTime}
                  </p>
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingTasksList;