# HSK Portal — Spec feature luyện tập cho Học sinh (Lesson Practice)

> Mục tiêu: Trong **Lesson detail** (ví dụ `/hsk/hsk1/lesson/4`) học sinh có thể luyện **Tra cứu / Flashcard / Quiz / Nghe / Đọc / Nói / Viết**.  
> Có **progress**, **lịch sử luyện tập**, **độ thành thạo** theo từng từ vựng/câu, và **thông báo** (tuỳ chọn) để nhắc học.

---

## 0) Phạm vi V1 (để build nhanh)

### V1 gồm
- Lesson page có **Tabs**: `Tra cứu` · `Flashcard` · `Quiz` · `Nghe` · `Viết` (và `Đọc/Nói` nếu kịp, hoặc để V2).
- Tracking tiến độ học:
  - `Đã học` (count)
  - `Thành thạo` (count)
  - `Thời gian` (seconds)
  - `Độ thành thạo` (%)
- Tra cứu từ vựng trong lesson + xem chi tiết từ.
- Flashcard theo lesson (front/back) + thao tác: `Đã biết / Chưa biết` (spaced repetition nhẹ).
- Quiz (MCQ + chọn nghĩa/hanzi/pinyin/điền chỗ trống đơn giản).
- Nghe (audio + chọn đáp án hoặc gõ).
- Viết (gõ pinyin/hanzi theo đáp án, chấm đúng/sai).
- Lưu `Attempt/Session` vào DB, tổng hợp progress.

### V2 (để sau)
- Nói: speech-to-text + scoring phát âm (phụ thuộc vendor/SDK).
- Viết nâng cao: vẽ nét hanzi (stroke order) + chấm nét.
- Quiz adapt theo “độ thành thạo”, nhắc lại từ yếu.
- Offline / cache audio.
- Leaderboard / streak.

---

## 1) Actors & quyền

### Student
- Có thể xem lesson nếu đã enroll khóa/level tương ứng (rule theo dự án).
- Luyện tập các mode; dữ liệu progress chỉ thuộc về student đó.

### Teacher/Admin (optional)
- Xem báo cáo lớp (V2): ai học gì, điểm quiz, từ yếu.

---

## 2) UI/UX requirement (Lesson Practice)

### 2.1 Lesson Header + Progress Card
**Progress Card** hiển thị:
- `Độ thành thạo`: 0–100%
- 3 stats:
  - `Đã học` (số lượng vocab/câu đã tương tác ít nhất 1 lần)
  - `Thành thạo` (số vocab/câu đạt ngưỡng mastery)
  - `Thời gian` (tổng thời gian học trong lesson)

**Rule tính (V1, đơn giản):**
- `learnedCount`: số item có `seenCount >= 1`
- `masteredCount`: số item có `masteryScore >= 0.8` (hoặc `>= 80`)
- `masteryPercent = masteredCount / totalItems * 100`
- Hiển thị `Còn X từ chưa học` (total - learnedCount)

### 2.2 Tabs (navigation)
- Tabs nằm ngang (như UI mẫu): `Tra cứu | Flashcard | Quiz | Nghe | Viết` (có thể thêm `Đọc | Nói`)
- Mỗi tab là 1 route con (recommended):
  - `/hsk/hsk1/lesson/4?tab=vocab`
  - `/hsk/hsk1/lesson/4?tab=flashcard`
  - `/hsk/hsk1/lesson/4?tab=quiz`
  - `/hsk/hsk1/lesson/4?tab=listen`
  - `/hsk/hsk1/lesson/4?tab=write`

**Rule:**
- Default tab: `Tra cứu`
- Maintain state tab in URL để share link.

---

## 3) Data model (core)

> Tên bảng/fields có thể đổi theo schema hiện có. V1 ưu tiên tối giản, dễ seed.

### 3.1 LessonItem (nội dung luyện tập)
Một lesson có danh sách item, thường là **Vocabulary** (từ vựng) và/hoặc **Sentence** (câu).

**Fields (gợi ý):**
- `id`
- `lessonId`
- `type`: `VOCAB | SENTENCE`
- `hanzi` (中文)
- `pinyin`
- `meaningVi` (tiếng Việt)
- `audioUrl` (optional)
- `tags` (optional: danh từ, động từ, nghe, đọc, viết...)

### 3.2 StudentLessonProgress (tổng hợp)
- `id`
- `studentId`
- `lessonId`
- `learnedCount`
- `masteredCount`
- `totalTimeSec`
- `masteryPercent`
- `updatedAt`

> Có thể compute realtime, nhưng V1 lưu sẵn để load nhanh.

### 3.3 StudentItemProgress (theo từng từ/câu)
- `id`
- `studentId`
- `lessonItemId`
- `seenCount` (int)
- `correctCount` (int)
- `wrongCount` (int)
- `masteryScore` (0..1 hoặc 0..100)
- `lastSeenAt`
- `nextReviewAt` (for spaced repetition, optional)
- `status`: `NEW | LEARNING | MASTERED`

**Rule update masteryScore (V1):**
- mỗi attempt đúng: +0.15 (cap 1.0)
- sai: -0.10 (floor 0)
- status:
  - `NEW` nếu seenCount = 0
  - `LEARNING` nếu 0 < masteryScore < 0.8
  - `MASTERED` nếu masteryScore >= 0.8

### 3.4 PracticeSession (ghi nhận 1 lần luyện)
- `id`
- `studentId`
- `lessonId`
- `mode`: `LOOKUP | FLASHCARD | QUIZ | LISTEN | READ | SPEAK | WRITE`
- `startedAt`, `endedAt`
- `durationSec`
- `meta` (json) — settings, totalQuestions, etc.

### 3.5 PracticeAttempt (mỗi câu hỏi/interaction)
- `id`
- `sessionId`
- `lessonItemId`
- `questionType` (MCQ_MEANING, MCQ_PINYIN, TYPE_HANZI, TYPE_PINYIN, LISTEN_MCQ, ...)
- `userAnswer` (string/json)
- `correctAnswer` (string/json)
- `isCorrect` (bool)
- `timeSpentSec`
- `createdAt`

---

## 4) Spec theo từng mode (Student features)

## 4.1 Tra cứu (Lookup)
**Mục tiêu:** xem list vocab/câu của lesson + search + xem detail.

### UI
- Search input: “Tìm kiếm từ vựng…”
- List item:
  - Hanzi lớn
  - pinyin + meaningVi
  - badge type/tag (vd: danh từ)
  - icon loa để play audio (nếu có)
- Click item mở drawer/modal detail:
  - hanzi, pinyin, nghĩa, ví dụ (nếu có)
  - play audio
  - actions: `Đánh dấu đã học` (optional)

### Logic
- Khi student mở item detail hoặc play audio:
  - upsert `StudentItemProgress.seenCount += 1`, set `lastSeenAt`
  - update `StudentLessonProgress.learnedCount`

---

## 4.2 Flashcard
**Mục tiêu:** học theo thẻ, lật mặt, đánh giá “biết/chưa biết”.

### UI
- Card:
  - Front: Hanzi (hoặc nghĩa, tùy setting)
  - Button `Lật`
  - Back: pinyin + nghĩa + audio
- Actions:
  - `Chưa biết` (Hard)
  - `Tạm ổn` (Good)
  - `Đã biết` (Easy)
- Progress mini: “3/10” + time

### Settings (optional V1)
- `Front side`: Hanzi | Meaning
- `Shuffle` toggle

### Logic spaced repetition (V1-lite)
- `Chưa biết`: masteryScore -0.1, nextReviewAt = now + 10m
- `Tạm ổn`: masteryScore +0.1, nextReviewAt = now + 1d
- `Đã biết`: masteryScore +0.15, nextReviewAt = now + 3d
- Mỗi action tạo 1 `PracticeAttempt`.

---

## 4.3 Quiz
**Mục tiêu:** kiểm tra nhanh theo lesson.

### Question types (V1)
- `MCQ_MEANING`: given Hanzi -> chọn nghĩa đúng (4 options)
- `MCQ_HANZI`: given nghĩa -> chọn Hanzi đúng
- `MCQ_PINYIN`: given Hanzi -> chọn pinyin đúng
- `FILL_BLANK_SIMPLE`: câu có chỗ trống -> chọn từ đúng (optional)

### UI
- Header: số câu `current/total`, timer (optional)
- Question card + options
- Feedback sau chọn:
  - đúng: tick
  - sai: highlight đáp án đúng
- End screen:
  - score (x/y)
  - time
  - list từ sai để “Ôn lại”

### Logic generate options (V1)
- Lấy pool items trong lesson.
- Với MCQ:
  - 1 correct + 3 distractors random khác.
- Ưu tiên items `status != MASTERED` (nếu có data), còn không random.

### Scoring & progress
- Mỗi câu lưu `PracticeAttempt`, update `StudentItemProgress` theo đúng/sai.
- `StudentLessonProgress.masteryPercent` update.

---

## 4.4 Nghe (Listening)
**Mục tiêu:** nghe audio và chọn/gõ đáp án.

### Content source
- Dùng `LessonItem.audioUrl` (nếu có).
- Nếu chưa có audio sẵn:
  - V1 có thể dùng TTS server-side/edge (tuỳ bạn), nhưng recommend V2.

### UI (V1)
- Nút play/pause, replay
- Question:
  - dạng A: nghe -> chọn Hanzi đúng (MCQ_HANZI_BY_AUDIO)
  - dạng B: nghe -> chọn nghĩa đúng (MCQ_MEANING_BY_AUDIO)
- Có thể có “Hiện transcript” (toggle) — default OFF.

### Logic
- Attempt đúng/sai update giống Quiz.
- Nếu student bật transcript: vẫn cho điểm nhưng có thể giảm mastery gain (optional rule).

---

## 4.5 Đọc (Reading) — (optional V1, tốt nhất V2)
**Mục tiêu:** đọc câu/đoạn ngắn và trả lời.

### V1 minimal
- Hiển thị 1 câu (LessonItem type SENTENCE)
- Câu hỏi MCQ nghĩa hoặc chọn từ đúng.

---

## 4.6 Nói (Speaking) — V2 recommended
**Mục tiêu:** luyện phát âm.

### V2 options
- Browser SpeechRecognition (Web Speech API) — phụ thuộc Chrome, chất lượng không đồng đều.
- Vendor: Azure Speech / Google Speech / iFlyTek… (tuỳ budget).

### Spec scoring (V2)
- `pronunciationScore` 0..100
- `fluencyScore`, `accuracyScore` (optional)
- Attempt store audio blob url (optional, privacy)

---

## 4.7 Viết (Writing)
**Mục tiêu:** luyện gõ đáp án.

### V1 types
- `TYPE_PINYIN`: given Hanzi -> nhập pinyin
- `TYPE_HANZI`: given nghĩa/pinyin -> nhập Hanzi
- Hint button:
  - show first char / show pinyin (limit 1-2 lần)

### UI
- Prompt + input
- Submit
- Feedback đúng/sai + show đáp án
- “Tiếp theo”

### Logic check (V1)
- Normalize:
  - trim, lowercase for pinyin
  - remove tone marks (optional, nếu muốn dễ)
- Hanzi: exact match.
- Update masteryScore based on correctness.

---

## 5) Notifications (tuỳ chọn, nếu bạn muốn có “nhắc học”)

### Notification types (student practice)
- `PRACTICE_STREAK_REMINDER` (daily)
- `LESSON_REVIEW_DUE` (khi có items nextReviewAt <= now)
- `QUIZ_RESULT_READY` (nếu có chấm async, thường không cần)

> V1 có thể chỉ làm **in-app banner** “Bạn có X từ đến hạn ôn lại”.

---

## 6) APIs (Next.js route handlers) — đề xuất

### Lesson content
- `GET /api/lessons/:lessonId/items`
- `GET /api/lessons/:lessonId/progress/me`

### Practice session
- `POST /api/practice/sessions`
  - body: `lessonId`, `mode`
  - return: `sessionId`
- `POST /api/practice/attempts`
  - body: `sessionId`, `lessonItemId`, `questionType`, `userAnswer`, `isCorrect`, `timeSpentSec`
- `POST /api/practice/sessions/:id/finish`
  - body: `durationSec`

### Progress
- `PATCH /api/progress/item`
  - upsert + update masteryScore/nextReviewAt
- `GET /api/progress/review-queue?lessonId=...`
  - items due for review (optional)

---

## 7) Acceptance Criteria (testable)

### Tra cứu
- Search theo hanzi/pinyin/meaningVi hoạt động.
- Click item mở detail, play audio ok.
- Khi open/play, learnedCount tăng đúng.

### Flashcard
- Lật card hoạt động.
- Chọn Easy/Good/Hard update progress + tạo attempt.
- Khi đạt mastery >= 0.8 → item chuyển MASTERED.

### Quiz
- Tạo 10 câu (hoặc totalItems) có 4 đáp án/câu.
- Kết quả tổng kết đúng.
- Lưu attempts đầy đủ.

### Nghe
- Play audio không giật.
- Chọn đáp án, có feedback.
- Lưu attempts.

### Viết
- Nhập đáp án, normalize pinyin, chấm đúng/sai.
- Lưu attempts.

---

## 8) Edge cases
- Lesson không có audioUrl: tab Nghe show empty state + CTA “Chưa có audio”.
- Lesson ít hơn 4 items: MCQ fallback (giảm options).
- Student reload giữa session: session có thể resume hoặc auto-finish.
- File/audio load fail: retry + toast.

---

## 9) Glossary (enum)

### PracticeMode
- `LOOKUP`
- `FLASHCARD`
- `QUIZ`
- `LISTEN`
- `READ`
- `SPEAK`
- `WRITE`

### ItemProgressStatus
- `NEW`
- `LEARNING`
- `MASTERED`

### QuestionType (sample)
- `MCQ_MEANING`
- `MCQ_HANZI`
- `MCQ_PINYIN`
- `MCQ_MEANING_BY_AUDIO`
- `MCQ_HANZI_BY_AUDIO`
- `TYPE_PINYIN`
- `TYPE_HANZI`

---

## 10) Vibe-coding TODO checklist (dev-ready)
- [ ] Add tab routing (query param `tab`)
- [ ] Implement `LessonProgressCard`
- [ ] Build `LookupTab` + search
- [ ] Build `FlashcardTab` + card flip + actions
- [ ] Build `QuizTab` + generator + result
- [ ] Build `ListenTab` + audio player + MCQ
- [ ] Build `WriteTab` + input + validator
- [ ] Create DB tables: StudentLessonProgress, StudentItemProgress, PracticeSession, PracticeAttempt
- [ ] Implement API routes + service layer update progress
- [ ] Add toasts + loading states + empty states

