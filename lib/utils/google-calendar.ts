/**
 * Google Calendar Integration
 * Sync schedules to Google Calendar using Google Calendar API
 */

export interface GoogleCalendarEvent {
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  conferenceData?: {
    createRequest: {
      requestId: string
      conferenceSolutionKey: {
        type: 'hangoutsMeet'
      }
    }
  }
}

/**
 * Create Google Calendar event
 * Requires Google OAuth2 token
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'Failed to create calendar event',
      }
    }

    const data = await response.json()
    return {
      success: true,
      eventId: data.id,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    }
  }
}

/**
 * Update Google Calendar event
 */
export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  event: GoogleCalendarEvent
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'Failed to update calendar event',
      }
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    }
  }
}

/**
 * Delete Google Calendar event
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok && response.status !== 204) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'Failed to delete calendar event',
      }
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    }
  }
}

/**
 * Convert schedule to Google Calendar event format
 */
export function scheduleToGoogleEvent(schedule: {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  attendees?: string[]
}): GoogleCalendarEvent {
  const event: GoogleCalendarEvent = {
    summary: schedule.title,
    description: schedule.description,
    location: schedule.location,
    start: {
      dateTime: schedule.startTime.toISOString(),
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    end: {
      dateTime: schedule.endTime.toISOString(),
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
    },
  }

  // Add attendees if provided
  if (schedule.attendees && schedule.attendees.length > 0) {
    event.attendees = schedule.attendees.map(email => ({ email }))
  }

  // Add Google Meet conference if meeting link not provided
  if (!schedule.meetingLink) {
    event.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    }
  }

  return event
}

/**
 * Get Google OAuth2 URL for calendar access
 */
export function getGoogleCalendarAuthUrl(clientId: string, redirectUri: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ accessToken?: string; refreshToken?: string; error?: string }> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        error: error.error_description || 'Failed to exchange code for token',
      }
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  } catch (error: any) {
    return {
      error: error.message || 'Network error',
    }
  }
}
