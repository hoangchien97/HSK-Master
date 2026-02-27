/**
 * Practice Lesson interfaces
 */

export interface IVocabularyItem {
  id: string
  lessonId: string
  word: string
  pinyin: string | null
  meaning: string
  meaningVi: string | null
  wordType: string | null
  exampleSentence: string | null
  examplePinyin: string | null
  exampleMeaning: string | null
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
  siblings: { id: string; slug: string; title: string; order: number }[]
}

/* ───────── Per-mode skill progress interfaces ───────── */

export interface ISkillProgressRecord {
  vocabularyId: string
  status: string // NEW | LEARNING | MASTERED
  masteryScore: number
  seenCount: number
  correctCount: number
  wrongCount: number
  lastSeenAt: string | null
  nextReviewAt: string | null
}

export interface ILessonSkillProgress {
  id: string
  studentId: string
  lessonId: string
  mode: string // FLASHCARD | QUIZ | LISTEN | WRITE
  totalCount: number
  masteredCount: number
  learningCount: number
  newCount: number
  masteryPercent: number
  lastActivityAt: string | null
}

export interface ISessionState {
  id: string
  lastIndex: number
  lastVocabularyId: string | null
  isCompleted: boolean
}

export interface IQueueVocabItem {
  id: string
  lessonId: string
  word: string
  pinyin: string | null
  meaning: string
  meaningVi: string | null
  wordType: string | null
  exampleSentence: string | null
  examplePinyin: string | null
  exampleMeaning: string | null
  isFromPrevLesson: boolean
}

export interface IPracticeQueueData {
  lesson: {
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
    vocabularyCount: number
  }
  queue: IQueueVocabItem[]
  pointer: number
  isCompleted: boolean
  skillProgressMap: Record<string, ISkillProgressRecord>
  sessionState: ISessionState
  siblings: { id: string; slug: string | null; title: string; order: number }[]
}

export interface ISkillAttemptResult {
  newStatus: string
  statusChanged: boolean
  isCompleted: boolean
}

/** Dashboard: per-lesson grouped by mode */
export interface IDashboardSkillProgress {
  courses: Array<{
    id: string
    title: string
    slug: string
    level: string | null
    lessons: Array<{
      id: string
      slug: string | null
      title: string
      order: number
      _count: { vocabularies: number }
    }>
  }>
  skillProgressMap: Record<string, Record<string, ILessonSkillProgress>>
}
