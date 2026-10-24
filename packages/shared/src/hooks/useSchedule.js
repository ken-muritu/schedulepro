import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import { safeLocalStorage, safeWindow, safeDocument, isWeb } from '../lib/platform';

const STORAGE_KEY = 'schedulepro_tasks';
const HISTORY_PREFIX = 'schedulepro_history_';
const PERF_QUEUE_KEY = 'schedulepro_perf_queue';

// --- Offline performance queue helpers ---
function loadPerfQueue() {
  try { return JSON.parse(safeLocalStorage.getItem(PERF_QUEUE_KEY) || '[]'); } catch { return []; }
}
function savePerfQueue(q) {
  try { safeLocalStorage.setItem(PERF_QUEUE_KEY, JSON.stringify(q)); } catch {}
}
function enqueuePerfOp(op) {
  const q = loadPerfQueue();
  q.push({ ...op, _queuedAt: new Date().toISOString(), _id: Date.now() + Math.random() });
  savePerfQueue(q);
}
async function flushPerfQueue() {
  const q = loadPerfQueue();
  if (!q.length) return;
  const remaining = [];
  for (const op of q) {
    try {
      if (op.type === 'insert') {
        await supabase.from('task_completions').insert(op.payload);
      } else if (op.type === 'upsert') {
        const { data: existing } = await supabase
          .from('task_completions').select('id').eq('block_id', op.payload.block_id).eq('user_id', op.payload.user_id).maybeSingle();
        if (existing?.id) {
          await supabase.from('task_completions').update({ rating: op.payload.rating, completion_notes: op.payload.completion_notes }).eq('id', existing.id);
        } else {
          await supabase.from('task_completions').insert(op.payload);
        }
      } else if (op.type === 'delete') {
        await supabase.from('task_completions').delete().eq('block_id', op.block_id).eq('user_id', op.user_id);
      }
    } catch {
      remaining.push(op);
    }
  }
  savePerfQueue(remaining);
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getTodayKey() {
  const d = new Date();
  return `${d?.getFullYear()}-${String(d?.getMonth() + 1)?.padStart(2, '0')}-${String(d?.getDate())?.padStart(2, '0')}`;
}

function getDateKey(date) {
  return `${date?.getFullYear()}-${String(date?.getMonth() + 1)?.padStart(2, '0')}-${String(date?.getDate())?.padStart(2, '0')}`;
}

// Convert Supabase snake_case row → camelCase task object
function rowToTask(row) {
  return {
    id: row?.id,
    title: row?.title,
    category: row?.category,
    day: row?.day_of_week,
    dayOfWeek: DAYS?.indexOf(row?.day_of_week),
    startTime: row?.start_time,
    endTime: row?.end_time,
    duration: row?.duration_minutes || 30,
    mode: row?.mode || 'flexible',
    notes: row?.notes || '',
    isCompleted: row?.is_completed || false,
    completedAt: row?.completed_at,
    priority: row?.priority || 'medium',
    userId: row?.user_id,
    recurrenceType: row?.recurrence_type || '',
    recurrenceDays: row?.recurrence_days || [],
  };
}

// Convert camelCase task object → Supabase snake_case row
function taskToRow(task, userId) {
  const dayName = typeof task?.day === 'string' ? task?.day
    : (task?.dayOfWeek !== undefined ? DAYS?.[task?.dayOfWeek] : DAYS?.[new Date()?.getDay()]);
  return {
    id: task?.id,
    user_id: userId,
    title: task?.title,
    category: task?.category,
    day_of_week: dayName,
    start_time: task?.startTime,
    end_time: task?.endTime,
    duration_minutes: task?.duration || 30,
    mode: task?.mode || 'flexible',
    notes: task?.notes || '',
    is_completed: task?.isCompleted || false,
    completed_at: task?.completedAt || null,
    priority: task?.priority || 'medium',
    recurrence_type: task?.recurrenceType || null,
    recurrence_days: task?.recurrenceDays?.length > 0 ? task?.recurrenceDays : null,
  };
}

export function saveHistorySnapshot(tasks, dateKey) {
  try {
    const dayName = DAYS?.[new Date(dateKey + 'T12:00:00')?.getDay()];
    const dayTasks = tasks?.filter((t) => t?.day === dayName || t?.dayOfWeek === new Date(dateKey + 'T12:00:00')?.getDay());
    if (dayTasks?.length > 0) {
      safeLocalStorage.setItem(HISTORY_PREFIX + dateKey, JSON.stringify(dayTasks));
    }
  } catch (e) {
    // ignore
  }
}

export function getHistoryForDate(dateKey) {
  try {
    const raw = safeLocalStorage.getItem(HISTORY_PREFIX + dateKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getHistoryDates() {
  const dates = [];
  for (let i = 0; i < safeLocalStorage.length; i++) {
    const key = safeLocalStorage.key(i);
    if (key && key?.startsWith(HISTORY_PREFIX)) {
      dates?.push(key?.replace(HISTORY_PREFIX, ''));
    }
  }
  return dates;
}

const useSchedule = (initialTasks = []) => {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = safeLocalStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return initialTasks;
  });

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [lastDateKey, setLastDateKey] = useState(getTodayKey);
  const subscriptionRef = useRef(null);

  // Get current user
  useEffect(() => {
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // Fetch from Supabase when user is available
  useEffect(() => {
    if (!userId) return;

    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('schedule_blocks')
          ?.select('*')
          ?.eq('user_id', userId)
          ?.order('start_time', { ascending: true });
        if (!error && data) {
          const mapped = data?.map(rowToTask);
          setTasks(mapped);
          // Sync to localStorage as offline cache
          try { safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(mapped)); } catch {}
        }
      } catch (e) {
        // fallback to localStorage
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();

    // Real-time subscription
    if (subscriptionRef?.current) {
      supabase?.removeChannel(subscriptionRef?.current);
    }

    const channel = supabase
      ?.channel(`schedule_blocks_${userId}`)
      ?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schedule_blocks',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload?.eventType === 'INSERT') {
          const newTask = rowToTask(payload?.new);
          setTasks((prev) => {
            if (prev?.find((t) => t?.id === newTask?.id)) return prev;
            return [...prev, newTask];
          });
        } else if (payload?.eventType === 'UPDATE') {
          const updated = rowToTask(payload?.new);
          setTasks((prev) => prev?.map((t) => t?.id === updated?.id ? updated : t));
        } else if (payload?.eventType === 'DELETE') {
          setTasks((prev) => prev?.filter((t) => t?.id !== payload?.old?.id));
        }
      })
      ?.subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef?.current) {
        supabase?.removeChannel(subscriptionRef?.current);
        subscriptionRef.current = null;
      }
    };
  }, [userId]);

  // Persist to localStorage as offline cache whenever tasks change
  useEffect(() => {
    try {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Auto-snapshot on date change
  useEffect(() => {
    const interval = setInterval(() => {
      const currentKey = getTodayKey();
      if (currentKey !== lastDateKey) {
        saveHistorySnapshot(tasks, lastDateKey);
        setLastDateKey(currentKey);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks, lastDateKey]);

  // Save snapshot on visibility change / unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (safeDocument.visibilityState === 'hidden') {
        saveHistorySnapshot(tasks, getTodayKey());
      }
    };
    safeDocument.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      safeDocument.removeEventListener('visibilitychange', handleVisibilityChange);
      saveHistorySnapshot(tasks, getTodayKey());
    };
  }, [tasks]);

  // Flush offline performance queue when coming back online
  useEffect(() => {
    const handleOnline = () => { if (userId) flushPerfQueue(); };
    safeWindow.addEventListener('online', handleOnline);
    return () => safeWindow.removeEventListener('online', handleOnline);
  }, [userId]);

  // Also flush on mount if online
  useEffect(() => {
    if (userId && navigator.onLine) flushPerfQueue();
  }, [userId]);

  const addTask = useCallback(async (task) => {
    if (userId) {
      const row = taskToRow(task, userId);
      const { data, error } = await supabase?.from('schedule_blocks')?.insert(row)?.select()?.single();
      if (!error && data) {
        // Real-time will handle state update
        return;
      }
    }
    // Fallback: local only
    setTasks((prev) => [...prev, task]);
  }, [userId]);

  const updateTask = useCallback(async (updatedTask) => {
    if (userId) {
      const row = taskToRow(updatedTask, userId);
      const { error } = await supabase?.from('schedule_blocks')?.update(row)?.eq('id', updatedTask?.id)?.eq('user_id', userId);
      if (!error) return; // Real-time handles state
    }
    setTasks((prev) => prev?.map((t) => (t?.id === updatedTask?.id ? updatedTask : t)));
  }, [userId]);

  const deleteTask = useCallback(async (taskId) => {
    if (userId) {
      const { error } = await supabase?.from('schedule_blocks')?.delete()?.eq('id', taskId)?.eq('user_id', userId);
      if (!error) return; // Real-time handles state
    }
    setTasks((prev) => prev?.filter((t) => t?.id !== taskId));
  }, [userId]);

  const saveTask = useCallback(async (savedTask) => {
    if (userId) {
      const row = taskToRow(savedTask, userId);
      const isNew = !savedTask?.id || savedTask?.id?.toString()?.startsWith('task-');
      if (isNew) {
        // New task: insert without id so DB generates a real UUID
        const { id: _dropId, ...rowWithoutId } = row;
        const { data, error } = await supabase
          ?.from('schedule_blocks')
          ?.insert(rowWithoutId)
          ?.select()
          ?.single();
        if (!error && data) {
          return rowToTask(data); // Return task with real DB UUID
        }
      } else {
        // Existing task: update
        const { data, error } = await supabase
          ?.from('schedule_blocks')
          ?.update(row)
          ?.eq('id', savedTask?.id)
          ?.eq('user_id', userId)
          ?.select()
          ?.single();
        if (!error && data) {
          return rowToTask(data);
        }
      }
    }
    // Fallback: local only
    setTasks((prev) => {
      const exists = prev?.find((t) => t?.id === savedTask?.id);
      if (exists) return prev?.map((t) => (t?.id === savedTask?.id ? savedTask : t));
      return [...prev, savedTask];
    });
    return savedTask;
  }, [userId]);

  const toggleCompletion = useCallback(async (taskId, ratingData = null) => {
    const task = tasks?.find((t) => t?.id === taskId);
    if (!task) return;
    const newCompleted = !task?.isCompleted;
    const completedAt = newCompleted ? new Date()?.toISOString() : null;
    const rating = newCompleted ? (ratingData?.rating || null) : null;
    const completionNotes = newCompleted ? (ratingData?.completionNotes || null) : null;

    if (userId) {
      const { error } = await supabase
        ?.from('schedule_blocks')
        ?.update({
          is_completed: newCompleted,
          completed_at: completedAt,
          rating: rating,
          completion_notes: completionNotes,
        })
        ?.eq('id', taskId)
        ?.eq('user_id', userId);
      if (!error) {
        if (newCompleted) {
          const payload = {
            user_id: userId,
            block_id: taskId,
            title: task?.title,
            category: task?.category,
            completed_at: completedAt,
            duration_minutes: task?.duration || 0,
            rating: rating,
            completion_notes: completionNotes,
          };
          if (isWeb && navigator.onLine) {
            const { error: insErr } = await supabase?.from('task_completions')?.insert(payload);
            if (insErr) enqueuePerfOp({ type: 'insert', payload });
          } else if (!isWeb) {
            // On mobile, just enqueue for now or try insert
            const { error: insErr } = await supabase?.from('task_completions')?.insert(payload);
            if (insErr) enqueuePerfOp({ type: 'insert', payload });
          } else {
            enqueuePerfOp({ type: 'insert', payload });
          }
        } else {
          if (isWeb && navigator.onLine) {
            await supabase?.from('task_completions')?.delete()?.eq('block_id', taskId)?.eq('user_id', userId);
          } else if (!isWeb) {
            await supabase?.from('task_completions')?.delete()?.eq('block_id', taskId)?.eq('user_id', userId);
          } else {
            enqueuePerfOp({ type: 'delete', block_id: taskId, user_id: userId });
          }
        }
        return;
      }
    }
    setTasks((prev) =>
      prev?.map((t) =>
        t?.id === taskId
          ? { ...t, isCompleted: newCompleted, completedAt: completedAt || undefined, rating, completionNotes }
          : t
      )
    );
  }, [userId, tasks]);

  const updatePerformance = useCallback(async (taskId, ratingData) => {
    const task = tasks?.find((t) => t?.id === taskId);
    if (!task) return;
    const rating = ratingData?.rating || null;
    const completionNotes = ratingData?.completionNotes || null;

    if (userId) {
      await supabase
        ?.from('schedule_blocks')
        ?.update({ rating, completion_notes: completionNotes })
        ?.eq('id', taskId)
        ?.eq('user_id', userId);

      const payload = {
        user_id: userId,
        block_id: taskId,
        title: task?.title,
        category: task?.category,
        completed_at: task?.completedAt || new Date()?.toISOString(),
        duration_minutes: task?.duration || 0,
        rating,
        completion_notes: completionNotes,
      };

      if (navigator.onLine) {
        const { data: existing } = await supabase
          ?.from('task_completions')
          ?.select('id')
          ?.eq('block_id', taskId)
          ?.eq('user_id', userId)
          ?.maybeSingle();
        if (existing?.id) {
          const { error: updErr } = await supabase
            ?.from('task_completions')
            ?.update({ rating, completion_notes: completionNotes })
            ?.eq('id', existing?.id);
          if (updErr) enqueuePerfOp({ type: 'upsert', payload });
        } else {
          const { error: insErr } = await supabase?.from('task_completions')?.insert(payload);
          if (insErr) enqueuePerfOp({ type: 'insert', payload });
        }
      } else {
        enqueuePerfOp({ type: 'upsert', payload });
      }
      return;
    }
    setTasks((prev) =>
      prev?.map((t) =>
        t?.id === taskId ? { ...t, rating, completionNotes } : t
      )
    );
  }, [userId, tasks]);

  const reorderBlock = useCallback((blockId, newDayOfWeek, newIndex) => {
    setTasks((prev) => {
      const block = prev?.find((t) => t?.id === blockId);
      if (!block) return prev;
      const dayTasks = prev?.filter((t) => t?.dayOfWeek === newDayOfWeek && t?.id !== blockId)?.sort((a, b) => (a?.startTime || '')?.localeCompare(b?.startTime || ''));
      dayTasks?.splice(newIndex, 0, { ...block, dayOfWeek: newDayOfWeek });
      const otherTasks = prev?.filter((t) => t?.dayOfWeek !== newDayOfWeek && t?.id !== blockId);
      return [...otherTasks, ...dayTasks];
    });
  }, []);

  const moveBlockToDay = useCallback(async (blockId, targetDay) => {
    const dayName = DAYS?.[targetDay];
    if (userId) {
      await supabase
        ?.from('schedule_blocks')
        ?.update({ day_of_week: dayName })
        ?.eq('id', blockId)
        ?.eq('user_id', userId);
      return;
    }
    setTasks((prev) =>
      prev?.map((t) => (t?.id === blockId ? { ...t, dayOfWeek: targetDay, day: dayName } : t))
    );
  }, [userId]);

  return {
    tasks,
    setTasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    saveTask,
    toggleCompletion,
    updatePerformance,
    reorderBlock,
    moveBlockToDay,
  };
};

export default useSchedule;
