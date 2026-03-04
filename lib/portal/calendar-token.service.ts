/**
 * Calendar Token Service
 * Server-side ONLY — manages encrypted Google Calendar tokens in DB.
 * Never import this file in client components.
 */

import { prisma } from '@/lib/prisma';
import { encryptToken, safeDecryptToken } from '@/lib/utils/token-encryption';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────
export interface CalendarTokenData {
  refreshToken: string;
  accessToken?: string;
  accessExpiresAt?: Date;
  scope?: string;
}

export interface CalendarConnection {
  userId: string;
  isValid: boolean;
  connectedAt: Date;
  scope: string | null;
  hasRefreshToken: boolean;
}

// ────────────────────────────────────────────────────────────────────
// Save / update token
// ────────────────────────────────────────────────────────────────────
export async function saveCalendarToken(
  userId: string,
  data: CalendarTokenData
): Promise<void> {
  console.log(`[CalendarToken] Saving token for user ${userId}`);

  const encryptedRefresh = encryptToken(data.refreshToken);
  const encryptedAccess = data.accessToken
    ? encryptToken(data.accessToken)
    : null;

  await prisma.googleCalendarToken.upsert({
    where: { userId },
    create: {
      userId,
      encryptedRefresh,
      encryptedAccess: encryptedAccess,
      accessExpiresAt: data.accessExpiresAt || null,
      scope: data.scope || 'https://www.googleapis.com/auth/calendar.events',
      isValid: true,
    },
    update: {
      encryptedRefresh,
      encryptedAccess: encryptedAccess,
      accessExpiresAt: data.accessExpiresAt || null,
      scope: data.scope || 'https://www.googleapis.com/auth/calendar.events',
      isValid: true,
    },
  });

  console.log(`[CalendarToken] Token saved successfully for user ${userId}`);
}

// ────────────────────────────────────────────────────────────────────
// Get a valid access token (auto-refresh if expired)
// ────────────────────────────────────────────────────────────────────
export async function getValidAccessToken(
  userId: string
): Promise<{ accessToken: string } | { error: string }> {
  const record = await prisma.googleCalendarToken.findUnique({
    where: { userId },
  });

  if (!record) {
    return { error: 'NOT_CONNECTED' };
  }

  if (!record.isValid) {
    return { error: 'TOKEN_INVALID' };
  }

  // Check if cached access token is still valid (with 5-min buffer)
  if (
    record.encryptedAccess &&
    record.accessExpiresAt &&
    record.accessExpiresAt.getTime() > Date.now() + 5 * 60 * 1000
  ) {
    const accessToken = safeDecryptToken(record.encryptedAccess);
    if (accessToken) {
      return { accessToken };
    }
  }

  // Need to refresh — decrypt the refresh token
  const refreshToken = safeDecryptToken(record.encryptedRefresh);
  if (!refreshToken) {
    // Corrupted token — mark invalid
    await prisma.googleCalendarToken.update({
      where: { userId },
      data: { isValid: false },
    });
    return { error: 'TOKEN_CORRUPTED' };
  }

  // Call Google to refresh
  console.log(`[CalendarToken] Refreshing access token for user ${userId}`);
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
      console.error('[CalendarToken] Refresh failed:', errBody);

      // If token was revoked by user or expired permanently
      if (
        errBody.error === 'invalid_grant' ||
        errBody.error === 'invalid_token'
      ) {
        await prisma.googleCalendarToken.update({
          where: { userId },
          data: { isValid: false },
        });
        return { error: 'TOKEN_REVOKED' };
      }

      return { error: 'REFRESH_FAILED' };
    }

    const tokenData = await res.json();
    const newAccessToken = tokenData.access_token as string;
    const expiresIn = (tokenData.expires_in as number) || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Cache the new access token (encrypted)
    await prisma.googleCalendarToken.update({
      where: { userId },
      data: {
        encryptedAccess: encryptToken(newAccessToken),
        accessExpiresAt: expiresAt,
        isValid: true,
      },
    });

    console.log(`[CalendarToken] Access token refreshed for user ${userId}`);
    return { accessToken: newAccessToken };
  } catch (err) {
    console.error('[CalendarToken] Network error refreshing token:', err);
    return { error: 'NETWORK_ERROR' };
  }
}

// ────────────────────────────────────────────────────────────────────
// Get connection status (safe for session/client display)
// ────────────────────────────────────────────────────────────────────
export async function getCalendarConnection(
  userId: string
): Promise<CalendarConnection | null> {
  const record = await prisma.googleCalendarToken.findUnique({
    where: { userId },
    select: {
      userId: true,
      isValid: true,
      connectedAt: true,
      scope: true,
      encryptedRefresh: true, // only to check existence, never sent to client
    },
  });

  if (!record) return null;

  return {
    userId: record.userId,
    isValid: record.isValid,
    connectedAt: record.connectedAt,
    scope: record.scope,
    hasRefreshToken: !!record.encryptedRefresh,
  };
}

// ────────────────────────────────────────────────────────────────────
// Disconnect — delete token from DB
// ────────────────────────────────────────────────────────────────────
export async function disconnectCalendar(userId: string): Promise<void> {
  console.log(`[CalendarToken] Disconnecting calendar for user ${userId}`);
  await prisma.googleCalendarToken.deleteMany({ where: { userId } });
}

// ────────────────────────────────────────────────────────────────────
// Mark token as invalid (e.g., after API 401)
// ────────────────────────────────────────────────────────────────────
export async function markTokenInvalid(userId: string): Promise<void> {
  await prisma.googleCalendarToken.updateMany({
    where: { userId },
    data: { isValid: false },
  });
}
