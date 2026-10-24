import React from "react";
import Icon from '../../../components/AppIcon';

const CATEGORY_COLORS = {
  work: { bg: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-950", border: "border-blue-400", text: "text-blue-700 dark:text-blue-300", dot: "#3B82F6" },
  languages: { bg: "bg-amber-400", light: "bg-amber-50 dark:bg-amber-950", border: "border-amber-400", text: "text-amber-700 dark:text-amber-300", dot: "#FBBF24" },
  literature: { bg: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-950", border: "border-orange-400", text: "text-orange-700 dark:text-orange-300", dot: "#F97316" },
  coding: { bg: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-400", text: "text-emerald-700 dark:text-emerald-300", dot: "#10B981" },
  leadership: { bg: "bg-purple-500", light: "bg-purple-50 dark:bg-purple-950", border: "border-purple-400", text: "text-purple-700 dark:text-purple-300", dot: "#A855F7" },
  spirituality: { bg: "bg-violet-500", light: "bg-violet-50 dark:bg-violet-950", border: "border-violet-400", text: "text-violet-700 dark:text-violet-300", dot: "#8B5CF6" },
  chores: { bg: "bg-rose-500", light: "bg-rose-50 dark:bg-rose-950", border: "border-rose-400", text: "text-rose-700 dark:text-rose-300", dot: "#F43F5E" },
  meals: { bg: "bg-yellow-500", light: "bg-yellow-50 dark:bg-yellow-950", border: "border-yellow-400", text: "text-yellow-700 dark:text-yellow-300", dot: "#EAB308" },
  leisure: { bg: "bg-slate-400", light: "bg-slate-50 dark:bg-slate-800", border: "border-slate-400", text: "text-slate-600 dark:text-slate-300", dot: "#94A3B8" },
  health: { bg: "bg-teal-500", light: "bg-teal-50 dark:bg-teal-950", border: "border-teal-400", text: "text-teal-700 dark:text-teal-300", dot: "#14B8A6" },
  family: { bg: "bg-pink-500", light: "bg-pink-50 dark:bg-pink-950", border: "border-pink-400", text: "text-pink-700 dark:text-pink-300", dot: "#EC4899" },
  social: { bg: "bg-cyan-500", light: "bg-cyan-50 dark:bg-cyan-950", border: "border-cyan-400", text: "text-cyan-700 dark:text-cyan-300", dot: "#06B6D4" },
};

const formatTime = (timeStr, use24h) => {
  if (!timeStr) return "";
  const [h, m] = timeStr?.split(":")?.map(Number);
  if (use24h) return `${String(h)?.padStart(2, "0")}:${String(m)?.padStart(2, "0")}`;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m)?.padStart(2, "0")} ${period}`;
};

const TimelineBlock = ({ block, isActive, isPast, use24h, onClick, onToggleComplete, onEditPerformance, pixelsPerMinute, startMinute, dragHandleProps, draggableProps, innerRef }) => {
  const colors = CATEGORY_COLORS?.[block?.category] || CATEGORY_COLORS?.work;
  const [sh, sm] = block?.startTime?.split(":")?.map(Number);
  const blockStartMin = sh * 60 + sm;
  const topOffset = (blockStartMin - startMinute) * pixelsPerMinute;
  const height = Math.max(block?.duration * pixelsPerMinute, 44);
  const isCompleted = block?.isCompleted === true;
  const attachmentCount = block?.attachmentCount || 0;
  const hasRating = isCompleted && block?.rating;

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={`absolute left-0 right-0 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${colors?.light} ${colors?.border} ${
        isPast || isCompleted ? "opacity-60" : ""
      }`}
      style={{ top: topOffset, height, zIndex: isActive ? 10 : 5, ...(draggableProps?.style || {}) }}
      onClick={() => onClick(block)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e?.key === "Enter" && onClick(block)}
      aria-label={`${block?.title} at ${formatTime(block?.startTime, use24h)}, duration ${block?.duration} minutes`}
    >
      <div className="flex items-start gap-2 p-2 h-full overflow-hidden">
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing opacity-40 hover:opacity-80"
            onClick={(e) => e?.stopPropagation()}
          >
            <Icon name="GripVertical" size={14} color="currentColor" className={colors?.text} />
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-heading font-semibold text-xs md:text-sm truncate ${colors?.text} ${
              isCompleted ? 'line-through' : ''
            }`}>
              {block?.title}
            </span>
            {isActive && !isCompleted && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-caption font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Now
              </span>
            )}
            {/* Attachment indicator */}
            {attachmentCount > 0 && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/10 dark:bg-white/10" title={`${attachmentCount} attachment${attachmentCount > 1 ? 's' : ''}`}>
                <Icon name="Paperclip" size={9} color="currentColor" className={colors?.text} />
                <span className={`font-data text-xs leading-none ${colors?.text}`}>{attachmentCount}</span>
              </span>
            )}
            {/* Rating indicator */}
            {hasRating && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-yellow-400/20" title={`Rating: ${block?.rating}/5`}>
                <Icon name="Star" size={9} color="#fbbf24" fill="#fbbf24" />
                <span className="font-data text-xs leading-none text-yellow-400">{block?.rating}</span>
              </span>
            )}
          </div>
          {height >= 52 && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-data text-xs text-muted-foreground">
                {formatTime(block?.startTime, use24h)} – {formatTime(block?.endTime, use24h)}
              </span>
              <span className={`text-xs font-caption capitalize px-1.5 py-0.5 rounded ${colors?.bg} text-white`}>
                {block?.category}
              </span>
            </div>
          )}
          {height >= 72 && block?.mode && (
            <div className="flex items-center gap-1 mt-1">
              <Icon name={block?.mode === "strict" ? "Lock" : "Shuffle"} size={10} color="currentColor" className="text-muted-foreground" />
              <span className="text-xs font-caption text-muted-foreground capitalize">{block?.mode}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {/* Completion button */}
          <button
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? `${colors?.bg} border-transparent`
                : `bg-transparent ${colors?.border}`
            }`}
            onClick={(e) => {
              e?.stopPropagation();
              onToggleComplete?.(block?.id);
            }}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted && <Icon name="Check" size={12} color="#fff" strokeWidth={3} />}
          </button>
          {/* Edit performance button — visible on completed tasks or past tasks */}
          {(isCompleted || isPast) && onEditPerformance && (
            <button
              className="w-6 h-6 rounded-full border border-slate-400/40 bg-slate-700/40 flex items-center justify-center transition-all duration-200 hover:bg-indigo-500/30 hover:border-indigo-400/60"
              onClick={(e) => {
                e?.stopPropagation();
                onEditPerformance?.(block);
              }}
              aria-label="Edit performance rating"
              title="Update performance rating"
            >
              <Icon name="Star" size={10} color="#a5b4fc" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { CATEGORY_COLORS, formatTime };
export default TimelineBlock;