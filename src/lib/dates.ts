import { formatInTimeZone, toDate } from 'date-fns-tz';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export const TIMEZONE = 'Asia/Taipei';

// Get current date string (YYYY-MM-DD) in Asia/Taipei
export function getTaipeiTodayStr(): string {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

// Calculate Days in To Do from addedToTodoListAt timestamp
export function calculateDaysInToDo(addedAt: Date | string): number {
  const addedDateStr = formatInTimeZone(new Date(addedAt), TIMEZONE, 'yyyy-MM-dd');
  const todayStr = getTaipeiTodayStr();
  return Math.max(0, differenceInCalendarDays(parseISO(todayStr), parseISO(addedDateStr)));
}

// Overdue logic: due < today AND status !== 'Done' AND not archived
export function isTaskOverdue(dueDate?: string, status?: string, isArchived?: boolean): boolean {
  if (!dueDate || status === 'Done' || isArchived) return false;
  const todayStr = getTaipeiTodayStr();
  return dueDate < todayStr;
}