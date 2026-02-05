/**
 * Schedule Service
 * Server-side service for schedule operations using Prisma
 */

import { prisma } from '@/lib/prisma';
import type {
  ISchedule,
  IClass,
  ICreateScheduleData,
  IUpdateScheduleData,
} from '@/app/interfaces/portal';
import { SCHEDULE_STATUS } from '@/lib/constants/roles';
import dayjs from 'dayjs';

/**
 * Fetch all schedules for a user
 */
export async function getSchedules(userId?: string): Promise<ISchedule[]> {
  const schedules = await prisma.portalSchedule.findMany({
    where: userId ? { teacherId: userId } : {},
    include: {
      class: {
        select: {
          id: true,
          className: true,
          classCode: true,
          level: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  return schedules.map((schedule) => ({
    id: schedule.id,
    title: schedule.title,
    description: schedule.description || undefined,
    startTime: schedule.startTime.toISOString(),
    endTime: schedule.endTime.toISOString(),
    status: schedule.status,
    class: {
      id: schedule.class.id,
      name: schedule.class.className,
      code: schedule.class.classCode,
      level: schedule.class.level || '',
    },
  }));
}

/**
 * Fetch all classes for dropdown
 */
export async function getClasses(userId?: string): Promise<IClass[]> {
  const classes = await prisma.portalClass.findMany({
    where: userId ? { teacherId: userId } : {},
    orderBy: {
      className: 'asc',
    },
  });

  return classes.map((cls) => ({
    id: cls.id,
    name: cls.className,
    code: cls.classCode,
    level: cls.level || '',
    status: cls.status,
  }));
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(id: string): Promise<ISchedule | null> {
  const schedule = await prisma.portalSchedule.findUnique({
    where: { id },
    include: {
      class: {
        select: {
          id: true,
          className: true,
          classCode: true,
          level: true,
        },
      },
    },
  });

  if (!schedule) return null;

  return {
    id: schedule.id,
    title: schedule.title,
    description: schedule.description || undefined,
    startTime: schedule.startTime.toISOString(),
    endTime: schedule.endTime.toISOString(),
    status: schedule.status,
    class: {
      id: schedule.class.id,
      name: schedule.class.className,
      code: schedule.class.classCode,
      level: schedule.class.level || '',
    },
  };
}

/**
 * Create schedule(s) - handles both single and recurring schedules
 */
export async function createSchedules(
  data: ICreateScheduleData,
  teacherId: string
): Promise<{ count: number; schedules: ISchedule[] }> {
  const { recurrence, ...baseData } = data;

  // Handle recurring schedules
  if (recurrence && recurrence.weekdays.length > 0) {
    const sessions: Array<{
      title: string;
      description: string | null;
      classId: string;
      teacherId: string;
      startTime: Date;
      endTime: Date;
      status: string;
    }> = [];

    let currentDate = dayjs(baseData.startTime);
    const endDate = dayjs(recurrence.endDate);
    const duration = dayjs(baseData.endTime).diff(dayjs(baseData.startTime), 'minute');

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      if (recurrence.weekdays.includes(currentDate.day())) {
        const sessionStart = currentDate.toDate();
        const sessionEnd = currentDate.add(duration, 'minute').toDate();

        sessions.push({
          title: baseData.title,
          description: baseData.description || null,
          classId: baseData.classId,
          teacherId,
          startTime: sessionStart,
          endTime: sessionEnd,
          status: SCHEDULE_STATUS.SCHEDULED,
        });
      }
      currentDate = currentDate.add(1, 'day');
    }

    // Create all sessions
    const created = await Promise.all(
      sessions.map((session) =>
        prisma.portalSchedule.create({
          data: session,
          include: {
            class: {
              select: {
                id: true,
                className: true,
                classCode: true,
                level: true,
              },
            },
          },
        })
      )
    );

    return {
      count: created.length,
      schedules: created.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description || undefined,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        status: s.status,
        class: {
          id: s.class.id,
          name: s.class.className,
          code: s.class.classCode,
          level: s.class.level || '',
        },
      })),
    };
  }

  // Single schedule
  const created = await prisma.portalSchedule.create({
    data: {
      title: baseData.title,
      description: baseData.description || null,
      classId: baseData.classId,
      teacherId,
      startTime: baseData.startTime,
      endTime: baseData.endTime,
      status: SCHEDULE_STATUS.SCHEDULED,
    },
    include: {
      class: {
        select: {
          id: true,
          className: true,
          classCode: true,
          level: true,
        },
      },
    },
  });

  return {
    count: 1,
    schedules: [
      {
        id: created.id,
        title: created.title,
        description: created.description || undefined,
        startTime: created.startTime.toISOString(),
        endTime: created.endTime.toISOString(),
        status: created.status,
        class: {
          id: created.class.id,
          name: created.class.className,
          code: created.class.classCode,
          level: created.class.level || '',
        },
      },
    ],
  };
}

/**
 * Update schedule
 */
export async function updateSchedule(
  id: string,
  data: IUpdateScheduleData
): Promise<ISchedule> {
  const updated = await prisma.portalSchedule.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.classId && { classId: data.classId }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.endTime && { endTime: data.endTime }),
    },
    include: {
      class: {
        select: {
          id: true,
          className: true,
          classCode: true,
          level: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    description: updated.description || undefined,
    startTime: updated.startTime.toISOString(),
    endTime: updated.endTime.toISOString(),
    status: updated.status,
    class: {
      id: updated.class.id,
      name: updated.class.className,
      code: updated.class.classCode,
      level: updated.class.level || '',
    },
  };
}

/**
 * Delete schedule
 */
export async function deleteSchedule(id: string): Promise<void> {
  await prisma.portalSchedule.delete({
    where: { id },
  });
}
