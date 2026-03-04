'use server';

/**
 * Attendance Server Actions
 * Server-side actions for attendance management
 */

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { USER_ROLE, ENROLLMENT_STATUS } from '@/constants/portal/roles';
import { revalidatePath } from 'next/cache';
import { createBulkNotifications, createNotification } from '@/services/portal/notification.service';
import { NotificationType } from '@/enums/portal/common';

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
  month?: string;
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
 * Fetch classes the current student is enrolled in (for attendance)
 */
export async function fetchStudentAttendanceClasses(): Promise<{
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

    const enrollments = await prisma.portalClassEnrollment.findMany({
      where: { studentId: session.user.id, status: ENROLLMENT_STATUS.ENROLLED },
      include: {
        class: {
          select: {
            id: true,
            className: true,
            classCode: true,
            level: true,
            status: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    const classes = enrollments
      .filter((e) => e.class.status === 'ACTIVE')
      .map((e) => ({
        id: e.class.id,
        className: e.class.className,
        classCode: e.class.classCode,
        level: e.class.level,
        _count: e.class._count,
      }));

    return { success: true, classes };
  } catch (error) {
    console.error('Error fetching student attendance classes:', error);
    return { success: false, error: 'Không thể tải danh sách lớp' };
  }
}

/**
 * Fetch attendance matrix data for a class.
 * When `month` is provided (YYYY-MM), limits schedules & attendance to that month.
 * When omitted, returns **all** sessions from the class startDate → endDate (or now).
 */
export async function fetchAttendanceMatrix(
  classId: string,
  month?: string // YYYY-MM — optional
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
    } else if (user.role === USER_ROLE.STUDENT) {
      const enrollment = await prisma.portalClassEnrollment.findFirst({
        where: { classId, studentId: user.id, status: ENROLLMENT_STATUS.ENROLLED },
      });
      if (!enrollment) {
        return { success: false, error: 'Bạn không thuộc lớp học này' };
      }
    }

    // Get class with enrolled students
    const classData = await prisma.portalClass.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          where: { status: ENROLLMENT_STATUS.ENROLLED },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
          orderBy: {
            student: { name: 'asc' },
          },
        },
      },
    });

    if (!classData) {
      return { success: false, error: 'Lớp học không tồn tại' };
    }

    // Determine date range: month-based or full class range
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 0, 23, 59, 59, 999);
    } else {
      startDate = classData.startDate;

      if (classData.endDate) {
        endDate = new Date(classData.endDate.getTime());
      } else {
        // Fallback: find the last schedule date for this class
        const lastSchedule = await prisma.portalSchedule.findFirst({
          where: { classId },
          orderBy: { startAt: 'desc' },
          select: { startAt: true },
        });
        endDate = lastSchedule ? new Date(lastSchedule.startAt.getTime()) : new Date();
      }

      endDate.setHours(23, 59, 59, 999);
    }

    // Get schedules for this class in the date range
    const schedules = await prisma.portalSchedule.findMany({
      where: {
        classId,
        startAt: { gte: startDate, lte: endDate },
      },
      orderBy: { startAt: 'asc' },
      select: {
        id: true,
        startAt: true,
        endAt: true,
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
          image: e.student.image,
          email: e.student.email,
        })),
        schedules: schedules.map((s) => ({
          id: s.id,
          date: s.startAt.toISOString().split('T')[0],
          startTime: s.startAt.toISOString(),
          endTime: s.endAt.toISOString(),
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

    // Notify students about their attendance
    try {
      const classInfo = await prisma.portalClass.findUnique({
        where: { id: classId },
        select: { className: true },
      });
      const className = classInfo?.className || 'l\u1edbp h\u1ecdc';

      // Group by student, notify each with their status
      const studentMap = new Map<string, string[]>();
      for (const r of records) {
        const dates = studentMap.get(r.studentId) || [];
        dates.push(r.status);
        studentMap.set(r.studentId, dates);
      }

      // Notify ABSENT students specifically
      const absentStudentIds = records
        .filter((r) => r.status.toUpperCase() === 'ABSENT')
        .map((r) => r.studentId);
      const uniqueAbsentIds = [...new Set(absentStudentIds)];

      if (uniqueAbsentIds.length > 0) {
        await createBulkNotifications(uniqueAbsentIds, {
          type: NotificationType.ATTENDANCE_ABSENT,
          title: 'V\u1eafng m\u1eb7t',
          message: `B\u1ea1n \u0111\u01b0\u1ee3c ghi nh\u1eadn v\u1eafng m\u1eb7t t\u1ea1i l\u1edbp "${className}"`,
          link: '/portal/student/attendance',
        });
      }

      // Notify all recorded students (excluding absent, they got specific msg)
      const allStudentIds = [...new Set(records.map((r) => r.studentId))];
      const nonAbsentIds = allStudentIds.filter((id) => !uniqueAbsentIds.includes(id));
      if (nonAbsentIds.length > 0) {
        await createBulkNotifications(nonAbsentIds, {
          type: NotificationType.ATTENDANCE_RECORDED,
          title: '\u0110i\u1ec3m danh',
          message: `\u0110i\u1ec3m danh l\u1edbp "${className}" \u0111\u00e3 \u0111\u01b0\u1ee3c c\u1eadp nh\u1eadt`,
          link: '/portal/student/attendance',
        });
      }
    } catch (e) { console.error('Attendance notification error:', e); }

    return { success: true, count: results.length };
  } catch (error) {
    console.error('Error saving attendance:', error);
    return { success: false, error: 'Lưu điểm danh thất bại' };
  }
}


