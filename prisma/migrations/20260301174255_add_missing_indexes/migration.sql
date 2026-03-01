/*
  Warnings:

  - You are about to drop the column `icon` on the `Feature` table. All the data in the column will be lost.
  - You are about to drop the column `iconBg` on the `Feature` table. All the data in the column will be lost.
  - You are about to drop the column `iconColor` on the `Feature` table. All the data in the column will be lost.
  - You are about to drop the column `maxStudents` on the `portal_classes` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `portal_users` table. All the data in the column will be lost.
  - You are about to drop the `portal_bookmarks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portal_learning_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portal_quiz_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portal_quizzes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portal_schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portal_vocabularies` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `portal_assignments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `portal_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `iconName` to the `Feature` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `portal_users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "portal_bookmarks" DROP CONSTRAINT "portal_bookmarks_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_learning_progress" DROP CONSTRAINT "portal_learning_progress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_quiz_attempts" DROP CONSTRAINT "portal_quiz_attempts_quizId_fkey";

-- DropForeignKey
ALTER TABLE "portal_quiz_attempts" DROP CONSTRAINT "portal_quiz_attempts_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_schedules" DROP CONSTRAINT "portal_schedules_classId_fkey";

-- DropForeignKey
ALTER TABLE "portal_schedules" DROP CONSTRAINT "portal_schedules_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "portal_vocabularies" DROP CONSTRAINT "portal_vocabularies_studentId_fkey";

-- DropIndex
DROP INDEX "portal_users_name_key";

-- AlterTable
ALTER TABLE "Feature" DROP COLUMN "icon",
DROP COLUMN "iconBg",
DROP COLUMN "iconColor",
ADD COLUMN     "iconName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "portal_assignment_submissions" ALTER COLUMN "status" SET DEFAULT 'NOT_SUBMITTED';

-- AlterTable
ALTER TABLE "portal_assignments" ADD COLUMN     "externalLink" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "portal_classes" DROP COLUMN "maxStudents";

-- AlterTable
ALTER TABLE "portal_users" DROP COLUMN "fullName",
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "portal_vocabulary" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exampleMeaning" TEXT,
ADD COLUMN     "examplePinyin" TEXT,
ADD COLUMN     "exampleSentence" TEXT,
ADD COLUMN     "meaningVi" TEXT,
ADD COLUMN     "wordType" TEXT;

-- DropTable
DROP TABLE "portal_bookmarks";

-- DropTable
DROP TABLE "portal_learning_progress";

-- DropTable
DROP TABLE "portal_quiz_attempts";

-- DropTable
DROP TABLE "portal_quizzes";

-- DropTable
DROP TABLE "portal_schedules";

-- DropTable
DROP TABLE "portal_vocabularies";

-- CreateTable
CREATE TABLE "portal_lesson_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "learnedCount" INTEGER NOT NULL DEFAULT 0,
    "masteredCount" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSec" INTEGER NOT NULL DEFAULT 0,
    "masteryPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_item_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "seenCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "masteryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "lastSeenAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_item_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_practice_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_practice_attempts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "userAnswer" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_practice_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_series" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "meetingLink" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "startTimeLocal" TEXT NOT NULL,
    "endTimeLocal" TEXT NOT NULL,
    "startDateLocal" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "repeatRule" JSONB,
    "isGoogleSynced" BOOLEAN NOT NULL DEFAULT false,
    "googleCalendarId" TEXT DEFAULT 'primary',
    "googleEventId" TEXT,
    "lastSyncError" TEXT,
    "syncedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "seriesId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideType" TEXT,
    "overrideReason" TEXT,
    "location" TEXT,
    "meetingLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_lesson_progress_studentId_lessonId_key" ON "portal_lesson_progress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "portal_item_progress_studentId_status_idx" ON "portal_item_progress"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "portal_item_progress_studentId_vocabularyId_key" ON "portal_item_progress"("studentId", "vocabularyId");

-- CreateIndex
CREATE INDEX "portal_practice_sessions_studentId_lessonId_idx" ON "portal_practice_sessions"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "portal_practice_attempts_sessionId_idx" ON "portal_practice_attempts"("sessionId");

-- CreateIndex
CREATE INDEX "class_sessions_classId_startAt_idx" ON "class_sessions"("classId", "startAt");

-- CreateIndex
CREATE INDEX "class_sessions_seriesId_idx" ON "class_sessions"("seriesId");

-- CreateIndex
CREATE INDEX "portal_notifications_userId_isRead_idx" ON "portal_notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "portal_notifications_userId_createdAt_idx" ON "portal_notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Course_isPublished_categoryId_idx" ON "Course"("isPublished", "categoryId");

-- CreateIndex
CREATE INDEX "Course_isPublished_hskLevelId_idx" ON "Course"("isPublished", "hskLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- CreateIndex
CREATE INDEX "Lesson_courseId_order_idx" ON "Lesson"("courseId", "order");

-- CreateIndex
CREATE INDEX "Lesson_slug_idx" ON "Lesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "portal_assignments_slug_key" ON "portal_assignments"("slug");

-- CreateIndex
CREATE INDEX "portal_assignments_classId_status_idx" ON "portal_assignments"("classId", "status");

-- CreateIndex
CREATE INDEX "portal_attendances_classId_date_idx" ON "portal_attendances"("classId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "portal_users_username_key" ON "portal_users"("username");

-- CreateIndex
CREATE INDEX "portal_vocabulary_lessonId_idx" ON "portal_vocabulary"("lessonId");

-- AddForeignKey
ALTER TABLE "portal_lesson_progress" ADD CONSTRAINT "portal_lesson_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_lesson_progress" ADD CONSTRAINT "portal_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_item_progress" ADD CONSTRAINT "portal_item_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_item_progress" ADD CONSTRAINT "portal_item_progress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "portal_vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_practice_sessions" ADD CONSTRAINT "portal_practice_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_practice_sessions" ADD CONSTRAINT "portal_practice_sessions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_practice_attempts" ADD CONSTRAINT "portal_practice_attempts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "portal_practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_practice_attempts" ADD CONSTRAINT "portal_practice_attempts_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "portal_vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_series" ADD CONSTRAINT "schedule_series_classId_fkey" FOREIGN KEY ("classId") REFERENCES "portal_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_series" ADD CONSTRAINT "schedule_series_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "portal_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_classId_fkey" FOREIGN KEY ("classId") REFERENCES "portal_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "schedule_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_notifications" ADD CONSTRAINT "portal_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
