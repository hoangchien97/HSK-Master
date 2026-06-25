# PROJECT_RULES (HSK-MASTER)

> Single source of truth for architecture + coding conventions.
> All contributors (human + AI) MUST follow this document.
>
> **Note:** This doc was migrated from `docs/PROJECT_RULES.md`. Section 5 (Forms) reflects the *original* HeroUI pattern; the current standard is **React Hook Form + Zod** (see CLAUDE.md).

---

## 1) Tech stack (do not change without approval)

- Next.js 16 (App Router)
- TypeScript (strict)
- Auth: NextAuth v5 beta.30 — JWT, Google OAuth + Credentials
- DB: Prisma 5 → PostgreSQL on Supabase
- UI: HeroUI v2 + Tailwind v4
- Forms: **React Hook Form + Zod** (new forms must use this; existing manual-useState forms: do not refactor without approval)
- Toast: react-toastify
- Icons: lucide-react
- Dates: dayjs

---

## 2) Repository structure (authoritative)

### 2.1 Routing

- Use **App Router** under `app/`.
- Prefer **Server Components** by default.
- Add `"use client"` only for interactive UI (forms, dropdowns, calendar dnd, etc).

### 2.2 UI components

- `components/landing/*`: Landing pages UI (custom primitives, NOT HeroUI)
- `components/portal/*`: Portal UI (role-based routes)
  - Domain folders: `assignments/`, `attendance/`, `calendar/`, `classes/`, `practice/`, `schedules/`, `students/`, ...
  - Portal shell/layout pieces: `PortalHeader.tsx`, `PortalSidebar.tsx`, `PortalBreadcrumb.tsx`, `PortalContent.tsx`, `NotificationDropdown.tsx`
- `components/portal/common/*`: Shared UI within portal (EmptyState, ConfirmDialog, CTable, CModal, etc.)
- `components/ui/*`: Base primitives (25 components — shadcn implementations, Ruby HSK token overrides)

### 2.3 Business logic layers

- `actions/*`: **Server Actions** (preferred for create/update flows)
- `app/api/*`: **Route handlers** (webhooks, external access, non-form uploads)
- `services/portal/*`: Business logic called by Server Actions → Prisma
- `hooks/*`: UI hooks (client-only)
- `providers/*`: React providers

### 2.4 Contracts & types

- `interfaces/*`: API contracts (request/response), pagination
- `enums/*`: enums shared across app (UserRole, UserStatus, etc.)
- `constants/*`: routes, pagination, navigation
- `lib/prisma.ts`: Prisma singleton — ONLY DB access point

### 2.5 Database

- `prisma/schema.prisma`: Source of truth — 814 lines, 60+ models
- Prisma Client: **server-only** (Server Components, Route Handlers, Server Actions)

---

## 3) Hard rules: server vs client (security + correctness)

### 3.1 Never on the client

- Prisma client
- `SUPABASE_SERVICE_ROLE_KEY` or any secret env vars
- Any privileged DB mutations not protected by server-side auth checks

### 3.2 Allowed on the client

- UI interactions (preview image, forms, toast)
- Calling server actions / calling `app/api/*` routes
- Supabase JS (browser Realtime subscriptions ONLY — never `supabase.auth.*`)

### 3.3 Data flow patterns

- **Preferred:** Client UI → Server Action → `services/portal/*.service.ts` → Prisma → return typed result
- **Alternative:** Client → `app/api/*` → server logic (same validation + auth)

---

## 4) Auth / roles (portal is role-gated)

### 4.1 RBAC — 3 Layers (never bypass)

1. **Edge** — `auth.config.ts` `authorized()` → redirect unauthenticated to `/portal/login`
2. **Layout** — `[role]/layout.tsx` → 5 guards: session, valid URL role, status=ACTIVE, role populated, role matches URL
3. **Page** — each sensitive page re-checks `session.user.role === USER_ROLE.X`

### 4.2 Role mapping

Role → URL: `SYSTEM_ADMIN→admin`, `TEACHER→teacher`, `STUDENT→student`
Always use `roleToRoute` / `routeToRole` from `lib/utils/auth.ts` — never hardcode.

### 4.3 Helpers

- `getSessionOrThrow()` — throws if no session
- `assertRole(session, allowedRoles)` — throws if role not in list
- `hasRole(session, role)` — boolean check

---

## 5) Forms & Validation Pattern

### 5.1 Current standard (NEW forms)

- **React Hook Form + Zod** — mandatory for all new forms
- `useForm<z.input<typeof schema>, unknown, z.infer<typeof schema>>` (3-type-param when using coerce/default)
- Zod v4: use `message` option (not `invalid_type_error`)
- Error messages below the field, red text, `text-sm`

### 5.2 Existing forms

- Existing forms use manual `useState` — do NOT refactor without approval
- Known holdouts: LoginForm, RegisterForm, ClassFormModal, ScheduleModal, AssignmentFormModal, landing contact form

### 5.3 Server-side validation

- Validate all inputs at the server boundary using Zod
- Never trust client-provided values

### 5.4 Responses

- Success: `{ success: true, data: ... }`
- Failure: `{ success: false, error: string }`

---

## 6) API / Server Actions (mandatory pattern)

### 6.1 Validation

- Validate all inputs at the server boundary using Zod.
- Never trust client-provided values.

### 6.2 Logging

- Log server errors with enough context; do not log secrets.
- Do not swallow errors silently.

---

## 7) UI/UX baseline

- Always handle states: loading / empty / error / success
- Avoid layout shifts and hydration issues
- Prefer server-rendered lists; use client components for interactive controls only
- Use dayjs for formatting dates consistently

---

## 8) Styling rules

- Use Tailwind utilities + design tokens (`--color-*`, `--font-*`)
- Use HeroUI components in portal; custom primitives (`components/landing/common/`) in landing
- Do not introduce extra styling libraries
- `@radix-ui` packages are intentional (shadcn foundation for `components/ui/`)

---

## 9) Performance checklist

- Default to Server Components; only add `"use client"` for interactivity
- Use `unstable_cache` for landing data that changes < once/hour
- Use `revalidateTag`/`revalidatePath` in server actions after mutations
- Avoid N+1: use `Promise.all` for independent queries; use `select` over `include` when partial
- Use `next/dynamic` with `{ ssr: false }` for heavy libs (recharts, react-big-calendar, hanzi-writer)
- Every route group MUST have `error.tsx` and `loading.tsx`
- Add `@@index` for every FK column used in `where` clauses

---

## 10) Git hygiene

- No committed secrets
- Add new env vars to `.env.example`
- Update docs when adding new conventions
