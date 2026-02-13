'use server';

/**
 * Schedule Server Actions
 * Server-side actions for schedule management
 */

import { revalidatePath } from 'next/cache';
import {
  getSchedules as getSchedulesService,
  getClassesForSchedule as getClassesService,
  getScheduleById as getScheduleByIdService,
  createSchedules as createSchedulesService,
  updateSchedule as updateScheduleService,
  deleteSchedule as deleteScheduleService,
  deleteScheduleGroup as deleteScheduleGroupService,
} from '@/services/portal/schedule.service';
import type {
  ISchedule,
  IClass,
  ICreateScheduleData,
  IUpdateScheduleData,
} from '@/interfaces/portal';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createGoogleCalendarEvent, scheduleToGoogleEvent } from '@/lib/utils/google-calendar';

/**
 * Fetch all schedules for current user
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

    const schedules = await getSchedulesService(session.user.id);
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
 * Fetch all classes for dropdown
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
 * Get schedule by ID
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

/**
 * Create schedule(s)
 */
export async function createSchedule(
  data: ICreateScheduleData
): Promise<{
  success: boolean;
  count?: number;
  schedules?: ISchedule[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await createSchedulesService(data, session.user.id);
    revalidatePath('/portal/teacher/schedule');
    return { success: true, ...result };
  } catch (error) {
    console.error('Error creating schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create schedule',
    };
  }
}

/**
 * Update schedule
 */
export async function updateSchedule(
  id: string,
  data: IUpdateScheduleData
): Promise<{
  success: boolean;
  schedule?: ISchedule;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const schedule = await updateScheduleService(id, data);
    revalidatePath('/portal/teacher/schedule');
    return { success: true, schedule };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update schedule',
    };
  }
}

/**
 * Delete schedule
 */
export async function deleteSchedule(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await deleteScheduleService(id);
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
 * Delete all schedules in a recurrence group (batch delete)
 */
export async function deleteScheduleGroup(recurrenceGroupId: string): Promise<{
  success: boolean;
  deletedIds?: string[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const deletedIds = await deleteScheduleGroupService(recurrenceGroupId);
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

/**
 * Sync schedule to Google Calendar
 */
export async function syncScheduleToGoogleCalendar(scheduleId: string): Promise<{
  success: boolean;
  message?: string;
  googleEventId?: string;
  googleEventLink?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch the schedule
    const schedule = await prisma.portalSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        class: {
          include: {
            enrollments: {
              where: { status: 'ENROLLED' },
              include: {
                student: {
                  select: { email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return { success: false, error: 'Schedule not found' };
    }

    // Verify user owns this schedule
    if (schedule.teacherId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if already synced
    if (schedule.syncedToGoogle && schedule.googleEventId) {
      return {
        success: true,
        message: 'Already synced',
        googleEventId: schedule.googleEventId,
        googleEventLink: `https://calendar.google.com/calendar/event?eid=${schedule.googleEventId}`,
      };
    }

    // Get user's Google access token from Account table
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return {
        success: false,
        error: 'Google Calendar chưa được kết nối. Vui lòng đăng nhập bằng Google để đồng bộ.',
      };
    }

    // Check if token is expired and try to refresh
    let accessToken = account.access_token;
    if (account.expires_at && account.expires_at * 1000 < Date.now()) {
      if (!account.refresh_token) {
        return {
          success: false,
          error: 'Phiên Google đã hết hạn. Vui lòng đăng xuất và đăng nhập lại bằng Google.',
        };
      }

      // Refresh the token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: account.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        return {
          success: false,
          error: 'Không thể làm mới token Google. Vui lòng đăng nhập lại.',
        };
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      // Update the stored token
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokenData.access_token,
          expires_at: tokenData.expires_in
            ? Math.floor(Date.now() / 1000) + tokenData.expires_in
            : account.expires_at,
        },
      });
    }

    // Prepare attendees (students in the class)
    const attendees = schedule.class.enrollments.map((e) => e.student.email);

    // Convert schedule to Google Calendar event
    const googleEvent = scheduleToGoogleEvent({
      title: schedule.title,
      description: schedule.description || undefined,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location || undefined,
      meetingLink: schedule.meetingLink || undefined,
      attendees,
    });

    // Create event in Google Calendar
    const result = await createGoogleCalendarEvent(accessToken, googleEvent);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to sync with Google Calendar',
      };
    }

    // Update schedule with Google event ID
    await prisma.portalSchedule.update({
      where: { id: scheduleId },
      data: {
        googleEventId: result.eventId,
        syncedToGoogle: true,
      },
    });

    revalidatePath('/portal/teacher/schedule');
    return {
      success: true,
      message: 'Đã đồng bộ với Google Calendar thành công',
      googleEventId: result.eventId,
      googleEventLink: `https://calendar.google.com/calendar/event?eid=${result.eventId}`,
    };
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync with Google Calendar',
    };
  }
}
