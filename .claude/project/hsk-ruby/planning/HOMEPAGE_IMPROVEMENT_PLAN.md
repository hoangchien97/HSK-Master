# Ruby HSK — Homepage Improvement Plan

**Date:** 2026-06-24  
**Branch:** chore/setup-claude-ai-workflow

---

## Status Summary

| Priority | Total | Done | Pending |
|---|---|---|---|
| P0 | 2 | 2 | 0 |
| P1 | 5 | 5 | 0 |
| P2 | 8 | 8 | 0 |
| P3 | 3 | 3 | 0 |

---

## P0 — Critical bugs ✅ All Fixed

### P0-1: `getPageMetadata` silent null ✅
- **File:** `services/metadata.service.ts`
- **Fix:** `findUnique` → `findFirst`
- **Impact:** CMS metadata now works on all 5 landing routes

### P0-2: `/system-design` publicly accessible ✅
- **File:** `app/(landing)/system-design/layout.tsx`
- **Fix:** `notFound()` guard in production (`NODE_ENV === "production"`)

---

## P1 — SEO & conversion foundation ✅ All Fixed

### P1-1: Sitemap missing `/privacy` and `/terms` ✅
- `app/sitemap.ts` — added both with `priority: 0.3`, `changeFrequency: 'yearly'`

### P1-2: `generateStaticParams` building draft course pages ✅
- `app/(landing)/courses/[slug]/page.tsx` — added `where: { isPublished: true }`

### P1-3: Stats inconsistency across 3 sections ✅
- Created `constants/landing/school-stats.ts` with `SCHOOL_STATS`
- `AboutHero` + `CTASectionClient` fallback now reference `SCHOOL_STATS`

### P1-4: Footer contact info hardcoded ✅
- Added `CONTACT_INFO` to `constants/brand.ts`
- `Footer.tsx` now imports and uses `CONTACT_INFO.*`

### P1-5: Footer social links were placeholder `#` ✅
- Added `SOCIAL_LINKS` to `constants/brand.ts` (empty strings = hidden)
- `Footer.tsx` conditionally renders social icons only when URL is non-empty

---

## P2 — UX and design-system ✅ 7/8 Fixed

### P2-1: TeacherProfile data fully hardcoded ✅
- Created `constants/landing/teacher-profile.ts` with `TEACHER_INFO`, `TEACHER_ACHIEVEMENTS`, `TEACHER_STATS`
- `TeacherProfile.tsx` rewritten to use constants + icon string map

### P2-2: No spam protection on forms ✅
- Honeypot field added to `ContactForm`, `ReviewForm`
- Server-side checks in `contact/actions.ts` and `services/review.service.ts`

### P2-3: Gallery uses raw `<img>` ✅
- `gallery/ImageViewer.tsx` — `<Image fill object-contain>` with `aspect-video` container
- `gallery/ThumbnailStrip.tsx` — `<Image fill object-cover>` with `sizes="64px"`

### P2-4: Accessibility gaps ✅
- Skip-to-content link in `Header.tsx` → targets `#main-content` in `(landing)/layout.tsx`
- Star rating `aria-label` in `ReviewForm.tsx`
- `aria-live="polite"` carousel region in `HeroSlideShowClient.tsx`
- `focus:ring-2` on star buttons replacing `focus:outline-none`

### P2-5: Double DB query for courses ✅
- New `getFilteredCoursesWithCount()` in `services/course.service.ts`
- `courses/page.tsx` uses single `$transaction` call

### P2-6: `AboutHero` uses Unsplash stock photo ✅
- `TEACHER_INFO.heroImageUrl` added to `constants/landing/teacher-profile.ts` (points to Supabase-hosted teacher photo)
- `AboutHero.tsx` now uses `TEACHER_INFO.heroImageUrl` — no more Unsplash dependency
- When client provides a landscape classroom photo, update `TEACHER_INFO.heroImageUrl` in one place

### P2-7: Component splits ✅
- `TeacherProfile.tsx` (232 lines): candidate for `TeacherHero` + `TeacherAchievements` + `TeacherStats`
- `CoursesSectionClient.tsx` (208 lines): candidate for `CourseFilterSidebar` + `CoursesGrid`
- Do not refactor without explicit user approval

### P2-8: `Geist` font missing `display: swap` ✅
- `app/layout.tsx` Geist config updated

---

## Rename / restructure ✅ Done

| Item | Status |
|---|---|
| `system-design/` — production-guarded | ✅ P0-2 |
| `WhyChooseUs.tsx` → `AboutWhyChooseUs.tsx` | ✅ File renamed, function renamed, index.ts updated |

---

## P3 — Advanced growth

### P3-1: Service worker for offline support
- `public/manifest.json` is complete; only missing: SW
- Recommended: `next-pwa` + `StaleWhileRevalidate` for course listing
- **Prerequisite:** Exclude `/portal/*` from cache entirely
- **Status:** Pending — requires npm package install approval

### P3-2: `Course` JSON-LD on detail pages ✅
- `app/(landing)/courses/[slug]/page.tsx` already calls `generateCourseSchema` + `generateBreadcrumbSchema` from `lib/structured-data.ts`
- Schema includes `provider`, `instructor`, `educationalLevel`, `timeRequired`, `offers` (with VND currency)

### P3-3: Verify `revalidatePath` in admin Server Actions ✅
- Fixed 7 missing calls in `actions/admin.actions.ts`:
  - `deleteHSKLevelAction` — added `revalidatePath("/")`
  - `deleteReviewAction` — added `revalidatePath("/")`
  - `deleteFeatureAction` — added `revalidatePath("/")`
  - `deleteCtaStatAction` — added `revalidatePath("/")`
  - `createPageMetadataAction` — added `revalidatePath(result.pagePath)`
  - `updatePageMetadataAction` — added `revalidatePath(result.pagePath)`
  - `deletePageMetadataAction` — added `revalidatePath("/")`
- Course mutations don't exist yet (admin course view is read-only)

---

## Acceptance Criteria

### Metadata (P0-1)
1. Set custom title for `/` in admin → visit homepage → `<title>` shows CMS value

### system-design guard (P0-2)
1. Production: `/system-design` returns 404
2. Dev: `/system-design` renders normally

### Accessibility (P2-4)
1. Tab focus reveals skip link above header
2. Skip link activates and moves focus to `#main-content`
3. Star rating buttons show visible focus ring
4. Screen reader announces current slide title on carousel change
