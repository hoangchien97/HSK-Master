# AGENT.md — HSK-Master Project Reference

> Single source of truth for AI agents and developers working on this codebase.
> Last updated: 2025-01 (Sprint 2 complete, Sprint 3 in progress).

---

## 1. Project Overview

**HSK-Master** is a full-stack Chinese language learning platform (HSK exam prep).
It includes a public **landing site** and a multi-role **student/teacher portal**
with vocabulary practice, assignments, attendance, scheduling, and AI-powered features.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | **Next.js** (App Router) | 16.1.1 |
| Language | **TypeScript** (strict mode) | 5.x |
| React | React 19 | 19.2.3 |
| UI Library | **HeroUI** (`@heroui/react`) | 2.8.x |
| Styling | **Tailwind CSS v4** | 4.x |
| ORM | **Prisma** | 5.22.0 |
| Database | **PostgreSQL** (Supabase) | — |
| Auth | **NextAuth v5** (beta) | 5.0.0-beta.30 |
| Storage | **Supabase Storage** | 2.98.x |
| AI | **DeepSeek** (via OpenAI-compatible API) | deepseek-chat |
| Animation | **Framer Motion** | 12.x |
| Charts | **Recharts** | 3.x |
| Calendar | **react-big-calendar** | 1.x |
| Forms | **React Hook Form** + **Zod** (v4) | 7.x / 4.x |
| Carousel | **Embla Carousel** | 8.x |
| Hanzi Writing | **hanzi-writer** | 3.7.x |
| Excel | **ExcelJS** | 4.x |
| Date Utils | **date-fns** / **dayjs** | 4.x / 1.x |
| Icons | **Lucide React** | 0.562+ |
| Toast | **react-toastify** | 11.x |

---

## 3. Project Structure

```
HSK-Master/
├── app/                          # Next.js App Router
│   ├── (landing)/                # Public marketing pages (SSR + ISR)
│   ├── (portal)/                 # Authenticated portal (layout with sidebar)
│   │   └── portal/
│   │       ├── [role]/           # Dynamic role: "student" | "teacher"
│   │       │   ├── practice/     # ← Main practice feature
│   │       │   │   ├── page.tsx          # PracticeListView
│   │       │   │   └── [level]/[lessonSlug]/page.tsx  # LessonPracticeView
│   │       │   ├── assignments/
│   │       │   ├── attendance/
│   │       │   ├── classes/
│   │       │   ├── schedule/
│   │       │   ├── students/
│   │       │   ├── progress/
│   │       │   ├── vocabulary/
│   │       │   └── page.tsx      # Dashboard
│   │       └── profile/
│   ├── (portal-auth)/            # Login / register pages
│   └── api/                      # API routes (NextAuth, etc.)
│
├── components/
│   ├── landing/                  # Landing page components
│   ├── portal/                   # Portal components
│   │   ├── common/               # Shared: CSpinner, Breadcrumb, etc.
│   │   ├── practice/             # Practice feature UI
│   │   │   ├── LessonPracticeView.tsx  # Main orchestrator (tabs, queue, state)
│   │   │   ├── ProgressCard.tsx        # Mastery progress display
│   │   │   ├── tabs/                   # Tab components
│   │   │   │   ├── FlashcardTab.tsx
│   │   │   │   ├── QuizTab.tsx
│   │   │   │   ├── ListenTab.tsx
│   │   │   │   ├── WriteTab.tsx
│   │   │   │   └── LookupTab.tsx
│   │   │   └── shared/                 # Shared practice UI
│   │   │       ├── TabErrorBoundary.tsx
│   │   │       ├── QuizResultScreen.tsx
│   │   │       ├── McqOptions.tsx
│   │   │       └── VocabItem.tsx
│   │   ├── assignments/
│   │   ├── schedule/
│   │   └── ...
│   └── shared/                   # Cross-cutting UI (modals, layouts)
│
├── actions/                      # Server Actions (Next.js "use server")
│   ├── practice.actions.ts       # Legacy practice session actions
│   ├── practice-skill.actions.ts # Skill-based practice actions
│   ├── assignment.actions.ts
│   ├── attendance.actions.ts
│   └── ...
│
├── services/                     # Data access layer (Prisma queries)
│   ├── portal/
│   │   ├── practice.service.ts
│   │   ├── practice-skill.service.ts
│   │   ├── dashboard.service.ts
│   │   └── ...
│   └── ...                       # Landing services
│
├── constants/
│   └── portal/
│       └── practice.ts           # PRACTICE_LABELS, enums, tab config
│
├── enums/
│   └── portal/
│       └── common.ts             # PracticeMode, QuestionType, WordType, etc.
│
├── interfaces/
│   └── portal/
│       └── practice.ts           # IVocabularyItem, IQueueVocabItem, etc.
│
├── hooks/                        # Custom React hooks
│   ├── useSpeech.ts              # Web Speech API TTS
│   ├── usePracticeKeyboard.tsx   # Keyboard shortcuts for practice
│   ├── useResponsive.ts
│   └── useTableParams.ts
│
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── supabase-client.ts        # Supabase client
│   ├── supabase-storage.ts       # File upload helpers
│   ├── ai/                       # AI integration (DeepSeek)
│   ├── http/                     # HTTP client utilities
│   ├── portal/                   # Portal-specific utilities
│   └── utils.ts                  # Shared utilities (cn, etc.)
│
├── providers/                    # React context providers
│   ├── auth-provider.tsx         # NextAuth session
│   ├── portal-ui-provider.tsx    # Dynamic breadcrumb labels
│   ├── notification-provider.tsx
│   └── loading-provider.tsx
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Prisma migrations
│   └── seed*.ts                  # Seed scripts
│
├── utils/                        # Pure utility functions
├── styles/                       # Additional CSS
├── scripts/                      # One-off scripts (backfill, etc.)
├── docs/                         # Feature specs & design docs
└── publishing/                   # Design system assets
```

---

## 4. Architecture & Design Patterns

### 4.1 Next.js App Router Conventions

- **Route Groups**: `(landing)`, `(portal)`, `(portal-auth)` for layout isolation
- **Dynamic Segments**: `[role]` (student/teacher), `[level]` (hsk1-6), `[lessonSlug]`
- **SSR Pages**: Data fetched in `page.tsx` server components, passed as props to client components
- **Server Actions**: In `actions/*.actions.ts` — `"use server"` functions called from client components
- **Layout nesting**: Root → Portal layout (sidebar + breadcrumb) → Role layout → Feature pages

### 4.2 Data Flow

```
page.tsx (Server)
  → service.ts (Prisma query)
  → serialize dates (JSON-safe)
  → pass as props to Client Component

Client Component
  → user interaction
  → Server Action (actions/*.ts)
    → service.ts (Prisma mutation)
    → return result
  → update local state / toast
```

### 4.3 State Management

- **No global state library** — React `useState` + `useCallback` + `useRef`
- **URL state**: Tab selection via `?tab=FLASHCARD` search params
- **Per-mode cache**: `useRef<Map<string, ModeCache>>` in `LessonPracticeView`
  - Caches queue data per practice mode (FLASHCARD, QUIZ, LISTEN, WRITE)
  - Avoids re-fetch when switching tabs back
  - `visitedTabs` Set tracks which tabs have been rendered
  - Tabs stay mounted with `display: none` for instant switching
- **Progress refresh**: Parallel `Promise.all` calls to refresh legacy + skill progress

### 4.4 Component Patterns

- **Lazy loading**: Practice tabs use `dynamic(() => import(...), { ssr: false })` for browser-only APIs
- **Error Boundaries**: `TabErrorBoundary` (class component) wraps each practice tab
- **Keep-mounted pattern**: Visited tabs persist in DOM (`display: none` when inactive)
- **Controlled + Uncontrolled**: Tabs receive `initialPointer`/`isCompleted` as initial state, then manage internally
- **Keyboard shortcuts**: `usePracticeKeyboard` hook (must be called before any early returns)

### 4.5 Service Layer

- Services are in `services/portal/*.service.ts`
- All Prisma queries centralized here (not in actions or components)
- Actions in `actions/*.actions.ts` call services and handle auth checks
- Services return raw data; actions serialize dates for client consumption

---

## 5. Key Enums & Constants

### PracticeMode (enums/portal/common.ts)
```ts
LOOKUP | FLASHCARD | QUIZ | LISTEN | WRITE
```

### FlashcardAction / FlashcardPhase / WriteMode (constants/portal/practice.ts)
```ts
FlashcardAction: HARD | GOOD | EASY
FlashcardPhase: MAIN | REVIEW_UNKNOWN
WriteMode: ANIMATION | PRACTICE | TYPE_PINYIN
```

### PRACTICE_LABELS (constants/portal/practice.ts)
Single source of truth for all UI strings. Organized by category:
- `nav` — shared navigation labels (prev, next, shuffle, etc.)
- `feedback` — correct/wrong/auto-next templates
- `empty` — empty state messages
- `flashcard` / `quiz` / `listen` / `write` — tab-specific labels
- `result` / `resultTitles` — result screen strings
- `progress` / `completion` / `error` / `lookup` / `lessonView` — other sections
- `tabLabels` — PracticeMode → display name mapping

### ItemProgressStatus
```ts
NEW | LEARNING | MASTERED
```

### QuestionType
```ts
MCQ_MEANING | MCQ_HANZI | MCQ_PINYIN | MCQ_EXAMPLE | TYPE_PINYIN | TYPE_HANZI | LISTEN_MCQ | FLASHCARD
```

---

## 6. Practice Feature Architecture

### Queue System
- Server builds a **practice queue** per mode per lesson (`buildPracticeQueue`)
- Queue includes **interleaved vocab** from previous lesson (spaced repetition)
- Resume pointer tracked server-side — students continue where they left off
- Queue cached client-side in `modeCacheRef` (Map<mode, ModeCache>)

### Progress System (Dual)
1. **Legacy progress**: `StudentLessonProgress` + `StudentItemProgress` (mastery %, learned count)
2. **Skill-based progress** (primary): `StudentSkillProgress` per vocab per mode
   - Tracks `masteryScore`, `status`, `correctCount`, `incorrectCount`
   - Aggregated per mode: masteryPercent, masteredCount, totalCount

### Tab Architecture
- `LessonPracticeView` — parent orchestrator
- 5 tabs: LookupTab (static import), FlashcardTab/QuizTab/ListenTab/WriteTab (dynamic import, ssr:false)
- Each tab receives: vocabularies, queue, skillProgressMap, initialPointer, isCompleted
- Tabs manage their own internal state (current index, answers, session)
- `onProgressUpdate` callback triggers parallel refresh of all progress data

---

## 7. Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | ≤ 425px | Stack layouts, small text, hidden labels |
| Tablet | 768px – 1279px | Side-by-side where space allows |
| Desktop | ≥ 1280px | Full sidebar, wide content area |

Tailwind classes: `sm:`, `md:`, `lg:`, `xl:` — mobile-first approach.

---

## 8. Coding Conventions

### File Naming
- Components: `PascalCase.tsx`
- Services: `kebab-case.service.ts`
- Actions: `kebab-case.actions.ts`
- Hooks: `camelCase.ts` or `.tsx` (if contains JSX)
- Constants: `kebab-case.ts`

### Import Aliases
- `@/*` maps to project root (tsconfig paths)
- Example: `@/components/portal/practice/tabs/FlashcardTab`

### Component Structure
```tsx
"use client"                    // Client component marker
import { ... } from "react"    // React imports first
import { ... } from "@heroui"  // UI library
import { ... } from "lucide"   // Icons
// ... other imports
import { PRACTICE_LABELS } from "@/constants/portal/practice"

const L = PRACTICE_LABELS       // Shorthand for labels

interface Props { ... }

export default function ComponentName({ ... }: Props) {
  // Hooks (MUST be before any early returns)
  // State
  // Callbacks
  // Effects
  // Early returns (empty state, loading, etc.)
  // Main render
}
```

### Hooks Rules (CRITICAL)
- All hooks must be called **before** any conditional `return`
- Use `{ enabled: boolean }` pattern to disable hook behavior instead of conditional calling
- See: `usePracticeKeyboard` in FlashcardTab for example

### String Management
- All UI text in `PRACTICE_LABELS` constant (constants/portal/practice.ts)
- Import as `PRACTICE_LABELS`, alias as `L` for conciseness
- Template strings use `Tpl` suffix: `L.flashcard.toastReviewTpl(count)`
- Tab labels from `L.tabLabels[PracticeMode.FLASHCARD]`

### Error Handling
- Server actions return `{ success: boolean, data?, error? }`
- Client wraps action calls in try/catch with toast notifications
- `TabErrorBoundary` catches runtime errors per tab

---

## 9. Database Schema (Key Models)

```
User → Student (1:1 via StudentProfile)
Course → Lesson → Vocabulary
Student → StudentLessonProgress (per lesson)
Student → StudentItemProgress (per vocab, legacy)
Student → StudentSkillProgress (per vocab per mode, primary)
Student → PracticeSession (session tracking)
Student → Enrollment → Class → Schedule
Teacher → Assignment → Submission
```

### Prisma Commands
```bash
npx prisma generate          # Generate client
npx prisma migrate dev       # Create migration
npx prisma studio            # DB browser
npx tsx prisma/seed.ts       # Seed data
```

---

## 10. Authentication

- **NextAuth v5** with Prisma adapter
- Auth config in `auth.config.ts` + `auth.ts`
- Session provider in `providers/auth-provider.tsx`
- Role-based access: `student` / `teacher` (from URL `[role]` segment)
- API auth helper: `lib/api-auth.ts`

---

## 11. Development Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build (includes prisma generate)
npm run lint             # ESLint
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Run migrations
```

---

## 12. Sprint Progress

### ✅ Sprint 1 (Complete)
- P1-02: Keyboard shortcuts (`usePracticeKeyboard`)
- P1-03: TabErrorBoundary per tab
- P1-04: `serializeDates` utility
- P1-08: WriteTab queue fix

### ✅ Sprint 2 (Complete)
- P1-01: StudentDashboard real data
- P1-06: Unified progress system (skill-based primary)
- P1-07: Flashcard state sync from server skill data

### 🔄 Sprint 3 (In Progress)
- P1-05: Chatbot responsive (full-screen ≤425px, compact tablet, full desktop)
- P1-09: PracticeListView pagination (accordion collapse, on-demand skill fetch)
- P1-10: Guided learning path banner

### Cross-cutting (Done)
- Per-mode queue caching (no re-fetch on tab switch)
- Keep-mounted tab pattern (preserve internal state)
- PRACTICE_LABELS centralization (~70 strings extracted)

---

## 13. Key Files Quick Reference

| Purpose | File |
|---------|------|
| Practice page (SSR) | `app/(portal)/portal/[role]/practice/[level]/[lessonSlug]/page.tsx` |
| Tab orchestrator | `components/portal/practice/LessonPracticeView.tsx` |
| Flashcard tab | `components/portal/practice/tabs/FlashcardTab.tsx` |
| Quiz tab | `components/portal/practice/tabs/QuizTab.tsx` |
| Listen tab | `components/portal/practice/tabs/ListenTab.tsx` |
| Write tab | `components/portal/practice/tabs/WriteTab.tsx` |
| Lookup tab | `components/portal/practice/tabs/LookupTab.tsx` |
| UI constants | `constants/portal/practice.ts` |
| Enums | `enums/portal/common.ts` |
| Interfaces | `interfaces/portal/practice.ts` |
| Practice service | `services/portal/practice.service.ts` |
| Skill service | `services/portal/practice-skill.service.ts` |
| Practice actions | `actions/practice-skill.actions.ts` |
| Keyboard hook | `hooks/usePracticeKeyboard.tsx` |
| Speech hook | `hooks/useSpeech.ts` |
| Error boundary | `components/portal/practice/shared/TabErrorBoundary.tsx` |
| Result screen | `components/portal/practice/shared/QuizResultScreen.tsx` |
| Prisma schema | `prisma/schema.prisma` |
| Auth config | `auth.config.ts` |
| AI integration | `lib/ai/` |
| Improvement plan | `docs/PRACTICE_AI_IMPROVEMENT_PLAN.md` |
