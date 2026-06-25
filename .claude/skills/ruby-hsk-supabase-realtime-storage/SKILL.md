# ruby-hsk-supabase-realtime-storage

## When to use
In-app notifications, file uploads, Supabase boundary questions, adding new realtime or storage features.

---

## Allowed Supabase usage — exactly 3 things

| Use | How | File |
|---|---|---|
| PostgreSQL hosting | Via `DATABASE_URL` → Prisma | `lib/prisma.ts` |
| Storage (server-side) | REST fetch, no SDK | `lib/supabase-storage.ts` |
| Realtime (browser-only) | `createClient` + channel subscriptions | `lib/supabase-client.ts` |

**Everything else is disallowed.** See checklist below.

---

## Disallowed — never add these

- `supabase.auth.*` — Supabase Auth is NOT used. NextAuth is the only auth layer.
- Supabase JS for DB queries — use Prisma
- `lib/supabase-storage.ts` imported in client components
- `SUPABASE_SERVICE_ROLE_KEY` in any client-side code
- Direct browser calls to Supabase Storage (must go through API route)
- Supabase Storage SDK (`@supabase/storage-js` or SDK `storage` methods) — use REST fetch

---

## Notification architecture (Realtime)

```
Server Action creates notification:
  prisma.portalNotification.create({ data: { userId, title, message } })

Supabase PostgreSQL → Realtime change event → browser subscription

providers/notification-provider.tsx:
  getSupabaseBrowserClient()
  channel.on('postgres_changes', { event: 'INSERT', table: 'portal_notifications',
    filter: `userId=eq.${currentUserId}` }, handler)

→ React state updated → NotificationDropdown re-renders
```

Key files:
- `providers/notification-provider.tsx` — Realtime setup, state management, mark-read
- `actions/notification.actions.ts` — fetchNotifications, markRead, markAllRead (use Prisma)
- `services/portal/notification.service.ts` — Prisma queries

---

## Storage architecture (uploads)

```
Client component → POST /api/portal/upload/avatar (or /file)
  → auth() session check
  → MIME type + size validation (ALLOWED_FILE_TYPES, MAX_FILE_SIZE=10MB)
  → lib/supabase-storage.ts → REST fetch to Supabase Storage
  → returns public URL
```

Key files:
- `lib/supabase-storage.ts` — `uploadToSupabaseStorage`, `deleteFromSupabaseStorage`, `generateAvatarPath`, `generateFilePath`
- `app/api/portal/upload/avatar/route.ts` — avatar upload
- `app/api/portal/upload/file/route.ts` — assignment/submission attachments
- `components/portal/common/FileUploadZone.tsx` — drag-drop client component

Buckets: `avatars` (public), `documents` (public)

---

## Environment variables

| Variable | Side | Used in |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client-safe | `lib/supabase-client.ts`, `lib/supabase-storage.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-safe | `lib/supabase-client.ts`, storage fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | `lib/supabase-storage.ts`, upload API routes, `scripts/setup-storage.ts` |

---

## Known risks

| ID | Severity | Description |
|---|---|---|
| R07 | Medium | Two Supabase URLs in `next.config.ts`: `ukbeoggejnqgdxqoqkvj.supabase.co` AND `alfbzgjpjvrcfaxxvijl.supabase.co` — verify which is active production project |
| R08 | Low | `getSupabaseConfig()` falls back to anon key if service role key is missing or invalid JWT — uploads silently degrade in misconfigured environments |
| R09 | Low | `avatars` and `documents` buckets are `public: true` — assignment submissions are publicly accessible by URL. Consider RLS policies or signed URLs for sensitive student files. |

---

## Future feature checklist

When adding a new feature that touches Supabase:

- [ ] New DB data → use Prisma, not Supabase JS
- [ ] New file upload → route through `/api/portal/upload/` pattern, validate auth + MIME + size
- [ ] New realtime event → use `getSupabaseBrowserClient()` in a browser component only
- [ ] Service role key only in server-side files (API routes, Server Actions, scripts)
- [ ] No Supabase JS imports in components under `components/` unless it's in a client-side notification context
