import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { syncScheduleCreate } from '@/lib/portal/calendar-sync.service';
import { getCalendarConnection } from '@/lib/portal/calendar-token.service';
import type { RepeatRule } from '@/lib/utils/rrule';

/**
 * POST /api/portal/google-calendar/sync
 * Sync a schedule series to Google Calendar (V2 — schedule-series-based)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { seriesId } = body;

    if (!seriesId) {
      return NextResponse.json({ error: 'Schedule series ID is required' }, { status: 400 });
    }

    const scheduleSeries = await prisma.portalScheduleSeries.findUnique({
      where: { id: seriesId },
    });

    if (!scheduleSeries) {
      return NextResponse.json({ error: 'Schedule series not found' }, { status: 404 });
    }

    if (scheduleSeries.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (scheduleSeries.isGoogleSynced && scheduleSeries.googleEventId) {
      return NextResponse.json({
        success: true,
        message: 'Already synced',
        googleEventId: scheduleSeries.googleEventId,
      });
    }

    const connection = await getCalendarConnection(session.user.id);
    if (!connection || !connection.isValid) {
      return NextResponse.json({
        error: 'Google Calendar chưa được kết nối.',
      }, { status: 400 });
    }

    const syncResult = await syncScheduleCreate({
      id: seriesId,
      classId: scheduleSeries.classId,
      teacherId: scheduleSeries.teacherId,
      title: scheduleSeries.title,
      description: scheduleSeries.description,
      location: scheduleSeries.location,
      meetingLink: scheduleSeries.meetingLink,
      startDateLocal: scheduleSeries.startDateLocal,
      startTimeLocal: scheduleSeries.startTimeLocal,
      endTimeLocal: scheduleSeries.endTimeLocal,
      isRecurring: scheduleSeries.isRecurring,
      repeatRule: scheduleSeries.repeatRule as RepeatRule | null,
    });

    if (syncResult.googleEventId) {
      return NextResponse.json({
        success: true,
        message: 'Đã đồng bộ với Google Calendar',
        googleEventId: syncResult.googleEventId,
      });
    }

    return NextResponse.json({
      success: syncResult.success,
      error: syncResult.error,
    });
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return NextResponse.json({
      error: 'Failed to sync with Google Calendar',
    }, { status: 500 });
  }
}
