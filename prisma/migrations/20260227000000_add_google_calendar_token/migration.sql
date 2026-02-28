-- V1 Google Calendar Hybrid Sync: GoogleCalendarToken table
-- Stores AES-256-GCM encrypted refresh/access tokens per user
-- Never expose these values to the client

-- CreateTable
CREATE TABLE "google_calendar_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedRefresh" TEXT NOT NULL,
    "encryptedAccess" TEXT,
    "accessExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_calendar_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: one token record per user
CREATE UNIQUE INDEX "google_calendar_tokens_userId_key" ON "google_calendar_tokens"("userId");

-- AddForeignKey
ALTER TABLE "google_calendar_tokens" ADD CONSTRAINT "google_calendar_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
