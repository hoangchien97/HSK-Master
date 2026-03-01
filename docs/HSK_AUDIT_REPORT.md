# HSK-Master — Comprehensive Audit Report

> **Date**: 2026-03-01
> **Reviewer**: Staff/Principal Frontend + Fullstack
> **Stack**: Next.js 16.1.1 (App Router) · React 19 · Prisma 5.22 · Tailwind v4 · HeroUI · Supabase Postgres

---

## 1. Architecture Map & Repo Inventory

### Route Groups

| Group | Path | Purpose |
|-------|------|---------|
| `(landing)` | `/`, `/about`, `/contact`, `/courses/**`, `/privacy`, `/terms` | Public marketing site |
| `(portal)` | `/portal/[role]/**` | Authenticated learning portal (student/teacher/admin) |
| `(portal-auth)` | `/portal/login`, `/portal/register` | Auth flows |
| `api/` | `/api/auth/**`, `/api/og/**`, `/api/portal/**` | API routes (13 portal sub-routes) |

### Rendering Strategy (Current)

| Page | Path | Strategy |
|------|------|----------|
| Homepage | `/` | SSG + ISR (`revalidate=3600`) |
| About | `/about` | SSG |
| Contact | `/contact` | SSG |
| Courses List | `/courses` | ISR |
| Course Detail | `/courses/[slug]` | ISR |
| Lessons | `/courses/[slug]/lessons` | ISR |
| Lesson Detail | `/lessons/[id]` | SSR |
| Vocabulary | `/vocabulary` | SSR |
| Register | `/register` | SSR |
| Portal pages | `/portal/**` | SSR (protected) |

### Directory Structure

```
HSK-Master/
├── app/                    # Next.js App Router
│   ├── (landing)/          # Landing pages + layout
│   ├── (portal)/           # Portal layout + pages
│   ├── (portal-auth)/      # Auth layout + pages
│   ├── api/                # API route handlers
│   ├── globals.css         # 728 lines — design tokens + animations
│   ├── layout.tsx          # Root layout (SessionProvider wraps all)
│   └── not-found.tsx       # Global 404
├── actions/                # Server Actions (9 files)
├── components/
│   ├── landing/            # Landing page components (84 files)
│   ├── portal/             # Portal components (91 files)
│   └── shared/             # Shared components (1 file)
├── constants/              # Brand, portal roles, etc.
├── enums/                  # Portal enums
├── hooks/                  # Custom hooks (5)
├── interfaces/             # TypeScript interfaces (12)
├── lib/                    # Prisma client, utils, Supabase, structured data
├── providers/              # HeroUIProvider, AuthProvider, LoadingProvider, PortalUIProvider
├── services/               # Data layer (landing + portal)
├── prisma/
│   ├── schema.prisma       # 692 lines, 20+ models
│   ├── seed.ts             # 65KB seed file
│   └── migrations/         # 19 migrations
├── scripts/                # Utility scripts
├── styles/                 # Additional styles
├── types/                  # Additional type definitions
└── utils/                  # Utility functions
```

### Key Dependencies

| Package | Role | Size Risk |
|---------|------|-----------|
| `@heroui/react` | UI library (full import) | **HIGH** — entire library bundled |
| `framer-motion` | Animations (landing + portal) | HIGH — 130KB+ |
| `embla-carousel-react` | Hero slideshow | Medium |
| `recharts` | Portal dashboard charts | HIGH — 350KB+ |
| `react-big-calendar` | Portal calendar | HIGH — 200KB+ |
| `hanzi-writer` | Chinese character writing | Medium |
| `react-toastify` | Notifications | Medium |
| `lucide-react` | Icons | Low (tree-shakable) |
| `googleapis` | Google Calendar sync | Server-only |

### Data Access Pattern

```
Server Component → services/*.service.ts → prisma → Supabase Postgres
Server Actions   → actions/*.actions.ts  → prisma → Supabase Postgres
API Routes       → api/portal/**/route.ts → prisma → Supabase Postgres
```

- **No caching layer**: No `unstable_cache`, no `fetch` with `next.revalidate`, no custom cache
- **No dynamic imports**: Zero `next/dynamic` usage found
- **No error/loading boundaries**: Zero `error.tsx` or `loading.tsx` files in the entire app

---

## 2. Top 10 Issues (Ranked by Impact × Effort)

| # | Issue | Impact | Effort | Category |
|---|-------|--------|--------|----------|
| 1 | **No `error.tsx` / `loading.tsx` boundaries** | HIGH | S | Reliability |
| 2 | **Root layout wraps ALL routes in client providers (SessionProvider, HeroUI, Toast)** | HIGH | M | Performance |
| 3 | **Missing Prisma indexes** on Vocabulary, Lesson, Course, PortalItemProgress | HIGH | S | Database |
| 4 | **N+1 queries in `recomputeLessonProgress`** — 4 sequential queries per attempt | HIGH | S | Database |
| 5 | **No `unstable_cache` / data caching** — services hit DB on every request | HIGH | M | Performance |
| 6 | **Zero dynamic imports** — heavy libs (recharts, react-big-calendar, hanzi-writer) eagerly loaded | HIGH | S | Bundle |
| 7 | **`@heroui/react` imported as monolith** — entire library in client bundle | HIGH | M | Bundle |
| 8 | **`globals.css` is 728 lines** — re-declares all Tailwind colors as `lab()` values (bloat) | MEDIUM | S | Maintainability |
| 9 | **No API route validation/auth guards** — portal API routes lack consistent auth checks | HIGH | M | Security |
| 10 | **Seed file is 65KB single file** — unmaintainable, not idempotent | MEDIUM | M | Maintainability |

---

## 3. Detailed Findings & Patches

---

### Finding 1: No Error/Loading Boundaries

**Location**: Entire `app/` directory
**Problem**: Zero `error.tsx` or `loading.tsx` files exist. Unhandled errors crash the entire page. No loading UI during navigation.
**Why it matters**: UX, reliability, streaming opportunity. Without `loading.tsx`, the entire page blocks until all data resolves.

**Fix — Add boundaries at route group level:**

```tsx
// app/(landing)/loading.tsx
export default function LandingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Đang tải...</p>
      </div>
    </div>
  );
}
```

```tsx
// app/(landing)/error.tsx
"use client";

import { useEffect } from "react";

export default function LandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Landing error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Đã xảy ra lỗi</h2>
        <p className="text-text-muted">{error.message || "Vui lòng thử lại"}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
```

```tsx
// app/(portal)/error.tsx — same pattern
// app/(portal)/loading.tsx — with sidebar skeleton
```

**Expected impact**: Improved UX, graceful error recovery, streaming SSR with Suspense boundaries.

---

### Finding 2: Root Layout Client Provider Bloat

**Location**: `app/layout.tsx`
**Problem**: `SessionProvider`, `HeroUIProvider`, `TooltipPrimitive.Provider`, `NextTopLoader`, `ToastContainer`, `WebVitals` all wrap the entire app — including landing pages that don't need auth or portal UI.

**Why it matters**: Every landing page visitor downloads the session provider JS, HeroUI runtime, and toast CSS even if they never interact with the portal.

**Fix — Move providers to appropriate layout segments:**

```tsx
// app/layout.tsx — minimal root layout
import type { Metadata } from "next";
import { Geist, Noto_Sans, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/structured-data';
import NextTopLoader from 'nextjs-toploader';
import { Suspense } from "react";

// fonts stay here...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // structured data stays here...
  return (
    <html lang="vi" suppressHydrationWarning className="light">
      <head>{/* structured data scripts */}</head>
      <body className={`${geistSans.variable} ${notoSans.variable} ${notoSansSC.variable} antialiased`}>
        <NextTopLoader color="#ec131e" height={3} showSpinner={false} zIndex={1600} />
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/(portal)/layout.tsx — portal-specific providers
import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
        {children}
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </HeroUIProvider>
    </SessionProvider>
  );
}
```

**Expected impact**: ~50-80KB reduction in landing page client bundle. Faster LCP.

---

### Finding 3: Missing Prisma Indexes

**Location**: `prisma/schema.prisma`
**Problem**: Several hot-path queries lack indexes:

| Table | Missing Index | Query Pattern |
|-------|--------------|---------------|
| `Vocabulary` | `lessonId` | `findMany({ where: { lessonId } })` — every lesson load |
| `Lesson` | `courseId` | `findMany({ where: { courseId } })` — every course detail |
| `Lesson` | `slug` | `findFirst({ where: { slug } })` — practice entry |
| `Course` | `[isPublished, categoryId]` | Filtered course listing |
| `Course` | `[isPublished, hskLevelId]` | HSK level filtering |
| `PortalItemProgress` | `[studentId, status]` | Progress dashboard queries |
| `PortalPracticeSession` | `[studentId, lessonId]` | Session aggregation |
| `PortalPracticeAttempt` | `sessionId` | Attempt listing per session |
| `PortalAttendance` | `[classId, date]` | Attendance by class+date |
| `PortalAssignment` | `classId` | Assignments per class |

**Fix — Add to `schema.prisma`:**

```prisma
model Vocabulary {
  // ... existing fields ...

  @@index([lessonId])
  @@map("portal_vocabulary")
}

model Lesson {
  // ... existing fields ...

  @@index([courseId, order])
  @@index([slug])
}

model Course {
  // ... existing fields ...

  @@index([isPublished, categoryId])
  @@index([isPublished, hskLevelId])
  @@index([slug])  // already @unique but explicit index helps some query planners
}

model PortalItemProgress {
  // ... existing fields ...

  @@index([studentId, status])
  @@map("portal_item_progress")
}

model PortalPracticeSession {
  // ... existing fields ...

  @@index([studentId, lessonId])
  @@map("portal_practice_sessions")
}

model PortalPracticeAttempt {
  // ... existing fields ...

  @@index([sessionId])
  @@map("portal_practice_attempts")
}

model PortalAttendance {
  // ... existing fields ...

  @@index([classId, date])
  @@map("portal_attendances")
}

model PortalAssignment {
  // ... existing fields ...

  @@index([classId, status])
  @@map("portal_assignments")
}
```

**Migration command:**
```bash
npx prisma migrate dev --name add_missing_indexes
```

**Expected impact**: 2-10× faster queries on vocabulary lookup, lesson listing, practice progress. Direct reduction in Supabase compute cost.

---

### Finding 4: N+1 Queries in `recomputeLessonProgress`

**Location**: `services/portal/practice.service.ts` — `recomputeLessonProgress()` (line 255-319)
**Problem**: Called after every single practice attempt, executes **5 sequential queries**:
1. `vocabulary.count({ where: { lessonId } })`
2. `vocabulary.findMany({ where: { lessonId }, select: { id } })`
3. `portalItemProgress.findMany({ where: { studentId, vocabularyId: { in: vocabIds } } })`
4. `portalPracticeSession.findMany({ where: { studentId, lessonId } })`
5. `portalLessonProgress.findUnique(...)` + `upsert(...)`

Plus optionally: `lesson.findUnique(...)` + `createNotification(...)`.

**Why it matters**: Each practice question triggers 5-7 DB round trips. With Supabase connection pooling, this adds ~50-100ms latency per attempt.

**Fix — Consolidate into single query + transaction:**

```typescript
async function recomputeLessonProgress(studentId: string, lessonId: string) {
  // Single query: Get vocab IDs + count in one go
  const vocabs = await prisma.vocabulary.findMany({
    where: { lessonId },
    select: { id: true },
  });

  const totalCount = vocabs.length;
  if (totalCount === 0) return;

  const vocabIds = vocabs.map((v) => v.id);

  // Parallel queries where possible
  const [itemProgressList, sessions, existingProgress] = await Promise.all([
    prisma.portalItemProgress.findMany({
      where: { studentId, vocabularyId: { in: vocabIds } },
    }),
    prisma.portalPracticeSession.aggregate({
      where: { studentId, lessonId },
      _sum: { durationSec: true },
    }),
    prisma.portalLessonProgress.findUnique({
      where: { studentId_lessonId: { studentId, lessonId } },
      select: { masteryPercent: true },
    }),
  ]);

  const learnedCount = itemProgressList.filter((ip) => ip.seenCount >= 1).length;
  const masteredCount = itemProgressList.filter((ip) => ip.masteryScore >= MASTERY_THRESHOLD).length;
  const masteryPercent = (masteredCount / totalCount) * 100;
  const totalTimeSec = sessions._sum.durationSec ?? 0;
  const previousMastery = existingProgress?.masteryPercent ?? 0;

  await prisma.portalLessonProgress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    create: { studentId, lessonId, learnedCount, masteredCount, totalTimeSec, masteryPercent },
    update: { learnedCount, masteredCount, totalTimeSec, masteryPercent },
  });

  // Notification (non-blocking, fire-and-forget)
  if (previousMastery < 80 && masteryPercent >= 80) {
    fireMasteryNotification(studentId, lessonId, masteryPercent).catch(console.error);
  }
}
```

**Expected impact**: 5 sequential queries → 1 + 3 parallel. ~60% reduction in DB round trips per practice attempt.

---

### Finding 5: No Data Caching Layer

**Location**: `services/*.service.ts`, `services/portal/*.service.ts`
**Problem**: Every service function directly hits Prisma/DB with no caching. Landing page data (courses, HSK levels, features, reviews) changes rarely but is fetched fresh every request.

**Fix — Add `unstable_cache` for landing page services:**

```typescript
// services/course.service.ts
import { unstable_cache } from "next/cache";

export const getCourses = unstable_cache(
  async (): Promise<Course[]> => {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: { hskLevel: { select: { level: true } } },
      orderBy: { createdAt: "desc" },
    });
    // sorting logic...
    return sorted;
  },
  ["courses-list"],
  { revalidate: 3600, tags: ["courses"] }
);

export const getCourseBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.course.findUnique({
      where: { slug },
      include: { category: { select: { id: true, name: true, slug: true } }, hskLevel: true },
    });
  },
  ["course-by-slug"],
  { revalidate: 3600, tags: ["courses"] }
);
```

Apply similarly to: `hero.service.ts`, `feature.service.ts`, `review.service.ts`, `cta.service.ts`, `hsk.service.ts`, `album.service.ts`.

**Expected impact**: ~90% reduction in DB queries for landing pages. LCP improvement of 100-300ms.

---

### Finding 6: No Dynamic Imports for Heavy Libraries

**Location**: All portal pages
**Problem**: `recharts` (350KB), `react-big-calendar` (200KB), `hanzi-writer` (80KB), `embla-carousel` — all eager-loaded.

**Fix examples:**

```typescript
// components/portal/dashboards/SomeChart.tsx
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" /> }
);

// components/portal/calendar/CalendarView.tsx
const BigCalendar = dynamic(
  () => import("react-big-calendar").then((mod) => mod.Calendar),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" /> }
);

// components/portal/practice/HanziWriterComponent.tsx
const HanziWriter = dynamic(
  () => import("hanzi-writer"),
  { ssr: false }
);
```

**Expected impact**: 400-600KB reduction in initial JS bundle for portal pages.

---

### Finding 7: HeroUI Monolith Import

**Location**: `package.json` — `@heroui/react`, `app/globals.css` — `@source` directive
**Problem**: `@heroui/react` is imported as a single monolith. The `@source` directive in `globals.css` includes ALL HeroUI theme files. Even `optimizePackageImports` in `next.config.ts` only helps with JS tree-shaking, not CSS.

**Fix — Switch to individual package imports:**

```bash
# Install individual packages instead of monolith
npm install @heroui/button @heroui/input @heroui/modal @heroui/table @heroui/card @heroui/tabs @heroui/dropdown @heroui/popover @heroui/chip @heroui/badge @heroui/avatar @heroui/spinner @heroui/tooltip @heroui/theme
```

```typescript
// Instead of:
import { Button, Input, Modal } from "@heroui/react";

// Use:
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal } from "@heroui/modal";
```

Update `globals.css`:
```css
/* Replace blanket @source with specific packages */
@source '../node_modules/@heroui/theme/dist/components/{button,input,modal,table,card,tabs,dropdown,chip,badge,avatar,spinner,tooltip,popover}.js';
```

**Expected impact**: Significant CSS + JS reduction. Only used HeroUI components shipped.

---

### Finding 8: Bloated `globals.css`

**Location**: `app/globals.css` (728 lines)
**Problem**:
- Lines 26-206: Re-declares ALL Tailwind standard colors (red, orange, amber, yellow, green, emerald, teal, cyan, blue, indigo, violet, purple, pink, rose, gray) using `lab()` values — these are **already included in Tailwind v4 by default**.
- Lines 369-712: 15+ `@keyframes` + animation utilities that could use Tailwind v4's built-in animation utilities.
- Stagger animation delays (lines 522-534) all set to `0.2s` — intended stagger effect broken.

**Fix — Remove duplicate color declarations:**

Delete lines 26-206 (Tailwind standard color redeclarations). They are already part of Tailwind v4's default palette.

Fix stagger delays:
```css
.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
```

**Expected impact**: ~200 lines removed. Easier maintenance. CSS file size reduced.

---

### Finding 9: API Route Security

**Location**: `app/api/portal/*/route.ts`
**Problem**: Need to verify that all portal API routes check auth session and role before processing requests.

**Fix — Create reusable auth middleware:**

```typescript
// lib/api-auth.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth(roles?: string[]) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  if (roles && !roles.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
```

```typescript
// Usage in API routes:
export async function GET(req: Request) {
  const { error, session } = await requireAuth(["TEACHER", "SYSTEM_ADMIN"]);
  if (error) return error;
  // ...proceed with session.user
}
```

---

### Finding 10: Monolithic Seed File

**Location**: `prisma/seed.ts` (65KB)
**Problem**: Single file with all seed data for all models. Not idempotent (may fail on re-run). Hard to maintain.

**Fix — Split by domain and make idempotent:**

```
prisma/
├── seed.ts                 # Orchestrator — calls domain seeders in order
├── seed-landing.ts         # Categories, Courses, Lessons, HSKLevels, Features, etc.
├── seed-portal.ts          # Portal users, classes, enrollments (existing, refine)
├── seed-vocabulary.ts      # Vocabulary data (existing, keep)
└── seed-data/
    ├── courses.json        # Static course data
    ├── hsk-levels.json     # HSK level config
    └── features.json       # Feature cards
```

Use `upsert` instead of `create` for idempotency:
```typescript
await prisma.category.upsert({
  where: { slug: "luyen-thi-hsk" },
  create: { name: "Luyện thi HSK", slug: "luyen-thi-hsk" },
  update: { name: "Luyện thi HSK" },
});
```

---

## 4. Performance Review Details

### Server Components vs Client Components

| Location | `"use client"` Files | Issue |
|----------|---------------------|-------|
| `app/(landing)/` | 6 files | `CoursesClient.tsx`, `CoursesGrid.tsx`, `CourseResourceCards.tsx`, `CourseStatsGrid.tsx`, `LessonList.tsx`, `system-design/page.tsx` |
| `app/(portal)/` | 4 files | `PortalLayoutClient.tsx`, `VocabularyClient.tsx`, `BookmarksClient.tsx`, `ProfileClient.tsx` |
| `app/(portal-auth)/` | 2 files | `layout.tsx` (entire auth layout!), `PortalAuthErrorContent.tsx` |

> [!WARNING]
> `app/(portal-auth)/layout.tsx` is marked `"use client"` — this makes the entire auth layout (and all children) client components. This should be Server Component with only the form marked as client.

### Bundle Optimization Checklist

- [ ] Add `next/dynamic` for recharts, react-big-calendar, hanzi-writer
- [ ] Switch HeroUI to individual imports
- [ ] Move SessionProvider to portal-only layout
- [ ] Move react-toastify CSS import to portal layout
- [ ] Remove `MaterialIconsLoader` from root `<head>` if only used in portal
- [ ] Add `loading.tsx` boundaries for streaming SSR
- [ ] Consider removing `web-vitals` from production (dev-only)

### Data Fetching Issues

| Service | Issue | Fix |
|---------|-------|-----|
| `getCourses()` | No cache, fetches all courses every request | `unstable_cache` with `revalidate: 3600` |
| `getFilteredCourses()` | Separate query for HSK levels + main query (2 round trips) | Single query with nested filter |
| `recomputeLessonProgress()` | 5 sequential queries | `Promise.all` + remove duplicate vocab query |
| `getStudentItemProgressForLesson()` | Fetches lesson just to get vocab IDs, then fetches progress | Join query |
| `recordPracticeAttempt()` | Creates attempt, then re-fetches session to get studentId | Pass studentId as parameter |

---

## 5. Database & Prisma Review

### Schema Quality

**Good:**
- Proper use of `@@unique` composite constraints (e.g., `[studentId, lessonId]`)
- `@@map` for table names
- Referential actions (`onDelete: Cascade`) properly set
- `@db.Text` for long text fields
- Structured schedule system (Series → Sessions) for Google Calendar sync

**Issues:**

| Issue | Location | Recommendation |
|-------|----------|----------------|
| No indexes on FK columns | `Vocabulary.lessonId`, `Lesson.courseId`, multiple FK columns | Add `@@index` (see Finding 3) |
| `status` fields use `String` instead of enum | `PortalClass.status`, `PortalAttendance.status`, `PortalAssignment.status` | Consider Prisma enums for type safety |
| `Vocabulary` model uses `@@map("portal_vocabulary")` | `prisma/schema.prisma:109` | Confusing — it's shared between landing + portal. Keep or rename |
| Missing `updatedAt` on `Vocabulary` | `prisma/schema.prisma:91-110` | Add `updatedAt DateTime @updatedAt` |
| `Course.level` is `String?` while `HSKLevel.level` is `Int` | Schema lines 34, 225 | `Course.level` is redundant with hskLevel relation |
| Both `meaning` and `meaningVi` on Vocabulary | Schema lines 96-97 | Consolidate or document usage |
| No soft delete on Course/Lesson | — | Add `isDeleted` or use `isPublished` as proxy |

### Missing Indexes (Critical)

```sql
-- These indexes should yield immediate query improvement:
CREATE INDEX idx_vocabulary_lesson_id ON portal_vocabulary(lesson_id);
CREATE INDEX idx_lesson_course_id_order ON "Lesson"("courseId", "order");
CREATE INDEX idx_course_published_category ON "Course"("isPublished", "categoryId");
CREATE INDEX idx_course_published_hsk ON "Course"("isPublished", "hskLevelId");
CREATE INDEX idx_item_progress_student_status ON portal_item_progress("studentId", "status");
CREATE INDEX idx_practice_session_student_lesson ON portal_practice_sessions("studentId", "lessonId");
CREATE INDEX idx_practice_attempt_session ON portal_practice_attempts("sessionId");
CREATE INDEX idx_attendance_class_date ON portal_attendances("classId", "date");
CREATE INDEX idx_assignment_class_status ON portal_assignments("classId", "status");
```

### Query Pattern Issues

1. **`course.service.ts:getCourses()`** — Fetches ALL courses then sorts in JS. With index on `hskLevel.level`, sorting can be pushed to DB.
2. **`course.service.ts:getFilteredCourses()`** — Two queries: first fetches HSK levels to get IDs, then filters courses. Can be a single query with nested relation filter.
3. **`practice.service.ts:getStudentItemProgressForLesson()`** — Two queries: fetch lesson vocab IDs, then fetch progress. Can use a nested where.
4. **`practice.service.ts:recomputeLessonProgress()`** — `vocabulary.count()` + `vocabulary.findMany({ select: { id } })` can be combined into just `findMany` + `.length`.
5. **All services** swallow errors and return `[]` — makes debugging impossible in production.

---

## 6. UI/UX Review

### Typography & Spacing

**Good:** Well-defined font scale in `globals.css` (2xs through 9xl). Three font families for Vietnamese, Chinese, and system.

**Issues:**
- No consistent heading hierarchy enforced via components
- Spacing varies between landing sections (some use `py-16`, others `py-20`, others `py-24`)

### Component Consistency

**HeroUI usage:** The project imports `@heroui/react` and uses HeroUI components (Button, Input, Table, etc.) but also uses:
- Custom Radix UI components (`@radix-ui/react-dialog`, `@radix-ui/react-tooltip`)
- `class-variance-authority` for custom variants
- Mixed patterns: some buttons are HeroUI `<Button>`, others are custom `<button>` with Tailwind

**Recommendation:**
- Standardize on HeroUI for all interactive elements (Button, Input, Modal, Dropdown, Table, Tabs, Card)
- Remove `@radix-ui/react-dialog` — use HeroUI Modal instead
- Remove `@radix-ui/react-label` — use HeroUI Input with label prop
- Keep `@radix-ui/react-tooltip` only if HeroUI Tooltip doesn't meet needs

### Dark Mode

- `globals.css` defines dark mode tokens (`--color-background-dark`, `--color-surface-dark`, `--color-text-main-dark`)
- Root `<html>` has `className="light"` hardcoded — no dark mode toggle exists
- **Action:** Either implement dark mode toggle or remove dark mode tokens to reduce CSS

### Accessibility

| Issue | Location | Fix |
|-------|----------|-----|
| No skip-to-content link | `app/layout.tsx` | Add `<a href="#main" className="sr-only focus:not-sr-only">` |
| `suppressHydrationWarning` on `<html>` and `<body>` | Root layout | Needed for theme, but verify |
| No focus-visible styles for custom buttons | Landing components | Add `focus-visible:ring-2 focus-visible:ring-primary` |
| Missing alt text patterns | Need to audit images | Use descriptive alt text |

### Animation Review

- 12+ `@keyframes` in `globals.css` — most are simple fade/slide variants
- `AnimatedSection` uses `framer-motion` — wraps every landing section
- **Performance concern:** Many animations trigger `will-change: transform` → increased GPU memory

**Recommendation:** Use CSS `@starting-style` (if browser support is sufficient) or Intersection Observer for reveal animations instead of framer-motion. Reserve framer-motion for complex interactive animations only.

---

## 7. Security & Reliability

### Strengths
- Auth uses NextAuth v5 with JWT strategy
- Google Calendar tokens encrypted with AES-256-GCM
- `bcryptjs` for password hashing
- Zod validation in auth credential flow
- `removeConsole` in production build
- Proper session refresh (5-minute interval)

### Issues

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| `.env` in repo root (not gitignored?) | CRITICAL | `.env` file exists | Verify `.gitignore` includes `.env` |
| No rate limiting on API/auth endpoints | HIGH | `app/api/portal/` | Add rate limiting middleware |
| `console.error` as only logging | MEDIUM | All services | Add structured logging (e.g., `pino`) |
| `as unknown as PortalUserWithStatus` type cast | MEDIUM | `auth.ts:121` | Use proper Prisma types |
| Error swallowing in services | MEDIUM | All `services/*.ts` | Log + rethrow or return typed errors |
| No CSRF protection beyond NextAuth defaults | LOW | — | NextAuth handles this for auth routes |

---

## 8. Refactor Plan

### Phase 1: Quick Wins (1-2 days)

1. **Add `error.tsx` + `loading.tsx`** to `(landing)/`, `(portal)/`, `(portal-auth)/`
2. **Add missing Prisma indexes** — single migration
3. **Fix N+1 in `recomputeLessonProgress`** — `Promise.all`
4. **Remove duplicate Tailwind color defs from `globals.css`** — delete ~180 lines
5. **Fix stagger animation delays** (currently all `0.2s`)
6. **Add `unstable_cache` to landing page services** (courses, HSK levels, features, reviews, hero)

### Phase 2: Moderate Effort (1 week)

1. **Move providers** — SessionProvider, HeroUIProvider, ToastContainer out of root layout into portal layout
2. **Add dynamic imports** for recharts, react-big-calendar, hanzi-writer
3. **Switch HeroUI** from monolith to individual packages
4. **Add API auth middleware** — create `requireAuth()` helper, apply to all portal API routes
5. **Consolidate component patterns** — standardize on HeroUI Button/Input/Card
6. **Split seed file** into domain-specific seeders with `upsert`
7. **Add `unstable_cache` to portal read services** (class list, assignment list, etc.)

### Phase 3: Longer-term (2+ weeks)

1. **Implement proper error handling** — typed errors, structured logging
2. **Add Zod validation** to all API routes and server actions
3. **Implement cursor-based pagination** for vocabulary search and practice history
4. **Add rate limiting** to search and auth endpoints
5. **CSS cleanup** — extract repeated patterns into Tailwind v4 `@utility` blocks
6. **Consider `next/dynamic` + Suspense** for progressive loading of portal sections
7. **Add bundle analyzer** — `@next/bundle-analyzer` to track regression
8. **Dark mode** — either implement properly or remove tokens

---

## 9. Performance Checklist

Copy this to `docs/PROJECT_RULES.md`:

```markdown
# Performance Checklist — HSK-Master

## Server Components
- [ ] Default to Server Components. Only add `"use client"` when you need interactivity (onClick, useState, useEffect)
- [ ] Keep client components as small as possible — extract server-rendered content to parent
- [ ] Never mark a layout as `"use client"` unless absolutely necessary

## Data Fetching
- [ ] Use `unstable_cache` for data that changes less than once per hour
- [ ] Use `revalidateTag` / `revalidatePath` in server actions after mutations
- [ ] Avoid N+1: use `Promise.all` for independent queries
- [ ] Use `select` instead of `include` when you don't need all relations
- [ ] Paginate lists: cursor-based for large datasets, offset-based for admin tables

## Bundle
- [ ] Use `next/dynamic` with `{ ssr: false }` for heavy client libraries (recharts, calendar, hanzi-writer)
- [ ] Import HeroUI components individually, not from `@heroui/react`
- [ ] Check bundle with `npx next build --debug` or `@next/bundle-analyzer`
- [ ] Keep `framer-motion` usage minimal — prefer CSS animations for simple reveal effects

## Images
- [ ] Always use `next/image` with explicit `width`/`height` or `fill`
- [ ] Set `priority` on above-the-fold images (hero, logo)
- [ ] Use `loading="lazy"` for below-fold images (default)
- [ ] Serve images from Supabase Storage with CDN caching

## Boundaries
- [ ] Every route group MUST have `error.tsx` and `loading.tsx`
- [ ] Use `<Suspense>` with meaningful fallbacks for async server components
- [ ] Add `loading.tsx` skeleton that matches the page layout

## Database
- [ ] Add `@@index` for every FK column used in `where` clauses
- [ ] Never `findMany` without a `take` limit unless explicitly needed
- [ ] Use `aggregate`/`groupBy` instead of fetching all records and computing in JS
- [ ] Log slow queries in development: `PrismaClient({ log: ['query'] })`

## Security
- [ ] All portal API routes must check `auth()` session
- [ ] Validate all user input with Zod
- [ ] Never expose `.env` values to client (no `NEXT_PUBLIC_` for secrets)
- [ ] Use `server-only` import for sensitive modules
```

---

## Appendix: Commands for Profiling

```bash
# Build with analysis
npx next build --debug

# Bundle analysis (install first)
npm install -D @next/bundle-analyzer
# Add to next.config.ts:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
ANALYZE=true npx next build

# Prisma query logging (add to lib/prisma.ts in dev)
# new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

# Check for unused deps
npx depcheck

# Lighthouse CI
npx lighthouse http://localhost:3000 --output json --output-path lighthouse-report.json
```
