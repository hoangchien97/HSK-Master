# Portal Auth/RBAC — Phase 1 Implementation Result

**Date:** 2026-06-26
**Branch:** chore/setup-claude-ai-workflow

---

## Summary

Phase 0 (2 critical bug fixes) + Phase 1 (5 Layer 3 RBAC guards) + Phase 2a (auth helpers) implemented in 7 files. TypeScript typecheck passed with zero errors.

---

## Changes Made

### Phase 0 — Critical Bug Fixes

#### P0.1 — `app/(portal)/portal/[role]/bookmarks/page.tsx`

**Bug:** `new PrismaClient()` instantiated at module scope — creates a new DB connection pool per request, exhausting Supabase's pooler limit.

**Fix:**
- Removed `import { PrismaClient } from "@prisma/client"` and `const prisma = new PrismaClient()`
- Added `import { prisma } from "@/lib/prisma"` (singleton)
- Added STUDENT-only guard (see Phase 1 below)

#### P0.2 — `constants/portal/navigation.ts`

**Bug:** `teacherNavItems` contained `/portal/teacher/quizzes` which calls `notFound()` for TEACHER role — all teachers saw a 404 when clicking "Bài kiểm tra" in the sidebar.

**Fix:** Removed the broken nav entry:
```ts
// REMOVED:
{
  href: "/portal/teacher/quizzes",
  label: "Bài kiểm tra",
  icon: ClipboardCheck,
  roles: [USER_ROLE.TEACHER],
},
```

---

### Phase 1 — Layer 3 RBAC Guard Completion

#### `app/(portal)/portal/[role]/bookmarks/page.tsx`

Added STUDENT-only guard. Previously relied on Layer 2 only. A non-student URL couldn't reach this page via normal navigation, but defense-in-depth now enforces it at page level.

```ts
if (session.user.role !== USER_ROLE.STUDENT) {
  notFound()
}
```

#### `app/(portal)/portal/[role]/vocabulary/page.tsx`

Same STUDENT-only guard added.

```ts
if (session.user.role !== USER_ROLE.STUDENT) {
  notFound()
}
```

#### `app/(portal)/portal/[role]/attendance/page.tsx`

Added `params` to function signature and explicit `urlRole` consistency check.

```ts
export default async function AttendancePage({ params }: { params: Promise<{ role: string }> }) {
  // ...
  const { role: urlRole } = await params
  if (!isRouteAllowedForRole(urlRole, session.user.role)) {
    notFound()
  }
  // existing role-branching unchanged
}
```

#### `app/(portal)/portal/[role]/classes/page.tsx`

Same urlRole guard added.

#### `app/(portal)/portal/[role]/classes/[classId]/page.tsx`

Added Prisma ownership/enrollment check. Previously, authorization was delegated to the `ClassDetailView` client component — unsafe.

```ts
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

// Teacher can only see classes they own
if (urlRole === roleToRoute(USER_ROLE.TEACHER) && classRecord.teacherId !== session.user.id) {
  notFound()
}
// Student can only see classes they are enrolled in
if (urlRole === roleToRoute(USER_ROLE.STUDENT) && classRecord.enrollments.length === 0) {
  notFound()
}
```

Admin (`urlRole === "admin"`) passes through both checks — can view any class.

---

### Phase 2a — Auth Helpers (`lib/utils/auth.ts`)

Added 3 utility functions referenced in PROJECT_RULES.md §4.3 but previously unimplemented:

```ts
// Redirect to login if unauthenticated; returns guaranteed non-null session
export async function getSessionOrThrow()

// Redirect to /portal if session.user.role is not in allowedRoles
export function assertRole(session, allowedRoles: string[]): void

// Type-safe role check
export function hasRole(session, role: string): boolean
```

Added `import { auth } from '@/auth'` and `import { redirect } from 'next/navigation'` to the file. Verified `auth.config.ts` does NOT import from `lib/utils/auth.ts`, so no Edge runtime breakage.

---

## Verification Checklist

| Test | Expected |
|---|---|
| Login as TEACHER → click "Bài kiểm tra" in sidebar | Nav item no longer exists — no 404 |
| Navigate directly to `/portal/teacher/quizzes` | Returns 404 (notFound by quizzes/page.tsx) |
| Login as TEACHER → navigate to `/portal/teacher/bookmarks` | 404 (STUDENT guard) |
| Login as STUDENT → navigate to `/portal/student/bookmarks` | Renders correctly |
| Login as STUDENT → navigate to `/portal/student/vocabulary` | Renders correctly |
| Login as ADMIN → navigate to `/portal/admin/vocabulary` | 404 (STUDENT guard) |
| Login as TEACHER → navigate to `/portal/teacher/attendance` | Teacher matrix view renders |
| Login as STUDENT → navigate to `/portal/student/attendance` | Student read-only view renders |
| Login as TEACHER → navigate to `/portal/student/classes` | 404 (urlRole mismatch) |
| Login as TEACHER → navigate to a class detail they DON'T own | 404 (ownership check) |
| Login as TEACHER → navigate to a class detail they DO own | Renders correctly |
| Login as STUDENT → navigate to a class detail they ARE NOT enrolled in | 404 (enrollment check) |
| Login as STUDENT → navigate to a class detail they ARE enrolled in | Renders correctly |
| Login as ADMIN → navigate to any class detail | Renders correctly (admin bypass) |

---

## Files Changed

| File | Type |
|---|---|
| `app/(portal)/portal/[role]/bookmarks/page.tsx` | P0 + P1 |
| `constants/portal/navigation.ts` | P0 |
| `app/(portal)/portal/[role]/attendance/page.tsx` | P1 |
| `app/(portal)/portal/[role]/classes/page.tsx` | P1 |
| `app/(portal)/portal/[role]/classes/[classId]/page.tsx` | P1 |
| `app/(portal)/portal/[role]/vocabulary/page.tsx` | P1 |
| `lib/utils/auth.ts` | P2a |

---

## What Was NOT Changed (Intentional)

| Area | Reason |
|---|---|
| `auth.config.ts` | Edge auth works correctly — no changes needed |
| `auth.ts` | NextAuth providers work correctly — no changes needed |
| `[role]/layout.tsx` | Layer 2 guards are correct — no changes needed |
| All 11 `actions/*.actions.ts` | All have correct session checks — no changes needed |
| `prisma/schema.prisma` | No schema migration needed for Phase 1 |
| Homepage/landing code | Out of scope per task rules |

---

## Remaining Issues (Not in Phase 1 Scope)

| ID | Description | Phase |
|---|---|---|
| R02 | Google Calendar scope requested for ALL Google logins (including students) | Phase 3 |
| R03 | JWT refresh window — locked user stays active up to 5 min after status change | Acceptable |
| R08 | `[role]/page.tsx` (dashboard) doesn't call `auth()` — relies on Layer 2 only | Phase 4 |
| R15 | No `loading.tsx` per portal module route | Phase 4 |
| R16 | No `error.tsx` per portal module route | Phase 4 |
