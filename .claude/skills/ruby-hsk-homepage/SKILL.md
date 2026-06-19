# ruby-hsk-homepage

## When to use
Modifying landing pages, homepage sections, CMS content, SEO metadata, public course display, contact/registration flows.

---

## Route group

`app/(landing)/` — no auth required. All pages server-rendered.

| Route | File | Notes |
|---|---|---|
| `/` | `page.tsx` | Main homepage — 8 sections |
| `/about` | `about/page.tsx` | Team, center info |
| `/courses` | `courses/page.tsx` | Course listing |
| `/courses/[slug]` | `courses/[slug]/page.tsx` | Course detail |
| `/contact` | `contact/page.tsx` | Contact form |
| `/privacy`, `/terms` | static pages | Legal |
| `/system-design` | dev-only diagnostic | |

---

## Homepage — 8 sections

```
HeroSection          ← HeroSlide records from DB (CMS)
CourseListSection    ← Course records by HSKLevel
FeaturesSection      ← Feature records from DB (CMS)
ReviewSection        ← Review records from DB (CMS)
StatsSection         ← CtaStat records from DB (CMS)
TeamSection          ← Static or Album/Photo records
CtaSection           ← Static copy
FooterSection        ← Static layout
```

All data-driven sections fetch from DB via Prisma in the Server Component parent. No client-side fetching on the landing homepage.

---

## CMS content models

Editable from admin portal (`/portal/admin/cms`):

| Model | Fields | Section |
|---|---|---|
| `HeroSlide` | title, subtitle, image, ctaText, ctaLink, order | Hero carousel |
| `Feature` | title, description, icon, order | Features grid |
| `Review` | reviewer, role, content, rating, avatar | Social proof |
| `CtaStat` | label, value, icon | Stats bar |
| `PageMetadata` | slug, title, description, ogImage | Per-page SEO |

**Admin edits flow:** Portal admin form → Server Action → `prisma.model.update()` → `revalidatePath("/")` → Next.js cache cleared → homepage reflects change on next request.

---

## SEO

`PageMetadata` model stores per-route metadata. Fetch by `slug` in each page's `generateMetadata()`:

```ts
export async function generateMetadata(): Promise<Metadata> {
  const meta = await prisma.pageMetadata.findUnique({ where: { slug: 'home' } })
  return {
    title: meta?.title ?? 'Ruby HSK',
    description: meta?.description ?? '',
    openGraph: { images: meta?.ogImage ? [meta.ogImage] : [] },
  }
}
```

**To verify:** Whether all existing landing pages have implemented `generateMetadata()` or rely on root layout metadata only.

---

## Navigation component

`components/landing/shared/Navbar.tsx` (or similar):
- Links: Home, About, Courses, Contact
- CTA: "Đăng ký học" → registration/contact form
- Mobile: hamburger menu

**`LanguageSwitcher` component** — installed, defined in `components/landing/common/`, but the `next-intl` i18n package is NOT wired up (no `i18n.config.ts`, no `[locale]` route segment). Do not expose the LanguageSwitcher in UI. It will be a no-op or crash at runtime.

---

## Registration / lead capture

`Registration` model in schema: captures name, phone, email, course interest.

- Form is on `/contact` or a dedicated modal (To verify exact location)
- Server Action or API route POSTs to `prisma.registration.create()`
- Admin portal lists registrations at `/portal/admin/registrations`
- Status workflow (PENDING → CONTACTED → ENROLLED) — To verify if implemented

---

## Course display

`/courses` lists all published `Course` records grouped by `HSKLevel`.
`/courses/[slug]` shows course detail — lessons, vocabulary preview, price, enrollment CTA.

`Course` → `HSKLevel` (FK), `Category` (FK) → `Lesson[]` → `Vocabulary[]`

All reads via Prisma. No write operations on landing course pages.

---

## Components — landing custom primitives

`components/landing/common/` (19 files — do NOT replace with HeroUI):
`Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Label`, `Badge`, `Modal`, `Drawer`, `Tooltip`, `Loading`, `Skeleton`, `Alert`, `Card`, `Tabs`, `Accordion`, `Stepper`, `Pagination`

`components/landing/shared/`: `Navbar`, `Footer`, `AnimatedSection`, `LanguageSwitcher`

---

## Conversion gaps (audit observations — not yet implemented)

1. No social proof near registration CTA (reviews are in a separate section)
2. No price displayed on course cards — requires clicking through to detail
3. `LanguageSwitcher` is unreachable UI (next-intl not wired)
4. Contact form success/error feedback — To verify if toast or inline

---

## Adding a new landing page

1. Create `app/(landing)/<slug>/page.tsx` (async Server Component)
2. Add `generateMetadata()` fetching from `PageMetadata` (slug = route name)
3. Use existing `components/landing/common/` and `components/landing/shared/` — do not introduce HeroUI here
4. No auth required — these routes are in the `(landing)` group
5. Add link to Navbar if it should be in site nav
