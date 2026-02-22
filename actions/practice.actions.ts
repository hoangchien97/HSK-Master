'use server';

/**
 * Practice Server Actions
 * Server-side actions for lesson practice feature
 */

import { auth } from '@/auth';
import {
  getLessonWithVocabularies,
  getSiblingLessons,
  getStudentLessonProgress,
  getStudentItemProgressForLesson,
  recordVocabSeen as recordVocabSeenService,
  startPracticeSession as startSessionService,
  finishPracticeSession as finishSessionService,
  recordPracticeAttempt as recordAttemptService,
  recordFlashcardAction as recordFlashcardService,
  getCoursesForPractice as getCoursesService,
  getStudentAllLessonProgress,
  getStudentEnrolledHskLevels,
} from '@/services/portal/practice.service';

/* ───────── Fetch lesson practice data ───────── */

export async function fetchLessonPracticeData(lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const lesson = await getLessonWithVocabularies(lessonId);
    if (!lesson) return { success: false, error: 'Bài học không tồn tại' };

    const [progress, itemProgress, siblings] = await Promise.all([
      getStudentLessonProgress(session.user.id, lessonId),
      getStudentItemProgressForLesson(session.user.id, lessonId),
      getSiblingLessons(lesson.courseId),
    ]);

    return {
      success: true,
      data: {
        lesson: {
          ...lesson,
          vocabularies: lesson.vocabularies.map((v) => ({
            ...v,
            createdAt: undefined,
          })),
        },
        progress,
        itemProgress,
        siblings: siblings.map((s) => ({ id: s.id, slug: s.slug, title: s.title, order: s.order })),
      },
    };
  } catch (error) {
    console.error('Error fetching lesson practice data:', error);
    return { success: false, error: 'Không thể tải dữ liệu bài học' };
  }
}

/* ───────── Record vocabulary seen ───────── */

export async function recordVocabSeenAction(vocabularyId: string, lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await recordVocabSeenService(session.user.id, vocabularyId, lessonId);
    return { success: true };
  } catch (error) {
    console.error('Error recording vocab seen:', error);
    return { success: false, error: 'Lỗi ghi nhận' };
  }
}

/* ───────── Start practice session ───────── */

export async function startPracticeSessionAction(lessonId: string, mode: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const practiceSession = await startSessionService(session.user.id, lessonId, mode);
    return { success: true, data: { sessionId: practiceSession.id } };
  } catch (error) {
    console.error('Error starting practice session:', error);
    return { success: false, error: 'Không thể bắt đầu phiên luyện tập' };
  }
}

/* ───────── Finish practice session ───────── */

export async function finishPracticeSessionAction(sessionId: string, durationSec: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await finishSessionService(sessionId, durationSec);
    return { success: true };
  } catch (error) {
    console.error('Error finishing session:', error);
    return { success: false, error: 'Lỗi kết thúc phiên' };
  }
}

/* ───────── Record practice attempt ───────── */

export async function recordPracticeAttemptAction(data: {
  sessionId: string;
  vocabularyId: string;
  questionType: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await recordAttemptService(
      data.sessionId,
      data.vocabularyId,
      data.questionType,
      data.userAnswer,
      data.correctAnswer,
      data.isCorrect,
      data.timeSpentSec,
    );
    return { success: true };
  } catch (error) {
    console.error('Error recording attempt:', error);
    return { success: false, error: 'Lỗi ghi nhận kết quả' };
  }
}

/* ───────── Record flashcard action ───────── */

export async function recordFlashcardActionServer(data: {
  vocabularyId: string;
  lessonId: string;
  action: 'HARD' | 'GOOD' | 'EASY';
  sessionId: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await recordFlashcardService(
      session.user.id,
      data.vocabularyId,
      data.lessonId,
      data.action,
      data.sessionId,
    );
    return { success: true };
  } catch (error) {
    console.error('Error recording flashcard action:', error);
    return { success: false, error: 'Lỗi ghi nhận' };
  }
}

/* ───────── Fetch courses for practice list ───────── */

export async function fetchCoursesForPractice() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    // Get enrolled HSK levels → filter courses
    const enrolledLevels = await getStudentEnrolledHskLevels(session.user.id);

    const [courses, progressMap] = await Promise.all([
      getCoursesService(enrolledLevels.length > 0 ? enrolledLevels : undefined),
      getStudentAllLessonProgress(session.user.id),
    ]);

    return { success: true, data: { courses, progressMap } };
  } catch (error) {
    console.error('Error fetching courses for practice:', error);
    return { success: false, error: 'Không thể tải danh sách khóa học' };
  }
}

/* ───────── Refresh lesson progress (refetch latest) ───────── */

export async function refreshLessonProgress(lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const [progress, itemProgress] = await Promise.all([
      getStudentLessonProgress(session.user.id, lessonId),
      getStudentItemProgressForLesson(session.user.id, lessonId),
    ]);

    return { success: true, data: { progress, itemProgress } };
  } catch (error) {
    console.error('Error refreshing progress:', error);
    return { success: false, error: 'Lỗi tải tiến độ' };
  }
}
