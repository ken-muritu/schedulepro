const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns true if a task with the given recurrence settings should appear on `date`.
 * @param {object} task - task object with recurrenceType, recurrenceDays, day, dayOfWeek
 * @param {Date} date - the date to check
 */
export function taskOccursOnDate(task, date) {
  const dow = date?.getDay(); // 0=Sun … 6=Sat
  const dayName = DAYS?.[dow];

  const rt = task?.recurrenceType || '';

  // Non-recurring: only show on its own day
  if (!rt) {
    return task?.day === dayName;
  }

  switch (rt) {
    case 'daily':
      return true;

    case 'weekdays':
      return dow >= 1 && dow <= 5;

    case 'weekends':
      return dow === 0 || dow === 6;

    case 'weekly': // Same day of week as the task's saved day
      return task?.day === dayName;

    case 'monthly': {
      // Same day-of-month as the task's saved date
      // We don't store the original date, so fall back to same day-of-week
      return task?.day === dayName;
    }

    case 'yearly': {
      // Same day-of-week (best we can do without storing original date)
      return task?.day === dayName;
    }

    case 'custom': {
      const days = task?.recurrenceDays || [];
      return days?.includes(dayName);
    }

    default:
      return task?.day === dayName;
  }
}

/**
 * Given a full task list and a target date, returns all tasks that should
 * appear on that date (including recurring tasks expanded to that day).
 * Each returned task gets a `_virtualDay` property set to the target day name
 * so downstream code can use it safely.
 *
 * @param {object[]} tasks
 * @param {Date} date
 * @returns {object[]}
 */
export function getTasksForDate(tasks, date) {
  const dayName = DAYS?.[date?.getDay()];
  return tasks?.filter((t) => taskOccursOnDate(t, date))?.map((t) => ({
      ...t,
      // Override the displayed day to the target date's day
      day: dayName,
      dayOfWeek: date?.getDay(),
    }));
}
