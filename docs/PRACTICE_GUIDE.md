# HSK Practice Feature Guide

## Overview

Hệ thống luyện tập từ vựng HSK sử dụng phương pháp **Spaced Repetition System (SRS)** dựa trên thuật toán SM-2, giúp học sinh ghi nhớ từ vựng hiệu quả và lâu dài.

---

## Cấu trúc trang luyện tập

### URL Pattern
```
/portal/student/practice                    # Danh sách bài học
/portal/student/practice/hsk1/[lessonSlug]  # Chi tiết bài luyện tập
```

### Layout
```
┌─────────────────────────────────────────────────┐
│ Header: Bài [order]: [title]  [HSK Level] [n từ]│
├─────────────────────────────────────────────────┤
│ Progress Card                                   │
│ ┌─────┐ ┌─────────────────────────────────────┐ │
│ │ 75% │ │ Đã học: 15/20  Thành thạo: 12       │ │
│ └─────┘ │ Thời gian: 45m                      │ │
│         └─────────────────────────────────────┘ │
│ Per-mode progress bars:                         │
│ [Flashcard ██████░░ 75%] [Quiz ████░░░░ 50%]   │
│ [Nghe ███░░░░░░ 35%]     [Viết ████████ 100%] │
├─────────────────────────────────────────────────┤
│ [Tra cứu] [Flashcard] [Quiz] [Nghe] [Viết]     │
├─────────────────────────────────────────────────┤
│                                                 │
│              Tab Content Area                   │
│                                                 │
├─────────────────────────────────────────────────┤
│ Các bài trong khóa: [Bài 1] [Bài 2] [Bài 3]... │
└─────────────────────────────────────────────────┘
```

---

## 5 Chế độ luyện tập

### 1. Tra cứu (Lookup)
Xem danh sách từ vựng với thông tin chi tiết.

**Tính năng:**
- Tìm kiếm theo chữ Hán, Pinyin, nghĩa
- **Lọc theo trạng thái**: Tất cả / Chưa học / Đang học / Thành thạo
- Xem chi tiết từ vựng trong drawer
- Phát âm bằng Web Speech API
- Hiển thị ví dụ câu
- Theo dõi tiến độ học

### 2. Flashcard
Luyện ghi nhớ theo phương pháp SRS với 4 nút đánh giá.

**Nút đánh giá (SM-2):**
| Nút | Phím tắt | Ý nghĩa | Điều chỉnh điểm |
|-----|----------|---------|-----------------|
| ↺ Quên | 1 / ← | Hoàn toàn quên | -25%, ôn sau 1 phút |
| ✗ Khó | 2 / ↓ | Nhớ nhưng khó | -10%, ôn sau 10 phút |
| ○ Tạm ổn | 3 / ↑ | Nhớ được | +10%, ôn sau 1 ngày |
| ✓ Dễ | 4 / → | Nhớ rõ | +15%, ôn sau 3 ngày |

**Flow:**
1. Hiển thị mặt trước (chữ Hán)
2. Nhấn card để lật xem nghĩa
3. Chọn mức độ nhớ
4. Tự động chuyển từ tiếp theo

**Tính năng bổ sung:**
- Hiển thị từ vựng bài trước để ôn tập (interleaving)
- Hiển thị tiến độ thành thạo %
- Trộn thứ tự từ vựng

### 3. Quiz
Trắc nghiệm 4 đáp án với nhiều dạng câu hỏi.

**Dạng câu hỏi:**
- MCQ_MEANING: Chọn nghĩa đúng cho chữ Hán
- MCQ_HANZI: Chọn chữ Hán đúng cho nghĩa
- MCQ_PINYIN: Chọn Pinyin đúng
- MCQ_EXAMPLE: Chọn từ vựng phù hợp trong câu

**Tính năng:**
- Phím tắt 1-4 để chọn đáp án
- Auto-advance sau 3 giây khi trả lời đúng
- Ôn lại từ sai sau khi hoàn thành

### 4. Nghe (Listen)
Nghe phát âm và chọn nghĩa đúng.

**Flow:**
1. Nghe audio (bắt buộc trước khi chọn đáp án)
2. Chọn đáp án
3. Xem transcript nếu cần

**Tính năng:**
- Khóa đáp án cho đến khi nghe
- Hiển thị/ẩn transcript
- Phím tắt Space để phát audio

### 5. Viết (Write)
Luyện viết chữ Hán với nhiều chế độ.

**Chế độ:**
- Animation: Xem nét viết
- Practice: Luyện viết theo nét (hanzi-writer)
- Type Pinyin: Gõ phiên âm

---

## Thuật toán SRS

### Mastery Score
- Điểm thành thạo: 0-100%
- Ngưỡng thành thạo: 80%

### Trạng thái từ vựng
| Status | Điều kiện | Màu |
|--------|-----------|-----|
| NEW | masteryScore = 0 | Xám |
| LEARNING | 0 < masteryScore < 80% | Vàng |
| MASTERED | masteryScore >= 80% | Xanh lá |

### Tính toán điểm
```
Flashcard:
  AGAIN: -25%  → ôn sau 1 phút
  HARD:  -10%  → ôn sau 10 phút
  GOOD:  +10%  → ôn sau 1 ngày
  EASY:  +15%  → ôn sau 3 ngày

Quiz/Listen:
  Đúng:  +20%/+15%
  Sai:   -15%/-10%

Write:
  Đúng:  +25%
  Sai:   -10%
```

---

## Database Schema

### Tables chính

```prisma
// Tiến độ tổng hợp theo bài
PortalLessonProgress {
  studentId, lessonId
  learnedCount, masteredCount
  totalTimeSec, masteryPercent
}

// Tiến độ từng từ vựng (tổng hợp)
PortalItemProgress {
  studentId, vocabularyId
  seenCount, correctCount, wrongCount
  masteryScore, status
  lastSeenAt, nextReviewAt
}

// Tiến độ từng từ vựng theo mode
PortalItemSkillProgress {
  studentId, vocabularyId, mode
  seenCount, correctCount, wrongCount
  masteryScore, status
  lastSeenAt, nextReviewAt
}

// Tiến độ bài học theo mode
PortalLessonSkillProgress {
  studentId, lessonId, mode
  totalCount, masteredCount, learningCount, newCount
  masteryPercent
}

// Trạng thái session (resume)
PortalLessonSessionState {
  studentId, lessonId, mode
  lastIndex, lastVocabularyId, isCompleted
}
```

---

## API Endpoints

### Server Actions
```typescript
// Practice
startPracticeSessionAction(lessonId, mode)
finishPracticeSessionAction(sessionId, duration)
recordVocabSeenAction(vocabId, lessonId)

// Skill Progress
fetchPracticeQueue(lessonIdOrSlug, mode)
recordSkillAttemptAction({ lessonId, mode, vocabId, isCorrect, ... })
recordFlashcardSkillAction({ lessonId, vocabId, action, ... })
resetPracticeSessionAction(lessonId, mode)
refreshSkillProgress(lessonId, mode)
refreshAllModeSkillProgress(lessonId)
```

---

## Phím tắt

| Tab | Phím | Hành động |
|-----|------|-----------|
| Flashcard | Space | Lật card |
| Flashcard | 1 / ← | Quên |
| Flashcard | 2 / ↓ | Khó |
| Flashcard | 3 / ↑ | Tạm ổn |
| Flashcard | 4 / → | Dễ |
| Quiz | 1-4 | Chọn đáp án |
| Quiz | Enter | Câu tiếp theo |
| Listen | Space | Phát audio |
| Listen | 1-4 | Chọn đáp án |
| Write | Enter | Từ tiếp theo |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: HeroUI (NextUI fork) + Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Speech**: Web Speech API
- **Character Writing**: hanzi-writer

---

## Folder Structure

```
app/(portal)/portal/[role]/practice/
  page.tsx                         # Danh sách bài học
  [level]/[lessonSlug]/page.tsx    # Chi tiết bài luyện tập

components/portal/practice/
  LessonPracticeView.tsx           # Client component chính
  PracticeListView.tsx             # Danh sách bài học
  PracticeCourseAccordion.tsx      # Accordion theo khóa
  PracticeLessonItem.tsx           # Item bài học
  ProgressCard.tsx                 # Card tiến độ
  tabs/
    LookupTab.tsx                  # Tab tra cứu
    FlashcardTab.tsx               # Tab flashcard
    QuizTab.tsx                    # Tab quiz
    ListenTab.tsx                  # Tab nghe
    WriteTab.tsx                   # Tab viết
    write/
      AnimationMode.tsx
      PracticeStrokeMode.tsx
      TypePinyinMode.tsx
  shared/
    VocabItem.tsx
    McqOptions.tsx
    QuizResultScreen.tsx
    TabErrorBoundary.tsx

services/portal/
  practice.service.ts              # Data layer chung
  practice-skill.service.ts        # Per-mode skill tracking

actions/
  practice.actions.ts              # Server actions chung
  practice-skill.actions.ts        # Skill-related actions

constants/portal/
  practice.ts                      # Constants & labels

interfaces/portal/
  practice.ts                      # TypeScript interfaces
```

---

## Tính năng nổi bật

1. **SRS Algorithm**: Thuật toán SM-2 đơn giản hóa với 4 mức đánh giá
2. **Per-mode Progress**: Theo dõi tiến độ riêng biệt cho từng chế độ
3. **Interleaving**: Xen kẽ từ vựng bài trước để ôn tập
4. **Resume Support**: Tiếp tục từ vị trí đã dừng
5. **Keyboard Shortcuts**: Hỗ trợ phím tắt đầy đủ
6. **Responsive**: Giao diện tối ưu cho mobile và desktop
7. **Error Boundaries**: Xử lý lỗi gracefully cho từng tab

---

## Hướng phát triển

### Phase 2 (AI Extension)
- AI Example Generator
- AI Pronunciation Feedback
- AI Quiz Generator
- AI Sentence Correction

### Future
- Vocabulary graph learning (synonyms, antonyms)
- Voice recording & comparison
- Gamification (streaks, achievements)
- Spaced repetition calendar view
