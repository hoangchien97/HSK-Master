# Sprint 6 — Flashcards + Learning Engine (Listening/Reading)

## Goal
Có flashcards SRS, và 1–2 module auto-grade để tạo loop học tập.

## Scope
### 1) Flashcards
- Decks theo HSK/lesson
- Cards (front/back/pinyin/audio optional)
- SRS queue (new/learning/review)
- Daily goal + streak

### 2) Listening (auto-grade MVP)
- Audio + MCQ/fill blank
- Instant scoring
- Review wrong answers
- Store attempts history

### 3) Reading (auto-grade MVP)
- Passage + MCQ
- Store attempts

## Data model
- `Deck`, `Card`, `SrsProgress`
- `Practice`, `PracticeAttempt`, `PracticeAnswer` (generic)

## Acceptance Criteria
- [ ] Daily review queue works
- [ ] Listening attempt scored & stored

## Tasks
- [ ] Flashcard UI + API
- [ ] Practice engine API + UI
- [ ] Dayjs utilities for due scheduling

## Demo
- Student học 10 cards → review queue xuất hiện
