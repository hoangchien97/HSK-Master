PRACTICE + PROGRESS (PER USER) – PERFORMANCE OPTIMIZED REQUIREMENTS

Scope: HSK1 → HSK6 (~5000 vocab)
Mỗi user có tiến trình riêng cho Flashcard / Quiz / Listen / Write

Mục tiêu:

Query nhanh

Update nhẹ

Hỗ trợ mix vocab bài trước

Resume từ chưa học

Ôn lại từ đầu lesson

Tối ưu cho scale lớn (5000 vocab + nhiều user)

1. Tổng quan tính năng cần đạt
1.1 Per-user per-vocab per-skill progress

Mỗi user với mỗi vocabulary cần biết:

Flashcard: đã thuộc / chưa

Quiz: tỷ lệ đúng

Listen: đã nghe / hiểu

Write: đã luyện viết / chấm điểm

Phải hiển thị nhanh ở:

Lesson list

Practice tab

Dashboard tiến độ

1.2 Mix vocab bài trước (Interleaving)

Trong lesson hiện tại, hệ thống sẽ thêm một số vocab của bài trước vào queue luyện tập.

Mục tiêu:

Tăng khả năng ghi nhớ

Giảm quên kiến thức cũ

Logic ưu tiên:

Từ bài trước chưa MASTERED

Từ bài trước đến hạn ôn (nextReviewAt <= now)

Random fallback

Số lượng:

Configurable (ví dụ: 3–7 từ)

1.3 Resume: vào lại bài → tiếp tục từ chưa học

Khi user quay lại lesson:

Hệ thống tự động next tới vocab chưa MASTERED theo mode hiện tại

Nếu tất cả đã MASTERED:

Hiển thị trạng thái hoàn thành

Cho phép:

Ôn lại từ đầu

(Optional) Ôn theo lịch due

1.4 Ôn lại từ đầu lesson

Button: “Ôn lại từ đầu”

Hành vi:

Reset pointer của session

Không reset progress DB

User vẫn thấy badge tiến độ hiện tại

Flow chạy lại từ vocab đầu tiên

2. Performance Constraints

Dataset:

~5000 vocab

Nhiều user

Mỗi user có progress riêng

Mục tiêu:

Load lesson practice < 300ms

Update attempt < 150ms

Không scan toàn bộ 5000 vocab

Nguyên tắc:

Chỉ load vocab của lesson hiện tại

N vocab bài trước

Không aggregate toàn bảng mỗi lần

3. Schema Design (Optimized)
3.1 Enums
enum PracticeMode {
  FLASHCARD
  QUIZ
  LISTEN
  WRITE
}

enum MasteryStatus {
  NEW
  LEARNING
  MASTERED
}
3.2 PortalItemSkillProgress

Mỗi record = 1 (studentId, vocabularyId, mode)

model PortalItemSkillProgress {
  id            String        @id @default(cuid())
  studentId     String
  vocabularyId  String
  mode          PracticeMode

  status        MasteryStatus @default(NEW)
  masteryScore  Float         @default(0)

  seenCount     Int           @default(0)
  correctCount  Int           @default(0)
  wrongCount    Int           @default(0)

  lastSeenAt    DateTime?
  nextReviewAt  DateTime?

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([studentId, vocabularyId, mode])
  @@index([studentId, mode, status])
  @@index([studentId, mode, nextReviewAt])
}

Lý do tối ưu:

Query theo (studentId + vocabIds + mode) rất nhanh

Index hỗ trợ filter NEW / LEARNING / MASTERED

Hỗ trợ due review

3.3 PortalLessonProgress (Denormalized)

Để tránh count toàn lesson mỗi lần:

model PortalLessonProgress {
  id             String @id @default(cuid())
  studentId      String
  lessonId       String
  mode           PracticeMode

  totalCount     Int @default(0)
  masteredCount  Int @default(0)
  learningCount  Int @default(0)
  newCount       Int @default(0)

  masteryPercent Float @default(0)
  lastActivityAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, lessonId, mode])
  @@index([studentId, mode])
}

Update incrementally khi status thay đổi.

3.4 PortalLessonSessionState (Resume)
model PortalLessonSessionState {
  id         String @id @default(cuid())
  studentId  String
  lessonId   String
  mode       PracticeMode

  includePrevLessonCount Int @default(3)
  lastVocabularyId String?
  lastIndex        Int @default(0)

  isCompleted Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, lessonId, mode])
}

Giúp:

Resume nhanh

Reset pointer khi ôn lại

4. Queue Generation Logic
BuildQueue(lessonId, studentId, mode)

Bước:

Lấy vocab của lesson hiện tại

Lấy vocab của lesson trước

Fetch progress của student theo mode

Chọn N vocab bài trước theo ưu tiên:

Not MASTERED

Due review

Merge queue:

Inject sau mỗi 3 từ của bài hiện tại

Trả về queue array

5. Resume Logic

Given queue:

Tìm vocab đầu tiên có status != MASTERED

Set pointer tới đó

Nếu không có → isCompleted = true

6. Attempt Update Flow

POST /api/portal/practice/attempt

Body:

{
  "lessonId": "L1",
  "mode": "FLASHCARD",
  "vocabularyId": "V1",
  "isCorrect": true,
  "timeSpentSec": 3
}

Transaction:

Upsert PortalItemSkillProgress

Update counts

Recompute masteryScore + status

Nếu status thay đổi:

Update PortalLessonProgress counters

Update PortalLessonSessionState pointer

Không recalculating toàn lesson.

7. APIs
GET /api/portal/lessons/:lessonId/practice

Return:

lesson summary

queue

pointer

vocab list + progress

POST /api/portal/practice/attempt

Update progress + session state

GET /api/portal/dashboard/progress

Load từ PortalLessonProgress

8. UI Requirements
Lesson list screen

Hiển thị masteryPercent

Mastered / total

Practice page

Hiển thị queue

Badge status

Button:

Chưa thuộc

Đã thuộc

Ôn lại từ đầu

Completed state

Hiển thị:

“Bạn đã hoàn thành bài này”

Buttons:

Ôn lại từ đầu

(Optional) Ôn từ đến hạn

9. Acceptance Criteria

Không query toàn bộ 5000 vocab khi load lesson

Resume chính xác

Interleaving đúng logic

Lesson progress cập nhật chính xác

Update attempt không chậm

Không recalculating full dataset

10. Deliverables cho Copilot

Update schema.prisma

Migration

API routes:

GET lesson practice

POST attempt

GET dashboard progress

Services:

buildQueue()

updateSkillProgress()

updateLessonProgress()

updateSessionState()

Final Goal

Hệ thống phải:

Scale tốt với 5000 vocab

Hỗ trợ nhiều user

Resume mượt

Interleaving thông minh

Không bị slow khi dataset lớn

Code maintainable, dễ mở rộng spaced repetition sau này

UI phản hồi tức thì, trải nghiệm học liền mạch
