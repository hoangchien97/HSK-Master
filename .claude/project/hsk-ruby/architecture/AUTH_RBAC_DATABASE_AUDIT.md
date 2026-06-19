# Ruby HSK — Auth, RBAC, and Database Audit

**Date:** 2026-06-19 | **Source:** auth.ts, auth.config.ts, [role]/layout.tsx, prisma/schema.prisma, services/portal/, lib/prisma.ts

---

## 1. NextAuth v5 Configuration

### Config split (critical)

| File | Environment | Can use Prisma? | Purpose |
|---|---|---|---|
| `auth.config.ts` | Edge (middleware) | ❌ No | `authorized()` callback only — login check + redirects |
| `auth.ts` | Node.js | ✅ Yes | Full providers, callbacks, token/session population |

**Never import Prisma in `auth.config.ts`** — it runs on the Edge runtime.

### Google OAuth flow

```
User → signIn("google")
→ Google consent: openid email profile https://www.googleapis.com/auth/calendar.events
  (access_type: offline, prompt: consent — forced on EVERY Google login)
→ auth.ts signIn() callback:
  → First login: create PortalUser (role=STUDENT, status=ACTIVE, auto-generate username)
  → Existing user: check status (LOCKED/INACTIVE → return false)
  → Save tokens to Account table (prisma.account.upsert)
  → Save refresh token to GoogleCalendarToken (AES-256-GCM encrypted)
→ jwt() callback: populate token
→ session() callback: expose session.user
```

**Risk R02:** `calendar.events` scope is requested for ALL Google users including students. Students must consent to calendar access to log in. Reduces OAuth conversion rate. Fix: incremental auth — only request calendar scope when teacher first uses schedule feature.

### Credentials flow

```
User → signIn("credentials", { email, password })
→ auth.ts authorize():
  → prisma.portalUser.findUnique({ where: { email } })
  → bcrypt.compare(password, user.password)
  → Check status (LOCKED/INACTIVE → return null)
  → Return user object { id, email, name, username, image, role, status }
→ Same jwt/session callbacks
```

### JWT callback (`auth.ts`)

Token populated on sign-in:
```ts
token.{ id, role, status, name, username, picture, lastRefreshed }
```

**Refresh strategy:** Every 5 minutes OR on `trigger === "update"` — re-fetches user from `prisma.portalUser.findUnique({ where: { email } })`.

**Risk R03:** 5-minute window means a locked user can remain active for up to 5 minutes after being locked by admin.

### Session callback

```ts
session.user.{ id, role, status, username, name, email, image }
```

---

## 2. Session Type Augmentation

`types/next-auth.d.ts`:
```ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      status: string
      username?: string
    } & DefaultSession["user"]
  }
  interface User {
    role?: string
    status?: string
    username?: string
  }
}
declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
    status: string
    username?: string
  }
}
```

---

## 3. RBAC Enforcement — 3 Layers

### Layer 1 — Edge middleware (`auth.config.ts`)

```ts
authorized({ auth, request: { nextUrl } }) {
  const isLoggedIn = !!auth?.user
  const isOnPortal = nextUrl.pathname.startsWith("/portal")
  const isOnPortalAuth = /* login|register|error|unauthorized */

  if (isOnPortal && !isOnPortalAuth) {
    if (!isLoggedIn) return Response.redirect(new URL("/portal/login", nextUrl))
    return true
  } else if (isLoggedIn && isOnPortalAuth) {
    if (!nextUrl.pathname.startsWith("/portal/unauthorized")) {
      return Response.redirect(new URL("/portal", nextUrl))
    }
  }
  return true
}
```

**Checks: login status only.** Does NOT check role. No Prisma access.

### Layer 2 — Server Layout (`app/(portal)/portal/[role]/layout.tsx`)

Five sequential guards:
```ts
// Guard 1: Authentication
if (!session?.user) redirect("/portal/login")

// Guard 2: Valid URL role
if (!VALID_URL_ROLES.includes(urlRole)) notFound()

// Guard 3: Account status
if (session.user.status !== STATUS.ACTIVE) redirect("/portal/login?error=ACCOUNT_LOCKED")

// Guard 4: Role populated
if (!userRole) redirect("/portal/login?error=no-role")

// Guard 5: Role matches URL
if (!isRouteAllowedForRole(urlRole, userRole)) {
  const correctRoute = roleToRoute(userRole)
  redirect(`/portal/${correctRoute}/dashboard`)
}
```

### Layer 3 — Page-level guards (examples)

`users/page.tsx` (SYSTEM_ADMIN only):
```ts
if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
  redirect("/portal")
}
```

`students/page.tsx` (TEACHER or SYSTEM_ADMIN):
```ts
if (session.user.role !== USER_ROLE.TEACHER && session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
  redirect("/portal/student")
}
```

**Risk R04:** Layer 3 guards confirmed only for `users/` and `students/`. All other portal module pages need to be audited for missing guards.

---

## 4. Role Model

### Dual definition — must stay in sync

`constants/portal/roles.ts` (runtime const objects):
```ts
export const USER_ROLE = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const
```

`enums/portal/role.ts` (TypeScript enum):
```ts
export enum UserRole {
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}
```

**Risk R21:** If a role is added to one file but not the other, type errors may not surface immediately.

### Role-to-URL mapping (`lib/utils/auth.ts`)

```ts
ROLE_ROUTES = {
  SYSTEM_ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
}

roleToRoute("SYSTEM_ADMIN")           // → "admin"
routeToRole("teacher")                // → "TEACHER"
isRouteAllowedForRole(urlRole, role)  // → boolean
getDashboardPath(role)                // → "/portal/admin"
```

**Always use these helpers — never hardcode role strings or URL segments.**

---

## 5. Prisma Database Access

### Client setup (`lib/prisma.ts`)

```ts
const prismaClientSingleton = () => new PrismaClient({ log: ["error", "warn"] })
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
```

Standard singleton pattern for Next.js hot-reload compatibility.

### Connection URLs

| Variable | Port | Purpose |
|---|---|---|
| `DATABASE_URL` | 6543 (pgbouncer) | All app queries — connection pooling |
| `DIRECT_URL` | 5432 (direct) | Prisma migrations only — bypasses pooler |

Both point to Supabase-hosted PostgreSQL.

### Query patterns (all confirmed clean)

| Pattern | Status | Example |
|---|---|---|
| Parallel queries | ✅ | `Promise.all([serviceA(), serviceB()])` in dashboard.service.ts |
| Pagination | ✅ | `skip: (page-1)*pageSize, take: pageSize` |
| Transactions | ✅ | `prisma.$transaction()` for album photo cleanup |
| Upsert | ✅ | `prisma.portalItemProgress.upsert()` in practice.service.ts |
| Aggregation | ✅ | `.groupBy()` + `_avg` for skill progress by mode |
| Raw SQL | ❌ | Zero `$queryRaw` / `$executeRaw` found |

### pg package

**Status: Dead dependency.** Zero imports in entire codebase. Safe to remove from `package.json`.

---

## 6. Schema Model Groups

### Group 1 — Public learning content
`Category, Course, Lesson, Vocabulary, GrammarPoint, HeroSlide, HSKLevel, Feature, CtaStat, Album, Photo, Review, PageMetadata, Registration`

### Group 2 — Practice / learning tracking
`PortalLessonProgress, PortalItemProgress, PortalItemSkillProgress, PortalLessonSkillProgress, PortalLessonSessionState, PortalPracticeSession, PortalPracticeAttempt`

### Group 3 — Portal / management
`PortalUser, PortalClass, PortalClassEnrollment, PortalScheduleSeries, PortalSchedule, PortalAssignment, PortalAssignmentSubmission, PortalAttendance, PortalNotification, ChatSession, ChatMessage, GoogleCalendarToken`

### Group 4 — NextAuth models
`Account, Session, VerificationToken`

---

## 7. Migration History

| Count | Range | Key milestones |
|---|---|---|
| 21 migrations | 2025-06 → 2026-03 | Init v2, portal models, user role enum, index optimization |

Notable migrations:
- `20260127061540_add_portal_models` — Major: all portal management models added
- `20260204082449_add_user_role_enum` — Role enum added
- `20260227000000_add_google_calendar_token` — Calendar token encryption
- `20260301174255_add_missing_indexes` — **Risk R06:** indexes added late after schema existed

---

## 8. Seed Files

| File | Contents |
|---|---|
| `prisma/seed.ts` | Landing page data: 3 categories, 6 HSK levels, hero slides, features, CTA stats, reviews |
| `prisma/seed-vocabulary.ts` | HSK vocabulary from JSON exports (6 files, HSK 1–6) |
| `prisma/seed-portal.ts` | Portal users (1 admin, 1 teacher, 10 students), classes, schedules, assignments |

Commands:
```bash
npx prisma migrate dev --name <description>   # dev migration
npx prisma migrate deploy                      # production migration
npx prisma generate                            # regenerate client after schema change
npx tsx prisma/seed.ts                         # seed landing content
npx tsx prisma/seed-vocabulary.ts              # seed HSK vocabulary
npx tsx prisma/seed-portal.ts                  # seed portal test data
```

---

## 9. Risks in This Area

| ID | Severity | Summary |
|---|---|---|
| R01 | High | NextAuth v5 beta.30 — pre-release, breaking changes possible on upgrade |
| R02 | High | Google Calendar scope forced on all Google logins including students |
| R03 | Medium | JWT 5-minute refresh window — locked users remain active up to 5 min |
| R04 | Medium | Layer 3 page-level guards not confirmed for all portal modules |
| R05 | Medium | `pg` package: dead dependency |
| R06 | Low | Missing indexes added late — potential early performance debt |
| R21 | Low | Dual role definition files must stay manually in sync |
