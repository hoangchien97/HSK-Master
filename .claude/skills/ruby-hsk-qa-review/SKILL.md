# ruby-hsk-qa-review

## When to use
Pre-commit review, security audit of a change, or generating a manual test checklist.

## Security checklist

- [ ] No secret env vars (`SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `DATABASE_URL`) referenced in client components or passed as props
- [ ] Server Action re-verifies session and role — does not trust client-provided user id or role
- [ ] File upload validates `ALLOWED_FILE_TYPES` and `MAX_FILE_SIZE` (10 MB)
- [ ] No new `dangerouslySetInnerHTML` outside `app/layout.tsx` JSON-LD injection
- [ ] No unauthenticated mutations via API routes
- [ ] Prisma queries use parameterized inputs (Prisma handles this — avoid raw `$queryRaw` with string interpolation)

## Performance checklist

- [ ] Server Components fetch data in parallel (`Promise.all`)
- [ ] `next/image` used for all images — no raw `<img>` tags
- [ ] Heavy client-side libraries (recharts, hanzi-writer, embla) imported only in the component that renders them
- [ ] New Prisma queries on non-PK fields have a corresponding `@@index` in `schema.prisma`

## Accessibility checklist

- [ ] HeroUI ARIA roles not overridden without reason
- [ ] All interactive elements keyboard-reachable
- [ ] Chinese text elements have `lang="zh"` attribute
- [ ] Red (`#ec131e`) used on white only for large text or decorative elements

## RBAC checklist

- [ ] New portal page has a page-level role guard
- [ ] Nav item added with correct `roles: []` filter
- [ ] Tested that wrong-role user is redirected, not just hidden in UI

## Manual test checklist template

When providing a test checklist, use this format:

```
## Manual Test: <feature name>

**Happy path**
- [ ] <step 1>
- [ ] <step 2>

**Edge cases**
- [ ] Logged out user → redirected to /portal/login
- [ ] Wrong role → redirected to correct dashboard
- [ ] <feature-specific edge case>

**Regression**
- [ ] Existing <related feature> still works
```

## Code review — things to flag

- `any` type without comment
- Hardcoded hex color values (use tokens)
- `"use client"` added to a component that has no browser-only code
- Data fetched inside a Client Component
- Role string hardcoded instead of using `USER_ROLE` constant
- Missing `serializeDates` before passing Date props to client
- `supabase-storage.ts` imported in a client-side module
