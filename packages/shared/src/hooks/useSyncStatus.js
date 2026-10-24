import { useState, useEffect, useRef } from 'react';
import useNetworkStatus from './useNetworkStatus';

/**
 * Lightweight hook that derives a sync status badge value:
 *   'offline'  – navigator.onLine is false *'syncing'  – just came back online (brief window)
 *   'synced'   – online and stable
 *
 * Components can call markSyncing() / markSynced() to drive the state
 * from async operations (e.g. Supabase upserts).
 */
const useSyncStatus = () => {
  const { isOnline } = useNetworkStatus();
  const [status, setStatus] = useState(isOnline ? 'synced' : 'offline');
  const syncTimerRef = useRef(null);

  // React to network changes
  useEffect(() => {
    if (!isOnline) {
      setStatus('offline');
      if (syncTimerRef?.current) clearTimeout(syncTimerRef?.current);
    } else {
      // Brief syncing window when coming back online
      setStatus('syncing');
      syncTimerRef.current = setTimeout(() => {
        setStatus('synced');
      }, 2500);
    }
    return () => {
      if (syncTimerRef?.current) clearTimeout(syncTimerRef?.current);
    };
  }, [isOnline]);

  const markSyncing = () => {
    setStatus('syncing');
    if (syncTimerRef?.current) clearTimeout(syncTimerRef?.current);
  };

  const markSynced = () => {
    if (syncTimerRef?.current) clearTimeout(syncTimerRef?.current);
    setStatus('synced');
  };

  return { status, isOnline, markSyncing, markSynced };
};

export default useSyncStatus;
