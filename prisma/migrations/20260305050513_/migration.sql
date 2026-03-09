-- CreateTable
CREATE TABLE "portal_item_skill_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "seenCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "masteryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "lastSeenAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_item_skill_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_lesson_skill_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "masteredCount" INTEGER NOT NULL DEFAULT 0,
    "learningCount" INTEGER NOT NULL DEFAULT 0,
    "newCount" INTEGER NOT NULL DEFAULT 0,
    "masteryPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_lesson_skill_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_lesson_session_state" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "lastIndex" INTEGER NOT NULL DEFAULT 0,
    "lastVocabularyId" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "includePrevLessonCount" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_lesson_session_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portal_item_skill_progress_studentId_mode_idx" ON "portal_item_skill_progress"("studentId", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "portal_item_skill_progress_studentId_vocabularyId_mode_key" ON "portal_item_skill_progress"("studentId", "vocabularyId", "mode");

-- CreateIndex
CREATE INDEX "portal_lesson_skill_progress_studentId_idx" ON "portal_lesson_skill_progress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "portal_lesson_skill_progress_studentId_lessonId_mode_key" ON "portal_lesson_skill_progress"("studentId", "lessonId", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "portal_lesson_session_state_studentId_lessonId_mode_key" ON "portal_lesson_session_state"("studentId", "lessonId", "mode");

-- AddForeignKey
ALTER TABLE "portal_item_skill_progress" ADD CONSTRAINT "portal_item_skill_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_item_skill_progress" ADD CONSTRAINT "portal_item_skill_progress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "portal_vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_lesson_skill_progress" ADD CONSTRAINT "portal_lesson_skill_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_lesson_skill_progress" ADD CONSTRAINT "portal_lesson_skill_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_lesson_session_state" ADD CONSTRAINT "portal_lesson_session_state_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_lesson_session_state" ADD CONSTRAINT "portal_lesson_session_state_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
