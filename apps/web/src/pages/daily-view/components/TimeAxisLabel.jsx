import React from "react";
import { formatTime } from "./TimelineBlock";

const TimeAxisLabel = ({ hour, startMinute, pixelsPerMinute, use24h }) => {
  const minute = hour * 60;
  const top = (minute - startMinute) * pixelsPerMinute;
  const timeStr = `${String(hour)?.padStart(2, "0")}:00`;

  return (
    <div
      className="absolute left-0 flex items-center gap-2 pointer-events-none"
      style={{ top: top - 8, zIndex: 1 }}
      aria-hidden="true"
    >
      <span className="font-data text-xs text-[var(--color-muted-foreground)] w-14 text-right flex-shrink-0 leading-none">
        {formatTime(timeStr, use24h)}
      </span>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
};

export default TimeAxisLabel;