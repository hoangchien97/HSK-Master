/**
 * Excel export utilities for attendance
 */

/** Vietnamese weekday labels (0 = Sunday) */
const WEEKDAY_VI: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

/**
 * Format a date string (YYYY-MM-DD) or Date to "DD/MM"
 */
export function formatDateDDMM(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr + 'T00:00:00') : dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Get Vietnamese weekday label for a date string (YYYY-MM-DD) or Date
 * Returns: T2, T3, T4, T5, T6, T7, CN
 */
export function weekdayLabelVI(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr + 'T00:00:00') : dateStr;
  return WEEKDAY_VI[d.getDay()] || '';
}

/**
 * Sanitize a string to be safe as a filename.
 * Removes special characters, replaces spaces with underscores.
 */
export function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_\-. ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();
}

/**
 * Format current date as DD_MM_YYYY in Asia/Ho_Chi_Minh timezone
 */
export function formatExportDate(timezone = 'Asia/Ho_Chi_Minh'): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  // en-GB gives DD/MM/YYYY
  return formatter.format(now).replace(/\//g, '_');
}

/**
 * Format current date as DD/MM/YYYY in given timezone (for display)
 */
export function formatExportDateDisplay(timezone = 'Asia/Ho_Chi_Minh'): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatter.format(now);
}
