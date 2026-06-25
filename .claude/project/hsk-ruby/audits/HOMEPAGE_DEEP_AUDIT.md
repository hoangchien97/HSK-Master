# Ruby HSK — Landing / Homepage Deep Audit

**Date:** 2026-06-24  
**Branch:** chore/setup-claude-ai-workflow  
**Auditor:** Claude (automated)

---

## Route Inventory

| Route | File | Server/Client | Data Source | generateMetadata |
|---|---|---|---|---|
| `/` | `app/(landing)/page.tsx` | Server | HeroSlide, Course, Feature, Review, CtaStat, Album | ✅ via `getPageMetadata` |
| `/about` | `app/(landing)/about/page.tsx` | Server | Static (constants) | ✅ via `getPageMetadata` |
| `/courses` | `app/(landing)/courses/page.tsx` | Server | Course, Category | ✅ via `getPageMetadata` |
| `/courses/[slug]` | `app/(landing)/courses/[slug]/page.tsx` | Server | Course, HSKLevel, Lesson | ✅ via `getPageMetadata` |
| `/contact` | `app/(landing)/contact/page.tsx` | Server | Static | ✅ via `getPageMetadata` |
| `/privacy` | `app/(landing)/privacy/page.tsx` | Server | Static | ❓ not audited |
| `/terms` | `app/(landing)/terms/page.tsx` | Server | Static | ❓ not audited |
| `/system-design` | `app/(landing)/system-design/page.tsx` | Server | None | ❌ dev-only, production-guarded |

---

## Homepage Section Inventory (`app/(landing)/page.tsx`)

| Order | Component | Data | Client shell |
|---|---|---|---|
| 1 | `HeroSlideShowClient` | `HeroSlide[]` from DB | Yes (Embla carousel) |
| 2 | `CourseSectionClient` | `Course[]` from DB | Yes (filter/tabs) |
| 3 | `FeaturesSection` | `Feature[]` from DB | No |
| 4 | `ReviewSection` | `Review[]` from DB | Yes (ReviewForm + list) |
| 5 | `CTASectionClient` | `CtaStat[]` from DB + static | Yes (CountUp) |
| 6 | `TeamSection` | `Album[]` + `Photo[]` from DB | Yes (gallery/lightbox) |
| 7 | Footer | Static | No |

---

## About Page Section Inventory

| Component | File | Data |
|---|---|---|
| `AboutHero` | `about/AboutHero.tsx` | `SCHOOL_STATS` constants |
| `TeacherProfile` | `about/TeacherProfile.tsx` | `TEACHER_INFO`, `TEACHER_ACHIEVEMENTS`, `TEACHER_STATS` constants |
| `TeachingPhilosophy` | `about/TeachingPhilosophy.tsx` | Static |
| `AboutWhyChooseUs` | `about/AboutWhyChooseUs.tsx` | Static (3 reasons) |
| `Environment` | `about/Environment.tsx` | Static |

---

## Component Map — `components/landing/`

### `shared/`
- `Header.tsx` — skip-to-content link, navbar, mobile menu
- `Footer.tsx` — contact info from `CONTACT_INFO`, social from `SOCIAL_LINKS`
- `AnimatedSection.tsx` — scroll-triggered Framer Motion wrapper
- `MaterialIconsLoader.tsx` — async Google Material Icons loader
- `SectionHeader.tsx` — label + title + subtitle pattern

### `home/`
- `HeroSlideShowClient.tsx` — Embla carousel, aria-live region
- `HeroSlideContent.tsx` — individual slide renderer
- `CTASectionClient.tsx` — CountUp stats, `SCHOOL_STATS` fallback
- `ReviewSection.tsx` — review list + ReviewForm
- `ReviewForm.tsx` — RHF + Zod, honeypot protected
- `gallery/AlbumCard.tsx`, `gallery/GalleryGrid.tsx`, `gallery/ImageViewer.tsx`, `gallery/ThumbnailStrip.tsx`

### `about/`
- `AboutHero.tsx`, `AboutWhyChooseUs.tsx`, `Environment.tsx`
- `TeacherProfile.tsx`, `TeachingPhilosophy.tsx`

### `contact/`
- `ContactForm.tsx` — RHF + Zod, honeypot protected

### `courses/`
- `CourseCard.tsx`, `CoursesSectionClient.tsx`

---

## Data Flow

```
page.tsx (async Server Component)
  └─ prisma.model.findMany() via service (unstable_cache + revalidate)
       └─ Client shell receives serialized props
            └─ Client component renders interactive UI
```

Mutations (ContactForm, ReviewForm) flow:
```
Client form submit → Server Action (actions/*.actions.ts)
  └─ service (services/portal/*.service.ts)
       └─ prisma.model.create()
            └─ revalidatePath("/") — triggers ISR refresh
```
