# HSK Portal – Vocabulary Practice (Tra cứu / Flashcard / Quiz / Nghe / Viết) – Full Spec

> Mục tiêu: implement bộ tính năng luyện tập từ vựng HSK1 → HSK6 giống UI mock (Tra cứu, Flashcard, Quiz, Nghe, Viết), có **audio nghe thử** (từ + câu ví dụ), tracking tiến độ, thống kê % bài học, % khóa, và cho phép **next bài** để ôn luyện tiếp.

## 0) UI/UX baseline

- Font family (toàn portal):
  ```css
  font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
  ```
- Các tab luyện tập trong màn Lesson Detail:
  - Tra cứu (Dictionary/List)
  - Flashcard
  - Quiz
  - Nghe
  - Viết
- Nguyên tắc audio:
  - Chỉ phát **1 audio tại 1 thời điểm** (play mới sẽ stop audio cũ)
  - Có trạng thái: `ready | generating | error | none`
  - Nếu audio chưa có thì **queue generate** (TTS) và UI hiển thị “Đang tạo audio…”

## 1) Scope & Roadmap

### Phase 1 – MVP ổn định

- Seed vocab từ **complete-hsk-vocabulary** (HSK 2.0 old 1–6)
- Add `pinyin` + `meaning_en`
- Generate audio bằng **TTS** (word audio) → lưu Supabase Storage
- Luyện viết stroke order bằng **HanziWriter**
- Flashcard + Quiz
- Basic progress tracking (đã học / đúng / sai / mastery)

### Phase 2 – nâng cấp chất lượng

- Thêm **example curated** (câu ví dụ) + audio ví dụ
- Thêm **meaning_vi** chuẩn (dịch curated)
- Thêm dialogue theo lesson (HSK Standard Course hoặc tự biên soạn)
- Thêm grammar notes theo lesson
- (Optional) luyện nói: Speech recognition (Web Speech API)

## 2) Data sources (tham khảo)

- **Pinyin + Meaning EN + POS**: CC-CEDICT
- **TTS**: Google/Azure/Edge TTS (khuyến nghị: chọn 1 provider duy nhất cho MVP)
- **Example sentence**: Tatoeba (Phase 2) + curated manual
- **Stroke order**: HanziWriter
- **Lesson structure / Dialogue / Grammar**: HSK Standard Course (Phase 2; chú ý bản quyền – ưu tiên tự biên soạn nếu không có license)

## 3) Information Architecture & Routes

### Global
- `/practice` – landing chọn HSK level (HSK1..6) + hiển thị tổng bài/tổng từ

### Level
- `/hsk/:level` – danh sách lesson theo level

### Lesson
- `/hsk/:level/lesson/:lessonNo` – lesson detail + tabs:
  - `?tab=lookup` (default)
  - `?tab=flashcard`
  - `?tab=quiz`
  - `?tab=listening`
  - `?tab=writing`

### Navigation
- Trong lesson detail phải có:
  - chọn bài khác (chips 1..N)
  - nút `Bài trước` / `Bài tiếp theo`
  - hiển thị progress bài + progress khóa

## 4) Supabase Data Model (DB)

> Naming gợi ý. Bạn có thể giữ bảng `vocabulary` hiện tại và migrate dần.

### 4.1 Enums

#### `word_type` (POS)
Store dạng code (`n`, `v`…) hoặc lưu label VI.

Recommended (code):
```ts
export enum WordType {
  NOUN = 'n',
  VERB = 'v',
  ADJ = 'a',
  ADV = 'd',
  PRONOUN = 'r',
  NUMERAL = 'm',
  MEASURE = 'q',
  CONJ = 'c',
  PREP = 'p',
  PARTICLE = 'u',
}
```

#### `audio_status`
- `none` – chưa request
- `queued` – đã enqueue
- `ready` – có url
- `error` – lỗi generate

### 4.2 Tables

#### A) `hsk_levels`
- `code` text PK (`hsk1`..`hsk6`)
- `name_vi` text (vd: `HSK 1 – Tiếng Trung cho người mới bắt đầu`)
- `total_lessons` int (theo HSK Standard Course: HSK1: 15; HSK2: 15; HSK3: 20; HSK4: 20; HSK5: 36; HSK6: 40)
- `total_vocab` int (theo UI mong muốn: 150/300/600/1200/2500/5000 **cumulative**)
- `display_order` int

#### B) `lessons`
- `id` uuid PK
- `hsk_level_code` text FK → `hsk_levels.code`
- `lesson_number` int
- `title_vi` text
- `title_zh` text nullable
- `description_vi` text nullable
- `display_order` int (thường = lesson_number)
- unique: (`hsk_level_code`, `lesson_number`)

#### C) `vocabulary`
> Bảng hiện tại của bạn đã gần đủ. Đề xuất chuẩn hóa column names:

- `id` uuid PK
- `hsk_level_code` text FK → `hsk_levels.code`
- `lesson_number` int FK (logic join với lessons)
- `display_order` int (thứ tự trong lesson)
- `chinese_word` text (hanzi simplified)
- `pinyin` text
- `meaning_en` text (MVP)
- `meaning_vi` text nullable (Phase 2)
- `word_type` text nullable (POS code hoặc label)
- `audio_word_url` text nullable
- `audio_word_status` audio_status default `none`
- `audio_word_provider` text nullable
- `created_at` timestamptz default now()

Indexes:
- (`hsk_level_code`, `lesson_number`, `display_order`)
- trigram index cho search: `chinese_word`, `pinyin`, `meaning_vi`, `meaning_en`

#### D) `vocabulary_examples` (Phase 2, optional MVP)
- `id` uuid PK
- `vocab_id` uuid FK → `vocabulary.id`
- `example_sentence` text (hanzi)
- `example_pinyin` text
- `example_meaning_en` text
- `example_meaning_vi` text nullable
- `audio_example_url` text nullable
- `audio_example_status` audio_status default `none`
- `source` text nullable (`curated|tatoeba|manual|ai`)
- `display_order` int default 1

#### E) `lesson_dialogues` (Phase 2)
- `id` uuid PK
- `hsk_level_code` text
- `lesson_number` int
- `title_vi` text
- `dialogue_hanzi` text
- `dialogue_pinyin` text
- `dialogue_meaning_vi` text
- `audio_dialogue_url` text nullable

#### F) `lesson_grammar_notes` (Phase 2)
- `id` uuid PK
- `hsk_level_code` text
- `lesson_number` int
- `title_vi` text
- `content_vi` text (markdown)
- `examples` jsonb nullable

#### G) Progress tables

##### `user_lesson_progress`
- `id` uuid PK
- `user_id` uuid
- `hsk_level_code` text
- `lesson_number` int
- `total_vocab` int (denormalized snapshot)
- `learned_vocab` int
- `mastered_vocab` int
- `accuracy` numeric(5,2) default 0
- `time_spent_sec` int default 0
- `updated_at` timestamptz default now()
- unique (`user_id`, `hsk_level_code`, `lesson_number`)

##### `user_vocab_progress`
- `id` uuid PK
- `user_id` uuid
- `vocab_id` uuid
- `seen_count` int default 0
- `correct_count` int default 0
- `wrong_count` int default 0
- `mastery_score` int default 0  
  - đề xuất 0–100 (>=80 coi là “thành thạo”)
- `last_seen_at` timestamptz
- `next_review_at` timestamptz nullable (optional spaced repetition)
- unique (`user_id`, `vocab_id`)

##### `user_course_progress` (level tổng)
- `id` uuid PK
- `user_id` uuid
- `hsk_level_code` text
- `total_lessons` int
- `completed_lessons` int
- `total_vocab` int
- `learned_vocab` int
- `mastered_vocab` int
- `updated_at` timestamptz
- unique (`user_id`, `hsk_level_code`)

## 5) Storage (Supabase)

### Buckets
- `audio` (public read) hoặc private + signed URL
  - `audio/hsk1/lesson-01/word/<vocabId>.mp3`
  - `audio/hsk1/lesson-01/example/<exampleId>.mp3`
- (optional) `images`

### Policy
- Public read cho audio (đơn giản MVP)
- Write chỉ server role (service key) qua API route/edge function

## 6) Seed data (HSK1 → HSK6) – theo **HSK Standard Course**

> Mục tiêu seed: có thể chạy được full UI như ảnh (Tra cứu / Flashcard / Quiz / Nghe / Viết) + tracking tiến độ theo **từng user đăng nhập**.

### 6.1 Input files (meta + vocab)

**A) Meta “khung khóa học & bài học” (chuẩn giáo trình)**
- `seed_courses_standard_course.json` (6 khóa HSK1→6)
- `seed_lessons_standard_course.json` (**146 bài**)
  - HSK1: 15 bài
  - HSK2: 15 bài
  - HSK3: 20 bài
  - HSK4: 20 bài (4A: 10 + 4B: 10)
  - HSK5: 36 bài (5A: 18 + 5B: 18)
  - HSK6: 40 bài (6A: 20 + 6B: 20)

**B) 6 file vocab theo level** (tạo/chuẩn bị trước, dùng để insert vào bảng `vocabulary`)
- `vocabulary_hsk1.json`
- `vocabulary_hsk2.json`
- `vocabulary_hsk3.json`
- `vocabulary_hsk4.json`
- `vocabulary_hsk5.json`
- `vocabulary_hsk6.json`

Schema mỗi item (tương thích bảng `vocabulary`):
```json
{
  "hsk_level_code": "hsk1",
  "lesson_number": 1,
  "chinese_word": "我",
  "pinyin": "wǒ",
  "meaning_en": "I; me",
  "meaning_vi": "tôi, tao",
  "word_type": "r",
  "display_order": 1,
  "audio_word_url": null,
  "audio_word_status": "none"
}
```

> MVP tối thiểu: `meaning_vi` có thể `null`, UI vẫn chạy bằng `meaning_en`.

---

### 6.2 Seed flow (recommended) – 4 bước

#### Step 1 — Seed `hsk_levels` / `courses`
Nguồn dữ liệu: `seed_courses_standard_course.json`

- Insert 6 rows:
  - `hsk_level_code`
  - `title_vi`
  - `lessons_count`
  - `standard_course.volumes` (store as `jsonb` nếu muốn)
  - `target_vocab_per_lesson` (mock UI)

> Nếu DB bạn đang dùng bảng `hsk_levels` thay vì `courses`, cứ map 1-1.

#### Step 2 — Seed `lessons`
Nguồn dữ liệu: `seed_lessons_standard_course.json`

- Insert **146 rows** vào bảng `lessons` với tối thiểu các cột:
  - `hsk_level_code`
  - `lesson_number`
  - `volume_code` / `volume_name` (optional nhưng rất hữu ích cho UI)
  - `title_vi` (mock)
  - `target_vocab_count` (mock để hiển thị “x từ vựng” trong list)

> UI list bài học (như ảnh) sẽ đọc trực tiếp `lessons` + `target_vocab_count`.

#### Step 3 — Seed `vocabulary`
Nguồn dữ liệu: `vocabulary_hsk*.json`

- Import theo level và insert batch.
- Constraint khuyến nghị:
  - Unique: (`hsk_level_code`, `lesson_number`, `display_order`)
  - Index: (`hsk_level_code`, `lesson_number`), (`chinese_word`), (`pinyin`)

**Rule phân bổ vocab vào lessons (mock)**
Bạn có 2 lựa chọn:

1) **Đã có `lesson_number` sẵn trong vocab JSON** → insert thẳng.
2) **Chưa có `lesson_number`** → phân bổ tự động theo danh sách lessons của level:
   - Lấy tất cả lessons của level theo `seed_lessons_standard_course.json`
   - Dựa vào `target_vocab_count` của từng lesson để cắt chunk
   - Gán `lesson_number` + `display_order` theo thứ tự

> Với HSK5/6 số bài nhiều, nếu vocab pool không đủ để “đúng target” từng lesson, cho phép:
> - reuse “review vocab” (lấy random từ level thấp hơn) **hoặc**
> - giảm `target_vocab_count` xuống để khớp pool hiện có (mock UI vẫn ok).

#### Step 4 — Seed progress cho user (để UI có % tiến độ)
Tiến độ **phải gắn với account đang đăng nhập** (NextAuth user).

Seed tối thiểu:
- Tạo 1–2 user demo (hoặc dùng user thật trên dev)
- Seed bảng `user_lesson_progress` & `user_vocab_progress` (hoặc để app tự tạo khi user học lần đầu)

Gợi ý seed demo:
- Mark “đã học” 1–3 bài đầu HSK1 cho user demo:
  - `lesson_started_at`, `lesson_completed_at` (optional)
  - `mastery_percent` (0–100)
- Mark 10–30 vocab đầu có `status=learned/mastered` để UI overview có số liệu.

---

### 6.3 Seed sample `vocabulary_examples` (Phase 2 hoặc MVP demo)
MVP demo tối thiểu có thể seed 1–2 example cho vài từ phổ biến (ví dụ: 我, 你, 好) để verify UI “Nghe câu ví dụ”.

Bảng `vocabulary_examples` tối thiểu:
- `vocab_id`
- `example_sentence`
- `example_pinyin`
- `example_meaning_vi`
- `audio_example_url` (null ở MVP)

> Phase 2: pipeline curated (Tatoeba / manual) sẽ populate đầy đủ.

---

### 6.4 Seed checklist (quick)
- [ ] Import `seed_courses_standard_course.json` → `hsk_levels/courses`
- [ ] Import `seed_lessons_standard_course.json` → `lessons` (146 rows)
- [ ] Import `vocabulary_hsk1..6.json` → `vocabulary`
- [ ] (Optional) Import vài `vocabulary_examples` cho demo
- [ ] (Optional) Seed progress cho 1 user demo để dashboard có dữ liệu


## 7) Audio generation (TTS)

### 7.1 Requirements
- Generate audio cho:
  - **word audio**: `chinese_word`
  - **example audio** (Phase 2): `example_sentence`
  - **dialogue audio** (Phase 2)
- Lưu mp3 lên Supabase Storage + cập nhật url/status.

### 7.2 API endpoints (Next.js Route Handlers)

#### `POST /api/tts/word`
Body:
- `vocabId: string`

Behavior:
- Check vocab exists
- If `audio_word_status=ready` → return url
- Else set `queued` and push job

Response:
```json
{ "status": "queued" | "ready", "audioUrl": "..." | null }
```

#### `POST /api/tts/example`
Body:
- `exampleId: string`

### 7.3 Job runner
Options:
- Supabase Edge Functions + cron
- Background worker (Node) chạy riêng (recommended nếu bạn có infra)

Pseudo:
1) Pull records where status=`queued`
2) Call TTS provider (zh-CN)
3) Upload mp3 to storage
4) Update DB status/url

### 7.4 Playback on UI
- Use `<audio>` element or Web Audio
- Cache audio by URL in memory
- Stop current audio on new play

## 8) Feature specs by Tab

## 8.1 Tab: Tra cứu (Lookup)

### UI (giống ảnh)
- Search input: placeholder `Tìm kiếm từ vựng...`
- List rows:
  - Hanzi (đỏ, lớn)
  - pinyin
  - meaning_vi (fallback meaning_en)
  - Chip POS (vd: `đại từ`)
  - Icon loa (play word audio)

### Search behavior
- Search by:
  - Hanzi prefix/contains
  - pinyin (tone marks hoặc không tone)
  - meaning_vi/en
- Filter scope: theo lesson hiện tại (default) + optional toggle `Trong bài | Trong cấp độ`.

### Row click
- Open Word Detail modal/drawer:
  - word, pinyin, meaning
  - list examples
  - play word + play example

## 8.2 Tab: Flashcard

### UI states
- Header:
  - `Tiến độ: i/total`
  - progress bar
  - counters: ✅ đúng / ❌ sai
- Controls:
  - `Xáo trộn`
  - `Làm mới`
- Card:
  - Front: Hanzi + pinyin + chip POS + button `Nghe`
  - Tap/Flip: reveal meaning + example box + button `Nghe câu ví dụ`
- Footer:
  - Prev / Next
  - Buttons: `Chưa thuộc` / `Đã thuộc`

### Logic
- Deck = vocab list of current lesson
- `Xáo trộn`: random order but keep deterministic per session (seed)
- `Làm mới`: reset progress counters + restart deck

### Progress update
- On `Đã thuộc`:
  - `user_vocab_progress.correct_count++`
  - `seen_count++`
  - increase `mastery_score` (rule below)
- On `Chưa thuộc`:
  - `wrong_count++`
  - `seen_count++`
  - decrease/keep mastery

#### Mastery scoring (simple)
- Start 0.
- `Đã thuộc`: +20 (cap 100)
- `Chưa thuộc`: -10 (floor 0)
- `mastered` when `mastery_score >= 80`

### Auto-generate audio
- On first open of a card:
  - if audio missing → call `/api/tts/word` (queue)

## 8.3 Tab: Quiz

### Types
MVP implement 2 types:
1) **Hanzi → Meaning** (4 options)
2) **Meaning → Hanzi** (4 options)

Optional:
3) **Pinyin → Hanzi**
4) **Listening quiz** (play audio, choose meaning)

### UI
- Header: `Câu i/total`, progress bar, `Điểm`
- Question:
  - show hanzi + pinyin (optional) + button loa
  - options list (buttons)

### Scoring
- Correct: +1
- Wrong: +0
- Also update `user_vocab_progress` (correct/wrong)

### Option generation
- Distractors from same lesson first; if not enough, same level.

## 8.4 Tab: Nghe (Listening)

### MVP mode
- Play audio (word/sentence) then answer.

Two patterns:
1) **Nghe từ** → chọn nghĩa đúng
2) **Nghe câu** → điền từ thiếu (cloze)

### UI (giống ảnh)
- Header: `Câu i/total`, progress bar, `Điểm`
- Player:
  - Button `Phát`
  - Button `Chậm` (playbackRate 0.75)
- Prompt:
  - Sentence with blank: `你是学生 ____ ？`
- Options: 4 lựa chọn

### Data requirements
- MVP có thể generate TTS từ sentence template bạn tự seed.
- Phase 2 dùng curated examples.

## 8.5 Tab: Viết (Writing)

### Tool
- HanziWriter

### UI (giống ảnh)
- Show:
  - pinyin
  - meaning
  - button loa `Phát âm`
  - canvas area hanzi stroke
  - stats: `Tổng X nét`
- Buttons:
  - `Xem nét viết` (animate)
  - `Luyện viết` (quiz mode)
  - `Ẩn hiện` (toggle hint)
  - `Đặt lại`
  - `Bỏ qua` / `Từ tiếp theo`

### Writing evaluation
- HanziWriter supports quiz mode (check strokes).
- Update progress:
  - If user completes writing without too many errors → treat as correct.

## 9) Progress & Analytics

### 9.1 Lesson KPIs
For a lesson (user):
- `total_vocab`
- `learned_vocab`: vocab with `seen_count>0`
- `mastered_vocab`: vocab with `mastery_score>=80`
- `accuracy`: `correct_count / (correct_count + wrong_count)`
- `time_spent_sec`: accumulate per session

### 9.2 Course KPIs (level)
- `completed_lessons`: lessons where `mastered_vocab/total_vocab >= 0.8` (threshold configurable)
- course mastery:
  - `mastered_vocab / total_vocab`

### 9.3 Overview widgets (lesson detail top)
- Donut: `Độ thành thạo %`
- Stats: `Đã học`, `Thành thạo`, `Thời gian`

### 9.4 Next lesson recommendation
- After finishing a lesson:
  - CTA: `Sang bài tiếp theo`
  - Or `Ôn lại từ chưa thuộc` (deck only wrong/low mastery)

## 10) UI Components (for vibe coding)

### Common
- `PracticeTabs(level, lessonNo, activeTab)`
- `ProgressHeader({current, total, correct, wrong, score})`
- `AudioButton({status, onPlay, onQueue})`

### Lookup
- `VocabSearchBar`
- `VocabListItem`
- `VocabDetailDrawer`

### Flashcard
- `FlashcardDeck`
- `FlashcardCard`

### Quiz
- `QuizQuestion`
- `QuizOptions`

### Listening
- `ListeningPlayer`
- `ClozeOptions`

### Writing
- `HanziWriterCanvas`
- `WritingControls`

## 11) API contracts

### 11.1 Fetch lesson vocab
`GET /api/hsk/:level/lesson/:lessonNo/vocab`
Response:
```json
{
  "level": "hsk1",
  "lesson": 3,
  "total": 13,
  "items": [
    {
      "id": "uuid",
      "chinese_word": "我",
      "pinyin": "wǒ",
      "meaning_vi": "tôi, tao",
      "meaning_en": "I; me",
      "word_type": "r",
      "audio_word_url": null,
      "audio_word_status": "none",
      "examples": [
        {
          "id": "uuid",
          "example_sentence": "我是学生。",
          "example_pinyin": "Wǒ shì xuéshēng.",
          "example_meaning_vi": "Tôi là học sinh.",
          "audio_example_url": null,
          "audio_example_status": "none"
        }
      ],
      "progress": {
        "seen_count": 1,
        "correct_count": 1,
        "wrong_count": 0,
        "mastery_score": 20
      }
    }
  ]
}
```

### 11.2 Update progress
`POST /api/progress/vocab`
Body:
```json
{ "vocabId": "uuid", "result": "correct" | "wrong", "mode": "flashcard"|"quiz"|"listening"|"writing" }
```

### 11.3 Lesson progress aggregation
`POST /api/progress/lesson/recalc`
Body:
```json
{ "hsk_level_code": "hsk1", "lesson_number": 3 }
```

Server calculates and upserts `user_lesson_progress` + `user_course_progress`.

## 12) Security & RLS

- Public:
  - Read `hsk_levels`, `lessons`, `vocabulary` (tùy bạn: có thể public để SEO)
  - Read `audio` bucket objects
- Auth required:
  - `user_*_progress` only owner (`user_id = auth.uid()`)

## 13) Mock data examples (minimum)

### HSK1 Lesson 1 (demo)
```json
[
  {
    "hsk_level_code": "hsk1",
    "lesson_number": 1,
    "chinese_word": "我",
    "pinyin": "wǒ",
    "meaning_en": "I; me",
    "meaning_vi": "tôi, tao",
    "word_type": "r",
    "display_order": 1,
    "audio_word_url": null,
    "audio_word_status": "none"
  },
  {
    "hsk_level_code": "hsk1",
    "lesson_number": 1,
    "chinese_word": "你",
    "pinyin": "nǐ",
    "meaning_en": "you",
    "meaning_vi": "bạn, anh, chị",
    "word_type": "r",
    "display_order": 2,
    "audio_word_url": null,
    "audio_word_status": "none"
  }
]
```

### Example (Phase 2)
```json
{
  "vocab_id": "<uuid of 我>",
  "example_sentence": "我是学生。",
  "example_pinyin": "Wǒ shì xuéshēng.",
  "example_meaning_en": "I am a student.",
  "example_meaning_vi": "Tôi là học sinh.",
  "audio_example_url": null,
  "audio_example_status": "none",
  "source": "curated",
  "display_order": 1
}
```

## 14) Acceptance Criteria

### Lookup
- Search hoạt động theo hanzi/pinyin/meaning
- Click row mở detail
- Loa phát audio word (hoặc queue generate)

### Flashcard
- Flip card hiển thị nghĩa + example
- `Đã thuộc/Chưa thuộc` update progress & counters
- Xáo trộn, làm mới hoạt động

### Quiz
- Có ít nhất 2 dạng câu hỏi
- Update điểm + progress

### Listening
- Có play/chậm
- Có câu cloze + options

### Writing
- HanziWriter animate + practice + reset

### Progress
- Lesson overview đúng số: `Đã học`, `Thành thạo`, `Thời gian`
- Course progress tổng hợp hiển thị ở level page
- Học xong lesson có thể bấm `Từ tiếp theo` và/hoặc `Sang bài tiếp theo`

## 15) Implementation Notes (khuyến nghị)

- Không hardcode count vocab per lesson; derive từ DB.
- `meaning_vi` fallback `meaning_en` ở mọi UI.
- Audio URLs: prefer stable public URL; nếu private thì dùng signed URLs + caching.
- Đảm bảo performance: pagination hoặc virtual list với lesson vocab lớn.
- Chuẩn hóa pinyin search: convert input không dấu → match cả dạng có dấu.

---

## Appendix A – Recommended Next.js project structure

- `lib/constants/hsk.ts` (lesson counts, level meta)
- `lib/db/*` (Prisma/Supabase queries)
- `app/(portal)/hsk/[level]/lesson/[lessonNo]/page.tsx`
- `app/api/tts/*`
- `app/api/progress/*`
- `components/practice/*`

