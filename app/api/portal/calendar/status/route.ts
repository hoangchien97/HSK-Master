/**
 * GET /api/portal/calendar/status
 * Returns the current user's Google Calendar connection status.
 * Safe for client-side — never exposes tokens.
 *
 * DELETE /api/portal/calendar/status
 * Disconnects Google Calendar (deletes tokens from DB).
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getCalendarConnection,
  disconnectCalendar,
} from '@/lib/portal/calendar-token.service';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await getCalendarConnection(session.user.id);

    if (!connection) {
      return NextResponse.json({
        connected: false,
        isValid: false,
        message: 'Google Calendar chưa được kết nối.',
      });
    }

    return NextResponse.json({
      connected: true,
      isValid: connection.isValid,
      connectedAt: connection.connectedAt,
      hasRefreshToken: connection.hasRefreshToken,
      message: connection.isValid
        ? 'Google Calendar đã kết nối.'
        : 'Kết nối không hợp lệ. Vui lòng kết nối lại.',
    });
  } catch (error) {
    console.error('[CalendarStatus] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await disconnectCalendar(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Đã ngắt kết nối Google Calendar.',
    });
  } catch (error) {
    console.error('[CalendarDisconnect] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
