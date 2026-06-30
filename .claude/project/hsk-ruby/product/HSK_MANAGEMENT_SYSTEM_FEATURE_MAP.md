# Ruby HSK — Management System Feature Map

**Date:** 2026-06-24
**Product:** Vietnamese Chinese-learning web app for a Hanoi language center
**URL:** https://ruby-hsk.vercel.app/ | `/portal`
**Roles:** SYSTEM_ADMIN · TEACHER · STUDENT

---

## System Overview

Ruby HSK là hệ thống quản lý học tiếng Hoa bao gồm:
- **Landing site:** marketing, course catalog, lead capture
- **Admin portal:** quản lý nội dung, người dùng, lớp học, vận hành
- **Teacher portal:** quản lý lớp học, điểm danh, bài tập, lịch giảng dạy
- **Student portal:** luyện tập SRS, từ vựng, tiến độ, lịch học, bài tập

---

## Domain A — Landing / Public Site

**Mục đích:** Thu hút học viên tiềm năng, giải thích chương trình, tạo leads

| Feature | Status | Priority |
|---|---|---|
| Hero slideshow CMS | ✅ | — |
| Feature highlights CMS | ✅ | — |
| Course catalog + detail | ✅ | — |
| HSK levels presentation | ✅ | — |
| Reviews / testimonials CMS | ✅ | — |
| CTA stats bar CMS | ✅ | — |
| About + photo gallery | ✅ | — |
| Contact + lead capture form | ✅ (separate page) | Improve P1 |
| SEO metadata CMS | ✅ | — |
| **Hero inline lead form** | ❌ | P1 |
| **Trial lesson / free preview CTA** | ❌ | P1 |
| **Sitemap + robots.txt** | ❌ | P1 |
| FAQ section | ❌ | P2 |
| HSK learning path visualization | ❌ | P2 |
| Vocabulary preview (no login) | ❌ | P2 |
| Teacher team section | ❌ | P2 |

---

## Domain B — Basic Profiles

**Mục đích:** Quản lý danh sách người dùng, hồ sơ học viên và giáo viên

| Feature | Status | Roles | Priority |
|---|---|---|---|
| User accounts (CRUD) | ✅ | Admin | — |
| Student profiles | ✅ | Admin, Teacher(own) | — |
| User profile page | ✅ | All | — |
| Teacher profiles (dedicated view) | ❌ | Admin | P2 |
| Registration pipeline | ⚠ | Admin | P1 |

**Location:** `app/(portal)/portal/[role]/users/`, `app/(portal)/portal/profile/`

---

## Domain C — Class Management

**Mục đích:** Tạo và quản lý lớp học, lịch học, học viên tham gia

| Feature | Status | Roles | Priority |
|---|---|---|---|
| Classes CRUD | ✅ | Admin(all), Teacher(own), Student(view) | — |
| Student enrollment | ✅ | Admin | — |
| Schedule (recurring series + sessions) | ✅ | Admin, Teacher, Student(read) | — |
| Google Calendar sync | ✅ | Teacher | — |
| Class detail (students + schedule + assignments) | ✅ | Admin, Teacher | — |

**Location:** `app/(portal)/portal/[role]/classes/`, `app/(portal)/portal/[role]/schedule/`
**Models:** `PortalClass`, `PortalClassEnrollment`, `PortalScheduleSeries`, `PortalSchedule`

**Removed from scope:**
- Rooms — 1 phòng duy nhất, dùng `location` string
- Shifts — không cần
- Class holidays — không ưu tiên

---

## Domain D — Learning Tracking

**Mục đích:** Theo dõi hiện diện, bài tập, tiến độ học của học viên

| Feature | Status | Roles | Priority |
|---|---|---|---|
| Attendance recording | ✅ | Admin, Teacher | — |
| Attendance read-only | ✅ | Student | — |
| Attendance Excel export | ✅ | Admin, Teacher | — |
| Assignments (create/grade/submit) | ✅ | All | — |
| SRS practice progress | ✅ | Student | — |
| Student progress → teacher view | ❌ | Teacher | P2 |
| Grade book (aggregate scores) | ❌ | Teacher | 📌 Todo |
| Periodic evaluations / formal tests | ❌ | All | 📌 Todo |
| Student quizzes (full) | 🚧 Stub | Student | P2 |

**Location:** `app/(portal)/portal/[role]/attendance/`, `/assignments/`, `/practice/`, `/progress/`
**Models:** `PortalAttendance`, `PortalAssignment`, `PortalAssignmentSubmission`, `PortalLessonProgress`, `PortalPracticeSession`

---

## Domain E — Learning Materials

**Mục đích:** Quản lý nội dung khóa học, bài học, từ vựng; học viên luyện tập

| Feature | Status | Roles | Priority |
|---|---|---|---|
| Courses CMS | ✅ | Admin | — |
| HSK Levels CMS | ✅ | Admin | — |
| Lessons + Vocabulary management | ✅ | Admin | — |
| Grammar Points | ✅ | Admin | — |
| Practice SRS — Flashcard | ✅ | Student | — |
| Practice SRS — Quiz | ✅ | Student | — |
| Practice SRS — Listen (Web Speech) | ✅ | Student | — |
| Practice SRS — Write (Hanzi Writer) | ✅ | Student | — |
| Practice SRS — Lookup | ✅ | Student | — |
| Vocabulary browse | ✅ | Student | — |
| Vocabulary bookmarks | ⚠ | Student | Verify |
| Resource library per class | ❌ | All | P3 |

**Location:** `app/(portal)/portal/[role]/practice/`, `/vocabulary/`, `/bookmarks/`
**Models:** `Course`, `Lesson`, `Vocabulary`, `GrammarPoint`, `HSKLevel`, `PortalItemProgress`, `PortalPracticeAttempt`

---

## Domain F — Finance / Tuition (📌 Todo)

**Mục đích:** Theo dõi học phí, giao dịch thu chi

| Feature | Status | Notes |
|---|---|---|
| Tuition payment tracking | ❌ Todo | Schema change: `TuitionPayment` |
| Tuition adjustments | ❌ Todo | Discount, exemption |
| Finance categories | ❌ Todo | Schema change: `FinanceCategory` |
| Finance transactions | ❌ Todo | Schema change: `FinanceTransaction` |

**Không triển khai cho đến khi có approval.**

---

## Domain G — Teacher Salary (📌 Todo)

**Mục đích:** Cấu hình và tính toán lương giáo viên

| Feature | Status | Notes |
|---|---|---|
| Salary configuration per teacher | ❌ Todo | Schema change: `TeacherSalaryConfig` |
| Teaching session log | ❌ Todo | Schema change: `TeachingSessionLog` |
| Salary calculation per period | ❌ Todo | |

**Không triển khai cho đến khi có approval.**

---

## Domain H — Special Integrations

| Integration | Status | Priority |
|---|---|---|
| Supabase Realtime notifications | ✅ | — |
| Google Calendar sync (Teacher) | ✅ | — |
| ExcelJS attendance export | ✅ | — |
| DeepSeek AI chatbot | ✅ (hidden) | Improve P1 |
| OG image generation | ✅ | — |
| Supabase Storage (avatar + docs) | ✅ | — |

---

## Active P0 Bugs / Blockers

| # | Issue | File | Fix |
|---|---|---|---|
| 1 | Teacher quizzes nav item → `notFound()` | `constants/portal/navigation.ts` | Remove nav item from `teacherNavItems` |
| 2 | No `loading.tsx` on any portal module | All `app/(portal)/portal/[role]/*/` | Add per-module skeleton |
| 3 | No `error.tsx` on any portal module | All `app/(portal)/portal/[role]/*/` | Add per-module error recovery |
| 4 | RBAC Layer 3 not confirmed on all pages | All portal page.tsx | Audit + add guards |
| 5 | `documents` Supabase bucket is public | `scripts/setup-storage.ts` | RLS or signed URLs |
| 6 | Dual Supabase URLs in `next.config.ts` | `next.config.ts` | Verify active + remove stale |
| 7 | `components/landing/common/` deleted on branch | Git status | Verify landing pages still build |

---

## Implementation Sequence

```
P0 (blockers)
  → fix teacher quizzes nav
  → add loading.tsx + error.tsx to all portal modules
  → RBAC Layer 3 audit
  → fix documents bucket
  → resolve Supabase URL
  → verify landing build

P1 (core ops)
  → Registration status pipeline
  → AI chatbot sidebar nav + tooltip
  → Hero inline lead form
  → Trial lesson CTA
  → Sitemap + robots.txt
  → All new forms: RHF + Zod

P2 (depth)
  → Admin dashboard activity feed
  → Student progress → teacher view
  → Teacher management page
  → FAQ, HSK path visual, teacher team (landing)

📌 Todo (when prioritized)
  → Finance / Tuition module (schema approval needed)
  → Teacher salary module (schema approval needed)
  → Grade book
  → Student quizzes full implementation
```
