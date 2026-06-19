# Ruby HSK — Project Full Audit

## 1. Audit Metadata

| Item | Value |
|---|---|
| Date | 2026-06-19 |
| Method | 3 parallel Explore agents (structure/auth, database/Supabase, UI/components) + manual inspection |
| Source of truth | Actual source code only — worklogs and skills treated as potentially outdated |
| Scope | Full project: architecture, auth, RBAC, database, Supabase boundary, homepage, portal, UI/UX, product fit, risks |

---

## 2. Repository Snapshot

| Metric | Count |
|---|---|
| Server Action files (`actions/`) | 11 |
| Portal service files (`services/portal/`) | 11 |
| Landing service files (`services/`) | 8 |
| API routes (`app/api/`) | 27 |
| Prisma models | 60+ |
| Prisma migrations | 21 |
| Components — portal/admin | 27 files |
| Components — portal/practice | 17 files |
| HeroUI usage | 77 files |
| Skill files (`.claude/skills/`) | 9 |
| Seed files | 3 (seed.ts, seed-vocabulary.ts, seed-portal.ts) |
| HSK vocabulary JSON exports | 6 (HSK 1–6) |

---

## 3. Tech Stack Confirmed

| Layer | Confirmed |
|---|---|
| Framework | Next.js 16.1.1, App Router, TypeScript, React 19 |
| Auth | NextAuth v5 beta.30 — JWT strategy, Google OAuth + Credentials |
| ORM | Prisma 5 — only DB access layer |
| Database | PostgreSQL hosted on Supabase |
| Realtime | Supabase JS browser singleton — notifications only |
| Storage | Supabase Storage via REST fetch — server-side only |
| UI library | HeroUI v2 (77 files), Radix UI (2 files only) |
| Styling | Tailwind CSS v4, CSS-first config in `globals.css` |
| Icons | Lucide React |
| Animation | CSS keyframes in globals.css; Framer Motion in deps — **To verify actual import usage** |
| Forms | **react-hook-form installed but ZERO `useForm` imports found** — forms use manual `useState` |
| Validation | Zod in 2 files only (auth.ts + register API) — **not used for form validation** |
| i18n | next-intl installed — **completely unwired, dead dependency** |
| Direct PG | pg package installed — **zero imports, dead dependency** |
| Carousel | Embla Carousel — confirmed in HeroSlideShowClient.tsx |
| Charts | Recharts — in deps — **To verify actual usage** |
| Calendar | React Big Calendar — in deps — **To verify actual usage** |
| Hanzi | Hanzi Writer — confirmed in practice WriteTab |
| Excel export | ExcelJS — confirmed in attendance export API route |
| AI Chat | DeepSeek/OpenAI via lib/ai/chat-service.ts — AI_API_KEY env var |
| Google Calendar | googleapis — confirmed, lib/portal/calendar-token.service.ts |

---

## 4. Architecture Confirmed

```
Database access:    All code → lib/prisma.ts (singleton) → Prisma Client → DATABASE_URL → Supabase PostgreSQL
Migrations:         DIRECT_URL (port 5432) — bypasses pgbouncer
Authentication:     NextAuth v5 ONLY — Supabase Auth NOT used anywhere
File uploads:       Client → /api/portal/upload/ (auth + validate) → lib/supabase-storage.ts (REST) → Supabase Storage
Realtime:           Prisma write → PortalNotification → Supabase Realtime channel → providers/notification-provider.tsx
```

**Supabase roles in this project:**
1. PostgreSQL hosting (accessed only via Prisma)
2. Storage (server-side REST fetch only)
3. Realtime (browser-side JS client only, notifications only)

**Supabase Auth: NOT USED. Zero violations found.**

---

## 5. Route Structure Summary

```
app/
├── (landing)/          Public: /, /about, /contact, /courses/[slug], /privacy, /terms, /system-design
├── (portal)/           Authenticated: /portal, /portal/profile, /portal/[role]/[module]
│   └── [role] =        admin | teacher | student
├── (portal-auth)/      /portal/login, /portal/register, /portal/error, /portal/unauthorized
└── api/
    ├── auth/           NextAuth handler + registration endpoint
    └── portal/         27 REST endpoints (classes, assignments, calendar, attendance, upload, chat, etc.)
```

**No `middleware.ts` file.** Auth protection is via `auth.config.ts` `authorized()` callback (Edge-compatible).

---

## 6. RBAC Enforcement Confirmed

Three layers operating:

| Layer | File | What it checks |
|---|---|---|
| 1 — Edge | `auth.config.ts` `authorized()` | Is user logged in? Redirects to /portal/login if not |
| 2 — Server layout | `app/(portal)/portal/[role]/layout.tsx` | Session valid? Status ACTIVE? URL role valid? Role matches URL? |
| 3 — Page | Individual `page.tsx` files | Role === required role for this specific module |

**Risk:** Layer 3 not confirmed for all portal module pages — full audit needed (R04).

---

## 7. Supabase Boundary

**All compliant as of 2026-06-19.** Zero violations found:
- No `supabase.auth.*` anywhere
- No Supabase JS DB queries
- No `SUPABASE_SERVICE_ROLE_KEY` in client code
- No direct client-side storage uploads

See `SUPABASE_USAGE_BOUNDARY.md` for full detail and future feature checklist.

---

## 8. Key Risks Summary

Full table in `RISK_REGISTER.md`. Critical highlights:

| ID | Severity | Issue |
|---|---|---|
| R10 | **High** | Forms use manual `useState` — no React Hook Form + Zod deployed |
| R11 | **High** | `tailwind.config.js` content array incomplete — CSS purge risk in production |
| R17/R24 | **High** | `LanguageSwitcher` renders but i18n is not wired — misleads users |
| R04 | **Medium** | Page-level RBAC guards not confirmed for all portal modules |
| R02 | **High** | Google Calendar scope forced on all Google logins including students |
| R07 | **Medium** | Two Supabase project URLs in next.config.ts — unclear which is production |

---

## 9. P0 Actions Before New Work

These must be resolved before adding new features:

1. **R11** — Fix `tailwind.config.js` content array (add `app/**`, `components/**`, etc.)
2. **R17** — Remove `LanguageSwitcher` from header
3. **R04** — Audit all portal page files for missing Layer 3 role guards
4. **R10** — Plan React Hook Form + Zod rollout (Phase 1 prerequisite)
5. **R05** — Remove `pg` from package.json (dead dependency)
6. **R18** — Remove `next-intl` from package.json (dead dependency)
7. **R07** — Confirm which Supabase project URL is production; remove unused from next.config.ts
8. **/system-design** — Add noindex meta or move behind auth
