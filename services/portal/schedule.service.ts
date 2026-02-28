/**
 * Schedule Service V2
 *
 * CRUD for ScheduleSeries + Schedule.
 * ScheduleSeries = template/rule; Schedules = individual calendar instances.
 */

import { prisma } from '@/lib/prisma';
import { ENROLLMENT_STATUS } from '@/constants/portal/roles';
import type {
  ISchedule,
  IScheduleSeries,
  ICreateScheduleData,
  IUpdateScheduleData,
  IClass,
} from '@/interfaces/portal';
import { SCHEDULE_STATUS } from '@/constants/portal/roles';
import {
  generateSessionDates,
  localToDate,
} from '@/lib/utils/rrule';

// ── Prisma Include ──

const SCHEDULE_INCLUDE = {
  class: {
    select: { id: true, className: true, classCode: true, level: true },
  },
  series: {
    select: {
      id: true,
      teacherId: true,
      isGoogleSynced: true,
      googleEventId: true,
      isRecurring: true,
    },
  },
} as const;

// ── Mapper: Schedule → ISchedule ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToSchedule(session: any): ISchedule {
  const synced = session.series?.isGoogleSynced ?? false;
  return {
    id: session.id,
    classId: session.classId,
    seriesId: session.seriesId,
    teacherId: session.series?.teacherId,
    title: session.title,
    description: session.description,
    startTime: session.startAt instanceof Date
      ? session.startAt.toISOString()
      : session.startAt,
    endTime: session.endAt instanceof Date
      ? session.endAt.toISOString()
      : session.endAt,
    status: session.status,
    location: session.location,
    meetingLink: session.meetingLink,
    isOverride: session.isOverride,
    overrideType: session.overrideType,
    isGoogleSynced: synced,
    syncedToGoogle: synced,
    googleEventId: session.series?.googleEventId ?? null,
    isRecurring: session.series?.isRecurring ?? false,
    createdAt: session.createdAt?.toISOString?.() ?? session.createdAt,
    updatedAt: session.updatedAt?.toISOString?.() ?? session.updatedAt,
    class: session.class
      ? {
          id: session.class.id,
          className: session.class.className,
          classCode: session.class.classCode,
          level: session.class.level || '',
        }
      : undefined,
  };
}

// ══════════════════════════════════════════════════════════════════
// READ
// ══════════════════════════════════════════════════════════════════

/**
 * Fetch all schedules for a teacher.
 */
export async function getSchedules(userId?: string): Promise<ISchedule[]> {
  const sessions = await prisma.portalSchedule.findMany({
    where: userId
      ? { series: { teacherId: userId, isDeleted: false } }
      : { series: { isDeleted: false } },
    include: SCHEDULE_INCLUDE,
    orderBy: { startAt: 'asc' },
  });

  return sessions.map(mapToSchedule);
}

/**
 * Fetch sessions for classes a student is enrolled in.
 */
export async function getStudentSchedules(studentId: string): Promise<ISchedule[]> {
  const enrollments = await prisma.portalClassEnrollment.findMany({
    where: { studentId, status: ENROLLMENT_STATUS.ENROLLED },
    select: { classId: true },
  });

  const classIds = enrollments.map(e => e.classId);
  if (classIds.length === 0) return [];

  const sessions = await prisma.portalSchedule.findMany({
    where: { classId: { in: classIds } },
    include: SCHEDULE_INCLUDE,
    orderBy: { startAt: 'asc' },
  });

  return sessions.map(mapToSchedule);
}

/**
 * Get classes for schedule dropdown.
 */
export async function getClassesForSchedule(userId?: string): Promise<IClass[]> {
  const classes = await prisma.portalClass.findMany({
    where: userId ? { teacherId: userId } : {},
    orderBy: { className: 'asc' },
  });

  return classes.map(cls => ({
    id: cls.id,
    className: cls.className,
    classCode: cls.classCode,
    level: cls.level || '',
    status: cls.status,
    startDate: cls.startDate.toISOString(),
    teacherId: cls.teacherId,
  }));
}

/**
 * Get a single schedule by ID with full class/enrollment info.
 */
export async function getScheduleById(id: string): Promise<ISchedule | null> {
  const session = await prisma.portalSchedule.findUnique({
    where: { id },
    include: {
      series: {
        select: {
          id: true,
          teacherId: true,
          isGoogleSynced: true,
          googleEventId: true,
          isRecurring: true,
        },
      },
      class: {
        include: {
          teacher: {
            select: { id: true, name: true, email: true },
          },
          enrollments: {
            where: { status: ENROLLMENT_STATUS.ENROLLED },
            include: {
              student: { select: { id: true, name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  const synced = session.series?.isGoogleSynced ?? false;

  return {
    id: session.id,
    classId: session.classId,
    seriesId: session.seriesId,
    teacherId: session.series?.teacherId,
    title: session.title,
    description: session.description,
    startTime: session.startAt.toISOString(),
    endTime: session.endAt.toISOString(),
    status: session.status,
    location: session.location,
    meetingLink: session.meetingLink,
    isOverride: session.isOverride,
    overrideType: session.overrideType,
    isGoogleSynced: synced,
    syncedToGoogle: synced,
    googleEventId: session.series?.googleEventId ?? null,
    isRecurring: session.series?.isRecurring ?? false,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    class: {
      id: session.class.id,
      className: session.class.className,
      classCode: session.class.classCode,
      level: session.class.level || '',
      enrollments: session.class.enrollments?.map((e: { id: string; student: { id: string; name: string; image: string | null } }) => ({
        id: e.id,
        student: e.student,
      })),
    },
  };
}

/**
 * Get a schedule series by ID.
 */
export async function getScheduleSeriesById(seriesId: string): Promise<IScheduleSeries | null> {
  const scheduleSeries = await prisma.portalScheduleSeries.findUnique({
    where: { id: seriesId },
    include: {
      class: {
        select: { id: true, className: true, classCode: true, level: true },
      },
    },
  });

  if (!scheduleSeries) return null;

  return {
    id: scheduleSeries.id,
    classId: scheduleSeries.classId,
    teacherId: scheduleSeries.teacherId,
    title: scheduleSeries.title,
    description: scheduleSeries.description,
    location: scheduleSeries.location,
    meetingLink: scheduleSeries.meetingLink,
    timezone: scheduleSeries.timezone,
    startTimeLocal: scheduleSeries.startTimeLocal,
    endTimeLocal: scheduleSeries.endTimeLocal,
    startDateLocal: scheduleSeries.startDateLocal,
    isRecurring: scheduleSeries.isRecurring,
    repeatRule: scheduleSeries.repeatRule as IScheduleSeries['repeatRule'],
    isGoogleSynced: scheduleSeries.isGoogleSynced,
    googleCalendarId: scheduleSeries.googleCalendarId,
    googleEventId: scheduleSeries.googleEventId,
    lastSyncError: scheduleSeries.lastSyncError,
    syncedAt: scheduleSeries.syncedAt?.toISOString() ?? null,
    isDeleted: scheduleSeries.isDeleted,
    createdAt: scheduleSeries.createdAt.toISOString(),
    updatedAt: scheduleSeries.updatedAt.toISOString(),
    class: scheduleSeries.class
      ? {
          id: scheduleSeries.class.id,
          className: scheduleSeries.class.className,
          classCode: scheduleSeries.class.classCode,
          level: scheduleSeries.class.level,
        }
      : undefined,
  };
}

// ══════════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════════

/**
 * Create a schedule series + all its schedules in one transaction.
 */
export async function createScheduleSeries(
  data: ICreateScheduleData,
  teacherId: string
): Promise<{ series: IScheduleSeries; sessions: ISchedule[] }> {
  // 1) Create the ScheduleSeries
  const scheduleSeries = await prisma.portalScheduleSeries.create({
    data: {
      classId: data.classId,
      teacherId,
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      meetingLink: data.meetingLink || null,
      startTimeLocal: data.startTimeLocal,
      endTimeLocal: data.endTimeLocal,
      startDateLocal: data.startDateLocal,
      isRecurring: data.isRecurring,
      repeatRule: data.repeatRule
        ? JSON.parse(JSON.stringify(data.repeatRule))
        : undefined,
    },
    include: {
      class: {
        select: { id: true, className: true, classCode: true, level: true },
      },
    },
  });

  // 2) Generate session dates
  let sessionDates: string[];
  if (data.isRecurring && data.repeatRule) {
    sessionDates = generateSessionDates(
      data.startDateLocal,
      data.repeatRule.byWeekDays,
      data.repeatRule.untilDateLocal
    );
  } else {
    sessionDates = [data.startDateLocal];
  }

  // 3) Batch-create sessions
  const sessions = await Promise.all(
    sessionDates.map(dateLocal =>
      prisma.portalSchedule.create({
        data: {
          classId: data.classId,
          seriesId: scheduleSeries.id,
          title: data.title,
          description: data.description || null,
          startAt: localToDate(dateLocal, data.startTimeLocal),
          endAt: localToDate(dateLocal, data.endTimeLocal),
          status: SCHEDULE_STATUS.SCHEDULED,
          location: data.location || null,
          meetingLink: data.meetingLink || null,
        },
        include: SCHEDULE_INCLUDE,
      })
    )
  );

  return {
    series: {
      id: scheduleSeries.id,
      classId: scheduleSeries.classId,
      teacherId: scheduleSeries.teacherId,
      title: scheduleSeries.title,
      description: scheduleSeries.description,
      location: scheduleSeries.location,
      meetingLink: scheduleSeries.meetingLink,
      timezone: scheduleSeries.timezone,
      startTimeLocal: scheduleSeries.startTimeLocal,
      endTimeLocal: scheduleSeries.endTimeLocal,
      startDateLocal: scheduleSeries.startDateLocal,
      isRecurring: scheduleSeries.isRecurring,
      repeatRule: scheduleSeries.repeatRule as IScheduleSeries['repeatRule'],
      isGoogleSynced: scheduleSeries.isGoogleSynced,
      googleEventId: scheduleSeries.googleEventId,
      isDeleted: scheduleSeries.isDeleted,
      createdAt: scheduleSeries.createdAt.toISOString(),
      updatedAt: scheduleSeries.updatedAt.toISOString(),
      class: scheduleSeries.class
        ? {
            id: scheduleSeries.class.id,
            className: scheduleSeries.class.className,
            classCode: scheduleSeries.class.classCode,
            level: scheduleSeries.class.level,
          }
        : undefined,
    },
    sessions: sessions.map(mapToSchedule),
  };
}

// ════════════════════════════════════════════════════════════════
// UPDATE
// ════════════════════════════════════════════════════════════════

/**
 * Update a schedule series and propagate changes to future non-override sessions.
 */
export async function updateScheduleSeries(
  seriesId: string,
  data: IUpdateScheduleData
): Promise<{ series: IScheduleSeries; sessions: ISchedule[] }> {
  // 1) Update the schedule series record
  const scheduleSeries = await prisma.portalScheduleSeries.update({
    where: { id: seriesId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.location !== undefined && { location: data.location || null }),
      ...(data.meetingLink !== undefined && { meetingLink: data.meetingLink || null }),
      ...(data.startTimeLocal && { startTimeLocal: data.startTimeLocal }),
      ...(data.endTimeLocal && { endTimeLocal: data.endTimeLocal }),
      ...(data.startDateLocal && { startDateLocal: data.startDateLocal }),
    },
  });

  // 2) Propagate to future, non-override sessions
  const now = new Date();
  const sessionUpdate: Record<string, unknown> = {};
  if (data.title) sessionUpdate.title = data.title;
  if (data.description !== undefined) sessionUpdate.description = data.description || null;
  if (data.location !== undefined) sessionUpdate.location = data.location || null;
  if (data.meetingLink !== undefined) sessionUpdate.meetingLink = data.meetingLink || null;

  if (Object.keys(sessionUpdate).length > 0) {
    await prisma.portalSchedule.updateMany({
      where: { seriesId, startAt: { gte: now }, isOverride: false },
      data: sessionUpdate,
    });
  }

  // 3) If time changed, update startAt/endAt of future sessions
  if (data.startTimeLocal || data.endTimeLocal) {
    const startTime = data.startTimeLocal || scheduleSeries.startTimeLocal;
    const endTime = data.endTimeLocal || scheduleSeries.endTimeLocal;

    const futureSessions = await prisma.portalSchedule.findMany({
      where: { seriesId, startAt: { gte: now }, isOverride: false },
    });

    await Promise.all(
      futureSessions.map((session: { id: string; startAt: Date }) => {
        // Extract local date from existing startAt (UTC+7)
        const localDate = utcToLocalDateStr(session.startAt);
        return prisma.portalSchedule.update({
          where: { id: session.id },
          data: {
            startAt: localToDate(localDate, startTime),
            endAt: localToDate(localDate, endTime),
          },
        });
      })
    );
  }

  // 4) Fetch updated sessions
  const sessions = await prisma.portalSchedule.findMany({
    where: { seriesId },
    include: SCHEDULE_INCLUDE,
    orderBy: { startAt: 'asc' },
  });

  return {
    series: {
      id: scheduleSeries.id,
      classId: scheduleSeries.classId,
      teacherId: scheduleSeries.teacherId,
      title: scheduleSeries.title,
      description: scheduleSeries.description,
      location: scheduleSeries.location,
      meetingLink: scheduleSeries.meetingLink,
      timezone: scheduleSeries.timezone,
      startTimeLocal: scheduleSeries.startTimeLocal,
      endTimeLocal: scheduleSeries.endTimeLocal,
      startDateLocal: scheduleSeries.startDateLocal,
      isRecurring: scheduleSeries.isRecurring,
      repeatRule: scheduleSeries.repeatRule as IScheduleSeries['repeatRule'],
      isGoogleSynced: scheduleSeries.isGoogleSynced,
      googleEventId: scheduleSeries.googleEventId,
      isDeleted: scheduleSeries.isDeleted,
      createdAt: scheduleSeries.createdAt.toISOString(),
      updatedAt: scheduleSeries.updatedAt.toISOString(),
    },
    sessions: sessions.map(mapToSchedule),
  };
}

// ══════════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════════

/**
 * Soft-delete a schedule series and hard-delete all its sessions.
 * Returns deleted schedule IDs for optimistic UI update.
 */
export async function deleteScheduleSeries(seriesId: string): Promise<string[]> {
  const sessions = await prisma.portalSchedule.findMany({
    where: { seriesId },
    select: { id: true },
  });
  const sessionIds = sessions.map((s: { id: string }) => s.id);

  await prisma.$transaction([
    prisma.portalScheduleSeries.update({
      where: { id: seriesId },
      data: { isDeleted: true, deletedAt: new Date() },
    }),
    prisma.portalSchedule.deleteMany({ where: { seriesId } }),
  ]);

  return sessionIds;
}

/**
 * Delete a single schedule.
 */
export async function deleteSchedule(sessionId: string): Promise<void> {
  await prisma.portalSchedule.delete({ where: { id: sessionId } });
}

// ── Helpers ──

/**
 * Convert UTC Date → local "YYYY-MM-DD" string (Asia/Ho_Chi_Minh = UTC+7)
 */
function utcToLocalDateStr(date: Date): string {
  const local = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, '0');
  const d = String(local.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
