# Ruby HSK — Homepage Database & CMS Audit

**Date:** 2026-06-24

---

## CMS Models Used on Landing Pages

| Prisma Model | Admin route | Landing consumer | Fields used |
|---|---|---|---|
| `HeroSlide` | `/portal/admin/hero-slides` | `HeroSlideShowClient` | title, subtitle, image, ctaText, ctaLink, order, isActive |
| `Feature` | `/portal/admin/features` | `FeaturesSection` | title, description, icon, order |
| `Review` | `/portal/admin/reviews` | `ReviewSection` | reviewer, role, content, rating, avatar, isApproved |
| `CtaStat` | `/portal/admin/cta-stats` | `CTASectionClient` | label, value, icon |
| `PageMetadata` | `/portal/admin/page-metadata` | `generateMetadata()` on all pages | pagePath, title, description, ogImage, isActive |
| `Course` | `/portal/admin/courses` | `CoursesSectionClient`, `/courses/[slug]` | full model |
| `HSKLevel` | `/portal/admin/hsk-levels` | course display | level, title |
| `Category` | `/portal/admin/categories` | course filter | name, slug |
| `Album` + `Photo` | `/portal/admin/albums` | `TeamSection` gallery | title, imageUrl, order |

---

## Query Patterns

### Homepage (`app/(landing)/page.tsx`)
Single `Promise.all` fetching all section data in parallel:
```ts
const [slides, courses, features, reviews, stats, albums] = await Promise.all([
  getHeroSlides(),
  getCourses(),
  getFeatures(),
  getApprovedReviews(),
  getCtaStats(),
  getAlbums(),
])
```

### Courses page (`app/(landing)/courses/page.tsx`)
```ts
const [{ items: courses, total: totalCount }, categories] = await Promise.all([
  getFilteredCoursesWithCount(filters),   // single $transaction round-trip
  getCategories(),
])
```

---

## Critical Bugs Fixed

### P0-1: `getPageMetadata` always returning null

**Root cause:** `prisma.pageMetadata.findUnique({ where: { pagePath, isActive: true } })` — Prisma 5 `findUnique` only accepts `@unique`-constrained fields in `where`. `isActive` is not in the unique constraint, causing a Prisma client error swallowed by try/catch.

**Fix:** `findUnique` → `findFirst` in `services/metadata.service.ts`.

**Verification:** Set custom title for `/` in admin PageMetadata → visit homepage → `<title>` should reflect CMS value.

---

## Performance: Double Query Fixed

**Before:** `app/(landing)/courses/page.tsx` called `getFilteredCourses()` twice — once with pagination for display, once without for total count.

**Fix:** New `getFilteredCoursesWithCount()` in `services/course.service.ts` uses `prisma.$transaction([findMany, count])` for a single DB round-trip.

---

## Stats Consistency

Three sections previously showed different hardcoded numbers. Now unified:

| Section | Source |
|---|---|
| `AboutHero` stats bar | `SCHOOL_STATS` from `constants/landing/school-stats.ts` |
| `CTASectionClient` fallback | `SCHOOL_STATS` (used only when DB `CtaStat` returns empty) |
| `TeacherProfile` stats | `TEACHER_STATS` from `constants/landing/teacher-profile.ts` (teacher-specific) |
| Primary stats source | `CtaStat` Prisma model (CMS-managed, fetched at build/ISR time) |

---

## Contact Info Consistency

Footer contact details sourced from `CONTACT_INFO` in `constants/brand.ts`. Update there to propagate to Footer without a component edit.

---

## P3-3: Verify `revalidatePath` in Admin Actions

After any admin mutation to these models, the corresponding landing ISR cache must be purged:

| Model mutated | `revalidatePath` needed |
|---|---|
| `HeroSlide` | `/` |
| `Feature` | `/` |
| `Review` | `/` |
| `CtaStat` | `/` |
| `Course` | `/`, `/courses`, `/courses/[slug]` |
| `PageMetadata` | the `pagePath` value stored |
| `Album` / `Photo` | `/` |

Check each Server Action in `actions/` to confirm these calls exist.
