import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { USER_ROLE, SCHEDULE_STATUS } from '@/lib/constants/roles';

// GET - Get single schedule
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
        class: true,
        teacher: true,
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

// PATCH - Update schedule
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

    // Get existing schedule
    const existingSchedule = await prisma.portalSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Check if teacher owns this schedule
    if (user.role === USER_ROLE.TEACHER && existingSchedule.teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, startTime, endTime, location, meetingLink, status } = body;

    // Update schedule
    const updatedSchedule = await prisma.portalSchedule.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(status && { status }),
      },
      include: {
        class: true,
        teacher: true,
      },
    });

    // TODO: Re-enable Google sync after migration
    // If synced to Google, update the event
    // if (existingSchedule.googleEventId && existingSchedule.syncedToGoogle) {
    //   try {
    //     const syncResponse = await fetch(
    //       `${request.nextUrl.origin}/api/portal/google-calendar/sync`,
    //       {
    //         method: 'PATCH',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ scheduleId: id }),
    //       }
    //     );

    //     if (syncResponse.ok) {
    //       return NextResponse.json({
    //         ...updatedSchedule,
    //         message: 'Đã cập nhật buổi học và đồng bộ với Google Calendar',
    //       });
    //     }
    //   } catch (error) {
    //     console.error('Failed to sync with Google Calendar:', error);
    //     return NextResponse.json({
    //       ...updatedSchedule,
    //       warning: 'Đã cập nhật buổi học nhưng không thể đồng bộ với Google Calendar',
    //     });
    //   }
    // }

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Cập nhật lịch thất bại' }, { status: 500 });
  }
}

// DELETE - Delete schedule
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

    // Get existing schedule
    const existingSchedule = await prisma.portalSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Check if teacher owns this schedule
    if (user.role === USER_ROLE.TEACHER && existingSchedule.teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // TODO: Re-enable Google sync after migration
    // If synced to Google, delete from Google Calendar first
    // if (existingSchedule.googleEventId && existingSchedule.syncedToGoogle) {
    //   try {
    //     await fetch(
    //       `${request.nextUrl.origin}/api/portal/google-calendar/sync?scheduleId=${id}`,
    //       {
    //         method: 'DELETE',
    //       }
    //     );
    //   } catch (error) {
    //     console.error('Failed to delete from Google Calendar:', error);
    //     // Continue with deletion even if Google sync fails
    //   }
    // }

    // Delete schedule
    await prisma.portalSchedule.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa buổi học thành công',
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Xóa lịch thất bại' }, { status: 500 });
  }
}
