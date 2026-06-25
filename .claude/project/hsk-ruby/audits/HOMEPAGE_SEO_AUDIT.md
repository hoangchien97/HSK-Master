# Ruby HSK — Homepage SEO Audit

**Date:** 2026-06-24

---

## Per-Route Metadata Status

| Route | `generateMetadata` | CMS via `getPageMetadata` | Canonical | OG Image | Twitter Card |
|---|---|---|---|---|---|
| `/` | ✅ | ✅ (pagePath="/") | ✅ global | ✅ `OG_IMAGE` | ✅ |
| `/about` | ✅ | ✅ (pagePath="/about") | ✅ | ✅ | ✅ |
| `/courses` | ✅ | ✅ (pagePath="/courses") | ✅ | ✅ | ✅ |
| `/courses/[slug]` | ✅ | ✅ per slug | ✅ | ✅ course image | ✅ |
| `/contact` | ✅ | ✅ (pagePath="/contact") | ✅ | ✅ | ✅ |
| `/privacy` | ❓ | ❓ | ❓ | ❓ | ❓ |
| `/terms` | ❓ | ❓ | ❓ | ❓ | ❓ |

---

## Structured Data (JSON-LD)

| Schema type | Location | Status |
|---|---|---|
| `Organization` | `app/layout.tsx` (global) | ✅ present |
| `WebSite` | `app/layout.tsx` (global) | ✅ present |
| `FAQPage` | `app/(landing)/page.tsx` | ✅ present |
| `BreadcrumbList` | courses, course detail | ✅ present |
| `Course` | `/courses/[slug]` | ✅ verify schema.org/Course fields |

---

## Robots & Sitemap

| Item | Status | Notes |
|---|---|---|
| `app/robots.ts` | ✅ | Correct `User-agent: *`, `Allow: /`, `Disallow: /portal/` |
| `app/sitemap.ts` | ✅ | Includes `/`, `/about`, `/courses`, `/contact`, `/privacy`, `/terms` + dynamic course slugs |
| Course `isPublished` filter in `generateStaticParams` | ✅ Fixed | Was missing before audit |
| Draft courses excluded from sitemap | ✅ | `getPublishedCourseSlugs` uses `isPublished: true` |

---

## `getPageMetadata` Bug — Fixed

**Bug (P0-1):** `prisma.pageMetadata.findUnique({ where: { pagePath, isActive: true } })` — Prisma 5 rejects `isActive` in `findUnique` where clause (not part of `@unique` constraint). Error swallowed by try/catch → always returned `null`.

**Fix applied:** `findUnique` → `findFirst` in `services/metadata.service.ts:33`.

**Impact:** CMS-managed page titles/descriptions now work for all 5 routes.

---

## Font Performance

| Font | `display` | Status |
|---|---|---|
| `Geist` | `swap` | ✅ Fixed (was missing) |
| `Inter` | `swap` | ✅ |
| `Noto_Sans_SC` | `swap` | ✅ |
| `Noto_Sans` | `swap` | ✅ |
| `Noto_Serif` | `swap` | ✅ |

---

## Social Links

`SOCIAL_LINKS` in `constants/brand.ts` — all values are empty strings → social icons hidden in Footer. Fill with real URLs when accounts are created.
