'use server';

/**
 * Schedule Server Actions V2
 *
 * Server actions for ScheduleSeries + Schedule operations.
 * Handles Google Calendar sync, notifications, and auth.
 */

import { revalidatePath } from 'next/cache';
import {
  getSchedules as getSchedulesService,
  getStudentSchedules as getStudentSchedulesService,
  getClassesForSchedule as getClassesService,
  getScheduleById as getScheduleByIdService,
  getScheduleSeriesById as getScheduleSeriesByIdService,
  createScheduleSeries as createScheduleSeriesService,
  updateScheduleSeries as updateScheduleSeriesService,
  deleteScheduleSeries as deleteScheduleSeriesService,
  deleteSchedule as deleteScheduleService,
} from '@/services/portal/schedule.service';
import type {
  ISchedule,
  IScheduleFormData,
  IUpdateScheduleData,
  IClass,
} from '@/interfaces/portal';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createBulkNotifications } from '@/services/portal/notification.service';
import {
  syncScheduleCreate,
  syncScheduleUpdate,
  syncScheduleDelete,
} from '@/lib/portal/calendar-sync.service';
import { getCalendarConnection } from '@/lib/portal/calendar-token.service';
import { USER_ROLE, ENROLLMENT_STATUS } from '@/constants/portal/roles';
import { NotificationType } from '@/enums/portal/common';
import { jsDaysToByDay } from '@/lib/utils/rrule';
import type { RepeatRuleJson } from '@/interfaces/portal/schedule';

// ══════════════════════════════════════════════════════════════════
// READ
// ══════════════════════════════════════════════════════════════════

/**
 * Fetch all sessions for current user (role-aware).
 */
export async function fetchSchedules(): Promise<{
  success: boolean;
  schedules?: ISchedule[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.portalUser.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    let schedules: ISchedule[];
    if (user?.role === USER_ROLE.STUDENT) {
      schedules = await getStudentSchedulesService(session.user.id);
    } else {
      schedules = await getSchedulesService(session.user.id);
    }

    return { success: true, schedules };
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch schedules',
    };
  }
}

/**
 * Fetch all classes for dropdown.
 */
export async function fetchClasses(): Promise<{
  success: boolean;
  classes?: IClass[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const classes = await getClassesService(session.user.id);
    return { success: true, classes };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch classes',
    };
  }
}

/**
 * Get session by ID.
 */
export async function fetchScheduleById(id: string): Promise<{
  success: boolean;
  schedule?: ISchedule | null;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const schedule = await getScheduleByIdService(id);
    return { success: true, schedule };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch schedule',
    };
  }
}

// ══════════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════════

/**
 * Create a schedule series + schedules from form data.
 */
export async function createSchedule(
  data: IScheduleFormData
): Promise<{
  success: boolean;
  count?: number;
  schedules?: ISchedule[];
  syncError?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Convert form data → service DTO
    const isRecurring = !!(data.isRecurring && data.weekdays && data.weekdays.length > 0 && data.endDate);

    let repeatRule: RepeatRuleJson | undefined;
    if (isRecurring && data.weekdays && data.endDate) {
      repeatRule = {
        freq: 'WEEKLY',
        byWeekDays: jsDaysToByDay(data.weekdays),
        untilDateLocal: data.endDate,
      };
    }

    const result = await createScheduleSeriesService(
      {
        classId: data.classId,
        title: data.title,
        description: data.description,
        startDateLocal: data.startDate,
        startTimeLocal: data.startTime,
        endTimeLocal: data.endTime,
        location: data.location,
        meetingLink: data.meetingLink,
        isRecurring,
        repeatRule,
        syncToGoogle: data.syncToGoogle,
      },
      session.user.id
    );

    // ── Notifications ──
    try {
      const enrollments = await prisma.portalClassEnrollment.findMany({
        where: { classId: data.classId, status: ENROLLMENT_STATUS.ENROLLED },
        select: { studentId: true },
      });
      const studentIds = enrollments.map(e => e.studentId);
      if (studentIds.length > 0) {
        await createBulkNotifications(studentIds, {
          type: NotificationType.SCHEDULE_CREATED,
          title: 'Lịch học mới',
          message: `Lịch học mới: "${data.title}"`,
          link: '/portal/student/schedule',
        });
      }
    } catch (e) {
      console.error('Schedule notification error:', e);
    }

    // ── Google Calendar sync (non-blocking) ──
    let syncError: string | undefined;
    try {
      if (data.syncToGoogle) {
        await syncScheduleCreate({
          id: result.series.id,
          classId: data.classId,
          teacherId: session.user.id,
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          meetingLink: data.meetingLink || null,
          startDateLocal: data.startDate,
          startTimeLocal: data.startTime,
          endTimeLocal: data.endTime,
          isRecurring,
          repeatRule: repeatRule || null,
        });
        console.log(`[ScheduleAction] Calendar sync completed for schedule series ${result.series.id}`);
      }
    } catch (syncErr) {
      syncError = syncErr instanceof Error ? syncErr.message : 'Google Calendar sync failed';
      console.error('[ScheduleAction] Calendar sync error (non-blocking):', syncErr);
    }

    revalidatePath('/portal/teacher/schedule');
    return {
      success: true,
      count: result.sessions.length,
      schedules: result.sessions,
      syncError,
    };
  } catch (error) {
    console.error('Error creating schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create schedule',
    };
  }
}

// ══════════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════════

/**
 * Update a schedule series and propagate to future schedules.
 * Accepts seriesId + form data.
 */
export async function updateSchedule(
  seriesId: string,
  data: IScheduleFormData
): Promise<{
  success: boolean;
  schedules?: ISchedule[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const updateData: IUpdateScheduleData = {
      title: data.title,
      description: data.description,
      startDateLocal: data.startDate,
      startTimeLocal: data.startTime,
      endTimeLocal: data.endTime,
      location: data.location,
      meetingLink: data.meetingLink,
    };

    const result = await updateScheduleSeriesService(seriesId, updateData);

    // ── Notifications ──
    try {
      if (result.series.classId) {
        const enrollments = await prisma.portalClassEnrollment.findMany({
          where: { classId: result.series.classId, status: ENROLLMENT_STATUS.ENROLLED },
          select: { studentId: true },
        });
        const studentIds = enrollments.map(e => e.studentId);
        if (studentIds.length > 0) {
          await createBulkNotifications(studentIds, {
            type: NotificationType.SCHEDULE_UPDATED,
            title: 'Cập nhật lịch học',
            message: `Lịch học "${data.title}" đã được cập nhật`,
            link: '/portal/student/schedule',
          });
        }
      }
    } catch (e) {
      console.error('Schedule update notification error:', e);
    }

    // ── Google Calendar sync update ──
    try {
      if (result.series.isGoogleSynced && result.series.googleEventId) {
        await syncScheduleUpdate({
          id: seriesId,
          classId: result.series.classId,
          teacherId: result.series.teacherId,
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          meetingLink: data.meetingLink || null,
          startDateLocal: data.startDate,
          startTimeLocal: data.startTime,
          endTimeLocal: data.endTime,
          isRecurring: result.series.isRecurring,
          repeatRule: result.series.repeatRule as RepeatRuleJson | null,
          googleEventId: result.series.googleEventId,
        });
      }
    } catch (syncErr) {
      console.error('[ScheduleAction] Calendar sync update error (non-blocking):', syncErr);
    }

    revalidatePath('/portal/teacher/schedule');
    return { success: true, schedules: result.sessions };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update schedule',
    };
  }
}

// ══════════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════════

/**
 * Delete a single schedule.
 */
export async function deleteSchedule(sessionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get session info before deleting for notification
    const sessionInfo = await prisma.portalSchedule.findUnique({
      where: { id: sessionId },
      select: { title: true, classId: true, seriesId: true },
    });

    await deleteScheduleService(sessionId);

    // Notify students
    if (sessionInfo?.classId) {
      try {
        const enrollments = await prisma.portalClassEnrollment.findMany({
          where: { classId: sessionInfo.classId, status: ENROLLMENT_STATUS.ENROLLED },
          select: { studentId: true },
        });
        const studentIds = enrollments.map(e => e.studentId);
        if (studentIds.length > 0) {
          await createBulkNotifications(studentIds, {
            type: NotificationType.SCHEDULE_CANCELLED,
            title: 'Lịch học bị hủy',
            message: `Lịch học "${sessionInfo.title}" đã bị hủy`,
            link: '/portal/student/schedule',
          });
        }
      } catch (e) {
        console.error('Schedule cancel notification error:', e);
      }
    }

    revalidatePath('/portal/teacher/schedule');
    return { success: true };
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete schedule',
    };
  }
}

/**
 * Delete entire schedule series (all schedules + Google event).
 */
export async function deleteScheduleGroup(seriesId: string): Promise<{
  success: boolean;
  deletedIds?: string[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get schedule series info for Google sync + notifications
    const scheduleSeries = await getScheduleSeriesByIdService(seriesId);

    // Delete from Google Calendar first
    if (scheduleSeries?.isGoogleSynced && scheduleSeries?.googleEventId) {
      try {
        await syncScheduleDelete({
          id: seriesId,
          teacherId: scheduleSeries.teacherId,
          googleEventId: scheduleSeries.googleEventId,
        });
      } catch (syncErr) {
        console.error('[ScheduleAction] Calendar sync delete error (non-blocking):', syncErr);
      }
    }

    const deletedIds = await deleteScheduleSeriesService(seriesId);

    // Notify students
    if (scheduleSeries?.classId) {
      try {
        const enrollments = await prisma.portalClassEnrollment.findMany({
          where: { classId: scheduleSeries.classId, status: ENROLLMENT_STATUS.ENROLLED },
          select: { studentId: true },
        });
        const studentIds = enrollments.map(e => e.studentId);
        if (studentIds.length > 0) {
          await createBulkNotifications(studentIds, {
            type: NotificationType.SCHEDULE_CANCELLED,
            title: 'Lịch học bị hủy',
            message: `Nhóm lịch học "${scheduleSeries.title}" đã bị hủy`,
            link: '/portal/student/schedule',
          });
        }
      } catch (e) {
        console.error('Schedule group cancel notification error:', e);
      }
    }

    revalidatePath('/portal/teacher/schedule');
    return { success: true, deletedIds };
  } catch (error) {
    console.error('Error deleting schedule group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete schedule group',
    };
  }
}

// ══════════════════════════════════════════════════════════════════
// GOOGLE CALENDAR
// ══════════════════════════════════════════════════════════════════

/**
 * Manually sync a schedule series to Google Calendar (from drawer button).
 */
export async function syncScheduleToGoogleCalendar(sessionId: string): Promise<{
  success: boolean;
  message?: string;
  googleEventId?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the schedule to find the schedule series
    const sessionInfo = await prisma.portalSchedule.findUnique({
      where: { id: sessionId },
      select: { seriesId: true },
    });

    if (!sessionInfo?.seriesId) {
      return { success: false, error: 'Không tìm thấy lịch học' };
    }

    const scheduleSeries = await getScheduleSeriesByIdService(sessionInfo.seriesId);
    if (!scheduleSeries) {
      return { success: false, error: 'Không tìm thấy nhóm lịch học' };
    }

    if (scheduleSeries.teacherId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check teacher connection
    const connection = await getCalendarConnection(session.user.id);
    if (!connection || !connection.isValid) {
      return {
        success: false,
        error: 'Google Calendar chưa được kết nối. Vui lòng kết nối trong phần Cài đặt.',
      };
    }

    // Already synced?
    if (scheduleSeries.isGoogleSynced && scheduleSeries.googleEventId) {
      return {
        success: true,
        message: 'Đã đồng bộ trước đó',
        googleEventId: scheduleSeries.googleEventId,
      };
    }

    // Sync
    const syncResult = await syncScheduleCreate({
      id: scheduleSeries.id,
      classId: scheduleSeries.classId,
      teacherId: scheduleSeries.teacherId,
      title: scheduleSeries.title,
      description: scheduleSeries.description || null,
      location: scheduleSeries.location || null,
      meetingLink: scheduleSeries.meetingLink || null,
      startDateLocal: scheduleSeries.startDateLocal,
      startTimeLocal: scheduleSeries.startTimeLocal,
      endTimeLocal: scheduleSeries.endTimeLocal,
      isRecurring: scheduleSeries.isRecurring,
      repeatRule: scheduleSeries.repeatRule as RepeatRuleJson | null,
    });

    revalidatePath('/portal/teacher/schedule');

    if (syncResult.googleEventId) {
      return {
        success: true,
        message: `Đã đồng bộ ${scheduleSeries.isRecurring ? 'chuỗi lịch' : 'buổi học'} với Google Calendar`,
        googleEventId: syncResult.googleEventId,
      };
    }

    return {
      success: syncResult.success,
      message: syncResult.success
        ? 'Đồng bộ hoàn tất (GV chưa kết nối Google Calendar)'
        : undefined,
      error: syncResult.error,
    };
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync with Google Calendar',
    };
  }
}

/**
 * Get calendar connection status for current user.
 */
export async function getCalendarStatus(): Promise<{
  connected: boolean;
  isValid: boolean;
  message: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { connected: false, isValid: false, message: 'Chưa đăng nhập' };
    }

    const connection = await getCalendarConnection(session.user.id);
    if (!connection) {
      return { connected: false, isValid: false, message: 'Chưa kết nối Google Calendar' };
    }

    return {
      connected: true,
      isValid: connection.isValid,
      message: connection.isValid
        ? 'Google Calendar đã kết nối'
        : 'Kết nối không hợp lệ — vui lòng kết nối lại',
    };
  } catch {
    return { connected: false, isValid: false, message: 'Lỗi kiểm tra kết nối' };
  }
}
