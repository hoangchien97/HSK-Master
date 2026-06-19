# Ruby HSK — Product Feature Recommendations

**Date:** 2026-06-19
**Sources:** PROJECT_FULL_AUDIT.md, HOMEPAGE_FEATURE_AUDIT.md, PORTAL_FEATURE_AUDIT.md, RISK_REGISTER.md
**Mode:** Recommendations only — no changes to application source code.
**Conventions:** Existing = confirmed in audit. Missing = confirmed absent. Partial = scaffolding exists, implementation incomplete. To verify = not confirmed in audit.

---

## 1. Executive Summary

Ruby HSK has a working full-stack product serving three roles (ADMIN, TEACHER, STUDENT). The portal is feature-rich — classes, assignments, attendance, practice (flashcard/quiz/write/listen), notifications, and AI chatbot are all running. The landing site is CMS-driven with a database-backed hero, courses, reviews, and stats.

**The product is not at risk of collapse. It needs stabilization, not a rebuild.**

Priority order for investment:
1. **P0 ✅ Done** — `LanguageSwitcher` removed, CSS purge risk fixed, dead deps removed (2026-06-18)
2. **P1 — Improve conversion** on the landing site (inline lead capture, trial lesson, FAQ)
3. **P1 — Stabilize portal UX** (loading states, error states, form validation feedback)
4. **P2 — Fill feature gaps** (admin dashboard activity feed, enrollment pipeline, teacher grade book, AI chatbot discoverability)
5. **P3 — Expand** (blog, reports, i18n, gamification)

---

## 2. Homepage Feature Recommendations

### 2.1 Header / Navigation

| Field | Value |
|---|---|
| **Current status** | ✅ Resolved (2026-06-18) |
| **Recommendation** | ~~Improve~~ Complete |
| **Priority** | ~~P0~~ Done |
| **Reason** | `LanguageSwitcher` export removed; `next-intl`, `pg`, `recharts` uninstalled. |
| **Acceptance criteria** | ✅ LanguageSwitcher not exported from index.ts. ✅ next-intl removed from package.json. |

### 2.2 Hero with Slideshow

| Field | Value |
|---|---|
| **Current status** | Existing |
| **Recommendation** | Improve |
| **Priority** | P1 |
| **Reason** | Hero is CMS-driven and visually solid. The CTA links to `/contact` — a separate page. Visitors who do not click-through are lost. An inline consultation form would capture leads without navigation. |
| **Dependencies** | `Registration` model already exists. Server Action for contact form already exists. |
| **Acceptance criteria** | A 3-field form (name, phone, interest topic) is embedded within or immediately below the hero. Submission creates a `Registration` record. Success feedback shown inline. Form does not require navigating to `/contact`. |

### 2.3 HSK Learning Path Visualization

| Field | Value |
|---|---|
| **Current status** | Missing |
| **Recommendation** | Add |
| **Priority** | P2 |
| **Reason** | First-time visitors don't understand what the HSK level system is or how courses map to levels. A visual progression (HSK 1→6) would reduce friction in course selection. |
| **Dependencies** | `HSKLevel` and `Course` models exist. Data is available. |
| **Acceptance criteria** | A horizontal or stepped visual shows HSK 1–6 levels with a brief description per level. Each step links to filtered course listing for that level. Section is CMS-driven or static copy with dynamic course counts. |

### 2.4 Course Listing Preview

| Field | Value |
|---|---|
| **Current status** | Existing |
| **Recommendation** | Keep |
| **Priority** | — |
| **Reason** | CMS-driven course grid is working and links to `/courses/[slug]`. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 2.5 Trial Lesson / Free Preview CTA

| Field | Value |
|---|---|
| **Current status** | Missing |
| **Recommendation** | Add |
| **Priority** | P1 |
| **Reason** | Highest-converting landing page CTA for language schools is a free lesson or trial class. No trial mechanism exists. Removing the barrier to first experience is standard for this market. |
| **Dependencies** | Requires defining what a "trial lesson" means — a real scheduled class slot, or an online content preview. Decision needed before implementation. A simple approach: a vocabulary or grammar preview from a published lesson, accessible without login. |
| **Acceptance criteria** | Landing page has a "Học thử miễn phí" (Free Trial) CTA. Clicking it either (a) navigates to a preview lesson page with vocabulary/grammar from HSK 1, or (b) opens a consultation form with "Đăng ký học thử" as the topic. No student account required. |

### 2.6 Teacher Credibility / Team Section

| Field | Value |
|---|---|
| **Current status** | Partial — `/about` page has teacher photos via `Album` / `Photo` models. Not on homepage. |
| **Recommendation** | Improve |
| **Priority** | P2 |
| **Reason** | Language school trust is personal. Teacher faces and credentials near the hero or before course listing would increase conversion. |
| **Dependencies** | `Album` and `Photo` models. No structured `TeacherProfile` model with bio fields — would require either schema change or static copy. |
| **Acceptance criteria** | A "Đội ngũ giảng viên" (Teaching Staff) section on the homepage shows 2–4 teacher cards with photo, name, credential summary. Data can be static copy initially. If schema is extended with a `TeacherProfile` model, this becomes CMS-driven. |

### 2.7 Testimonials / Social Proof

| Field | Value |
|---|---|
| **Current status** | Existing |
| **Recommendation** | Keep |
| **Priority** | — |
| **Reason** | `Review` model with ratings is working. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 2.8 Stats Bar

| Field | Value |
|---|---|
| **Current status** | Existing |
| **Recommendation** | Keep |
| **Priority** | — |
| **Reason** | `CtaStat` model is CMS-driven. CountUp animations are on-brand. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 2.9 FAQ Section

| Field | Value |
|---|---|
| **Current status** | Missing |
| **Recommendation** | Add |
| **Priority** | P2 |
| **Reason** | FAQ reduces common pre-purchase questions: tuition, schedule, level requirements, online vs in-person. Reduces inbound contact volume. |
| **Dependencies** | New static section or new `FAQItem` CMS model. |
| **Acceptance criteria** | Accordion FAQ section on homepage or `/contact`. 6–10 questions. If CMS-driven: `FAQItem` model with question, answer, category, order. Admin can add/edit items from `/portal/admin`. |

### 2.10 Contact / Consultation Form

| Field | Value |
|---|---|
| **Current status** | Existing — `/contact` page with form |
| **Recommendation** | Improve |
| **Priority** | P1 |
| **Reason** | Contact form on a separate page breaks homepage conversion flow. Inline form recommended (see 2.2). Additionally, the contact page form uses manual `useState` with no validation library (R10). |
| **Dependencies** | `Registration` model exists. |
| **Acceptance criteria** | Contact form migrated to React Hook Form + Zod. Validation errors shown inline, not via toast. Form reset on successful submission. Map or address block present on page. Auto-response email: To verify. |

### 2.11 Blog / Resources Section

| Field | Value |
|---|---|
| **Current status** | Missing |
| **Recommendation** | Postpone |
| **Priority** | P3 |
| **Reason** | High value for SEO and organic acquisition long-term, but requires content operations that the center may not have capacity for. Adds a new CMS content type. |
| **Dependencies** | New `BlogPost` or `Article` model (schema change needed). Editorial workflow. |
| **Acceptance criteria** | To be defined when prioritized. |

### 2.12 HSK Vocabulary / Learning Resource Preview

| Field | Value |
|---|---|
| **Current status** | Partial — vocabulary data exists in DB seeded from HSK 1–6 JSON; no homepage preview component |
| **Recommendation** | Add |
| **Priority** | P2 |
| **Reason** | Showing a vocabulary flashcard interaction or a "word of the day" on the homepage demonstrates the learning product in action. Increases perceived value. |
| **Dependencies** | `Vocabulary` model, `HSKLevel` model. |
| **Acceptance criteria** | A vocabulary preview widget on the homepage shows 3–5 vocabulary cards from HSK 1 (character + pinyin + meaning). Cards are visually consistent with the portal practice flashcard. No login required to view. |

### 2.13 Sitemap and robots.txt

| Field | Value |
|---|---|
| **Current status** | Missing — no `sitemap.ts` or `robots.ts` in audit |
| **Recommendation** | Add |
| **Priority** | P1 |
| **Reason** | SEO fundamentals. Without sitemap, search engines may not index all pages. Without robots.txt, `/system-design` and other internal paths can be indexed. |
| **Dependencies** | None. Next.js App Router supports `app/sitemap.ts` and `app/robots.ts`. |
| **Acceptance criteria** | `app/sitemap.ts` generates all public routes dynamically. `app/robots.ts` disallows `/system-design`, `/portal/*`, `/api/*`. `/system-design` also gets `robots: { index: false }` in its own metadata. |

---

## 3. Portal Feature Recommendations

### 3.1 Dashboard — Admin

| Field | Value |
|---|---|
| **Module** | Dashboard — Admin |
| **Current status** | Existing — CMS quick links + content counts |
| **Recommendation** | Improve |
| **Available roles** | ADMIN |
| **Priority** | P2 |
| **Reason** | Current dashboard is sparse: no pending registrations count, no new student this week, no activity feed. Admin does not know the business state at a glance. |
| **Dependencies** | `Registration`, `PortalUser`, `Enrollment` models exist. Aggregation queries needed. |
| **Acceptance criteria** | Dashboard includes: (a) total students/teachers/classes counts, (b) pending registrations count with link to registrations module, (c) new registrations in last 7 days, (d) recent activity feed (last 10 registration + enrollment events), (e) upcoming classes count. |

### 3.2 Dashboard — Teacher

| Field | Value |
|---|---|
| **Module** | Dashboard — Teacher |
| **Current status** | Existing — stats + today's schedule + recent submissions |
| **Recommendation** | Keep |
| **Available roles** | TEACHER |
| **Priority** | — |
| **Reason** | Props-driven with relevant stats. No critical gaps identified. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.3 Dashboard — Student

| Field | Value |
|---|---|
| **Module** | Dashboard — Student |
| **Current status** | Existing — continue learning + streak + upcoming + assignments |
| **Recommendation** | Keep |
| **Available roles** | STUDENT |
| **Priority** | — |
| **Reason** | Well-structured with relevant learning stats. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.4 User Management

| Field | Value |
|---|---|
| **Module** | User Management |
| **Current status** | Existing — ADMIN; full CRUD via CTable |
| **Recommendation** | Keep |
| **Available roles** | ADMIN |
| **Priority** | — |
| **Reason** | Functional. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.5 Student Management

| Field | Value |
|---|---|
| **Module** | Student Management |
| **Current status** | Existing — ADMIN + TEACHER; teacher sees own class students only |
| **Recommendation** | Keep |
| **Available roles** | ADMIN, TEACHER |
| **Priority** | — |
| **Reason** | Role-aware data filtering is correctly implemented. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.6 Teacher Management

| Field | Value |
|---|---|
| **Module** | Teacher Management |
| **Current status** | Partial — teachers are managed as users (role=TEACHER) in the Users module; no dedicated teacher management page |
| **Recommendation** | Improve |
| **Available roles** | ADMIN |
| **Priority** | P2 |
| **Reason** | A dedicated teacher management page would allow admin to view teacher workload (classes, students), assign Google Calendar sync, and view class history — not possible in the flat users list. |
| **Dependencies** | No schema change needed. Derived from `PortalUser` (role=TEACHER) + `PortalClass` relations. |
| **Acceptance criteria** | Admin can filter Users list to `role=TEACHER` with class count visible per teacher. Alternatively, a dedicated `/portal/admin/teachers` module shows teacher cards with: name, email, active class count, schedule link. No schema change required. |

### 3.7 Course Management (CMS)

| Field | Value |
|---|---|
| **Module** | Course Management — CMS |
| **Current status** | Existing — ADMIN CRUD for courses, HSK levels, categories |
| **Recommendation** | Keep |
| **Available roles** | ADMIN |
| **Priority** | — |
| **Reason** | Working CMS for landing course content. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.8 Class Management

| Field | Value |
|---|---|
| **Module** | Class Management |
| **Current status** | Existing — ADMIN full CRUD; TEACHER manage own; STUDENT view enrolled |
| **Recommendation** | Keep |
| **Available roles** | ADMIN, TEACHER, STUDENT |
| **Priority** | — |
| **Reason** | Three-role model is correct and functional. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.9 Lesson / Content Management

| Field | Value |
|---|---|
| **Module** | Lesson / Content Management |
| **Current status** | Existing — ADMIN manages via Course CMS; `Lesson`, `Vocabulary`, `GrammarPoint` models |
| **Recommendation** | Improve |
| **Available roles** | ADMIN |
| **Priority** | P2 |
| **Reason** | Lessons are managed under Course CMS but lesson structure is complex (5 tab types). A dedicated lesson editor with vocabulary/grammar management inline would reduce admin errors. |
| **Dependencies** | Schema unchanged. Navigation and component work only. |
| **Acceptance criteria** | Admin can view and edit a lesson's vocabulary list and grammar points from within the lesson edit view (not requiring separate navigation to vocabulary/grammar sections). |

### 3.10 Schedule / Calendar

| Field | Value |
|---|---|
| **Module** | Schedule / Calendar |
| **Current status** | Existing — all roles; TEACHER has Google Calendar sync |
| **Recommendation** | Keep |
| **Available roles** | ADMIN, TEACHER, STUDENT |
| **Priority** | — |
| **Reason** | Google Calendar integration with encrypted token storage is well-architected. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.11 Enrollment / Registration Pipeline

| Field | Value |
|---|---|
| **Module** | Enrollment / Registration Pipeline |
| **Current status** | Partial — `Registration` model exists; admin can view list; no status workflow UI |
| **Recommendation** | Improve |
| **Available roles** | ADMIN |
| **Priority** | P1 |
| **Reason** | Leads are captured but have no lifecycle management. Admin cannot track who has been contacted, who converted to enrolled. Lead data is lost without follow-up tracking. |
| **Dependencies** | `Registration` model. Status field verification needed (To verify). |
| **Acceptance criteria** | Admin registration table shows status column: PENDING / CONTACTED / ENROLLED / CLOSED. Admin can update status inline or from a detail drawer. Filter by status. Quick action button: "Create User Account" from a CONTACTED registration (pre-fills user create form). |

### 3.12 Notifications

| Field | Value |
|---|---|
| **Module** | Notifications |
| **Current status** | Existing — Supabase Realtime; all roles; optimistic mark-read |
| **Recommendation** | Keep |
| **Available roles** | ADMIN, TEACHER, STUDENT |
| **Priority** | — |
| **Reason** | Architecture is well-implemented. Realtime + optimistic updates is correct. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.13 Progress Tracking

| Field | Value |
|---|---|
| **Module** | Progress Tracking |
| **Current status** | Existing — `PortalLessonProgress`, `PortalLessonSessionState`, student dashboard stats |
| **Recommendation** | Improve |
| **Available roles** | STUDENT (view own), TEACHER (view class), ADMIN (view all) |
| **Priority** | P2 |
| **Reason** | Progress data exists but teacher/admin cannot see student progress easily. A per-student progress view would support coaching and intervention. |
| **Dependencies** | Progress models exist. Service + component work only. |
| **Acceptance criteria** | Teacher: from a class view, can click a student and see their progress per lesson (% complete, mastery score, practice sessions). Admin: same view accessible from user management. Student: existing progress view adequate for now. |

### 3.14 HSK Vocabulary / Hanzi Content

| Field | Value |
|---|---|
| **Module** | HSK Vocabulary / Hanzi Content |
| **Current status** | Existing — ADMIN CMS; STUDENT vocabulary browse + practice; Hanzi Writer in Write tab |
| **Recommendation** | Keep |
| **Available roles** | ADMIN (manage), STUDENT (browse + practice) |
| **Priority** | — |
| **Reason** | Core domain content is well-built. Hanzi Writer stroke animation is domain-appropriate. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.15 Practice / Quiz

| Field | Value |
|---|---|
| **Module** | Practice / Quiz (SRS) |
| **Current status** | Existing — STUDENT; 5 tabs: Flashcard, Quiz, Listen, Write, Lookup; TabErrorBoundary |
| **Recommendation** | Keep |
| **Available roles** | STUDENT |
| **Priority** | — |
| **Reason** | Most technically sophisticated part of the portal. Dynamic imports, error boundaries, SRS logic, hanzi writer — all correct. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.16 Assignments

| Field | Value |
|---|---|
| **Module** | Assignments |
| **Current status** | Existing — ADMIN view all; TEACHER create/edit/grade; STUDENT submit/view feedback |
| **Recommendation** | Improve |
| **Available roles** | ADMIN, TEACHER, STUDENT |
| **Priority** | P2 |
| **Reason** | No dedicated grade book. Teachers grade individual submissions but cannot view scores across all students for an assignment. |
| **Dependencies** | `PortalAssignmentSubmission` model with scores exists. Aggregation query only. |
| **Acceptance criteria** | Teacher assignment detail view includes a grade book table: all enrolled students, their submission status (submitted/pending/late), score, and grade. Export to Excel (consistent with attendance export pattern). |

### 3.17 Attendance

| Field | Value |
|---|---|
| **Module** | Attendance |
| **Current status** | Existing — ADMIN + TEACHER; Excel export via ExcelJS |
| **Recommendation** | Keep |
| **Available roles** | ADMIN, TEACHER |
| **Priority** | — |
| **Reason** | Working with export functionality. |
| **Dependencies** | — |
| **Acceptance criteria** | — |

### 3.18 Reports / Analytics

| Field | Value |
|---|---|
| **Module** | Reports / Analytics |
| **Current status** | Missing |
| **Recommendation** | Add |
| **Available roles** | ADMIN |
| **Priority** | P2 |
| **Reason** | Admin has no aggregate view of business metrics: enrollment trends, class capacity utilization, student retention, revenue proxy. |
| **Dependencies** | Recharts in `package.json` (usage To verify). Aggregation queries from existing models. No schema change. |
| **Acceptance criteria** | Admin `/portal/admin/reports` page with: (a) enrollment trend chart (registrations per month), (b) class capacity chart (enrolled vs max per class), (c) practice activity chart (sessions per week), (d) assignment completion rate. Export to CSV or Excel. |

### 3.19 Settings

| Field | Value |
|---|---|
| **Module** | Settings |
| **Current status** | Partial — profile page exists (all roles); no dedicated settings page |
| **Recommendation** | Improve |
| **Available roles** | ADMIN, TEACHER, STUDENT |
| **Priority** | P2 |
| **Reason** | Users need notification preferences, password change, and connected account management (Google). All currently unreachable from one place. |
| **Dependencies** | Profile page logic. NextAuth session update pattern. |
| **Acceptance criteria** | `/portal/profile` is extended with tabs: Profile (name/avatar), Security (change password), Notifications (email/in-app toggle), Connected Accounts (Google OAuth status). ADMIN additionally: theme settings (dark/light toggle if implemented). |

### 3.20 AI Chatbot

| Field | Value |
|---|---|
| **Module** | AI Chatbot |
| **Current status** | Existing — floating bubble all portal pages; DeepSeek backend; undocumented in navigation |
| **Recommendation** | Improve |
| **Available roles** | ADMIN, TEACHER, STUDENT |
| **Priority** | P1 |
| **Reason** | Feature exists but is hidden. Users who have never been onboarded won't discover it. A floating bubble with no context is a mystery, not a helper. |
| **Dependencies** | None. Navigation and onboarding tooltip work only. |
| **Acceptance criteria** | (a) "AI Trợ lý" nav item added to sidebar for all roles. (b) First portal visit: a single-shot tooltip or highlight on the chatbot bubble: "Hỏi AI về từ vựng, ngữ pháp, hoặc lịch học." Tooltip dismissed on first click anywhere. |

### 3.21 Loading / Error States (Cross-cutting)

| Field | Value |
|---|---|
| **Module** | Loading / Error States |
| **Current status** | Partial — route-group loading.tsx exists; no per-module loading.tsx; per-module error.tsx missing (R15, R17) |
| **Recommendation** | Improve |
| **Available roles** | ADMIN, TEACHER, STUDENT |
| **Priority** | P0 |
| **Reason** | Users see blank content on navigation. Crashes at page level go unhandled. |
| **Dependencies** | None. File additions only. |
| **Acceptance criteria** | Every portal module page has a `loading.tsx` with HeroUI Skeleton matching the page layout. Every portal module page has an `error.tsx` with a retry button and error message in Vietnamese. |

---

## 4. Role-Based Module Matrix

| Module | ADMIN | TEACHER | STUDENT |
|---|---|---|---|
| Dashboard | ✅ Keep (Improve) | ✅ Keep | ✅ Keep |
| User Management | ✅ Keep | — | — |
| Teacher Management | ✅ Improve (P2) | — | — |
| Student Management | ✅ Keep | ✅ Keep | — |
| Course Management (CMS) | ✅ Keep | — | — |
| Class Management | ✅ Keep | ✅ Keep | ✅ view only |
| Lesson / Content | ✅ Improve (P2) | — | — |
| Schedule | ✅ Keep | ✅ Keep (Google Cal) | ✅ read |
| Enrollment Pipeline | ✅ Improve (P1) | — | — |
| Assignments | ✅ view all | ✅ Keep (Improve grade book P2) | ✅ Keep |
| Attendance | ✅ Keep | ✅ Keep | — |
| Practice / SRS | — | — | ✅ Keep |
| Progress Tracking | ✅ Improve (P2) | ✅ Add view (P2) | ✅ Keep |
| Vocabulary (CMS) | ✅ Keep | — | ✅ Keep |
| Grammar (CMS) | ✅ Keep | — | — |
| Reports / Analytics | ✅ Add (P2) | — | — |
| Notifications | ✅ Keep | ✅ Keep | ✅ Keep |
| AI Chatbot | ✅ Improve (P1) | ✅ Improve (P1) | ✅ Improve (P1) |
| Settings / Profile | ✅ Improve (P2) | ✅ Improve (P2) | ✅ Improve (P2) |
| CMS General (hero/reviews/features) | ✅ Keep | — | — |

---

## 5. Suggested Remove / Simplify List

| Item | Action | Reason |
|---|---|---|
| `LanguageSwitcher` in header | ✅ Done (2026-06-18) | next-intl not wired; export removed |
| `/system-design` public page | ✅ Done (2026-06-18) — noindex layout.tsx added | Internal architecture; noindex added |
| `pg` package in package.json | ✅ Done (2026-06-18) — removed | Zero imports; dead dependency |
| `next-intl` package | ✅ Done (2026-06-18) — removed | Zero integration; dead dependency |
| `recharts` package | ✅ Done (2026-06-18) — removed | Zero component imports; dead dependency |
| `dayjs` package | **Simplify — remove, keep date-fns** (P2) | Two date libraries; `date-fns` is preferred and in optimizePackageImports |
| Dual role definitions (`constants/roles.ts` + `enums/role.ts`) | **Simplify (P2)** | Two files must stay in sync manually; TypeScript enum alone is sufficient |

---

## 6. MVP Recommendation

If starting from zero prioritization, the following represents the minimum investment to make Ruby HSK production-ready for public marketing and daily operations:

**MVP = current app + P0 fixes + 3 P1 improvements**

### P0 (must have before any production release)
1. ✅ Remove `LanguageSwitcher` from header (done 2026-06-18)
2. ✅ Fix `tailwind.config.js` content array (done 2026-06-18)
3. Add per-module `loading.tsx` and `error.tsx` to all portal modules
4. ✅ Add noindex to `/system-design` (done 2026-06-18)
5. Audit all portal pages for missing Layer 3 RBAC guards
6. ✅ Remove dead dependencies `pg`, `next-intl`, `recharts` (done 2026-06-18)

### P1 (include in MVP release)
7. Inline consultation form in or below hero section
8. Enrollment pipeline status UI in admin registrations
9. AI chatbot discoverability (sidebar nav link + onboarding tooltip)
10. Sitemap.ts + robots.ts

**Estimated P0+P1 scope:** 6–10 file-level changes for P0, 3–4 new modules/components for P1. No schema changes required.

---

## 7. Post-MVP Recommendations

After the MVP is stable and live:

### Phase 1 — Conversion + quality
- Trial lesson or vocabulary preview on homepage
- Teacher credibility section on homepage
- FAQ section
- Form validation with React Hook Form + Zod (start with new forms, migrate existing)
- prefers-reduced-motion support (globals.css)
- Contact form improved

### Phase 2 — Portal depth
- Admin dashboard activity feed
- Teacher grade book
- Student progress visible to teacher/admin
- Reports / analytics module
- Lesson editor improvements
- Settings page with notification preferences

### Phase 3 — Growth
- Blog / resources section
- HSK learning path visualization
- i18n (Vietnamese / English / Chinese) — wire next-intl properly
- Gamification (streaks already tracked, add badges/XP)
- Mobile app consideration

---

## 8. Open Questions / To verify

| Question | Impact | How to resolve |
|---|---|---|
| Does `Registration` model have a `status` field (PENDING/CONTACTED/ENROLLED)? | Enrollment pipeline UI | `grep -r "Registration" prisma/schema.prisma` |
| Are `Recharts` and `React Big Calendar` actually imported anywhere? | Bundle size; reports module planning | `grep -r "recharts\|react-big-calendar" components/ app/` |
| Is `Framer Motion` actually imported (vs just in package.json)? | prefers-reduced-motion fix scope | `grep -r "framer-motion" components/` |
| Does the contact form have auto-response email logic? | Contact form UX; acceptance criteria | Read `actions/registration.actions.ts` or `services/registration.service.ts` |
| Is there a Google Maps embed on the contact page? | Contact page UX audit | Read `app/(landing)/contact/page.tsx` |
| Are quizzes (`/portal/student/quizzes`) and bookmarks (`/portal/student/bookmarks`) fully implemented? | Student module scope | Read `app/(portal)/portal/student/quizzes/page.tsx` |
| Does the student progress page have a separate `/progress` route or is it part of `/practice`? | Progress tracking scope | `ls app/(portal)/portal/student/` |
| Is Axios used anywhere (vs native fetch)? | Dependency cleanup | `grep -r "axios" app/ components/ lib/ services/` |
| Which Supabase project URL is production (`ukbeoggejnqgdxqoqkvj` or `alfbzgjpjvrcfaxxvijl`)? | next.config.ts cleanup | Check Supabase dashboard or .env |
