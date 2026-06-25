# Ruby HSK — Feature System Audit

**Date:** 2026-06-24
**Source:** Full codebase inspection — app/, components/, actions/, services/, prisma/schema.prisma, navigation.ts
**Mode:** Audit only — no code changes
**Scope:** Landing (public site) + Portal (Admin / Teacher / Student)

---

## Conventions

| Symbol | Meaning |
|---|---|
| ✅ Existing | Confirmed in code |
| ⚠ Partial | Scaffolding or stub exists, incomplete |
| ❌ Missing | Confirmed absent |
| 🚧 Stub | Route exists, shows "Đang phát triển" |
| 📌 Todo | Acknowledged, not on active roadmap |

Priority: P0 = blocker · P1 = core op · P2 = enhancement · P3 = advanced/optional

---

## 1. Landing / Public Site

| Feature | Status | Rec | Pri | Files | Notes |
|---|---|---|---|---|---|
| Hero Slideshow | ✅ | Keep | — | `components/landing/home/HeroSlideShowClient.tsx` | CMS via `HeroSlide` model, Embla Carousel |
| Feature Section | ✅ | Keep | — | `components/landing/home/FeatureSection.tsx` | CMS via `Feature` model |
| Course Catalog | ✅ | Keep | — | `app/(landing)/courses/page.tsx` | Filter by Category, paginated |
| Course Detail | ✅ | Keep | — | `app/(landing)/courses/[slug]/page.tsx` | Lesson list, vocabulary preview, enrollment CTA |
| Reviews / Testimonials | ✅ | Keep | — | `components/landing/home/ReviewsSection.tsx` | `Review` model, star ratings |
| CTA Stats Bar | ✅ | Keep | — | `components/landing/home/CTASectionClient.tsx` | `CtaStat` model, CountUp animation |
| About Page | ✅ | Keep | — | `app/(landing)/about/page.tsx` | School intro, gallery |
| Photo Gallery | ✅ | Keep | — | `components/landing/home/gallery/` | `Album`/`Photo` models, Supabase Storage URLs |
| Contact Form | ✅ | Improve | P1 | `app/(landing)/contact/page.tsx` | Manual useState, no RHF+Zod, no auto-response |
| SEO Metadata | ✅ | Keep | — | `services/metadata.service.ts` | `PageMetadata` model, dynamic `generateMetadata()` |
| Privacy / Terms | ✅ | Keep | — | `app/(landing)/privacy/`, `app/(landing)/terms/` | Static legal pages |
| `/system-design` | ✅ | Keep (noindex) | — | `app/(landing)/system-design/` | noindex added 2026-06-18 |
| **Hero Inline Lead Form** | ❌ | **Add** | **P1** | `app/(landing)/page.tsx` | `Registration` model ready; 3-field inline form |
| **Trial Lesson CTA** | ❌ | **Add** | **P1** | New section or hero button | Product decision: preview content vs consultation |
| **Sitemap + robots.txt** | ❌ | **Add** | **P1** | `app/sitemap.ts`, `app/robots.ts` | Disallow `/portal/*`, `/api/*`, `/system-design` |
| FAQ Section | ❌ | Add | P2 | New component + optional `FAQItem` model | Static copy or CMS-driven |
| HSK Learning Path Visual | ❌ | Add | P2 | New landing section | `HSKLevel` data available; HSK 1→6 stepper |
| Vocabulary Preview Widget | ❌ | Add | P2 | New landing section | 3–5 HSK 1 words, no login required |
| Teacher Team Section | ⚠ | Add | P2 | Homepage new section | Photos exist in `Album`; no structured `TeacherProfile` model |
| Blog / Resources | ❌ | Postpone | P3 | New `BlogPost` model needed | Requires editorial capacity |

**⚠ Active risk on branch `chore/setup-claude-ai-workflow`:**
`components/landing/common/` (Badge, Button, Input, etc.) deleted — landing pages migrated to `components/ui/`. Verify all landing pages build before merge.

---

## 2. Portal — Admin (SYSTEM_ADMIN only)

### 2a. CMS Modules

| Module | Status | Rec | Pri | Route | Component |
|---|---|---|---|---|---|
| Hero Slides | ✅ | Keep | — | `/portal/admin/hero-slides` | `components/portal/admin/hero-slides/` |
| Courses | ✅ | Keep | — | `/portal/admin/courses` | `components/portal/admin/courses/CoursesTable.tsx` |
| HSK Levels | ✅ | Keep | — | `/portal/admin/hsk-levels` | `components/portal/admin/hsk-levels/` |
| Categories | ✅ | Keep | — | `/portal/admin/categories` | `components/portal/admin/categories/` |
| Albums | ✅ | Keep | — | `/portal/admin/albums` | `components/portal/admin/albums/` |
| Reviews | ✅ | Keep | — | `/portal/admin/reviews` | `components/portal/admin/reviews/` |
| Features | ✅ | Keep | — | `/portal/admin/features` | `components/portal/admin/features/` |
| CTA Stats | ✅ | Keep | — | `/portal/admin/cta-stats` | `components/portal/admin/cta-stats/` |
| SEO Metadata | ✅ | Keep | — | `/portal/admin/seo` | `components/portal/admin/seo/SeoTable.tsx` |

### 2b. Management Modules

| Module | Status | Rec | Pri | Route | Notes |
|---|---|---|---|---|---|
| Dashboard | ⚠ | Improve | P2 | `/portal/admin` | Sparse — no activity feed, no pending counts |
| User Management | ✅ | Keep | — | `/portal/admin/users` | Full CRUD, `UsersTable.tsx` |
| Registrations | ⚠ | Improve | P1 | `/portal/admin/registrations` | View only; no status pipeline |
| Teacher Management | ❌ | Add | P2 | `/portal/admin/teachers` (new) | Derived from PortalUser role=TEACHER; no schema change needed |
| **Finance / Tuition** | ❌ | 📌 Todo | — | `/portal/admin/finance` (future) | Entire domain absent from schema |
| Reports | ❌ | — | — | — | Removed from roadmap per user decision |

---

## 3. Portal — Teacher (TEACHER role)

| Module | Status | Rec | Pri | Route | Notes |
|---|---|---|---|---|---|
| Dashboard | ✅ | Keep | — | `/portal/teacher` | Stats + today schedule + recent submissions |
| Classes | ✅ | Keep | — | `/portal/teacher/classes` | Own classes only; `ClassesTable.tsx` |
| Class Detail | ✅ | Keep | — | `/portal/teacher/classes/[classId]` | Students, schedule, assignments |
| Students | ✅ | Keep | — | `/portal/teacher/students` | Own class students only |
| Schedule | ✅ | Keep | — | `/portal/teacher/schedule` | `BigCalendarView` + Google Calendar sync |
| Attendance | ✅ | Keep | — | `/portal/teacher/attendance` | `AttendanceMatrixView` + Excel export |
| Assignments | ✅ | Keep | — | `/portal/teacher/assignments` | Create/edit/grade; `AssignmentsTable.tsx` |
| Grade Book | ❌ | 📌 Todo | — | — | No aggregate scores view per assignment |
| **Quizzes** | ⚠ **BUG** | **Fix P0** | P0 | `/portal/teacher/quizzes` | Nav item exists but page only allows STUDENT → `notFound()` |

---

## 4. Portal — Student (STUDENT role)

| Module | Status | Rec | Pri | Route | Notes |
|---|---|---|---|---|---|
| Dashboard | ✅ | Keep | — | `/portal/student` | Continue learning + streak + upcoming + assignments |
| Schedule | ✅ | Keep | — | `/portal/student/schedule` | Read-only class schedule |
| Classes | ✅ | Keep | — | `/portal/student/classes` | Enrolled classes |
| Attendance | ✅ | Keep | — | `/portal/student/attendance` | `StudentAttendanceView` read-only |
| Assignments | ✅ | Keep | — | `/portal/student/assignments` | Submit + view feedback |
| Practice / SRS | ✅ | Keep | — | `/portal/student/practice` | 5 tabs: Flashcard, Quiz, Listen, Write, Lookup |
| Practice Session | ✅ | Keep | — | `/portal/student/practice/[level]/[lessonSlug]` | `LessonPracticeView` client |
| Vocabulary | ✅ | Keep | — | `/portal/student/vocabulary` | Browse + search |
| Bookmarks | ⚠ | Verify | — | `/portal/student/bookmarks` | Implemented; `vocabulary.hanzi` vs `vocabulary.word` field mismatch to verify |
| Progress | ✅ | Keep | — | `/portal/student/progress` | `PortalLessonProgress` aggregation |
| Quizzes | 🚧 | Build out | P2 | `/portal/student/quizzes` | "Đang phát triển" stub |

---

## 5. Cross-cutting / Portal UX

| Issue | Status | Rec | Pri | Risk |
|---|---|---|---|---|
| Per-module `loading.tsx` | ❌ Missing on all modules | Add | P0 | Blank flash on every portal navigation — R15 |
| Per-module `error.tsx` | ❌ Missing on all modules | Add | P0 | Unhandled page crashes — R17 |
| RBAC Layer 3 guards | ⚠ Inconsistent | Audit all pages | P0 | Potential unauthorized access — R04 |
| Form validation (RHF + Zod) | ❌ All forms use `useState` | Add to new forms | P1 | Poor UX, data quality — R10 |
| AI Chatbot discoverability | ⚠ Floating bubble only | Add sidebar nav + tooltip | P1 | Feature undiscovered — R19 |
| Google Calendar scope | ⚠ Forced on all users | Teacher-only incremental auth | P2 | Reduced OAuth conversion — R02 |
| `documents` bucket access | ⚠ Public bucket | Signed URLs or RLS | P0 | Student work publicly accessible — R09 |
| Dual Supabase URLs in next.config.ts | ⚠ | Verify + remove inactive | P0 | Storage/Realtime reliability — R07 |
| Profile / Settings page | ⚠ Partial | Improve | P2 | No password change, no notification prefs |

---

## 6. Special Integrations

| Integration | Status | Rec | Pri | Files |
|---|---|---|---|---|
| Supabase Realtime Notifications | ✅ | Keep | — | `providers/notification-provider.tsx`, `actions/notification.actions.ts` |
| Google Calendar Sync (Teacher) | ✅ | Keep | — | `app/api/portal/calendar/`, `services/portal/schedule.service.ts` |
| ExcelJS Attendance Export | ✅ | Keep | — | `app/api/portal/attendance/export/route.ts` |
| DeepSeek AI Chatbot | ✅ | Improve (discoverability) | P1 | `components/portal/chat/`, `app/api/portal/chat/` |
| OG Image Generation | ✅ | Keep | — | `app/api/og/route.tsx` |
| Supabase Storage (avatar + docs) | ✅ | Keep | — | `lib/supabase-storage.ts`, `app/api/portal/upload/` |
