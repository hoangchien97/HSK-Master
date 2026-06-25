# Ruby HSK — Worklog

Reverse-chronological list of significant changes.

---

## 2026-06-19 — Full project audit via 3 parallel Explore agents

**Changed:** CLAUDE.md, `.claude/skills/*`, `.claude/worklogs/ruby-hsk/*`

**Why:** Complete architecture audit to establish accurate ground truth for all Claude Code sessions.

**Key findings:**
- react-hook-form installed but NOT deployed — all forms use manual useState
- pg package: zero imports — dead dependency
- next-intl: not wired — dead dependency
- framer-motion: in deps + optimizePackageImports — AnimatedSection.tsx likely uses it (verify actual imports)
- Two Supabase project URLs in next.config.ts — verify active one (R07)
- tailwind.config.js content array incomplete — R11 production CSS purge risk
- LanguageSwitcher in header with no i18n backing — remove (R17)
- Supabase Auth: confirmed NOT used anywhere ✅
- All Supabase boundary rules: compliant, no violations found ✅
- 25 risks documented in RISK_REGISTER.md

**See:** PROJECT_FULL_AUDIT.md for full findings, RISK_REGISTER.md for all 25 risks, PHASED_IMPLEMENTATION_PLAN.md for fix order.

---

## Previous entries

*(Prepend new entries above this line)*
