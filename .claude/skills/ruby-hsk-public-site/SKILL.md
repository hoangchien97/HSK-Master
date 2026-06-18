# ruby-hsk-public-site

## When to use
Landing pages, SEO metadata, structured data, CMS-driven content sections.

## Route group: `app/(landing)/`

| Page | Path |
|---|---|
| Home | `/` |
| About | `/about` |
| Courses | `/courses` |
| Contact | `/contact` |
| Privacy / Terms | `/privacy`, `/terms` |
| System design (internal) | `/system-design` |

## SEO — production-critical

Every page must export `metadata`:
```ts
export const metadata: Metadata = {
  title: "Page Title | Ruby HSK",
  description: "...",        // ≤ 160 chars
  openGraph: { ... },
  alternates: { canonical: "..." },
}
```

Root `app/layout.tsx` injects:
- JSON-LD Organization + Website schema (via `lib/structured-data.ts`)
- PWA manifest, Open Graph, Twitter Card, Google verification

**Never** add `dangerouslySetInnerHTML` for JSON-LD outside `app/layout.tsx`.  
Update `lib/structured-data.ts` if organization details change.

## CMS content flow

Landing content is stored in Prisma and managed by SYSTEM_ADMIN via portal:

| Content | Admin module | Prisma model |
|---|---|---|
| Hero slides | `/portal/admin/hero-slides` | `HeroSlide` |
| Features | `/portal/admin/features` | `Feature` |
| CTA stats | `/portal/admin/cta-stats` | `CtaStat` |
| Reviews | `/portal/admin/reviews` | `Review` |
| HSK levels | `/portal/admin/hsk-levels` | `HSKLevel` |
| Albums | `/portal/admin/albums` | `Album` |
| Courses (public) | `/portal/admin/courses` | `Course` |

**Pattern:** fetch in Server Component → pass to Client Component for display. No client-side fetching on landing pages.

## Adding a new landing section

1. Create `services/portal/<section>.service.ts` with a read-only query
2. Fetch in the landing page Server Component (`app/(landing)/page.tsx` or a sub-page)
3. Build display component in `components/landing/<section>/`
4. Create admin CMS page `app/(portal)/portal/[role]/<section>/page.tsx` (SYSTEM_ADMIN only)
5. Add nav item in `constants/portal/navigation.ts` under `adminNavItems`

## Performance

- All landing pages must be server-rendered (no `"use client"` at page level)
- Images: `next/image` with `sizes` prop for responsive images
- Sitemap: `app/sitemap.ts` — update if new routes are added
- Robots: `app/robots.ts`
