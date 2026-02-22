# PROJECT_RULES (HSK-MASTER)

> Single source of truth for architecture + coding conventions.
> All contributors (human + AI) MUST follow this document.

## 1) Tech stack (do not change without approval)
- Next.js (App Router)
- TypeScript (strict)
- Auth: NextAuth (v5 / Auth.js)
- DB: Prisma
- UI: HeroUI + Tailwind
- Validation: HeroUI form validation pattern (no react-hook-form)
- Toast: react-toastify
- Icons: lucide-react
- Dates: dayjs

## 2) Repository structure (authoritative)

### 2.1 Routing
- Use **App Router** under `app/`.
- Prefer **Server Components** by default.
- Add `"use client"` only for interactive UI (forms, dropdowns, calendar dnd, etc).

### 2.2 UI components
- `components/landing/*`: Landing pages UI
- `components/portal/*`: Portal UI (role-based routes)
  - Domain folders: `assignments/`, `attendance/`, `calendar/`, `classes/`, `practice/`, `schedules/`, `students/`, ...
  - Portal shell/layout pieces: `PortalHeader.tsx`, `PortalSidebar.tsx`, `PortalBreadcrumb.tsx`, `PortalContent.tsx`, `NotificationDropdown.tsx`
- `components/portal/shared/*`: Shared UI within portal (EmptyState, ConfirmDialog, Table wrappers, etc)
- `components/shared/*`: Shared UI across the whole app

### 2.3 Business logic layers
- `actions/*`: **Server Actions** (preferred for create/update flows when possible)
- `app/api/*`: **Route handlers** (use when needed: webhooks, external access, non-form uploads, etc)
- `services/*`: Service wrappers (fetch clients, storage helpers). Must be environment-safe.
- `hooks/*`: UI hooks (client-only unless explicitly safe)
- `providers/*`: React providers (theme, session, etc)

### 2.4 Contracts & types
- `interfaces/*`: API contracts (request/response), pagination contracts
- `types/*`: type utilities (DTO maps, UI states)
- `enums/*`: enums shared across app (Role, Attendance, HSK…)
- `constants/*`: routes, pagination, calendar configs, etc
- `lib/validators/*`: Zod schemas for server-side validation (authoritative validation definitions)

### 2.5 Database
- `prisma/*`: Prisma schema + migrations
- Prisma Client usage: **server-only** (Server Components, Route Handlers, Server Actions)

## 3) Hard rules: server vs client (security + correctness)

### 3.1 Never on the client
- Prisma client
- Service role keys / secret env vars
- Any privileged DB mutations not protected by server-side auth checks

### 3.2 Allowed on the client
- UI interactions (preview image, forms, toast)
- Calling server actions / calling `app/api/*` routes

### 3.3 Data flow patterns
- Preferred: **Client UI** → **Server Action** → DB → return typed result
- Alternative: Client → `app/api/*` → server logic (same validation + auth)

## 4) Auth / roles (portal is role-gated)

### 4.1 Single source of truth
- Role values must come from `enums/role.ts` (no raw strings sprinkled around).

### 4.2 Guarding rules
- Any portal feature must enforce:
  - authenticated session (server-side)
  - role-based access (server-side)
- UI may hide controls by role, but **never rely on UI only**.

### 4.3 Helpers
- Maintain helpers like:
  - `getSessionOrThrow()`
  - `assertRole(session, allowedRoles)`
  - `hasRole(session, role)`

## 5) Forms & Validation Pattern (HeroUI-based)

### 5.1 Structure
- Use HeroUI form components for validation & UI state handling.
- Client-side validation via HeroUI rules / custom logic.
- Server-side validation via Zod in `lib/validators/*` (authoritative).
- Toasts: success/error with meaningful message.
- Disabled submit while loading.
- Show field-level errors from server when applicable.

### 5.2 Standard error mapping
- Server returns error format:
  - `{ message: string, code: string, details?: unknown }`
- Client maps to toast + field errors.

## 6) API / Server Actions (mandatory pattern)

### 6.1 Validation
- Validate all inputs at the server boundary using Zod.
- Never trust client-provided values.

### 6.2 Responses
- Use typed responses:
  - success: `{ ok: true, data: ... }`
  - failure: `{ ok: false, error: { message, code, details? } }`

### 6.3 Logging
- Log server errors with enough context (request id if available), but do not log secrets.

## 7) UI/UX baseline
- Always handle states: loading / empty / error / success
- Avoid layout shifts and hydration issues
- Prefer server-rendered lists and use client components for interactive controls only
- Use dayjs for formatting dates consistently

## 8) Styling rules
- Use Tailwind utilities
- Use HeroUI styles/components wherever possible
- Do not introduce extra styling libraries

## 9) Git hygiene (minimum)
- No committed secrets
- Add new env vars to `.env.example`
- Update docs when adding new conventions
