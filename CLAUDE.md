# Ruby HSK — CLAUDE.md

## Overview
Vietnamese Chinese-learning web app for a Hanoi language center.
**Public:** https://ruby-hsk.vercel.app/ | **Portal:** `/portal` | **Roles:** SYSTEM_ADMIN, TEACHER, STUDENT

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, React 19, TypeScript |
| Auth | NextAuth v5 beta.30 — JWT, Google OAuth + Credentials |
| ORM | Prisma 5 → PostgreSQL on Supabase (pooler:6543 / direct:5432) |
| Realtime | Supabase JS — browser-only, notifications only |
| Storage | Supabase Storage — server-side REST fetch only (no SDK) |
| UI | HeroUI v2 (77 files), Tailwind v4, Framer Motion |
| Forms | **manual useState** (react-hook-form installed but NOT deployed) |
| Validation | Zod — only in auth.ts + register API route |
| Icons | Lucide React |
| Export | ExcelJS (attendance export) |
| Calendar | Google Calendar API (teacher schedule sync) |
| AI | DeepSeek chatbot via /api/portal/chat/ |

## Folder Structure
```
app/(landing)/          Public marketing pages
app/(portal)/portal/[role]/  role = admin | teacher | student
app/(portal-auth)/      Login / register / error / unauthorized
app/api/                27 REST endpoints (auth + portal)
actions/                11 Server Actions — mutations only
components/landing/     Landing custom primitives (NOT HeroUI)
components/portal/      Portal UI — HeroUI-based
lib/prisma.ts           Prisma singleton — ONLY DB access point
lib/supabase-client.ts  Browser Realtime singleton
lib/supabase-storage.ts Server-side storage REST fetch
lib/utils/auth.ts       roleToRoute, routeToRole, isRouteAllowedForRole
services/portal/        Business logic called by Server Actions
prisma/schema.prisma    Source of truth — 814 lines, 60+ models
constants/portal/       Roles, navigation, routes
enums/portal/           UserRole, UserStatus TypeScript enums
providers/              NotificationProvider (Supabase Realtime)
```

## Critical Rules
- **Prisma only** for all DB access — never Supabase JS for queries
- **NextAuth only** for auth — Supabase Auth is NOT used, never add `supabase.auth.*`
- **Supabase JS** = browser Realtime subscriptions only
- **Supabase Storage** = server-side REST fetch via `lib/supabase-storage.ts` only
- **`SUPABASE_SERVICE_ROLE_KEY`** = server env only, never in client code
- **Server Actions** for mutations: `actions/*.actions.ts` → `services/portal/*.service.ts`
- **No hallucinated symbols** — read files before referencing functions or paths
- **No unrelated cleanup** — fix only what the task requires

## RBAC — 3 Layers (never bypass)
1. **Edge** — `auth.config.ts` `authorized()` → redirect unauthenticated to `/portal/login`
2. **Layout** — `[role]/layout.tsx` → 5 guards: session, valid URL role, status=ACTIVE, role populated, role matches URL
3. **Page** — each sensitive page re-checks `session.user.role === USER_ROLE.X`

Role → URL: `SYSTEM_ADMIN→admin`, `TEACHER→teacher`, `STUDENT→student`
Always use `roleToRoute` / `routeToRole` from `lib/utils/auth.ts` — never hardcode.

## Known Issues (P0)
- **R11 ✅ Fixed:** `tailwind.config.js` content array now covers `app/**`, `components/**` and all source dirs
- **R17 ✅ Fixed:** `LanguageSwitcher` export removed; `next-intl`, `pg`, `recharts` uninstalled
- **R10:** Forms use manual `useState` — new forms must use React Hook Form + Zod; existing forms: do not refactor without approval
- **Open:** Two Supabase project URLs in `next.config.ts` — verify which is active (R07)

## Workflow
1. Read the target files before writing a single line
2. State in one sentence what currently happens and what will change
3. List every file to touch — confirm with user if >5 files
4. Implement one focused change, no unrelated cleanup
5. Re-read changed files; provide manual test checklist (happy path + wrong role + edge case)
6. Append to `.claude/worklogs/ruby-hsk/DEVELOPMENT_WORKFLOW.md` for significant tasks

## Skill Map
| Skill | Load when… |
|---|---|
| `ruby-hsk-workflow` | Starting any non-trivial task |
| `ruby-hsk-auth-rbac-nextauth` | Auth, role guards, session, login flow |
| `ruby-hsk-prisma-supabase-db` | DB queries, schema changes, migrations, seeds |
| `ruby-hsk-supabase-realtime-storage` | Notifications, file uploads, Supabase boundary |
| `ruby-hsk-nextjs-app-router` | Routes, layouts, Server Actions, API routes |
| `ruby-hsk-design-system` | Styling, components, HeroUI, tokens, animations |
| `ruby-hsk-homepage` | Landing pages, SEO, CMS content, conversion |
| `ruby-hsk-portal` | Portal modules, dashboards, navigation, forms |
| `ruby-hsk-qa-review` | Pre-commit review, security, test checklist |
| `ui-ux-pro-max` | Significant UI design or visual redesign work — loads as `frontend-design:frontend-design` |
