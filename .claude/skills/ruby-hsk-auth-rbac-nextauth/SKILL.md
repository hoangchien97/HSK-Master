# ruby-hsk-auth-rbac-nextauth

## When to use
Auth flow, role guards, session shape, login/logout, Google OAuth, Credentials provider, RBAC enforcement.

---

## Confirmed facts
- **NextAuth v5 beta.30** is the only auth layer
- **Supabase Auth is NOT used** — zero `supabase.auth.*` calls anywhere in the codebase
- **No `middleware.ts` file** — protection is via `auth.config.ts` `authorized()` callback only

---

## Auth config split

| File | Runtime | Purpose |
|---|---|---|
| `auth.config.ts` | Edge-compatible | `authorized()` callback, redirect rules, no Prisma |
| `auth.ts` | Node.js only | Full providers, Prisma calls, Google token save |

Never import Prisma in `auth.config.ts` — it breaks Edge runtime.

---

## Auth flow

**Google OAuth:**
```
/portal/login → signIn("google") → Google consent (openid + email + profile + calendar.events)
→ auth.ts signIn(): first login → create PortalUser (STUDENT, ACTIVE, auto-username)
                   existing → check status (LOCKED/INACTIVE → reject)
                   save tokens to Account table + GoogleCalendarToken (AES-256-GCM)
→ jwt(): populate token fields
→ session(): expose session.user fields
→ redirect to /portal → /portal/{role-segment}
```

**Credentials:**
```
signIn("credentials", { email, password })
→ Prisma lookup → bcrypt.compare → status check → jwt/session callbacks
```

---

## JWT token shape
```ts
token.{ id, role, status, username, name, picture, lastRefreshed }
```
Refreshed from DB every 5 minutes or on `trigger === "update"`.

## Session shape
```ts
session.user.{ id, role, status, username, name, email, image }
// Augmented in types/next-auth.d.ts
```

---

## RBAC — 3 layers (never bypass any)

### Layer 1 — Edge (`auth.config.ts`)
```ts
authorized({ auth, request: { nextUrl } }) {
  // Unauthenticated + /portal/* → redirect to /portal/login
  // Authenticated + /portal/login|register → redirect to /portal
  // Exception: /portal/unauthorized always allowed through
}
```

### Layer 2 — Server layout (`[role]/layout.tsx`)
Five sequential guards:
1. `!session?.user` → redirect `/portal/login`
2. URL role not in `VALID_URL_ROLES` → `notFound()`
3. `status !== ACTIVE` → redirect `/portal/login?error=ACCOUNT_LOCKED`
4. `!userRole` → redirect `/portal/login?error=no-role`
5. `!isRouteAllowedForRole(urlRole, userRole)` → redirect to correct role dashboard

### Layer 3 — Page level (required on every sensitive page)
```ts
// Pattern for admin-only page:
const session = await auth()
if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
  redirect("/portal")
}

// Pattern for teacher or admin:
if (session.user.role !== USER_ROLE.TEACHER && session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
  redirect("/portal/student")
}
```

### Layer 3 — API route pattern
```ts
const session = await auth()
if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
if (session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## Role mapping

| DB enum | URL segment | `USER_ROLE` constant |
|---|---|---|
| `SYSTEM_ADMIN` | `admin` | `USER_ROLE.SYSTEM_ADMIN` |
| `TEACHER` | `teacher` | `USER_ROLE.TEACHER` |
| `STUDENT` | `student` | `USER_ROLE.STUDENT` |

**Always use helpers from `lib/utils/auth.ts`:**
```ts
roleToRoute("SYSTEM_ADMIN")          // → "admin"
routeToRole("teacher")               // → "TEACHER"
isRouteAllowedForRole(urlRole, role)  // → boolean
getDashboardPath(role)               // → "/portal/admin"
```
Never hardcode `"admin"`, `"teacher"`, `"student"` strings.

---

## Dual role definition — keep in sync

Both files define the same roles. If adding a role, update **both**:
- `constants/portal/roles.ts` — plain `const` objects (runtime usage)
- `enums/portal/role.ts` — TypeScript `enum UserRole` (type usage)

---

## Known risks

| ID | Severity | Description |
|---|---|---|
| R01 | High | NextAuth v5 beta.30 — pre-release, pin version, test before upgrading |
| R02 | High | `calendar.events` scope requested on ALL Google logins (including students) — reduces OAuth conversion |
| R03 | Medium | 5-min JWT refresh window — locked user stays active up to 5 min after status change |
| R04 | Medium | Page-level guards not confirmed for all portal module pages — audit needed |
