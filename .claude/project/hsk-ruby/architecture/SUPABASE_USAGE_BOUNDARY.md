# Ruby HSK — Supabase Usage Boundary

**Date:** 2026-06-19 | **Status:** All compliant, zero violations found

---

## 1. What Supabase Does in This Project (3 roles only)

| Role | Technology | How |
|---|---|---|
| **PostgreSQL hosting** | Supabase-hosted Postgres | Prisma connects via `DATABASE_URL` (pooler) and `DIRECT_URL` (direct) |
| **File storage** | Supabase Storage | Server-side REST fetch calls in `lib/supabase-storage.ts` |
| **Realtime notifications** | Supabase JS SDK | Browser-side singleton in `lib/supabase-client.ts` |

**Supabase Auth: NOT USED.** Authentication is entirely handled by NextAuth v5.

---

## 2. Allowed Usage

| Usage | File | Environment | Env vars used |
|---|---|---|---|
| PostgreSQL hosting | `DATABASE_URL` → Prisma | Server | `DATABASE_URL`, `DIRECT_URL` |
| Storage upload | `lib/supabase-storage.ts` | Server-only | `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` |
| Storage bucket setup | `scripts/setup-storage.ts` | Script (server) | `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` |
| Storage via API routes | `app/api/portal/upload/avatar/route.ts` | Server | Calls `lib/supabase-storage.ts` |
| Storage via API routes | `app/api/portal/upload/file/route.ts` | Server | Calls `lib/supabase-storage.ts` |
| Realtime subscriptions | `lib/supabase-client.ts` | Browser-only | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Realtime consumer | `providers/notification-provider.tsx` | Browser-only | Calls `getSupabaseBrowserClient()` |

---

## 3. Disallowed Usage (confirmed NOT present)

| Violation type | Status |
|---|---|
| `supabase.auth.*` calls | ✅ NOT FOUND |
| `supabase.auth.signInWithPassword()` | ✅ NOT FOUND |
| `supabase.auth.signUp()` | ✅ NOT FOUND |
| Supabase JS for database queries | ✅ NOT FOUND |
| `@supabase/supabase-js` import outside `lib/supabase-client.ts` and `lib/supabase-storage.ts` | ✅ NOT FOUND |
| `SUPABASE_SERVICE_ROLE_KEY` referenced in client components | ✅ NOT FOUND |
| Direct client-side storage uploads | ✅ NOT FOUND |
| Supabase Storage SDK (using `supabase.storage.*`) | ✅ NOT FOUND — REST fetch only |

---

## 4. Violation Scan Results (2026-06-19)

```
grep: supabase.auth        → 0 matches
grep: signInWithPassword   → 0 matches
grep: signUp (supabase)    → 0 matches
grep: SUPABASE_SERVICE_ROLE_KEY in client code → 0 matches
grep: @supabase/supabase-js imports outside lib/ → 0 matches
grep: supabase.storage.*   → 0 matches
```

All clean. Re-run this scan when adding new features that touch auth, storage, or database.

---

## 5. Security Risks

### R07 — Two Supabase project URLs (Medium)

`next.config.ts` `images.remotePatterns` whitelist contains two Supabase hostnames:
- `ukbeoggejnqgdxqoqkvj.supabase.co`
- `alfbzgjpjvrcfaxxvijl.supabase.co`

This suggests either two environments (staging/prod) or a project migration. **Verify which is active production.** Remove the unused domain from `next.config.ts`.

### R08 — Silent service role key fallback (Low)

`lib/supabase-storage.ts` `getSupabaseConfig()`:
```ts
const isValidJwt = serviceRoleKey && serviceRoleKey.split(".").length === 3
const supabaseKey = isValidJwt ? serviceRoleKey : anonKey  // ← silent fallback
```

If `SUPABASE_SERVICE_ROLE_KEY` is misconfigured or missing in staging/CI, uploads silently fall back to anon-key permissions. This could cause permission errors that aren't immediately obvious.

**Fix:** Add an explicit warning/error log when falling back to anon key.

### R09 — Public storage buckets (Low)

Both buckets (`avatars`, `documents`) are created with `public: true` in `scripts/setup-storage.ts`. Any file URL is publicly accessible without authentication.

- `avatars` — Acceptable for profile photos
- `documents` — Potentially an issue for assignment submissions containing sensitive student work

**Fix:** Enable RLS on the `documents` bucket, or switch from public URLs to signed URLs for document access.

---

## 6. Notification Architecture

```
Server side (write):
  Server Action / Service
    → prisma.portalNotification.create({ userId, title, message, type })
    → Record saved to portal_notifications table in Supabase PostgreSQL

Client side (read):
  providers/notification-provider.tsx
    → getSupabaseBrowserClient()
    → channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'portal_notifications',
        filter: `userId=eq.${currentUserId}`
      }, handler)
    → INSERT → prepend to state, unread count++
    → UPDATE (mark read) → update state, recalculate count

UI:
  components/portal/NotificationDropdown.tsx
    → Reads from notification-provider context
    → Calls markNotificationReadAction() / markAllNotificationsReadAction()
    → Server Actions → prisma.portalNotification.update()
```

RLS on `portal_notifications` ensures users only receive their own notifications via Realtime filter.

---

## 7. Upload Architecture

```
Client:
  components/portal/common/FileUploadZone.tsx
    → POST /api/portal/upload/file?folder=assignments|submissions
    → (or POST /api/portal/upload/avatar for profile photos)

API Route (server):
  app/api/portal/upload/file/route.ts
    1. auth() → verify session
    2. Validate MIME type against ALLOWED_FILE_TYPES
    3. Validate file size ≤ MAX_FILE_SIZE (10MB)
    4. generateFilePath(folder, userId, fileName)
    5. uploadToSupabaseStorage(file, path, "documents")
    6. Return { name, url, path, size, type }[]

lib/supabase-storage.ts:
    → getSupabaseConfig() → SUPABASE_SERVICE_ROLE_KEY (or anon fallback)
    → ensureBucket(bucket) → check/create
    → POST {supabaseUrl}/storage/v1/object/{bucket}/{path}
    → Returns public URL: {supabaseUrl}/storage/v1/object/public/{bucket}/{path}
```

File deletion:
```
DELETE endpoint checks path.includes(session.user.id) — prevents cross-user deletion
→ deleteFromSupabaseStorage(path, "documents")
```

---

## 8. Environment Variables

### Server-only (never expose to client)

| Variable | Used in |
|---|---|
| `DATABASE_URL` | Prisma all queries |
| `DIRECT_URL` | Prisma migrations |
| `AUTH_SECRET` | NextAuth JWT signing |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase-storage.ts`, upload API routes, `scripts/setup-storage.ts` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth provider |
| `CALENDAR_TOKEN_SECRET` | AES-256-GCM encryption for calendar tokens |
| `AI_API_KEY` | DeepSeek/OpenAI chat service |

### Client-safe (NEXT_PUBLIC_ prefix)

| Variable | Used in |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase-client.ts`, `lib/supabase-storage.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase-client.ts` |
| `GOOGLE_CLIENT_ID` | Google OAuth provider |
| `AI_BASE_URL` | Optional AI endpoint override |
| `AI_MODEL` | Optional AI model override |
| `NEXTAUTH_URL` | Calendar OAuth callback |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | SEO meta tag |

---

## 9. Future Feature Checklist

When building any new feature, verify before shipping:

**Database access:**
- [ ] Query goes through `lib/prisma.ts` only
- [ ] No `supabase.from()` or Supabase JS client for data queries
- [ ] No `$queryRaw` with string interpolation

**Auth:**
- [ ] No `supabase.auth.*` calls
- [ ] Auth check uses `auth()` from NextAuth
- [ ] Role check present in server action and/or API route

**Storage:**
- [ ] New uploads go through `/api/portal/upload/` API route
- [ ] `lib/supabase-storage.ts` not imported in client components
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not referenced in any client-side code

**Realtime:**
- [ ] New Realtime subscriptions use `getSupabaseBrowserClient()` from `lib/supabase-client.ts`
- [ ] Supabase JS client not imported in Server Components or Server Actions

---

## 10. Verification Commands

Run these to confirm no boundary violations in new code:

```bash
# Check for Supabase auth usage
grep -r "supabase.auth\|signInWithPassword\|supabase.signUp" app/ components/ actions/ services/ --include="*.ts" --include="*.tsx"

# Check for Supabase JS outside lib/
grep -r "@supabase/supabase-js" app/ components/ actions/ services/ providers/ --include="*.ts" --include="*.tsx"

# Check for service role key in client code
grep -r "SUPABASE_SERVICE_ROLE_KEY" components/ app/ --include="*.tsx" --include="*.ts"

# Check for direct Supabase DB queries
grep -r "supabase\.from\|supabase\.rpc" . --include="*.ts" --include="*.tsx"
```

All grep results should return **0 matches**.
