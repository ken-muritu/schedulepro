import React, { useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

const HistoryDatePicker = ({ dates, selectedDate, onSelectDate, datesWithData }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef?.current && selectedDate) {
      const selectedEl = scrollRef?.current?.querySelector('[data-selected="true"]');
      selectedEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 px-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {dates?.map((dateStr) => {
        const date = parseISO(dateStr + 'T12:00:00');
        const isSelected = selectedDate === dateStr;
        const hasData = datesWithData?.includes(dateStr);
        const dayLabel = format(date, 'EEE');
        const dayNum = format(date, 'd');

        return (
          <button
            key={dateStr}
            data-selected={isSelected}
            onClick={() => onSelectDate(dateStr)}
            className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative"
            style={{
              background: isSelected
                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                : hasData
                ? 'rgba(99,102,241,0.12)'
                : 'var(--color-muted)',
              border: isSelected
                ? '1px solid rgba(99,102,241,0.6)'
                : hasData
                ? '1px solid rgba(99,102,241,0.3)'
                : '1px solid var(--color-border)',
              minWidth: '52px',
            }}
          >
            <span
              className="font-caption text-xs font-medium"
              style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--color-muted-foreground)' }}
            >
              {dayLabel}
            </span>
            <span
              className="font-data text-sm font-bold"
              style={{ color: isSelected ? '#fff' : hasData ? '#6366f1' : 'var(--color-foreground)' }}
            >
              {dayNum}
            </span>
            {hasData && !isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute bottom-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HistoryDatePicker;
