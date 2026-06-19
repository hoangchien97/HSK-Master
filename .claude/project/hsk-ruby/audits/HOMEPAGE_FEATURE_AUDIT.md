# Ruby HSK — Homepage Feature Audit

**Date:** 2026-06-19 | **Source:** Full project audit — landing pages, components, services, API routes

---

## 1. Route Group: `(landing)`

| Route | Page file | Status |
|---|---|---|
| `/` | `app/(landing)/page.tsx` | ✅ Active — main landing page |
| `/about` | `app/(landing)/about/page.tsx` | ✅ Active |
| `/contact` | `app/(landing)/contact/page.tsx` | ✅ Active |
| `/courses` | `app/(landing)/courses/page.tsx` | ✅ Active — course catalog |
| `/courses/[slug]` | `app/(landing)/courses/[slug]/page.tsx` | ✅ Active — course detail |
| `/privacy` | `app/(landing)/privacy/page.tsx` | ✅ Active |
| `/terms` | `app/(landing)/terms/page.tsx` | ✅ Active |
| `/system-design` | `app/(landing)/system-design/page.tsx` | ⚠️ Risk — internal dev doc exposed publicly, no noindex |

---

## 2. Homepage (`/`) — Section Inventory

### Section 1 — Hero with Slideshow
- File: `components/landing/home/HeroSlideShowClient.tsx`
- Features: Auto-rotating slides with CTAs (Embla Carousel)
- Content source: `HeroSlide` model via `services/hero-slide.service.ts` → `prisma.heroSlide.findMany()`
- State: CMS-driven from database
- Risks: None identified

### Section 2 — Feature Highlights
- File: `components/landing/home/FeatureSection.tsx`
- Features: 3–6 feature cards with icons and descriptions
- Content source: `Feature` model via `services/feature.service.ts`
- State: CMS-driven from database
- Risks: None identified

### Section 3 — Course Catalog Preview
- File: `components/landing/home/CoursesSection.tsx` or similar
- Features: Grid of featured courses linking to `/courses/[slug]`
- Content source: `Course` model via `services/landing/course.service.ts`
- State: CMS-driven from database
- Risks: No load-time filtering if course count grows

### Section 4 — Student Reviews / Testimonials
- File: `components/landing/home/ReviewsSection.tsx`
- Features: Star ratings, review text, reviewer photo
- Content source: `Review` model via `services/review.service.ts`
- State: CMS-driven from database
- Risks: None identified

### Section 5 — CTA Stats / Social Proof
- File: `components/landing/home/StatsSection.tsx` or similar
- Features: Animated counters (CountUp.tsx), key numbers (students, lessons, etc.)
- Content source: `CtaStat` model via `services/cta-stat.service.ts`
- State: CMS-driven from database
- Risks: CountUp animations not verified to respect `prefers-reduced-motion` (R13)

### Section 6 — Call to Action / Lead Capture
- Current state: CTA button linking to `/contact`
- **Risk R25:** No inline lead capture form — requires navigation away from homepage
- Recommendation: Add 3-field consultation form (name, phone, topic) within homepage

---

## 3. About Page (`/about`)

| Feature | Status |
|---|---|
| School introduction content | ✅ Active |
| Teacher/staff profiles section | ✅ Active — `Album` model for photo galleries |
| Photo gallery | ✅ Active — `Photo` model, Supabase Storage URLs |
| Meta tags (SEO) | ✅ Active — `PageMetadata` model for dynamic OG/title |

---

## 4. Contact Page (`/contact`)

| Feature | Status |
|---|---|
| Contact form | ✅ Active — manual `useState` form (R10) |
| Form submission | `Registration` model — `prisma.registration.create()` |
| Validation | Manual — no React Hook Form + Zod |
| Auto-response email | To verify |
| Admin notification | To verify |
| Google Maps embed | To verify |

---

## 5. Courses Section (`/courses`, `/courses/[slug]`)

### Course listing page (`/courses`)
- Content source: `Course` model with `Category` relations
- Features: Filter by `Category`, paginated list
- CMS-driven

### Course detail page (`/courses/[slug]`)
- Content source: `Course` + `Lesson[]` + `Vocabulary[]` + `GrammarPoint[]`
- Features: Lesson list, vocabulary preview, enrollment CTA
- SEO: Dynamic metadata from `PageMetadata` model or course fields

---

## 6. Component Architecture — Landing

### Two parallel systems (Risk R12)

**Custom landing primitives** (`components/landing/common/` — 19 files):
- `Button.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`, `Label.tsx`, `Textarea.tsx`
- `Tooltip.tsx` (wraps `@radix-ui/react-tooltip`)
- `Select.tsx`, `Checkbox.tsx`
- `Skeleton.tsx`, `Spinner.tsx`
- `Container.tsx`, `Section.tsx`, `Divider.tsx`, `Grid.tsx`
- `Typography.tsx`, `Heading.tsx`, `Text.tsx`

**Portal HeroUI components** (77 files in portal):
- Entirely separate — HeroUI v2 from `@heroui/react`

**Impact:** Two visual systems that can drift. No shared design token layer.

**Recommendation:** Phase 2 — migrate landing primitives to HeroUI wrapper components in `components/ui/`, unified under shared Tailwind tokens.

### Shared landing components (`components/landing/shared/`):
- `Header.tsx` — Navigation with `LanguageSwitcher` (R17/R24)
- `Footer.tsx`
- `AnimatedSection.tsx` — Scroll-triggered entrance animations (Framer Motion or CSS keyframes — **To verify**)
- `TypingText.tsx` — Animated typing effect
- `CountUp.tsx` — Animated counter

---

## 7. Landing Services (`services/`)

| Service | Prisma model | Purpose |
|---|---|---|
| `hero-slide.service.ts` | `HeroSlide` | Homepage slideshow data |
| `feature.service.ts` | `Feature` | Feature cards |
| `cta-stat.service.ts` | `CtaStat` | Social proof stats |
| `review.service.ts` | `Review` | Student testimonials |
| `category.service.ts` | `Category` | Course categories |
| `course.service.ts` | `Course` | Course catalog |
| `page-metadata.service.ts` | `PageMetadata` | Dynamic SEO metadata |
| `registration.service.ts` | `Registration` | Contact form submissions |

All 8 services use Prisma exclusively — zero direct SQL.

---

## 8. SEO Implementation

| Feature | Status |
|---|---|
| Dynamic metadata | ✅ `PageMetadata` model per page via `generateMetadata()` |
| Google site verification | ✅ `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var in root layout |
| `<html lang="vi">` | ✅ Hardcoded in root layout |
| Open Graph tags | ✅ Via Next.js metadata API |
| Sitemap | **To verify** — no `sitemap.ts` found |
| robots.txt | **To verify** — no `robots.ts` found |
| `/system-design` noindex | ❌ Missing — internal dev doc exposed publicly |

---

## 9. Header — `LanguageSwitcher` Issue (R17/R24)

`components/landing/shared/Header.tsx` renders a `LanguageSwitcher` component.

**Problem:** `next-intl` is installed but completely unwired:
- No `i18n/` configuration folder
- No `NextIntlClientProvider` in layout
- No locale routing (e.g., `/vi/...`, `/zh/...`)
- Root layout: `<html lang="vi">` hardcoded

**Impact:** Visitors see a language toggle that does nothing. Misleads users; damages credibility.

**Fix (P0):** Remove `LanguageSwitcher` from `Header.tsx` immediately.

---

## 10. `/system-design` — Internal Doc Risk

`app/(landing)/system-design/page.tsx` is a public-facing page rendering internal system architecture documentation.

**Risk:** Search engines can index this page. Competitors and bad actors can view implementation details.

**Fix options:**
1. Move behind portal auth (preferred)
2. Add `export const metadata = { robots: { index: false } }` to the page file
3. Add to `robots.txt` as `Disallow: /system-design`

---

## 11. Identified Risks in Landing Area

| ID | Severity | Description |
|---|---|---|
| R10 | High | Contact form uses manual `useState` — no React Hook Form + Zod |
| R11 | High | `tailwind.config.js` content array missing landing component paths |
| R12 | Medium | Two parallel component systems — landing custom vs portal HeroUI |
| R13 | Medium | `AnimatedSection.tsx`, `CountUp.tsx`, `TypingText.tsx` — no `prefers-reduced-motion` confirmed |
| R17/R24 | High | `LanguageSwitcher` in header renders but i18n is not wired |
| R25 | Medium | No inline lead capture form in hero section |

---

## 12. Recommendations — Priority Order

| Priority | Action |
|---|---|
| P0 | Remove `LanguageSwitcher` from Header.tsx |
| P0 | Add `content` paths to `tailwind.config.js` including `components/landing/**` |
| P1 | Add `noindex` to `/system-design` or move behind auth |
| P1 | Add `prefers-reduced-motion` guards to animations |
| P1 | Migrate contact form to React Hook Form + Zod |
| P2 | Add inline consultation form to homepage hero section |
| P2 | Add `sitemap.ts` and `robots.ts` |
| Phase 2 | Migrate landing custom components to HeroUI shared layer |
