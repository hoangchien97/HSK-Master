# ruby-hsk-workflow

## When to use
Starting any non-trivial task in this repo. Load this first, then load the domain skill for the area you're working in.

## Domain skill triggers

| Task involves… | Load skill |
|---|---|
| Auth, roles, session, login | `ruby-hsk-auth-rbac-nextauth` |
| DB queries, schema, migrations | `ruby-hsk-prisma-supabase-db` |
| Notifications, uploads, Supabase | `ruby-hsk-supabase-realtime-storage` |
| Routes, layouts, Server Actions | `ruby-hsk-nextjs-app-router` |
| Styling, HeroUI, tokens, animations | `ruby-hsk-design-system` |
| Landing pages, SEO, CMS | `ruby-hsk-homepage` |
| Portal modules, dashboards, forms | `ruby-hsk-portal` |
| Pre-commit review, security | `ruby-hsk-qa-review` |
| New UI design or visual redesign | `ui-ux-pro-max` |

---

## Step 1 — Read before planning
Read the actual files. Never assume structure from memory.

- **Bug:** read the failing component → service it calls → Server Action if mutation involved
- **New feature:** find the closest existing module, read its page + component + service + action
- **Schema change:** read `prisma/schema.prisma` for relevant models + all services that query them

---

## Step 2 — State the situation
In one sentence: "Currently X happens. The change is Y."
Do not proceed until this is clear.

---

## Step 3 — Plan before coding
List explicitly:
- Files to create (with full paths)
- Files to modify (with what changes)
- Files to leave untouched

If the plan touches >5 files or modifies a shared component, confirm with the user first.

---

## Step 4 — Implement (focused)
- One change per task — no opportunistic cleanup
- Match existing file conventions exactly (naming, export style, `@/` alias)
- Use `USER_ROLE` constants and `roleToRoute`/`routeToRole` — never hardcode role strings
- Every new portal page needs a page-level role guard
- Every new form must use React Hook Form + Zod (see Known project state below)

---

## Step 5 — Review and test
After implementing:
1. Re-read every changed file
2. Run the `ruby-hsk-qa-review` checklist mentally
3. Provide a manual test checklist:
   - Happy path
   - Wrong role / unauthenticated access attempt
   - Feature-specific edge case

---

## Step 6 — Log significant work
Append to `.claude/worklogs/ruby-hsk/DEVELOPMENT_WORKFLOW.md` for:
- New modules added
- Schema migrations
- Auth or RBAC changes
- Non-obvious decisions or workarounds

Format:
```
## YYYY-MM-DD — <title>
**Changed:** <files>
**Why:** <reason>
**Notes:** <non-obvious details>
```

---

## Known project state (2026-06-19 audit)

**Forms — critical:**
- Forms currently use manual `useState` + `updateField()` patterns
- `react-hook-form` is installed but **NOT deployed anywhere** in the codebase
- `Zod` is used only in `auth.ts` (Credentials input) and `app/api/auth/register/route.ts`
- **Do NOT add new forms without React Hook Form + Zod** — this is the required path forward

**Dead dependencies (do not use):**
- `pg` — installed, zero imports in the entire codebase
- `next-intl` — installed, not wired, no `i18n/` or `messages/` directory exists

**UI — two component systems:**
- Landing pages use **custom primitives** in `components/landing/common/` (Button, Input, Select, etc.) — these are NOT HeroUI
- Portal uses **HeroUI** (77 files) as the primary component library
- Do not mix systems; when adding to portal, use HeroUI

**Other known issues:**
- `LanguageSwitcher` renders in the header but `next-intl` is not wired — it does nothing
- `framer-motion` is in deps and `optimizePackageImports` — landing `AnimatedSection.tsx` likely uses it; verify before assuming unavailable
- `tailwind.config.js` content array is **incomplete** (missing `app/**`, `components/**`) — R11 risk for production builds
- Two Supabase project URLs exist in `next.config.ts` — verify which is the active project
