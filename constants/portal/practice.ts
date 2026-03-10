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
  GOOD = "GOOD",
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

/* ═══════════════════════════════════════════════════════════════
 *  PRACTICE_LABELS — single source of truth for all UI text.
 *  Import { PRACTICE_LABELS as L } then use L.nav.prev etc.
 * ═══════════════════════════════════════════════════════════════ */

export const PRACTICE_LABELS = {
  /* ── Navigation (shared across tabs) ── */
  nav: {
    prev: "Trước",
    next: "Tiếp",
    viewResult: "Xem kết quả",
    restart: "Làm lại",
    startOver: "Ôn lại từ đầu",
    skip: "Bỏ qua",
    shuffle: "Trộn",
    nextWord: "Từ tiếp theo",
    nextQuestion: "Câu tiếp theo",
  },

  /* ── Feedback (quiz / listen / write) ── */
  feedback: {
    correct: "✓ Chính xác!",
    wrong: "✗ Sai rồi",
    answerIs: "Đáp án:",
    autoNextTpl: (sec: number) => `Tự động chuyển sau ${sec}s…`,
  },

  /* ── Empty states ── */
  empty: {
    noVocab: "Bài học này chưa có từ vựng",
    noVocabFound: "Không tìm thấy từ vựng",
    minVocabQuiz: "Bài học cần ít nhất 2 từ vựng để tạo Quiz",
    minVocabListen: "Cần ít nhất 2 từ vựng có audio để tạo bài nghe",
    noWriteVocab: "Chưa có từ vựng cho bài học này",
  },

  /* ── Flashcard tab ── */
  flashcard: {
    completionTitle: "Hoàn thành Flashcard!",
    knownLabel: "Đã thuộc:",
    unknownLabel: "Chưa thuộc:",
    flipHint: "Nhấn để xem nghĩa",
    flipBackHint: "Nhấn để xem chữ Hán",
    reviewPrevLesson: "📖 Ôn bài trước",
    hardBtn: "✗ Chưa thuộc",
    goodBtn: "○ Tạm ổn",
    easyBtn: "✓ Đã thuộc",
    exampleLabel: "Ví dụ:",
    phaseTpl: (count: number) => `📖 Ôn lại ${count} từ chưa thuộc`,
    toastReviewTpl: (count: number) => `Ôn lại ${count} từ chưa thuộc 📖`,
    toastCompleteTpl: (count: number) => `Hoàn thành! Đã thuộc tất cả ${count} từ 🎉`,
    toastStillUnknownTpl: (count: number) => `Còn ${count} từ chưa thuộc, tiếp tục ôn tập!`,
    toastCompleteAll: "Hoàn thành tất cả! 🎉",
  },

  /* ── Quiz tab ── */
  quiz: {
    questionLabel: "Câu",
    retryTpl: (count: number) => `📝 Ôn lại ${count} từ sai`,
  },

  /* ── Listen tab ── */
  listen: {
    chipLabel: "Nghe & chọn nghĩa",
    instructionListened: "Nghe thêm lần nữa rồi chọn đáp án nhé!",
    instructionNotListened: "Nhấn nút để nghe trước khi chọn đáp án",
    lockNotice: "Hãy nghe audio trước khi chọn đáp án",
    showTranscript: "Xem transcript",
    hideTranscript: "Ẩn transcript",
    retryTpl: (count: number) => `🎧 Ôn lại ${count} từ sai`,
  },

  /* ── Write tab ── */
  write: {
    wordLabel: "Từ cần luyện",
    typePinyinChip: "Gõ Pinyin",
    practiceWriteChip: "Luyện viết",
    animPrompt: "Xem nét viết",
    strokePrompt: "Luyện viết theo nét",
    typePinyinPromptTpl: (char: string) => `Gõ phiên âm Pinyin cho chữ ${char}`,
    pinyinInputLabel: "Nhập Pinyin",
    pinyinPlaceholder: "Nhập Pinyin...",
    checkBtn: "Kiểm tra",
    hintBtnTpl: (remaining: number) => `Gợi ý (${remaining} lượt)`,
    hintPrefix: "Bắt đầu bằng:",
    unsupportedChar: "Không hỗ trợ ký tự này",
    continueBtn: "Tiếp tục",
    pauseBtn: "Tạm dừng",
    practiceBtn: "Luyện viết",
    strokePerfect: "Hoàn hảo! 🎉",
    strokeGoodTpl: (mistakes: number) => `Tốt! (${mistakes} lỗi)`,
    strokeNeedPracticeTpl: (mistakes: number) => `${mistakes} lỗi — Luyện thêm nhé`,
    retryTpl: (count: number) => `✍️ Ôn lại ${count} từ sai`,
  },

  /* ── Result summary (shared ResultScreen component) ── */
  result: {
    scoreTpl: (correct: number, total: number) => `Bạn trả lời đúng ${correct}/${total} câu`,
    scoreLabel: "Điểm số",
    timeLabel: "Thời gian",
    retryWrongTpl: (count: number) => `Ôn lại ${count} từ sai`,
    retryAllBtn: "Làm lại tất cả",
  },

  /* ── Result screen titles (by performance) ── */
  resultTitles: {
    excellent: "Xuất sắc! 🎉",
    good: "Khá tốt! 👍",
    fair: "Tạm ổn",
    needPractice: "Cần luyện thêm",
    listenNeedPractice: "Luyện nghe thêm nhé 💪",
    writeNeedPractice: "Luyện viết thêm nhé 💪",
    flashcardComplete: "Hoàn thành Flashcard! 🎉",
    listenComplete: "Hoàn thành bài nghe! 🎉",
    writeComplete: "Hoàn thành bài viết! 🎉",
  },

  /* ── Progress card ── */
  progress: {
    learnedLabel: "Đã học",
    masteredLabel: "Thành thạo",
    timeLabel: "Thời gian",
    remainingTpl: (count: number) => `Còn ${count} từ`,
    allLearned: "Đã học hết! 🎉",
    ariaLabel: "Tiến độ thành thạo",
  },

  /* ── Completion overlay ── */
  completion: {
    heading: "Hoàn thành xuất sắc! 🎉",
    descriptionTpl: (modeLabel: string) =>
      `Tất cả từ vựng đã đạt mức thành thạo cho chế độ ${modeLabel}`,
    resetBtn: "Ôn lại từ đầu",
    resetToast: "Đã reset, bắt đầu ôn lại từ đầu!",
  },

  /* ── Error boundary ── */
  error: {
    headingTpl: (tabName?: string) =>
      `Đã xảy ra lỗi${tabName ? ` trong ${tabName}` : ""}`,
    helpText: "Bạn có thể thử lại hoặc chuyển sang tab khác.",
    retryBtn: "Thử lại",
  },

  /* ── Lookup tab ── */
  lookup: {
    searchPlaceholder: "Tìm kiếm từ vựng...",
    countTpl: (count: number) => `${count} từ vựng`,
    drawerTitle: "Chi tiết từ vựng",
    playAudioBtn: "Phát âm",
    wordTypeLabel: "Loại từ",
    exampleLabel: "Ví dụ",
    progressLabel: "Tiến độ",
    seenLabel: "Lần xem",
    correctLabel: "Đúng",
    wrongLabel: "Sai",
    statusLabel: "Trạng thái",
    masteryTpl: (pct: number) => `${pct}% thành thạo`,
  },

  /* ── Lesson practice view (parent) ── */
  lessonView: {
    tabsAriaLabel: "Chế độ luyện tập",
    loadingMessage: "Đang tải...",
    lessonPrefix: "Bài",
    wordCountSuffix: "từ",
    siblingHeading: "Các bài trong khóa",
  },

  /* ── Tab display labels ── */
  tabLabels: {
    [PracticeMode.LOOKUP]: "Tra cứu",
    [PracticeMode.FLASHCARD]: "Flashcard",
    [PracticeMode.QUIZ]: "Quiz",
    [PracticeMode.LISTEN]: "Nghe",
    [PracticeMode.WRITE]: "Viết",
  } as Record<PracticeMode, string>,
} as const
