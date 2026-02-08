'use server';

/**
 * Attendance Server Actions
 * Server-side actions for attendance management
 */

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { USER_ROLE } from '@/app/constants/portal/roles';
import { revalidatePath } from 'next/cache';

export interface AttendanceMatrixData {
  class: {
    id: string;
    className: string;
    classCode: string;
    level: string | null;
  };
  students: Array<{
    id: string;
    name: string;
    fullName: string | null;
    image: string | null;
    email: string;
  }>;
  schedules: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    status: string;
  }>;
  attendanceMap: Record<string, Record<string, { id: string; status: string; notes: string | null }>>;
  month: string;
}

/**
 * Fetch classes for the current teacher
 */
export async function fetchTeacherClasses(): Promise<{
  success: boolean;
  classes?: Array<{
    id: string;
    className: string;
    classCode: string;
    level: string | null;
    _count: { enrollments: number };
  }>;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const classes = await prisma.portalClass.findMany({
      where: {
        teacherId: session.user.id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        className: true,
        classCode: true,
        level: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { className: 'asc' },
    });

    return { success: true, classes };
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return { success: false, error: 'Không thể tải danh sách lớp' };
  }
}

/**
 * Fetch attendance matrix data for a class and month
 */
export async function fetchAttendanceMatrix(
  classId: string,
  month: string // YYYY-MM
): Promise<{
  success: boolean;
  data?: AttendanceMatrixData;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify teacher owns this class
    const user = await prisma.portalUser.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.role === USER_ROLE.TEACHER) {
      const cls = await prisma.portalClass.findFirst({
        where: { id: classId, teacherId: user.id },
      });
      if (!cls) {
        return { success: false, error: 'Lớp học không hợp lệ' };
      }
    }

    // Get class with enrolled students
    const classData = await prisma.portalClass.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          where: { status: 'ENROLLED' },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                fullName: true,
                image: true,
                email: true,
              },
            },
          },
          orderBy: {
            student: { fullName: 'asc' },
          },
        },
      },
    });

    if (!classData) {
      return { success: false, error: 'Lớp học không tồn tại' };
    }

    // Parse month
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

    // Get schedules for this class in the month
    const schedules = await prisma.portalSchedule.findMany({
      where: {
        classId,
        startTime: { gte: startDate, lte: endDate },
      },
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        title: true,
        status: true,
      },
    });

    // Get attendance records
    const attendances = await prisma.portalAttendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        notes: true,
      },
    });

    // Build attendance map
    const attendanceMap: Record<string, Record<string, { id: string; status: string; notes: string | null }>> = {};
    attendances.forEach((a) => {
      const dateKey = a.date.toISOString().split('T')[0];
      if (!attendanceMap[a.studentId]) {
        attendanceMap[a.studentId] = {};
      }
      attendanceMap[a.studentId][dateKey] = {
        id: a.id,
        status: a.status,
        notes: a.notes,
      };
    });

    return {
      success: true,
      data: {
        class: {
          id: classData.id,
          className: classData.className,
          classCode: classData.classCode,
          level: classData.level,
        },
        students: classData.enrollments.map((e) => ({
          id: e.student.id,
          name: e.student.name,
          fullName: e.student.fullName,
          image: e.student.image,
          email: e.student.email,
        })),
        schedules: schedules.map((s) => ({
          id: s.id,
          date: s.startTime.toISOString().split('T')[0],
          startTime: s.startTime.toISOString(),
          endTime: s.endTime.toISOString(),
          title: s.title,
          status: s.status,
        })),
        attendanceMap,
        month,
      },
    };
  } catch (error) {
    console.error('Error fetching attendance matrix:', error);
    return { success: false, error: 'Không thể tải dữ liệu điểm danh' };
  }
}

/**
 * Save attendance records (batch upsert)
 */
export async function saveAttendance(
  classId: string,
  records: Array<{ studentId: string; date: string; status: string; notes?: string }>
): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.portalUser.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN)) {
      return { success: false, error: 'Chỉ giáo viên mới có thể điểm danh' };
    }

    // Verify teacher owns this class
    if (user.role === USER_ROLE.TEACHER) {
      const cls = await prisma.portalClass.findFirst({
        where: { id: classId, teacherId: user.id },
      });
      if (!cls) {
        return { success: false, error: 'Lớp học không hợp lệ' };
      }
    }

    // Upsert attendance records in transaction
    const results = await prisma.$transaction(
      records.map((record) => {
        const attendanceDate = new Date(record.date + 'T00:00:00.000Z');
        return prisma.portalAttendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: record.studentId,
              classId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status.toUpperCase(),
            notes: record.notes || null,
            teacherId: user.id,
          },
          create: {
            studentId: record.studentId,
            classId,
            teacherId: user.id,
            date: attendanceDate,
            status: record.status.toUpperCase(),
            notes: record.notes || null,
          },
        });
      })
    );

    revalidatePath('/portal/teacher/attendance');

    return { success: true, count: results.length };
  } catch (error) {
    console.error('Error saving attendance:', error);
    return { success: false, error: 'Lưu điểm danh thất bại' };
  }
}
