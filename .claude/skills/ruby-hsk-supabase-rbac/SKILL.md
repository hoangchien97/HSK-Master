# ruby-hsk-supabase-rbac

## When to use
Auth flow, role guards, Supabase storage or realtime, Prisma schema changes.

## Auth — NextAuth v5

**Config split (important)**
- `auth.config.ts` — Edge-compatible, no Prisma import, used by middleware `authorized()` callback
- `auth.ts` — Node.js only, full providers (Google + Credentials), Prisma calls, Calendar token save

**JWT token shape**
```ts
token.{ id, role, status, username, name, picture, lastRefreshed }
```
Refreshed from DB every 5 min or on `trigger === "update"`.

**Session shape**
```ts
session.user.{ id, role, status, username, name, image }
```

**Google OAuth**
- Requests `calendar.events` scope at login
- Tokens (access + refresh) saved to `GoogleCalendarToken` via `lib/portal/calendar-token.service.ts`
- If `refresh_token` absent, calendar sync unavailable for that user (non-blocking)

**Status check**
- `LOCKED` or `INACTIVE` → sign-in blocked at both OAuth and Credentials providers
- Check at page-level too: `status !== STATUS.ACTIVE` → redirect to login

## RBAC — Three layers

| Layer | File | What it checks |
|---|---|---|
| Edge middleware | `auth.config.ts` `authorized()` | Is user logged in? |
| Server layout | `[role]/layout.tsx` | Session valid? Status ACTIVE? URL role matches JWT role? |
| Page guard | Each sensitive `page.tsx` | Role === required role for this specific module |

**Adding a page-level guard (required for admin-only pages)**
```ts
const session = await auth()
if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
  redirect("/portal")
}
```

**Role mapping**
```ts
// lib/utils/auth.ts
roleToRoute("SYSTEM_ADMIN") // → "admin"
routeToRole("teacher")       // → "TEACHER"
isRouteAllowedForRole(urlRole, userRole) // boolean
```
Never hardcode `"admin"` / `"teacher"` / `"student"` strings — always use these helpers.

**Dual role definition — keep in sync**
- `constants/portal/roles.ts` — plain `const` objects (used at runtime)
- `enums/portal/role.ts` — TypeScript `enum UserRole` (used for types)

## Supabase — narrow usage only

**Realtime (notifications)**
- `lib/supabase-client.ts` — browser singleton, created once per page load
- Used only for `channel.on(...)` subscriptions
- Never call Prisma from here

**Storage (file uploads)**
- `lib/supabase-storage.ts` — server-side REST fetch, never imported client-side
- Env: `SUPABASE_SERVICE_ROLE_KEY` server-only, `NEXT_PUBLIC_SUPABASE_ANON_KEY` browser-safe
- Buckets: `avatars`, `assignments`, `submissions`
- Always validate: `ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE` (10 MB) before calling upload

**Prisma (all other DB access)**
- Singleton: `lib/prisma.ts`
- Every model, relation, and index is in `prisma/schema.prisma` — check there before writing queries
- Never use `supabase-js` for CRUD — Prisma only
