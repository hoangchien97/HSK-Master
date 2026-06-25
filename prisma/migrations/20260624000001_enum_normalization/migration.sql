-- Phase 2: Enum normalization
-- Converts 17 String fields to strongly-typed PostgreSQL enums.
-- Pattern for columns with defaults: DROP DEFAULT → ALTER TYPE → SET DEFAULT.
-- Pattern for columns without defaults: ALTER TYPE only.
-- Nullable columns (overrideType): NULLs pass through the USING cast unchanged.

-- ─── Create 13 new enum types ───

CREATE TYPE "ClassStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'COMPLETED', 'DROPPED');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE "AssignmentType" AS ENUM ('HOMEWORK', 'QUIZ', 'PROJECT', 'READING', 'WRITING', 'SPEAKING', 'LISTENING');
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'REVIEWED', 'COMPLETED', 'REVISION_REQUIRED');
CREATE TYPE "NotificationType" AS ENUM ('ASSIGNMENT_CREATED', 'SUBMISSION_GRADED', 'SUBMISSION_RECEIVED');
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "OverrideType" AS ENUM ('moved', 'cancelled', 'extra');
CREATE TYPE "ItemProgressStatus" AS ENUM ('NEW', 'LEARNING', 'MASTERED');
CREATE TYPE "PracticeMode" AS ENUM ('LOOKUP', 'FLASHCARD', 'QUIZ', 'LISTEN', 'WRITE');
CREATE TYPE "QuestionType" AS ENUM ('MCQ_MEANING', 'MCQ_HANZI', 'MCQ_PINYIN', 'TYPE_PINYIN', 'TYPE_HANZI', 'LISTEN_MCQ', 'FLASHCARD');

-- ─── portal_classes.status ───
ALTER TABLE "portal_classes" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "portal_classes" ALTER COLUMN "status" TYPE "ClassStatus" USING "status"::"ClassStatus";
ALTER TABLE "portal_classes" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"ClassStatus";

-- ─── portal_class_enrollments.status ───
ALTER TABLE "portal_class_enrollments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "portal_class_enrollments" ALTER COLUMN "status" TYPE "EnrollmentStatus" USING "status"::"EnrollmentStatus";
ALTER TABLE "portal_class_enrollments" ALTER COLUMN "status" SET DEFAULT 'ENROLLED'::"EnrollmentStatus";

-- ─── class_sessions.status ───
ALTER TABLE "class_sessions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "class_sessions" ALTER COLUMN "status" TYPE "SessionStatus" USING "status"::"SessionStatus";
ALTER TABLE "class_sessions" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'::"SessionStatus";

-- ─── class_sessions.overrideType (nullable — no default to drop) ───
ALTER TABLE "class_sessions" ALTER COLUMN "overrideType" TYPE "OverrideType" USING "overrideType"::"OverrideType";

-- ─── portal_attendances.status (no default) ───
ALTER TABLE "portal_attendances" ALTER COLUMN "status" TYPE "AttendanceStatus" USING "status"::"AttendanceStatus";

-- ─── portal_assignments.assignmentType (no default) ───
ALTER TABLE "portal_assignments" ALTER COLUMN "assignmentType" TYPE "AssignmentType" USING "assignmentType"::"AssignmentType";

-- ─── portal_assignments.status ───
ALTER TABLE "portal_assignments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "portal_assignments" ALTER COLUMN "status" TYPE "AssignmentStatus" USING "status"::"AssignmentStatus";
ALTER TABLE "portal_assignments" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"AssignmentStatus";

-- ─── portal_assignment_submissions.status ───
ALTER TABLE "portal_assignment_submissions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "portal_assignment_submissions" ALTER COLUMN "status" TYPE "SubmissionStatus" USING "status"::"SubmissionStatus";
ALTER TABLE "portal_assignment_submissions" ALTER COLUMN "status" SET DEFAULT 'NOT_SUBMITTED'::"SubmissionStatus";

-- ─── portal_notifications.type (no default) ───
ALTER TABLE "portal_notifications" ALTER COLUMN "type" TYPE "NotificationType" USING "type"::"NotificationType";

-- ─── chat_messages.role (no default, lowercase values: "user" | "assistant") ───
ALTER TABLE "chat_messages" ALTER COLUMN "role" TYPE "ChatRole" USING "role"::"ChatRole";

-- ─── portal_item_progress.status ───
ALTER TABLE "portal_item_progress" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "portal_item_progress" ALTER COLUMN "status" TYPE "ItemProgressStatus" USING "status"::"ItemProgressStatus";
ALTER TABLE "portal_item_progress" ALTER COLUMN "status" SET DEFAULT 'NEW'::"ItemProgressStatus";

-- ─── portal_item_skill_progress.mode (no default) ───
ALTER TABLE "portal_item_skill_progress" ALTER COLUMN "mode" TYPE "PracticeMode" USING "mode"::"PracticeMode";

-- ─── portal_item_skill_progress.status ───
ALTER TABLE "portal_item_skill_progress" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "portal_item_skill_progress" ALTER COLUMN "status" TYPE "ItemProgressStatus" USING "status"::"ItemProgressStatus";
ALTER TABLE "portal_item_skill_progress" ALTER COLUMN "status" SET DEFAULT 'NEW'::"ItemProgressStatus";

-- ─── portal_lesson_skill_progress.mode (no default) ───
ALTER TABLE "portal_lesson_skill_progress" ALTER COLUMN "mode" TYPE "PracticeMode" USING "mode"::"PracticeMode";

-- ─── portal_lesson_session_state.mode (no default) ───
ALTER TABLE "portal_lesson_session_state" ALTER COLUMN "mode" TYPE "PracticeMode" USING "mode"::"PracticeMode";

-- ─── portal_practice_sessions.mode (no default) ───
ALTER TABLE "portal_practice_sessions" ALTER COLUMN "mode" TYPE "PracticeMode" USING "mode"::"PracticeMode";

-- ─── portal_practice_attempts.questionType (no default) ───
ALTER TABLE "portal_practice_attempts" ALTER COLUMN "questionType" TYPE "QuestionType" USING "questionType"::"QuestionType";
