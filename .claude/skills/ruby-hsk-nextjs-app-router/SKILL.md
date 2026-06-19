# ruby-hsk-nextjs-app-router

## When to use
Adding or modifying routes, layouts, Server Actions, API routes, data fetching patterns, or understanding the routing structure.

---

## Route groups

| Group | Path | Auth |
|---|---|---|
| `(landing)` | `/`, `/about`, `/courses`, `/contact`, `/privacy`, `/terms`, `/system-design` | None |
| `(portal)` | `/portal/**` | Required |
| `(portal-auth)` | `/portal/login`, `/portal/register`, `/portal/error`, `/portal/unauthorized` | None |

**Never rename route groups** — they affect layout nesting and auth scope.

---

## Dynamic role segment

`app/(portal)/portal/[role]/` — valid values: `admin`, `teacher`, `student`

- `[role]/layout.tsx` is the server-side RBAC guard (5 checks) — do not remove or weaken
- Always use `routeToRole()` and `roleToRoute()` from `lib/utils/auth.ts` — never hardcode strings

---

## No middleware.ts

There is no `middleware.ts` at the project root. Auth protection runs via `auth.config.ts` `authorized()` callback (Edge-compatible, no Prisma). Do not add a conflicting `middleware.ts` without understanding the interaction.

---

## Layout layering (4 levels)

```
app/layout.tsx              Root — fonts, global metadata, top-level providers
app/(portal)/layout.tsx     Auth check, SessionProvider, HeroUIProvider, ToastContainer
app/(portal)/PortalLayoutClient.tsx  Sidebar + Header + AIChatbot (client)
app/(portal)/portal/[role]/layout.tsx  Role validation (5 guards)
```

Each layout adds exactly one concern. Do not add cross-cutting logic to the wrong level.

---

## Server vs Client components

**Default: Server Component** — no `"use client"` directive.

Add `"use client"` only when the component needs:
- Browser APIs (Web Speech, canvas, `window`, `navigator`)
- React hooks (`useState`, `useEffect`, `useRouter`, etc.)
- Event handlers (`onClick`, `onChange`)
- HeroUI interactive components (they require client)

**Never fetch data inside a Client Component** — fetch in the Server Component parent and pass as props.

---

## Data fetching pattern

```ts
// Server Component — parallel fetch
const [stats, classes, assignments] = await Promise.all([
  getStudentStats(userId),
  getUpcomingClasses(userId, 3),
  getPendingAssignments(userId, 3),
])

// Serialize Date objects before passing to client
return <StudentDashboard stats={stats} classes={serializeDates(classes)} />
```

`serializeDates()` is in `utils/serialize.ts` — always use before passing Date objects as props to Client Components.

---

## Dynamic imports for browser-only modules

```ts
const FlashcardTab = dynamic(() => import('./FlashcardTab'), { ssr: false })
const WriteTab = dynamic(() => import('./WriteTab'), { ssr: false })
```

Use `ssr: false` for: Web Speech API, `hanzi-writer` (canvas), any `window`/`navigator` usage at module level.

---

## Server Actions vs API routes

**Current codebase has inconsistency** — some mutations use Server Actions, some use API routes.

| Use | Preferred |
|---|---|
| Portal mutations (CRUD) | **Server Actions** (`actions/*.actions.ts`) |
| OAuth callbacks (Google Calendar) | API routes |
| Webhook receivers | API routes |
| File uploads (auth + validation complexity) | API routes |
| External integrations | API routes |

Server Actions always re-verify session inside the action — never trust client-passed user id or role.

---

## Adding a new portal module

1. `app/(portal)/portal/[role]/<module>/page.tsx` — async Server Component, fetch data, add page-level role guard
2. `services/portal/<module>.service.ts` — Prisma read queries
3. `actions/<module>.actions.ts` — mutations (Zod validation + service call + revalidatePath)
4. `components/portal/<module>/` — UI components using HeroUI
5. `constants/portal/navigation.ts` — add `NavItem` with correct `roles: [USER_ROLE.X]`

---

## Loading gaps (R15)

`loading.tsx` exists only at route group level (`(landing)`, `(portal)`, `(portal-auth)`). Individual module pages have no loading skeleton. Add a `loading.tsx` to every new module page you create.

---

## revalidatePath after mutations

```ts
import { revalidatePath } from "next/cache"
// After create/update/delete in a Server Action:
revalidatePath("/portal/admin/courses")
```

---

## next.config.ts notes

- `optimizePackageImports`: framer-motion, recharts, @heroui/react, lucide-react, etc. — tree-shaking optimization
- `remotePatterns`: two Supabase URLs (`ukbeoggejnqgdxqoqkvj` + `alfbzgjpjvrcfaxxvijl`) — verify which is active
- `compiler.removeConsole: true` in production
- `dangerouslyAllowSVG: true` with sandbox CSP — do not serve user-uploaded SVGs through `next/image`
