/**
 * Practice Skill Service — per-mode progress tracking
 *
 * Handles: PortalItemSkillProgress, PortalLessonSkillProgress,
 *          PortalLessonSessionState (resume / queue / interleaving)
 *
 * NOTE: This is NOT a server action module. It's a data layer
 * imported by server actions (actions/practice.actions.ts).
 */

import { prisma } from '@/lib/prisma';
import { ItemProgressStatus, PracticeMode } from '@/enums/portal';

/* ───────── Constants ───────── */

const MASTERY_THRESHOLD = 0.8;
const DEFAULT_INTERLEAVE_COUNT = 5;
const INTERLEAVE_INTERVAL = 3; // inject 1 prev vocab after every N current vocab

/* ───────── Types ───────── */

export interface QueueVocabItem {
  id: string;
  lessonId: string;
  word: string;
  pinyin: string | null;
  meaning: string;
  meaningVi: string | null;
  wordType: string | null;
  exampleSentence: string | null;
  examplePinyin: string | null;
  exampleMeaning: string | null;
  isFromPrevLesson: boolean;
}

export interface SkillProgressRecord {
  vocabularyId: string;
  status: string;
  masteryScore: number;
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: Date | null;
  nextReviewAt: Date | null;
}

export interface PracticeQueueResult {
  queue: QueueVocabItem[];
  pointer: number;
  isCompleted: boolean;
  skillProgressMap: Record<string, SkillProgressRecord>;
  sessionState: {
    id: string;
    lastIndex: number;
    lastVocabularyId: string | null;
    isCompleted: boolean;
  };
}

/* ───────── Vocab select shape (reused) ───────── */

const VOCAB_SELECT = {
  id: true,
  lessonId: true,
  word: true,
  pinyin: true,
  meaning: true,
  meaningVi: true,
  wordType: true,
  exampleSentence: true,
  examplePinyin: true,
  exampleMeaning: true,
} as const;

/* ═══════════════════════════════════════════════════════════════
   1. BUILD PRACTICE QUEUE (with interleaving + resume)
   ═══════════════════════════════════════════════════════════════ */

export async function buildPracticeQueue(
  lessonId: string,
  studentId: string,
  mode: string,
  prevLessonCount: number = DEFAULT_INTERLEAVE_COUNT,
): Promise<PracticeQueueResult> {
  // ── 1. Current lesson vocabularies ──
  const currentVocabs = await prisma.vocabulary.findMany({
    where: { lessonId },
    orderBy: { displayOrder: 'asc' },
    select: VOCAB_SELECT,
  });

  if (currentVocabs.length === 0) {
    return {
      queue: [],
      pointer: 0,
      isCompleted: true,
      skillProgressMap: {},
      sessionState: { id: '', lastIndex: 0, lastVocabularyId: null, isCompleted: true },
    };
  }

  // ── 2. Get previous lesson (same course, lower order) ──
  const currentLesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true, order: true },
  });

  let prevVocabs: typeof currentVocabs = [];
  if (currentLesson) {
    const prevLesson = await prisma.lesson.findFirst({
      where: {
        courseId: currentLesson.courseId,
        order: { lt: currentLesson.order },
      },
      orderBy: { order: 'desc' },
      select: { id: true },
    });

    if (prevLesson) {
      prevVocabs = await prisma.vocabulary.findMany({
        where: { lessonId: prevLesson.id },
        orderBy: { displayOrder: 'asc' },
        select: VOCAB_SELECT,
      });
    }
  }

  // ── 3. Fetch skill progress for all relevant vocab ──
  const allVocabIds = [
    ...currentVocabs.map((v) => v.id),
    ...prevVocabs.map((v) => v.id),
  ];

  const skillRows = await prisma.portalItemSkillProgress.findMany({
    where: { studentId, vocabularyId: { in: allVocabIds }, mode },
  });

  const progressMap = new Map<string, (typeof skillRows)[0]>();
  for (const row of skillRows) {
    progressMap.set(row.vocabularyId, row);
  }

  // ── 4. Select N prev-lesson vocab by priority ──
  const selectedPrev = selectPrevLessonVocab(prevVocabs, progressMap, prevLessonCount);

  // ── 5. Merge queue: inject prev vocab after every INTERLEAVE_INTERVAL ──
  const queue = mergeQueue(currentVocabs, selectedPrev);

  // ── 6. Upsert session state ──
  const sessionState = await prisma.portalLessonSessionState.upsert({
    where: {
      studentId_lessonId_mode: { studentId, lessonId, mode },
    },
    create: {
      studentId,
      lessonId,
      mode,
      includePrevLessonCount: prevLessonCount,
    },
    update: {},
  });

  // ── 7. Compute resume pointer ──
  const { pointer, isCompleted } = computeResumePointer(
    queue,
    progressMap,
    sessionState.lastIndex,
  );

  // If completion status changed, persist
  if (isCompleted !== sessionState.isCompleted) {
    await prisma.portalLessonSessionState.update({
      where: { id: sessionState.id },
      data: { isCompleted },
    });
  }

  // ── 8. Build serializable progress map ──
  const skillProgressMap: Record<string, SkillProgressRecord> = {};
  for (const [vocabId, row] of progressMap) {
    skillProgressMap[vocabId] = {
      vocabularyId: row.vocabularyId,
      status: row.status,
      masteryScore: row.masteryScore,
      seenCount: row.seenCount,
      correctCount: row.correctCount,
      wrongCount: row.wrongCount,
      lastSeenAt: row.lastSeenAt,
      nextReviewAt: row.nextReviewAt,
    };
  }

  return {
    queue,
    pointer,
    isCompleted,
    skillProgressMap,
    sessionState: {
      id: sessionState.id,
      lastIndex: pointer,
      lastVocabularyId: queue[pointer]?.id ?? null,
      isCompleted,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════
   2. UPDATE SKILL PROGRESS (per attempt)
   ═══════════════════════════════════════════════════════════════ */

export async function updateSkillProgress(
  studentId: string,
  vocabularyId: string,
  mode: string,
  isCorrect: boolean,
): Promise<{ oldStatus: string; newStatus: string; statusChanged: boolean }> {
  const existing = await prisma.portalItemSkillProgress.findUnique({
    where: {
      studentId_vocabularyId_mode: { studentId, vocabularyId, mode },
    },
  });

  let masteryScore = existing?.masteryScore ?? 0;

  // Score calculation based on mode
  switch (mode) {
    case PracticeMode.FLASHCARD:
      masteryScore = isCorrect
        ? Math.min(1, masteryScore + 0.15)
        : Math.max(0, masteryScore - 0.1);
      break;
    case PracticeMode.QUIZ:
      masteryScore = isCorrect
        ? Math.min(1, masteryScore + 0.2)
        : Math.max(0, masteryScore - 0.15);
      break;
    case PracticeMode.LISTEN:
      masteryScore = isCorrect
        ? Math.min(1, masteryScore + 0.15)
        : Math.max(0, masteryScore - 0.1);
      break;
    case PracticeMode.WRITE:
      masteryScore = isCorrect
        ? Math.min(1, masteryScore + 0.25)
        : Math.max(0, masteryScore - 0.1);
      break;
    default:
      masteryScore = isCorrect
        ? Math.min(1, masteryScore + 0.15)
        : Math.max(0, masteryScore - 0.1);
  }

  const oldStatus = existing?.status ?? ItemProgressStatus.NEW;
  const newStatus =
    masteryScore >= MASTERY_THRESHOLD
      ? ItemProgressStatus.MASTERED
      : masteryScore > 0
        ? ItemProgressStatus.LEARNING
        : ItemProgressStatus.NEW;

  // Compute next review based on mastery
  const now = new Date();
  let nextReviewAt: Date;
  if (masteryScore >= MASTERY_THRESHOLD) {
    nextReviewAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  } else if (masteryScore >= 0.5) {
    nextReviewAt = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
  } else {
    nextReviewAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
  }

  await prisma.portalItemSkillProgress.upsert({
    where: {
      studentId_vocabularyId_mode: { studentId, vocabularyId, mode },
    },
    create: {
      studentId,
      vocabularyId,
      mode,
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

  return {
    oldStatus,
    newStatus,
    statusChanged: oldStatus !== newStatus,
  };
}

/* ═══════════════════════════════════════════════════════════════
   3. UPDATE SKILL PROGRESS — Flashcard actions (HARD/GOOD/EASY)
   ═══════════════════════════════════════════════════════════════ */

export async function updateFlashcardSkillProgress(
  studentId: string,
  vocabularyId: string,
  action: 'HARD' | 'GOOD' | 'EASY',
): Promise<{ oldStatus: string; newStatus: string; statusChanged: boolean }> {
  const mode = PracticeMode.FLASHCARD;
  const existing = await prisma.portalItemSkillProgress.findUnique({
    where: {
      studentId_vocabularyId_mode: { studentId, vocabularyId, mode },
    },
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

  const oldStatus = existing?.status ?? ItemProgressStatus.NEW;
  const newStatus =
    masteryScore >= MASTERY_THRESHOLD
      ? ItemProgressStatus.MASTERED
      : masteryScore > 0
        ? ItemProgressStatus.LEARNING
        : ItemProgressStatus.NEW;

  const isCorrect = action !== 'HARD';

  await prisma.portalItemSkillProgress.upsert({
    where: {
      studentId_vocabularyId_mode: { studentId, vocabularyId, mode },
    },
    create: {
      studentId,
      vocabularyId,
      mode,
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

  return { oldStatus, newStatus, statusChanged: oldStatus !== newStatus };
}

/* ═══════════════════════════════════════════════════════════════
   4. UPDATE LESSON SKILL PROGRESS (recompute from actual item data)
   ═══════════════════════════════════════════════════════════════ */

export async function updateLessonSkillProgress(
  studentId: string,
  lessonId: string,
  mode: string,
) {
  // Always recompute from actual item skill progress data for accuracy
  const totalCount = await prisma.vocabulary.count({ where: { lessonId } });
  if (totalCount === 0) return;

  const vocabIds = (
    await prisma.vocabulary.findMany({
      where: { lessonId },
      select: { id: true },
    })
  ).map((v) => v.id);

  const items = await prisma.portalItemSkillProgress.findMany({
    where: { studentId, vocabularyId: { in: vocabIds }, mode },
  });

  const masteredCount = items.filter(
    (i: { status: string }) => i.status === ItemProgressStatus.MASTERED,
  ).length;
  const learningCount = items.filter(
    (i: { status: string }) => i.status === ItemProgressStatus.LEARNING,
  ).length;
  const newCount = totalCount - masteredCount - learningCount;

  // Compute masteryPercent as average masteryScore across ALL vocab items (not just practiced ones)
  // This gives meaningful feedback during active learning instead of showing 0% until items are MASTERED
  const totalMasteryScore = items.reduce((sum: number, i: { masteryScore: number }) => sum + i.masteryScore, 0);
  const masteryPercent = totalCount > 0 ? (totalMasteryScore / totalCount) * 100 : 0;

  try {
    await prisma.portalLessonSkillProgress.upsert({
      where: {
        studentId_lessonId_mode: { studentId, lessonId, mode },
      },
      create: {
        studentId,
        lessonId,
        mode,
        totalCount,
        masteredCount,
        learningCount,
        newCount,
        masteryPercent,
        lastActivityAt: new Date(),
      },
      update: {
        totalCount,
        masteredCount,
        learningCount,
        newCount,
        masteryPercent,
        lastActivityAt: new Date(),
      },
    });
  } catch (error) {
    console.warn('[updateLessonSkillProgress] Skipped – table may not exist:', (error as Error).message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   5. UPDATE SESSION STATE (pointer advance)
   ═══════════════════════════════════════════════════════════════ */

export async function updateSessionState(
  studentId: string,
  lessonId: string,
  mode: string,
  currentIndex: number,
  currentVocabularyId: string,
  isCompleted: boolean,
) {
  await prisma.portalLessonSessionState.upsert({
    where: {
      studentId_lessonId_mode: { studentId, lessonId, mode },
    },
    create: {
      studentId,
      lessonId,
      mode,
      lastIndex: currentIndex,
      lastVocabularyId: currentVocabularyId,
      isCompleted,
    },
    update: {
      lastIndex: currentIndex,
      lastVocabularyId: currentVocabularyId,
      isCompleted,
    },
  });
}

/* ═══════════════════════════════════════════════════════════════
   6. RESET SESSION POINTER (ôn lại từ đầu)
   ═══════════════════════════════════════════════════════════════ */

export async function resetSessionPointer(
  studentId: string,
  lessonId: string,
  mode: string,
) {
  return prisma.portalLessonSessionState.upsert({
    where: {
      studentId_lessonId_mode: { studentId, lessonId, mode },
    },
    create: {
      studentId,
      lessonId,
      mode,
      lastIndex: 0,
      lastVocabularyId: null,
      isCompleted: false,
    },
    update: {
      lastIndex: 0,
      lastVocabularyId: null,
      isCompleted: false,
    },
  });
}

/* ═══════════════════════════════════════════════════════════════
   7. GET SKILL PROGRESS FOR VOCAB LIST
   ═══════════════════════════════════════════════════════════════ */

export async function getSkillProgressForLesson(
  studentId: string,
  lessonId: string,
  mode: string,
): Promise<Record<string, SkillProgressRecord>> {
  const vocabIds = (
    await prisma.vocabulary.findMany({
      where: { lessonId },
      select: { id: true },
    })
  ).map((v) => v.id);

  const items = await prisma.portalItemSkillProgress.findMany({
    where: { studentId, vocabularyId: { in: vocabIds }, mode },
  });

  const map: Record<string, SkillProgressRecord> = {};
  for (const item of items) {
    map[item.vocabularyId] = {
      vocabularyId: item.vocabularyId,
      status: item.status,
      masteryScore: item.masteryScore,
      seenCount: item.seenCount,
      correctCount: item.correctCount,
      wrongCount: item.wrongCount,
      lastSeenAt: item.lastSeenAt,
      nextReviewAt: item.nextReviewAt,
    };
  }
  return map;
}

/* ═══════════════════════════════════════════════════════════════
   8. GET LESSON SKILL PROGRESS (for lesson list / dashboard)
   ═══════════════════════════════════════════════════════════════ */

export async function getLessonSkillProgress(
  studentId: string,
  lessonId: string,
  mode: string,
) {
  try {
    return await prisma.portalLessonSkillProgress.findUnique({
      where: {
        studentId_lessonId_mode: { studentId, lessonId, mode },
      },
    });
  } catch (error) {
    console.warn('[getLessonSkillProgress] Skipped – table may not exist:', (error as Error).message);
    return null;
  }
}

/**
 * Get all mode skill progress for a single lesson (for ProgressCard badges)
 * Returns { [mode]: { masteryPercent, masteredCount, totalCount } }
 */
export async function getLessonAllModeSkillProgress(
  studentId: string,
  lessonId: string,
) {
  try {
    const items = await prisma.portalLessonSkillProgress.findMany({
      where: { studentId, lessonId },
    });

    const map: Record<string, { masteryPercent: number; masteredCount: number; totalCount: number }> = {};
    for (const item of items) {
      map[item.mode] = {
        masteryPercent: Math.round(item.masteryPercent),
        masteredCount: item.masteredCount,
        totalCount: item.totalCount,
      };
    }
    return map;
  } catch (error) {
    console.warn('[getLessonAllModeSkillProgress] Skipped – table may not exist:', (error as Error).message);
    return {} as Record<string, { masteryPercent: number; masteredCount: number; totalCount: number }>;
  }
}

/* ───────── Unified progress map (replaces legacy PortalLessonProgress reads) ───────── */

/**
 * Derive an overall per-lesson progress map from skill-based data.
 * Shape matches the legacy ProgressItem interface expected by PracticeListView.
 *
 * Overall mastery = avg(per-mode masteryPercent).
 * learnedCount   = max totalCount across modes (lesson has data → started).
 * masteredCount  = min masteredCount across modes (mastered in ALL modes).
 * totalTimeSec   = sum(durationSec) from PortalPracticeSession.
 */
export async function getAllLessonProgressFromSkills(studentId: string) {
  const [skillItems, sessions] = await Promise.all([
    prisma.portalLessonSkillProgress.findMany({ where: { studentId } }),
    prisma.portalPracticeSession.groupBy({
      by: ['lessonId'],
      where: { studentId },
      _sum: { durationSec: true },
    }),
  ]);

  // Build time map
  const timeMap = new Map<string, number>();
  for (const s of sessions) {
    timeMap.set(s.lessonId, s._sum.durationSec ?? 0);
  }

  // Group skill items by lesson
  const grouped = new Map<string, typeof skillItems>();
  for (const item of skillItems) {
    const arr = grouped.get(item.lessonId) ?? [];
    arr.push(item);
    grouped.set(item.lessonId, arr);
  }

  const map: Record<string, {
    lessonId: string;
    masteryPercent: number;
    learnedCount: number;
    masteredCount: number;
    totalTimeSec: number;
  }> = {};

  for (const [lessonId, modes] of grouped) {
    const avgMastery = modes.reduce((sum, m) => sum + m.masteryPercent, 0) / modes.length;
    const maxTotal = Math.max(...modes.map(m => m.totalCount));
    const minMastered = Math.min(...modes.map(m => m.masteredCount));

    map[lessonId] = {
      lessonId,
      masteryPercent: Math.round(avgMastery * 100) / 100,
      learnedCount: maxTotal, // > 0 means "started"
      masteredCount: minMastered,
      totalTimeSec: timeMap.get(lessonId) ?? 0,
    };
  }

  return map;
}

/**
 * Derive progress for a single lesson from skill-based data.
 * Used by the practice detail page's ProgressCard.
 */
export async function getLessonProgressFromSkills(studentId: string, lessonId: string) {
  const [modes, session] = await Promise.all([
    prisma.portalLessonSkillProgress.findMany({
      where: { studentId, lessonId },
    }),
    prisma.portalPracticeSession.aggregate({
      where: { studentId, lessonId },
      _sum: { durationSec: true },
    }),
  ]);

  if (modes.length === 0) return null;

  const avgMastery = modes.reduce((sum, m) => sum + m.masteryPercent, 0) / modes.length;
  const maxTotal = Math.max(...modes.map(m => m.totalCount));
  const minMastered = Math.min(...modes.map(m => m.masteredCount));

  return {
    lessonId,
    masteryPercent: Math.round(avgMastery * 100) / 100,
    learnedCount: maxTotal,
    masteredCount: minMastered,
    totalTimeSec: session._sum.durationSec ?? 0,
  };
}

/* ───────── Get all lesson skill progress for a student (dashboard) ───────── */

export async function getAllLessonSkillProgress(studentId: string) {
  try {
    const items = await prisma.portalLessonSkillProgress.findMany({
      where: { studentId },
    });

    // Group by lessonId → { [lessonId]: { FLASHCARD: ..., QUIZ: ..., ... } }
    const map: Record<string, Record<string, (typeof items)[0]>> = {};
    for (const item of items) {
      if (!map[item.lessonId]) map[item.lessonId] = {};
      map[item.lessonId][item.mode] = item;
    }
    return map;
  } catch (error) {
    // Table may not exist yet (pending migration) – return empty map gracefully
    console.warn("[getAllLessonSkillProgress] Skipped – table may not exist:", (error as Error).message);
    return {} as Record<string, Record<string, never>>;
  }
}

/* ═══════════════════════════════════════════════════════════════
   9. FULL ATTEMPT FLOW (transaction-like)
   ═══════════════════════════════════════════════════════════════ */

export async function processSkillAttempt(params: {
  studentId: string;
  lessonId: string;
  mode: string;
  vocabularyId: string;
  isCorrect: boolean;
  currentIndex: number;
  queueLength: number;
}) {
  const { studentId, lessonId, mode, vocabularyId, isCorrect, currentIndex, queueLength } = params;

  // 1. Update item skill progress
  const { oldStatus, newStatus, statusChanged } = await updateSkillProgress(
    studentId,
    vocabularyId,
    mode,
    isCorrect,
  );

  // 2–4. Batch remaining writes in parallel (independent operations)
  const nextIndex = currentIndex + 1;
  const isCompleted = nextIndex >= queueLength;

  const writes: Promise<unknown>[] = [
    // 2. Update session state pointer
    updateSessionState(studentId, lessonId, mode, nextIndex, vocabularyId, isCompleted),
    // 3. Always recompute lesson skill progress (uses avg masteryScore)
    updateLessonSkillProgress(studentId, lessonId, mode),
  ];

  await Promise.all(writes);

  return { oldStatus, newStatus, statusChanged, isCompleted };
}

/* ═══════════════════════════════════════════════════════════════
   10. FULL FLASHCARD ATTEMPT FLOW
   ═══════════════════════════════════════════════════════════════ */

export async function processFlashcardSkillAttempt(params: {
  studentId: string;
  lessonId: string;
  vocabularyId: string;
  action: 'HARD' | 'GOOD' | 'EASY';
  currentIndex: number;
  queueLength: number;
  sessionId: string;
}) {
  const { studentId, lessonId, vocabularyId, action, currentIndex, queueLength, sessionId } = params;

  // 1. Update flashcard skill progress (needs result for step 2)
  const { oldStatus, newStatus, statusChanged } = await updateFlashcardSkillProgress(
    studentId,
    vocabularyId,
    action,
  );

  // 2–5. Batch independent writes in parallel
  const nextIndex = currentIndex + 1;
  const isCompleted = nextIndex >= queueLength;
  const isCorrect = action !== 'HARD';

  const writes: Promise<unknown>[] = [
    // Session state pointer
    updateSessionState(studentId, lessonId, PracticeMode.FLASHCARD, nextIndex, vocabularyId, isCompleted),
    // Attempt record
    prisma.portalPracticeAttempt.create({
      data: { sessionId, vocabularyId, questionType: 'FLASHCARD', userAnswer: action, correctAnswer: action, isCorrect, timeSpentSec: 0 },
    }),
    // Always recompute lesson skill progress (uses avg masteryScore)
    updateLessonSkillProgress(studentId, lessonId, PracticeMode.FLASHCARD),
  ];

  await Promise.all(writes);

  return { oldStatus, newStatus, statusChanged, isCompleted };
}

/* ═══════════════════════════════════════════════════════════════
   INTERNAL HELPERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Select N vocab from previous lesson, prioritized:
 * 1. Not MASTERED
 * 2. Due for review (nextReviewAt <= now)
 * 3. Random fallback
 */
function selectPrevLessonVocab(
  prevVocabs: Array<{ id: string; lessonId: string; word: string; pinyin: string | null; meaning: string; meaningVi: string | null; wordType: string | null; exampleSentence: string | null; examplePinyin: string | null; exampleMeaning: string | null }>,
  progressMap: Map<string, { status: string; nextReviewAt: Date | null }>,
  maxCount: number,
): typeof prevVocabs {
  if (prevVocabs.length === 0 || maxCount <= 0) return [];

  const now = new Date();
  const selectedIds = new Set<string>();
  const selected: typeof prevVocabs = [];

  // Priority 1: Not mastered
  for (const v of prevVocabs) {
    if (selected.length >= maxCount) break;
    const p = progressMap.get(v.id);
    if (!p || p.status !== ItemProgressStatus.MASTERED) {
      selected.push(v);
      selectedIds.add(v.id);
    }
  }

  // Priority 2: Due for review (mastered but nextReviewAt <= now)
  for (const v of prevVocabs) {
    if (selected.length >= maxCount) break;
    if (selectedIds.has(v.id)) continue;
    const p = progressMap.get(v.id);
    if (p && p.nextReviewAt && p.nextReviewAt <= now) {
      selected.push(v);
      selectedIds.add(v.id);
    }
  }

  // Priority 3: Random fallback
  if (selected.length < maxCount) {
    const remaining = prevVocabs.filter((v) => !selectedIds.has(v.id));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    for (const v of shuffled) {
      if (selected.length >= maxCount) break;
      selected.push(v);
    }
  }

  return selected;
}

/**
 * Merge current lesson vocab + prev lesson vocab into a single queue.
 * Prev vocab is interleaved after every INTERLEAVE_INTERVAL items.
 */
function mergeQueue(
  currentVocabs: Array<{ id: string; lessonId: string; word: string; pinyin: string | null; meaning: string; meaningVi: string | null; wordType: string | null; exampleSentence: string | null; examplePinyin: string | null; exampleMeaning: string | null }>,
  prevVocabs: typeof currentVocabs,
): QueueVocabItem[] {
  const queue: QueueVocabItem[] = [];
  let prevIdx = 0;

  for (let i = 0; i < currentVocabs.length; i++) {
    queue.push({ ...currentVocabs[i], isFromPrevLesson: false });

    // After every INTERLEAVE_INTERVAL items, inject a prev vocab
    if ((i + 1) % INTERLEAVE_INTERVAL === 0 && prevIdx < prevVocabs.length) {
      queue.push({ ...prevVocabs[prevIdx], isFromPrevLesson: true });
      prevIdx++;
    }
  }

  // Append remaining prev vocab at the end
  while (prevIdx < prevVocabs.length) {
    queue.push({ ...prevVocabs[prevIdx], isFromPrevLesson: true });
    prevIdx++;
  }

  return queue;
}

/**
 * Compute resume pointer: find first non-MASTERED vocab from current position.
 */
function computeResumePointer(
  queue: QueueVocabItem[],
  progressMap: Map<string, { status: string }>,
  lastIndex: number,
): { pointer: number; isCompleted: boolean } {
  if (queue.length === 0) return { pointer: 0, isCompleted: true };

  // If session was completed, still check if there are new non-mastered items
  // (e.g., due to status decay or new vocab added)
  const allMastered = queue.every((v) => {
    const p = progressMap.get(v.id);
    return p?.status === ItemProgressStatus.MASTERED;
  });

  if (allMastered) {
    return { pointer: 0, isCompleted: true };
  }

  // Find first non-mastered starting from lastIndex
  for (let i = lastIndex; i < queue.length; i++) {
    const p = progressMap.get(queue[i].id);
    if (!p || p.status !== ItemProgressStatus.MASTERED) {
      return { pointer: i, isCompleted: false };
    }
  }

  // Wrap around: search from beginning
  for (let i = 0; i < lastIndex; i++) {
    const p = progressMap.get(queue[i].id);
    if (!p || p.status !== ItemProgressStatus.MASTERED) {
      return { pointer: i, isCompleted: false };
    }
  }

  return { pointer: 0, isCompleted: true };
}

/**
 * @deprecated Legacy sync removed in P1-06. Kept for reference only.
 * Sync legacy PortalItemProgress (overall progress, no mode separation)
 * so existing lesson list mastery display stays correct.
 */
async function syncLegacyItemProgress(
  studentId: string,
  vocabularyId: string,
  isCorrect: boolean,
) {
  const existing = await prisma.portalItemProgress.findUnique({
    where: { studentId_vocabularyId: { studentId, vocabularyId } },
  });

  let masteryScore = existing?.masteryScore ?? 0;
  masteryScore = isCorrect
    ? Math.min(1, masteryScore + 0.15)
    : Math.max(0, masteryScore - 0.1);

  const status =
    masteryScore >= MASTERY_THRESHOLD
      ? ItemProgressStatus.MASTERED
      : masteryScore > 0
        ? ItemProgressStatus.LEARNING
        : ItemProgressStatus.NEW;

  const now = new Date();
  let nextReviewAt = now;
  if (masteryScore >= MASTERY_THRESHOLD) {
    nextReviewAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  } else if (masteryScore >= 0.5) {
    nextReviewAt = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  } else {
    nextReviewAt = new Date(now.getTime() + 10 * 60 * 1000);
  }

  await prisma.portalItemProgress.upsert({
    where: { studentId_vocabularyId: { studentId, vocabularyId } },
    create: {
      studentId,
      vocabularyId,
      seenCount: 1,
      correctCount: isCorrect ? 1 : 0,
      wrongCount: isCorrect ? 0 : 1,
      masteryScore,
      status,
      lastSeenAt: now,
      nextReviewAt,
    },
    update: {
      seenCount: { increment: 1 },
      correctCount: isCorrect ? { increment: 1 } : undefined,
      wrongCount: isCorrect ? undefined : { increment: 1 },
      masteryScore,
      status,
      lastSeenAt: now,
      nextReviewAt,
    },
  });
}

/* ═══════════════════════════════════════════════════════════════
 *  Guided Learning Path — "Tiếp tục học"
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Get the most recently practiced lesson for a student.
 * Returns lesson info + the mode they were last using.
 * Used for the "Continue learning" banner in PracticeListView.
 */
export async function getLastActiveLesson(studentId: string) {
  const session = await prisma.portalLessonSessionState.findFirst({
    where: { studentId, isCompleted: false },
    orderBy: { updatedAt: 'desc' },
    select: {
      mode: true,
      lastIndex: true,
      lesson: {
        select: {
          id: true,
          slug: true,
          title: true,
          titleChinese: true,
          order: true,
          course: {
            select: {
              slug: true,
              level: true,
              title: true,
            },
          },
          _count: { select: { vocabularies: true } },
        },
      },
    },
  });

  if (!session) return null;

  // Get mastery info for this lesson+mode
  const skillProgress = await prisma.portalLessonSkillProgress.findUnique({
    where: {
      studentId_lessonId_mode: {
        studentId,
        lessonId: session.lesson.id,
        mode: session.mode,
      },
    },
    select: { masteredCount: true, totalCount: true, masteryPercent: true },
  });

  const hskLevel = session.lesson.course.level?.replace(/\D/g, '') ?? '0';

  return {
    lessonId: session.lesson.id,
    lessonSlug: session.lesson.slug,
    lessonTitle: session.lesson.title,
    lessonOrder: session.lesson.order,
    courseTitle: session.lesson.course.title,
    levelSlug: `hsk${hskLevel}`,
    mode: session.mode,
    lastIndex: session.lastIndex,
    totalVocab: session.lesson._count.vocabularies,
    masteredCount: skillProgress?.masteredCount ?? 0,
    totalCount: skillProgress?.totalCount ?? session.lesson._count.vocabularies,
    masteryPercent: skillProgress?.masteryPercent ?? 0,
  };
}
