# Ruby HSK — Development Workflow Log

Append a new entry here after completing any significant task (new feature, bug fix, refactor, audit).

Format per entry:
```
## YYYY-MM-DD — [short description]
**Files changed:** list
**Why:** motivation
**Notes:** anything non-obvious for future sessions
```

---

## 2026-06-19 — Full project audit + documentation system setup

**Files changed:**
- CLAUDE.md (updated to accurate tech stack + new skill map)
- .claude/skills/ (9 skill files — 7 new, 2 updated)
- .claude/worklogs/ruby-hsk/ (11 new worklog files)

**Why:** Establish accurate ground truth for all future Claude Code sessions after discovering multiple gaps in previous docs (react-hook-form listed as used but not deployed, framer-motion unconfirmed, two Supabase URLs, incomplete tailwind content array).

**Notes:**
- react-hook-form: installed but zero useForm() calls anywhere — all forms use manual useState
- pg package: installed, zero imports — dead dep, remove with `npm uninstall pg @types/pg`
- next-intl: installed, not wired at all — dead dep, remove with `npm uninstall next-intl`
- tailwind.config.js content array: only has HeroUI paths — missing app/**, components/** (R11)
- LanguageSwitcher: renders in Header but no i18n backing — misleads users (R17)
- Two Supabase project URLs in next.config.ts — verify which is production (R07)
- Supabase boundary: all compliant, zero violations found
- 25 risks documented in RISK_REGISTER.md; P0 are R11, R17, R10, R05, R07

## 2026-06-24 — Phase 5 landing migration + form validation overhaul

**Changed:**
- `components/landing/common/` — deleted (17 files; all 21 consumers migrated to `@/components/ui`)
- `components/ui/` — extended Button/Badge/Input/Select/Textarea/Tooltip/Spinner/Pagination/Checkbox/Switch/Accordion with compat props and new variants
- `components/ui/primitives/OptimizedImage.tsx` — new file
- `app/globals.css` — added `--font-display`, `--font-vietnamese`, `.section-tian-zi-ge` grid watermark
- `providers/portal-ui-provider.tsx` — replaced integer counter with `Map<string,number>` key-based loading tracker; route-change reset now clears the Map
- `components/ui/navigation/Accordion.tsx` — added `variant="dark"` for use on colored backgrounds
- `components/landing/shared/FooterFAQ.tsx` — replaced custom toggle with `<Accordion variant="dark">`
- `app/(landing)/contact/actions.ts` — reads actual phone from formData (was hardcoded "CONTACT_FORM"); email/message now optional
- `lib/validations/review.ts`, `contact.ts`, `auth.ts` — new Zod schemas
- `components/landing/home/ReviewForm.tsx` — rewritten with RHF + Zod + FormField
- `components/landing/contact/ContactForm.tsx` — rewritten with RHF + Zod + FormField (bridges to Server Action via FormData)
- `components/portal/auth/LoginForm.tsx` — rewritten with RHF + Zod + FormField
- `components/portal/auth/RegisterForm.tsx` — rewritten with RHF + Zod + FormField

**Why:** Phase 5 of UI migration (retire landing/common, adopt design system), fix stuck loading provider, standardize form validation across landing + auth.

**Notes:**
- `ContactForm` still calls server action via `FormData` (reconstructed from RHF values) — server action signature unchanged
- Loading provider: default key is `"__global__"` for axios interceptor calls; named keys allow per-operation tracking
- Accordion dark variant designed for Footer's yellow→red gradient background

## 2026-06-25 — Full database refactor: type fixes, enum normalization, service hardening

**Changed (schema + migrations):**
- `prisma/schema.prisma` — `HSKLevel.vocabularyCount` String→Int; added `updatedAt` to Lesson/Vocabulary/Photo/GrammarPoint; added `RegistrationStatus` enum + `Registration.status`; added 13 new Prisma enums; converted 17 String fields to their enum types; expanded 4 enums to match `enums/portal/common.ts` values
- `prisma/migrations/20260624000000_schema_cleanups/migration.sql` — Phase 1 migration (manual, USING cast with regexp_replace for "150 từ" data)
- `prisma/migrations/20260624000001_enum_normalization/migration.sql` — Phase 2: DROP DEFAULT → ALTER TYPE → SET DEFAULT pattern for all 17 fields
- `prisma/migrations/20260624000002_expand_enums/migration.sql` — Phase 2 addendum: ADD VALUE IF NOT EXISTS for NotificationType/SubmissionStatus/AssignmentStatus/QuestionType

**Changed (code):**
- `services/hsk.service.ts` — `vocabularyCount: string` → `number`
- `prisma/seed.ts` — 6 HSKLevel vocabularyCount strings ("150 từ" etc.) → integers
- `interfaces/portal/admin.ts` — `IHSKLevel.vocabularyCount` and `ICreateHSKLevelDTO.vocabularyCount` → number; added `status` to `IRegistration`
- `components/portal/admin/registrations/RegistrationsTable.tsx` — added status badge column
- `services/portal/notification.service.ts` — `NotificationData.type: string` → `NotificationType` (from `@prisma/client`)
- `actions/submission.actions.ts` — switched `NotificationType` import from `@/enums/portal/common` to `@prisma/client`; fixed string literals to enum references
- `app/api/portal/submissions/route.ts` — replaced `new PrismaClient()` with singleton `prisma` from `@/lib/prisma`
- `services/portal/profile.service.ts` — added `PROFILE_SELECT` constant; applied to all 3 functions to exclude `password` and `notes` fields
- `services/portal/student.service.ts` — eliminated N+1 first query (class IDs lookup); single `Promise.all([findMany, count])` now uses nested `class: { teacherId }` filter
- Many ripple type fixes: `attendance.actions.ts`, `assignment.service.ts`, `class.service.ts`, `dashboard.service.ts`, `practice.service.ts`, `practice-skill.service.ts`, `seed-portal.ts`, `HSKLevelCard.tsx`, `VocabularyClient.tsx`, `assignments/route.ts`, `classes/route.ts`, `attendance/route.ts`

**Why:** Full DB audit revealed: 1 critical type bug (vocabularyCount stored as string "150 từ"), 17 String fields that should be typed Prisma enums, 4 models missing updatedAt, 1 connection-pool leak (new PrismaClient per request), 1 security gap (profile endpoint returning password hash), N+1 query.

**Notes:**
- `prisma migrate dev` is non-interactive — use `migrate deploy` with manually-written SQL for all migrations
- PostgreSQL table names are PascalCase when no `@@map` (e.g., `"HSKLevel"`, `"Registration"`) — NOT snake_case
- `ALTER TYPE ... ADD VALUE` cannot run in a transaction (pre-existing enum types) — confirmed works fine with `prisma migrate deploy` which doesn't add BEGIN/COMMIT wrappers
- `enums/portal/common.ts` has larger TypeScript enums (e.g. 20 NotificationType values) — Prisma schema must match or runtime DB errors occur for unrecognized values
- Pattern for String→Enum with existing DEFAULT: `DROP DEFAULT → ALTER TYPE USING cast → SET DEFAULT`
- `RegistrationStatus` is the only new enum with a `Registration.status` field (was missing entirely from the model)

## 2026-06-25 — Homepage Improvement Plan P2-6, P2-7, P3-1: photo, component splits, PWA

**Changed:**
- `constants/landing/teacher-profile.ts` — added `heroImageUrl` field (Supabase-hosted; replace with landscape classroom photo when client provides one)
- `components/landing/about/AboutHero.tsx` — replaced Unsplash stock photo URL with `TEACHER_INFO.heroImageUrl`
- `components/landing/about/TeacherProfile.tsx` — now a thin 12-line composition wrapper
- `components/landing/about/TeacherHero.tsx` — new: avatar, name, bio section
- `components/landing/about/TeacherAchievements.tsx` — new: achievements grid
- `components/landing/about/TeacherStats.tsx` — new: stats grid
- `components/landing/home/CoursesSectionClient.tsx` — now a thin orchestrator (state + layout)
- `components/landing/home/CourseFilterSidebar.tsx` — new: desktop sidebar + mobile dropdown filter
- `components/landing/home/CoursesGrid.tsx` — new: course cards grid
- `package.json` / `node_modules` — added `@ducanh2912/next-pwa` (maintained App Router fork of next-pwa)
- `next.config.ts` — wrapped with `withPWA`; disabled in dev; portal routes excluded via `navigateFallbackDenylist` + `exclude`; landing pages + course detail cached with StaleWhileRevalidate (10 min TTL)
- `.gitignore` — added `public/sw.js`, `public/workbox-*.js` generated entries

**Why:** P2-6: AboutHero had hard-coded Unsplash URL (external dep, wrong alt text, no local asset control). P2-7: TeacherProfile (170 lines) and CoursesSectionClient (208 lines) were over the 200-line guideline and had mixed concerns. P3-1: app was installable (manifest complete) but had no offline capability.

**Notes:**
- `@ducanh2912/next-pwa` chosen over original `next-pwa` (archived) and `@serwist/next` (more complex); supports Next.js 13+ App Router; TypeScript declarations included
- `TeacherProfile` sub-components are not re-exported from an index (only used by the parent wrapper)
- `CoursesGrid` retains the non-functional "Xem tất cả khóa học" button as-is (no href/onClick in original)
- `heroImageUrl` currently shares the same Supabase avatar path — needs a separate landscape photo from the client

## 2026-06-25 — Homepage Improvement Plan P3: revalidatePath audit + verification

**Changed:**
- `actions/admin.actions.ts` — added 7 missing `revalidatePath` calls:
  - 4 delete actions (deleteHSKLevel, deleteReview, deleteFeature, deleteCtaStat) were missing `revalidatePath("/")`
  - 3 PageMetadata actions: create/update now call `revalidatePath(result.pagePath)` to immediately clear the specific landing page's ISR cache; delete calls `revalidatePath("/")`

**Why:** Admin deletes on homepage-affecting models (reviews, features, CTA stats, HSK levels) did not clear the ISR cache, so homepage would show deleted items until the 1h ISR timer expired. PageMetadata updates had the same problem — updating SEO for `/courses` had no effect until cache expired.

**Notes:**
- P3-2 (Course JSON-LD) was already done: `generateCourseSchema` + `generateBreadcrumbSchema` called in `/courses/[slug]/page.tsx`
- P3-3 audit also confirmed: `prefers-reduced-motion` already in globals.css + AnimatedSection.tsx (line 30–33 `window.matchMedia` check); `/privacy` and `/terms` already have static `export const metadata`
- Course mutations don't exist in admin.actions.ts (admin courses view is read-only) — no revalidatePath gap there
- P3-1 (service worker) remains pending — requires `next-pwa` npm package install

## 2026-06-25 — Select scroll-jump fix, CourseFilter multi-select, landing audit

**Changed:**
- `app/globals.css` — added `scrollbar-gutter: stable` to `html` (prevents layout shift when Radix overlays remove scrollbar); added `@keyframes heroFadeInUp` + `.animate-heroFadeInUp` utility (moved from HeroSlideContent inline style)
- `components/ui/forms/Select.tsx` — removed `h-(--radix-select-trigger-height)` from Viewport (wrong for `position="popper"` mode; caused dropdown to be the same height as trigger)
- `services/course.service.ts` — `CourseFilters`: `categoryId?: string` → `categoryIds?: string[]`, `hskLevelGroup?: string` → `hskLevelGroups?: string[]`; updated Prisma where clauses to use `{ in: [...] }` with `flatMap` across group ranges
- `app/(landing)/courses/actions.ts` — updated `getCoursesAction` to accept and pass `hskLevels: string[]` and `categories: string[]`
- `app/(landing)/courses/page.tsx` — parses comma-separated URL params (`?hskLevel=beginner,intermediate`)
- `app/(landing)/courses/CoursesClient.tsx` — state changed to `string[]`; URL building joins with comma; toggle handlers replace single-value pattern
- `components/landing/courses/CourseFilter.tsx` — props changed to `selectedHskLevels: string[]` / `selectedCategories: string[]`; checkbox toggle uses a pure `toggleItem` helper; "Tất cả" pseudo-checkbox removed (empty array = all)
- `components/landing/courses/CourseCard.tsx` — all nullable props made optional (`description?: string | null`) for compatibility with `CourseWithCategory`
- `app/(landing)/courses/CoursesGrid.tsx` — imported `CourseWithCategory` type; removed local `any`-typed interface
- `components/landing/home/HeroSlideContent.tsx` — replaced raw `<a href>` with `<Link href>` (prevents full page reloads); removed `<style jsx>` block (keyframe moved to globals.css)
- `components/landing/home/SolutionSection.tsx` — replaced raw styled `<Link className="inline-flex...">` CTA with `<Button variant="gradient">` component

**Why:** Select scroll-jump caused by Radix removing body scrollbar on open — `scrollbar-gutter: stable` reserves space permanently. CourseFilter was limited to one checkbox per group; changed to true multi-select with array state and comma-separated URL params. Landing audit found `<a>` navigation bug (full reloads instead of client routing) and raw styled button that bypassed the design system.

**Notes:**
- `scrollbar-gutter: stable` also fixes future layout-shift for any other Radix overlay (Modal, Popover, etc.)
- Select Viewport `h-(--radix-select-trigger-height)` was intended for `position="item-aligned"` mode only — with `position="popper"` it made the viewport as short as the trigger
- Multi-select URL format: `?hskLevel=beginner,intermediate&category=id1,id2` (comma-separated single param, not repeated params)
- `CourseCard` props widened to optional to match `CourseWithCategory` (Prisma optionals are `string | null | undefined`)
