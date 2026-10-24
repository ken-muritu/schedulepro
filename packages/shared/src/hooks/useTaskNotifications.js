import { useEffect, useRef, useCallback } from 'react';

const NOTIFIED_KEY = 'schedulepro_notified';

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr?.split(':')?.map(Number);
  if (parts?.length < 2) return null;
  return parts?.[0] * 60 + parts?.[1];
}

function getNowMinutes() {
  const now = new Date();
  return now?.getHours() * 60 + now?.getMinutes();
}

function getTodayDayIndex() {
  return new Date()?.getDay();
}

function getNotifiedSet() {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedSet(set) {
  try {
    sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
  } catch {}
}

export function useTaskNotifications(tasks = []) {
  const permissionRef = useRef(Notification?.permission || 'default');
  const intervalRef = useRef(null);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      permissionRef.current = result;
      return result === 'granted';
    }
    return false;
  }, []);

  const fireNotification = useCallback((title, body, tag) => {
    if (permissionRef?.current !== 'granted') return;
    try {
      const n = new Notification(title, {
        body,
        tag,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
      });
      setTimeout(() => n?.close(), 8000);
    } catch {}
  }, []);

  const checkTasks = useCallback(() => {
    if (permissionRef?.current !== 'granted') return;
    const todayIdx = getTodayDayIndex();
    const nowMins = getNowMinutes();
    const notified = getNotifiedSet();

    const todayTasks = tasks?.filter(
      (t) => parseInt(t?.dayOfWeek, 10) === todayIdx && !t?.isCompleted
    );

    todayTasks?.forEach((task) => {
      const startMins = timeToMinutes(task?.startTime);
      if (startMins === null) return;

      const endMins = startMins + (task?.duration || 60);
      const minutesUntil = startMins - nowMins;

      // 5-minute warning
      const warnKey = `warn_${task?.id}_${task?.startTime}`;
      if (minutesUntil > 0 && minutesUntil <= 5 && !notified?.has(warnKey)) {
        fireNotification(
          `⏰ Starting soon: ${task?.title}`,
          `Starts in ${minutesUntil} minute${minutesUntil === 1 ? '' : 's'} · ${task?.startTime}`,
          warnKey
        );
        notified?.add(warnKey);
        saveNotifiedSet(notified);
      }

      // Task is happening now (within first 5 minutes of start)
      const nowKey = `now_${task?.id}_${task?.startTime}`;
      if (minutesUntil <= 0 && nowMins < endMins && nowMins >= startMins && nowMins <= startMins + 5 && !notified?.has(nowKey)) {
        fireNotification(
          `🚀 Now: ${task?.title}`,
          `This task is happening right now · ends at ${Math.floor(endMins / 60)?.toString()?.padStart(2, '0')}:${(endMins % 60)?.toString()?.padStart(2, '0')}`,
          nowKey
        );
        notified?.add(nowKey);
        saveNotifiedSet(notified);
      }
    });
  }, [tasks, fireNotification]);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Poll every minute
  useEffect(() => {
    if (intervalRef?.current) clearInterval(intervalRef?.current);
    checkTasks(); // run immediately
    intervalRef.current = setInterval(checkTasks, 60000);
    return () => {
      if (intervalRef?.current) clearInterval(intervalRef?.current);
    };
  }, [checkTasks]);

  return { requestPermission, permissionGranted: permissionRef?.current === 'granted' };
}

export default useTaskNotifications;
