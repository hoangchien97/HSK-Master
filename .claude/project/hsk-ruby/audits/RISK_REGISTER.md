# Ruby HSK — Risk Register

**Date:** 2026-06-19 | **Total risks:** 25 | **Source:** Full project audit

---

## Risk Table

| ID | Area | Severity | Description | Impact | Recommendation | Status | Related files |
|---|---|---|---|---|---|---|---|
| R01 | Auth | **High** | NextAuth v5 beta.30 — pre-release, session/JWT edge cases possible on upgrade | Auth breakage on upgrade | Pin version; monitor stable release; test auth flow on upgrade | Open | `package.json`, `auth.ts` |
| R02 | Auth | **High** | Google Calendar scope (`calendar.events`) forced on ALL Google logins including students | Reduced OAuth conversion; users must consent to calendar to log in | Incremental auth — request calendar scope only for teachers on first schedule interaction | Open | `auth.ts:29-36` |
| R03 | Auth | **Medium** | JWT refresh interval is 5 min — locked users can remain active for up to 5 min after being locked | Security window after account lock | Acceptable short-term; reduce interval or add real-time revocation if needed | Open | `auth.ts` (REFRESH_INTERVAL) |
| R04 | Auth/RBAC | **Medium** | Page-level (Layer 3) RBAC guards not confirmed for all portal module pages | Potential unauthorized page/API access | Audit all `app/(portal)/portal/[role]/*/page.tsx` and all `app/api/portal/*/route.ts` | Open | All portal pages |
| R05 | Database | **Medium** | `pg` package installed in `package.json` but zero imports in codebase | Dead dependency; unused bundle weight | Remove `pg` from `package.json` | Open | `package.json` |
| R06 | Database | **Low** | Indexes added late in migration `20260301174255_add_missing_indexes` | Early performance debt; queries before that date may have been slow | Monitor query performance; add indexes proactively for new query patterns | Open | `prisma/migrations/20260301*` |
| R07 | Supabase | **Medium** | Two Supabase project URLs in `next.config.ts`: `ukbeoggejnqgdxqoqkvj` and `alfbzgjpjvrcfaxxvijl` | Unclear which is production; both whitelisted for `next/image` | Verify active production project; remove unused hostname from `next.config.ts` | Open | `next.config.ts` |
| R08 | Supabase | **Low** | `lib/supabase-storage.ts` service role key falls back silently to anon key if `SUPABASE_SERVICE_ROLE_KEY` is missing or invalid | Uploads may silently fail with wrong permissions in staging/CI | Add explicit warning log when falling back to anon key | Open | `lib/supabase-storage.ts:17-26` |
| R09 | Supabase | **Low** | `avatars` and `documents` storage buckets are `public: true` — files accessible by URL without auth | Assignment submissions containing student work publicly accessible | Enable RLS on `documents` bucket or use signed URLs for document access | Open | `scripts/setup-storage.ts` |
| R10 | UI/Forms | **High** | All forms use manual `useState` — `react-hook-form` is installed but zero `useForm` imports found | Inconsistent validation, poor UX on form errors, data quality issues | Implement React Hook Form + Zod across all portal and landing forms in Phase 1 | Open | All form components |
| R11 | UI/CSS | **High** | `tailwind.config.js` content array only includes `@heroui/theme` paths — missing `app/**`, `components/**`, etc. | Tailwind may purge CSS classes used in app files in production build | Add all source paths to content array; run production build to confirm | Open | `tailwind.config.js` |
| R12 | UI | **Medium** | Two parallel component systems: `components/landing/common/` (19 custom primitives) vs `components/portal/` (HeroUI-based) | UI inconsistency; maintenance overhead; brand drift between surfaces | Unify under HeroUI + create `components/ui/` shared layer; retire landing primitives over time | Open | `components/landing/common/`, `components/portal/` |
| R13 | A11y | **Medium** | No `prefers-reduced-motion` media query checks on CSS animations or `AnimatedSection.tsx` | Accessibility violation for users with vestibular disorders | Add `@media (prefers-reduced-motion: reduce)` to CSS keyframes; guard Framer Motion usage | Open | `app/globals.css`, `components/landing/shared/AnimatedSection.tsx` |
| R14 | UI | **Medium** | Dark mode CSS variant defined but `<html className="light">` is hardcoded — no user toggle | Dark mode tokens unused; potential FOUC if ever enabled without testing | Wire a theme toggle, or remove dark variant definitions if not planned | Open | `app/layout.tsx:130`, `app/globals.css` |
| R15 | Performance | **Medium** | No per-module `loading.tsx` files in portal — only route-group level loading exists | Blank content flash on portal page navigation; poor perceived performance | Add Suspense + skeleton to each portal module page | Open | All `app/(portal)/portal/[role]/*/page.tsx` |
| R16 | Performance | **Medium** | `recharts`, `react-big-calendar` actual usage unconfirmed — may be in bundle without dynamic import | Unnecessary bundle weight if imported statically | Confirm usage; ensure heavy components use `dynamic(() => import(...), { ssr: false })` | Open | To verify |
| R17 | Product | **High** | `LanguageSwitcher` component in header renders but `next-intl` is not wired — implies multilingual support | Misleads visitors; broken UX expectation | Remove `LanguageSwitcher` from header until i18n is actually implemented | Open | `components/landing/shared/Header.tsx` |
| R18 | Maintainability | **Medium** | `next-intl ^4.6.1` installed but zero integration (no `i18n/` folder, no locale routing, no provider) | Dead dependency; 57KB+ bundle weight; false impression of i18n readiness | Remove `next-intl` from `package.json` until i18n is a real requirement | Open | `package.json` |
| R19 | Product | **Medium** | AI Chatbot feature (floating bubble in all portal pages) is undocumented in navigation and onboarding | Users may not discover a potentially valuable feature | Add to portal navigation or student onboarding flow; document in `PORTAL_FEATURE_AUDIT.md` | Open | `app/(portal)/PortalLayoutClient.tsx` (AIChatbot bubble) |
| R20 | Maintainability | **Medium** | `actions/` directory is flat — 11 files now, will become unmanageable as features grow | Naming conflicts; hard to locate actions as codebase grows | Group by domain: `actions/admin/`, `actions/teacher/`, `actions/student/`, `actions/shared/` | Open | `actions/` |
| R21 | Maintainability | **Low** | Dual role definition: `constants/portal/roles.ts` (const objects) and `enums/portal/role.ts` (TypeScript enum) — must stay manually in sync | Role drift if one file is updated without the other | Add a TypeScript compile-time assertion or CI check ensuring both files define identical values | Open | `constants/portal/roles.ts`, `enums/portal/role.ts` |
| R22 | Security | **Medium** | `dangerouslyAllowSVG: true` in `next.config.ts` with sandbox CSP | XSS via SVG if user-uploaded SVGs are served through `next/image` | Confirm no user-uploaded SVGs go through `next/image`; if they do, disable `dangerouslyAllowSVG` | Open | `next.config.ts` |
| R23 | Security | **Low** | No rate limiting on `/api/auth/register` or `/portal/login` (Credentials provider) | Brute-force attacks; account enumeration | Add rate limiting middleware (e.g., `upstash/ratelimit` with Redis or Vercel KV) | Open | `app/api/auth/register/route.ts`, `auth.ts` |
| R24 | Homepage | **High** | `LanguageSwitcher` implies multilingual — misleads visitors (duplicate of R17 from homepage perspective) | Trust and credibility issue; implied feature doesn't work | Remove immediately (same fix as R17) | Open | `components/landing/shared/Header.tsx` |
| R25 | Homepage | **Medium** | No lead capture form near hero section — contact form requires navigating to `/contact` | Low conversion rate from homepage visitors to consultation leads | Add a 3-field consultation form (name, phone, topic) in or near the hero section | Open | `app/(landing)/page.tsx` |

---

## Priority Order for Fixing

### P0 — Fix before any new work

| ID | Area | Quick description |
|---|---|---|
| R11 | CSS | Fix `tailwind.config.js` content array — production CSS purge risk |
| R17/R24 | Homepage | Remove `LanguageSwitcher` — it's broken and misleads users |
| R04 | RBAC | Audit all portal pages + API routes for missing Layer 3 guards |
| R10 | Forms | Plan + begin React Hook Form + Zod rollout |
| R05 | Deps | Remove `pg` from `package.json` |
| R18 | Deps | Remove `next-intl` from `package.json` |
| R07 | Supabase | Confirm production Supabase URL; remove unused from `next.config.ts` |

### P1 — Fix in Phase 1 (Design system + stabilization)

| ID | Area | Quick description |
|---|---|---|
| R13 | A11y | Add `prefers-reduced-motion` guards |
| R14 | UI | Wire dark mode toggle or remove dark variant definitions |
| R15 | Performance | Add per-module loading skeletons to portal pages |
| R01 | Auth | Monitor NextAuth stable release; plan upgrade path |
| R08 | Supabase | Add explicit warning when service role key falls back to anon |
| R09 | Supabase | Review `documents` bucket public access; consider signed URLs |

### P2 — Fix in Phase 2+

R02, R03, R06, R12, R16, R19, R20, R21, R22, R23, R25

---

## Change Log

| Date | Change | By |
|---|---|---|
| 2026-06-19 | Initial risk register created from full project audit | Claude Code audit |
