import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import Icon from '../../components/AppIcon';
import HistoryDatePicker from './components/HistoryDatePicker';
import HistoryStatsBar from './components/HistoryStatsBar';
import HistoryBlockCard from './components/HistoryBlockCard';
import TaskEditorModal from '../../components/ui/TaskEditorModal';
import TaskCompletionRatingModal from '../../components/ui/TaskCompletionRatingModal';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';

const HISTORY_PREFIX = 'schedulepro_history_';

function getDateKey(date) {
  return format(date, 'yyyy-MM-dd');
}

// ── localStorage helpers ──────────────────────────────────────────────────
function getLocalHistoryForDate(dateKey) {
  try {
    const raw = localStorage.getItem(HISTORY_PREFIX + dateKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getLocalHistoryDates() {
  const dates = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(HISTORY_PREFIX)) {
      dates?.push(key?.replace(HISTORY_PREFIX, ''));
    }
  }
  return dates;
}

function saveLocalHistory(dateKey, blocks) {
  try {
    localStorage.setItem(HISTORY_PREFIX + dateKey, JSON.stringify(blocks));
  } catch {}
}

export default function HistoryView() {
  const [userId, setUserId] = useState(null);
  const [supabaseHistory, setSupabaseHistory] = useState({}); // { 'yyyy-MM-dd': blocks[] }
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [ratingModal, setRatingModal] = useState(null); // { task }
  const { saveTask, deleteTask, updatePerformance } = useScheduleContext();

  // ── Network status ────────────────────────────────────────────────────
  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // ── Fetch history from Supabase ───────────────────────────────────────
  const fetchHistory = useCallback(async (uid) => {
    if (!uid) return;
    setLoading(true);
    try {
      const thirtyDaysAgo = getDateKey(subDays(new Date(), 30));
      const { data, error } = await supabase
        ?.from('schedule_history')
        ?.select('snapshot_date, blocks, stats')
        ?.eq('user_id', uid)
        ?.gte('snapshot_date', thirtyDaysAgo)
        ?.order('snapshot_date', { ascending: false });

      if (!error && data) {
        const mapped = {};
        data?.forEach((row) => {
          const dateKey = row?.snapshot_date;
          const blocks = Array.isArray(row?.blocks) ? row?.blocks : [];
          mapped[dateKey] = blocks;
          // Cache to localStorage as offline fallback
          saveLocalHistory(dateKey, blocks);
        });
        setSupabaseHistory(mapped);
      }
    } catch {
      // Network error – will fall back to localStorage
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchHistory(userId);
  }, [userId, fetchHistory]);

  // ── Real-time subscription ────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      ?.channel(`schedule_history_${userId}`)
      ?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schedule_history',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
          const dateKey = payload?.new?.snapshot_date;
          const blocks = Array.isArray(payload?.new?.blocks) ? payload?.new?.blocks : [];
          setSupabaseHistory((prev) => ({ ...prev, [dateKey]: blocks }));
          saveLocalHistory(dateKey, blocks);
        } else if (payload?.eventType === 'DELETE') {
          const dateKey = payload?.old?.snapshot_date;
          setSupabaseHistory((prev) => {
            const next = { ...prev };
            delete next?.[dateKey];
            return next;
          });
        }
      })
      ?.subscribe();
    return () => supabase?.removeChannel(channel);
  }, [userId]);

  // ── Merge Supabase + localStorage dates ───────────────────────────────
  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      days?.push(getDateKey(subDays(new Date(), i)));
    }
    return days?.reverse();
  }, []);

  const datesWithData = useMemo(() => {
    const supabaseDates = Object.keys(supabaseHistory);
    const localDates = getLocalHistoryDates();
    return [...new Set([...supabaseDates, ...localDates])];
  }, [supabaseHistory]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const localDates = getLocalHistoryDates();
    const sorted = [...localDates]?.sort()?.reverse();
    return sorted?.[0] || getDateKey(subDays(new Date(), 1));
  });

  // Update selectedDate when Supabase data arrives
  useEffect(() => {
    const supabaseDates = Object.keys(supabaseHistory)?.sort()?.reverse();
    if (supabaseDates?.length > 0) {
      setSelectedDate(supabaseDates?.[0]);
    }
  }, [supabaseHistory]);

  // ── Blocks for selected date (Supabase first, localStorage fallback) ──
  const blocks = useMemo(() => {
    let data = supabaseHistory?.[selectedDate];
    if (!data) {
      data = getLocalHistoryForDate(selectedDate);
    }
    if (!data) return null;
    return [...data]?.sort((a, b) => (a?.startTime || a?.start_time || '')?.localeCompare(b?.startTime || b?.start_time || ''));
  }, [selectedDate, supabaseHistory]);

  const dateRange = useMemo(() => {
    if (last30Days?.length === 0) return '';
    const start = parseISO(last30Days?.[0] + 'T12:00:00');
    const end = parseISO(last30Days?.[last30Days?.length - 1] + 'T12:00:00');
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }, [last30Days]);

  const selectedDateLabel = useMemo(() => {
    try {
      return format(parseISO(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy');
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const dataSource = supabaseHistory?.[selectedDate] ? 'cloud' : 'local';

  const handleEditPerformance = useCallback((block) => {
    setRatingModal({ task: block });
  }, []);

  const handleRatingSave = useCallback(
    async (ratingData) => {
      if (!ratingModal) return;
      await updatePerformance(ratingModal?.task?.id, ratingData);
      setRatingModal(null);
    },
    [ratingModal, updatePerformance],
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <TopAppBar currentMode="flexible" onModeToggle={() => {}} onAddTask={() => setAddModalOpen(true)} />
      <main className="flex-1 flex flex-col content-area overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Icon name="History" size={20} color="var(--color-primary)" />
              <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                Past Schedules
              </h1>
            </div>
            {/* Sync source indicator */}
            <div className="flex items-center gap-1.5">
              {loading ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <Icon name="RefreshCw" size={11} color="#fbbf24" className="animate-spin" />
                  <span className="text-xs font-medium hidden sm:inline" style={{ color: '#fbbf24' }}>Loading…</span>
                </div>
              ) : !isOnline ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="w-2 h-2 rounded-full bg-red-400" style={{ boxShadow: '0 0 6px rgba(248,113,113,0.7)' }} />
                  <span className="text-xs font-medium hidden sm:inline text-red-400">Offline</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)' }}>
                  <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
                  <span className="text-xs font-medium hidden sm:inline text-green-400">Synced</span>
                </div>
              )}
            </div>
          </div>
          <p className="font-caption text-xs text-[var(--color-muted-foreground)]">
            {dateRange}
          </p>
        </div>

        {/* Date Picker */}
        <HistoryDatePicker
          dates={last30Days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          datesWithData={datesWithData}
        />

        {/* Selected Date Label */}
        <div className="px-4 py-2 flex items-center justify-between">
          <p className="font-caption text-sm font-medium text-[var(--color-foreground)]">
            {selectedDateLabel}
          </p>
          {blocks !== null && (
            <span className="font-caption text-xs text-[var(--color-muted-foreground)] flex items-center gap-1">
              <Icon name={dataSource === 'cloud' ? 'Cloud' : 'HardDrive'} size={11} color="currentColor" />
              {dataSource === 'cloud' ? 'Cloud' : 'Local cache'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && Object.keys(supabaseHistory)?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <Icon name="RefreshCw" size={24} color="var(--color-primary)" className="animate-spin" />
              </div>
              <p className="font-heading text-base font-semibold text-[var(--color-foreground)]">Loading history…</p>
              <p className="font-body text-sm text-[var(--color-muted-foreground)] mt-1">Fetching your past schedules from the cloud</p>
            </div>
          ) : blocks === null ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.1)' }}
              >
                <Icon name="CalendarX" size={32} color="var(--color-muted-foreground)" />
              </div>
              <p className="font-heading text-base font-semibold text-[var(--color-foreground)]">
                No schedule recorded
              </p>
              <p className="font-body text-sm text-[var(--color-muted-foreground)] mt-1">
                No schedule was recorded for this day.
              </p>
            </div>
          ) : (
            <>
              <HistoryStatsBar blocks={blocks} />
              <div className="px-4 pb-6 flex flex-col gap-2">
                {blocks?.map((block, idx) => (
                  <HistoryBlockCard key={block?.id || idx} block={block} onEditPerformance={handleEditPerformance} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <BottomTabNavigation />
      <TaskEditorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        editingTask={null}
        onSave={(task) => { saveTask(task); setAddModalOpen(false); }}
        onDelete={deleteTask}
      />
      {ratingModal && (
        <TaskCompletionRatingModal
          task={ratingModal?.task}
          isEditMode={true}
          initialRating={ratingModal?.task?.rating || 0}
          initialNotes={ratingModal?.task?.completionNotes || ''}
          onSave={handleRatingSave}
          onSkip={() => setRatingModal(null)}
          onClose={() => setRatingModal(null)}
        />
      )}
    </div>
  );
}
