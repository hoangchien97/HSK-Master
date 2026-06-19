# Portal Feature Audit

**Date:** 2026-06-19
**Source:** Static inspection of `app/(portal)/`, `components/portal/`, `actions/`, `services/portal/`

---

## 1. Portal Route Structure

```
/portal                          → Redirect hub → routes to /portal/{role}
/portal/profile                  → User profile (all authenticated roles)

/portal/admin/                   → SYSTEM_ADMIN dashboard
/portal/admin/hero-slides
/portal/admin/courses
/portal/admin/hsk-levels
/portal/admin/categories
/portal/admin/albums
/portal/admin/reviews
/portal/admin/features
/portal/admin/cta-stats
/portal/admin/users
/portal/admin/registrations
/portal/admin/seo

/portal/teacher/                 → TEACHER dashboard
/portal/teacher/classes
/portal/teacher/classes/[classId]
/portal/teacher/assignments
/portal/teacher/assignments/[id]
/portal/teacher/attendance
/portal/teacher/schedule
/portal/teacher/students

/portal/student/                 → STUDENT dashboard
/portal/student/practice
/portal/student/practice/[level]/[lessonSlug]
/portal/student/progress
/portal/student/vocabulary
/portal/student/quizzes
/portal/student/bookmarks
/portal/student/schedule
```

Auth pages (outside portal group):
```
/portal/login
/portal/register
/portal/error
/portal/unauthorized
```

---

## 2. Portal Layout Architecture

```
app/(portal)/layout.tsx                    Server — auth check, SessionProvider, HeroUIProvider
  └── PortalLayoutClient.tsx               Client — sidebar state, layout shell
        ├── NotificationProvider           Supabase Realtime subscriptions
        ├── PortalSidebar.tsx              Fixed left sidebar (64px logo + nav + logout)
        ├── PortalHeader.tsx               Sticky top (hamburger + notifications + user menu)
        ├── PortalContent                  Scrollable main area
        │     └── {page content}
        └── AIChatbot                      Floating bubble — ALL portal pages (⚠ R19)
```

**PortalSidebar.tsx:**
- Width: 256px, fixed on lg+, slide-from-left overlay on mobile
- Logo area (64px) + nav items (role-filtered via `getNavItemsByRole`) + logout button
- Active link: `bg-red-50 text-red-600`
- Badge support on nav items
- Mobile: overlay + close button

**PortalHeader.tsx:**
- 64px height, sticky, z-10
- Left: hamburger (mobile) — toggles sidebar
- Right: `NotificationDropdown` + `UserMenu` (avatar + name + role + dropdown: Profile, Settings, Help, Logout)
- Avatar: gradient bg `from-red-500 to-red-600`

**AIChatbot (⚠ R19 — undocumented):**
- Floating bubble present on ALL portal pages
- Routes to `/api/portal/chat/` (DeepSeek AI backend)
- Not in sidebar navigation — users may not discover it
- Chat sessions: `/api/portal/chat/session/[sessionId]/`

---

## 3. Role-Based Module Matrix

| Module | ADMIN | TEACHER | STUDENT |
|---|---|---|---|
| Dashboard | ✅ Stats + quick actions | ✅ Class/student overview | ✅ Learning stats + continue |
| Hero Slides (CMS) | ✅ CRUD | — | — |
| Courses (CMS) | ✅ CRUD | — | — |
| HSK Levels (CMS) | ✅ CRUD | — | — |
| Categories (CMS) | ✅ CRUD | — | — |
| Albums (CMS) | ✅ CRUD | — | — |
| Reviews (CMS) | ✅ CRUD | — | — |
| Features (CMS) | ✅ CRUD | — | — |
| CTA Stats (CMS) | ✅ CRUD | — | — |
| SEO Metadata (CMS) | ✅ CRUD | — | — |
| Users | ✅ Full management | — | — |
| Registrations | ✅ View/manage | — | — |
| Classes | ✅ Full CRUD | ✅ Manage own classes | ✅ View enrolled classes |
| Assignments | ✅ View all | ✅ Create/edit/grade | ✅ Submit/view feedback |
| Attendance | ✅ View all | ✅ Record attendance | — |
| Schedule | ✅ Full management | ✅ Manage + Google Cal | ✅ View own schedule |
| Students | ✅ All students | ✅ Own class students | — |
| Practice | — | — | ✅ SRS flashcard/quiz/write/listen |
| Progress | — | — | ✅ Learning progress tracking |
| Vocabulary | — | — | ✅ Browse vocabulary |
| Quizzes | — | — | ✅ To verify depth |
| Bookmarks | — | — | ✅ To verify depth |
| Profile | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |
| AI Chatbot | ✅ (undocumented) | ✅ (undocumented) | ✅ (undocumented) |

---

## 4. RBAC Enforcement Status

### Layer 1 — Edge middleware (auth.config.ts)
✅ Redirects unauthenticated `/portal/*` → `/portal/login`
✅ Prevents authenticated users from re-accessing login/register
✅ Edge-compatible (no Prisma, no Node.js APIs)

### Layer 2 — Server layout ([role]/layout.tsx)
✅ 5 sequential guards confirmed:
1. `session?.user` exists → else redirect to `/portal/login`
2. URL role is valid (`admin|teacher|student`) → else `notFound()`
3. `status === ACTIVE` → else redirect with `?error=ACCOUNT_LOCKED`
4. `userRole` populated in session → else redirect with `?error=no-role`
5. URL role matches session role → else redirect to correct role dashboard

### Layer 3 — Page-level guards
⚠ **Inconsistent** — not all pages confirmed.

Confirmed with guards:
- `users/page.tsx` — checks `role === SYSTEM_ADMIN`
- `students/page.tsx` — checks `role === TEACHER || SYSTEM_ADMIN`
- `classes/page.tsx` — role-aware rendering (student vs teacher/admin views)

Not confirmed (R04 — needs audit):
- All other portal module pages
- All `app/api/portal/*` route handlers

### API routes role enforcement
⚠ All API routes check `auth()` session (authentication confirmed) but per-endpoint role enforcement varies:
- Some routes filter data by role (classes: students see enrolled, teachers see own)
- Whether teacher can call admin-only endpoints directly is **not confirmed** (R04)

---

## 5. Portal Common Components

**`components/portal/common/`** — 14 components:

| Component | Purpose |
|---|---|
| `CTable.tsx` | Advanced reusable data table (see §6) |
| `CModal.tsx` | HeroUI Modal wrapper with standard close handling |
| `CDrawer.tsx` | HeroUI Drawer wrapper |
| `CSpinner.tsx` | Loading spinner |
| `EmptyState.tsx` | Icon + title + description + action button |
| `StatCard.tsx` | Stat box: icon, number, label, color variant |
| `DataCard.tsx` | Generic card container |
| `PageHeader.tsx` | Section title + description |
| `FileUploadZone.tsx` | Drag-drop file upload (client, calls API route) |
| `FilePreviewList.tsx` | Display list of uploaded files |
| `FormInput.tsx` | Input field wrapper |
| `Breadcrumb.tsx` | Navigation breadcrumb |
| `RoleBadge.tsx` | Role chip display |
| `LoadingSpinner.tsx` | Full-page spinner |

---

## 6. CTable.tsx — Reusable Table Component

`components/portal/common/CTable.tsx` is the primary data table across all admin/teacher modules.

**Features:**
- Sortable columns
- Server-side pagination with page size selector
- Row selection (single / multi)
- Sticky headers
- Toolbar slots (search, filters, actions)
- Custom cell renderers via column config
- Built-in empty state (uses `EmptyState.tsx`)
- Loading state integration (`CSpinner`)
- URL-synchronized state: `useSyncSearchToUrl()` hook keeps search/page in URL

**Pattern used in admin modules:**
```
<CTable
  columns={[...]}
  data={items}
  total={total}
  page={page}
  pageSize={pageSize}
  onPageChange={...}
  toolbar={<SearchInput + FilterDropdown />}
/>
```

---

## 7. Admin CMS Pattern

All 11 admin CMS modules follow this structure:

```
components/portal/admin/<module>/
  <Module>Table.tsx         List view — CTable + toolbar (search, filters)
  <Module>FormModal.tsx     Create/edit form — manual useState, HeroUI Form
  <Module>Modal.tsx         Wrapper modal if separate from form
  DeleteConfirmModal.tsx    (shared in common/)
  ImagePreviewModal.tsx     (shared in common/)
  ImageUpload.tsx           (shared in common/)
```

**Server Action pattern:**
```typescript
'use server'
// actions/admin.actions.ts
export async function createXAction(data: CreateXDTO) {
  const session = await auth()
  if (session.user.role !== USER_ROLE.SYSTEM_ADMIN) redirect('/portal')
  // Zod validation: absent in most admin actions
  const result = await adminService.createX(data)
  revalidatePath('/portal/admin/x')
  return result
}
```

**⚠ Form validation gap (R10):** Admin forms use `useState` + ad-hoc required checks. React Hook Form + Zod not deployed in any form.

---

## 8. Practice Module Deep Dive

**Location:** `components/portal/practice/` (17 files)

**Architecture:**
- `LessonPracticeView.tsx` — Client component, receives SSR-serialized lesson data as props
- 5 tabs, each dynamically imported with `{ ssr: false }`:

| Tab | Component | Browser API Used |
|---|---|---|
| Flashcard | `FlashcardTab.tsx` | Web Speech API (TTS) |
| Quiz | `QuizTab.tsx` | — |
| Listen | `ListenTab.tsx` | Web Speech API |
| Write | `WriteTab.tsx` | Canvas (hanzi-writer) |
| Lookup | `LookupTab.tsx` | — |

**Write tab sub-components:**
- `AnimationMode.tsx` — Watch stroke animation
- `PracticeStrokeMode.tsx` — User traces strokes
- `TypePinyinMode.tsx` — Type pinyin

**Error handling:** `TabErrorBoundary.tsx` wraps each tab — tab crashes don't break the whole practice view.

**Loading:** `TabSkeleton()` shown during dynamic import.

**Data flow:**
1. Server Component fetches lesson + vocabulary SSR
2. `LessonPracticeView` receives serialized data as props
3. On tab selection: `fetchPracticeQueue()` called for that mode's SRS queue
4. Progress saved via: `refreshLessonProgress`, `resetPracticeSessionAction`

**Session resume:** `PortalLessonSessionState` model tracks last active tab + position.

---

## 9. Dashboard Components

**AdminDashboard.tsx (client, `components/portal/dashboards/`):**
- Fetches stats via `useCallback loadData()` on mount
- 4 quick action cards → hero-slides, reviews, registrations, users
- 6 content stats grid → courses, hsk-levels, categories, albums, features, cta-stats
- ⚠ No recent activity feed, no pending registrations count — sparse

**StudentDashboard.tsx (props-based, server-rendered data):**
Props: `{ studentName, stats, continueLearning, upcomingClasses, pendingAssignments, recentVocabulary, learningProgress }`
Stats: `{ wordsLearned, streakDays, completedLessons, pendingAssignments, overallProgress }`
- Continue learning card (last active lesson + mode + mastery score)
- Upcoming classes list
- Pending assignments list
- Recent vocabulary review list

**TeacherDashboard.tsx (props-based):**
Props: `{ teacherName, stats: { totalClasses, totalStudents, upcomingClasses, pendingAssignments, attendanceRate } }`
- Today's schedule
- Recent submissions list
- StatCard grid

---

## 10. Notification System

**Architecture:**
```
Server creates → prisma.portalNotification.create()
                 ↓
           PostgreSQL (Supabase)
                 ↓ Supabase Realtime INSERT event
Client reads  → providers/notification-provider.tsx
                 ↓
           React state (local cache)
                 ↓
           NotificationDropdown in PortalHeader
```

**`providers/notification-provider.tsx`:**
- 261 lines
- Supabase channel: filters by `userId=eq.{currentUserId}` (RLS-compatible)
- Events: INSERT (prepend + unread count++) and UPDATE (mark read)
- Optimistic updates for mark-as-read
- Initial load: `fetchNotifications()` server action → Prisma query

**`actions/notification.actions.ts`:**
- `fetchNotifications()` — initial data load
- `markNotificationReadAction()` — single mark read
- `markAllNotificationsReadAction()` — bulk mark read

---

## 11. UX Strengths

- `CTable.tsx` is production-quality: sort, pagination, selection, URL sync
- `EmptyState.tsx` exists and is reusable — prevents blank states
- Practice tab architecture: dynamic imports with `ssr:false` is architecturally correct
- `TabErrorBoundary` prevents practice tab crashes from killing the session
- Notification system: Supabase Realtime + optimistic updates = good UX
- Role-aware rendering in classes page (students vs teachers see different UI)
- 5-guard layout protection: robust server-side RBAC

---

## 12. UX Issues

### R15 — No per-module loading.tsx
Only 3 route-group level `loading.tsx` files exist. Individual portal modules show blank content during server fetch. Users see content flash.
**Fix:** Add `loading.tsx` with HeroUI Skeleton to every portal module folder.

### R10 — Forms use manual useState, no validation library
All admin CMS forms, login, register, and contact forms use `useState` + ad-hoc validation.
React Hook Form (installed) and Zod (used in 2 places only) are not deployed.
**Fix:** Migrate all forms to React Hook Form + Zod. Start with new forms.

### AdminDashboard is sparse
Shows CMS quick links and content counts. No:
- Pending registrations count
- New students this week
- Recent activity feed
- Revenue/capacity summary

### R19 — AI Chatbot undiscoverable
AIChatbot bubble present on all portal pages but not in sidebar navigation or any onboarding. Users don't know it exists.
**Fix:** Add "AI Trợ lý" to sidebar nav, or add onboarding tooltip on first portal visit.

### Quizzes and Bookmarks — To verify
Routes exist (`/portal/student/quizzes`, `/portal/student/bookmarks`) but implementation depth not confirmed during audit.

### No teacher grade book
Teachers can grade assignments via `PortalAssignmentSubmission` but no dedicated grade book / scoring dashboard exists.

### No enrollment pipeline UI
`Registration` model exists for course leads but no status workflow UI (PENDING → CONTACTED → ENROLLED) for admin.

---

## 13. Suggested Portal Information Architecture

```
Admin Portal
├── Dashboard (activity feed + stats)
├── CMS
│   ├── Hero Slides
│   ├── Courses & HSK Levels
│   ├── Categories
│   ├── Albums & Reviews
│   ├── Features & CTA Stats
│   └── SEO & Metadata
├── Management
│   ├── Users
│   ├── Registrations (with status pipeline)
│   └── Classes (overview)
└── AI Assistant (sidebar link)

Teacher Portal
├── Dashboard
├── My Classes
├── Assignments
├── Attendance
├── Schedule (+ Google Calendar)
├── Students
└── AI Assistant

Student Portal
├── Dashboard (continue learning + streak)
├── Practice (SRS tabs)
├── Progress
├── Vocabulary
├── Quizzes
├── Bookmarks
├── Schedule
└── AI Assistant
```

---

## 14. Missing States

| State | Current | Fix |
|---|---|---|
| Per-module loading | Route-group loading.tsx only | Add loading.tsx per module |
| Form validation errors | Ad-hoc, inconsistent | React Hook Form + Zod |
| Unauthorized (granular) | /portal/unauthorized with reason param | Verify all redirect paths use reason |
| Empty states | EmptyState.tsx exists | Ensure all CTable uses it |
| Error boundary per page | route-group error.tsx only | Consider per-module error.tsx |
| Optimistic updates | Only in notifications | Apply to common CUD operations |
