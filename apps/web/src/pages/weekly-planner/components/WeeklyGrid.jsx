import React, { useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_HEIGHT = 60;
const START_HOUR = 5;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr?.split(":")?.map(Number);
  return h * 60 + m;
}

function formatTime12(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr?.split(":")?.map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m?.toString()?.padStart(2, "0")} ${ampm}`;
}

const TimeBlock = ({ task, onEdit, timeFormat, dragHandleProps, draggableProps, innerRef, isDragging }) => {
  const colors = CATEGORY_COLORS?.[task?.category] || CATEGORY_COLORS?.work;
  const startMins = timeToMinutes(task?.startTime) - START_HOUR * 60;
  const durationMins = task?.duration || 60;
  const top = (startMins / 60) * HOUR_HEIGHT;
  const height = Math.max((durationMins / 60) * HOUR_HEIGHT, 24);
  const isShort = height < 40;
  const isCompleted = task?.isCompleted === true;
  const attachmentCount = task?.attachmentCount || 0;

  const displayTime = timeFormat === "24h" ? task?.startTime : formatTime12(task?.startTime);

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={`absolute left-0.5 right-0.5 rounded-md border-l-2 ${colors?.light} ${colors?.border} transition-smooth text-left overflow-hidden group ${
        isDragging ? 'shadow-lg ring-2 ring-indigo-400 z-50' : ''
      } ${isCompleted ? 'opacity-50' : ''}`}
      style={{ top: `${top}px`, height: `${height}px`, ...(draggableProps?.style || {}) }}
    >
      <div className="px-1.5 py-0.5 h-full flex flex-col justify-start overflow-hidden">
        <div className="flex items-center gap-1">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="flex-shrink-0 opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing"
            onClick={(e) => e?.stopPropagation()}
          >
            <Icon name="GripVertical" size={10} color="currentColor" className={colors?.text} />
          </div>
          <button
            onClick={() => onEdit(task)}
            className="flex-1 text-left focus:outline-none"
            aria-label={`Edit ${task?.title} at ${displayTime}`}
          >
            <p className={`font-caption text-xs font-semibold leading-tight truncate ${colors?.text} ${
              isCompleted ? 'line-through' : ''
            }`}>
              {task?.title}
            </p>
            {!isShort && (
              <p className={`font-data text-xs leading-tight truncate ${colors?.text} opacity-75`}>
                {displayTime}
              </p>
            )}
          </button>
          {/* Attachment indicator */}
          {attachmentCount > 0 && (
            <span
              className="flex-shrink-0 inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/10 dark:bg-white/10"
              title={`${attachmentCount} attachment${attachmentCount > 1 ? 's' : ''}`}
            >
              <Icon name="Paperclip" size={8} color="currentColor" className={colors?.text} />
              <span className={`font-data text-xs leading-none ${colors?.text}`}>{attachmentCount}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const DayColumn = ({ dayIndex, dayLabel, tasks, onEdit, onAddForDay, timeFormat, isToday, onDragEnd }) => {
  return (
    <div className="flex flex-col min-w-0">
      <div className={`sticky top-0 z-10 flex flex-col items-center justify-center py-2 border-b border-border ${
        isToday ? "bg-primary/10" : "bg-card"
      }`}>
        <span className={`font-caption text-xs font-medium uppercase tracking-wide ${
          isToday ? "text-primary" : "text-muted-foreground"
        }`}>
          {dayLabel}
        </span>
        {isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />}
      </div>
      <Droppable droppableId={String(dayIndex)} direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided?.innerRef}
            {...provided?.droppableProps}
            className={`relative flex-1 border-r border-border cursor-pointer ${
              snapshot?.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''
            }`}
            style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
            onClick={(e) => {
              if (e?.target === e?.currentTarget) onAddForDay(dayIndex);
            }}
          >
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-border/40"
                style={{ top: `${i * HOUR_HEIGHT}px` }}
              />
            ))}
            {tasks?.map((task, index) => (
              <Draggable key={task?.id} draggableId={task?.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <TimeBlock
                    key={task?.id}
                    task={task}
                    onEdit={onEdit}
                    timeFormat={timeFormat}
                    innerRef={dragProvided?.innerRef}
                    draggableProps={dragProvided?.draggableProps}
                    dragHandleProps={dragProvided?.dragHandleProps}
                    isDragging={dragSnapshot?.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {provided?.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const WeeklyGrid = ({ tasks, onEditTask, onAddTask, timeFormat, weekDates, onTasksChange }) => {
  const todayDayIndex = new Date()?.getDay();

  const tasksByDay = useMemo(() => {
    const map = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    tasks?.forEach((t) => {
      const d = parseInt(t?.dayOfWeek, 10);
      if (!isNaN(d) && d >= 0 && d <= 6) map?.[d]?.push(t);
    });
    return map;
  }, [tasks]);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const handleDragEnd = (result) => {
    if (!result?.destination) return;
    const { source, destination, draggableId } = result;
    const srcDay = parseInt(source?.droppableId, 10);
    const dstDay = parseInt(destination?.droppableId, 10);

    if (srcDay === dstDay && source?.index === destination?.index) return;

    if (onTasksChange) {
      const updatedTasks = tasks?.map((t) => {
        if (t?.id === draggableId) {
          return { ...t, dayOfWeek: dstDay };
        }
        return t;
      });
      onTasksChange(updatedTasks);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-1 overflow-auto">
        <div className="flex-shrink-0 w-12 md:w-14 border-r border-border bg-card sticky left-0 z-20">
          <div className="h-[52px] border-b border-border" />
          <div className="relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
            {hours?.map((h, i) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: `${i * HOUR_HEIGHT - 8}px` }}
              >
                <span className="font-data text-xs text-muted-foreground">
                  {timeFormat === "24h"
                    ? `${h?.toString()?.padStart(2, "0")}:00`
                    : `${h % 12 || 12}${h < 12 ? "a" : "p"}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 grid grid-cols-7 min-w-0">
          {DAYS?.map((day, idx) => (
            <DayColumn
              key={day}
              dayIndex={idx}
              dayLabel={day}
              tasks={tasksByDay?.[idx] || []}
              onEdit={onEditTask}
              onAddForDay={(dayIdx) => onAddTask(dayIdx)}
              timeFormat={timeFormat}
              isToday={idx === todayDayIndex}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default WeeklyGrid;