/**
 * Google Calendar API Client (V2)
 *
 * Reusable server module for Google Calendar operations.
 * All methods use the teacher's access token obtained via refresh_token.
 *
 * Key design:
 * - sendUpdates="all" on every mutation → attendees get invite/update/cancel emails
 * - Recurring events use a single RRULE → students accept once for all occurrences
 * - conferenceDataVersion=1 → auto-create Google Meet if no meeting link
 */

import type { EventDateTime } from '@/lib/utils/rrule';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// ── Types ──

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: EventDateTime;
  end: EventDateTime;
  attendees?: Array<{ email: string }>;
  recurrence?: string[]; // ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=..."]
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
  };
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: { type: 'hangoutsMeet' };
    };
  };
}

interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Token Refresh ──

/**
 * Get a fresh access_token using a refresh_token.
 */
export async function getAccessTokenFromRefreshToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number } | { error: string }> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { error: errBody.error_description || errBody.error || 'Token refresh failed' };
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}

// ── CRUD Operations ──

/**
 * Insert a new calendar event (single or recurring).
 * Returns the created event ID.
 */
export async function insertCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent,
  calendarId = 'primary'
): Promise<ApiResult<{ eventId: string; htmlLink?: string }>> {
  try {
    const url = `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const errMsg = errBody.error?.message || `HTTP ${res.status}`;
      console.error('[GoogleCalendar] Insert failed:', errMsg);
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    return {
      success: true,
      data: { eventId: data.id, htmlLink: data.htmlLink },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Update (PATCH) an existing calendar event.
 */
export async function patchCalendarEvent(
  accessToken: string,
  eventId: string,
  patch: Partial<GoogleCalendarEvent>,
  calendarId = 'primary'
): Promise<ApiResult> {
  try {
    const url = `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const errMsg = errBody.error?.message || `HTTP ${res.status}`;
      console.error('[GoogleCalendar] Patch failed:', errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Delete a calendar event (sends cancellation to all attendees).
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId = 'primary'
): Promise<ApiResult> {
  try {
    const url = `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    // 204 No Content = success
    if (!res.ok && res.status !== 204) {
      const errBody = await res.json().catch(() => ({}));
      const errMsg = errBody.error?.message || `HTTP ${res.status}`;
      console.error('[GoogleCalendar] Delete failed:', errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

// ── Event Builder ──

/**
 * Build a GoogleCalendarEvent from schedule data.
 */
export function buildCalendarEvent(params: {
  summary: string;
  description?: string;
  location?: string;
  meetingLink?: string;
  start: EventDateTime;
  end: EventDateTime;
  attendeeEmails: string[];
  rrule?: string; // "RRULE:FREQ=WEEKLY;..."
}): GoogleCalendarEvent {
  const event: GoogleCalendarEvent = {
    summary: params.summary,
    description: params.description,
    location: params.location,
    start: params.start,
    end: params.end,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  if (params.attendeeEmails.length > 0) {
    event.attendees = params.attendeeEmails.map(email => ({ email }));
  }

  if (params.rrule) {
    event.recurrence = [params.rrule];
  }

  // Auto-create Google Meet if no custom meeting link
  if (!params.meetingLink) {
    event.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  return event;
}

// ── OAuth helpers (kept for calendar connect flow) ──

export function getGoogleCalendarAuthUrl(clientId: string, redirectUri: string): string {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'].join(' ');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ accessToken?: string; refreshToken?: string; expiresIn?: number; error?: string }> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error_description || 'Failed to exchange code' };
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}
