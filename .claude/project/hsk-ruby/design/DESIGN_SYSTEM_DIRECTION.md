# Ruby HSK — Design System Direction

**Date:** 2026-06-19
**Sources:** UIUX_PRO_MAX_AUDIT.md, TECH_STACK_OPERATION_ANALYSIS.md, HOMEPAGE_FEATURE_AUDIT.md, RISK_REGISTER.md
**Design approach:** UI/UX Pro Max — distinctive, deliberate, domain-grounded. No generic defaults.
**Mode:** Recommendations only — no changes to application source code.

---

## 1. UI/UX Pro Max Audit Summary

### What's working
- **Brand palette is domain-correct.** Imperial Red + Yellow-Gold is culturally resonant with Chinese education. The gradient (yellow→red) is distinctive and on-brand. The gradient scrollbar is a memorable micro-detail.
- **HeroUI investment is sound.** 77 portal files already use HeroUI. The component library is well-chosen for a data-rich portal.
- **Practice module is best-in-class.** Flashcard flip (3D CSS), Hanzi Writer stroke animation, and per-tab dynamic imports are technically and visually correct.
- **Notification architecture is solid.** Realtime + optimistic read = no loading gap.
- **CTable is production-quality.** Sort + pagination + URL sync is better than most in-house tables.

### What needs work (priority order)
1. **Two component systems drifting** — landing custom primitives vs portal HeroUI (R12)
2. **No `prefers-reduced-motion`** on 15 CSS keyframes or AnimatedSection (R13)
3. **Form UX is inconsistent** — error states are toast/URL-param/inline depending on which form (R10)
4. **No skip-to-content link** — keyboard navigation must traverse full sidebar on every page
5. **`lang="zh"` inconsistently applied** — screen readers will mispronounce Chinese vocabulary
6. **Loading states missing** per portal module (R15) — content flash on navigation
7. **Dark mode tokens exist** but are never activated — root is hardcoded `light` (R14)
8. **Admin dashboard sparse** — does not communicate business state at a glance

---

## 2. Recommended Design Direction

### Identity statement
Ruby HSK should feel like a **premium Vietnamese language school built with Chinese cultural precision** — warm, inviting, and energetic on the landing site; calm, structured, and focused in the portal.

### The one design risk worth taking
The brand has two strong visual materials: **the red-gold gradient** and **Chinese ink brush aesthetics**. The safe move is to keep gradients as background and text treatments. The risk worth taking: introduce **subtle ink-wash texture or brush stroke dividers** as section separators and decorative details on the landing site. Not as background fills — as accent marks. This signals cultural knowledge, not decoration.

This single detail distinguishes Ruby HSK from any other education platform. A thin calligraphic stroke divider between homepage sections, or a brush-stroke underline on section headings, costs one SVG and one CSS class. The payoff is a visual identity that could not be mistaken for anyone else's.

### Aesthetic register
- **Landing:** Warm, cultural, aspirational. White backgrounds, red-gold accents, brush-stroke details.
- **Portal:** Clean, focused, data-friendly. Light background (#f8f6f6), white cards, red primary, muted secondary text.
- **Shared:** Noto Sans everywhere. Chinese text always gets `lang="zh"`. Gradients reserved for headings and CTAs — not backgrounds.

---

## 3. Color Direction

### Current palette (confirmed)

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#ec131e` | Brand red — CTAs, active states, primary actions |
| `--color-accent-400` | `#facc15` | Yellow gold — gradient endpoint, achievement badges |
| `--gradient-brand` | yellow → red | Hero headings, CTAs, section openers |
| `--color-background-light` | `#f8f6f6` | Page background — portal + landing |
| `--color-surface-light` | `#ffffff` | Card, modal, panel surface |
| `--color-chinese-red` | `#dc143c` | Cultural accent — use sparingly |
| `--color-chinese-gold` | `#ffd700` | Achievement, premium, excellence |
| `--color-chinese-jade` | `#00a86b` | Success, correct answers, progress |

### Direction: preserve, discipline, expand one token

**Keep all tokens.** The palette is correct for the domain.

**Discipline the gradient:** `gradient-text` class (animated gradient heading) should be reserved for 2–3 moments per page. Not every section heading. Applied to the wrong element it reads as noise.

**Add one token for ink/brush accent:**
```css
--color-ink-stroke: rgba(30, 10, 10, 0.08); /* near-black at low opacity */
```
Used only for brush-stroke SVG fill and divider tints. Does not appear in components.

**WCAG note:** `#ec131e` on `#ffffff` fails AA for body text sizes. Passes AA for large text (≥18px / 14px bold). Current usage (headings, icons, CTAs) is compliant. Do not use brand red for body text or small labels.

---

## 4. Typography Direction

### Current fonts

| Role | Family | Weights |
|---|---|---|
| Body (Vietnamese) | Noto Sans | 400, 500, 700 |
| Display | Noto Sans (as `--font-display`) | 700+ |
| Chinese text | Noto Sans + Microsoft YaHei + PingFang SC + SimHei | varies |
| Code / Mono | Not loaded | — |

### Direction: Noto Sans + one display face for landing

**Portal:** Noto Sans is correct for data-dense UI. Keep as-is.

**Landing:** Noto Sans for body is correct. The display headings deserve a more expressive face for the landing site specifically. Recommendation:
- Add **Noto Serif** (Vietnamese-supported, elegant) for section headings on landing (h1, h2) via Google Fonts
- Keep Noto Sans for body, labels, CTAs, navigation
- This creates a clear reading hierarchy: serif headings guide the eye; sans body maintains clarity

Vietnamese glyph coverage: both Noto Sans and Noto Serif have complete coverage.

**Type scale — enforce systemically:**

| Level | Size | Weight | Use |
|---|---|---|---|
| Display | 3.5rem (56px) | 700 | Hero title |
| H1 | 2.25rem (36px) | 700 | Section headings |
| H2 | 1.75rem (28px) | 600 | Module headings |
| H3 | 1.25rem (20px) | 600 | Card titles |
| Body | 1rem (16px) | 400 | Default |
| Small | 0.875rem (14px) | 400 | Labels, meta |
| Caption | 0.75rem (12px) | 400 | Timestamps, footnotes |

**Chinese text rule:** Apply `font-family: var(--font-chinese)` and `lang="zh"` on every element that renders Chinese characters. This is a systematic audit task, not a one-time fix.

**gradient-text discipline:** Use only on Display and H1 levels. Not on H2 or below.

---

## 5. Layout and Spacing Direction

### Current layout patterns

**Landing:** `max-w-7xl mx-auto` content width. Sections use `py-16 lg:py-24` vertical rhythm. Responsive padding via `px-4 sm:px-6 lg:px-8`.

**Portal:** Fixed sidebar (256px), 64px header, scrollable main. `max-w-full` content area.

### Direction

**Keep both layout systems.** They serve different purposes and the current structure is sound.

**Vertical rhythm — add a spacing scale token:**
```css
--space-section: 5rem;   /* between homepage sections */
--space-module: 2rem;    /* between portal modules */
--space-card: 1.25rem;   /* within cards */
```
Enforcing consistent section spacing prevents the "stacked sections" feel where content runs together.

**Portal sidebar spacing:** The 256px sidebar with 64px header is a well-established admin pattern. Do not change dimensions.

**Card elevation system:**
- Level 0: flat card on `background-light` — no shadow
- Level 1: default card — `shadow-sm` (most portal cards)
- Level 2: modal/drawer — `shadow-lg` (HeroUI Modal handles this)
- Level 3: floating (chatbot bubble, notification dropdown) — `shadow-xl`

This prevents all cards having the same weight and helps users understand UI hierarchy.

---

## 6. Component Direction

### Core principle
Every new component should be drawn from the HeroUI library first. If HeroUI does not provide it, build a thin wrapper. Custom primitives are a last resort.

### Landing → HeroUI migration path

Phase 2 goal: create `components/ui/` as a shared layer.

| Current component | Migration target | Notes |
|---|---|---|
| `landing/common/Button.tsx` | `components/ui/Button.tsx` (HeroUI wrapper) | Add Ruby HSK default variants |
| `landing/common/Input.tsx` | `components/ui/Input.tsx` (HeroUI wrapper) | Add Ruby HSK validation styles |
| `landing/common/Modal.tsx` | `components/ui/Modal.tsx` (HeroUI Modal) | Consistent focus trapping |
| `landing/common/Badge.tsx` | `components/ui/Badge.tsx` (HeroUI Chip) | Map variant names |
| `landing/common/Skeleton.tsx` | Use HeroUI `<Skeleton>` directly | No wrapper needed |
| `landing/common/Spinner.tsx` | Use HeroUI `<Spinner>` directly | No wrapper needed |

**Do not migrate now.** This is Phase 2 work. Do not touch landing components until landing pages are stabilized.

### Portal component patterns to enforce

**Consistent empty states:** Every `CTable` instance must pass an `EmptyState` via `emptyContent`. Never leave a blank table.

**Form error display:** All form inputs must show inline error messages below the field, not as toasts. This is the HeroUI Input pattern — use `isInvalid` and `errorMessage` props.

**Loading skeletons:** Per-module `loading.tsx` must match the page layout: if the page has a table + stat cards, the skeleton should show those shapes.

**Ink-stroke divider (landing only):** A single SVG brush stroke used as a `<hr>` alternative on landing sections. Implemented as a CSS class: `divider-brush`. Not in portal.

---

## 7. Homepage UI Direction

### Visual hierarchy goal
A visitor must understand within 3 seconds: "This is a Chinese language school in Hanoi, I can learn HSK here."

### Section order (recommended)
1. **Hero** — "Học tiếng Trung từ con số 0 đến HSK 6" — bold display headline, brand gradient, slideshow, inline consultation form
2. **Trust bar** — stats (500+ học sinh, X khoá học, Y giảng viên) — CountUp animations
3. **Learning path** — HSK 1 → 6 visual progression — new section
4. **Courses** — existing CMS-driven grid
5. **Teacher team** — 3–4 teacher cards — improve prominence from About page
6. **Testimonials** — existing ReviewSection
7. **Vocabulary preview** — 3 HSK 1 flashcards — interactive without login
8. **FAQ** — accordion — new section
9. **CTA** — "Đăng ký tư vấn miễn phí" — reinforced at bottom

### Design details

**Hero:** Display heading with `gradient-text` animation. Chinese characters (`你好`) overlaid as a background texture element — very large, low opacity, ink-style. Consultation form card floating on the right (desktop) or stacked below (mobile).

**Learning path section:** Numbered progression (HSK 1, 2, 3 ... 6) with a horizontal timeline. Each number gets the brand red. Description is 1 sentence. Links to `/courses?level=HSK1`.

**Teacher cards:** Square photo, name in bold, credential in small text. No gradient backgrounds on teacher photos — real trust comes from real faces on clean cards.

**Vocabulary preview:** 3 cards in a row showing character (large), pinyin (small, below), meaning (Vietnamese, small). Cards have a subtle 3D tilt on hover matching the flashcard aesthetic from the practice module — creates continuity between marketing and product.

---

## 8. Portal UI Direction

### Visual hierarchy goal
An admin, teacher, or student must find their primary action within 2 seconds of page load.

### Sidebar refinements

Current sidebar is well-structured. Improvements:
- Add "AI Trợ lý" as a sidebar nav item for all roles (currently undiscoverable)
- Group admin CMS items under a collapsible "CMS" section rather than flat list — reduces sidebar length
- Active item: current `bg-red-50 text-red-600` is correct — keep

### Dashboard redesign direction

**Admin dashboard:** Current = CMS quick links + counts. Recommended = two-column layout:
- Left column (2/3): activity feed (recent registrations, new enrollments, today's classes)
- Right column (1/3): stat cards (total students, pending registrations, classes today)
- Top: 4 action cards (Add User, Add Course, View Registrations, Export Attendance)

**Student dashboard:** Current props-based layout is good. One improvement: the "continue learning" card should be visually prominent (larger, brand red border or gradient accent) — it's the primary action.

### Form design

**Error display pattern (enforce everywhere):**
```
[Field label]
[Input field — red border when invalid]
[Error message — text-danger text-sm — appears below input]
```

Never use toast for field-level validation errors. Toasts are for async operation results (save succeeded, save failed).

**Form success:** Inline success indicator or modal close, not a page redirect unless semantically correct.

### Loading states

**Per-module skeleton pattern:** Each module page needs a `loading.tsx` that previews the content shape:
- Table pages: 5 skeleton rows matching the column layout
- Dashboard: skeleton StatCards + skeleton activity list
- Practice: skeleton tabs + skeleton card

Use HeroUI `<Skeleton>` exclusively — consistent with portal component library.

---

## 9. UI Library Strategy

### Current state
- **Portal:** HeroUI v2 — 77 files. Well-integrated.
- **Landing:** 19 custom primitives in `components/landing/common/`. Not HeroUI.
- **Shared:** No shared component layer exists.

### Recommended strategy: Option A — HeroUI as unified foundation

**Do not replace HeroUI.** The investment is made and it's well-chosen.

**Do not expand Radix UI.** Current 2-file Radix presence (Tooltip) is appropriate. HeroUI provides accessible equivalents for everything else needed.

**Phase 2: create `components/ui/`** — thin HeroUI wrappers with Ruby HSK defaults applied:
```tsx
// components/ui/Button.tsx
import { Button as HeroButton, ButtonProps } from "@heroui/react"
export function Button(props: ButtonProps) {
  return <HeroButton color="primary" {...props} />
}
```
This gives landing pages the same visual foundation as the portal without rewriting all 19 components at once.

**Phase 2 migration order:**
1. Button (highest frequency)
2. Input (form consistency)
3. Modal (focus trapping consistency)
4. Badge → Chip
5. Skeleton, Spinner (trivially replaced)

**Never add new libraries without removing an equivalent.** The current dep list already has too many date libraries (`date-fns` + `dayjs`) and form libraries (`react-hook-form` installed, not used). Adding a new UI library would compound the problem.

---

## 10. Tailwind v4 Implementation Direction

### Current config structure

```
tailwind.config.js      → HeroUI plugin only (content array INCOMPLETE — R11)
hero.ts                 → HeroUI Tailwind v4 theme plugin (color overrides, component tokens)
app/globals.css         → @theme inline {} — all CSS custom properties (tokens)
                        → @plugin "../hero.ts"
                        → 15 keyframe animations
                        → @custom-variant dark
```

### Critical fix (P0): content array

```js
// tailwind.config.js — current (broken)
content: [
  "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
]

// tailwind.config.js — required
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./constants/**/*.{js,ts,jsx,tsx}",
  "./enums/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
]
```

Tailwind v4 has improved content detection but this explicit configuration is still required for correctness.

### Token discipline

All new color values go into `globals.css @theme inline {}`. Never hardcode hex in component className strings. Never add color values to `hero.ts` unless it's a HeroUI semantic token override.

### Animation additions

Add this block at the end of the keyframes section in `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

For `AnimatedSection.tsx` and any component using Framer Motion, check `useReducedMotion()` from `framer-motion` and bypass animations when true.

### Dark mode

`@custom-variant dark (&:is(.dark *))` is defined. Dark surface/text tokens are defined. To activate:
1. Wrap root layout in `ThemeProvider` from `next-themes`
2. Replace `<html className="light">` with next-themes' `ThemeProvider`
3. Add theme toggle button to portal header

**Do not do this now** — it's a P2 enhancement. When done, test every portal module in dark mode before release. The tokens exist but the actual component usage may expose gaps.

---

## 11. Accessibility Standards

### Required (P0–P1)

| Standard | Current status | Fix |
|---|---|---|
| `prefers-reduced-motion` | ❌ Missing (R13) | Add media query to globals.css; guard AnimatedSection |
| `lang="zh"` on Chinese text | ❌ Inconsistent | Systematic audit of vocabulary, lesson, example sentence components |
| Skip-to-content link | ❌ Missing | Add `<a href="#main-content">` in PortalLayoutClient.tsx |
| Inline form errors (portal) | ❌ Missing — toast/URL only | Enforce HeroUI Input `isInvalid` + `errorMessage` pattern |
| Form labels | ✅ HeroUI Input provides; custom landing forms — To verify | Audit `components/landing/common/Input.tsx` for explicit label association |

### Ongoing standards to enforce

- **Color contrast:** `#ec131e` on white = AA for large text only. Never use for body text or small labels.
- **Focus styles:** HeroUI handles visible focus rings. Custom landing components — verify `:focus-visible` is not removed.
- **Keyboard navigation:** All interactive elements must be reachable by Tab. No `tabIndex={-1}` on focusable elements.
- **ARIA for dynamic content:** Notification dropdown and chatbot widget must have appropriate `aria-live` regions.
- **Image alt text:** All `<img>` and `<Image>` in landing and portal must have meaningful alt text. No empty alt on informational images.

---

## 12. Recommended UI Implementation Phases

### Phase 0 — Stabilize (P0 — before any release)
1. Fix `tailwind.config.js` content array
2. Remove `LanguageSwitcher`
3. Add `prefers-reduced-motion` to `globals.css`
4. Add per-module `loading.tsx` (HeroUI Skeleton) to all portal pages
5. Add per-module `error.tsx` to all portal pages

### Phase 1 — Landing conversion + form quality
1. Add inline consultation form to hero section
2. Add `sitemap.ts` and `robots.ts`
3. Migrate contact form to React Hook Form + Zod
4. Enforce inline error pattern on 3 highest-traffic admin forms
5. Add skip-to-content link to portal layout
6. Systematic `lang="zh"` audit on vocabulary/lesson components

### Phase 2 — Design system unification
1. Add Noto Serif for landing display headings
2. Create `components/ui/` shared layer (Button, Input, Modal, Badge)
3. Migrate landing primitives to `components/ui/` incrementally
4. Wire dark mode toggle (next-themes + portal header switch)
5. Add "ink-stroke" brush divider SVG to landing sections
6. Admin dashboard redesign (two-column activity feed layout)
7. Add "AI Trợ lý" to sidebar navigation

### Phase 3 — Enhancement
1. Vocabulary flashcard preview widget on homepage
2. HSK learning path section
3. Teacher team cards on homepage
4. FAQ accordion section
5. Reports/analytics module with Recharts

---

## 13. Acceptance Criteria

**Design system is considered stable when:**
- [ ] `tailwind.config.js` content array includes all source paths — production build has zero missing classes
- [ ] `prefers-reduced-motion` global guard is in `globals.css`
- [ ] Every portal module has `loading.tsx` and `error.tsx`
- [ ] All Chinese character elements have `lang="zh"`
- [ ] Skip-to-content link is present in portal layout
- [ ] All form validation errors appear inline below the input, not as toasts
- [ ] `gradient-text` is used on ≤2 headings per page
- [ ] `LanguageSwitcher` is completely absent from all pages
- [ ] Landing section headings use a consistent type scale (Display / H1 / H2 hierarchy)
- [ ] No hex colors are hardcoded in className strings — all from CSS token system
- [ ] `components/ui/` exists with at least Button and Input as HeroUI wrappers

---

## 14. Open Questions / To verify

| Question | Impact | How to resolve |
|---|---|---|
| Does `AnimatedSection.tsx` use Framer Motion or CSS only? | Determines whether `useReducedMotion()` hook is needed | `grep -r "framer-motion" components/landing/` |
| Are `Recharts` components actually imported? | Phase 3 reports module planning | `grep -r "recharts" components/ app/` |
| Does `React Big Calendar` render on schedule pages? | Dynamic import requirement | `grep -r "react-big-calendar" components/ app/` |
| Does `CountUp.tsx` check `prefers-reduced-motion`? | Accessibility compliance | Read `components/landing/shared/CountUp.tsx` |
| Does `BaseModal` in landing handle focus trapping? | Accessibility compliance | Read `components/landing/common/BaseModal.tsx` or `Modal.tsx` |
| Are Radix Dialog and Label packages actually imported anywhere? | Dependency cleanup scope | `grep -r "@radix-ui/react-dialog\|@radix-ui/react-label" components/ app/` |
| Does the student practice tab switch work correctly on mobile viewport? | Mobile UX | Manual test on 375px viewport |
| Are admin data tables horizontally scrollable on mobile? | Mobile UX | Manual test with HeroUI Table on 375px viewport |
| Is Axios used in the AI chat service or calendar sync? | Dependency cleanup | `grep -r "axios" lib/ app/api/` |
