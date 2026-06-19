# Ruby HSK — Tech Stack Operation Analysis

**Date:** 2026-06-19 | **Source:** Full project audit via grep, file inspection, package.json

---

## Next.js 16.1.1 App Router

| Item | Detail |
|---|---|
| Confirmed usage | Entire application |
| Route groups | `(landing)`, `(portal)`, `(portal-auth)` |
| Dynamic segments | `[role]` (admin/teacher/student), `[slug]`, `[classId]`, `[sessionId]`, `[id]` |
| No `middleware.ts` | Auth handled via `auth.config.ts` `authorized()` callback |
| Consistency | High — clear separation of public vs authenticated vs auth pages |
| Risks | No per-module `loading.tsx` (R15); API vs Server Actions split inconsistent |

---

## React 19 + TypeScript

| Item | Detail |
|---|---|
| Confirmed usage | All components |
| Type safety | `types/next-auth.d.ts` session augmentation; `interfaces/portal/` domain types; `types/filters.ts` |
| Server/client boundary | Correct — Server Components fetch, Client Components render interactive UI |
| Consistency | Good; `serializeDates()` utility used before passing Date props to clients |
| Risks | None critical |

---

## NextAuth v5 beta.30

| Item | Detail |
|---|---|
| Confirmed usage | `auth.ts`, `auth.config.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Strategy | JWT (not database sessions) |
| Providers | Google OAuth + Credentials (email/password + bcrypt) |
| Adapter | `@auth/prisma-adapter` connected to Prisma |
| Consistency | High — single auth layer, no Supabase Auth anywhere |
| Risks | R01 — pre-release beta; R02 — calendar scope on all logins; R03 — 5-min JWT window |

---

## Prisma 5

| Item | Detail |
|---|---|
| Confirmed usage | 11 portal services + 8 landing services — all DB access |
| Client | Singleton at `lib/prisma.ts` |
| Models | 60+ models, 814-line schema |
| Migrations | 21 migrations, 2025-06 → 2026-03 |
| Query patterns | Parallel (`Promise.all`), paginated, transactional, upsert, aggregation |
| Raw SQL | ZERO `$queryRaw` / `$executeRaw` found |
| Consistency | Excellent — no bypasses detected |
| Risks | R06 — indexes added late |

---

## @supabase/supabase-js

| Item | Detail |
|---|---|
| Confirmed usage | 2 files only: `lib/supabase-client.ts` + `lib/supabase-storage.ts` |
| Browser usage | `lib/supabase-client.ts` — Realtime subscriptions only |
| Server usage | `lib/supabase-storage.ts` — REST fetch wrapper (not SDK methods) |
| Auth usage | NONE — confirmed zero `supabase.auth.*` calls |
| DB query usage | NONE — confirmed zero `supabase.from()` calls |
| Consistency | Excellent — strictly bounded |
| Risks | R07 (two project URLs), R08 (silent key fallback), R09 (public buckets) |

---

## HeroUI v2

| Item | Detail |
|---|---|
| Confirmed usage | 77 files across portal components |
| Primary use | Table, Button, Input, Modal, Chip, Avatar, Dropdown, Select, Form, Spinner, Switch, Divider |
| Theme source | `hero.ts` — Tailwind v4 HeroUI theme plugin |
| Consistency | High in portal; **landing uses custom primitives, NOT HeroUI** (R12) |
| Risks | R12 — two parallel component systems |

---

## Tailwind CSS v4

| Item | Detail |
|---|---|
| Confirmed usage | All styling |
| Config style | CSS-first — `@theme inline {}` in `app/globals.css` |
| Plugin | HeroUI via `hero.ts` + `@plugin "../hero.ts"` in globals.css |
| PostCSS | `@tailwindcss/postcss` in `postcss.config.mjs` |
| **Critical issue** | `tailwind.config.js` content array only includes `@heroui/theme` path — missing `app/**`, `components/**` |
| Consistency | Token usage is generally consistent; some one-off classes in landing |
| Risks | **R11 — CSS purge risk in production builds** |

---

## Framer Motion

| Item | Detail |
|---|---|
| Status | In `package.json` + `optimizePackageImports` |
| Confirmed imports | **To verify** — Explore agent could not confirm via grep |
| Likely usage | `components/landing/shared/AnimatedSection.tsx` (scroll-triggered entrance), `CountUp.tsx`, `TypingText.tsx` |
| Risks | R13 — no `prefers-reduced-motion` guards confirmed |
| Recommendation | Confirm via direct file read; ensure `AnimatedSection` respects reduced motion |

---

## React Hook Form

| Item | Detail |
|---|---|
| Status | Installed (`^7.71.1`) |
| Confirmed usage | **ZERO `useForm` imports found** — NOT deployed |
| Current reality | All forms use manual `useState` + `updateField()` helpers |
| Impact | R10 — no standardized form validation; inconsistent error handling |
| Recommendation | Deploy in Phase 1 across all portal admin forms and auth forms |

---

## Zod

| Item | Detail |
|---|---|
| Confirmed usage | 2 files only |
| `auth.ts` | Credentials provider input validation schema |
| `app/api/auth/register/route.ts` | Registration endpoint schema |
| Not used | Form validation, Server Action validation, other API routes |
| Recommendation | Pair with React Hook Form rollout in Phase 1; add to all Server Actions |

---

## Radix UI

| Item | Detail |
|---|---|
| Confirmed usage | 2 files |
| `components/landing/common/Tooltip.tsx` | Wraps `@radix-ui/react-tooltip` |
| `app/(portal)/layout.tsx` | `TooltipPrimitive.Provider` wrapper |
| Other Radix packages | `@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-slot` installed — **To verify actual usage** |
| Assessment | Very minimal Radix presence — HeroUI handles most components |
| Recommendation | Keep for accessibility-critical primitives; do not expand |

---

## Lucide React

| Item | Detail |
|---|---|
| Confirmed usage | Throughout portal and landing components |
| Consistency | High — single icon library |
| Risks | None |

---

## Embla Carousel

| Item | Detail |
|---|---|
| Confirmed usage | `components/landing/home/HeroSlideShowClient.tsx` |
| Purpose | Hero slideshow with auto-play |
| Consistency | Single usage |
| Risks | None |

---

## Recharts

| Item | Detail |
|---|---|
| Status | In `package.json` + `optimizePackageImports` |
| Confirmed usage | **To verify** — likely in dashboard stats components |
| Recommendation | Confirm usage; ensure dynamic import with `ssr: false` in client components |

---

## React Big Calendar

| Item | Detail |
|---|---|
| Status | In `package.json` |
| Confirmed usage | **To verify** — likely in teacher/student schedule components |
| Recommendation | Confirm usage location; ensure proper CSS import (`react-big-calendar/lib/css/react-big-calendar.css`) |

---

## Hanzi Writer

| Item | Detail |
|---|---|
| Confirmed usage | `components/portal/practice/WriteTab/PracticeStrokeMode.tsx` |
| Purpose | Chinese character stroke order animation and practice |
| Domain fit | Excellent — core learning feature |
| Risks | Browser-only (canvas) — already handled with `ssr: false` dynamic import in `LessonPracticeView.tsx` |

---

## ExcelJS

| Item | Detail |
|---|---|
| Confirmed usage | `app/api/portal/attendance/export/route.ts` |
| Purpose | Export attendance records to Excel format |
| Consistency | Single usage |
| Risks | None |

---

## Google APIs (googleapis)

| Item | Detail |
|---|---|
| Confirmed usage | `lib/portal/calendar-token.service.ts`, `app/api/portal/google-calendar/sync/route.ts` |
| Purpose | Google Calendar sync for teacher schedules |
| Auth | Tokens stored encrypted in `GoogleCalendarToken` model (AES-256-GCM) |
| Risks | R02 — calendar scope forced on all Google logins |

---

## next-intl

| Item | Detail |
|---|---|
| Status | Installed (`^4.6.1`) |
| Confirmed usage | **ZERO integration** — no `i18n/` folder, no `NextIntlClientProvider`, no locale routing |
| App language | Hardcoded to `lang="vi"` in root layout |
| Assessment | Dead dependency |
| Recommendation | Remove from `package.json` until i18n is a real requirement (R18) |

---

## pg

| Item | Detail |
|---|---|
| Status | Installed (`^8.16.3`) |
| Confirmed usage | **ZERO imports** in any application or script file |
| Assessment | Dead dependency |
| Recommendation | Remove from `package.json` (R05) |

---

## Axios

| Item | Detail |
|---|---|
| Status | Installed (`^1.13.4`) |
| Confirmed usage | **To verify** — may be used in AI chat service or calendar sync |
| Recommendation | Verify; if unused, consider removing (native `fetch` preferred in Next.js 16) |

---

## date-fns + dayjs

| Item | Detail |
|---|---|
| Status | Both installed: `date-fns ^4.1.0` + `dayjs ^1.11.19` |
| Assessment | Two date libraries — unnecessary duplication |
| `date-fns` | In `optimizePackageImports` — preferred |
| `dayjs` | Not in `optimizePackageImports` |
| Recommendation | Consolidate to `date-fns`; verify where `dayjs` is used and migrate |

---

## bcryptjs

| Item | Detail |
|---|---|
| Confirmed usage | `auth.ts` — Credentials provider password hashing/verification |
| Consistency | Single usage |
| Risks | None |

---

## react-toastify

| Item | Detail |
|---|---|
| Confirmed usage | `app/(portal)/layout.tsx` — `<ToastContainer>` |
| Purpose | Portal notification toasts |
| Consistency | Single entry point |
| Risks | None |

---

## Summary: Dependency Health

| Status | Packages |
|---|---|
| ✅ Confirmed and correctly used | Next.js, React, TypeScript, NextAuth, Prisma, HeroUI, Tailwind, Supabase JS, Lucide, Embla, Hanzi Writer, ExcelJS, googleapis, bcryptjs, react-toastify |
| ⚠️ Installed but NOT deployed | react-hook-form, Zod (for forms) |
| ❓ In deps, usage unconfirmed | Framer Motion, Recharts, React Big Calendar, Axios |
| ❌ Dead dependencies — remove | pg, next-intl |
| ⚠️ Duplication — consolidate | date-fns + dayjs (keep date-fns) |
