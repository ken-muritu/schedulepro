import React, { useState, useEffect, useCallback } from "react";
import { addDays, subDays, format } from "date-fns";
import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import TaskEditorModal from '../../components/ui/TaskEditorModal';
import GreetingHeader from "./components/GreetingHeader";
import DayProgressBar from "./components/DayProgressBar";
import CurrentTaskCard from "./components/CurrentTaskCard";
import NextUpCard from "./components/NextUpCard";
import UpcomingTasksList from "./components/UpcomingTasksList";
import FocusAreaBreakdown from "./components/FocusAreaBreakdown";
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import useTaskNotifications from '@schedulepro/shared/src/hooks/useTaskNotifications';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import { getTasksForDate } from '@schedulepro/shared/src/utils/recurrence';
import Icon from '../../components/AppIcon';
import TaskCompletionRatingModal from '../../components/ui/TaskCompletionRatingModal';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr?.split(":")?.map(Number);
  return h * 60 + m;
}

function getGreeting(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDateLabel(date) {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return date?.toLocaleDateString("en-US", options);
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Dashboard() {
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date()?.getMonth());
  const [pickerYear, setPickerYear] = useState(new Date()?.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [scheduleMode, setScheduleMode] = useState("flexible");
  const [ratingTask, setRatingTask] = useState(null);
  const [pendingToggleId, setPendingToggleId] = useState(null);

  const { user, userProfile } = useAuth();
  const { tasks, saveTask, deleteTask, loading, toggleCompletion } = useScheduleContext();
  useTaskNotifications(tasks);

  const userName = userProfile?.name || user?.email?.split('@')?.[0] || 'Friend';

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isViewingToday = selectedDate?.toDateString() === now?.toDateString();
  const viewDate = selectedDate;

  // Use recurrence-aware filter
  const todayTasks = getTasksForDate(tasks, viewDate)
    ?.sort((a, b) => parseTimeToMinutes(a?.startTime) - parseTimeToMinutes(b?.startTime));

  const nowMinutes = now?.getHours() * 60 + now?.getMinutes();

  const completedCount = todayTasks?.filter((t) =>
    t?.isCompleted === true || (isViewingToday && parseTimeToMinutes(t?.endTime) <= nowMinutes)
  )?.length;

  const progressPct =
    todayTasks?.length > 0 ? Math.round((completedCount / todayTasks?.length) * 100) : 0;

  const currentTask = isViewingToday ? (todayTasks?.find(
    (t) =>
      !t?.isCompleted &&
      parseTimeToMinutes(t?.startTime) <= nowMinutes &&
      parseTimeToMinutes(t?.endTime) > nowMinutes
  ) || null) : null;

  const remainingMinutes = currentTask
    ? parseTimeToMinutes(currentTask?.endTime) - nowMinutes
    : null;

  const upcomingTasks = isViewingToday
    ? todayTasks?.filter((t) => !t?.isCompleted && parseTimeToMinutes(t?.startTime) > nowMinutes)?.slice(0, 5)
    : todayTasks?.slice(0, 5);

  const nextTask = upcomingTasks?.[0] || null;
  const nextFiveTasks = upcomingTasks?.slice(1, 6);

  const focusBreakdown = (() => {
    const map = {};
    todayTasks?.forEach((t) => {
      if (!map?.[t?.category]) map[t.category] = { hours: 0, completed: 0, total: 0 };
      map[t.category].hours += t?.duration / 60;
      map[t.category].total += 1;
      if (t?.isCompleted) map[t.category].completed += 1;
    });
    return Object.entries(map)
      ?.map(([category, data]) => ({ category, ...data }))
      ?.sort((a, b) => b?.hours - a?.hours);
  })();

  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  const handleTaskClick = useCallback((task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleToggleComplete = useCallback((taskId, e) => {
    e?.stopPropagation();
    const task = tasks?.find(t => t?.id === taskId);
    if (task) {
      saveTask({ ...task, isCompleted: !task?.isCompleted });
    }
  }, [tasks, saveTask]);

  const handleSave = useCallback((savedTask) => {
    saveTask(savedTask);
  }, [saveTask]);

  const handleDelete = useCallback((taskId) => {
    deleteTask(taskId);
  }, [deleteTask]);

  const handleToggleCompletion = (taskId) => {
    const task = tasks?.find((t) => t?.id === taskId);
    if (!task) return;
    // If marking as complete, show rating modal
    if (!task?.isCompleted) {
      setPendingToggleId(taskId);
      setRatingTask(task);
    } else {
      toggleCompletion(taskId);
    }
  };

  const handleRatingSave = async (ratingData) => {
    if (pendingToggleId) {
      await toggleCompletion(pendingToggleId, ratingData);
    }
    setRatingTask(null);
    setPendingToggleId(null);
  };

  const handleRatingSkip = async () => {
    if (pendingToggleId) {
      await toggleCompletion(pendingToggleId, null);
    }
    setRatingTask(null);
    setPendingToggleId(null);
  };

  const greeting = `${getGreeting(now?.getHours())}, ${userName} 👋`;
  const dateLabel = formatDateLabel(viewDate);

  // Calendar picker helpers
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0)?.getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1)?.getDay();

  const handlePickerPrevMonth = () => {
    if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); }
    else setPickerMonth(m => m - 1);
  };
  const handlePickerNextMonth = () => {
    if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); }
    else setPickerMonth(m => m + 1);
  };

  const handleSelectDay = (day) => {
    const d = new Date(pickerYear, pickerMonth, day);
    setSelectedDate(d);
    setShowDatePicker(false);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setPickerMonth(today?.getMonth());
    setPickerYear(today?.getFullYear());
    setShowDatePicker(false);
  };

  const daysInMonth = getDaysInMonth(pickerMonth, pickerYear);
  const firstDay = getFirstDayOfMonth(pickerMonth, pickerYear);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <TopAppBar
        currentMode={scheduleMode}
        onModeToggle={setScheduleMode}
        onAddTask={handleAddTask}
      />
      <main className="content-area px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="pt-6 pb-4">
          <GreetingHeader
            greeting={greeting}
            todayLabel={dateLabel}
            taskCount={todayTasks?.length}
          />
          {/* Date navigation row */}
          <div className="flex items-center gap-2 mt-3 relative">
            <button
              onClick={() => { const d = subDays(selectedDate, 1); setSelectedDate(d); setPickerMonth(d?.getMonth()); setPickerYear(d?.getFullYear()); }}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-all"
              aria-label="Previous day"
            >
              <Icon name="ChevronLeft" size={16} color="currentColor" />
            </button>
            <button
              onClick={() => setShowDatePicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-border)] transition-all font-caption text-sm font-medium text-[var(--color-foreground)]"
            >
              <Icon name="CalendarDays" size={14} color="var(--color-primary)" />
              <span>{format(viewDate, 'MMM d, yyyy')}</span>
              <Icon name={showDatePicker ? 'ChevronUp' : 'ChevronDown'} size={12} color="currentColor" />
            </button>
            <button
              onClick={() => { const d = addDays(selectedDate, 1); setSelectedDate(d); setPickerMonth(d?.getMonth()); setPickerYear(d?.getFullYear()); }}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-all"
              aria-label="Next day"
            >
              <Icon name="ChevronRight" size={16} color="currentColor" />
            </button>
            {!isViewingToday && (
              <button
                onClick={handleGoToToday}
                className="px-2.5 py-1 rounded-lg font-caption text-xs font-semibold bg-[var(--color-primary)] text-white hover:opacity-90 transition-all"
              >
                Today
              </button>
            )}

            {/* Calendar Dropdown */}
            {showDatePicker && (
              <div className="absolute top-10 left-0 z-50 w-72 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                {/* Month/Year navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={handlePickerPrevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-muted)] transition-all">
                    <Icon name="ChevronLeft" size={14} color="currentColor" />
                  </button>
                  <div className="flex items-center gap-2">
                    <select
                      value={pickerMonth}
                      onChange={e => setPickerMonth(Number(e?.target?.value))}
                      className="font-caption text-sm font-semibold bg-transparent text-[var(--color-foreground)] border-none outline-none cursor-pointer"
                    >
                      {MONTHS?.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <input
                      type="number"
                      value={pickerYear}
                      onChange={e => setPickerYear(Number(e?.target?.value))}
                      className="w-16 font-caption text-sm font-semibold bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded px-1 py-0.5 text-center outline-none"
                      min={2000}
                      max={2100}
                    />
                  </div>
                  <button onClick={handlePickerNextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-muted)] transition-all">
                    <Icon name="ChevronRight" size={14} color="currentColor" />
                  </button>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAY_SHORT?.map(d => (
                    <div key={d} className="text-center font-caption text-xs text-[var(--color-muted-foreground)] py-1">{d}</div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDay })?.map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth })?.map((_, i) => {
                    const day = i + 1;
                    const cellDate = new Date(pickerYear, pickerMonth, day);
                    const isSelected = cellDate?.toDateString() === selectedDate?.toDateString();
                    const isToday = cellDate?.toDateString() === now?.toDateString();
                    return (
                      <button
                        key={day}
                        onClick={() => handleSelectDay(day)}
                        className={`w-full aspect-square flex items-center justify-center rounded-lg font-caption text-xs transition-all ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white font-bold'
                            : isToday
                            ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-semibold'
                            : 'hover:bg-[var(--color-muted)] text-[var(--color-foreground)]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={handleGoToToday}
                    className="px-4 py-1.5 rounded-lg font-caption text-xs font-semibold bg-[var(--color-primary)] text-white hover:opacity-90 transition-all"
                  >
                    Go to Today
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 font-body text-sm text-[var(--color-muted-foreground)]">Loading your schedule…</span>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
            {/* Left / Main Column */}
            <div className="lg:col-span-2 flex flex-col gap-4 md:gap-5">
              <DayProgressBar
                percentage={progressPct}
                completedCount={completedCount}
                totalCount={todayTasks?.length}
              />

              <CurrentTaskCard task={currentTask} remainingMinutes={remainingMinutes} />

              <NextUpCard task={nextTask} />

              <UpcomingTasksList tasks={nextFiveTasks} onTaskClick={handleTaskClick} onToggleComplete={handleToggleComplete} />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 md:gap-5">
              <FocusAreaBreakdown breakdown={focusBreakdown} />

              {/* Quick Stats */}
              <div className="card p-4 md:p-5">
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)] mb-3">
                  {isViewingToday ? 'Today at a Glance' : `${format(viewDate, 'MMM d')} at a Glance`}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--color-muted)] rounded-lg p-3 text-center">
                    <p className="font-data text-xl font-bold text-[var(--color-primary)]">
                      {todayTasks?.length}
                    </p>
                    <p className="font-caption text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      Total Blocks
                    </p>
                  </div>
                  <div className="bg-[var(--color-muted)] rounded-lg p-3 text-center">
                    <p className="font-data text-xl font-bold text-[var(--color-success)]">
                      {completedCount}
                    </p>
                    <p className="font-caption text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      Completed
                    </p>
                  </div>
                  <div className="bg-[var(--color-muted)] rounded-lg p-3 text-center">
                    <p className="font-data text-xl font-bold text-[var(--color-warning)]">
                      {upcomingTasks?.length}
                    </p>
                    <p className="font-caption text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      Remaining
                    </p>
                  </div>
                  <div className="bg-[var(--color-muted)] rounded-lg p-3 text-center">
                    <p className="font-data text-xl font-bold text-[var(--color-accent)]">
                      {(todayTasks?.reduce((s, t) => s + (t?.duration || 0), 0) / 60)?.toFixed(1)}h
                    </p>
                    <p className="font-caption text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      Total Hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Day Selector Quick Nav */}
              <div className="card p-4 md:p-5">
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)] mb-3">
                  This Week
                </h2>
                <div className="grid grid-cols-7 gap-1">
                  {DAY_SHORT?.map((d, i) => {
                    const isToday = i === now?.getDay();
                    const dayName = DAYS?.[i];
                    const count = tasks?.filter((t) => t?.day === dayName)?.length;
                    return (
                      <div
                        key={d}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg ${
                          isToday
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                        }`}
                      >
                        <span className="font-caption text-xs font-medium">{d}</span>
                        <span className="font-data text-xs">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomTabNavigation />
      <TaskEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingTask={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      {ratingTask && (
        <TaskCompletionRatingModal
          task={ratingTask}
          onSave={handleRatingSave}
          onSkip={handleRatingSkip}
          onClose={() => { setRatingTask(null); setPendingToggleId(null); }}
        />
      )}
    </div>
  );
}