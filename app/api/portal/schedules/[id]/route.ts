import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { USER_ROLE, ENROLLMENT_STATUS } from '@/constants/portal/roles';

/**
 * GET - Get single session by ID.
 * Returns data mapped to ScheduleEvent shape for EventDetailDrawer.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedule = await prisma.portalSchedule.findUnique({
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
            teacher: { select: { id: true, name: true, email: true } },
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

    if (!schedule) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Map to ScheduleEvent shape for backward compat with EventDetailDrawer
    return NextResponse.json({
      id: schedule.id,
      classId: schedule.classId,
      seriesId: schedule.seriesId,
      teacherId: schedule.series?.teacherId,
      title: schedule.title,
      description: schedule.description,
      startTime: schedule.startAt,
      endTime: schedule.endAt,
      location: schedule.location,
      meetingLink: schedule.meetingLink,
      status: schedule.status,
      googleEventId: schedule.series?.googleEventId ?? null,
      syncedToGoogle: schedule.series?.isGoogleSynced ?? false,
      isRecurring: schedule.series?.isRecurring ?? false,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      class: schedule.class,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

/**
 * PATCH - Update a series (via session ID lookup).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN)) {
      return NextResponse.json({ error: 'Chỉ giáo viên mới có thể sửa lịch' }, { status: 403 });
    }

    // Find the session → its series
    const schedule = await prisma.portalSchedule.findUnique({
      where: { id },
      select: { seriesId: true, series: { select: { teacherId: true } } },
    });

    if (!schedule?.seriesId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (user.role === USER_ROLE.TEACHER && schedule.series?.teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, location, meetingLink, startTimeLocal, endTimeLocal } = body;

    // Update the series
    const updatedSeries = await prisma.portalScheduleSeries.update({
      where: { id: schedule.seriesId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(startTimeLocal && { startTimeLocal }),
        ...(endTimeLocal && { endTimeLocal }),
      },
      include: { class: true },
    });

    return NextResponse.json(updatedSeries);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Cập nhật lịch thất bại' }, { status: 500 });
  }
}

/**
 * DELETE - Delete a single session.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN)) {
      return NextResponse.json({ error: 'Chỉ giáo viên mới có thể xóa lịch' }, { status: 403 });
    }

    const schedule = await prisma.portalSchedule.findUnique({
      where: { id },
      select: { series: { select: { teacherId: true } } },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (user.role === USER_ROLE.TEACHER && schedule.series?.teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.portalSchedule.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Đã xóa buổi học thành công' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Xóa lịch thất bại' }, { status: 500 });
  }
}
