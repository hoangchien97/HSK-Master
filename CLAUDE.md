# Ruby HSK — CLAUDE.md

## Overview
Vietnamese Chinese-learning web app for a Hanoi language center.
**Public site:** https://ruby-hsk.vercel.app/ | **Portal:** `/portal` (ADMIN / TEACHER / STUDENT)

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Auth | NextAuth v5 beta — JWT, Google OAuth + Credentials |
| ORM | Prisma 5 → PostgreSQL on Supabase |
| Realtime / Storage | Supabase JS (notifications) + REST fetch (file uploads) |
| UI | HeroUI v2, Radix UI, Tailwind v4, Framer Motion |
| Forms | React Hook Form + Zod |

## Folder Structure
```
app/(landing)/          # Public marketing pages
app/(portal)/portal/[role]/  # role = admin | teacher | student
app/(portal-auth)/      # Login / register / error
app/api/                # Auth callbacks, portal REST endpoints
actions/                # Server Actions — one file per domain
components/landing/ portal/ shared/
constants/              # Brand, roles, navigation, routes
enums/portal/           # UserRole, UserStatus enums
lib/prisma.ts           # Prisma singleton (only DB access point)
lib/supabase-client.ts  # Browser singleton — Realtime only
lib/supabase-storage.ts # File upload/delete via REST
lib/utils/auth.ts       # roleToRoute, routeToRole, isRouteAllowedForRole
services/portal/        # Business logic called by Server Actions
prisma/schema.prisma    # Source of truth for data model
```

## Core Rules
- **Read before editing.** Inspect the target file first, every time.
- **Prisma only.** All DB access via `lib/prisma.ts` — no raw SQL, no Supabase JS for data.
- **Server Actions for mutations.** `actions/*.actions.ts` → thin, calls `services/portal/*.service.ts`.
- **No hallucinated symbols.** Only use functions, tables, paths that actually exist.
- **Focused changes.** Bug fix = touch only broken files. No opportunistic cleanup.
- **TypeScript strict.** No `any` without an inline comment explaining why.

## RBAC — Three Layers (never bypass)
1. **Edge middleware** — `auth.config.ts` `authorized()` → redirect unauthenticated to `/portal/login`
2. **`[role]/layout.tsx`** — server: validates session, `status=ACTIVE`, role-to-URL match
3. **Page-level guard** — re-check `role === SYSTEM_ADMIN` (or relevant role) on every sensitive page

Role → URL: `SYSTEM_ADMIN→admin`, `TEACHER→teacher`, `STUDENT→student`  
Always use `roleToRoute` / `routeToRole` from `lib/utils/auth.ts` — never hardcode.

**Dual definition:** if you add a role, update both `constants/portal/roles.ts` AND `enums/portal/role.ts`.

## UI Rules
- Tailwind v4 tokens live in `app/globals.css` `@theme inline {}` — never hardcode hex values.
- HeroUI for interactive components; Radix UI for Dialog, Tooltip, Label, Slot.
- Dark mode is defined but `<html className="light">` — don't add dark-only features until toggle is wired.
- `"use client"` only when you need browser APIs, hooks, or event handlers.

## Workflow (required)
1. Read relevant files (page → component → service → schema).
2. State in one sentence what currently happens and what will change.
3. List every file that will be touched — confirm if broad.
4. Implement one focused change; no unrelated refactors.
5. Re-read changed files; provide a manual test checklist (happy path + edge case).
6. For significant tasks: append a note to `.claude/worklogs/ruby-hsk/WORKLOG.md`.

## Skill Map
Load via `Skill` tool before starting the relevant task:

| Skill | Trigger |
|---|---|
| `ruby-hsk-nextjs` | Routes, layouts, Server Actions, API routes, data fetching |
| `ruby-hsk-supabase-rbac` | Auth, role guards, Supabase storage/realtime, Prisma schema |
| `ruby-hsk-tailwind-ui` | Styling, HeroUI components, animations, dark mode |
| `ruby-hsk-public-site` | Landing pages, SEO, structured data, CMS content flow |
| `ruby-hsk-admin` | Portal modules, navigation, new module scaffolding |
| `ruby-hsk-qa-review` | Pre-commit review, security check, test checklist |
| `ui-ux-pro-max` | Significant UI redesign or new visual design work |
