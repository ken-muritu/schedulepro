import React from "react";
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CATEGORY_COLORS = {
  work: { light: "bg-blue-50 dark:bg-blue-950", border: "border-blue-400", text: "text-blue-700 dark:text-blue-300", dot: "#3B82F6" },
  languages: { light: "bg-amber-50 dark:bg-amber-950", border: "border-amber-400", text: "text-amber-700 dark:text-amber-300", dot: "#FBBF24" },
  literature: { light: "bg-orange-50 dark:bg-orange-950", border: "border-orange-400", text: "text-orange-700 dark:text-orange-300", dot: "#F97316" },
  coding: { light: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-400", text: "text-emerald-700 dark:text-emerald-300", dot: "#10B981" },
  leadership: { light: "bg-purple-50 dark:bg-purple-950", border: "border-purple-400", text: "text-purple-700 dark:text-purple-300", dot: "#A855F7" },
  spirituality: { light: "bg-violet-50 dark:bg-violet-950", border: "border-violet-400", text: "text-violet-700 dark:text-violet-300", dot: "#8B5CF6" },
  chores: { light: "bg-rose-50 dark:bg-rose-950", border: "border-rose-400", text: "text-rose-700 dark:text-rose-300", dot: "#F43F5E" },
  meals: { light: "bg-yellow-50 dark:bg-yellow-950", border: "border-yellow-400", text: "text-yellow-700 dark:text-yellow-300", dot: "#EAB308" },
  leisure: { light: "bg-slate-50 dark:bg-slate-800", border: "border-slate-400", text: "text-slate-600 dark:text-slate-300", dot: "#94A3B8" },
};

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime12(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr?.split(":")?.map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m?.toString()?.padStart(2, "0")} ${ampm}`;
}

const MobileDayView = ({ selectedDay, onDayChange, tasks, onEditTask, onAddTask, timeFormat }) => {
  const todayDayIndex = new Date()?.getDay();
  const dayTasks = tasks?.filter((t) => parseInt(t?.dayOfWeek, 10) === selectedDay)?.sort((a, b) => (a?.startTime || "")?.localeCompare(b?.startTime || ""));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day Selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDayChange((selectedDay + 6) % 7)}
          aria-label="Previous day"
        >
          <Icon name="ChevronLeft" size={20} color="currentColor" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="font-heading text-base font-semibold text-foreground">
            {DAYS_FULL?.[selectedDay]}
          </span>
          {selectedDay === todayDayIndex && (
            <span className="font-caption text-xs text-primary font-medium">Today</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDayChange((selectedDay + 1) % 7)}
          aria-label="Next day"
        >
          <Icon name="ChevronRight" size={20} color="currentColor" />
        </Button>
      </div>
      {/* Day pills */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-border bg-card">
        {DAYS_SHORT?.map((d, i) => (
          <button
            key={d}
            onClick={() => onDayChange(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-caption text-xs font-medium transition-smooth focus:outline-none focus-ring ${
              i === selectedDay
                ? "bg-primary text-white"
                : i === todayDayIndex
                ? "bg-primary/10 text-primary" :"text-muted-foreground hover:bg-muted"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {dayTasks?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="CalendarDays" size={40} color="var(--color-muted-foreground)" />
            <p className="mt-3 font-heading text-base font-semibold text-foreground">No tasks scheduled</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">Tap the button below to add a task</p>
          </div>
        ) : (
          dayTasks?.map((task) => {
            const colors = CATEGORY_COLORS?.[task?.category] || CATEGORY_COLORS?.work;
            const displayStart = timeFormat === "24h" ? task?.startTime : formatTime12(task?.startTime);
            const endMins = (task?.startTime ? parseInt(task?.startTime?.split(":")?.[0]) * 60 + parseInt(task?.startTime?.split(":")?.[1]) : 0) + (task?.duration || 60);
            const endH = Math.floor(endMins / 60)?.toString()?.padStart(2, "0");
            const endM = (endMins % 60)?.toString()?.padStart(2, "0");
            const endTimeStr = `${endH}:${endM}`;
            const displayEnd = timeFormat === "24h" ? endTimeStr : formatTime12(endTimeStr);

            return (
              <button
                key={task?.id}
                onClick={() => onEditTask(task)}
                className={`w-full text-left rounded-lg border-l-4 ${colors?.light} ${colors?.border} p-3 hover:opacity-90 transition-smooth focus:outline-none focus-ring`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`font-caption text-sm font-semibold truncate ${colors?.text}`}>{task?.title}</p>
                    <p className={`font-data text-xs mt-0.5 ${colors?.text} opacity-75`}>
                      {displayStart} – {displayEnd}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {task?.mode === "strict" && (
                      <span className="font-caption text-xs bg-foreground/10 text-foreground/60 rounded px-1.5 py-0.5">Strict</span>
                    )}
                    <Icon name="ChevronRight" size={14} color="currentColor" className="text-muted-foreground" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
      {/* Add task FAB */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <Button variant="default" fullWidth iconName="Plus" iconPosition="left" onClick={() => onAddTask(selectedDay)}>
          Add Task for {DAYS_SHORT?.[selectedDay]}
        </Button>
      </div>
    </div>
  );
};

export default MobileDayView;