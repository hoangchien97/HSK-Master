/**
 * GET /api/portal/calendar/callback
 *
 * Handles the OAuth callback from Google after calendar scope consent.
 * Exchanges the auth code for tokens, encrypts & stores refresh_token,
 * then redirects back to the portal settings page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveCalendarToken } from '@/lib/portal/calendar-token.service';
import { roleToRoute } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

  // Handle user denial
  if (error) {
    console.warn(`[CalendarCallback] User denied consent: ${error}`);
    return NextResponse.redirect(
      `${baseUrl}/portal/teacher/schedule?calendar_error=denied`
    );
  }

  if (!code || !state) {
    console.error('[CalendarCallback] Missing code or state');
    return NextResponse.redirect(
      `${baseUrl}/portal/teacher/schedule?calendar_error=missing_params`
    );
  }

  // Verify session matches state (userId)
  const session = await auth();
  if (!session?.user?.id || session.user.id !== state) {
    console.error('[CalendarCallback] Session mismatch');
    return NextResponse.redirect(
      `${baseUrl}/portal/login?callbackUrl=/portal/teacher/schedule`
    );
  }

  try {
    const redirectUri = `${baseUrl}/api/portal/calendar/callback`;

    // Exchange authorization code for tokens
    console.log(`[CalendarCallback] Exchanging code for tokens, user=${state}`);
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.json().catch(() => ({}));
      console.error('[CalendarCallback] Token exchange failed:', errBody);
      return NextResponse.redirect(
        `${baseUrl}/portal/teacher/schedule?calendar_error=token_exchange`
      );
    }

    const tokenData = await tokenRes.json();
    console.log('[CalendarCallback] Token exchange successful');

    if (!tokenData.refresh_token) {
      console.error('[CalendarCallback] No refresh_token received! User may need to revoke and reconnect.');
      // Still save what we have — access_token can be used for immediate sync
      if (!tokenData.access_token) {
        return NextResponse.redirect(
          `${baseUrl}/portal/teacher/schedule?calendar_error=no_refresh_token`
        );
      }
    }

    // Save encrypted tokens to DB
    const expiresIn = (tokenData.expires_in as number) || 3600;
    await saveCalendarToken(state, {
      refreshToken: tokenData.refresh_token || '',
      accessToken: tokenData.access_token,
      accessExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scope: tokenData.scope || 'https://www.googleapis.com/auth/calendar.events',
    });

    // Determine redirect based on role
    const role = roleToRoute(session.user.role || '');
    const redirectTo = `${baseUrl}/portal/${role}/schedule?calendar_connected=true`;
    console.log(`[CalendarCallback] Success! Redirecting to ${redirectTo}`);

    return NextResponse.redirect(redirectTo);
  } catch (err) {
    console.error('[CalendarCallback] Error:', err);
    return NextResponse.redirect(
      `${baseUrl}/portal/teacher/schedule?calendar_error=server_error`
    );
  }
}
