# Ruby HSK — Feature Recommendation Matrix

**Date:** 2026-06-24
**Source:** FEATURE_SYSTEM_AUDIT.md + user decisions (2026-06-24)

---

## Decision Log (2026-06-24)

| Feature | Decision | Reason |
|---|---|---|
| Rooms | ❌ Remove from roadmap | 1 phòng duy nhất — `location` string trong Schedule là đủ |
| Shifts | ❌ Remove from roadmap | Không cần quản lý ca |
| Reports | ❌ Remove from roadmap | Chưa cần thiết |
| Finance / Tuition | 📌 Todo | Cần nhưng chưa ưu tiên |
| Teacher Salary | 📌 Todo | Cần nhưng chưa ưu tiên |
| Grade Book | 📌 Todo | Chưa ưu tiên |

---

## Keep (no change needed)

| Feature | Reason |
|---|---|
| Hero Slideshow + CMS | Working, CMS-driven |
| Feature Section + CMS | Working |
| Course Catalog + Detail | Working, SEO ready |
| Reviews / Testimonials | Working |
| CTA Stats Bar | Working |
| About + Photo Gallery | Working |
| SEO Metadata CMS | Working |
| Privacy / Terms | Working |
| User Management | Full CRUD working |
| Student Management | Role-aware filtering working |
| Classes (all roles) | 3-role model correct |
| Class Enrollments | Working |
| Schedule + Google Calendar | Well-architected, encrypted tokens |
| Attendance + Excel Export | Working, export functional |
| Assignments (all roles) | 3-role flow working |
| Practice / SRS (5 tabs) | Most sophisticated feature — keep as-is |
| Hanzi Stroke Writer | Domain-specific, irreplaceable |
| Vocabulary Browse | Working |
| Progress Tracking (Student) | Working |
| Notifications (Realtime) | Well-implemented, optimistic updates |
| ExcelJS Export | Working |
| OG Image Generation | Working |
| Supabase Storage | Working |

---

## Improve (existing, needs work)

### P0 — Before any new features

| Feature | What to change | Risk if skipped |
|---|---|---|
| Per-module `loading.tsx` | Add to every portal module route | Blank flash on navigation — R15 |
| Per-module `error.tsx` | Add to every portal module route | Unhandled crashes — R17 |
| RBAC Layer 3 audit | Verify `auth()` + role check on all `page.tsx` and `app/api/portal/**` | Unauthorized access — R04 |
| Teacher quizzes nav bug | Remove nav item OR build teacher quizzes page | Teacher gets `notFound()` |
| `documents` bucket | Add signed URLs or bucket-level RLS | Student submissions publicly accessible — R09 |
| Dual Supabase URLs | Verify active project, remove stale URL from `next.config.ts` | Storage/Realtime reliability — R07 |

### P1 — Core operations

| Feature | What to change | Notes |
|---|---|---|
| Contact Form | Migrate to RHF + Zod; inline errors | R10 |
| Registration Pipeline | Add status field (PENDING/CONTACTED/ENROLLED/CLOSED); pipeline UI in admin | `Registration` model needs `status` field |
| AI Chatbot discoverability | Add "AI Trợ lý" to sidebar nav for all roles; first-visit tooltip | R19 |

### P2 — Depth

| Feature | What to change | Notes |
|---|---|---|
| Admin Dashboard | Add activity feed + pending registrations count + new students this week | No schema change needed |
| Student progress → Teacher view | Add per-student progress view in Teacher class detail | Service + component only |
| User Profile / Settings | Add tabs: Security (password change), Notifications prefs, Connected Accounts | |
| Bookmarks field | Verify `vocabulary.hanzi` vs `vocabulary.word` mismatch | May require service fix |

---

## Add (new features)

### P1

| Feature | What | Schema change? | Notes |
|---|---|---|---|
| Hero Inline Lead Form | 3-field form (name, phone, level) embedded in hero section | No — `Registration` model exists | Replaces navigation to /contact |
| Trial Lesson CTA | "Học thử miễn phí" button → vocabulary preview or consultation | No | Product decision needed: preview vs consultation |
| Sitemap + robots.txt | `app/sitemap.ts` + `app/robots.ts` | No | Disallow `/portal/*`, `/api/*` |

### P2

| Feature | What | Schema change? | Notes |
|---|---|---|---|
| FAQ Section | Accordion on homepage or /contact | Optional `FAQItem` model | Can start static |
| HSK Learning Path Visual | HSK 1→6 stepper on homepage | No — `HSKLevel` data exists | |
| Vocabulary Preview Widget | 3–5 HSK 1 words on homepage, no login | No | |
| Teacher Team Section | 2–4 teacher cards on homepage | No — static copy or Album data | |
| Teacher Management Page | `/portal/admin/teachers` with workload view | No — derived from PortalUser role=TEACHER | |

---

## Todo (acknowledged, not on active roadmap)

| Feature | Domain | Schema change needed |
|---|---|---|
| Finance / Tuition payments | Tuition | Yes — `TuitionPayment`, `FinanceTransaction`, `FinanceCategory` |
| Tuition adjustments | Tuition | Yes |
| Teacher salary config | Salary | Yes — `TeacherSalaryConfig`, `SalaryPeriod`, `TeachingSessionLog` |
| Salary calculation | Salary | Yes |
| Grade Book | Learning tracking | No |
| Student Quizzes (full implementation) | Learning | No |
| Periodic evaluations / formal tests | Learning tracking | Yes — `PeriodicTest`, `TestResult` |

---

## Remove / Fix Immediately

| Item | Action | Reason |
|---|---|---|
| Teacher quizzes nav item | Remove from `teacherNavItems` or build page | Bug — leads to `notFound()` |

---

## Postpone (P3)

| Feature | Reason |
|---|---|
| Blog / Resources | Requires editorial operations |
| i18n (Vietnamese/Chinese) | Wire `next-intl` only when truly needed |
| Gamification (XP, badges) | Streaks exist but full system needs product spec |
| Dark mode portal | R14 — tokens defined but no toggle |
| Resource library per class | No `ClassResource` model; low priority |
