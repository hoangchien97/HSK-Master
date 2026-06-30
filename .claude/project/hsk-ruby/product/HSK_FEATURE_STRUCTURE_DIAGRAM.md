# Ruby HSK — Feature Structure Diagram

**Date:** 2026-06-24
**Format:** Mermaid source in `HSK_FEATURE_STRUCTURE_DIAGRAM.mmd`

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Existing, working |
| ⚠ | Partial / needs improvement |
| ❌ | Missing — on roadmap |
| 🚧 | Under construction stub |
| 🐛 | Known bug |
| 📌 | Todo — not on active roadmap |

---

## Domain Summary

### 🌐 Landing / Public Site
- **✅ Existing:** Hero slideshow, Feature section, Course catalog + detail, Reviews, CTA stats, About, Photo gallery, Contact form, SEO metadata
- **P1 (add):** Inline lead form in hero, Trial lesson CTA, Sitemap + robots.txt
- **P2 (add):** FAQ accordion, HSK learning path visual (1→6), Vocabulary preview widget (no login), Teacher team section

### 🔴 Admin Portal (SYSTEM_ADMIN)
- **✅ CMS (9 modules):** Hero slides, Courses, HSK Levels, Categories, Albums, Reviews, Features, CTA Stats, SEO
- **✅ Management:** Users (CRUD)
- **⚠ Improve P1:** Registrations → add status pipeline (PENDING/CONTACTED/ENROLLED/CLOSED)
- **⚠ Improve P2:** Dashboard → add activity feed + business stats
- **❌ Add P2:** Teacher Management dedicated page
- **📌 Todo:** Finance / Tuition (entire domain missing from schema)

### 🟡 Teacher Portal (TEACHER)
- **✅ Existing:** Dashboard, Classes + Class Detail, Students, Schedule + Google Calendar, Attendance + Excel Export, Assignments + Grading
- **📌 Todo:** Grade book (aggregate scores per assignment)
- **🐛 P0 Bug:** "Bài kiểm tra" nav item → routes to STUDENT-only page → `notFound()`

### 🟢 Student Portal (STUDENT)
- **✅ Existing:** Dashboard, Schedule, Classes, Attendance (read), Assignments, Practice SRS (5 tabs: Flashcard/Quiz/Listen/Write/Lookup), Vocabulary browse, Progress tracking
- **⚠ Verify:** Bookmarks — `vocabulary.hanzi` vs `vocabulary.word` field mismatch
- **🚧 P2:** Quizzes — currently "Đang phát triển" stub

### ⚡ All Roles
- **✅:** Realtime notifications (Supabase), User profile
- **⚠ Improve P1:** AI Chatbot — exists as floating bubble but undiscoverable; add to sidebar nav

### 📌 Todo (acknowledged, not on active roadmap)
- Finance / Tuition (needs schema: `TuitionPayment`, `FinanceTransaction`, `FinanceCategory`)
- Teacher Salary (needs schema: `TeacherSalaryConfig`, `TeachingSessionLog`)
- Grade Book
- Periodic evaluations / formal tests

---

## P0 Blockers (fix before any new features)

1. `loading.tsx` missing on all portal module routes → blank flash on navigation
2. `error.tsx` missing on all portal module routes → unhandled page crashes
3. RBAC Layer 3 guards not confirmed on all `page.tsx` + `app/api/portal/**`
4. Teacher quizzes nav item → `notFound()` (remove from `teacherNavItems`)
5. `documents` Supabase bucket is public → student submissions accessible without auth
6. Dual Supabase project URLs in `next.config.ts` → verify which is active
7. `components/landing/common/` deleted on branch → verify landing pages still build

---

## Mermaid Diagram Source

See [`HSK_FEATURE_STRUCTURE_DIAGRAM.mmd`](./HSK_FEATURE_STRUCTURE_DIAGRAM.mmd) for the full Mermaid graph.

To render: paste into https://mermaid.live or any Mermaid-compatible viewer.

---

## Implementation Sequence

```
Phase P0 (blockers — no new features until done)
├── Remove teacher quizzes nav item
├── Add loading.tsx + error.tsx to all portal modules
├── RBAC Layer 3 audit (all page.tsx + API routes)
├── Fix documents bucket (RLS or signed URLs)
├── Resolve Supabase URL (next.config.ts)
└── Verify landing build (components/landing/common deleted)

Phase P1 (core operations)
├── Registration status pipeline (Admin)
├── AI Chatbot → sidebar nav + first-visit tooltip
├── Hero inline lead form (Landing)
├── Trial lesson CTA (Landing)
├── Sitemap + robots.txt
└── All new forms: React Hook Form + Zod

Phase P2 (depth)
├── Admin dashboard activity feed + stats
├── Student progress → teacher/admin view
├── Teacher Management dedicated page
├── FAQ section (Landing)
├── HSK path visualization (Landing)
└── Teacher team section (Landing)

📌 Todo (when prioritized — schema changes needed)
├── Finance / Tuition module
├── Teacher Salary module
└── Grade Book
```
