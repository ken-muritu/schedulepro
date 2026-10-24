import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import TaskEditorModal from '../../components/ui/TaskEditorModal';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

import WeeklyGrid from "./components/WeeklyGrid";
import MobileDayView from "./components/MobileDayView";
import WeekSummaryBar from "./components/WeekSummaryBar";
import CategoryLegend from "./components/CategoryLegend";
import WeeklyProgressBar from '../../components/WeeklyProgressBar';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import { getTasksForDate } from '@schedulepro/shared/src/utils/recurrence';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekLabel() {
  const now = new Date();
  const day = now?.getDay();
  const sun = new Date(now);
  sun?.setDate(now?.getDate() - day);
  const sat = new Date(sun);
  sat?.setDate(sun?.getDate() + 6);
  const fmt = (d) => d?.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(sun)} – ${fmt(sat)}, ${now?.getFullYear()}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const WeeklyPlanner = () => {
  const navigate = useNavigate();
  const { tasks, saveTask, deleteTask, loading } = useScheduleContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultDay, setDefaultDay] = useState(null);
  const [scheduleMode, setScheduleMode] = useState("flexible");
  const [timeFormat, setTimeFormat] = useState("12h");
  const [mobileDayIndex, setMobileDayIndex] = useState(new Date()?.getDay());
  const [attachmentCounts, setAttachmentCounts] = useState({});

  const weekLabel = useMemo(() => getWeekLabel(), []);

  // Fetch attachment counts for all tasks
  useEffect(() => {
    const ids = tasks?.map((t) => t?.id)?.filter(Boolean);
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
  }, [tasks]);

  // Expand recurring tasks for each day of the current week
  const expandedTasks = useMemo(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday?.setDate(today?.getDate() - today?.getDay());
    const allExpanded = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day?.setDate(sunday?.getDate() + i);
      const dayTasks = getTasksForDate(tasks, day);
      dayTasks?.forEach((t) => {
        // Avoid duplicates: use composite key id+day
        const key = `${t?.id}_${t?.day}`;
        if (!allExpanded?.find((e) => `${e?.id}_${e?.day}` === key)) {
          allExpanded?.push(t);
        }
      });
    }
    return allExpanded;
  }, [tasks]);

  const tasksWithAttachments = useMemo(
    () => expandedTasks?.map((t) => ({ ...t, attachmentCount: attachmentCounts?.[t?.id] || 0 })),
    [expandedTasks, attachmentCounts]
  );

  const taskCounts = useMemo(() => {
    const counts = {};
    expandedTasks?.forEach((t) => {
      counts[t.category] = (counts?.[t?.category] || 0) + 1;
    });
    return counts;
  }, [expandedTasks]);

  const totalHours = useMemo(
    () => expandedTasks?.reduce((sum, t) => sum + (t?.duration || 0) / 60, 0),
    [expandedTasks]
  );

  const handleOpenAdd = useCallback((dayIdx = null) => {
    setEditingTask(null);
    setDefaultDay(dayIdx);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((task) => {
    setEditingTask(task);
    setDefaultDay(null);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(async (savedTask) => {
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = savedTask?.dayOfWeek !== undefined ? savedTask?.dayOfWeek : (defaultDay !== null ? defaultDay : new Date()?.getDay());
    const dayName = DAYS?.[dayOfWeek];
    const taskWithDay = { ...savedTask, dayOfWeek, day: dayName };
    const saved = await saveTask(taskWithDay);
    setIsModalOpen(false);
    return saved;
  }, [defaultDay, saveTask]);

  const handleDelete = useCallback((taskId) => {
    deleteTask(taskId);
    setIsModalOpen(false);
  }, [deleteTask]);

  const handleModeToggle = useCallback((mode) => {
    setScheduleMode(mode);
  }, []);

  // Prepare editingTask with date field for modal compatibility
  const modalTask = useMemo(() => {
    if (!editingTask) {
      if (defaultDay !== null) {
        const today = new Date();
        const diff = defaultDay - today?.getDay();
        const target = new Date(today);
        target?.setDate(today?.getDate() + diff);
        return { dayOfWeek: defaultDay, date: target?.toISOString()?.split("T")?.[0] };
      }
      return null;
    }
    const today = new Date();
    const diff = editingTask?.dayOfWeek - today?.getDay();
    const target = new Date(today);
    target?.setDate(today?.getDate() + diff);
    return { ...editingTask, date: target?.toISOString()?.split("T")?.[0] };
  }, [editingTask, defaultDay]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top App Bar */}
      <TopAppBar
        currentMode={scheduleMode}
        onModeToggle={handleModeToggle}
        onAddTask={() => handleOpenAdd()}
      />
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="CalendarDays" size={20} color="var(--color-primary)" />
          <h1 className="font-heading text-lg md:text-xl font-semibold text-foreground">Weekly Planner</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="mode-toggle hidden sm:flex">
            <button
              className={`mode-toggle-btn ${timeFormat === "12h" ? "active" : ""}`}
              onClick={() => setTimeFormat("12h")}
            >
              12h
            </button>
            <button
              className={`mode-toggle-btn ${timeFormat === "24h" ? "active" : ""}`}
              onClick={() => setTimeFormat("24h")}
            >
              24h
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="CalendarClock"
            iconPosition="left"
            iconSize={14}
            onClick={() => navigate("/daily-view")}
            className="hidden sm:flex"
          >
            Daily View
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            iconSize={14}
            onClick={() => handleOpenAdd()}
            className="hidden lg:flex"
          >
            Add Task
          </Button>
        </div>
      </div>
      {/* Summary Bar */}
      <WeekSummaryBar
        totalTasks={tasks?.length}
        totalHours={totalHours}
        weekLabel={weekLabel}
      />
      {/* Weekly Progress Bar */}
      <WeeklyProgressBar tasks={tasks} />
      {/* Category Legend */}
      <div className="border-b border-border bg-card flex-shrink-0">
        <CategoryLegend taskCounts={taskCounts} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 font-body text-sm text-[var(--color-muted-foreground)]">Loading schedule…</span>
        </div>
      )}

      {/* Main Content */}
      {/* Desktop: Weekly Grid */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <WeeklyGrid
          tasks={tasksWithAttachments}
          onEditTask={handleOpenEdit}
          onAddTask={handleOpenAdd}
          timeFormat={timeFormat}
          weekDates={[]}
          onTasksChange={() => {}}
        />
      </div>
      {/* Tablet: Weekly Grid (scrollable) */}
      <div className="hidden md:flex lg:hidden flex-1 overflow-hidden">
        <WeeklyGrid
          tasks={tasksWithAttachments}
          onEditTask={handleOpenEdit}
          onAddTask={handleOpenAdd}
          timeFormat={timeFormat}
          weekDates={[]}
          onTasksChange={() => {}}
        />
      </div>
      {/* Mobile: Single Day View */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        <MobileDayView
          selectedDay={mobileDayIndex}
          onDayChange={setMobileDayIndex}
          tasks={tasks}
          onEditTask={handleOpenEdit}
          onAddTask={handleOpenAdd}
          timeFormat={timeFormat}
        />
      </div>
      {/* Bottom Navigation */}
      <BottomTabNavigation />
      {/* Task Editor Modal */}
      <TaskEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTask={modalTask}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default WeeklyPlanner;