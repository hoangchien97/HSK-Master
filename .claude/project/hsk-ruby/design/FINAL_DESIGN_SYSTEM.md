# Ruby HSK — Final Design System
**Version:** 1.0
**Date:** 2026-06-22
**Supersedes:** `DESIGN_SYSTEM_DIRECTION.md`, `UI_MIGRATION_PLAN.md` (planning sections)
**Status:** Active — source of truth for all UI work

---

## 1. Design Philosophy

Ruby HSK is a premium Vietnamese Chinese-learning school in Hanoi. The UI must communicate three things simultaneously:

- **Cultural authority** — Chinese education carries centuries of discipline and precision; the product must feel deliberate, not generic
- **Warmth and energy** — Vietnamese learners need encouragement; the brand must feel inviting, human, and alive
- **Trust** — this is a school, not a startup; credibility comes from clarity, consistency, and restraint

### Two visual registers

| Surface | Mood | Key elements |
|---|---|---|
| **Landing** | Warm, aspirational, culturally textured | Noto Serif headings, red/gold gradient, 田字格 pattern, brush-stroke accent |
| **Portal** | Clean, focused, data-friendly | Paper-white bg, structured tables, vermillion as primary action only |

### Anti-patterns to avoid
- Generic SaaS dashboard look: flat gray cards, blue primary, `rounded-2xl` everything
- Over-animation: every card bouncing, every heading fading in — animate one thing per section
- Dark backgrounds on landing sections — landing stays light; color is used as **accent**, not fill
- Hardcoded hex in `className` — always reference tokens via `var(--color-*)` or Tailwind utility names

---

## 2. Color System

### 2a. Core design tokens (Phase UI-1 — `app/globals.css @theme inline`)

These 7 tokens are the primary vocabulary for all new components. They live in `app/globals.css` and are automatically available as Tailwind utilities (`bg-vermillion`, `text-muted`, etc.).

| Token | CSS Variable | Hex | Role |
|---|---|---|---|
| `vermillion` | `--color-vermillion` | `#e31b1e` | Primary CTA, active nav, focus rings, error states |
| `vermillion-hover` | `--color-vermillion-hover` | `#c91018` | Hover/press state for vermillion elements |
| `gold` | `--color-gold` | `#f0b429` | Achievement badges, gradient endpoint, HSK level accents |
| `ink` | `--color-ink` | `#1c0e0f` | Near-black headings + primary text — warm, not cool |
| `paper` | `--color-paper` | `#faf8f5` | Page background (warm white) |
| `surface` | `--color-surface` | `#ffffff` | Card surfaces, modal panels |
| `smoke` | `--color-smoke` | `#ede9e5` | Borders, dividers, subtle backgrounds |
| `muted` | `--color-muted` | `#6b5558` | Secondary text, labels, placeholder — warm gray-red |

### 2b. Extended palette (existing tokens — unchanged)

These tokens power the legacy HeroUI portal code. Do not remove or rename them.

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#ec131e` | HeroUI primary — existing portal code |
| `--color-accent-400` | `#facc15` | HeroUI accent — badge/chip defaults |
| `--color-background-light` | `#f8f6f6` | Legacy portal background |
| `--color-surface-light` | `#ffffff` | Legacy card surface |
| `--color-chinese-jade` | `#00a86b` | Success, correct answers, streaks |
| `--color-chinese-gold` | `#ffd700` | Achievement, premium indicators |
| `--gradient-brand` | yellow → red | Hero headings, CTA gradient |

### 2c. HSK level colors

One color per level — progression from fresh/approachable (HSK 1) to mastery/brand (HSK 6).

| Level | Name | Hex | Token | Tailwind |
|---|---|---|---|---|
| HSK 1 | Fresh Green | `#16a34a` | `--color-hsk-1` | `text-hsk-1`, `bg-hsk-1` |
| HSK 2 | Teal | `#0891b2` | `--color-hsk-2` | `text-hsk-2`, `bg-hsk-2` |
| HSK 3 | Blue | `#2563eb` | `--color-hsk-3` | `text-hsk-3`, `bg-hsk-3` |
| HSK 4 | Violet | `#7c3aed` | `--color-hsk-4` | `text-hsk-4`, `bg-hsk-4` |
| HSK 5 | Amber | `#d97706` | `--color-hsk-5` | `text-hsk-5`, `bg-hsk-5` |
| HSK 6 | Vermillion | `#e31b1e` | `--color-hsk-6` | `text-hsk-6`, `bg-hsk-6` |

**Add to `globals.css @theme inline` and `tailwind.config.js theme.extend.colors` in Phase UI-3.**

Usage pattern:
```tsx
// Level badge
<Badge className="bg-[var(--color-hsk-1)]/10 text-[var(--color-hsk-1)]">HSK 1</Badge>

// Level indicator dot
<span className="w-2 h-2 rounded-full bg-hsk-3" />
```

### 2d. Semantic usage rules

| Color | Allowed uses | Forbidden |
|---|---|---|
| `vermillion` | Primary buttons, active nav indicator, focus rings, form error borders, required asterisks | Body text, background fills, decorative borders, success states |
| `gold` | Achievement icons, HSK badge endpoints, gradient endpoint | Primary action buttons, error states, body text |
| `ink` | H1–H3 headings, table cell primary text, strong labels | Small captions, muted metadata, anything where `muted` is more appropriate |
| `muted` | Form labels, timestamps, secondary nav, placeholder text, table header text | Headings, CTA copy, any text that carries primary meaning |
| `smoke` | Card borders, table row dividers, input borders at rest, subtle section backgrounds | Text of any kind |
| `paper` | Page backgrounds, alternate section fills, sidebar backgrounds | Modal/drawer panels (use `surface`) |

---

## 3. Typography

### 3a. Font loading (`app/layout.tsx`)

| CSS Variable | Family | Subsets | Weights | Role |
|---|---|---|---|---|
| `--font-noto-sans` | Noto Sans | latin, vietnamese | 400, 500, 700 | Body, UI labels, all portal text |
| `--font-noto-serif` | Noto Serif | latin, vietnamese | 400, 500, 600, 700 | Landing display headings only |
| `--font-geist-sans` | Geist | latin | variable | Optional mono / code display |

**Chinese font stack** (applied via `--font-chinese` CSS variable):
```
Noto Sans → Microsoft YaHei → PingFang SC → SimHei → sans-serif
```
Apply `lang="zh"` on every element that renders Chinese characters. This is required for correct screen-reader pronunciation and OS-level Chinese font rendering.

### 3b. Type scale

| Level | Size | Weight | Font | Context |
|---|---|---|---|---|
| Display | 3.5rem / 56px | 700 | Noto Serif | Hero titles — landing only |
| H1 | 2.25rem / 36px | 700 | Noto Serif | Section headings — landing |
| H2 | 1.75rem / 28px | 600 | Noto Sans | Module headings — portal + landing |
| H3 | 1.25rem / 20px | 600 | Noto Sans | Card titles, portal section headers |
| Body | 1rem / 16px | 400 | Noto Sans | Default content |
| Small | 0.875rem / 14px | 400 | Noto Sans | Form labels, meta text, hints |
| Caption | 0.75rem / 12px | 400 | Noto Sans | Timestamps, footnotes, badge text |
| Chinese char | 1.5–3rem | — | `--font-chinese` | Practice module, vocabulary display |
| Pinyin | 0.75rem / 12px | 400 | Noto Sans | Below Chinese chars — add `tracking-wide` |

### 3c. Gradient text rule
`gradient-text` class (animated red → gold): **use on Display and H1 levels only**. Maximum 2 instances per page. Never on H2 or below.

### 3d. Noto Serif on landing
Apply `font-serif` (the Tailwind utility for `--font-serif` token) to landing `h1` and `h2` elements. Portal uses only Noto Sans — Noto Serif is a landing-only design decision.

---

## 4. Spacing & Layout

### 4a. Landing layout constants
```
Content max-width:    max-w-7xl mx-auto
Horizontal padding:   px-4 sm:px-6 lg:px-8
Section vertical:     py-16 lg:py-24
Between cards:        gap-6
Between form fields:  gap-4
Inline items:         gap-2
```

### 4b. Portal layout constants
```
Sidebar width:        256px fixed (lg+), slide-over on mobile — do NOT change
Header height:        64px sticky
Content padding:      p-6
Card grid gap:        gap-4 or gap-6
Form field gap:       gap-4 (standard), gap-3 (compact)
Table row height:     48px (comfortable), 40px (dense)
```

### 4c. Card elevation system

| Level | Shadow | Usage |
|---|---|---|
| 0 — Flat | `none` | Table row hover, subtle containers, inside cards |
| 1 — Default | `0 1px 3px rgba(28,14,15,0.08)` | Cards, stat boxes, form panels |
| 2 — Raised | `shadow-md` | Action cards, highlighted sections |
| 3 — Floating | `shadow-xl` | Modals, drawers, dropdown menus, chatbot bubble |

### 4d. Geometry rules

```
Inputs:      rounded-sm  (2px)   — precision, exam-form quality
Buttons:     rounded-md  (6px)   — approachable but firm
Cards:       rounded-xl  (12px)  — spacious containers
Modals:      rounded-xl  (12px)
Badges:      rounded-full        — compact status labels
Avatars:     rounded-full
```

---

## 5. Component System

### 5a. Import hierarchy

```
New code → always import from @/components/ui
  import { Button, Input, Badge, Modal } from "@/components/ui"

Existing portal code → HeroUI direct (do not refactor until Phase UI-4)
  import { Table, Chip, Avatar } from "@heroui/react"

Landing code → components/landing/common/ (do not refactor until Phase UI-3)
```

### 5b. `components/ui/` inventory (Phase UI-2 — complete)

**Primitives** (`components/ui/primitives/`):
`Button`, `Badge`, `Avatar`, `Card` (+`CardHeader`, `CardBody`, `CardFooter`), `Divider`, `Spinner`, `Skeleton` (+`SkeletonText`), `Progress`

**Forms** (`components/ui/forms/`):
`Label`, `Input`, `Textarea`, `Select` (headlessui Listbox), `Checkbox`, `Radio`, `Switch` (headlessui), `FormField` (RHF Controller wrapper)

**Overlays** (`components/ui/overlays/`):
`Modal` (headlessui Dialog), `Drawer` (vaul), `Dropdown` (headlessui Menu), `Tooltip`

**Navigation** (`components/ui/navigation/`):
`Tabs` (headlessui TabGroup), `Accordion` (headlessui Disclosure), `Breadcrumb`, `Pagination`

**Data** (`components/ui/data/`):
`Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableFooter`

**Barrel:** `components/ui/index.ts` — exports everything

### 5c. Component specifications

#### Button
| Variant | When to use |
|---|---|
| `primary` | Main CTAs, form submit, primary action |
| `secondary` | Alternative actions, outline style |
| `ghost` | Table row actions, cancel buttons, nav items |
| `danger` | Destructive confirms (delete, deactivate) |

Sizes: `sm` (h-8), `md` (h-10, default), `lg` (h-12)
Loading: passes `isLoading` — renders `Spinner` inline, disables interaction

#### Badge / Status labels
| Variant | Use case |
|---|---|
| `primary` (vermillion) | Featured, active, pinned |
| `success` (green) | Correct answer, active enrollment, completed |
| `warning` (amber) | Pending, in-progress, draft |
| `danger` (red) | Error, rejected, overdue, failed |
| `info` (blue) | Informational, neutral status |
| `default` (smoke) | Inactive, archived |

**Role badge mapping:**
- `SYSTEM_ADMIN` → `primary`
- `TEACHER` → `info`
- `STUDENT` → `default`

**HSK level badge:**
```tsx
<Badge className={`bg-[var(--color-hsk-${level})]/10 text-[var(--color-hsk-${level})]`}>
  HSK {level}
</Badge>
```

#### Input / Form fields
- Border: `smoke` at rest → `vermillion` ring on focus (1px)
- Error state: `red-500` border + error message below field (not toast)
- Password: Eye/EyeOff toggle built-in
- All new forms: **React Hook Form + Zod** — no new `useState` forms

#### Card variants
| Variant | Background | Use |
|---|---|---|
| `default` | `surface` (#fff) + smoke border + shadow-[level-1] | Standard portal cards, stat boxes |
| `paper` | `paper` (#faf8f5) + smoke border | Content sections, landing cards |
| `ghost` | transparent | Nested containers, inside modals |

#### Table (data display)
- Header: `paper` bg, uppercase xs `muted` text
- Rows: hover → `paper`, divided by `smoke`
- Actions column: `ghost` icon buttons aligned right
- Empty state: `EmptyState` component — never a blank table

#### Modal / Drawer
- Backdrop: `black/40` + `blur-sm`
- Panel: `surface` bg, `rounded-xl`, `shadow-xl`
- Always has close button top-right
- Modal sizes: `sm` / `md` / `lg` / `xl` / `full`
- Drawer sides: `right` (default) / `left` / `bottom`

#### Spinner vs Skeleton
| State | Component | When |
|---|---|---|
| Button loading | `Spinner` size `sm` | Async action in progress |
| Section loading | `Skeleton` / `SkeletonText` | Content not yet arrived |
| Full page loading | `Skeleton` shapes matching layout | Portal module `loading.tsx` |
| Never | Full-page Spinner | Avoid — no layout context |

### 5d. Portal components NOT to migrate yet (Phase UI-4)

| Component | Risk | Reason |
|---|---|---|
| `CTable.tsx` | HIGH | 331 lines, 8 HeroUI imports, 12+ consumers |
| `CModal.tsx` | Medium | 10+ consumers |
| `CDrawer.tsx` | Medium | 8+ consumers |
| `BigCalendarView.tsx` | HIGH | `react-big-calendar` CSS dependency |
| Practice module tabs | HIGH | `hanzi-writer`, Web Speech API |
| `PortalSidebar.tsx` | HIGH | Layout-critical, 3-role navigation |
| `PortalHeader.tsx` | HIGH | Layout-critical |
| `LoginForm.tsx` | HIGH | Auth-critical |
| `RegisterForm.tsx` | HIGH | Auth-critical |

### 5e. Phase UI-4 migration priority (when ready)

1. `CSpinner` → `ui/primitives/Spinner` (trivial — 1 HeroUI dep)
2. `RoleBadge` → `ui/primitives/Badge` (trivial — 1 HeroUI Chip)
3. `FormInput` → `ui/forms/Input` (low risk)
4. `EmptyState` → pure Tailwind (likely no HeroUI)
5. `StatCard` → `ui/primitives/Card` (low risk)
6. `PageHeader` → pure Tailwind (layout only)
7. `CModal` → `ui/overlays/Modal` (medium — 10+ consumers)
8. `CDrawer` → `ui/overlays/Drawer` (medium)
9. `CTable` → `ui/data/Table` (last — highest risk)

---

## 6. Homepage UI Direction

### 6a. Recommended section order

| # | Section | Data source | Priority |
|---|---|---|---|
| 1 | Hero + inline consultation form | `HeroSlide` CMS | P1 |
| 2 | Trust stats bar | `CtaStat` CMS | existing |
| 3 | HSK Learning Path (HSK 1→6) | `HSKLevel` + `Course` | P2 |
| 4 | Course catalog preview | `Course` CMS | existing |
| 5 | Teacher team | `Album`/`Photo` or static | P2 |
| 6 | Reviews / testimonials | `Review` CMS | existing |
| 7 | Vocabulary preview (3 HSK 1 cards) | `Vocabulary` | P2 |
| 8 | FAQ accordion | static copy | P2 |
| 9 | Final CTA + registration form | `Registration` model | P1 |

### 6b. Hero section design

**Desktop:** two-column — left 60% has display heading + subtext + stats, right 40% has inline consultation form card

**Mobile:** stacked — heading → form

- Heading: Noto Serif 700, `gradient-text`, Vietnamese copy
- Background: white + Chinese character `学` watermark (large, `ink` at 6% opacity)
- Form card: 3 fields (name, phone, level select) + "Đăng ký tư vấn" CTA
- Secondary link: "Xem khoá học" ghost button

### 6c. 田字格 application

| Context | How |
|---|---|
| Practice write module | `.tian-zi-ge` CSS class — full grid background |
| Landing section dividers | `.tian-zi-ge` at `opacity-10` on `paper`-bg sections |
| Decorative accent | SVG brush stroke between major landing sections |

### 6d. Landing typography rules
- H1/H2 on landing → Noto Serif: `font-serif font-bold`
- Section labels (small ALL CAPS above heading) → Noto Sans, `text-sm tracking-widest text-muted uppercase`
- Body copy → Noto Sans 400 `text-ink`
- `gradient-text` → hero Display heading only

---

## 7. Portal UI Direction

### 7a. Sidebar (do not change structure)
Current 256px sidebar is correct. Pending improvements (Phase UI-4):
- Add "AI Trợ lý" nav item for all 3 roles (currently undiscoverable — R19)
- Group admin CMS items under a collapsible "CMS" disclosure section

### 7b. Admin dashboard redesign (Phase UI-4)
**Current:** CMS quick links + content counts — too sparse

**Target layout:**
```
Top row:     4 action cards (Add User, Add Course, View Registrations, Export)
Left 2/3:    Activity feed (recent registrations, new enrollments, today's classes)
Right 1/3:   StatCards (total students, pending registrations, classes today)
```

### 7c. Student dashboard improvement
"Continue Learning" card should be the dominant visual element — larger, vermillion border accent, above the fold. This is the product's core value.

### 7d. Form error pattern (enforce everywhere)
```
[Field label]
[Input — smoke border → vermillion on focus → red-500 on error]
[Error message — text-red-600 text-xs mt-1 — always below input]
```

**Never use toast for field-level validation errors.** Toasts = async operation results (save succeeded, delete failed).

### 7e. Loading states (per-module `loading.tsx`)
Each portal module page needs a `loading.tsx` matching the content shape:

```tsx
// Table page example
export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48 rounded-md" />
      <Skeleton className="h-12 w-full rounded-sm" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
```

---

## 8. Animation System

### 8a. Motion principles
Animate to **communicate state change**, not to decorate. Maximum one entrance animation per page section.

| Animation | Class | Context |
|---|---|---|
| Section entrance | `animate-fade-in-up` | Landing scroll-trigger (one per section) |
| Card hover lift | `hover-lift` | Interactive card grid on landing |
| Gradient text shimmer | `gradient-text` | Brand headings (Display/H1 max) |
| Button shimmer on CTA | `shimmer-effect` | Primary CTA hover — landing |
| Flashcard 3D flip | `perspective-1000 preserve-3d` | Practice module only |
| Spinner | `animate-spin` | Async loading in button / inline |
| Shimmer skeleton | `animate-shimmer` | Content loading placeholders |
| Modal entrance | headlessui `Transition` | `scale-95 → scale-100 + opacity` |

### 8b. Framer Motion scope (landing only)
- `AnimatedSection.tsx` — scroll-triggered entrance on landing
- `HeroSlideShowClient.tsx` — hero slide transitions
- Check `useReducedMotion()` from `framer-motion` and skip all animations when true

### 8c. prefers-reduced-motion (Phase UI-1 — complete)
Global guard is in `app/globals.css`. All new animations are covered. No additional work needed.

---

## 9. UI Library Strategy

### 9a. Confirmed direction: replace HeroUI with pure Tailwind + headlessui

| Library | Status | Plan |
|---|---|---|
| `@heroui/react` | 77 portal files — untouched | Remove in Phase UI-6 after all 77 files migrated |
| `@headlessui/react` | 26 `components/ui/` files | Primary interactive primitive — expand |
| `vaul` | `Drawer.tsx` | Keep |
| `framer-motion` | 5 landing files | Keep, no new usage |
| `react-toastify` | Async op feedback portal-wide | Keep for now; custom in Phase UI-4 |
| `lucide-react` | Icons everywhere | Keep |
| `embla-carousel` | Hero slideshow + reviews | Keep |
| `react-big-calendar` | Teacher schedule | Keep |
| `hanzi-writer` | Stroke animation (irreplaceable) | Keep |
| `@radix-ui/react-tooltip` | 3 files only | Remove after Tooltip migrated |
| `react-hook-form` + `zod` | Installed, not yet deployed | Required for all new forms |
| `ExcelJS` | Attendance export | Keep |

### 9b. Never add a new library without removing an equivalent
The current dep list already has unnecessary duplication (`date-fns` + `dayjs`). New UI libraries require explicit approval.

---

## 10. Tailwind Configuration

### 10a. Current state (do not break)

`tailwind.config.js`:
```js
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./constants/**/*.{js,ts,jsx,tsx}",
  "./enums/**/*.{js,ts,jsx,tsx}",
  "./providers/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
]
```

### 10b. Pending addition (Phase UI-3)

Add to `tailwind.config.js` `theme.extend.colors`:
```js
colors: {
  'hsk-1': '#16a34a',
  'hsk-2': '#0891b2',
  'hsk-3': '#2563eb',
  'hsk-4': '#7c3aed',
  'hsk-5': '#d97706',
  'hsk-6': '#e31b1e',
}
```

Add to `app/globals.css @theme inline {}`:
```css
--color-hsk-1: #16a34a;
--color-hsk-2: #0891b2;
--color-hsk-3: #2563eb;
--color-hsk-4: #7c3aed;
--color-hsk-5: #d97706;
--color-hsk-6: #e31b1e;
```

### 10c. Token discipline
```tsx
// ✅ correct — CSS variable reference
className="bg-[var(--color-vermillion)] text-white"

// ✅ correct — after Phase UI-3 tailwind extension
className="text-hsk-1 bg-hsk-1/10"

// ❌ wrong — hardcoded hex
className="bg-[#e31b1e]"

// ❌ wrong — arbitrary value for named token
className="text-[#6b5558]"
```

---

## 11. Accessibility Standards

| Standard | Status | Required action |
|---|---|---|
| `prefers-reduced-motion` | ✅ Done (Phase UI-1) | Guard all new animated components |
| Noto Serif loaded | ✅ Done (Phase UI-1) | Apply on landing H1/H2 |
| `lang="zh"` on Chinese text | ❌ Inconsistent | Phase UI-3+4: audit vocabulary/lesson/practice components |
| Skip-to-content link | ❌ Missing | Phase UI-4: add to `PortalLayoutClient.tsx` |
| Inline form errors | ❌ Portal forms | Phase UI-4 form migrations |
| Focus rings | ✅ headlessui handles it | Verify custom landing components |
| Image alt text | To verify | Phase UI-3 audit |
| Color contrast | ✅ Compliant for current usage | `vermillion` on white: large text only |

---

## 12. Phase Completion Checklist

| Phase | Status | Scope |
|---|---|---|
| **UI-1** Design tokens | ✅ Complete | `globals.css` tokens, `prefers-reduced-motion`, `.tian-zi-ge`, Noto Serif loaded |
| **UI-2** Core components | ✅ Complete | 26 components in `components/ui/` — all groups |
| **UI-3** Homepage rebuild | 🔲 Next | Landing pages: Noto Serif, 田字格 dividers, inline lead form, HSK level colors |
| **UI-4** Portal rebuild | 🔲 | Portal/common wrappers first → admin modules → teacher/student |
| **UI-6** Remove HeroUI | 🔲 Last | After all 77 portal files migrated and verified |

### Acceptance criteria — design system is stable when:
- [x] `tailwind.config.js` content array covers all source paths
- [x] `prefers-reduced-motion` guard in `globals.css`
- [x] `LanguageSwitcher` export removed
- [x] 26 `components/ui/` components built
- [ ] HSK level color tokens in `globals.css` and `tailwind.config.js`
- [ ] Every portal module has `loading.tsx` and `error.tsx`
- [ ] All Chinese character elements have `lang="zh"`
- [ ] Skip-to-content link in portal layout
- [ ] All form validation errors appear inline below input (not toasts)
- [ ] `gradient-text` used on ≤2 headings per page
- [ ] No hex colors hardcoded in `className` strings
- [ ] Landing H1/H2 use Noto Serif
- [ ] HSK level badge color system implemented in practice + course modules

---

## 13. Open Questions

| Question | Impact | When to resolve |
|---|---|---|
| Does `AnimatedSection.tsx` check `useReducedMotion()`? | Accessibility | Phase UI-3 — read the file before touching landing |
| Does `CountUp.tsx` respect `prefers-reduced-motion`? | Accessibility | Phase UI-3 |
| Does `BaseModal` in landing/common handle focus trapping? | Accessibility | Phase UI-3 migration |
| Which Supabase project URL is active (R07)? | Storage/Realtime reliability | Before any storage changes |
| Is Axios used in AI chat service or calendar sync? | Dep cleanup | Phase UI-6 cleanup |
| Are admin data tables horizontally scrollable on mobile? | Mobile UX | Phase UI-4 CTable migration |
| `date-fns` vs `dayjs` — consolidate to one? | Dep hygiene | Phase UI-6 |
