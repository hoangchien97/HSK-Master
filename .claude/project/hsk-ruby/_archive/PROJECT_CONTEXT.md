# Ruby HSK — Project Context

## Product
Vietnamese Chinese-language learning web app for a Hanoi language center.
- **Public site:** https://ruby-hsk.vercel.app/
- **Portal:** https://ruby-hsk.vercel.app/portal
- **Roles:** SYSTEM_ADMIN, TEACHER, STUDENT

## Two surfaces
1. **Public marketing site** — SSR, CMS-managed via admin portal, revalidate=3600
2. **Authenticated portal** — role-scoped dashboards and tools (admin CMS, teacher workflow, student practice)

## Tech stack (confirmed 2026-06-19 audit)
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.1.1, App Router | 3 route groups |
| Language | TypeScript, React 19 | |
| Auth | NextAuth v5 beta.30, JWT | Google OAuth + Credentials. NO Supabase Auth. |
| ORM | Prisma 5 | Singleton in lib/prisma.ts. ONLY DB access point. |
| Database | PostgreSQL on Supabase | pooler:6543 (app), direct:5432 (migrations) |
| Realtime | @supabase/supabase-js | Browser only — notifications only |
| Storage | Supabase Storage | Server-side REST fetch only (lib/supabase-storage.ts) |
| UI | HeroUI v2 (77 files) | Portal primary library |
| Styling | Tailwind v4 CSS-first | Tokens in globals.css @theme inline |
| Animation | Framer Motion | In deps; likely AnimatedSection.tsx — verify |
| Forms | manual useState | react-hook-form installed but NOT deployed |
| Validation | Zod | 2 files only: auth.ts + register API route |
| Icons | Lucide React | |
| Export | ExcelJS | Attendance reports |
| Calendar | Google Calendar API | Teacher schedule sync |
| AI Chatbot | DeepSeek | /api/portal/chat/ — floating bubble in portal |
| Carousel | embla-carousel | HeroSlideShow on homepage |
| Stroke practice | hanzi-writer | Student practice Write tab |

## Key integrations
- Google OAuth with `calendar.events` scope (all users — R02 risk)
- Supabase Realtime channels for notifications (browser only)
- Supabase Storage buckets: `avatars` (public), `documents` (public — R09 risk)
- ExcelJS attendance export at /api/portal/attendance/export/

## Architecture rules
- **Prisma only** for DB — never Supabase JS for queries
- **NextAuth only** for auth — zero supabase.auth.* calls
- **Supabase JS** = browser Realtime subscriptions only
- **Supabase Storage** = server-side REST fetch via lib/supabase-storage.ts
- **SUPABASE_SERVICE_ROLE_KEY** = server env only
- **Server Actions** for mutations: actions/*.actions.ts → services/portal/*.service.ts

## RBAC (3 layers)
1. Edge: auth.config.ts authorized() — unauthenticated → /portal/login
2. Layout: [role]/layout.tsx — 5 sequential guards
3. Page: session.user.role check per sensitive page

Role→URL: SYSTEM_ADMIN→admin, TEACHER→teacher, STUDENT→student
Always use roleToRoute/routeToRole from lib/utils/auth.ts.

## Current state (2026-06-19)
- Live and deployed
- SRS practice (flashcard, quiz, listen, write, lookup) implemented
- Google Calendar teacher sync working
- AI Chatbot present in all portal pages
- 25 risks documented in RISK_REGISTER.md
- P0 issues: R11 (tailwind content array), R17 (LanguageSwitcher), R10 (form validation), dead deps pg/next-intl

## Dead dependencies (confirmed)
- `pg` — installed, zero imports
- `next-intl` — installed, not wired
- `react-hook-form` — installed, NOT deployed (all forms use manual useState)
