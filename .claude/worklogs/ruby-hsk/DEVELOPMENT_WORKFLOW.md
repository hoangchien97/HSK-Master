# Ruby HSK — Development Workflow Log

Append a new entry here after completing any significant task (new feature, bug fix, refactor, audit).

Format per entry:
```
## YYYY-MM-DD — [short description]
**Files changed:** list
**Why:** motivation
**Notes:** anything non-obvious for future sessions
```

---

## 2026-06-19 — Full project audit + documentation system setup

**Files changed:**
- CLAUDE.md (updated to accurate tech stack + new skill map)
- .claude/skills/ (9 skill files — 7 new, 2 updated)
- .claude/worklogs/ruby-hsk/ (11 new worklog files)

**Why:** Establish accurate ground truth for all future Claude Code sessions after discovering multiple gaps in previous docs (react-hook-form listed as used but not deployed, framer-motion unconfirmed, two Supabase URLs, incomplete tailwind content array).

**Notes:**
- react-hook-form: installed but zero useForm() calls anywhere — all forms use manual useState
- pg package: installed, zero imports — dead dep, remove with `npm uninstall pg @types/pg`
- next-intl: installed, not wired at all — dead dep, remove with `npm uninstall next-intl`
- tailwind.config.js content array: only has HeroUI paths — missing app/**, components/** (R11)
- LanguageSwitcher: renders in Header but no i18n backing — misleads users (R17)
- Two Supabase project URLs in next.config.ts — verify which is production (R07)
- Supabase boundary: all compliant, zero violations found
- 25 risks documented in RISK_REGISTER.md; P0 are R11, R17, R10, R05, R07
