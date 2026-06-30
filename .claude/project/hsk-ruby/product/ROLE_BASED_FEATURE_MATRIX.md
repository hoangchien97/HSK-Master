# Ruby HSK — Role-Based Feature Matrix

**Date:** 2026-06-24
**Roles:** SYSTEM_ADMIN · TEACHER · STUDENT

---

## Symbols

| Symbol | Meaning |
|---|---|
| ✅ Full | Full access / full CRUD |
| 👁 Read | Read-only |
| 🔒 Own | Own data only |
| — | No access |
| ⚠ Partial | Implemented but incomplete |
| ❌ Missing | Not built |
| 📌 Todo | Acknowledged, not on active roadmap |
| 🚧 Stub | Route exists, "Đang phát triển" |

---

## Feature Matrix

| Module | SYSTEM_ADMIN | TEACHER | STUDENT | Status | Pri |
|---|---|---|---|---|---|
| **LANDING / CMS** | | | | | |
| Hero Slides CMS | ✅ | — | — | ✅ | — |
| Courses CMS | ✅ | — | — | ✅ | — |
| HSK Levels CMS | ✅ | — | — | ✅ | — |
| Categories CMS | ✅ | — | — | ✅ | — |
| Albums CMS | ✅ | — | — | ✅ | — |
| Reviews CMS | ✅ | — | — | ✅ | — |
| Features CMS | ✅ | — | — | ✅ | — |
| CTA Stats CMS | ✅ | — | — | ✅ | — |
| SEO Metadata CMS | ✅ | — | — | ✅ | — |
| **PROFILES** | | | | | |
| User Management | ✅ | — | — | ✅ | — |
| Student Management | ✅ | 🔒 Own class | — | ✅ | — |
| Teacher Management | ⚠ via Users | — | — | ⚠ Partial | P2 |
| User Profile / Settings | ✅ | ✅ | ✅ | ⚠ Partial | P2 |
| Registration Pipeline | ✅ | — | — | ⚠ Partial | P1 |
| **CLASS MANAGEMENT** | | | | | |
| Classes | ✅ | 🔒 Own | 👁 Enrolled | ✅ | — |
| Class Detail | ✅ | 🔒 Own | 👁 Enrolled | ✅ | — |
| Class Enrollments | ✅ | — | — | ✅ | — |
| Schedule | ✅ | ✅ + GCal | 👁 Own | ✅ | — |
| **LEARNING TRACKING** | | | | | |
| Attendance | ✅ | ✅ record | 👁 Own | ✅ | — |
| Assignments | 👁 All | ✅ Create/grade | 🔒 Submit/view | ✅ | — |
| Grade Book | — | 📌 Todo | — | ❌ | 📌 |
| **LEARNING CONTENT** | | | | | |
| Practice / SRS | — | — | ✅ 5 modes | ✅ | — |
| Vocabulary Browse | ✅ CMS | — | ✅ browse | ✅ | — |
| Grammar Points | ✅ CMS | — | — | ✅ | — |
| Bookmarks | — | — | 🔒 Own | ⚠ Verify | — |
| Progress Tracking | 👁 All | 👁 Own class | 👁 Own | ⚠ Partial | P2 |
| Quizzes | — | — | 🚧 Stub | 🚧 | P2 |
| **FINANCE** | | | | | |
| Tuition / Finance | 📌 Todo | — | 👁 Own future | ❌ | 📌 |
| Teacher Salary | 📌 Todo | 👁 Own future | — | ❌ | 📌 |
| **DASHBOARDS** | | | | | |
| Admin Dashboard | ⚠ Sparse | — | — | ⚠ | P2 |
| Teacher Dashboard | — | ✅ | — | ✅ | — |
| Student Dashboard | — | — | ✅ | ✅ | — |
| **SPECIAL FEATURES** | | | | | |
| Notifications (Realtime) | ✅ | ✅ | ✅ | ✅ | — |
| AI Chatbot | ✅ hidden | ✅ hidden | ✅ hidden | ⚠ hidden | P1 |
| Google Calendar Sync | — | ✅ | — | ✅ | — |
| Attendance Excel Export | ✅ | ✅ | — | ✅ | — |

---

## Notes

### Teacher quizzes nav bug (P0)
`teacherNavItems` trong `constants/portal/navigation.ts` có mục `/portal/teacher/quizzes`. Route `[role]/quizzes/page.tsx` chỉ cho phép `STUDENT` → Teacher nhận `notFound()`. Cần xóa nav item hoặc tạo trang teacher quizzes riêng.

### Bookmarks field mismatch (To verify)
`BookmarksClient.tsx` references `vocabulary.hanzi` nhưng `Vocabulary` model dùng `vocabulary.word`. Cần kiểm tra service query và type definitions.

### Student progress visibility
Progress data (`PortalLessonProgress`, `PortalItemProgress`) tồn tại nhưng Teacher/Admin chưa có UI để xem per-student progress. Cần service query + view component mới.

### Finance / Salary
Toàn bộ domain Finance và Teacher Salary vắng mặt khỏi schema. Đã acknowledge là Todo — không nằm trong roadmap hiện tại.
