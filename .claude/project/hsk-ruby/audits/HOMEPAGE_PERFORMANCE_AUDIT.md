# Ruby HSK — Homepage Performance Audit

**Date:** 2026-06-24

---

## Core Web Vitals Risk Assessment

| Metric | Risk | Root Cause | Status |
|---|---|---|---|
| LCP | Medium | Hero slide images — largest above-fold images; `priority` prop needed | Hero: first slide has `priority` via `HeroSlideContent`, verify |
| CLS | Low | Next.js `<Image>` with explicit dimensions; fonts use `display: swap` | ✅ |
| FID/INP | Low | Minimal JS hydration on server components | ✅ |
| TTFB | Low | ISR with `revalidate` at service layer; Vercel edge cache | ✅ |

---

## Image Optimization

| Component | Before | After | Status |
|---|---|---|---|
| `HeroSlideContent` | `<img>` or unknown | `<Image>` | ✅ verify |
| `ImageViewer` (gallery lightbox) | raw `<img>` | `<Image fill>` + `sizes="100vw"` | ✅ Fixed |
| `ThumbnailStrip` | raw `<img>` | `<Image fill>` + `sizes="64px"` | ✅ Fixed |
| `TeacherProfile` avatar | `<img>` | `<Image>` | verify |
| `CourseCard` | `<Image>` | `<Image>` | ✅ |
| `AboutHero` teacher photo | Unsplash stock URL | real photo needed | ⚠️ content gap |

---

## Bundle Analysis

### Fonts
- 5 Google fonts: Geist, Inter, Noto Sans SC, Noto Sans, Noto Serif — all self-hosted by Next.js
- All now use `display: swap` ✅
- Subsetting: most use `subsets: ["latin"]` or `["latin", "vietnamese"]` — Chinese subset not loaded on landing (good for perf)

### Third-party scripts
- `MaterialIconsLoader` — loads Google Material Icons via `<link rel="stylesheet">` asynchronously post-hydration (non-blocking) ✅
- `NextTopLoader` — lightweight progress bar, client-side only ✅
- No Google Analytics, no Tag Manager detected

### Client components that hydrate on landing
- `HeroSlideShowClient` — Embla carousel + Autoplay plugin
- `CTASectionClient` — CountUp.js
- `ReviewSection` + `ReviewForm` — RHF + Zod
- `TeamSection` + gallery components — lightbox

---

## ISR Cache Strategy

| Service | Cache key | `revalidate` | Tags |
|---|---|---|---|
| `getCourses` | `courses-list` | 3600s | `courses` |
| `getFilteredCoursesWithCount` | uncached | — | — |
| `getCourseBySlug` | `course-by-slug` | 3600s | `courses` |
| `getCoursesWithCategory` | `courses-with-category` | 3600s | `courses` |
| `getCategories` | `categories` | 3600s | `categories` |
| `getPageMetadata` | `page-metadata-${pagePath}` | verify | — |

### P3-3 Risk
Verify that admin portal Server Actions for HeroSlide, Feature, CtaStat, Review, Course, and PageMetadata all call `revalidatePath("/")` after mutations. Without this, ISR cache won't reflect admin changes until the revalidate timer expires.

---

## Quick Wins Remaining

1. Verify `priority` prop on hero slide first image (LCP element)
2. Replace Unsplash stock image in `AboutHero` with real teacher photo
3. Add `loading="lazy"` or confirm `<Image>` default lazy loading on below-fold gallery images
4. Consider `import dynamic from 'next/dynamic'` for `ReviewForm` (loaded only when user scrolls to reviews section)
