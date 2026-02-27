'use server';

/**
 * Practice Skill Server Actions
 * Per-mode (Flashcard / Quiz / Listen / Write) progress tracking
 */

import { auth } from '@/auth';
import {
  buildPracticeQueue,
  processSkillAttempt,
  processFlashcardSkillAttempt,
  resetSessionPointer,
  getAllLessonSkillProgress,
  getSkillProgressForLesson,
  getLessonSkillProgress,
  getLessonAllModeSkillProgress,
} from '@/services/portal/practice-skill.service';
import {
  getLessonWithVocabularies,
  startPracticeSession as startSessionService,
  finishPracticeSession as finishSessionService,
  getStudentEnrolledHskLevels,
  getCoursesForPractice as getCoursesService,
} from '@/services/portal/practice.service';

/* ═══════════════════════════════════════════════════════════
   1. FETCH PRACTICE QUEUE (with interleaving + resume)
   ═══════════════════════════════════════════════════════════ */

export async function fetchPracticeQueue(lessonIdOrSlug: string, mode: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    // Resolve slug → UUID if needed
    const lesson = await getLessonWithVocabularies(lessonIdOrSlug);
    if (!lesson) return { success: false, error: 'Bài học không tồn tại' };

    const queueResult = await buildPracticeQueue(lesson.id, session.user.id, mode);

    return {
      success: true,
      data: {
        queue: queueResult.queue,
        pointer: queueResult.pointer,
        isCompleted: queueResult.isCompleted,
        skillProgressMap: queueResult.skillProgressMap,
        sessionState: queueResult.sessionState,
      },
    };
  } catch (error) {
    console.error('Error fetching practice queue:', error);
    return { success: false, error: 'Không thể tải dữ liệu luyện tập' };
  }
}

/* ═══════════════════════════════════════════════════════════
   2. RECORD SKILL ATTEMPT (Quiz / Listen / Write)
   ═══════════════════════════════════════════════════════════ */

export async function recordSkillAttemptAction(data: {
  lessonId: string;
  mode: string;
  vocabularyId: string;
  isCorrect: boolean;
  currentIndex: number;
  queueLength: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const result = await processSkillAttempt({
      studentId: session.user.id,
      lessonId: data.lessonId,
      mode: data.mode,
      vocabularyId: data.vocabularyId,
      isCorrect: data.isCorrect,
      currentIndex: data.currentIndex,
      queueLength: data.queueLength,
    });

    return {
      success: true,
      data: {
        newStatus: result.newStatus,
        statusChanged: result.statusChanged,
        isCompleted: result.isCompleted,
      },
    };
  } catch (error) {
    console.error('Error recording skill attempt:', error);
    return { success: false, error: 'Lỗi ghi nhận kết quả' };
  }
}

/* ═══════════════════════════════════════════════════════════
   3. RECORD FLASHCARD SKILL ACTION (HARD / GOOD / EASY)
   ═══════════════════════════════════════════════════════════ */

export async function recordFlashcardSkillAction(data: {
  lessonId: string;
  vocabularyId: string;
  action: 'HARD' | 'GOOD' | 'EASY';
  currentIndex: number;
  queueLength: number;
  sessionId: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const result = await processFlashcardSkillAttempt({
      studentId: session.user.id,
      lessonId: data.lessonId,
      vocabularyId: data.vocabularyId,
      action: data.action,
      currentIndex: data.currentIndex,
      queueLength: data.queueLength,
      sessionId: data.sessionId,
    });

    return {
      success: true,
      data: {
        newStatus: result.newStatus,
        statusChanged: result.statusChanged,
        isCompleted: result.isCompleted,
      },
    };
  } catch (error) {
    console.error('Error recording flashcard skill action:', error);
    return { success: false, error: 'Lỗi ghi nhận' };
  }
}

/* ═══════════════════════════════════════════════════════════
   4. RESET SESSION POINTER (Ôn lại từ đầu)
   ═══════════════════════════════════════════════════════════ */

export async function resetPracticeSessionAction(lessonId: string, mode: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await resetSessionPointer(session.user.id, lessonId, mode);

    return { success: true };
  } catch (error) {
    console.error('Error resetting practice session:', error);
    return { success: false, error: 'Lỗi reset phiên học' };
  }
}

/* ═══════════════════════════════════════════════════════════
   5. FETCH DASHBOARD PROGRESS (all lessons, all modes)
   ═══════════════════════════════════════════════════════════ */

export async function fetchDashboardSkillProgress() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const enrolledLevels = await getStudentEnrolledHskLevels(session.user.id);

    const [courses, skillProgressMap] = await Promise.all([
      getCoursesService(enrolledLevels.length > 0 ? enrolledLevels : undefined),
      getAllLessonSkillProgress(session.user.id),
    ]);

    return {
      success: true,
      data: { courses, skillProgressMap },
    };
  } catch (error) {
    console.error('Error fetching dashboard skill progress:', error);
    return { success: false, error: 'Không thể tải tiến độ' };
  }
}

/* ═══════════════════════════════════════════════════════════
   6. REFRESH SKILL PROGRESS (for a specific lesson + mode)
   ═══════════════════════════════════════════════════════════ */

export async function refreshSkillProgress(lessonId: string, mode: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const [skillProgress, lessonSkillProgress] = await Promise.all([
      getSkillProgressForLesson(session.user.id, lessonId, mode),
      getLessonSkillProgress(session.user.id, lessonId, mode),
    ]);

    return {
      success: true,
      data: { skillProgress, lessonSkillProgress },
    };
  } catch (error) {
    console.error('Error refreshing skill progress:', error);
    return { success: false, error: 'Lỗi tải tiến độ' };
  }
}

/* ═══════════════════════════════════════════════════════════
   6b. REFRESH ALL-MODE SKILL PROGRESS (for ProgressCard)
   ═══════════════════════════════════════════════════════════ */

export async function refreshAllModeSkillProgress(lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const allModeProgress = await getLessonAllModeSkillProgress(session.user.id, lessonId);
    return { success: true, data: allModeProgress };
  } catch (error) {
    console.error('Error refreshing all-mode skill progress:', error);
    return { success: false, error: 'Lỗi tải tiến độ' };
  }
}

/* ═══════════════════════════════════════════════════════════
   7. START PRACTICE SESSION (reuse existing)
   ═══════════════════════════════════════════════════════════ */

export async function startSkillPracticeSession(lessonId: string, mode: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const practiceSession = await startSessionService(session.user.id, lessonId, mode);
    return { success: true, data: { sessionId: practiceSession.id } };
  } catch (error) {
    console.error('Error starting skill practice session:', error);
    return { success: false, error: 'Không thể bắt đầu phiên luyện tập' };
  }
}

/* ═══════════════════════════════════════════════════════════
   8. FINISH PRACTICE SESSION (reuse existing)
   ═══════════════════════════════════════════════════════════ */

export async function finishSkillPracticeSession(sessionId: string, durationSec: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await finishSessionService(sessionId, durationSec);
    return { success: true };
  } catch (error) {
    console.error('Error finishing skill practice session:', error);
    return { success: false, error: 'Lỗi kết thúc phiên' };
  }
}
