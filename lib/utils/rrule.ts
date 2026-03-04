/**
 * RRULE Builder + Timezone Utilities for Google Calendar
 *
 * Converts schedule repeat rules to Google Calendar RRULE format.
 * Handles Asia/Ho_Chi_Minh timezone normalization.
 */

// ── Constants ──

const TIMEZONE = 'Asia/Ho_Chi_Minh';

/** Maps JS weekday (0=Sun) to Google BYDAY code */
const JS_DAY_TO_BYDAY: Record<number, string> = {
  0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA',
};

/** Maps Google BYDAY code to JS weekday (0=Sun) */
const BYDAY_TO_JS_DAY: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

// ── Types ──

export interface RepeatRule {
  freq: 'WEEKLY';
  byWeekDays: string[]; // ["MO", "TU", "WE", ...]
  untilDateLocal: string; // "YYYY-MM-DD"
}

export interface EventDateTime {
  dateTime: string; // ISO 8601
  timeZone: string;
}

// ── RRULE Builder ──

/**
 * Build Google Calendar RRULE string from RepeatRule.
 * UNTIL is end-of-day local (23:59:59 Asia/Ho_Chi_Minh) converted to UTC.
 *
 * Example output: "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20260430T165959Z"
 */
export function buildRRule(rule: RepeatRule): string {
  const byday = rule.byWeekDays.join(',');
  const until = localEndOfDayToUTC(rule.untilDateLocal);
  return `RRULE:FREQ=${rule.freq};BYDAY=${byday};UNTIL=${until}`;
}

/**
 * Convert local end-of-day to UTC in RRULE UNTIL format: YYYYMMDDTHHMMSSZ
 * e.g., "2026-04-30" (23:59:59 ICT = UTC+7) → "20260430T165959Z"
 */
function localEndOfDayToUTC(dateLocal: string): string {
  // Asia/Ho_Chi_Minh is UTC+7
  const ICT_OFFSET_HOURS = 7;
  const [year, month, day] = dateLocal.split('-').map(Number);

  // Local 23:59:59 → subtract 7 hours for UTC
  const utcDate = new Date(Date.UTC(year, month - 1, day, 23 - ICT_OFFSET_HOURS, 59, 59));

  const y = utcDate.getUTCFullYear();
  const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utcDate.getUTCDate()).padStart(2, '0');
  const h = String(utcDate.getUTCHours()).padStart(2, '0');
  const min = String(utcDate.getUTCMinutes()).padStart(2, '0');
  const sec = String(utcDate.getUTCSeconds()).padStart(2, '0');

  return `${y}${m}${d}T${h}${min}${sec}Z`;
}

// ── Timezone Helpers ──

/**
 * Create Google Calendar start/end dateTime from local date + time strings.
 *
 * @param dateLocal "YYYY-MM-DD"
 * @param timeLocal "HH:mm"
 * @returns { dateTime: "2026-03-03T19:00:00", timeZone: "Asia/Ho_Chi_Minh" }
 */
export function toGoogleDateTime(dateLocal: string, timeLocal: string): EventDateTime {
  return {
    dateTime: `${dateLocal}T${timeLocal}:00`,
    timeZone: TIMEZONE,
  };
}

/**
 * Build a local Date (timestamptz) from date + time in Asia/Ho_Chi_Minh.
 * Used for storing session instances in DB.
 *
 * @param dateLocal "YYYY-MM-DD"
 * @param timeLocal "HH:mm"
 * @returns Date object (UTC representation of local time)
 */
export function localToDate(dateLocal: string, timeLocal: string): Date {
  const ICT_OFFSET_HOURS = 7;
  const [year, month, day] = dateLocal.split('-').map(Number);
  const [hours, minutes] = timeLocal.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours - ICT_OFFSET_HOURS, minutes, 0));
}

// ── Weekday Helpers ──

/**
 * Convert JS weekday numbers [0..6] to BYDAY codes ["SU".."SA"]
 */
export function jsDaysToByDay(jsDays: number[]): string[] {
  return jsDays.map(d => JS_DAY_TO_BYDAY[d]).filter(Boolean);
}

/**
 * Convert BYDAY codes ["MO","TU"...] to JS weekday numbers [0..6]
 */
export function byDayToJsDays(byDays: string[]): number[] {
  return byDays.map(d => BYDAY_TO_JS_DAY[d]).filter(d => d !== undefined);
}

/**
 * Find the next valid weekday on or after a given date.
 * If startDate is already on a valid weekday, return it.
 *
 * @param startDateLocal "YYYY-MM-DD"
 * @param byWeekDays ["MO","TU",...]
 * @returns "YYYY-MM-DD"
 */
export function findFirstOccurrence(startDateLocal: string, byWeekDays: string[]): string {
  const jsDays = byDayToJsDays(byWeekDays);
  const [year, month, day] = startDateLocal.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  for (let i = 0; i < 7; i++) {
    const check = new Date(date);
    check.setDate(check.getDate() + i);
    if (jsDays.includes(check.getDay())) {
      const y = check.getFullYear();
      const m = String(check.getMonth() + 1).padStart(2, '0');
      const d = String(check.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  return startDateLocal; // fallback
}

/**
 * Generate all session dates from a recurring rule.
 * Returns array of "YYYY-MM-DD" strings.
 */
export function generateSessionDates(
  startDateLocal: string,
  byWeekDays: string[],
  untilDateLocal: string
): string[] {
  const jsDays = byDayToJsDays(byWeekDays);
  const dates: string[] = [];
  const [sy, sm, sd] = startDateLocal.split('-').map(Number);
  const [ey, em, ed] = untilDateLocal.split('-').map(Number);

  const current = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  while (current <= end) {
    if (jsDays.includes(current.getDay())) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export { TIMEZONE };
