# ruby-hsk-qa-review

## When to use
Code review, pre-PR checklist, auditing new features, security review, accessibility review, catching regressions before merge.

---

## RBAC checklist (R04)

Every portal page that handles sensitive data must have a Layer 3 guard. Verify:

- [ ] Page calls `const session = await auth()` at the top
- [ ] Checks `!session?.user` → redirect
- [ ] Checks role is the correct role(s) for this page
- [ ] API routes check session + role before any DB operation
- [ ] Server Actions check session + role inside the action (not just at the page level)

**Never trust role from client-passed params.** Always read `session.user.role` from `auth()`.

---

## Form validation checklist (R10)

- [ ] Server Action has Zod schema wrapping all input (not just the happy path)
- [ ] Zod errors are caught and returned to UI (not silently thrown)
- [ ] Required fields enforce `min(1)` on strings — Zod's `z.string()` allows empty strings by default
- [ ] File uploads: MIME type + size validated server-side (not just in FileUploadZone)
- [ ] Form state reset after successful submit

**Known gap:** Most portal forms lack client-side validation feedback. New forms should surface Zod errors inline.

---

## Supabase boundary checklist

Every code change that touches Supabase must pass:

- [ ] No `supabase.auth.*` calls — NextAuth is the only auth layer
- [ ] No Supabase JS for DB queries — Prisma only
- [ ] `lib/supabase-storage.ts` only imported in server-side files (API routes, Server Actions)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in server-side environment access
- [ ] No direct browser fetch to Supabase Storage — must go through `/api/portal/upload/`
- [ ] `getSupabaseBrowserClient()` only in client components for Realtime

---

## Tailwind content array (R11)

Before shipping new UI changes to production:

- [ ] Check that all className strings used in new files are covered by `tailwind.config.js` content array
- [ ] If new files are outside HeroUI paths, verify classes are not being purged
- [ ] Test production build locally: `npm run build` + `npm run start` and visually inspect new UI

---

## Auth security checklist

- [ ] No hardcoded role strings (`"admin"`, `"teacher"`, `"student"`) — use `USER_ROLE.*` constants
- [ ] No `session.user.*` from the client in Server Actions — always call `auth()` fresh
- [ ] JWT refresh window: locked user can stay active up to 5 min (R03) — acceptable for current risk level, but note for ops
- [ ] Google OAuth `calendar.events` scope requested for all users (R02) — do not widen the scope further

---

## Performance checklist

- [ ] Server Components fetch data with `Promise.all()` — no sequential awaits
- [ ] No client-side fetching on portal pages (data fetched server-side, passed as props)
- [ ] `dynamic(() => import(...), { ssr: false })` for browser-only modules (canvas, Web Speech)
- [ ] `optimizePackageImports` covers new large libraries — check `next.config.ts`
- [ ] No N+1 queries — use `include: { relation: true }` or `Promise.all` for related data

---

## Accessibility checklist

- [ ] Chinese characters have `lang="zh"` on the containing element
- [ ] Interactive elements have visible focus styles (HeroUI provides these, custom elements may not)
- [ ] Color: `#ec131e` on white — AA for large text only. Not for body text or small labels.
- [ ] New animated components: add `prefers-reduced-motion` guard (R13 — currently missing globally)
- [ ] Form labels associated with inputs (`htmlFor` / `aria-label`)
- [ ] Images have meaningful `alt` text (not just filenames or empty)

---

## Server/Client component boundary checklist

- [ ] No `Date` objects passed as props to Client Components — use `serializeDates()` first
- [ ] No HeroUI components in Server Components without `"use client"` on the wrapping client component
- [ ] `"use server"` at top of Server Action files — not individual function-level (causes confusion)
- [ ] No `window`/`navigator`/`document` in files without `"use client"`

---

## Dependency hygiene

Before adding a new npm package:

- [ ] Check if HeroUI already provides the UI component needed
- [ ] Check if Radix UI (already installed) provides the primitive needed
- [ ] Check if a CSS keyframe animation in `globals.css` suffices
- [ ] Confirm the package is not already installed (check `package.json`)

Dead dependencies to avoid using: `pg`, `next-intl` (not wired), `react-hook-form` (not deployed).

---

## Pre-PR checklist (combined)

Run before every pull request:

### Code
- [ ] TypeScript: `npm run type-check` passes (or `tsc --noEmit`)
- [ ] No `console.log` statements (`removeConsole` is on in prod, but keep local clean)
- [ ] No hardcoded hex colors or role strings

### Auth/RBAC
- [ ] Every new portal page has Layer 3 guard
- [ ] Every new Server Action re-verifies session

### Database
- [ ] New Prisma schema changes have a migration file (`prisma/migrations/`)
- [ ] `prisma generate` run after schema changes
- [ ] No raw SQL (`$queryRaw` / `$executeRaw`) added

### UI
- [ ] New portal UI uses HeroUI, not landing custom components
- [ ] New landing UI uses `components/landing/common/`, not HeroUI
- [ ] New module page has `loading.tsx`

### Supabase
- [ ] Supabase boundary not violated (see checklist above)

---

## Risk register — active risks

| ID | Severity | Risk | Mitigation |
|---|---|---|---|
| R01 | High | NextAuth v5 beta | Pin version, test before upgrade |
| R02 | High | `calendar.events` scope for all users | Restrict to teacher role only (future) |
| R03 | Medium | 5-min JWT stale window for locked users | Acceptable, document in ops runbook |
| R04 | Medium | Page-level RBAC guards not verified on all pages | Audit each module page |
| R07 | Medium | Two Supabase project URLs in next.config.ts | Identify and remove the stale one |
| R08 | Low | Storage silently degrades with bad service key | Monitor upload API errors |
| R09 | Low | Public document bucket for student submissions | Add signed URLs or RLS |
| R10 | Medium | No client-side form validation | Add Zod error surfacing to forms |
| R11 | High | Tailwind content array missing app/** paths | Fix tailwind.config.js before production |
| R13 | Low | No prefers-reduced-motion support | Add to new animated components |
| R14 | Low | Dark mode not switchable | Placeholder only — do not build dark UI |
| R15 | Low | No per-module loading.tsx | Add to every new module page |
| R17 | High | No error.tsx on portal modules | Add to every new module page |
