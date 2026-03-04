/**
 * Calendar Sync Service V2
 *
 * Syncs ScheduleSeries → Google Calendar.
 *
 * Rules:
 * 1) One ScheduleSeries → One Google Calendar event (recurring via RRULE).
 * 2) Teacher is the organizer. Event lives on teacher's calendar.
 * 3) ALL enrolled students are added as attendees → Google handles distribution.
 * 4) sendUpdates=all on every mutation → attendees get invite/update/cancel emails.
 * 5) No reverse sync. Ruby-HSK is source of truth.
 */

import { prisma } from '@/lib/prisma';
import { ENROLLMENT_STATUS } from '@/constants/portal/roles';
import { getValidAccessToken, markTokenInvalid } from '@/lib/portal/calendar-token.service';
import {
  insertCalendarEvent,
  patchCalendarEvent,
  deleteCalendarEvent,
  buildCalendarEvent,
  type GoogleCalendarEvent,
} from '@/lib/utils/google-calendar';
import {
  buildRRule,
  toGoogleDateTime,
  findFirstOccurrence,
  type RepeatRule,
} from '@/lib/utils/rrule';

/** Get portal base URL from env (works in both local and production) */
function getPortalUrl(): string {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base}/portal`;
}

/** Build Vietnamese event summary: [Ruby-HSK] - ClassName - Title */
function buildSummary(className: string | undefined, title: string): string {
  if (className) return `[Ruby-HSK] - ${className} - ${title}`;
  return `[Ruby-HSK] ${title}`;
}

/** Build Vietnamese event description */
function buildDescription(
  description: string | null | undefined,
  className: string | undefined,
): string {
  return [
    description || '',
    '',
    className ? `📚 Lớp: ${className}` : '📚 Lớp: Ruby-HSK',
    `📋 Quản lý lịch: ${getPortalUrl()}`,
  ].filter(Boolean).join('\n');
}

// ── Types ──

export interface ScheduleForSync {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  meetingLink?: string | null;
  startDateLocal: string;
  startTimeLocal: string;
  endTimeLocal: string;
  isRecurring: boolean;
  repeatRule?: RepeatRule | null;
  googleEventId?: string | null;
}

export interface SyncResult {
  success: boolean;
  googleEventId?: string;
  error?: string;
}

// ── CREATE ──

export async function syncScheduleCreate(schedule: ScheduleForSync): Promise<SyncResult> {
  console.log(`[CalendarSync] Creating event for schedule ${schedule.id}`);

  // Get teacher access token
  const tokenResult = await getValidAccessToken(schedule.teacherId);
  if (!('accessToken' in tokenResult)) {
    console.log(`[CalendarSync] Teacher not connected — sync skipped`);
    return { success: true }; // Not an error, just not connected
  }

  const accessToken = tokenResult.accessToken;

  // Get all enrolled student emails as attendees
  const enrollments = await prisma.portalClassEnrollment.findMany({
    where: { classId: schedule.classId, status: ENROLLMENT_STATUS.ENROLLED },
    include: { student: { select: { email: true } } },
  });
  const attendeeEmails = enrollments.map(e => e.student.email);

  // Determine event start date (first valid weekday for recurring)
  let eventStartDate = schedule.startDateLocal;
  if (schedule.isRecurring && schedule.repeatRule) {
    eventStartDate = findFirstOccurrence(schedule.startDateLocal, schedule.repeatRule.byWeekDays);
  }

  const start = toGoogleDateTime(eventStartDate, schedule.startTimeLocal);
  const end = toGoogleDateTime(eventStartDate, schedule.endTimeLocal);

  // Build RRULE for recurring schedule
  let rrule: string | undefined;
  if (schedule.isRecurring && schedule.repeatRule) {
    rrule = buildRRule(schedule.repeatRule);
  }

  // Get class name for the event
  const classData = await prisma.portalClass.findUnique({
    where: { id: schedule.classId },
    select: { className: true },
  });
  const className = classData?.className;

  const desc = buildDescription(schedule.description, className);

  const event = buildCalendarEvent({
    summary: buildSummary(className, schedule.title),
    description: desc,
    location: schedule.location || undefined,
    start,
    end,
    attendeeEmails,
    rrule,
  });

  const result = await insertCalendarEvent(accessToken, event);

  if (result.success && result.data) {
    await prisma.portalScheduleSeries.update({
      where: { id: schedule.id },
      data: {
        isGoogleSynced: true,
        googleEventId: result.data.eventId,
        syncedAt: new Date(),
        lastSyncError: null,
      },
    });

    console.log(
      `[CalendarSync] Event created: ${result.data.eventId}, ` +
      `${attendeeEmails.length} attendee(s), rrule=${rrule || 'none'}`
    );
    return { success: true, googleEventId: result.data.eventId };
  }

  // Handle failure
  const error = result.error || 'Insert failed';
  console.error(`[CalendarSync] Create failed:`, error);

  await prisma.portalScheduleSeries.update({
    where: { id: schedule.id },
    data: { lastSyncError: error },
  });

  if (error.includes('401') || error.includes('invalid')) {
    await markTokenInvalid(schedule.teacherId);
  }

  return { success: false, error };
}

// ── UPDATE ──

export async function syncScheduleUpdate(schedule: ScheduleForSync): Promise<SyncResult> {
  console.log(`[CalendarSync] Updating event for schedule ${schedule.id}`);

  if (!schedule.googleEventId) {
    return { success: true }; // Nothing to update on Google
  }

  const tokenResult = await getValidAccessToken(schedule.teacherId);
  if (!('accessToken' in tokenResult)) {
    return { success: true };
  }

  const accessToken = tokenResult.accessToken;

  // Refresh attendees
  const enrollments = await prisma.portalClassEnrollment.findMany({
    where: { classId: schedule.classId, status: ENROLLMENT_STATUS.ENROLLED },
    include: { student: { select: { email: true } } },
  });
  const attendeeEmails = enrollments.map(e => e.student.email);

  // Build start/end
  let eventStartDate = schedule.startDateLocal;
  if (schedule.isRecurring && schedule.repeatRule) {
    eventStartDate = findFirstOccurrence(schedule.startDateLocal, schedule.repeatRule.byWeekDays);
  }

  const start = toGoogleDateTime(eventStartDate, schedule.startTimeLocal);
  const end = toGoogleDateTime(eventStartDate, schedule.endTimeLocal);

  // Get class name for the event
  const classData = await prisma.portalClass.findUnique({
    where: { id: schedule.classId },
    select: { className: true },
  });
  const className = classData?.className;

  const desc = buildDescription(schedule.description, className);

  // Build patch payload
  const patch: Partial<GoogleCalendarEvent> = {
    summary: buildSummary(className, schedule.title),
    description: desc,
    location: schedule.location || undefined,
    start,
    end,
    attendees: attendeeEmails.map(email => ({ email })),
  };

  if (schedule.isRecurring && schedule.repeatRule) {
    patch.recurrence = [buildRRule(schedule.repeatRule)];
  }

  const result = await patchCalendarEvent(
    accessToken,
    schedule.googleEventId,
    patch
  );

  if (result.success) {
    await prisma.portalScheduleSeries.update({
      where: { id: schedule.id },
      data: { syncedAt: new Date(), lastSyncError: null },
    });
    console.log(`[CalendarSync] Event updated: ${schedule.googleEventId}`);
    return { success: true, googleEventId: schedule.googleEventId };
  }

  const error = result.error || 'Patch failed';
  await prisma.portalScheduleSeries.update({
    where: { id: schedule.id },
    data: { lastSyncError: error },
  });

  if (error.includes('401')) {
    await markTokenInvalid(schedule.teacherId);
  }

  return { success: false, error };
}

// ── DELETE ──

export async function syncScheduleDelete(
  schedule: Pick<ScheduleForSync, 'id' | 'teacherId' | 'googleEventId'>
): Promise<SyncResult> {
  console.log(`[CalendarSync] Deleting event for schedule ${schedule.id}`);

  if (!schedule.googleEventId) {
    return { success: true };
  }

  const tokenResult = await getValidAccessToken(schedule.teacherId);
  if (!('accessToken' in tokenResult)) {
    return { success: true };
  }

  const result = await deleteCalendarEvent(tokenResult.accessToken, schedule.googleEventId);

  if (result.success) {
    console.log(`[CalendarSync] Event deleted: ${schedule.googleEventId}`);
    return { success: true };
  }

  return { success: false, error: result.error };
}
