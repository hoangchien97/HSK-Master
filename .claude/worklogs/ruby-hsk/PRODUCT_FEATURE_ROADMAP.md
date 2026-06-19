# Product Feature Roadmap

**Date:** 2026-06-19
**Source:** Audit findings + gap analysis
**Status:** Recommendations — not committed to sprint/timeline

---

## Current product capabilities (confirmed)

### Landing site
- Homepage with CMS-managed hero, features, reviews, stats
- Course catalog with HSK level grouping
- Course detail pages
- Contact / registration lead capture
- About / Team page

### Portal — Admin
- User management (list, create, edit, deactivate)
- Class management (create, enroll students)
- Schedule management
- Assignment creation and review
- Attendance tracking + Excel export
- CMS management (courses, vocabulary, grammar, hero slides, features, reviews)
- Registration list (lead capture)
- Notification system

### Portal — Teacher
- Class view
- Schedule management with Google Calendar sync
- Assignment grading
- Attendance marking

### Portal — Student
- Dashboard with upcoming schedule
- Practice module: flashcard, quiz, listen, write (4 tabs)
- Assignment submission
- Schedule view
- Notifications

### Cross-portal
- AI chatbot (DeepSeek-backed) on all pages
- In-app notifications via Supabase Realtime
- File upload (avatar, assignment attachments)
- Google Calendar integration

---

## Gap analysis — what's missing or incomplete

### P0 — Pre-production blockers

| Gap | Risk | Action |
|---|---|---|
| `tailwind.config.js` content array missing `app/**`, `components/**` | R11 — CSS purge in prod build | Fix content array before first deploy |
| No `error.tsx` on portal module pages | R17 — unhandled errors crash user session | Add error boundaries to each module |
| `calendar.events` scope on all Google logins | R02 — reduces OAuth conversion | Restrict to teacher signIn only |
| No per-module `loading.tsx` | R15 — jarring layout shifts | Add skeleton loading to each page |

### P1 — High value, low risk

| Feature | Description | Effort |
|---|---|---|
| Client-side form validation | Surface Zod errors inline in portal forms | Medium |
| Dark mode toggle | `dark` class + CSS variant already defined | Medium |
| Course progress tracker | Show student % completion per course/lesson | Medium |
| Certificate generation | Issue PDF certificates on lesson/level completion | High |
| Vocabulary bookmarks | Students save words for personal review list | Low |

### P2 — Medium term

| Feature | Description | Effort |
|---|---|---|
| Teacher profile pages | TeacherProfile model + public landing page | Medium |
| Homework auto-grading | Quiz-based assignment with score calculation | High |
| Grammar practice tab | Extend practice module with GrammarPoint exercises | Medium |
| i18n (Vietnamese / Chinese / English) | Wire `next-intl` — infrastructure already stubbed | High |
| Registration pipeline | PENDING → CONTACTED → ENROLLED workflow in portal | Medium |
| Parent/guardian portal | View child's progress without student login | High |

### P3 — Long term / exploratory

| Feature | Description | Notes |
|---|---|---|
| Mobile app (React Native / Expo) | Shared API layer already exists | Requires API-first refactor |
| Spaced repetition improvements | Tuning SRS algorithm for vocabulary retention | Algorithm work |
| AI pronunciation scoring | Web Speech + model evaluation | Infra investment |
| Live class sessions | Video/audio integration | External provider |
| Gamification (XP, streaks, badges) | Achievement system linked to practice records | Schema + UI work |

---

## Recommended next sprint (P0 + P1 quick wins)

1. Fix `tailwind.config.js` content array
2. Add `error.tsx` to all portal module pages
3. Add `loading.tsx` to all portal module pages
4. Restrict `calendar.events` scope to teacher signIn
5. Surface Zod form errors inline on 3 highest-traffic admin forms (user edit, class create, assignment create)

---

## Notes on constraints

- Do NOT change database schema without approval
- Do NOT introduce react-hook-form without approval (affects all portal forms)
- `LanguageSwitcher` must remain hidden until `next-intl` is properly wired
- Supabase boundary rules must be preserved (no Supabase Auth, no Supabase JS for DB)
