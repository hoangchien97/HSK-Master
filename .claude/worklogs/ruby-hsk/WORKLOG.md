# Ruby HSK — Worklog

Append a short entry here after significant tasks. Format:

```
## YYYY-MM-DD — <task title>
**Changed:** <files touched>
**Why:** <reason>
**Notes:** <anything non-obvious for future reference>
```

---

## 2026-06-18 — Initial CLAUDE.md + skills setup
**Changed:** `CLAUDE.md`, `.claude/skills/ruby-hsk-*/SKILL.md`, `.claude/worklogs/ruby-hsk/WORKLOG.md`
**Why:** Full repo inspection to document architecture for repeated Claude Code usage.
**Notes:**
- Primary DB access is Prisma only — Supabase JS is realtime/storage only.
- NextAuth v5 is still beta.30 — watch for session/JWT breaking changes on upgrade.
- Tailwind v4 CSS-first config: all tokens in `globals.css @theme inline`, not `tailwind.config.js`.
- `tailwind.config.js` content array is incomplete (missing `app/**`, `components/**`) — may cause purge issues; verify before production build.
- Dark mode toggle not yet wired (`<html className="light">` hardcoded).
- `next-intl` is installed but usage extent unverified — check before removing.
- Dual role definitions (`constants/portal/roles.ts` + `enums/portal/role.ts`) must stay in sync manually.
