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

## 2026-06-24 — Phase 5 landing migration + form validation overhaul

**Changed:**
- `components/landing/common/` — deleted (17 files; all 21 consumers migrated to `@/components/ui`)
- `components/ui/` — extended Button/Badge/Input/Select/Textarea/Tooltip/Spinner/Pagination/Checkbox/Switch/Accordion with compat props and new variants
- `components/ui/primitives/OptimizedImage.tsx` — new file
- `app/globals.css` — added `--font-display`, `--font-vietnamese`, `.section-tian-zi-ge` grid watermark
- `providers/portal-ui-provider.tsx` — replaced integer counter with `Map<string,number>` key-based loading tracker; route-change reset now clears the Map
- `components/ui/navigation/Accordion.tsx` — added `variant="dark"` for use on colored backgrounds
- `components/landing/shared/FooterFAQ.tsx` — replaced custom toggle with `<Accordion variant="dark">`
- `app/(landing)/contact/actions.ts` — reads actual phone from formData (was hardcoded "CONTACT_FORM"); email/message now optional
- `lib/validations/review.ts`, `contact.ts`, `auth.ts` — new Zod schemas
- `components/landing/home/ReviewForm.tsx` — rewritten with RHF + Zod + FormField
- `components/landing/contact/ContactForm.tsx` — rewritten with RHF + Zod + FormField (bridges to Server Action via FormData)
- `components/portal/auth/LoginForm.tsx` — rewritten with RHF + Zod + FormField
- `components/portal/auth/RegisterForm.tsx` — rewritten with RHF + Zod + FormField

**Why:** Phase 5 of UI migration (retire landing/common, adopt design system), fix stuck loading provider, standardize form validation across landing + auth.

**Notes:**
- `ContactForm` still calls server action via `FormData` (reconstructed from RHF values) — server action signature unchanged
- Loading provider: default key is `"__global__"` for axios interceptor calls; named keys allow per-operation tracking
- Accordion dark variant designed for Footer's yellow→red gradient background
