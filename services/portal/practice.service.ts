'use server';

/**
 * Practice Service — data layer for lesson practice feature
 */

import { prisma } from '@/lib/prisma';

/* ───────── Get lesson with vocabularies + course info ───────── */

export async function getLessonWithVocabularies(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: { select: { id: true, title: true, slug: true, level: true } },
      vocabularies: { orderBy: { createdAt: 'asc' } },
    },
  });
}

/* ───────── Get sibling lessons (same course) ───────── */

export async function getSiblingLessons(courseId: string) {
  return prisma.lesson.findMany({
    where: { courseId },
    select: { id: true, title: true, order: true },
    orderBy: { order: 'asc' },
  });
}

/* ───────── Get student lesson progress ───────── */

export async function getStudentLessonProgress(studentId: string, lessonId: string) {
  return prisma.studentLessonProgress.findUnique({
    where: { studentId_lessonId: { studentId, lessonId } },
  });
}

/* ───────── Get student item progress for a lesson ───────── */

export async function getStudentItemProgressForLesson(studentId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { vocabularies: { select: { id: true } } },
  });

  if (!lesson) return {};

  const vocabIds = lesson.vocabularies.map((v) => v.id);
  const items = await prisma.studentItemProgress.findMany({
    where: { studentId, vocabularyId: { in: vocabIds } },
  });

  const map: Record<string, typeof items[0]> = {};
  for (const item of items) {
    map[item.vocabularyId] = item;
  }
  return map;
}

/* ───────── Record vocabulary seen (for lookup tab) ───────── */

export async function recordVocabSeen(studentId: string, vocabularyId: string, lessonId: string) {
  // Upsert item progress
  await prisma.studentItemProgress.upsert({
    where: { studentId_vocabularyId: { studentId, vocabularyId } },
    create: {
      studentId,
      vocabularyId,
      seenCount: 1,
      lastSeenAt: new Date(),
      status: 'LEARNING',
    },
    update: {
      seenCount: { increment: 1 },
      lastSeenAt: new Date(),
      status: 'LEARNING', // At minimum LEARNING after seen
    },
  });

  // Recompute lesson progress
  await recomputeLessonProgress(studentId, lessonId);
}

/* ───────── Start practice session ───────── */

export async function startPracticeSession(studentId: string, lessonId: string, mode: string) {
  return prisma.practiceSession.create({
    data: { studentId, lessonId, mode },
  });
}

/* ───────── Finish practice session ───────── */

export async function finishPracticeSession(sessionId: string, durationSec: number) {
  return prisma.practiceSession.update({
    where: { id: sessionId },
    data: { endedAt: new Date(), durationSec },
  });
}

/* ───────── Record practice attempt ───────── */

export async function recordPracticeAttempt(
  sessionId: string,
  vocabularyId: string,
  questionType: string,
  userAnswer: string | null,
  correctAnswer: string,
  isCorrect: boolean,
  timeSpentSec: number,
) {
  // Create attempt record
  await prisma.practiceAttempt.create({
    data: {
      sessionId,
      vocabularyId,
      questionType,
      userAnswer,
      correctAnswer,
      isCorrect,
      timeSpentSec,
    },
  });

  // Get session to know studentId & lessonId
  const session = await prisma.practiceSession.findUnique({
    where: { id: sessionId },
    select: { studentId: true, lessonId: true, mode: true },
  });

  if (!session) return;

  // Update item progress
  await updateItemProgress(session.studentId, vocabularyId, isCorrect, session.mode);

  // Recompute lesson progress
  await recomputeLessonProgress(session.studentId, session.lessonId);
}

/* ───────── Update item progress after an attempt ───────── */

async function updateItemProgress(
  studentId: string,
  vocabularyId: string,
  isCorrect: boolean,
  mode: string,
) {
  const existing = await prisma.studentItemProgress.findUnique({
    where: { studentId_vocabularyId: { studentId, vocabularyId } },
  });

  let masteryScore = existing?.masteryScore ?? 0;

  if (mode === 'FLASHCARD') {
    // Flashcard uses its own mastery deltas passed via the attempt
    // But here we apply a simpler model for the DB update
    masteryScore = isCorrect
      ? Math.min(1, masteryScore + 0.15)
      : Math.max(0, masteryScore - 0.1);
  } else {
    // Quiz, Listen, Write
    masteryScore = isCorrect
      ? Math.min(1, masteryScore + 0.15)
      : Math.max(0, masteryScore - 0.1);
  }

  const newStatus =
    masteryScore >= 0.8 ? 'MASTERED' : masteryScore > 0 ? 'LEARNING' : 'NEW';

  // Calculate next review based on mastery
  const now = new Date();
  let nextReviewAt = now;
  if (masteryScore >= 0.8) {
    nextReviewAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  } else if (masteryScore >= 0.5) {
    nextReviewAt = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
  } else {
    nextReviewAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
  }

  await prisma.studentItemProgress.upsert({
    where: { studentId_vocabularyId: { studentId, vocabularyId } },
    create: {
      studentId,
      vocabularyId,
      seenCount: 1,
      correctCount: isCorrect ? 1 : 0,
      wrongCount: isCorrect ? 0 : 1,
      masteryScore,
      status: newStatus,
      lastSeenAt: now,
      nextReviewAt,
    },
    update: {
      seenCount: { increment: 1 },
      correctCount: isCorrect ? { increment: 1 } : undefined,
      wrongCount: isCorrect ? undefined : { increment: 1 },
      masteryScore,
      status: newStatus,
      lastSeenAt: now,
      nextReviewAt,
    },
  });
}

/* ───────── Recompute lesson-level progress ───────── */

async function recomputeLessonProgress(studentId: string, lessonId: string) {
  // Get total vocab count for lesson
  const totalCount = await prisma.vocabulary.count({ where: { lessonId } });
  if (totalCount === 0) return;

  // Get all item progress for this lesson's vocabularies
  const vocabIds = (
    await prisma.vocabulary.findMany({
      where: { lessonId },
      select: { id: true },
    })
  ).map((v) => v.id);

  const itemProgressList = await prisma.studentItemProgress.findMany({
    where: { studentId, vocabularyId: { in: vocabIds } },
  });

  const learnedCount = itemProgressList.filter((ip) => ip.seenCount >= 1).length;
  const masteredCount = itemProgressList.filter((ip) => ip.masteryScore >= 0.8).length;
  const masteryPercent = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

  // Sum total time from sessions
  const sessions = await prisma.practiceSession.findMany({
    where: { studentId, lessonId },
    select: { durationSec: true },
  });
  const totalTimeSec = sessions.reduce((acc, s) => acc + s.durationSec, 0);

  await prisma.studentLessonProgress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    create: { studentId, lessonId, learnedCount, masteredCount, totalTimeSec, masteryPercent },
    update: { learnedCount, masteredCount, totalTimeSec, masteryPercent },
  });
}

/* ───────── Record flashcard action ───────── */

export async function recordFlashcardAction(
  studentId: string,
  vocabularyId: string,
  lessonId: string,
  action: 'HARD' | 'GOOD' | 'EASY',
  sessionId: string,
) {
  const existing = await prisma.studentItemProgress.findUnique({
    where: { studentId_vocabularyId: { studentId, vocabularyId } },
  });

  let masteryScore = existing?.masteryScore ?? 0;
  const now = new Date();
  let nextReviewAt: Date;

  switch (action) {
    case 'HARD':
      masteryScore = Math.max(0, masteryScore - 0.1);
      nextReviewAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 min
      break;
    case 'GOOD':
      masteryScore = Math.min(1, masteryScore + 0.1);
      nextReviewAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      break;
    case 'EASY':
      masteryScore = Math.min(1, masteryScore + 0.15);
      nextReviewAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      break;
  }

  const status =
    masteryScore >= 0.8 ? 'MASTERED' : masteryScore > 0 ? 'LEARNING' : 'NEW';

  await prisma.studentItemProgress.upsert({
    where: { studentId_vocabularyId: { studentId, vocabularyId } },
    create: {
      studentId,
      vocabularyId,
      seenCount: 1,
      correctCount: action !== 'HARD' ? 1 : 0,
      wrongCount: action === 'HARD' ? 1 : 0,
      masteryScore,
      status,
      lastSeenAt: now,
      nextReviewAt,
    },
    update: {
      seenCount: { increment: 1 },
      correctCount: action !== 'HARD' ? { increment: 1 } : undefined,
      wrongCount: action === 'HARD' ? { increment: 1 } : undefined,
      masteryScore,
      status,
      lastSeenAt: now,
      nextReviewAt,
    },
  });

  // Record attempt
  await prisma.practiceAttempt.create({
    data: {
      sessionId,
      vocabularyId,
      questionType: 'FLASHCARD',
      userAnswer: action,
      correctAnswer: action,
      isCorrect: action !== 'HARD',
      timeSpentSec: 0,
    },
  });

  await recomputeLessonProgress(studentId, lessonId);
}

/* ───────── Get enrolled HSK levels for a student ───────── */

export async function getStudentEnrolledHskLevels(studentId: string): Promise<number[]> {
  const enrollments = await prisma.portalClassEnrollment.findMany({
    where: {
      studentId,
      status: 'ENROLLED',
      class: { status: 'ACTIVE' },
    },
    select: { class: { select: { level: true } } },
  });

  const levelSet = new Set<number>();
  for (const e of enrollments) {
    const raw = e.class.level; // e.g. "HSK1", "HSK2", "BASIC"
    if (raw) {
      const match = raw.match(/^HSK\s*(\d+)$/i);
      if (match) levelSet.add(Number(match[1]));
    }
  }
  return [...levelSet].sort((a, b) => a - b);
}

/* ───────── Get courses with lessons (for practice list page) ───────── */

export async function getCoursesForPractice(hskLevels?: number[]) {
  const where: any = { isPublished: true, category: { slug: 'luyen-thi-hsk' } };

  // Filter to only enrolled HSK levels when provided
  if (hskLevels && hskLevels.length > 0) {
    where.hskLevel = { level: { in: hskLevels } };
  }

  return prisma.course.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      level: true,
      lessonCount: true,
      vocabularyCount: true,
      hskLevel: { select: { level: true, badge: true, badgeColor: true, accentColor: true } },
      lessons: {
        select: { id: true, title: true, titleChinese: true, order: true, _count: { select: { vocabularies: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { hskLevel: { level: 'asc' } },
  });
}

/* ───────── Get student progress for all lessons ───────── */

export async function getStudentAllLessonProgress(studentId: string) {
  const items = await prisma.studentLessonProgress.findMany({
    where: { studentId },
  });

  const map: Record<string, typeof items[0]> = {};
  for (const item of items) {
    map[item.lessonId] = item;
  }
  return map;
}
