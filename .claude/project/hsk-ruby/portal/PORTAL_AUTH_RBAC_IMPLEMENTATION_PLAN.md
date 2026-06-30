# Portal Auth/RBAC Implementation Plan

**Date:** 2026-06-26
**Based on:** `PORTAL_AUTH_RBAC_AUDIT.md` (2026-06-26)
**Status:** Draft — pending implementation approval

---

## 1. Goal

Fix all critical and medium auth/RBAC gaps found during the audit. Produce a portal where:

1. Every portal page is self-contained — has its own auth guard independent of layout
2. The Prisma singleton rule is enforced everywhere (no `new PrismaClient()`)
3. Teacher navigation has no broken links
4. Auth utility helpers documented in PROJECT_RULES.md §4.3 are actually implemented
5. Security posture meets "defense in depth" — a bypass at any one layer does not expose data

---

## 2. Non-Goals

The following are OUT OF SCOPE for this implementation plan. Each needs its own dedicated plan:

| Item | Reason deferred |
|---|---|
| Google Calendar incremental auth (R02) | High-risk Google OAuth change — needs dedicated test plan |
| `loading.tsx` / `error.tsx` per module | High-volume file addition — separate task |
| Role definition consolidation (R21) | Touches all imports — high blast radius |
| Session-expired UX improvements | UX work, not a security gap |
| `documents` Supabase bucket → signed URLs (R09) | Storage architecture change |
| Dual Supabase URL cleanup (R07) | Requires production environment verification |
| `noindex` on `/system-design` | Minor SEO task |
| Finance/Salary/GradeBook features | Out of auth scope |

---

## 3. Assumptions

1. **No schema changes needed.** All required models (`PortalUser`, `Account`, `GoogleCalendarToken`, etc.) already exist with the correct fields. `RegistrationStatus` enum is confirmed present.

2. **No new dependencies.** All required packages are already installed. Auth logic uses only `next-auth`, `@auth/prisma-adapter`, `bcryptjs`, `zod`, and `@/lib/prisma`.

3. **Layer 2 is trusted.** `app/(portal)/portal/[role]/layout.tsx` with its 5 guards is strong and correct. Layer 3 additions are hardening, not replacements.

4. **`lib/utils/auth.ts` is the single source for role-routing helpers.** Always import from there — never hardcode role strings.

5. **`components/portal/` stays as the component root** (not `src/components_v2/`). No new component files needed for auth fixes.

6. **Server Actions are in `actions/*.actions.ts`.** No API route refactoring.

7. **`ROLE_ROUTES` (lowercase: `admin`, `teacher`, `student`) vs `USER_ROLE` (uppercase: `SYSTEM_ADMIN`, `TEACHER`, `STUDENT`) distinction must be maintained.** Both are used in guard patterns — do not mix them.

---

## 4. Architecture Decisions

### AD1: Layer 3 guard pattern — use `ROLE_ROUTES` not `USER_ROLE` for role comparison

For pages that serve multiple roles with different views, use `ROLE_ROUTES` (the URL segments) because `params.role` is already a URL segment:

```ts
// Preferred for pages with role-variant views
const { role: urlRole } = await params
const userRole = session.user.role.toLowerCase()
if (urlRole !== userRole) notFound()

// Then branch:
if (urlRole === ROLE_ROUTES.STUDENT) return <StudentView />
if (urlRole === ROLE_ROUTES.TEACHER) return <TeacherView />
return notFound()
```

For single-role pages, use `USER_ROLE` constants directly:

```ts
// Preferred for single-role-only pages
if (session.user.role !== USER_ROLE.SYSTEM_ADMIN) redirect("/portal")
```

### AD2: `notFound()` vs `redirect()` on auth failure

| Scenario | Response | Reason |
|---|---|---|
| URL role segment doesn't match session role | `notFound()` | URL itself is invalid — correct role URL exists |
| User is not logged in | `redirect("/portal/login")` | User needs to authenticate |
| User is logged in but wrong role | `notFound()` | Prevents role enumeration — don't reveal the correct URL |
| Admin-only page, non-admin user | `redirect("/portal")` | Layer 2 will catch at /portal and route correctly |

**Exception:** Admin CMS pages currently use `redirect("/portal")` instead of `notFound()`. This is acceptable — consistent with existing codebase pattern. Do not change it.

### AD3: `classes/[classId]/page.tsx` — server-side validation approach

Ownership/enrollment check belongs in the server page, not the client component. The page will:
1. Fetch the class from Prisma (needs classId)
2. Check teacher ownership or student enrollment before rendering

This is the correct Next.js App Router pattern — server pages are the security boundary.

### AD4: `getSessionOrThrow()` — returns Session, not Session | null

```ts
// In lib/utils/auth.ts
export async function getSessionOrThrow() {
  const session = await auth()
  if (!session?.user) redirect("/portal/login")
  return session  // TypeScript now knows session is non-null
}
```

This eliminates repetitive null checks across pages. Can be adopted incrementally — existing pages don't need to be refactored to use it immediately.

### AD5: Auth helpers in `lib/utils/auth.ts` — server-only

`getSessionOrThrow()` calls `auth()` and `redirect()` — both are server-only. Add `"use server"` is NOT needed (it's not a Server Action — it's a utility function called by Server Components). But the file must not be imported in client components.

---

## 5. Phase Plan

### Phase 0 — Critical Bug Fixes (2 files)

**Priority: Do first. Blocks everything else.**

#### P0.1 — Fix Prisma singleton in `bookmarks/page.tsx`

**Current:** `const prisma = new PrismaClient()` at module level

**After:** `import { prisma } from "@/lib/prisma"`

**Impact:** Prevents connection pool exhaustion in production. No behavior change for end users.

**Risk:** None — purely a dependency substitution.

---

#### P0.2 — Remove teacher quizzes nav item

**Current:** `teacherNavItems` in `constants/portal/navigation.ts` contains:
```ts
{ href: "/portal/teacher/quizzes", label: "Bài kiểm tra", icon: ClipboardCheck, roles: [USER_ROLE.TEACHER] }
```

**After:** Entry removed entirely from `teacherNavItems`.

**Impact:** Teachers no longer see a broken "Bài kiểm tra" nav link. Direct URL access `/portal/teacher/quizzes` still works (renders "Đang phát triển" for students, notFound for teachers — which is acceptable since teachers won't navigate there without the nav item).

**Risk:** None. The quizzes page (`quizzes/page.tsx`) is NOT deleted — only the nav item is removed.

---

### Phase 1 — Layer 3 RBAC Guard Completion (6 files)

**Priority: High — closes the MEDIUM security gaps from audit.**

#### P1.1 — `attendance/page.tsx` — Add urlRole guard

**Current behavior:** Auth check → branch on `session.user.role`. No explicit urlRole validation.

**After:** Add urlRole vs session.user.role consistency check before branching.

**Expected behavior:**
- `/portal/student/attendance` with STUDENT session → `StudentAttendanceView`
- `/portal/teacher/attendance` with TEACHER session → `AttendanceMatrixView`
- `/portal/admin/attendance` with SYSTEM_ADMIN session → `AttendanceMatrixView`
- `/portal/teacher/attendance` with STUDENT session → Layer 2 catches before page (Guard 5), but page now also returns `notFound()`

---

#### P1.2 — `classes/page.tsx` — Add urlRole guard

**Current behavior:** Auth check → branch on `session.user.role`.

**After:** Same urlRole guard pattern as P1.1.

---

#### P1.3 — `classes/[classId]/page.tsx` — Add server-side ownership/enrollment check

**Current behavior:** Auth check → pass classId and role to `ClassDetailView` client component.

**After:**
1. Fetch class from Prisma (select: id, className, teacherId, enrollments with studentId)
2. If `userRole === ROLE_ROUTES.TEACHER`: verify `class.teacherId === session.user.id` → `notFound()` if false
3. If `userRole === ROLE_ROUTES.STUDENT`: verify student is enrolled → `notFound()` if not enrolled
4. If `userRole === ROLE_ROUTES.ADMIN` (resolved to SYSTEM_ADMIN): allow all
5. Pass fetched class data (or classId only) to `ClassDetailView`

**Risk:** `ClassDetailView` currently fetches its own data. After this change, the page also queries the DB for ownership check — adds one Prisma query. This is acceptable. If `ClassDetailView` needs the full class object, refactor its props accordingly.

---

#### P1.4 — `bookmarks/page.tsx` — Add STUDENT-only guard + apply Prisma singleton

**Note:** Prisma singleton fix (P0.1) must be done first.

**Current behavior:** Auth check only. Fetches data for any authenticated user.

**After:**
1. Auth check → session must exist
2. urlRole check → if `urlRole !== ROLE_ROUTES.STUDENT` → `notFound()`
3. Proceed with data fetch using `prisma` singleton

---

#### P1.5 — `vocabulary/page.tsx` — Add STUDENT-only guard

**Current behavior:** Auth check only. Fetches vocabulary data for any authenticated user.

**After:** Add STUDENT-only urlRole guard identical to P1.4 (minus the Prisma fix).

---

#### P1.6 — `lib/utils/auth.ts` — Add missing auth helpers

Add three functions referenced in PROJECT_RULES.md §4.3 but not yet implemented:

```ts
export async function getSessionOrThrow() {
  const session = await auth()
  if (!session?.user) redirect("/portal/login")
  return session
}

export function assertRole(session: Session, allowedRoles: string[]): void {
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/portal")
  }
}

export function hasRole(session: Session, role: string): boolean {
  return session.user.role === role
}
```

**Note:** `Session` type imported from `next-auth`. `auth` imported from `@/auth`. `redirect` imported from `next/navigation`.

**Adoption:** These helpers are for future pages. Existing pages do NOT need to be refactored to use them — this is additive only.

---

### Phase 2 — Prisma/DB Schema Verification (0 schema changes)

**Priority: Verification only — confirms no migration needed.**

All required models for auth/RBAC are confirmed present:

| Model | Status | Notes |
|---|---|---|
| `PortalUser` | ✅ Complete | All auth fields: id, email, role, status, password, username, image |
| `Account` | ✅ Complete | NextAuth OAuth tokens |
| `Session` | ✅ Complete | NextAuth sessions (JWT strategy — not used at runtime) |
| `VerificationToken` | ✅ Complete | Email verification |
| `GoogleCalendarToken` | ✅ Complete | AES-256-GCM encrypted tokens |
| `UserRole` enum | ✅ Complete | SYSTEM_ADMIN, TEACHER, STUDENT |
| `UserStatus` enum | ✅ Complete | ACTIVE, INACTIVE, LOCKED |
| `RegistrationStatus` enum | ✅ Complete | PENDING, CONTACTED, ENROLLED, CANCELLED |

**No migration required for this implementation plan.**

If Phase 2 (Google Calendar incremental auth) is approved in a future session, a migration will be needed to add a `calendarScopeGranted` field to `PortalUser` or `GoogleCalendarToken`.

---

### Phase 3 — NextAuth v5 Login/Session Callbacks Audit

**Priority: Low — current implementation is correct. Minor hardening only.**

#### P3.1 — Credentials `authorize()` — already correct

The current implementation in `auth.ts`:
- Validates input with Zod (email format, password min 6)
- Finds user by email via Prisma
- Compares password with `bcrypt.compare`
- Checks status (LOCKED/INACTIVE → return null)
- Returns user object

**No changes needed.**

#### P3.2 — Google signIn callback — already correct

- Creates PortalUser on first login (role=STUDENT)
- Checks status on subsequent logins
- Saves tokens to Account + GoogleCalendarToken (AES-256-GCM)

**No changes needed for this phase.**

#### P3.3 — JWT refresh strategy — document known risk

The current 5-minute refresh window (R03) is a known acceptable risk. A locked user can remain active for up to 5 minutes.

**No change for now.** If this becomes a business requirement, options are:
- Reduce refresh interval (increases DB load)
- Use database session strategy instead of JWT (requires `PrismaAdapter` session strategy change — high impact)
- Emit a force-logout signal via Supabase Realtime (medium complexity)

**Document in KNOWN_RISKS.md — defer to a future session.**

#### P3.4 — Session type augmentation — already correct

`types/next-auth.d.ts` correctly augments Session, User, and JWT interfaces with `id`, `role`, `status`, `username`.

**No changes needed.**

---

### Phase 4 — Route Protection Plan

**Priority: Verification — Layer 1 and 2 are already correct.**

#### P4.1 — Edge protection (`auth.config.ts`) — correct

`authorized()` callback correctly:
- Redirects unauthenticated users from `/portal/*` to `/portal/login`
- Redirects authenticated users away from `/portal/login|register|error`
- Allows `/portal/unauthorized` through for all users

**No changes needed.**

#### P4.2 — Layer 2 (`[role]/layout.tsx`) — correct

All 5 guards are confirmed present and correct. See §4 of PORTAL_AUTH_RBAC_AUDIT.md.

**No changes needed.**

#### P4.3 — Layer 3 — see Phase 1

All 5 missing pages covered in Phase 1.

#### P4.4 — Public routes — no change

Landing pages (`/`, `/about`, `/contact`, `/courses/[slug]`, `/privacy`, `/terms`) are correctly unprotected. The `/system-design` route is deferred to a future low-priority cleanup task.

---

### Phase 5 — Portal Layout/User Session/Nav Visibility

**Priority: Low — current implementation is mostly correct.**

#### P5.1 — `PortalSidebar` nav filtering — correct

`getNavItemsByRole(role)` correctly returns only role-appropriate nav items. Teacher quizzes bug fixed in Phase 0.

**No changes after P0.2.**

#### P5.2 — `SessionProvider` config — acceptable

```ts
<SessionProvider refetchInterval={300} refetchOnWindowFocus={false}>
```

5-minute interval matches JWT refresh. `refetchOnWindowFocus={false}` prevents unnecessary re-fetches on tab switch.

**No changes needed.**

#### P5.3 — Portal header user state — correct

Avatar, name, role badge in `PortalHeader.tsx`. NotificationDropdown connected to Supabase Realtime.

**No changes needed.**

#### P5.4 — Missing loading/error states — deferred

`loading.tsx` and `error.tsx` per module is a high-volume file addition task. Tracked as I6/I7 in the audit. **Deferred to a separate dedicated task.**

---

### Phase 6 — Page/API Authorization Checks

**Priority: Verification — confirmed correct. Document patterns.**

#### P6.1 — Server Action auth pattern — confirmed correct (all 11 files)

All server actions:
1. `const session = await auth()`
2. Check `session?.user?.id` → return `{ success: false, error: 'Unauthorized' }` if absent
3. Role-specific actions check role before proceeding

**No changes needed.** The `requireAdmin()` helper in `admin.actions.ts` is the gold standard.

#### P6.2 — API route auth pattern — confirmed correct

`lib/api-auth.ts` provides `requireAuth(roles?)` and `requireSelf(userId)`. All portal API routes use one of these.

**No changes needed.**

#### P6.3 — Teacher ownership checks — confirmed correct

Schedule sync, attendance save, submission grading all verify `teacherId === session.user.id`.

**No changes needed.**

#### P6.4 — Student enrollment checks — confirmed correct

Submission submit and attendance fetch verify enrollment before proceeding.

**No changes needed.**

---

### Phase 7 — QA/Security Verification

**Run manually after all phases are implemented.**

Full test matrix in §13.

---

## 6. File Change Plan

### Phase 0 (2 files)

| File | Change | Type |
|---|---|---|
| `app/(portal)/portal/[role]/bookmarks/page.tsx` | Replace `new PrismaClient()` with `{ prisma } from "@/lib/prisma"`. Remove the top-level `const prisma = new PrismaClient()` line. | Bug fix |
| `constants/portal/navigation.ts` | Delete the `{ href: "/portal/teacher/quizzes", ... }` entry from `teacherNavItems`. | Bug fix |

### Phase 1 (6 files)

| File | Change | Type |
|---|---|---|
| `app/(portal)/portal/[role]/attendance/page.tsx` | Add urlRole guard after auth check: `const { role: urlRole } = await params; if (urlRole !== session.user.role.toLowerCase()) notFound()` | Layer 3 guard |
| `app/(portal)/portal/[role]/classes/page.tsx` | Same urlRole guard as attendance | Layer 3 guard |
| `app/(portal)/portal/[role]/classes/[classId]/page.tsx` | Add Prisma query for class ownership/enrollment check before rendering. See exact spec in §9. | Security hardening |
| `app/(portal)/portal/[role]/bookmarks/page.tsx` | Add STUDENT-only urlRole guard: `if (urlRole !== ROLE_ROUTES.STUDENT) notFound()` | Layer 3 guard |
| `app/(portal)/portal/[role]/vocabulary/page.tsx` | Same STUDENT-only guard as bookmarks | Layer 3 guard |
| `lib/utils/auth.ts` | Add `getSessionOrThrow()`, `assertRole()`, `hasRole()` — additive only | New helpers |

### Phases 2–6

No file changes — verification and documentation only.

---

## 7. Prisma/Database Plan

### No schema changes required

All models are in place. This implementation plan requires zero migrations.

### Queries added by Phase 1 (P1.3)

`classes/[classId]/page.tsx` will add one new Prisma query to verify class access:

```ts
// Minimal query — only fetch what's needed for auth check
const classRecord = await prisma.portalClass.findUnique({
  where: { id: classId },
  select: {
    id: true,
    teacherId: true,
    enrollments: {
      where: { studentId: session.user.id },
      select: { id: true },
    },
  },
})

if (!classRecord) notFound()

// Teacher: must own the class
if (urlRole === ROLE_ROUTES.TEACHER && classRecord.teacherId !== session.user.id) {
  notFound()
}

// Student: must be enrolled
if (urlRole === ROLE_ROUTES.STUDENT && classRecord.enrollments.length === 0) {
  notFound()
}

// Admin: passes all — no ownership check needed
```

**Performance note:** This is a single SELECT with a filtered JOIN on enrollments. With the existing `@@unique([studentId, classId])` index on `PortalClassEnrollment`, this is a fast indexed lookup.

---

## 8. NextAuth v5 Plan

### Current config is correct — no changes in this plan

The auth split (`auth.config.ts` Edge / `auth.ts` Node.js) is correct and must be preserved.

Key invariants to maintain:

1. **Never import Prisma in `auth.config.ts`** — it runs on Edge runtime
2. **JWT strategy only** — do not switch to database sessions without a dedicated plan
3. **`auth()` from `@/auth`** is the only way to get session in Server Components
4. **`getServerSession()` from NextAuth v4 must never be used** — this is v5, use `auth()`
5. **`useSession()` from `next-auth/react`** is only for Client Components

### Google Calendar scope (deferred to separate plan)

The current forced `calendar.events` scope on all Google logins (R02) is a known risk. Fix is deferred because:
- It requires incremental OAuth — a new Google OAuth flow
- Existing teacher tokens are valid and must not be invalidated
- Requires adding a "Connect Calendar" UI flow for teachers

This deserves its own dedicated implementation plan.

---

## 9. Route Protection Plan

### Exact implementation for `classes/[classId]/page.tsx`

```ts
// CURRENT (to be replaced):
export default async function ClassDetailPage({ params }) {
  const session = await auth()
  if (!session || !session.user) {
    redirect("/portal")
  }
  const { classId, role } = await params
  return <ClassDetailView classId={classId} role={role} />
}

// AFTER (Phase 1.3):
export default async function ClassDetailPage({ params }) {
  const session = await auth()
  if (!session?.user) redirect("/portal/login")

  const { role: urlRole, classId } = await params
  const userRole = session.user.role.toLowerCase()

  // Layer 3: URL role must match session role
  if (urlRole !== userRole) notFound()

  // Layer 3: Ownership/enrollment check
  const classRecord = await prisma.portalClass.findUnique({
    where: { id: classId },
    select: {
      id: true,
      teacherId: true,
      enrollments: {
        where: { studentId: session.user.id },
        select: { id: true },
      },
    },
  })

  if (!classRecord) notFound()

  // Teacher must own the class
  if (urlRole === ROLE_ROUTES.TEACHER && classRecord.teacherId !== session.user.id) {
    notFound()
  }

  // Student must be enrolled
  if (urlRole === ROLE_ROUTES.STUDENT && classRecord.enrollments.length === 0) {
    notFound()
  }

  // Admin passes all checks
  return <ClassDetailView classId={classId} role={urlRole} />
}
```

### Exact implementation for `attendance/page.tsx` and `classes/page.tsx`

```ts
// Pattern for attendance/page.tsx (same pattern for classes/page.tsx):
export default async function AttendancePage({ params }) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()

  // Layer 3: URL role must match session role
  if (urlRole !== userRole) notFound()

  // Role-based render (unchanged logic)
  if (userRole === ROLE_ROUTES.STUDENT) {
    return <StudentAttendanceView />
  }

  // TEACHER or SYSTEM_ADMIN
  if (userRole === ROLE_ROUTES.TEACHER || userRole === ROLE_ROUTES.ADMIN) {
    return <AttendanceMatrixView />
  }

  notFound()
}
```

**Note:** `ROLE_ROUTES.ADMIN` = `"admin"` — this is the URL segment for SYSTEM_ADMIN. The above replaces the implicit fallthrough with an explicit check.

### Exact implementation for `bookmarks/page.tsx` guard

```ts
// Add after session check, before data fetch:
const { role: urlRole } = await params
const userRole = session.user.role.toLowerCase()
if (urlRole !== userRole) notFound()
if (userRole !== ROLE_ROUTES.STUDENT) notFound()
```

### Exact implementation for `lib/utils/auth.ts` additions

```ts
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import type { Session } from "next-auth"

// Existing functions: roleToRoute, routeToRole, getDashboardPath, etc.
// ... (unchanged)

/**
 * Returns the current session or redirects to login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function getSessionOrThrow(): Promise<Session & { user: NonNullable<Session["user"]> }> {
  const session = await auth()
  if (!session?.user) redirect("/portal/login")
  return session as Session & { user: NonNullable<Session["user"]> }
}

/**
 * Throws a redirect if the session user's role is not in allowedRoles.
 * Call after getSessionOrThrow() in page guards.
 */
export function assertRole(
  session: Session & { user: { role: string } },
  allowedRoles: string[]
): void {
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/portal")
  }
}

/**
 * Returns true if the session user has the given role.
 */
export function hasRole(
  session: Session & { user: { role: string } },
  role: string
): boolean {
  return session.user.role === role
}
```

---

## 10. RBAC Permission Plan

### Current permission model (no changes to this model)

| Role | DB enum | URL segment | Permitted areas |
|---|---|---|---|
| SYSTEM_ADMIN | `SYSTEM_ADMIN` | `admin` | Everything |
| TEACHER | `TEACHER` | `teacher` | Own classes, own students, schedule, attendance, assignments |
| STUDENT | `STUDENT` | `student` | Own practice, enrolled classes, own assignments, bookmarks, vocabulary |

### Permission boundaries confirmed in code (no changes)

| Boundary | Enforced in | Confirmed |
|---|---|---|
| Teacher sees only own classes | `class.actions.ts` filterBy teacherId | ✅ |
| Student sees only enrolled classes | `class.actions.ts` filterBy enrollments | ✅ |
| Teacher grades only own assignments | `submission.actions.ts` gradeSubmissionAction | ✅ |
| Student submits only to enrolled classes | `submission.actions.ts` submitAssignmentAction | ✅ |
| Teacher records attendance only for own classes | `attendance.actions.ts` saveAttendance | ✅ |
| Student views only own attendance | `attendance.actions.ts` fetchStudentAttendanceClasses | ✅ |
| Calendar sync only for own series | `schedule.actions.ts` syncScheduleToGoogleCalendar | ✅ |
| File delete verifies path contains userId | `app/api/portal/upload/file/route.ts` | ✅ |

### Permission gaps being closed by this plan

| Gap | Closes in Phase |
|---|---|
| Bookmarks accessible without STUDENT check | Phase 1.4 |
| Vocabulary accessible without STUDENT check | Phase 1.5 |
| Classes page accessible without role-URL match | Phase 1.2 |
| Attendance page accessible without role-URL match | Phase 1.1 |
| Class detail page: teacher can see another teacher's class | Phase 1.3 |
| Class detail page: student can see unenrolled class | Phase 1.3 |

---

## 11. Portal UI/Auth UX Plan

### Login page — no changes

Current behavior is correct:
- Google OAuth button → consent → redirect
- Credentials form → validation error display
- Error from NextAuth (locked account) → `/portal/error`
- After login → `/portal` → resolves to `/portal/{role}/dashboard`

### Portal sidebar — change in Phase 0

After P0.2 (remove teacher quizzes nav item), the teacher sidebar will no longer show "Bài kiểm tra". No other nav changes.

### Portal header user state — no changes

Avatar, name, role badge are correctly bound to `session.user` from the server layout.

### Auth error states

| Error | Current UX | Adequate? |
|---|---|---|
| Wrong password | "Thông tin đăng nhập không đúng" inline | ✅ |
| Locked account (login) | Redirects to `/portal/error?error=AccessDenied` | ✅ |
| Locked account (mid-session) | JWT refresh detects → redirect to `/portal/login?error=ACCOUNT_LOCKED` | ✅ |
| Session expired | `SessionProvider` silently re-fetches — no UX message | ⚠️ deferred |
| Unauthorized role | Layer 2 redirects to correct role dashboard | ✅ |

---

## 12. Security Checklist

### Pre-implementation (verify before starting)

- [ ] Run `grep -r "new PrismaClient" app/ components/ actions/ --include="*.ts" --include="*.tsx"` → must return only `lib/prisma.ts`
- [ ] Run `grep -r "supabase.auth" app/ components/ actions/ services/ --include="*.ts" --include="*.tsx"` → must return 0 results
- [ ] Run `grep -r "SUPABASE_SERVICE_ROLE_KEY" components/ app/ --include="*.tsx" --include="*.ts"` → must return 0 results
- [ ] Confirm `middleware.ts` does not exist at root

### Post-Phase 0 verification

- [ ] `bookmarks/page.tsx` imports `{ prisma } from "@/lib/prisma"` — no top-level `new PrismaClient()`
- [ ] `constants/portal/navigation.ts` `teacherNavItems` has no `/portal/teacher/quizzes` entry
- [ ] Teacher login → sidebar shows no "Bài kiểm tra" link

### Post-Phase 1 verification

- [ ] All 5 modified pages call `auth()` at the top
- [ ] All 5 modified pages check `urlRole !== session.user.role.toLowerCase()` → `notFound()`
- [ ] `bookmarks/page.tsx` and `vocabulary/page.tsx` return `notFound()` if `userRole !== ROLE_ROUTES.STUDENT`
- [ ] `classes/[classId]/page.tsx` returns `notFound()` for:
  - Teacher accessing another teacher's class
  - Student accessing an unenrolled class
- [ ] `lib/utils/auth.ts` exports `getSessionOrThrow`, `assertRole`, `hasRole`

### Ongoing security invariants (never break)

- [ ] `auth.config.ts` never imports Prisma or any Node.js-only package
- [ ] `auth.ts` is never imported in client components (`"use client"` files)
- [ ] `lib/prisma.ts` is never imported in client components
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never referenced in any file without `"use server"` or server-only context
- [ ] All Server Actions begin with `const session = await auth()` check before any data access
- [ ] New portal pages follow the pattern: auth check → role check → data fetch → render
- [ ] `components/portal/` — never import server-only libs (`auth`, `prisma`)

---

## 13. Manual Test Checklist

### Phase 0 tests

| Test | Steps | Expected |
|---|---|---|
| Bookmarks loads without DB errors | Login as STUDENT → navigate to /portal/student/bookmarks | Page loads, bookmarks display |
| Bookmarks under load (dev server) | Refresh /portal/student/bookmarks 5 times | No "too many connections" errors in server console |
| Teacher quizzes nav gone | Login as TEACHER | Sidebar does NOT show "Bài kiểm tra" link |
| Direct URL quizzes as teacher | Login as TEACHER → visit /portal/teacher/quizzes | 404 Not Found (notFound() behavior) |

### Phase 1 tests

#### Attendance page (P1.1)

| Test | User | URL | Expected |
|---|---|---|---|
| Student sees own attendance | STUDENT | `/portal/student/attendance` | `StudentAttendanceView` renders |
| Teacher sees matrix | TEACHER | `/portal/teacher/attendance` | `AttendanceMatrixView` renders |
| Admin sees matrix | SYSTEM_ADMIN | `/portal/admin/attendance` | `AttendanceMatrixView` renders |
| URL role mismatch | STUDENT | `/portal/teacher/attendance` | 404 (Layer 2 catches first, but page also guards) |

#### Classes page (P1.2)

| Test | User | URL | Expected |
|---|---|---|---|
| Student sees enrolled classes | STUDENT | `/portal/student/classes` | `StudentClassesView` renders |
| Teacher sees own classes | TEACHER | `/portal/teacher/classes` | `ClassesTable` renders |
| URL mismatch | STUDENT | `/portal/teacher/classes` | 404 (Layer 2 + page guard) |

#### Classes detail page (P1.3)

| Test | User | Setup | Expected |
|---|---|---|---|
| Teacher views own class | TEACHER | Class belongs to this teacher | `ClassDetailView` renders |
| Teacher views other class | TEACHER | Class belongs to different teacher | 404 |
| Student views enrolled class | STUDENT | Student is enrolled | `ClassDetailView` renders |
| Student views unenrolled class | STUDENT | Student is NOT enrolled | 404 |
| Admin views any class | SYSTEM_ADMIN | Any class | `ClassDetailView` renders |
| Invalid classId | Any role | Non-existent classId | 404 |

#### Bookmarks page (P1.4)

| Test | User | URL | Expected |
|---|---|---|---|
| Student views bookmarks | STUDENT | `/portal/student/bookmarks` | Bookmarks render |
| Teacher tries bookmarks URL | TEACHER | `/portal/teacher/bookmarks` | 404 |
| Admin tries bookmarks URL | SYSTEM_ADMIN | `/portal/admin/bookmarks` | 404 |

#### Vocabulary page (P1.5)

| Test | User | URL | Expected |
|---|---|---|---|
| Student views vocabulary | STUDENT | `/portal/student/vocabulary` | Vocabulary renders |
| Teacher tries vocabulary URL | TEACHER | `/portal/teacher/vocabulary` | 404 |

#### Auth helpers (P1.6)

| Test | Verification |
|---|---|
| `getSessionOrThrow()` exists | `lib/utils/auth.ts` exports it without TS errors |
| `assertRole()` exists | `lib/utils/auth.ts` exports it without TS errors |
| `hasRole()` exists | `lib/utils/auth.ts` exports it without TS errors |
| TypeScript build passes | `npx tsc --noEmit` — 0 errors |

### End-to-end auth flow tests (run after all phases)

| Test | Steps | Expected |
|---|---|---|
| Full Google OAuth login (STUDENT) | Sign out → sign in with Google → consent | Redirect to `/portal/student/dashboard` |
| Full credentials login (TEACHER) | Sign out → email + password → submit | Redirect to `/portal/teacher/dashboard` |
| Locked account attempt | Lock account in DB → try login | Redirect to `/portal/error?error=AccessDenied` |
| Wrong role URL attempt | Login as STUDENT → visit `/portal/admin/users` | Redirect to `/portal/student/dashboard` |
| Unauthenticated portal access | Sign out → visit `/portal/admin/users` | Redirect to `/portal/login` |
| Register new user | Visit `/portal/register` → submit valid form | Redirect to `/portal/login` |
| Authenticated user visits login | Login → visit `/portal/login` | Redirect to `/portal` |

---

## 14. Open Questions

| # | Question | Impact | Recommendation |
|---|---|---|---|
| OQ1 | `ClassDetailView` fetches its own data client-side in addition to the server-side auth query in P1.3 — is there duplication? | Medium — two DB queries for class data | After P1.3, review `ClassDetailView` props. If it already accepts class data, pass it from the page instead of re-fetching. Deferred to after Phase 1. |
| OQ2 | Should `classes/[classId]/page.tsx` check pass the fetched `classRecord` to `ClassDetailView` as a prop, or keep the client-side fetch inside `ClassDetailView`? | Medium — architecture decision | Recommended: pass `classId` only (existing behavior). ClassDetailView fetches full data. Page only does the auth check query. This avoids a large prop refactor. |
| OQ3 | `documents` Supabase bucket is `public: true` (R09). Student assignment submissions are publicly accessible by URL. Fix now or defer? | High security risk | **Recommend defer with explicit documentation.** Changing from public to signed URLs requires modifying the upload API, storage service, and all components that render document URLs. Needs a separate storage plan. |
| OQ4 | Active Supabase project URL (R07) — two hostnames in `next.config.ts`. Which is production? | Medium — may affect storage and image loading | Needs human verification: check Supabase dashboard to confirm active project. Not a code change — config change only once confirmed. |
| OQ5 | Should Phase 1 auth helpers (`getSessionOrThrow`, `assertRole`, `hasRole`) be adopted in existing pages as part of this plan, or additive-only? | Low | Additive-only: add helpers, do not refactor existing pages. Reduces blast radius of this plan. |
