# Practice Screen — Feature Guide

> **Path:** `/portal/student/practice/[level]/[lessonSlug]`
> **Components:** `LessonPracticeView` → 5 tabs (Lookup / Flashcard / Quiz / Listen / Write)
> **Last updated:** February 2026

---

## 1. Architecture Overview

```
SSR Page (page.tsx)
  ├── getLessonWithVocabularies()        → lesson + vocab list
  ├── getStudentLessonProgress()         → legacy overall mastery
  ├── getStudentItemProgressForLesson()  → per-vocab legacy progress
  ├── getSiblingLessons()                → prev/next lesson nav
  └── getLessonAllModeSkillProgress()    → per-mode mastery badges (NEW)
        ↓ all passed as props
LessonPracticeView (client component)
  ├── ProgressCard
  ├── Tabs: Lookup | Flashcard | Quiz | Listen | Write
  └── Sibling lesson nav (horizontal scroll)
```

**Data flow for practice tabs:**
1. SSR renders with `initialSkillProgress` (mode mastery %)
2. On tab switch → client fetches `fetchPracticeQueue(lessonSlug, mode)` (server action)
3. Queue is built server-side with interleaving from previous lesson
4. Resume pointer restored from `PortalLessonSessionState`
5. After each answer → `recordSkillAttemptAction` / `recordFlashcardSkillAction` (fire-and-forget)

---

## 2. ProgressCard

**File:** `components/portal/practice/ProgressCard.tsx`

Displayed above all tabs. Shows:
- **Overall mastery circle** (SVG donut) — `masteryPercent` from legacy `PortalLessonProgress`
- **Learned / Mastered counts** — vocabulary item progress
- **Time spent** (total session seconds)
- **Per-mode skill badges** (NEW) — 4 mini progress bars:
  - 🃏 **F** — Flashcard mastery %
  - ❓ **Q** — Quiz mastery %
  - 🎧 **L** — Listen mastery %
  - ✏️ **W** — Write mastery %
  - Each shows tooltip: `"X/Y thành thạo"`

---

## 3. Tab — Lookup (Tra cứu)

**File:** `components/portal/practice/tabs/LookupTab.tsx`  
**Mode key:** `LOOKUP`  
**No queue / skill tracking** — reference only.

### Features
| Feature | Description |
|---------|-------------|
| Vocab list | Full list of lesson vocabulary |
| Pinyin toggle | Show/hide pinyin for self-testing |
| Search/filter | Filter by word or meaning |
| Mark known | Tap to toggle known/unknown per word |
| Audio | Web Speech API pronunciation via `useSpeech` |
| Legacy progress | Updates `PortalItemProgress` (seen count) |

---

## 4. Tab — Flashcard

**File:** `components/portal/practice/tabs/FlashcardTab.tsx`  
**Mode key:** `FLASHCARD`  
**Queue-based** ✓ | **Resume pointer** ✓ | **Skill tracking** ✓

### Features
| Feature | Description |
|---------|-------------|
| Flip card | Click/tap card to reveal meaning |
| Audio | Auto-plays Chinese word on card load |
| Shuffle toggle | Randomize card order for main phase |
| HARD / GOOD / EASY actions | Spaced-repetition scoring buttons after flip |
| Review unknown phase | After round, reviews HARD cards automatically |
| Interleaved vocab badge | `"📖 Ôn bài trước"` chip for previous-lesson vocab injected into queue |
| Mastery chip | Shows `NEW` / `LEARNING` / `MASTERED` from skill progress map |
| Completed state | Green banner + "Ôn lại từ đầu" button when all vocab mastered |
| Resume | Picks up from last answered position |

### Scoring (per attempt)
| Action | Score delta |
|--------|------------|
| HARD | −0.1 |
| GOOD | +0.1 |
| EASY | +0.2 |

**Mastery threshold:** 0.8 → `MASTERED`

---

## 5. Tab — Quiz

**File:** `components/portal/practice/tabs/QuizTab.tsx`  
**Mode key:** `QUIZ`  
**Queue-based** ✓ | **Resume pointer** ✓ | **Skill tracking** ✓

### Features
| Feature | Description |
|---------|-------------|
| Multiple choice | 4 options per question (auto-generated distractors) |
| Question types | Chinese → Meaning, Meaning → Chinese, Pinyin → Chinese (rotated) |
| Auto-advance | Correct answer: auto-advances after 3s countdown |
| Result banner | Green/red feedback with correct answer revealed |
| Progress bar | Current question / total |
| Results screen | Summary: correct %, wrong items, elapsed time, restart |
| Audio | `Volume2` button to hear word pronunciation |
| Completed state | Banner + reset option |

### Scoring
| Result | Score delta |
|--------|------------|
| Correct | +0.2 |
| Wrong | −0.15 |

---

## 6. Tab — Listen (Nghe)

**File:** `components/portal/practice/tabs/ListenTab.tsx`  
**Mode key:** `LISTEN`  
**Queue-based** ✓ | **Resume pointer** ✓ | **Skill tracking** ✓

### Features
| Feature | Description |
|---------|-------------|
| Audio playback | Web Speech API auto-plays Chinese on each question |
| Listen-first lock | Answer options disabled until user has listened at least once |
| Transcript toggle | Eye button to reveal/hide Chinese characters + pinyin |
| Multiple choice | 4 options (meanings) after listening |
| Auto-advance | Correct: auto-advances after 3s |
| Replay | Can replay audio any time with speaker button |
| Result banner | Correct/wrong feedback with full vocab info |
| Completed state | Banner + reset option |

### Scoring
| Result | Score delta |
|--------|------------|
| Correct | +0.2 |
| Wrong | −0.15 |

---

## 7. Tab — Write (Viết)

**File:** `components/portal/practice/tabs/WriteTab.tsx`  
**Mode key:** `WRITE`  
**Queue-based** ✓ | **Resume pointer** ✓ | **Skill tracking** ✓

### Sub-modes (selectable per question)
| Sub-mode | Description |
|----------|-------------|
| **Animation** | Watch stroke-order animation (hanzi-writer), then advance |
| **Practice Stroke** | Trace each stroke in the correct order on canvas |
| **Type Pinyin** | Type the pinyin for the shown character |

### Features
| Feature | Description |
|---------|-------------|
| Hanzi-writer canvas | Stroke order animation + guided tracing |
| Stroke validation | Detects correct vs wrong stroke, counts mistakes |
| Pinyin input | Keyboard input validated against correct pinyin |
| Prev/Next nav | Manual navigation between vocab items |
| Results screen | Summary with restart |
| Completed state | Banner + reset option |

### Scoring
| Result | Score delta |
|--------|------------|
| Correct | +0.25 |
| Wrong | −0.1 |

---

## 8. Per-Mode Skill Progress System (NEW)

### Database models
| Model | Purpose |
|-------|---------|
| `PortalItemSkillProgress` | Per student × vocab × mode (masteryScore 0–1, status, seen/correct/wrong counts, nextReviewAt) |
| `PortalLessonSkillProgress` | Denormalized lesson counters per mode (masteredCount, totalCount) |
| `PortalLessonSessionState` | Resume pointer per mode (currentIndex, lastVocabId, isCompleted) |

### Status transitions
```
NEW (0.0) → LEARNING (0.2–0.79) → MASTERED (≥0.8)
```

### Queue building (`buildPracticeQueue`)
1. Fetch all vocab for current lesson
2. Fetch up to N vocab from **previous lesson** (not yet mastered)
3. Interleave: inject 1 prev-lesson vocab every `INTERLEAVE_INTERVAL` (=3) current-lesson vocab
4. Restore `currentIndex` from `PortalLessonSessionState`
5. If `currentIndex >= queueLength` → `isCompleted = true`

### Session resume / reset
- **Resume:** Tab switch restores exact `currentIndex` from DB
- **Reset ("Ôn lại từ đầu"):** Resets `currentIndex = 0`, `isCompleted = false` in `PortalLessonSessionState`

---

## 9. Lesson List Page

**Path:** `/portal/student/practice`  
**Files:** `PracticeListView` → `PracticeCourseAccordion` → `PracticeLessonItem`

### PracticeLessonItem — what is displayed
| Element | Data source |
|---------|------------|
| Order badge | `lesson.order` |
| ✅ CheckCircle | `masteryPercent >= 80` (legacy) |
| Vocab count | `lesson._count.vocabularies` |
| Progress bar | `masteryPercent` (legacy) |
| Per-mode badges (NEW) | `skillProgress[mode].masteryPercent` — F/Q/L/W icons with % and tooltip |

### Overview stats (top of list page)
| Stat | Description |
|------|-------------|
| Bài đã học | Lessons with `learnedCount > 0` |
| Bài thành thạo | Lessons with `masteryPercent >= 80` |
| Thời gian học | Sum of all `totalTimeSec` |
| Tiến độ chung | Average `masteryPercent` across all lessons (donut chart) |

---

## 10. Key Files Reference

| File | Role |
|------|------|
| `app/(portal)/portal/[role]/practice/page.tsx` | List page SSR |
| `app/(portal)/portal/[role]/practice/[level]/[lessonSlug]/page.tsx` | Detail page SSR |
| `components/portal/practice/LessonPracticeView.tsx` | Main client component (tabs orchestrator) |
| `components/portal/practice/ProgressCard.tsx` | Mastery + per-mode badges |
| `components/portal/practice/PracticeListView.tsx` | Practice list layout + stats |
| `components/portal/practice/PracticeCourseAccordion.tsx` | Course accordion with lessons |
| `components/portal/practice/PracticeLessonItem.tsx` | Single lesson row with skill badges |
| `components/portal/practice/tabs/LookupTab.tsx` | Lookup tab |
| `components/portal/practice/tabs/FlashcardTab.tsx` | Flashcard tab |
| `components/portal/practice/tabs/QuizTab.tsx` | Quiz tab |
| `components/portal/practice/tabs/ListenTab.tsx` | Listen tab |
| `components/portal/practice/tabs/WriteTab.tsx` | Write tab |
| `services/portal/practice-skill.service.ts` | Per-mode progress data layer |
| `actions/practice-skill.actions.ts` | Server actions for skill tracking |
| `actions/practice.actions.ts` | Legacy session/attempt server actions |
| `interfaces/portal/practice.ts` | All TypeScript interfaces |
| `enums/portal/common.ts` | `PracticeMode`, `ItemProgressStatus`, `QuestionType` |
| `constants/portal/practice.ts` | `TAB_KEYS`, `FlashcardAction`, `WriteMode`, `AUTO_NEXT_DELAY_MS` |
| `utils/practice.ts` | `generateQuizQuestions`, `generateListenQuestions`, `shuffleArray` |
| `hooks/useSpeech.ts` | Web Speech API wrapper |
