'use server';

/**
 * Schedule Server Actions
 * Server-side actions for schedule management
 */

import { revalidatePath } from 'next/cache';
import {
  getSchedules as getSchedulesService,
  getClasses as getClassesService,
  getScheduleById as getScheduleByIdService,
  createSchedules as createSchedulesService,
  updateSchedule as updateScheduleService,
  deleteSchedule as deleteScheduleService,
} from '@/services/portal/schedule.service';
import type {
  ISchedule,
  IClass,
  ICreateScheduleData,
  IUpdateScheduleData,
} from '@/interfaces/portal';
import { auth } from '@/auth';

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
