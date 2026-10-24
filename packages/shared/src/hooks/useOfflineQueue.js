import { useState, useEffect, useCallback, useRef } from 'react';
import useNetworkStatus from './useNetworkStatus';

const QUEUE_KEY = 'schedulepro_offline_queue';

function loadQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

/**
 * Sync status values:
 *   'offline'  – no network *'syncing'– network restored, flushing queue *'synced'– all changes pushed *'pending'  – online but queue has items waiting
 */
const useOfflineQueue = () => {
  const { isOnline } = useNetworkStatus();
  const [queue, setQueue] = useState(loadQueue);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [lastSynced, setLastSynced] = useState(null);
  const flushingRef = useRef(false);

  // Persist queue to localStorage whenever it changes
  useEffect(() => {
    saveQueue(queue);
  }, [queue]);

  // Derive sync status from network + queue
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
    } else if (flushingRef.current) {
      setSyncStatus('syncing');
    } else if (queue.length > 0) {
      setSyncStatus('pending');
    } else {
      setSyncStatus('synced');
    }
  }, [isOnline, queue]);

  // Enqueue a pending change (for offline-first writes)
  const enqueue = useCallback((operation) => {
    setQueue((prev) => [
      ...prev,
      { ...operation, id: Date.now() + Math.random(), enqueuedAt: new Date().toISOString() },
    ]);
  }, []);

  // Flush queue with a provided executor function
  const flushQueue = useCallback(
    async (executor) => {
      if (!isOnline || queue.length === 0 || flushingRef.current) return;
      flushingRef.current = true;
      setSyncStatus('syncing');

      const remaining = [];
      for (const item of queue) {
        try {
          await executor(item);
        } catch {
          remaining.push(item);
        }
      }

      setQueue(remaining);
      flushingRef.current = false;
      if (remaining.length === 0) {
        setSyncStatus('synced');
        setLastSynced(new Date());
      } else {
        setSyncStatus('pending');
      }
    },
    [isOnline, queue]
  );

  // Mark synced manually (called after a successful Supabase write)
  const markSynced = useCallback(() => {
    setSyncStatus('synced');
    setLastSynced(new Date());
  }, []);

  // Mark syncing manually
  const markSyncing = useCallback(() => {
    setSyncStatus('syncing');
  }, []);

  return {
    queue,
    syncStatus,
    lastSynced,
    pendingCount: queue.length,
    enqueue,
    flushQueue,
    markSynced,
    markSyncing,
    isOnline,
  };
};

export default useOfflineQueue;
