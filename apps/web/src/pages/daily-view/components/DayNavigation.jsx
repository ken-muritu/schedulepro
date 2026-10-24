import React from "react";
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { format, isToday } from "date-fns";

const DayNavigation = ({ selectedDate, onPrev, onNext, onToday }) => {
  const isCurrentDay = isToday(selectedDate);
  const dayLabel = isCurrentDay ? "Today" : format(selectedDate, "EEEE");
  const dateLabel = format(selectedDate, "MMMM d, yyyy");

  return (
    <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 bg-[var(--color-card)] border-b border-[var(--color-border)]">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="flex items-center justify-center w-9 h-9 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-smooth focus:outline-none"
          aria-label="Previous day"
        >
          <Icon name="ChevronLeft" size={20} color="currentColor" />
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center w-9 h-9 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-smooth focus:outline-none"
          aria-label="Next day"
        >
          <Icon name="ChevronRight" size={20} color="currentColor" />
        </button>
      </div>

      <div className="flex flex-col items-center flex-1 min-w-0">
        <h2 className="font-heading font-bold text-base md:text-lg text-[var(--color-foreground)] leading-tight">
          {dayLabel}
        </h2>
        <p className="font-caption text-xs md:text-sm text-[var(--color-muted-foreground)] truncate">
          {dateLabel}
        </p>
      </div>

      <Button
        variant={isCurrentDay ? "default" : "outline"}
        size="sm"
        onClick={onToday}
        iconName="CalendarCheck"
        iconPosition="left"
        iconSize={14}
      >
        Today
      </Button>
    </div>
  );
};

export default DayNavigation;