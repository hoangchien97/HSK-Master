import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createGoogleCalendarEvent, scheduleToGoogleEvent } from '@/lib/utils/google-calendar';

/**
 * POST /api/portal/google-calendar/sync
 * Sync a schedule to Google Calendar
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
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
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Verify user owns this schedule
    if (schedule.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already synced
    if (schedule.syncedToGoogle && schedule.googleEventId) {
      return NextResponse.json({
        success: true,
        message: 'Already synced',
        googleEventId: schedule.googleEventId,
        googleEventLink: `https://calendar.google.com/calendar/event?eid=${schedule.googleEventId}`,
      });
    }

    // Get user's Google access token from session or account
    // Note: NextAuth doesn't expose access tokens by default, so we need to fetch from Account table
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json({
        error: 'Google Calendar not connected. Please sign in with Google to enable sync.',
      }, { status: 400 });
    }

    // Prepare attendees (students in the class)
    const attendees = schedule.class.enrollments.map(e => e.student.email);

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
    const result = await createGoogleCalendarEvent(account.access_token, googleEvent);

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Failed to sync with Google Calendar',
      }, { status: 500 });
    }

    // Update schedule with Google event ID
    await prisma.portalSchedule.update({
      where: { id: scheduleId },
      data: {
        googleEventId: result.eventId,
        syncedToGoogle: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Synced to Google Calendar successfully',
      googleEventId: result.eventId,
      googleEventLink: `https://calendar.google.com/calendar/event?eid=${result.eventId}`,
    });
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return NextResponse.json({
      error: 'Failed to sync with Google Calendar',
    }, { status: 500 });
  }
}
