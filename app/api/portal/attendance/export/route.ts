import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { USER_ROLE, ENROLLMENT_STATUS } from '@/constants/portal/roles';
import { exportAttendanceGrid } from '@/lib/excel/exportAttendanceGrid';
import { sanitizeFilename, formatExportDate } from '@/lib/excel/attendance-utils';

/**
 * POST /api/portal/attendance/export
 * Export attendance grid to .xlsx matching the UI layout.
 * Body: { classId: string, sessionIds: string[], timezone?: string }
 * Auth: teacher or admin only.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.portalUser.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN)) {
      return NextResponse.json({ error: 'Chỉ giáo viên mới có thể export điểm danh' }, { status: 403 });
    }

    const body = await request.json();
    const { classId, sessionIds, timezone = 'Asia/Ho_Chi_Minh' } = body as {
      classId?: string;
      sessionIds?: string[];
      timezone?: string;
    };

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json({ error: 'sessionIds is required and must not be empty' }, { status: 400 });
    }

    // Verify class ownership
    const classData = await prisma.portalClass.findFirst({
      where: {
        id: classId,
        ...(user.role === USER_ROLE.TEACHER ? { teacherId: user.id } : {}),
      },
      select: {
        id: true,
        className: true,
        classCode: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Lớp học không hợp lệ' }, { status: 404 });
    }

    // Fetch schedules by sessionIds, ordered by startAt
    const schedules = await prisma.portalSchedule.findMany({
      where: {
        id: { in: sessionIds },
        classId,
      },
      orderBy: { startAt: 'asc' },
      select: {
        id: true,
        startAt: true,
      },
    });

    if (schedules.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy buổi học nào' }, { status: 404 });
    }

    // Fetch enrolled students ordered by name
    const enrollments = await prisma.portalClassEnrollment.findMany({
      where: { classId, status: ENROLLMENT_STATUS.ENROLLED },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    const students = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      studentCode: e.student.name.toUpperCase().slice(0, 8), // Match UI MSHV logic
    }));

    const studentIds = students.map((s) => s.id);

    // Compute date range from schedules for attendance query
    const scheduleDates = schedules.map((s) => s.startAt.toISOString().split('T')[0]);
    const minDate = new Date(Math.min(...schedules.map((s) => s.startAt.getTime())));
    const maxDate = new Date(Math.max(...schedules.map((s) => s.startAt.getTime())));
    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(23, 59, 59, 999);

    // Fetch all attendance records in one query (no N+1)
    const attendanceRecords = await prisma.portalAttendance.findMany({
      where: {
        classId,
        studentId: { in: studentIds },
        date: { gte: minDate, lte: maxDate },
      },
      select: {
        studentId: true,
        date: true,
        status: true,
      },
    });

    // Filter to only dates that match our schedule dates
    const dateSet = new Set(scheduleDates);
    const filteredRecords = attendanceRecords
      .map((a) => ({
        studentId: a.studentId,
        date: a.date.toISOString().split('T')[0],
        status: a.status,
      }))
      .filter((a) => dateSet.has(a.date));

    // Build Excel
    const buffer = await exportAttendanceGrid({
      className: classData.className,
      students,
      schedules: schedules.map((s) => ({
        id: s.id,
        date: s.startAt.toISOString().split('T')[0],
      })),
      attendanceRecords: filteredRecords,
      timezone,
    });

    // Build filename
    const safeName = sanitizeFilename(classData.classCode || classData.className);
    const dateStr = formatExportDate(timezone);
    const filename = `${safeName}_${dateStr}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error exporting attendance:', error);
    return NextResponse.json({ error: 'Export thất bại' }, { status: 500 });
  }
}
