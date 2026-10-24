import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import TaskEditorModal from '../../components/ui/TaskEditorModal';
import CountdownTimer from './components/CountdownTimer';
import UpNextCard from './components/UpNextCard';
import NoActiveTask from './components/NoActiveTask';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { getTasksForDate } from '@schedulepro/shared/src/utils/recurrence';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CATEGORY_COLORS = {
  work: '#3B82F6', languages: '#FBBF24', literature: '#F97316',
  coding: '#10B981', leadership: '#A855F7', spirituality: '#8B5CF6',
  chores: '#F43F5E', meals: '#EAB308', leisure: '#94A3B8',
  health: '#14B8A6', family: '#EC4899', social: '#06B6D4',
};

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t?.split(':')?.map(Number);
  return h * 60 + m;
}

function getNowSeconds() {
  const n = new Date();
  return n?.getHours() * 3600 + n?.getMinutes() * 60 + n?.getSeconds();
}

const FocusModePage = () => {
  const navigate = useNavigate();
  const { tasks, saveTask, deleteTask, toggleCompletion } = useScheduleContext();
  const [nowSec, setNowSec] = useState(getNowSeconds);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNowSec(getNowSeconds()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayName = DAYS?.[new Date()?.getDay()];
  const nowMin = Math.floor(nowSec / 60);

  const todayTasks = useMemo(() => {
    return getTasksForDate(tasks, new Date())?.sort((a, b) => timeToMinutes(a?.startTime) - timeToMinutes(b?.startTime));
  }, [tasks]);

  const currentTask = useMemo(() => {
    return todayTasks?.find(t =>
      !t?.isCompleted &&
      timeToMinutes(t?.startTime) <= nowMin &&
      timeToMinutes(t?.endTime) > nowMin
    ) || null;
  }, [todayTasks, nowMin]);

  const nextTask = useMemo(() => {
    return todayTasks?.find(t =>
      !t?.isCompleted && timeToMinutes(t?.startTime) > nowMin
    ) || null;
  }, [todayTasks, nowMin]);

  const secondsLeft = useMemo(() => {
    if (!currentTask) return 0;
    const endSec = timeToMinutes(currentTask?.endTime) * 60;
    return Math.max(0, endSec - nowSec);
  }, [currentTask, nowSec]);

  const totalSeconds = useMemo(() => {
    if (!currentTask) return 0;
    return (timeToMinutes(currentTask?.endTime) - timeToMinutes(currentTask?.startTime)) * 60;
  }, [currentTask]);

  const secondsUntilNext = useMemo(() => {
    if (!nextTask) return 0;
    const startSec = timeToMinutes(nextTask?.startTime) * 60;
    return Math.max(0, startSec - nowSec);
  }, [nextTask, nowSec]);

  // Auto-advance: when countdown hits 0, re-evaluate
  useEffect(() => {
    if (currentTask && secondsLeft === 0) {
      setMarkedComplete(false);
    }
  }, [currentTask, secondsLeft]);

  const handleMarkComplete = useCallback(() => {
    if (!currentTask) return;
    toggleCompletion(currentTask?.id);
    setMarkedComplete(true);
    setTimeout(() => setMarkedComplete(false), 1500);
  }, [currentTask, toggleCompletion]);

  const handleSaveTask = useCallback((savedTask) => {
    saveTask(savedTask);
    setEditModalOpen(false);
    setAddModalOpen(false);
  }, [saveTask]);

  const handleDeleteTask = useCallback((taskId) => {
    deleteTask(taskId);
    setEditModalOpen(false);
  }, [deleteTask]);

  const categoryColor = currentTask ? (CATEGORY_COLORS?.[currentTask?.category] || '#6366F1') : '#6366F1';

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${categoryColor}26 0%, #0F172A 60%)`,
        backgroundColor: '#0F172A'
      }}
    >
      {/* Exit button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 font-caption text-sm"
        >
          <Icon name="ArrowLeft" size={16} color="currentColor" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Add Task button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-caption text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
        >
          <Icon name="Plus" size={16} color="currentColor" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 gap-8">
        {currentTask ? (
          <>
            {/* Category label */}
            <div className="flex flex-col items-center gap-2">
              <span
                className="font-caption text-xs font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                style={{ color: categoryColor, background: categoryColor + '22', border: `1px solid ${categoryColor}44` }}
              >
                {currentTask?.category}
              </span>
            </div>

            {/* Task title */}
            <div className="text-center max-w-2xl">
              <h1
                className="font-heading font-bold text-white leading-tight"
                style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}
              >
                {currentTask?.title}
              </h1>
              <p className="font-data text-white/60 mt-2 text-lg">
                {currentTask?.startTime} – {currentTask?.endTime}
              </p>
            </div>

            {/* Countdown timer with ring */}
            <CountdownTimer secondsLeft={secondsLeft} totalSeconds={totalSeconds} />

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-caption text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: markedComplete ? '#10B981' : categoryColor,
                  boxShadow: `0 4px 20px ${categoryColor}60`
                }}
              >
                <Icon name={markedComplete ? 'CheckCircle' : 'Check'} size={18} color="#fff" />
                {markedComplete ? 'Marked Complete!' : 'Mark Complete'}
              </button>
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-caption text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                <Icon name="Pencil" size={16} color="currentColor" />
                Edit Task
              </button>
            </div>

            {/* Up Next */}
            {nextTask && <UpNextCard task={nextTask} />}
          </>
        ) : (
          <NoActiveTask nextTask={nextTask} secondsUntilNext={secondsUntilNext} />
        )}
      </div>

      {/* Edit modal */}
      <TaskEditorModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editingTask={currentTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
      {/* Add Task modal */}
      <TaskEditorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        editingTask={null}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default FocusModePage;
