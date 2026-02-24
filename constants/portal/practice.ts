/**
 * Practice feature constants
 * Centralised values for all practice tabs — avoids hardcoded strings.
 */

/* ───────── Flashcard ───────── */

export enum FlashcardPhase {
  MAIN = "MAIN",
  REVIEW_UNKNOWN = "REVIEW_UNKNOWN",
}

export enum FlashcardAction {
  HARD = "HARD",
  EASY = "EASY",
}

/* ───────── Write ───────── */

export enum WriteMode {
  ANIMATION = "ANIMATION",
  PRACTICE = "PRACTICE",
  TYPE_PINYIN = "TYPE_PINYIN",
}

/* ───────── Tab keys (shared by view + URL param) ───────── */

import { PracticeMode } from "@/enums/portal/common"

export const TAB_KEYS = [
  PracticeMode.LOOKUP,
  PracticeMode.FLASHCARD,
  PracticeMode.QUIZ,
  PracticeMode.LISTEN,
  PracticeMode.WRITE,
] as const

export type PracticeTabKey = PracticeMode

export const DEFAULT_TAB: PracticeTabKey = PracticeMode.LOOKUP

/* ───────── Quiz / Listen ───────── */

/** Milliseconds before auto-advancing to next question after answer */
export const AUTO_NEXT_DELAY_MS = 3000

/** Quiz question type → Vietnamese label for header chip */
export const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ_MEANING: "Chọn nghĩa đúng",
  MCQ_HANZI: "Chọn Hán tự đúng",
  MCQ_PINYIN: "Chọn Pinyin đúng",
  MCQ_EXAMPLE: "Từ vựng trong câu",
}
