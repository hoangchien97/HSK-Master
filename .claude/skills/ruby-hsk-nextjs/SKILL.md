# ruby-hsk-nextjs

## When to use
Adding or modifying routes, layouts, Server Actions, API routes, or data-fetching patterns.

## App Router conventions

**Route groups**
- `(landing)` — public marketing, no auth
- `(portal)` — authenticated, all roles
- `(portal-auth)` — login / register / error / unauthorized
- Never rename or collapse route groups.

**Dynamic role segment**
- Path: `app/(portal)/portal/[role]/`
- Valid values: `admin`, `teacher`, `student`
- `[role]/layout.tsx` is the server-side auth guard — do not remove or weaken it.

**Adding a new portal page**
1. Create `app/(portal)/portal/[role]/<module>/page.tsx`
2. Add a page-level role guard (`session.user.role === USER_ROLE.X` → redirect)
3. Add nav item in `constants/portal/navigation.ts` with correct `roles: [USER_ROLE.X]`
4. Add a `services/portal/<module>.service.ts` for data fetching
5. Add a `actions/<module>.actions.ts` for mutations

**Server vs Client components**
- Default: Server Component
- Add `"use client"` only for: browser APIs, React hooks, event handlers, HeroUI interactive components
- Never fetch data in Client Components — pass serialized props from Server Component

**Data fetching pattern**
```ts
// Server Component — parallel fetch
const [a, b] = await Promise.all([serviceA(id), serviceB(id)])
// Serialize before passing to client
return <ClientComp data={serializeDates(a)} />
```
`serializeDates` is in `utils/serialize.ts` — always use before passing Date objects as props.

**Server Actions**
- File: `actions/<domain>.actions.ts`
- Keep thin: validate input with Zod, call service, return result
- Always re-verify session inside the action — never trust client-passed role or id

**API routes**
- Use for: NextAuth callbacks (`app/api/auth/[...nextauth]`), webhook receivers, Google Calendar endpoints
- Prefer Server Actions for all portal mutations
- All portal API routes live under `app/api/portal/`

**Schema changes**
1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev --name <description>`
3. `npx prisma generate`
4. Update affected services and types
