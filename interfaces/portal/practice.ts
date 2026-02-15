/**
 * Practice Lesson interfaces
 */

export interface IVocabularyItem {
  id: string
  lessonId: string
  word: string
  pinyin: string | null
  meaning: string
  wordType: string | null
  audioUrl: string | null
}

export interface ILessonInfo {
  id: string
  title: string
  titleChinese: string | null
  description: string | null
  order: number
  courseId: string
  course: {
    id: string
    title: string
    slug: string
    level: string | null
  }
  vocabularies: IVocabularyItem[]
}

export interface IStudentLessonProgress {
  id: string
  studentId: string
  lessonId: string
  learnedCount: number
  masteredCount: number
  totalTimeSec: number
  masteryPercent: number
}

export interface IStudentItemProgress {
  id: string
  studentId: string
  vocabularyId: string
  seenCount: number
  correctCount: number
  wrongCount: number
  masteryScore: number
  status: string // NEW | LEARNING | MASTERED
  lastSeenAt: string | null
  nextReviewAt: string | null
}

export interface IPracticeSession {
  id: string
  studentId: string
  lessonId: string
  mode: string
  startedAt: string
  endedAt: string | null
  durationSec: number
}

export interface IPracticeAttempt {
  id: string
  sessionId: string
  vocabularyId: string
  questionType: string
  userAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  timeSpentSec: number
}

export interface IQuizQuestion {
  vocabularyId: string
  questionType: string
  prompt: string // e.g. the hanzi or the meaning
  options: { key: string; label: string }[]
  correctKey: string
}

export interface IQuizResult {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  score: number // percentage
  timeSpentSec: number
  wrongItems: { word: string; pinyin: string; meaning: string }[]
}

export interface ILessonPracticeData {
  lesson: ILessonInfo
  progress: IStudentLessonProgress | null
  itemProgress: Record<string, IStudentItemProgress> // keyed by vocabularyId
  siblings: { id: string; title: string; order: number }[]
}
