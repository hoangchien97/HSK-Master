# HSK Vocabulary Learning Workspace – Full Technical Specification

Version: 1.0
Goal: Transform vocabulary learning into an interactive SRS-based learning system integrated with the HSK portal.

Stack:

* Next.js (App Router)
* React
* Prisma
* PostgreSQL
* Tailwind
* Optional AI services (OpenAI / DeepSeek)

---

# 1. Product Goal

Current system:

* vocabulary list
* flashcard
* quiz

Problems:

* fragmented learning
* no spaced repetition
* no vocabulary mastery tracking

Solution:
Create a **Vocabulary Learning Workspace**:

Structure:

Vocabulary Page

Left Panel → Vocabulary Navigator
Right Panel → Learning Workspace

User flow:

1 Select word
2 Study flashcard
3 Listen pronunciation
4 Write character
5 Review example sentences
6 Mark correct / incorrect
7 Update SRS progress

---

# 2. UX Wireframe

## Layout

```
-------------------------------------------------------
| Vocabulary List | Vocabulary Learning Workspace     |
|                 |                                   |
| 爱  ai          | 爱 (ài)                           |
| 八  ba          | meaning: love                     |
| 爸爸 ba ba      |                                   |
| 北京 bei jing   | -------------------------------- |
| ...             | Flashcard                         |
|                 |                                   |
|                 | Pronunciation                     |
|                 |                                   |
|                 | Writing Practice                  |
|                 |                                   |
|                 | Example Sentences                 |
|                 |                                   |
|                 | Mini Quiz                         |
-------------------------------------------------------
```

---

## Vocabulary Sidebar

Features:

* search
* filter by status
* progress indicator

Item card:

```
爱
ài

meaning: love
status: learning
accuracy: 92%
```

Filters:

```
All
Learning
Review
Mastered
Hard
```

---

## Vocabulary Workspace

Sections:

### Header

```
爱
ài

HSK Level: HSK1
Meaning: love
```

---

### Flashcard

```
Front: 爱
Back: love
```

---

### Pronunciation

```
Play audio
Record voice
Compare pronunciation
```

---

### Writing Practice

```
Stroke animation
User writing input
Character comparison
```

---

### Example Sentences

```
我爱你
Wǒ ài nǐ
I love you
```

---

### Quick Review Buttons

```
Easy
Good
Hard
Again
```

---

# 3. Database Schema (Prisma)

New models extend current LMS structure.

---

## Vocabulary

```
model Vocabulary {
  id            String   @id @default(uuid())
  hanzi         String
  pinyin        String
  meaning_vi    String
  meaning_en    String
  hsk_level     Int

  audio_url     String?

  lesson_id     String?
  lesson        Lesson? @relation(fields: [lesson_id], references: [id])

  examples      ExampleSentence[]

  created_at    DateTime @default(now())
}
```

---

## ExampleSentence

```
model ExampleSentence {
  id           String @id @default(uuid())

  vocab_id     String
  vocabulary   Vocabulary @relation(fields: [vocab_id], references: [id])

  hanzi        String
  pinyin       String
  translation  String
}
```

---

## UserVocabularyProgress

Tracks SRS learning state.

```
model UserVocabularyProgress {

  id           String @id @default(uuid())

  user_id      String
  vocab_id     String

  repetition   Int     @default(0)
  interval     Int     @default(1)
  ease_factor  Float   @default(2.5)

  correct_count Int    @default(0)
  wrong_count   Int    @default(0)

  next_review_at DateTime
  last_reviewed_at DateTime?

  level ProgressLevel

  @@unique([user_id, vocab_id])
}
```

---

## ProgressLevel

```
enum ProgressLevel {
  NEW
  LEARNING
  REVIEW
  MASTERED
}
```

---

# 4. SRS Algorithm

Use simplified **SM-2 algorithm** (used by Anki).

---

## Review Input

User answer:

```
AGAIN
HARD
GOOD
EASY
```

Converted to quality score:

```
AGAIN → 0
HARD  → 3
GOOD  → 4
EASY  → 5
```

---

## Algorithm

If quality < 3:

```
repetition = 0
interval = 1
```

Else:

```
repetition += 1

if repetition == 1
 interval = 1

if repetition == 2
 interval = 3

if repetition > 2
 interval = interval * ease_factor
```

Update ease factor:

```
ease_factor = ease_factor +
 (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
```

Minimum:

```
ease_factor >= 1.3
```

Next review:

```
next_review_at = now + interval days
```

---

# 5. API Design

Base route:

```
/api/vocabularies
```

---

## List vocabulary

```
GET /api/vocabularies
```

Query:

```
lessonId
status
search
```

Response:

```
[
 {
  id
  hanzi
  pinyin
  meaning
  level
  accuracy
 }
]
```

---

## Vocabulary detail

```
GET /api/vocabularies/:id
```

Response:

```
{
 id
 hanzi
 pinyin
 meaning_vi
 meaning_en
 audio_url

 examples: []

 progress: {
   level
   repetition
   next_review_at
 }
}
```

---

## Review vocabulary

```
POST /api/vocabularies/review
```

Body:

```
{
 vocabId
 result
}
```

Response:

```
{
 nextReview
 interval
 repetition
}
```

---

## Vocabulary due review

```
GET /api/vocabularies/review/due
```

Return words needing review.

---

# 6. React Architecture

Folder structure:

```
/app/vocabulary

/components

VocabularySidebar
VocabularyItem

VocabularyWorkspace
FlashcardSection
PronunciationSection
WritingSection
ExampleSection
ReviewButtons
```

---

## Page Layout

```
VocabularyPage

 ├ VocabularySidebar
 │
 └ VocabularyWorkspace
```

---

## State

```
selectedVocabularyId
```

---

## Data fetching

React Query:

```
useQuery(vocabList)
useQuery(vocabDetail)
```

Review mutation:

```
useMutation(reviewVocabulary)
```

---

# 7. AI Extension (Phase 2)

AI can enhance vocabulary learning.

---

## AI Example Generator

Endpoint:

```
POST /api/ai/example
```

Input:

```
{
 word: "爱"
}
```

Output:

```
{
 sentence
 pinyin
 translation
}
```

Use LLM to generate contextual sentences.

---

## AI Pronunciation Feedback

Flow:

```
User record voice
↓
Speech recognition
↓
Compare phoneme
↓
Return score
```

Output:

```
accuracy score
tone mistakes
```

---

## AI Quiz Generator

Generate dynamic quiz:

```
Fill blank
Choose meaning
Arrange sentence
```

---

## AI Sentence Correction

User writes:

```
我爱苹果
```

AI feedback:

```
Grammar correct
Naturalness score
```

---

# 8. Future Expansion

System can expand into:

Vocabulary graph learning

Example:

```
爱 → 喜欢 → 热爱
```

Semantic relations:

```
Synonym
Antonym
Related word
```

---

# 9. Performance Strategy

Vocabulary list caching.

Strategy:

```
SSR vocabulary page
client fetch vocabulary detail
```

Avoid re-render sidebar.

Use:

```
virtual list
```

if vocabulary > 1000.

---

# 10. Migration Plan

Step 1

Add new models.

```
prisma migrate dev
```

---

Step 2

Backfill progress table.

---

Step 3

Add SRS review scheduler.

---

Step 4

Deploy workspace UI.

---

# Final Result

Portal becomes:

HSK Learning System

Instead of static LMS.

Features:

* Vocabulary mastery tracking
* Spaced repetition learning
* AI practice
* Adaptive learning

Students retain vocabulary significantly longer.
