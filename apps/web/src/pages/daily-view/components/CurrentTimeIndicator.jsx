import React from "react";
import { formatTime } from "./TimelineBlock";

const CurrentTimeIndicator = ({ currentMinute, startMinute, pixelsPerMinute, use24h }) => {
  const top = (currentMinute - startMinute) * pixelsPerMinute;
  const h = Math.floor(currentMinute / 60);
  const m = currentMinute % 60;
  const timeStr = `${String(h)?.padStart(2, "0")}:${String(m)?.padStart(2, "0")}`;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-1">
        <span className="flex-shrink-0 font-data text-xs text-red-500 bg-red-50 dark:bg-red-950 px-1 py-0.5 rounded font-medium leading-none">
          {formatTime(timeStr, use24h)}
        </span>
        <div className="flex-1 h-0.5 bg-red-500 relative">
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500" />
        </div>
      </div>
    </div>
  );
};

export default CurrentTimeIndicator;