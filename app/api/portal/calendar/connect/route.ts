/**
 * GET /api/portal/calendar/connect
 *
 * Initiates incremental Google Calendar authorization.
 * Redirects user to Google consent screen requesting calendar.events scope.
 * Uses prompt=consent + access_type=offline to guarantee refresh_token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/portal/calendar/callback`;

    // Build Google OAuth URL with calendar scope (incremental authorization)
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent', // Force consent to get refresh_token reliably
      state: session.user.id, // Pass userId to callback
      // Include login_hint so user doesn't have to pick account again
      ...(session.user.email ? { login_hint: session.user.email } : {}),
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log(`[CalendarConnect] Redirecting user ${session.user.id} to Google consent`);
    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error('[CalendarConnect] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
