/**
 * Schedule Utility Functions
 * Helper functions for schedule-related operations
 */

import dayjs from 'dayjs';
import type { ISchedule } from '@/app/interfaces/portal';

/**
 * Calculate recurrence end date (default +2 months from start date)
 */
export function getDefaultRecurrenceEndDate(startDate: Date | string): string {
  return dayjs(startDate).add(2, 'month').format('YYYY-MM-DD');
}

/**
 * Preview number of recurring schedules
 */
export function previewRecurrenceCount(
  startDate: string,
  endDate: string,
  weekdays: number[]
): number {
  if (!startDate || !endDate || weekdays.length === 0) {
    return 0;
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  let count = 0;
  let current = start;

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    if (weekdays.includes(current.day())) {
      count++;
    }
    current = current.add(1, 'day');
  }

  return count;
}

/**
 * Format weekdays for display
 */
export function formatWeekdays(weekdays: number[]): string {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return weekdays
    .sort((a, b) => a - b)
    .map(day => dayNames[day])
    .join(', ');
}

/**
 * Get schedules for a specific date
 */
export function getSchedulesForDate(
  schedules: ISchedule[],
  date: Date | string
): ISchedule[] {
  const targetDate = dayjs(date).format('YYYY-MM-DD');
  
  return schedules.filter(schedule => {
    const scheduleDate = dayjs(schedule.startTime).format('YYYY-MM-DD');
    return scheduleDate === targetDate;
  });
}

/**
 * Format date for display
 */
export function formatScheduleDate(date: Date | string): string {
  return dayjs(date).format('DD/MM/YYYY');
}

/**
 * Format time for display
 */
export function formatScheduleTime(date: Date | string): string {
  return dayjs(date).format('HH:mm');
}

/**
 * Format date and time for display
 */
export function formatScheduleDateTime(date: Date | string): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

/**
 * Get schedule duration in minutes
 */
export function getScheduleDuration(startTime: Date | string, endTime: Date | string): number {
  return dayjs(endTime).diff(dayjs(startTime), 'minute');
}

/**
 * Check if schedule is today
 */
export function isScheduleToday(date: Date | string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * Check if schedule is in the past
 */
export function isSchedulePast(date: Date | string): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

/**
 * Group schedules by date
 */
export function groupSchedulesByDate(schedules: ISchedule[]): Record<string, ISchedule[]> {
  return schedules.reduce((groups, schedule) => {
    const date = dayjs(schedule.startTime).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {} as Record<string, ISchedule[]>);
}

/**
 * Sort schedules by start time
 */
export function sortSchedulesByTime(schedules: ISchedule[]): ISchedule[] {
  return [...schedules].sort((a, b) => 
    dayjs(a.startTime).diff(dayjs(b.startTime))
  );
}
