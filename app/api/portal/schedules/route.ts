import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { USER_ROLE, SCHEDULE_STATUS, ENROLLMENT_STATUS } from '@/constants/portal/roles';
import { generateSessionDates, localToDate, jsDaysToByDay } from '@/lib/utils/rrule';

/**
 * GET - Fetch schedules for current user (teacher/student/admin).
 * Returns Schedule[] mapped to ScheduleEvent shape for backward compat.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessionInclude = {
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
          teacher: { select: { id: true, name: true, email: true } },
          enrollments: {
            where: { status: ENROLLMENT_STATUS.ENROLLED },
            include: {
              student: { select: { id: true, name: true, image: true } },
            },
          },
        },
      },
    };

    let schedules;

    if (user.role === USER_ROLE.STUDENT) {
      const enrollments = await prisma.portalClassEnrollment.findMany({
        where: { studentId: user.id, status: ENROLLMENT_STATUS.ENROLLED },
        select: { classId: true },
      });
      const classIds = enrollments.map(e => e.classId);

      schedules = await prisma.portalSchedule.findMany({
        where: { classId: { in: classIds } },
        include: sessionInclude,
        orderBy: { startAt: 'asc' },
      });
    } else if (user.role === USER_ROLE.TEACHER) {
      schedules = await prisma.portalSchedule.findMany({
        where: { series: { teacherId: user.id, isDeleted: false } },
        include: sessionInclude,
        orderBy: { startAt: 'asc' },
      });
    } else {
      schedules = await prisma.portalSchedule.findMany({
        where: { series: { isDeleted: false } },
        include: sessionInclude,
        orderBy: { startAt: 'asc' },
      });
    }

    // Map to backward-compat ScheduleEvent shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = schedules.map((s: any) => ({
      id: s.id,
      classId: s.classId,
      seriesId: s.seriesId,
      teacherId: s.series?.teacherId,
      title: s.title,
      description: s.description,
      startTime: s.startAt,
      endTime: s.endAt,
      location: s.location,
      meetingLink: s.meetingLink,
      status: s.status,
      googleEventId: s.series?.googleEventId ?? null,
      syncedToGoogle: s.series?.isGoogleSynced ?? false,
      isRecurring: s.series?.isRecurring ?? false,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      class: s.class,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Không thể tải lịch dạy' }, { status: 500 });
  }
}

/**
 * POST - Create a schedule series + schedules.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN)) {
      return NextResponse.json({ error: 'Chỉ giáo viên mới có thể tạo lịch' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, description, classId,
      startDate, startTime, endTime,
      location, meetingLink,
      isRecurring, weekdays, endDate,
    } = body;

    // Verify class ownership
    const classItem = await prisma.portalClass.findFirst({
      where: {
        id: classId,
        ...(user.role === USER_ROLE.TEACHER ? { teacherId: user.id } : {}),
      },
    });

    if (!classItem) {
      return NextResponse.json({ error: 'Lớp học không hợp lệ' }, { status: 400 });
    }

    // Build repeat rule
    const recurring = !!(isRecurring && weekdays?.length && endDate);
    const repeatRule = recurring
      ? {
          freq: 'WEEKLY' as const,
          byWeekDays: jsDaysToByDay(weekdays),
          untilDateLocal: endDate,
        }
      : undefined;

    // Create schedule series
    const scheduleSeries = await prisma.portalScheduleSeries.create({
      data: {
        classId,
        teacherId: user.id,
        title,
        description: description || null,
        location: location || null,
        meetingLink: meetingLink || null,
        startTimeLocal: startTime,
        endTimeLocal: endTime,
        startDateLocal: startDate,
        isRecurring: recurring,
        repeatRule: repeatRule ? JSON.parse(JSON.stringify(repeatRule)) : undefined,
      },
    });

    // Generate session dates
    const sessionDates = recurring && repeatRule
      ? generateSessionDates(startDate, repeatRule.byWeekDays, repeatRule.untilDateLocal)
      : [startDate];

    // Create sessions
    const sessions = await prisma.$transaction(
      sessionDates.map(dateLocal =>
        prisma.portalSchedule.create({
          data: {
            classId,
            seriesId: scheduleSeries.id,
            title,
            description: description || null,
            startAt: localToDate(dateLocal, startTime),
            endAt: localToDate(dateLocal, endTime),
            status: SCHEDULE_STATUS.SCHEDULED,
            location: location || null,
            meetingLink: meetingLink || null,
          },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        seriesId: scheduleSeries.id,
        count: sessions.length,
        sessions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Tạo lịch thất bại' }, { status: 500 });
  }
}
