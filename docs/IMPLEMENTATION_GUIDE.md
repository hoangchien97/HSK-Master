# HSK-Master — Implementation Guide & AI Prompt Reference

> **Purpose:** This document serves as a prompt and reference guide for AI assistants (or developers) implementing changes from the [HSK Audit Report](./HSK_AUDIT_REPORT.md).

---

## Quick Context Prompt

When prompting an AI assistant to work on this project, start with:

```
PROJECT: HSK-Master — HSK Learning Portal + Landing Page
STACK: Next.js 16.1.1 (App Router), React 19, Prisma 5.22 + Supabase Postgres, TailwindCSS v4, HeroUI, framer-motion
AUTH: NextAuth v5 beta (Google OAuth + Credentials, JWT strategy)
DEPLOY: Vercel

RULES:
- Maximize use of HeroUI components with consistent variants
- DB target: Supabase Postgres — prioritize query efficiency
- Default to Server Components, minimize "use client" scope
- Use unstable_cache for read-heavy data (landing pages)
- Use revalidatePath/revalidateTag in Server Actions after mutations
- Add @@index for FK columns used in WHERE clauses
- Dynamic import heavy client libs (recharts, react-big-calendar, hanzi-writer)
- Every route group needs error.tsx + loading.tsx
- Validate all input with Zod; auth-guard all portal API routes
```

---

## Phase 1 Implementation Tasks (Quick Wins — 1-2 days)

### Task 1.1: Add Error/Loading Boundaries

```
PROMPT: Create error.tsx and loading.tsx files for the following route groups:
- app/(landing)/error.tsx — branded error page with retry button
- app/(landing)/loading.tsx — skeleton with spinning loader
- app/(portal)/error.tsx — portal-styled error with sidebar context
- app/(portal)/loading.tsx — sidebar + content skeleton
- app/(portal-auth)/error.tsx — simple centered error
- app/(portal-auth)/loading.tsx — centered spinner

Requirements:
- error.tsx must use "use client"
- loading.tsx should match the layout structure (sidebar for portal)
- Use brand colors (--color-primary: #ec131e)
- Vietnamese text ("Đang tải...", "Đã xảy ra lỗi", "Thử lại")
```

**Files to create:**
- `app/(landing)/error.tsx` [NEW]
- `app/(landing)/loading.tsx` [NEW]
- `app/(portal)/error.tsx` [NEW]
- `app/(portal)/loading.tsx` [NEW]
- `app/(portal-auth)/error.tsx` [NEW]
- `app/(portal-auth)/loading.tsx` [NEW]

---

### Task 1.2: Add Missing Prisma Indexes

```
PROMPT: Add the following @@index directives to prisma/schema.prisma and run migration.

Add to Vocabulary model:
  @@index([lessonId])

Add to Lesson model:
  @@index([courseId, order])
  @@index([slug])

Add to Course model:
  @@index([isPublished, categoryId])
  @@index([isPublished, hskLevelId])

Add to PortalItemProgress model:
  @@index([studentId, status])

Add to PortalPracticeSession model:
  @@index([studentId, lessonId])

Add to PortalPracticeAttempt model:
  @@index([sessionId])

Add to PortalAttendance model:
  @@index([classId, date])

Add to PortalAssignment model:
  @@index([classId, status])

Then run: npx prisma migrate dev --name add_missing_indexes
```

**Files to modify:**
- `prisma/schema.prisma` [MODIFY]

---

### Task 1.3: Fix N+1 in recomputeLessonProgress

```
PROMPT: Refactor recomputeLessonProgress in services/portal/practice.service.ts.

Current: 5 sequential queries (vocabulary.count, vocabulary.findMany, itemProgress.findMany, sessions.findMany, lessonProgress.findUnique).

Target:
1. vocabulary.findMany (get IDs + totalCount in one go)
2. Promise.all([itemProgress.findMany, sessions.aggregate({_sum: durationSec}), lessonProgress.findUnique])
3. lessonProgress.upsert (unchanged)

Also: Extract notification logic into separate async function (fire-and-forget).
```

**Files to modify:**
- `services/portal/practice.service.ts` [MODIFY]

---

### Task 1.4: Clean globals.css

```
PROMPT: In app/globals.css:
1. Remove lines 26-206 (Tailwind standard color redeclarations in lab() format — these are default in Tailwind v4)
2. Fix stagger animation delays (lines 522-534) — currently all set to 0.2s:
   - .stagger-children > *:nth-child(1) → 0.1s
   - .stagger-children > *:nth-child(2) → 0.2s
   - .stagger-children > *:nth-child(3) → 0.3s
   - .stagger-children > *:nth-child(4) → 0.4s
   Same for .stagger-1 through .stagger-4

Keep: Brand colors (:8-21), custom colors (:208-340), animations, utilities.
```

**Files to modify:**
- `app/globals.css` [MODIFY]

---

### Task 1.5: Add unstable_cache to Landing Services

```
PROMPT: Add unstable_cache to the following service functions in services/:
- course.service.ts: getCourses, getCourseBySlug, getCoursesWithCategory, getCategories
- hero.service.ts: getHeroSlides
- feature.service.ts: getFeatures
- review.service.ts: getReviews
- cta.service.ts: getCtaStats
- hsk.service.ts: getHskLevels
- album.service.ts: getAlbums

Pattern:
  import { unstable_cache } from "next/cache";
  export const getCourses = unstable_cache(async () => { /* existing logic */ }, ["cache-key"], { revalidate: 3600, tags: ["tag"] });

For mutation actions, add revalidateTag("courses") after course updates.
```

**Files to modify:**
- `services/course.service.ts` [MODIFY]
- `services/hero.service.ts` [MODIFY]
- `services/feature.service.ts` [MODIFY]
- `services/review.service.ts` [MODIFY]
- `services/cta.service.ts` [MODIFY]
- `services/hsk.service.ts` [MODIFY]
- `services/album.service.ts` [MODIFY]

---

## Phase 2 Implementation Tasks (1 week)

### Task 2.1: Move Providers Out of Root Layout

```
PROMPT: Refactor app/layout.tsx:
1. Remove SessionProvider, HeroUIProvider, TooltipPrimitive.Provider, ToastContainer, WebVitals from root layout
2. Keep only: fonts, NextTopLoader, structured data, basic body setup
3. Move SessionProvider + HeroUIProvider + ToastContainer to app/(portal)/layout.tsx
4. Move SessionProvider to app/(portal-auth)/layout.tsx (but remove "use client" — use it as server layout wrapper)
5. Landing pages should have NO client providers in their tree
```

### Task 2.2: Dynamic Imports for Heavy Libraries

```
PROMPT: Add next/dynamic imports:
1. Find all imports of recharts, react-big-calendar, hanzi-writer across components/portal/
2. Replace with: const Component = dynamic(() => import('lib').then(m => m.Component), { ssr: false, loading: () => <Skeleton /> })
3. Add appropriate skeleton loaders for each
```

### Task 2.3: HeroUI Individual Imports

```
PROMPT:
1. Install individual HeroUI packages: @heroui/button @heroui/input @heroui/modal @heroui/table @heroui/card @heroui/tabs @heroui/dropdown @heroui/chip @heroui/badge @heroui/avatar @heroui/spinner @heroui/tooltip @heroui/popover @heroui/theme
2. Find all imports from "@heroui/react" across the codebase
3. Replace with individual package imports
4. Update globals.css @source to only include used component themes
5. Remove @heroui/react from package.json
```

### Task 2.4: API Auth Middleware

```
PROMPT: Create lib/api-auth.ts with requireAuth(roles?: string[]) helper.
Then audit all files in app/api/portal/**/route.ts and ensure every handler:
1. Calls requireAuth() at the top
2. Checks role if route is role-specific
3. Returns 401/403 appropriately
```

### Task 2.5: Standardize Component Patterns

```
PROMPT: Audit components/portal/ and components/landing/:
1. Identify all custom <button> elements — replace with HeroUI <Button>
2. Identify all custom <input> — replace with HeroUI <Input>
3. Ensure consistent variant usage (color="primary", variant="solid"/"bordered"/"light")
4. Remove @radix-ui/react-dialog — use HeroUI Modal
5. Remove @radix-ui/react-label — use HeroUI Input with label prop
```

---

## Phase 3 Implementation Tasks (2+ weeks)

### Task 3.1: Zod Validation Everywhere

```
PROMPT: Add Zod schemas for all Server Actions in actions/*.actions.ts and all API routes in app/api/portal/**/route.ts.
Pattern:
  const schema = z.object({ ... });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };
```

### Task 3.2: Cursor-based Pagination

```
PROMPT: Implement cursor-based pagination for:
1. Vocabulary search (portal vocabulary page)
2. Practice history/attempt listing
3. Notification listing

Use Prisma cursor pagination: { cursor: { id: lastId }, skip: 1, take: limit }
```

### Task 3.3: Structured Logging

```
PROMPT: Replace all console.error/console.log in services/ and actions/ with structured logging.
Options: pino, or a simple wrapper that includes timestamp, level, context.
Remove console.log from production paths (the compiler already strips them, but be explicit).
```

### Task 3.4: Bundle Analyzer Setup

```
PROMPT: Install and configure @next/bundle-analyzer:
1. npm install -D @next/bundle-analyzer
2. Update next.config.ts to wrap with withBundleAnalyzer
3. Add "analyze" script to package.json: "ANALYZE=true next build"
4. Document baseline bundle sizes
```

---

## Design Tokens Reference

When implementing UI components, use these tokens from `globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#ec131e` | Primary brand red |
| `--color-primary-hover` | `#c91019` | Primary hover |
| `--color-secondary-500` | `#0ea5e9` | Secondary blue |
| `--color-accent-400` | `#facc15` | Accent yellow |
| `--color-success-500` | `#22c55e` | Success green |
| `--color-warning-500` | `#f59e0b` | Warning amber |
| `--color-error-500` | `#ef4444` | Error red |
| `--color-background-light` | `#f8f6f6` | Light bg |
| `--color-surface-light` | `#ffffff` | Card/surface bg |
| `--color-text-main` | `#181111` | Primary text |
| `--color-text-muted` | `#896163` | Muted text |

**Typography:**
- Vietnamese: `font-vietnamese` (Noto Sans)
- Chinese: `font-chinese` (Noto Sans SC)
- Display: `font-display` (combined)

**HeroUI Variants (prefer these):**
```tsx
<Button color="primary" variant="solid">CTA</Button>
<Button color="default" variant="bordered">Secondary</Button>
<Button color="danger" variant="light">Delete</Button>
<Input variant="bordered" label="Email" />
<Card className="shadow-soft">Content</Card>
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Page | `page.tsx` | `app/(landing)/courses/page.tsx` |
| Layout | `layout.tsx` | `app/(portal)/layout.tsx` |
| Error | `error.tsx` | `app/(landing)/error.tsx` |
| Loading | `loading.tsx` | `app/(landing)/loading.tsx` |
| Client component | `*Client.tsx` | `CoursesClient.tsx` |
| Service | `*.service.ts` | `course.service.ts` |
| Server Action | `*.actions.ts` | `assignment.actions.ts` |
| Hook | `use*.ts` | `useSpeech.ts` |
| Constant | `*.ts` | `constants/brand.ts` |
| Interface | `*.ts` | `interfaces/course.ts` |
| Enum | `*.ts` | `enums/portal.ts` |
