# Portal Authentication & RBAC Audit

## 1. Document Info

| Item | Value |
|---|---|
| Date | 2026-06-26 |
| Method | 3 parallel Explore agents (auth/portal-auth, RBAC/navigation, actions/utilities) + source file inspection |
| Source of truth | Actual source code only — audit docs treated as reference, code wins on conflict |
| Scope | Full auth system: NextAuth config, RBAC layers, session shape, server actions, API routes, portal pages |
| Status | Audit complete — implementation phases pending user approval |

---

## 2. Source Documents Reviewed

| Document | Path |
|---|---|
| Project Full Audit | `.claude/project/hsk-ruby/audits/PROJECT_FULL_AUDIT.md` |
| Auth & RBAC Database Audit | `.claude/project/hsk-ruby/architecture/AUTH_RBAC_DATABASE_AUDIT.md` |
| Supabase Usage Boundary | `.claude/project/hsk-ruby/architecture/SUPABASE_USAGE_BOUNDARY.md` |
| Tech Stack Operation Analysis | `.claude/project/hsk-ruby/architecture/TECH_STACK_OPERATION_ANALYSIS.md` |
| Project Rules | `.claude/project/hsk-ruby/architecture/PROJECT_RULES.md` |
| Role-Based Feature Matrix | `.claude/project/hsk-ruby/product/ROLE_BASED_FEATURE_MATRIX.md` |
| Feature Flow Review | `.claude/project/hsk-ruby/product/FEATURE_FLOW_REVIEW.md` |
| Feature Recommendation Matrix | `.claude/project/hsk-ruby/product/FEATURE_RECOMMENDATION_MATRIX.md` |

---

## 3. Files Found

### Auth core

| File | Status | Purpose |
|---|---|---|
| `auth.config.ts` | ✅ Exists | Edge-compatible NextAuth config — `authorized()` callback |
| `auth.ts` | ✅ Exists | Full NextAuth — Google OAuth + Credentials, Prisma, token save |
| `types/next-auth.d.ts` | ✅ Exists | Session/User/JWT type augmentation |
| `middleware.ts` | ❌ Does not exist | Route protection via `auth.config.ts` instead |

### Portal auth pages

| File | Status |
|---|---|
| `app/(portal-auth)/portal/login/page.tsx` | ✅ Exists |
| `app/(portal-auth)/portal/register/page.tsx` | ✅ Exists |
| `app/(portal-auth)/portal/error/page.tsx` | ✅ Exists |
| `app/(portal-auth)/portal/unauthorized/page.tsx` | ✅ Exists |

### API routes

| File | Status |
|---|---|
| `app/api/auth/[...nextauth]/route.ts` | ✅ Exists |
| `app/api/auth/register/route.ts` | ✅ Exists |

### Portal layouts

| File | Status |
|---|---|
| `app/(portal)/layout.tsx` | ✅ Exists — Layer 1 auth gate |
| `app/(portal)/portal/[role]/layout.tsx` | ✅ Exists — Layer 2 RBAC (5 guards) |

### Auth utilities

| File | Status |
|---|---|
| `lib/utils/auth.ts` | ✅ Exists — roleToRoute, routeToRole, isRouteAllowedForRole, getDashboardPath |
| `lib/api-auth.ts` | ✅ Exists — requireAuth(), requireSelf() for API routes |
| `lib/portal/calendar-token.service.ts` | ✅ Exists — AES-256-GCM calendar token operations |

### Role definitions

| File | Status | Note |
|---|---|---|
| `constants/portal/roles.ts` | ✅ Exists | Runtime `const` objects: `USER_ROLE`, `STATUS`, etc. |
| `enums/portal/role.ts` | ✅ Exists | TypeScript `enum UserRole`, `enum UserStatus` |
| `constants/portal/navigation.ts` | ✅ Exists | Nav items per role — **contains a bug** (see §13) |

### Server Actions (11 files)

All in `actions/`:
`admin.actions.ts`, `assignment.actions.ts`, `attendance.actions.ts`, `class.actions.ts`,
`notification.actions.ts`, `practice-skill.actions.ts`, `practice.actions.ts`,
`profile.actions.ts`, `schedule.actions.ts`, `student.actions.ts`, `submission.actions.ts`

---

## 4. Current Auth Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ auth.config.ts  [Edge — no Prisma]                                  │
│  authorized() callback:                                              │
│  • /portal/* + not logged in → redirect /portal/login               │
│  • /portal/login|register|error + logged in → redirect /portal      │
│  • /portal/unauthorized → always passes through                     │
└─────────────────────────┬───────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│ app/(portal)/layout.tsx  [Layer 1 — Node.js]                        │
│  await auth() → !session.user → redirect /portal/login              │
│  Wraps: SessionProvider (refetchInterval=300), ToastContainer,      │
│         PortalLayoutClient (sidebar, header, notifications)         │
└─────────────────────────┬───────────────────────────────────────────┘
                          ↓ (only /portal/* routes)
┌─────────────────────────────────────────────────────────────────────┐
│ app/(portal)/portal/[role]/layout.tsx  [Layer 2 — Node.js]          │
│  Guard 1: !session?.user → redirect /portal/login                   │
│  Guard 2: urlRole not in VALID_URL_ROLES → notFound()               │
│  Guard 3: status !== ACTIVE → redirect /portal/login?error=ACCOUNT_LOCKED │
│  Guard 4: !userRole → redirect /portal/login?error=no-role          │
│  Guard 5: !isRouteAllowedForRole(urlRole, userRole)                 │
│           → redirect /portal/{correctRole}/dashboard                │
└─────────────────────────┬───────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│ page.tsx  [Layer 3 — per page, INCONSISTENTLY implemented]          │
│  Pattern: await auth() + role check + redirect on failure           │
│  Status: 10 admin pages ✅, 4 shared pages ✅, 5 pages ⚠️ MISSING   │
└─────────────────────────────────────────────────────────────────────┘
```

**Key principle:** No `middleware.ts`. The `auth.config.ts` `authorized()` callback is exported and wired to Next.js via the `auth` export. This is a NextAuth v5 App Router pattern — the config runs on the Edge runtime to avoid importing Node.js modules.

---

## 5. Current Login Flow

### Google OAuth

```
1. User visits /portal/login
2. Click "Đăng nhập với Google" → signIn("google")
3. Redirect to Google consent page
   Scopes: openid email profile https://www.googleapis.com/auth/calendar.events
   Options: access_type=offline, prompt=consent (forced every login)
4. Google redirects to /api/auth/callback/google
5. auth.ts signIn() callback:
   a. First login: create PortalUser (role=STUDENT, status=ACTIVE, auto-generate username)
   b. Existing user: check status (LOCKED/INACTIVE → return false → redirect /portal/error)
   c. Save tokens to Account table (prisma.account.upsert)
   d. Save encrypted refresh token to GoogleCalendarToken (AES-256-GCM)
6. jwt() callback: populate token.{ id, role, status, username, name, picture, lastRefreshed }
7. session() callback: expose session.user.{ id, role, status, username, name, email, image }
8. Redirect: /portal → (portal layout) → /portal/{roleSegment}/dashboard
```

### Credentials (email + password)

```
1. User visits /portal/login
2. Fill email + password → signIn("credentials", { email, password })
3. auth.ts authorize():
   a. Validate with Zod schema (email format, password min 6)
   b. prisma.portalUser.findUnique({ where: { email } })
   c. bcrypt.compare(password, user.password)
   d. Check status (LOCKED/INACTIVE → return null)
   e. Return user object { id, email, name, username, image, role, status }
4. signIn() callback: re-verify status from DB
5. jwt() + session() callbacks: same as Google flow
6. Redirect: /portal → /portal/{roleSegment}/dashboard
```

### Register

```
1. User visits /portal/register
2. POST /api/auth/register — Zod validation, bcrypt hash, prisma.portalUser.create
3. Redirect to /portal/login
```

### Logout

```
signOut() → clears JWT cookie → redirect to /portal/login
```

---

## 6. Current Session/JWT Flow

### JWT token shape

```ts
// Stored in signed HTTP-only cookie
{
  id: string           // PortalUser.id
  role: string         // "SYSTEM_ADMIN" | "TEACHER" | "STUDENT"
  status: string       // "ACTIVE" | "INACTIVE" | "LOCKED"
  username?: string    // unique portal username slug
  name: string | null
  picture: string | null  // avatar URL
  lastRefreshed: number   // timestamp ms
  email: string
}
```

### Session shape (client-accessible)

```ts
session.user = {
  id: string
  role: string
  status: string
  username?: string
  name?: string | null
  email: string
  image?: string | null
}
```

### JWT refresh strategy

- Refreshes from DB every **5 minutes** OR on `trigger === "update"`
- Re-fetches `prisma.portalUser.findUnique({ where: { email } })`
- Repopulates: id, role, status, name, username, picture
- **Risk R03:** Locked user stays active up to 5 minutes after admin changes status

### SessionProvider config

```ts
<SessionProvider refetchInterval={300} refetchOnWindowFocus={false}>
```

Client re-fetches session every 5 minutes. Matches JWT refresh interval.

---

## 7. Current Prisma/Supabase Integration

### Database access

```
All code → lib/prisma.ts (singleton) → PrismaClient → DATABASE_URL (pgbouncer:6543) → Supabase PostgreSQL
Migrations only → DIRECT_URL (postgres:5432) — bypasses pgbouncer
```

### Prisma singleton (`lib/prisma.ts`)

```ts
const prismaClientSingleton = () => new PrismaClient({ log: ["error", "warn"] })
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
```

Standard Next.js hot-reload safe singleton pattern.

### Relevant models

| Model | Purpose |
|---|---|
| `PortalUser` | All portal users — unified model (STUDENT/TEACHER/SYSTEM_ADMIN) |
| `Account` | NextAuth OAuth accounts (Google tokens stored here) |
| `Session` | NextAuth session records (JWT strategy — not used for session lookup) |
| `VerificationToken` | NextAuth email verification tokens |
| `GoogleCalendarToken` | AES-256-GCM encrypted calendar tokens per user |

### Supabase boundary — confirmed compliant

| Check | Result |
|---|---|
| `supabase.auth.*` calls | ✅ ZERO — Not used |
| Supabase JS for DB queries | ✅ ZERO — Prisma only |
| `SUPABASE_SERVICE_ROLE_KEY` in client code | ✅ ZERO |
| Direct client-side storage uploads | ✅ ZERO |

**VIOLATION FOUND:**
`bookmarks/page.tsx` uses `new PrismaClient()` directly instead of `{ prisma } from "@/lib/prisma"`.
This bypasses the singleton, creating a new DB connection on every request. — **See §13 C1**

---

## 8. Current Route Protection

### Public routes (no auth required)

```
/                       Landing home
/about
/contact
/courses/[slug]
/privacy
/terms
/system-design          ⚠️ Should have noindex meta or be behind auth
```

### Auth routes (authenticated users redirected away)

```
/portal/login
/portal/register
/portal/error
/portal/unauthorized    Exception: authenticated users CAN still access this
```

### Protected portal routes

```
/portal                 → redirected to /portal/{role}/dashboard by portal index page
/portal/admin/*         → SYSTEM_ADMIN only
/portal/teacher/*       → TEACHER only
/portal/student/*       → STUDENT only
/portal/profile/*       → any authenticated user
```

### Redirect flows

| Scenario | Result |
|---|---|
| Unauthenticated → `/portal/*` | Redirect `/portal/login` |
| Authenticated → `/portal/login` | Redirect `/portal` |
| STUDENT visits `/portal/admin/users` | Layer 2 Guard 5 → redirect `/portal/student/dashboard` |
| LOCKED account login attempt | `signIn()` returns false → NextAuth error page → `/portal/error?error=AccessDenied` |
| LOCKED account JWT refresh | Guard 3 → redirect `/portal/login?error=ACCOUNT_LOCKED` |

### Role → URL mapping (`lib/utils/auth.ts`)

| DB Role | URL Segment | Dashboard Path |
|---|---|---|
| `SYSTEM_ADMIN` | `admin` | `/portal/admin` |
| `TEACHER` | `teacher` | `/portal/teacher` |
| `STUDENT` | `student` | `/portal/student` |

---

## 9. Current RBAC / Permission Model

### Role definitions — DUAL SOURCE (must stay in sync)

```ts
// constants/portal/roles.ts (runtime usage)
export const USER_ROLE = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const

// enums/portal/role.ts (TypeScript type usage)
export enum UserRole {
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}
```

### Layer 3 page guard audit

#### Admin CMS pages — ALL GUARDED ✅ (10 pages)

Pattern used:
```ts
const session = await auth()
if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
  redirect("/portal")
}
```

Pages: albums, categories, courses, cta-stats, features, hero-slides, hsk-levels, registrations, reviews, users, seo

#### Shared/multi-role pages

| Page | Guard Present | Guard Type | Status |
|---|---|---|---|
| `assignments/page.tsx` | ✅ | urlRole vs session role + ROLE_ROUTES check | OK |
| `assignments/[id]/page.tsx` | ✅ | Auth + urlRole + ownership (teacher) + enrollment (student) | Strong |
| `schedule/page.tsx` | ✅ | urlRole vs session role + ROLE_ROUTES check | OK |
| `students/page.tsx` | ✅ | `TEACHER or SYSTEM_ADMIN` explicit check | OK |
| `attendance/page.tsx` | ⚠️ | Auth check only, no role guard — role-based render without validation | **Missing** |
| `classes/page.tsx` | ⚠️ | Auth check only, no role guard — role-based render without validation | **Missing** |
| `classes/[classId]/page.tsx` | ⚠️ | Auth check only, no ownership/enrollment check | **Missing** |

#### Student-only pages

| Page | Guard Present | Status |
|---|---|---|
| `practice/page.tsx` | ✅ | urlRole match + `userRole !== ROLE_ROUTES.STUDENT` → notFound() | OK |
| `practice/[level]/[lessonSlug]/page.tsx` | ✅ | urlRole match + STUDENT check | OK |
| `progress/page.tsx` | ✅ | urlRole match + STUDENT check | OK |
| `quizzes/page.tsx` | ✅ | urlRole match + STUDENT check | OK |
| `bookmarks/page.tsx` | ⚠️ | Auth check only — no role guard, assumes STUDENT | **Missing** |
| `vocabulary/page.tsx` | ⚠️ | Auth check only — no role guard, assumes STUDENT | **Missing** |

#### Dashboard page

| Page | Guard Present | Note |
|---|---|---|
| `[role]/page.tsx` | ⚠️ | No `auth()` call — relies entirely on Layer 2 | Acceptable but inconsistent |

### Server Action auth patterns

**Standard pattern** (all 11 action files):
```ts
const session = await auth()
if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
```

**Admin-only helper** (`admin.actions.ts`):
```ts
async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    throw new Error("Unauthorized: admin access required")
  }
  return session
}
```

**Cross-user protection examples:**
- `submission.actions.ts` → verifies student enrollment in class before submit
- `submission.actions.ts` → `gradeSubmissionAction` verifies `assignment.teacherId === session.user.id`
- `attendance.actions.ts` → `saveAttendance` checks `role !== TEACHER && role !== SYSTEM_ADMIN` → returns 403
- `schedule.actions.ts` → `syncScheduleToGoogleCalendar` verifies `scheduleSeries.teacherId !== session.user.id`

**API route helper** (`lib/api-auth.ts`):
```ts
export async function requireAuth(roles?: string[]): Promise<AuthResult>
// → 401 if no session, 403 if role not in allowed list

export async function requireSelf(userId: string): Promise<AuthResult>
// → calls requireAuth(), then checks session.user.id === userId
```

### Navigation role visibility

Each nav item has a `roles: UserRole[]` array:
```ts
{ href: "/portal/admin/users", label: "Quản lý người dùng", roles: [USER_ROLE.SYSTEM_ADMIN] }
```

`getNavItemsByRole(role)` filters the correct nav list. Navigation UI only shows items the user's role has access to. **However, this is UI-only — server-side guards are still required.**

---

## 10. Portal UX/Auth States

### Login page states

| State | Handled |
|---|---|
| Loading (sign-in in progress) | ✅ Button disabled state |
| Invalid credentials | ✅ Error message displayed |
| Account locked | ✅ Error from NextAuth → /portal/error page |
| Redirect after login | ✅ Auto-redirects to /portal → role dashboard |

### Session states

| State | Handled |
|---|---|
| Session valid | ✅ Normal portal access |
| Session expired | ⚠️ SessionProvider re-fetches — but no explicit UX on expiry |
| Account locked mid-session | ⚠️ JWT refresh (5 min) catches it → redirect to login |
| Unauthorized role access | ✅ Layer 2 redirects to correct role dashboard |

### Portal header/sidebar user state

- User avatar, name, role badge displayed in `PortalHeader.tsx`
- Sidebar items filtered by `getNavItemsByRole(session.user.role)`
- `NotificationDropdown.tsx` connected to Supabase Realtime — updates in real-time

### Loading/error states per portal module

- **No per-module `loading.tsx`** — causes blank flash on navigation (R15)
- **No per-module `error.tsx`** — unhandled errors bubble to root error boundary (R17)

---

## 11. Security Findings

| # | Finding | Severity | File |
|---|---|---|---|
| S1 | No Supabase Auth usage — confirmed zero violations | ✅ PASS | — |
| S2 | No `SUPABASE_SERVICE_ROLE_KEY` in client code | ✅ PASS | — |
| S3 | Passwords hashed with bcryptjs before storage | ✅ PASS | `auth.ts` |
| S4 | Google Calendar tokens encrypted AES-256-GCM | ✅ PASS | `lib/portal/calendar-token.service.ts` |
| S5 | Google calendar scope forced on ALL Google logins including students | ⚠️ RISK | `auth.ts` |
| S6 | No hardcoded admin emails or role overrides | ✅ PASS | — |
| S7 | Server actions validate session server-side before mutations | ✅ PASS | `actions/*` |
| S8 | Supabase Storage upload auth enforced server-side only | ✅ PASS | `app/api/portal/upload/*` |
| S9 | `documents` storage bucket is public — student submissions accessible without auth | ⚠️ RISK (R09) | `scripts/setup-storage.ts` |
| S10 | Two Supabase project URLs in `next.config.ts` — unclear which is production | ⚠️ RISK (R07) | `next.config.ts` |
| S11 | `bookmarks/page.tsx` uses `new PrismaClient()` — connection pool violation | ❌ CRITICAL | `bookmarks/page.tsx` |
| S12 | Silent anon-key fallback in supabase-storage when service role key missing | ⚠️ LOW | `lib/supabase-storage.ts` |

---

## 12. Gap Analysis

| Area | Expected | Current | Status | Notes |
|---|---|---|---|---|
| No `middleware.ts` | Edge protection via `auth.config.ts` | `auth.config.ts` `authorized()` only | ✅ Correct | This is the NextAuth v5 App Router pattern |
| Layer 1 auth | All portal routes authenticated | `(portal)/layout.tsx` has `auth()` check | ✅ Present | |
| Layer 2 RBAC | 5 guards in `[role]/layout.tsx` | All 5 guards confirmed present | ✅ Complete | |
| Layer 3 — Admin CMS | SYSTEM_ADMIN guard on all admin pages | 10/10 admin pages guarded | ✅ Complete | |
| Layer 3 — Teacher pages | TEACHER guard on teacher-specific pages | assignments ✅, schedule ✅, students ✅, attendance ⚠️, classes ⚠️ | ⚠️ Partial | |
| Layer 3 — Student pages | STUDENT guard on student-specific pages | practice ✅, quizzes ✅, progress ✅, bookmarks ⚠️, vocabulary ⚠️ | ⚠️ Partial | |
| Prisma singleton | All DB access via `lib/prisma.ts` | `bookmarks/page.tsx` uses `new PrismaClient()` | ❌ Violated | Critical bug |
| Server action auth | All actions check session | All 11 action files have session check | ✅ Complete | |
| Admin action guard | All admin actions behind `requireAdmin()` | All admin actions use `requireAdmin()` | ✅ Complete | |
| Teacher ownership check | Teacher can only modify own resources | Schedule, submissions, attendance verified | ✅ Complete | |
| Student enrollment check | Student can only access enrolled class resources | Submissions and attendance verified | ✅ Complete | |
| Registration.status field | Was documented as potentially missing | `RegistrationStatus` enum exists: PENDING/CONTACTED/ENROLLED/CANCELLED | ✅ Already exists | Docs were outdated |
| bookmarks vocabulary field | Docs said hanzi vs word mismatch | Code maps `hanzi: ip.vocabulary.word` | ✅ Already handled | No fix needed |
| `getSessionOrThrow()` helper | Referenced in PROJECT_RULES.md §4.3 | Not implemented in `lib/utils/auth.ts` | ❌ Missing | Implementation pending |
| `assertRole()` helper | Referenced in PROJECT_RULES.md §4.3 | Not implemented in `lib/utils/auth.ts` | ❌ Missing | Implementation pending |
| `hasRole()` helper | Referenced in PROJECT_RULES.md §4.3 | Not implemented in `lib/utils/auth.ts` | ❌ Missing | Implementation pending |
| Teacher quizzes nav item | Bug documented in ROLE_BASED_FEATURE_MATRIX | Confirmed in navigation.ts + quizzes/page.tsx | ❌ Active bug | P0 fix required |
| Google Calendar incremental auth | Should be teacher-only (R02) | Scope forced on ALL Google logins | ⚠️ R02 open | P2 fix |
| Per-module loading.tsx | Required per PROJECT_RULES §9 | None present in portal modules | ❌ Missing | P4 task |
| Per-module error.tsx | Required per PROJECT_RULES §9 | None present in portal modules | ❌ Missing | P4 task |

---

## 13. Critical Issues

### C1 — CRITICAL: Prisma singleton violation in `bookmarks/page.tsx`

**File:** `app/(portal)/portal/[role]/bookmarks/page.tsx`

**Problem:** Uses `new PrismaClient()` directly instead of the project singleton.
```ts
// WRONG — current code
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
```
Should be:
```ts
// CORRECT
import { prisma } from "@/lib/prisma"
```

**Impact:** Creates a new database connection on every page request. In production under load, this exhausts the pgbouncer connection pool. Violates the #1 project rule from `PROJECT_RULES.md` and `CLAUDE.md`.

---

### C2 — HIGH: Teacher quizzes nav item leads to `notFound()`

**File:** `constants/portal/navigation.ts` — `teacherNavItems` array

**Problem:** The nav item `/portal/teacher/quizzes` is present in the teacher navigation. The `quizzes/page.tsx` handler checks `if (userRole !== ROLE_ROUTES.STUDENT) notFound()` — so teachers always receive a 404 when clicking this nav item.

**Fix:** Remove the entry from `teacherNavItems` until a teacher quizzes page is built.

---

### C3 — MEDIUM: `attendance/page.tsx` — Missing Layer 3 role guard

**File:** `app/(portal)/portal/[role]/attendance/page.tsx`

**Problem:** Auth check only. No explicit role validation before branching to student vs teacher/admin view. A malformed request could theoretically bypass the role branch.

**Current code:**
```ts
if (!session?.user?.email) redirect("/portal/login")
if (session.user.role === USER_ROLE.STUDENT) return <StudentAttendanceView />
return <AttendanceMatrixView />  // teacher/admin gets this by default
```

**Note:** Layer 2 provides protection, but page should be self-contained.

---

### C4 — MEDIUM: `classes/page.tsx` — Missing Layer 3 role guard

**File:** `app/(portal)/portal/[role]/classes/page.tsx`

**Problem:** Same pattern as attendance — auth check only, role-based render without explicit guard.

---

### C5 — MEDIUM: `classes/[classId]/page.tsx` — No ownership/enrollment check

**File:** `app/(portal)/portal/[role]/classes/[classId]/page.tsx`

**Problem:** Only checks `if (!session || !session.user) redirect("/portal")`. Passes `classId` and `role` to `ClassDetailView` client component. Authorization (teacher owns class, student is enrolled) is delegated to the client component's data fetching.

**Risk:** Server-side authorization is not enforced in the page. If `ClassDetailView` has a bug or an attacker bypasses the client component, unauthorized access is possible.

---

### C6 — MEDIUM: `bookmarks/page.tsx` — No STUDENT-only role guard

**File:** `app/(portal)/portal/[role]/bookmarks/page.tsx`

**Problem:** Auth check only. The page assumes the user is a student but never validates `session.user.role === USER_ROLE.STUDENT`.

---

### C7 — MEDIUM: `vocabulary/page.tsx` — No STUDENT-only role guard

**File:** `app/(portal)/portal/[role]/vocabulary/page.tsx`

**Problem:** Same as bookmarks — auth check only, no role validation.

---

### C8 — LOW: Dashboard `page.tsx` — No `auth()` call

**File:** `app/(portal)/portal/[role]/page.tsx`

**Problem:** Dashboard page does not call `auth()` directly — relies entirely on Layer 2 layout guard. Inconsistent with the project's RBAC pattern. Layer 2 is strong enough to protect it, but if the layout guard is ever bypassed, the dashboard has no fallback.

---

### C9 — LOW: Google Calendar scope forced on all Google logins (R02)

**File:** `auth.ts` — Google provider `authorization.params`

**Problem:**
```ts
scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
access_type: 'offline',
prompt: 'consent',  // forced every login
```

Students are asked to grant Google Calendar access on login. This is unnecessary for students and reduces OAuth conversion rate. Should use incremental auth — request calendar scope only when a TEACHER first uses the schedule feature.

---

## 14. Important Improvements

| ID | Priority | Description | File(s) |
|---|---|---|---|
| I1 | **P0** | Fix Prisma singleton violation — replace `new PrismaClient()` with `{ prisma } from "@/lib/prisma"` | `bookmarks/page.tsx` |
| I2 | **P0** | Remove `/portal/teacher/quizzes` from `teacherNavItems` until teacher quizzes page is built | `constants/portal/navigation.ts` |
| I3 | **P1** | Add Layer 3 guards to: attendance, classes, classes/[classId], bookmarks, vocabulary | 5 page.tsx files |
| I4 | **P1** | Implement missing auth helpers: `getSessionOrThrow()`, `assertRole()`, `hasRole()` — referenced in PROJECT_RULES §4.3 | `lib/utils/auth.ts` |
| I5 | **P2** | Restrict Google Calendar OAuth scope to teacher-only incremental auth | `auth.ts`, new `/api/portal/google-calendar/connect` endpoint |
| I6 | **P2** | Add `loading.tsx` per portal module route (prevents blank flash — R15) | Multiple new files |
| I7 | **P2** | Add `error.tsx` per portal module route (R17) | Multiple new files |
| I8 | **P2** | Add explicit session-expired UX in portal layout | `app/(portal)/layout.tsx` or `PortalLayoutClient.tsx` |
| I9 | **P3** | Consolidate dual role definition files (`constants/portal/roles.ts` + `enums/portal/role.ts`) — risk R21 | Both files |
| I10 | **P3** | Add `noindex` meta to `/system-design` page | `app/(landing)/system-design/page.tsx` |

---

## 15. Recommended Implementation Phases

### Phase 0 — P0 Critical bug fixes (2 files, do immediately)

**Do before any other portal work.**

| Task | File | Change |
|---|---|---|
| Fix Prisma singleton | `app/(portal)/portal/[role]/bookmarks/page.tsx` | Replace `new PrismaClient()` with `{ prisma } from "@/lib/prisma"` |
| Remove teacher quizzes nav bug | `constants/portal/navigation.ts` | Delete the `/portal/teacher/quizzes` entry from `teacherNavItems` |

---

### Phase 1 — Layer 3 RBAC completion (6 files)

Add explicit role guards to pages that currently rely solely on Layer 2.

**Standard STUDENT-only guard pattern:**
```ts
const session = await auth()
if (!session?.user) redirect("/portal/login")
const { role: urlRole } = await params
const userRole = session.user.role.toLowerCase()
if (urlRole !== userRole) notFound()
if (userRole !== ROLE_ROUTES.STUDENT) notFound()
```

**Files and target guards:**

| File | Guard to add |
|---|---|
| `attendance/page.tsx` | Explicit role-to-urlRole match check before render branch |
| `classes/page.tsx` | Explicit role-to-urlRole match check before render branch |
| `classes/[classId]/page.tsx` | Server-side: teacher ownership (class.teacherId === session.user.id), student enrollment check |
| `bookmarks/page.tsx` | STUDENT-only guard + remove `new PrismaClient()` (covered by Phase 0) |
| `vocabulary/page.tsx` | STUDENT-only guard |

**Add auth helpers to `lib/utils/auth.ts`:**
```ts
// Referenced in PROJECT_RULES.md §4.3 but not yet implemented
export async function getSessionOrThrow(): Promise<Session> {
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

---

### Phase 2 — Google Calendar incremental auth (R02)

**Scope:** Teachers only need calendar access.

**Changes:**
1. `auth.ts` — Remove `calendar.events` scope from default Google provider
2. New endpoint `app/api/portal/google-calendar/connect/route.ts` — handles incremental OAuth for teachers
3. Teacher schedule page — add "Connect Google Calendar" button if no calendar token found

**Risk:** Requires thorough testing of Google OAuth flow — existing teacher calendar tokens must not be invalidated.

---

### Phase 3 — UX Polish (loading + error states)

Add per-module `loading.tsx` and `error.tsx` to every route segment under `portal/[role]/`:

**`loading.tsx` pattern:**
```tsx
import { Skeleton } from "@heroui/react"
export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
```

**`error.tsx` pattern:**
```tsx
"use client"
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-danger">Đã xảy ra lỗi. Vui lòng thử lại.</p>
      <Button onPress={reset}>Thử lại</Button>
    </div>
  )
}
```

---

### Phase 4 — Role definition consolidation (R21)

Merge `constants/portal/roles.ts` and `enums/portal/role.ts` so there is one source of truth. Requires auditing all imports across the codebase before merging.

---

## 16. Open Questions

| # | Question | Relevant Files | Required Decision |
|---|---|---|---|
| OQ1 | `classes/[classId]/page.tsx`: Should ownership (teacher owns class) and enrollment (student is enrolled) be validated server-side in the page, or is the current `ClassDetailView` client-delegation acceptable? | `classes/[classId]/page.tsx`, `ClassDetailView.tsx` | Decision on where auth responsibility lives |
| OQ2 | Phase scope for next session: All 4 phases in one session, or Phase 0 + 1 only? | N/A | Prioritization |
| OQ3 | `documents` Supabase bucket is `public: true` — student assignment submissions are publicly accessible by URL. Should this be changed to signed URLs now (R09)? | `scripts/setup-storage.ts`, `lib/supabase-storage.ts` | Security policy decision |
| OQ4 | Two Supabase project URLs in `next.config.ts` (`ukbeoggejnqgdxqoqkvj` vs `alfbzgjpjvrcfaxxvijl`) — which is the active production project? | `next.config.ts` | Must be verified before removing stale URL (R07) |
