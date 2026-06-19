# UI/UX Pro Max Audit

**Date:** 2026-06-19
**Scope:** Visual direction, design system, component consistency, accessibility, responsiveness
**Source:** Inspection of `app/globals.css`, `tailwind.config.js`, `hero.ts`, `components/landing/`, `components/portal/`

---

## 1. Design Identity Assessment

**Brand intent:** Warm, energetic Vietnamese Chinese-learning brand.
- Primary: Imperial Red `#ec131e`
- Accent: Yellow `#facc15`
- Gradient: Yellow → Red (`--gradient-brand`)
- Chinese cultural palette: `chinese-red` (#dc143c), `chinese-gold` (#ffd700), `chinese-jade` (#00a86b)

**Assessment:** The visual direction is **correct for the domain**. Red + gold is culturally resonant with Chinese education. The gradient scroll bar (yellow→red) is a distinctive micro-detail. The brand does not feel generic.

**Risk:** Without discipline, the warm palette can tip into heavy/cluttered. The current implementation is clean. Maintain restraint on backgrounds — keep landing sections on white/light surfaces with color as accent only.

---

## 2. Two Component System Problem

This is the most significant structural UI issue found in the audit.

### Landing surface (`components/landing/common/`)
19 custom primitive components: Button, Input, Select, Textarea, Checkbox, Radio, Label, Switch, Tooltip, Badge, LoadingSpinner, OptimizedImage, Pagination, BaseModal, BaseDrawer

### Portal surface (HeroUI v2)
77 files use `@heroui/react`. HeroUI provides: Button, Input, Select, Table, Modal, Chip, Avatar, Dropdown, Form, etc.

### The problem
These two systems do not share component foundations. A `Button` on the landing page and a `Button` in the portal use different implementations, different classes, and potentially different visual defaults. If the brand red needs to change, it must be updated in two places.

### Impact
- Inconsistent interactive states (hover, focus, disabled) between landing and portal
- Forms look and behave differently
- No shared design token at the component level
- Future maintenance: every shared pattern must be updated twice

**Recommendation:** See `RUBY_HSK_DESIGN_SYSTEM_PROPOSAL.md` for the unification plan.

---

## 3. Color System Analysis

### Tokens (globals.css `@theme inline {}`)

| Category | Tokens defined | Notes |
|---|---|---|
| Primary (Red) | 50–950 scale | LAB color space |
| Secondary (Blue) | 50–900 scale | Hex values |
| Accent (Yellow) | 50–900 scale | Hex values |
| Success, Warning, Error, Info | 50–950 each | Hex values |
| Background | light + dark | `#f8f6f6` / `#221011` |
| Surface | light + dark | `#ffffff` / `#2d1a1b` |
| Text | main, muted, secondary | |
| Border | light + dark | |
| Chinese theme | chinese-red, gold, jade | Cultural accent |
| Sidebar | bg, text | |

**Strengths:** Comprehensive semantic token set. Background/surface separation is correct. Chinese cultural colors are domain-appropriate.

**⚠ R11 — tailwind.config.js content array:**
```js
// Current (incomplete):
content: ["./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"]

// Missing:
// "./app/**/*.{js,ts,jsx,tsx}"
// "./components/**/*.{js,ts,jsx,tsx}"
// "./constants/**/*.{js,ts,jsx,tsx}"
// etc.
```
Tailwind v4 uses automatic content detection differently from v3, but this configuration may still cause class purging in production builds. **Verify with a production build.**

**⚠ Dark mode:** `@custom-variant dark (&:is(.dark *))` defined. Dark surface/text tokens defined. But root is hardcoded `<html className="light">` — dark mode never activates. **R14.**

---

## 4. Typography Analysis

### Fonts loaded
- **Geist Sans** (`--font-geist-sans`) — Latin, geometric, display
- **Noto Sans** (`--font-noto-sans`) — Latin + Vietnamese subsets, 400/500/700

### Font stack
- Body: `--font-vietnamese` → Noto Sans → system fallbacks
- Chinese text: `--font-chinese` → Noto Sans → Microsoft YaHei → PingFang SC → SimHei
- Display headings: `--font-display` → Noto Sans

### Assessment
- Noto Sans for Vietnamese is correct — full glyph coverage
- Chinese text stack includes `Microsoft YaHei` (Windows) and `PingFang SC` (macOS) — adequate fallbacks
- Weights: 400 (body), 500 (labels), 700 (headings) — only these are loaded via Google Fonts

### ⚠ lang="zh" application
The `--font-chinese` font stack requires `lang="zh"` on elements to trigger OS Chinese font rendering. Application of this attribute on Chinese text elements (Vocabulary words, lesson titles, example sentences, hanzi characters) is likely inconsistent across components. Needs systematic audit.

### gradient-text class
```css
.gradient-text {
  background: linear-gradient(90deg, #dc2626, #ea580c, #eab308, ...);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 4s ease infinite;
}
```
Used on display headings. Distinctive and on-brand. Appropriate for hero/section headings — not body text.

---

## 5. Animation Analysis

### CSS keyframes (globals.css)
15 keyframe animations defined:

| Class | Animation | Use |
|---|---|---|
| `animate-fade-in` | opacity 0→1 + translateY(-10→0) | Section entrance |
| `animate-slide-up` | opacity 0→1 + translateY(20→0) | Card entrance |
| `animate-bounce-slow` | translateY 0→-5px→0 | Icon bounce |
| `animate-gradient` | background-position shift | Gradient text |
| `animate-float` | translateY 0→-8px→0 | Floating elements |
| `animate-shimmer` | background-position slide | Loading shimmer |
| `animate-pulse-soft` | scale + opacity | Soft pulse |
| `animate-fade-in-up` | opacity 0→1 + translateY(30→0) | Staggered entrance |
| `animate-wiggle` | rotate + scale | Interaction feedback |
| `animate-scale-in` | scale 0.9→1 | Modal/card entrance |
| `hover-lift` | translateY -8px on hover | Card hover |
| `hover-glow` | box-shadow on hover | Glow hover |
| `gradient-text` | animated gradient | Heading text |
| `shimmer-effect` | pseudo-element sweep | CTA shimmer |
| Flashcard 3D | perspective-1000, preserve-3d, rotate-y-180 | Flashcard flip |

### Framer Motion
Listed in `package.json` and `optimizePackageImports`. `AnimatedSection.tsx` in `components/landing/shared/` likely wraps Framer Motion for scroll-triggered entrance. CountUp.tsx, TypingText.tsx in landing/home may use it. **To verify actual imports.**

### ⚠ R13 — No prefers-reduced-motion
No `@media (prefers-reduced-motion: reduce)` in globals.css. `AnimatedSection.tsx` likely does not check `useReducedMotion()`. Users with vestibular disorders or motion sensitivity receive full animations. This is an accessibility issue.

**Fix:** Add `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }` to globals.css and check `useReducedMotion()` in AnimatedSection.

---

## 6. Accessibility Assessment

### Strengths
- HeroUI components handle ARIA roles, labels, keyboard interactions internally
- `TooltipPrimitive.Provider` (Radix) wraps entire portal — correct pattern
- Semantic HTML in server components
- Color tokens separate text-main, text-muted for hierarchy

### Issues

**Color contrast (R-adjacent):**
`#ec131e` on white: fails WCAG AA at normal text sizes. Passes at large text (≥18px bold / ≥24px regular). Used correctly for large headings and icons. Monitor use on small text.

**No skip-to-content link:**
Users navigating by keyboard must tab through the entire sidebar navigation on every page. A `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>` is needed.

**lang="zh" inconsistency:**
Root `<html lang="vi">`. Chinese characters in vocabulary, lesson titles, and example sentences lack `lang="zh"` — screen readers will mispronounce Chinese words.

**Focus management:**
HeroUI Modal handles focus trapping. Custom components (BaseModal in landing) — To verify focus behavior.

**Form labels:**
HeroUI Input provides associated labels. Manual form components in landing/contact — To verify explicit `<label>` associations.

---

## 7. Responsiveness Assessment

### Portal
- **Sidebar:** Fixed on `lg+`, absolute + overlay on mobile — implemented correctly
- **Header:** Hamburger menu on mobile — implemented
- **Admin tables:** Data-heavy tables on mobile — responsiveness unclear. HeroUI Table with horizontal scroll is likely the fallback, but UX may be poor on small screens
- **Practice tabs:** Mobile tab switching behavior — To verify

### Landing
- `max-w-7xl mx-auto` pattern used for content width — standard
- `Container` / `px-4 sm:px-6 lg:px-8` responsive padding — To verify systematic use
- Hero slideshow: embla-carousel handles touch/swipe — ok
- Gallery lightbox: keyboard + click — To verify touch gestures

---

## 8. Form UX Assessment

**Current state:** ALL forms across the application use manual `useState` + ad-hoc validation.

**Login / Register:** Manual state, custom `getPasswordError()` functions, toast notifications from URL params.

**Admin CMS forms:** `useState` for each field, `updateField()` helper, ad-hoc `if (!title) return` checks.

**Contact form:** HTML5 `required` attributes only. No client-side validation library.

**API routes:** Zod validation in 2 places only (`auth.ts` credentials, `register/route.ts`).

**Impact:**
- Inconsistent error display (some inline, some toast, some URL param)
- No type-safe form state
- No field-level validation on blur
- No form state reset on success
- Duplicate validation logic across components

**Recommendation (R10):** Migrate all forms to React Hook Form + Zod. The packages are installed. Start with new forms in Phase 1.

---

## 9. Loading / Error / Empty States

### loading.tsx files
- `app/(landing)/loading.tsx` — spinner + "Đang tải..."
- `app/(portal)/loading.tsx` — exists
- `app/(portal-auth)/loading.tsx` — exists
- **Per-module loading: MISSING (R15)**

### error.tsx files
- `app/(landing)/error.tsx` — full 50-line client error boundary with retry button ✅
- `app/(portal)/error.tsx` — exists
- `app/(portal-auth)/error.tsx` — exists

### EmptyState.tsx
`components/portal/common/EmptyState.tsx`:
```tsx
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}
```
Reusable and correct. Used in CTable. Not available in landing components.

### TabSkeleton
Defined inline in `LessonPracticeView.tsx` for practice tab loading. Not extracted as a reusable component.

### HeroUI Skeleton
`@heroui/react` provides `<Skeleton>` component — not consistently used across portal modules for content loading.

---

## 10. UI Library Recommendation

### Option A: Keep HeroUI, create components/ui/ shared layer ← **Recommended**

**Rationale:** 77 files already use HeroUI. The investment is made. The goal is unification, not replacement.

**Plan:**
1. Create `components/ui/` — thin HeroUI wrappers with Ruby HSK defaults
2. Landing pages gradually adopt `components/ui/` instead of `components/landing/common/`
3. `components/landing/common/` retained only for landing-specific components (ContactBubbles, SectionHeader, AnimatedSection)

**Pros:** Zero migration of existing portal code. Brand consistency through `hero.ts`. Single token source.
**Cons:** Landing components still diverge until migrated. Incremental effort required.
**Migration risk:** Low — additive, not replacing.

### Option B: Radix + Tailwind wrapper
**Pros:** Maximum control, no library lock-in.
**Cons:** 77 files require migration. High effort, no product benefit. Not recommended.

### Option C: Hybrid (HeroUI for complex, Radix for simple)
**Pros:** Fine-grained control on simple components.
**Cons:** Still two systems. Adds complexity. Not recommended over Option A.

---

## 11. Design System Direction for Ruby HSK

### Source of truth hierarchy
```
hero.ts                     HeroUI Tailwind v4 plugin theme config
  ↓ colors, sizes, variants
HeroUI components           Primary component library (portal)
  ↓ consistent defaults
components/ui/              NEW: Ruby HSK shared wrappers
  ↓ used by
components/landing/         Landing pages (migrate over time)
components/portal/          Portal pages (already using HeroUI directly)
```

### Token consolidation
- `globals.css @theme inline {}` — CSS custom properties for Tailwind
- `hero.ts` — HeroUI semantic color mapping
- These two must stay in sync for color tokens

### Component priority for unification
1. Button (used everywhere — two implementations)
2. Input (forms everywhere — inconsistent)
3. Modal (BaseModal vs HeroUI Modal)
4. Badge/Chip (status display)
5. Table (CTable already reusable — promote to components/ui/)

### Typography direction
- Keep Noto Sans as primary
- Add systematic `lang="zh"` on all Chinese text elements
- gradient-text: keep for major section headings only, not all headings

### Animation direction
- CSS keyframes: keep in globals.css, add prefers-reduced-motion guard
- Framer Motion: verify actual usage; if used only for AnimatedSection, consider replacing with CSS for reduced bundle size
- Flashcard 3D: keep — domain-appropriate
