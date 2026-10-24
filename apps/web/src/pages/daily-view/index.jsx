import React, { useState, useEffect, useRef, useCallback } from "react";
import { addDays, subDays, isToday } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import TaskEditorModal from '../../components/ui/TaskEditorModal';
import TaskCompletionRatingModal from '../../components/ui/TaskCompletionRatingModal';

import DayNavigation from "./components/DayNavigation";
import TimelineBlock from "./components/TimelineBlock";
import CurrentTimeIndicator from "./components/CurrentTimeIndicator";
import TimeAxisLabel from "./components/TimeAxisLabel";
import EmptyDayState from "./components/EmptyDayState";
import DaySummaryBar from "./components/DaySummaryBar";
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import { getTasksForDate } from '@schedulepro/shared/src/utils/recurrence';

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PIXELS_PER_MINUTE = 1.2;
const TIMELINE_PADDING_HOURS = 1;

const getCurrentMinute = () => {
  const now = new Date();
  return now?.getHours() * 60 + now?.getMinutes();
};

const minutesToTime = (minutes) => {
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h?.toString()?.padStart(2, '0')}:${m?.toString()?.padStart(2, '0')}`;
};

const DailyView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [use24h, setUse24h] = useState(false);
  const [scheduleMode, setScheduleMode] = useState("flexible");
  const [currentMinute, setCurrentMinute] = useState(getCurrentMinute());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [suggestedStartTime, setSuggestedStartTime] = useState(null);
  const [attachmentCounts, setAttachmentCounts] = useState({});
  const timelineRef = useRef(null);
  const currentTimeRef = useRef(null);
  const [ratingModal, setRatingModal] = useState(null); // { task, isEdit }

  const { tasks, saveTask, deleteTask, toggleCompletion, updatePerformance, loading } = useScheduleContext();

  const dayName = DAY_NAMES?.[selectedDate?.getDay()];

  useEffect(() => {
    const interval = setInterval(() => setCurrentMinute(getCurrentMinute()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch attachment counts for visible day's tasks
  useEffect(() => {
    const ids = getTasksForDate(tasks, selectedDate)?.map((t) => t?.id);
    if (!ids?.length) { setAttachmentCounts({}); return; }
    supabase
      ?.from('task_attachments')
      ?.select('task_id')
      ?.in('task_id', ids)
      ?.then(({ data }) => {
        if (!data) return;
        const counts = {};
        data?.forEach((row) => {
          counts[row?.task_id] = (counts?.[row?.task_id] || 0) + 1;
        });
        setAttachmentCounts(counts);
      });
  }, [tasks, selectedDate]);

  useEffect(() => {
    if (isToday(selectedDate) && currentTimeRef?.current) {
      setTimeout(() => {
        currentTimeRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [selectedDate]);

  const dayBlocks = getTasksForDate(tasks, selectedDate)
    ?.sort((a, b) => {
      const [ah, am] = a?.startTime?.split(":")?.map(Number);
      const [bh, bm] = b?.startTime?.split(":")?.map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    })
    ?.map((b) => ({ ...b, attachmentCount: attachmentCounts?.[b?.id] || 0 }));

  const timelineBounds = (() => {
    if (dayBlocks?.length === 0) return { startHour: 6, endHour: 22 };
    const minutes = dayBlocks?.flatMap((b) => {
      const [sh, sm] = b?.startTime?.split(":")?.map(Number);
      const [eh, em] = b?.endTime?.split(":")?.map(Number);
      return [sh * 60 + sm, eh * 60 + em];
    });
    const minMin = Math.min(...minutes);
    const maxMin = Math.max(...minutes);
    const startHour = Math.max(0, Math.floor(minMin / 60) - TIMELINE_PADDING_HOURS);
    const endHour = Math.min(24, Math.ceil(maxMin / 60) + TIMELINE_PADDING_HOURS);
    return { startHour, endHour };
  })();

  const startMinute = timelineBounds?.startHour * 60;
  const endMinute = timelineBounds?.endHour * 60;
  const totalMinutes = endMinute - startMinute;
  const timelineHeight = totalMinutes * PIXELS_PER_MINUTE;

  const hourMarkers = [];
  for (let h = timelineBounds?.startHour; h <= timelineBounds?.endHour; h++) {
    hourMarkers?.push(h);
  }

  const isBlockActive = (block) => {
    if (!isToday(selectedDate)) return false;
    const [sh, sm] = block?.startTime?.split(":")?.map(Number);
    const [eh, em] = block?.endTime?.split(":")?.map(Number);
    return sh * 60 + sm <= currentMinute && currentMinute < eh * 60 + em;
  };

  const isBlockPast = (block) => {
    if (!isToday(selectedDate)) return false;
    const [eh, em] = block?.endTime?.split(":")?.map(Number);
    return eh * 60 + em <= currentMinute;
  };

  const showCurrentTime =
    isToday(selectedDate) && currentMinute >= startMinute && currentMinute <= endMinute;

  const handleBlockClick = useCallback((block) => {
    setEditingTask(block);
    setSuggestedStartTime(null);
    setIsModalOpen(true);
  }, []);

  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    // Find the nearest open time: latest endTime of today's blocks, or current time if no blocks
    const todayBlocks = tasks
      ?.filter((t) => t?.day === dayName)
      ?.sort((a, b) => {
        const [ah, am] = (a?.endTime || '00:00')?.split(':')?.map(Number);
        const [bh, bm] = (b?.endTime || '00:00')?.split(':')?.map(Number);
        return (bh * 60 + bm) - (ah * 60 + am);
      });
    if (todayBlocks?.length > 0) {
      const latestEnd = todayBlocks?.[0]?.endTime;
      setSuggestedStartTime(latestEnd || null);
    } else {
      // Default to current time rounded to nearest 15 min
      const now = new Date();
      const totalMins = now?.getHours() * 60 + now?.getMinutes();
      const rounded = Math.ceil(totalMins / 15) * 15;
      setSuggestedStartTime(minutesToTime(Math.min(rounded, 1439)));
    }
    setIsModalOpen(true);
  }, [tasks, dayName]);

  // Intercept checkmark: show rating modal before completing
  const handleToggleComplete = useCallback((taskId) => {
    const task = tasks?.find((t) => t?.id === taskId);
    if (!task) return;
    if (!task?.isCompleted) {
      // About to complete — show rating modal first
      setRatingModal({ task, isEdit: false });
    } else {
      // Unchecking — toggle directly
      toggleCompletion(taskId);
    }
  }, [tasks, toggleCompletion]);

  const handleRatingSave = useCallback(async (ratingData) => {
    if (!ratingModal) return;
    if (ratingModal?.isEdit) {
      await updatePerformance(ratingModal?.task?.id, ratingData);
    } else {
      await toggleCompletion(ratingModal?.task?.id, ratingData);
    }
    setRatingModal(null);
  }, [ratingModal, toggleCompletion, updatePerformance]);

  const handleRatingSkip = useCallback(async () => {
    if (!ratingModal) return;
    if (!ratingModal?.isEdit) {
      await toggleCompletion(ratingModal?.task?.id, null);
    }
    setRatingModal(null);
  }, [ratingModal, toggleCompletion]);

  const handleEditPerformance = useCallback((block) => {
    setRatingModal({ task: block, isEdit: true });
  }, []);

  const handleSave = useCallback(async (taskData) => {
    const taskWithDay = { ...taskData, day: dayName };
    const saved = await saveTask(taskWithDay);
    return saved;
  }, [saveTask, dayName]);

  const handleDelete = useCallback((taskId) => {
    deleteTask(taskId);
  }, [deleteTask]);

  const handleDragEnd = useCallback((result) => {
    if (!result?.destination) return;
    const { source, destination } = result;
    if (source?.index === destination?.index) return;

    // Use the already-sorted dayBlocks (which are sorted by startTime)
    const reordered = Array.from(dayBlocks);
    const [removed] = reordered?.splice(source?.index, 1);
    reordered?.splice(destination?.index, 0, removed);

    // The dragged tile takes the start time of the tile that was at the destination index.
    // All subsequent tiles are shifted down by the dragged tile's duration.
    if (reordered?.length > 0) {
      // Determine the anchor start time: the start time of the slot at destination
      // Before the splice, the tile at destination?.index had a certain startTime.
      // We use the original sorted list to get that anchor.
      const originalSorted = Array.from(dayBlocks);
      const anchorIndex = destination?.index;
      // The anchor is the tile that was at destination in the ORIGINAL list
      // (before the dragged tile was removed). If dragging down, the anchor is
      // the tile that was at destination; if dragging up, same logic applies.
      const anchorStartMinutes = (() => {
        // Get the start time of the tile that occupied the destination slot originally
        const anchorTile = originalSorted?.[anchorIndex];
        if (!anchorTile?.startTime) return null;
        const [h, m] = anchorTile?.startTime?.split(':')?.map(Number);
        return h * 60 + m;
      })();

      if (anchorStartMinutes !== null) {
        // Place the dragged tile at the anchor start time
        // Then cascade all tiles after it
        let cursor = anchorStartMinutes;
        reordered?.forEach((t, idx) => {
          if (idx === destination?.index) {
            // This is the dragged tile — place at anchor
            const startH = Math.floor(cursor / 60)?.toString()?.padStart(2, '0');
            const startM = (cursor % 60)?.toString()?.padStart(2, '0');
            const dur = t?.duration || 30;
            const endMin = cursor + dur;
            const endH = Math.floor(endMin / 60)?.toString()?.padStart(2, '0');
            const endM = (endMin % 60)?.toString()?.padStart(2, '0');
            t.startTime = `${startH}:${startM}`;
            t.endTime = `${endH}:${endM}`;
            cursor = endMin;
          } else if (idx > destination?.index) {
            // Tiles after the dragged tile — shift down
            const startH = Math.floor(cursor / 60)?.toString()?.padStart(2, '0');
            const startM = (cursor % 60)?.toString()?.padStart(2, '0');
            const dur = t?.duration || 30;
            const endMin = cursor + dur;
            const endH = Math.floor(endMin / 60)?.toString()?.padStart(2, '0');
            const endM = (endMin % 60)?.toString()?.padStart(2, '0');
            t.startTime = `${startH}:${startM}`;
            t.endTime = `${endH}:${endM}`;
            cursor = endMin;
          }
          // Tiles before the dragged tile keep their original times
        });
      }
    }

    // Save each reordered task back to Supabase
    reordered?.forEach((t) => saveTask(t));
  }, [tasks, dayName, saveTask, dayBlocks]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <TopAppBar
        currentMode={scheduleMode}
        onModeToggle={setScheduleMode}
        onAddTask={handleAddTask}
      />
      <div className="flex-1 flex flex-col content-area overflow-hidden">
        <DayNavigation
          selectedDate={selectedDate}
          onPrev={() => setSelectedDate((d) => subDays(d, 1))}
          onNext={() => setSelectedDate((d) => addDays(d, 1))}
          onToday={() => setSelectedDate(new Date())}
        />

        {dayBlocks?.length > 0 && (
          <DaySummaryBar blocks={dayBlocks} currentMinute={currentMinute} />
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 font-body text-sm text-[var(--color-muted-foreground)]">Loading…</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto" ref={timelineRef}>
          {!loading && dayBlocks?.length === 0 ? (
            <EmptyDayState onAddTask={handleAddTask} />
          ) : (
            <div className="px-4 md:px-6 py-4">
              <div
                className="relative"
                style={{ height: timelineHeight + 32, minHeight: 400 }}
              >
                {hourMarkers?.map((hour) => (
                  <TimeAxisLabel
                    key={hour}
                    hour={hour}
                    startMinute={startMinute}
                    pixelsPerMinute={PIXELS_PER_MINUTE}
                    use24h={use24h}
                  />
                ))}

                <div className="absolute left-16 right-0 top-0 bottom-0">
                  {showCurrentTime && (
                    <div ref={currentTimeRef}>
                      <CurrentTimeIndicator
                        currentMinute={currentMinute}
                        startMinute={startMinute}
                        pixelsPerMinute={PIXELS_PER_MINUTE}
                        use24h={use24h}
                      />
                    </div>
                  )}

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="daily-timeline" direction="vertical">
                      {(provided) => (
                        <div
                          ref={provided?.innerRef}
                          {...provided?.droppableProps}
                          className="absolute inset-0"
                        >
                          {dayBlocks?.map((block, index) => (
                            <Draggable key={block?.id} draggableId={block?.id} index={index}>
                              {(dragProvided) => (
                                <TimelineBlock
                                  key={block?.id}
                                  block={block}
                                  isActive={isBlockActive(block)}
                                  isPast={isBlockPast(block)}
                                  use24h={use24h}
                                  onClick={handleBlockClick}
                                  onToggleComplete={handleToggleComplete}
                                  onEditPerformance={handleEditPerformance}
                                  pixelsPerMinute={PIXELS_PER_MINUTE}
                                  startMinute={startMinute}
                                  innerRef={dragProvided?.innerRef}
                                  draggableProps={dragProvided?.draggableProps}
                                  dragHandleProps={dragProvided?.dragHandleProps}
                                />
                              )}
                            </Draggable>
                          ))}
                          {provided?.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomTabNavigation />
      <TaskEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTask={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        suggestedStartTime={suggestedStartTime}
      />
      {ratingModal && (
        <TaskCompletionRatingModal
          task={ratingModal?.task}
          isEditMode={ratingModal?.isEdit}
          initialRating={ratingModal?.isEdit ? (ratingModal?.task?.rating || 0) : 0}
          initialNotes={ratingModal?.isEdit ? (ratingModal?.task?.completionNotes || '') : ''}
          onSave={handleRatingSave}
          onSkip={handleRatingSkip}
          onClose={() => setRatingModal(null)}
        />
      )}
    </div>
  );
};

export default DailyView;