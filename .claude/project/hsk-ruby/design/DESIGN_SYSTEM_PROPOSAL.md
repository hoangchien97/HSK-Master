# Ruby HSK Design System Proposal

**Date:** 2026-06-19
**Recommendation:** Option A — Unify under HeroUI with a shared `components/ui/` layer

---

## 1. Problem Statement

The codebase currently has two parallel component systems:

| Surface | Component source | Examples |
|---|---|---|
| Landing (`/`, /about, /courses, etc.) | `components/landing/common/` — 19 custom primitives | Button, Input, Select, BaseModal |
| Portal (`/portal/**`) | HeroUI v2 — 77 files | Button, Input, Select, Modal, Table |

**Consequences:**
- A landing Button and a portal Button have different implementations, different hover states, different focus rings
- Brand color changes require updates in two places
- Forms are inconsistent in validation, error display, and submit behavior
- No shared loading/empty state components between surfaces
- Future features must decide which system to use

---

## 2. Proposed Architecture

### New shared layer: `components/ui/`

```
components/ui/
  Button.tsx          HeroUI Button with Ruby HSK defaults
  Input.tsx           HeroUI Input with standard error display pattern
  Select.tsx          HeroUI Select wrapper
  Textarea.tsx        HeroUI Textarea wrapper
  Modal.tsx           HeroUI Modal with standard header/footer
  Badge.tsx           HeroUI Chip with Ruby HSK variant mapping
  Tooltip.tsx         HeroUI Tooltip (replaces Radix usage in landing)
  EmptyState.tsx      Promoted from components/portal/common/
  StatCard.tsx        Promoted from components/portal/common/
  LoadingSpinner.tsx  Shared spinner
  Skeleton.tsx        HeroUI Skeleton wrapper
  Table/
    index.ts          Re-export CTable (promoted from portal/common)
  index.ts            Barrel export for all components
```

### Import pattern
```ts
// Instead of:
import Button from '@/components/landing/common/Button'
import { Button } from '@heroui/react'

// All code uses:
import { Button, Input, Modal } from '@/components/ui'
```

---

## 3. Token Source of Truth

```
hero.ts
  └── HeroUI Tailwind plugin
        └── primary: red palette based on #ec131e
            secondary: blue
            success: green
            warning: amber
            danger: red
            
app/globals.css @theme inline {}
  └── CSS custom properties
        └── --color-primary: #ec131e
            --color-background-light/dark
            --color-surface-light/dark
            --color-text-main
            --gradient-brand
            --font-vietnamese, --font-chinese
```

`hero.ts` drives HeroUI component defaults. `globals.css` drives raw Tailwind utilities. **Both must stay in sync for the primary color.**

---

## 4. Tailwind Config Fix (R11 — do first)

Current `tailwind.config.js` content array is incomplete:

```js
// CURRENT (broken):
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  ...
}

// FIXED:
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./constants/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  ...
}
```

**Fix this before any other UI work.** Without it, production builds may strip Tailwind utility classes from app files.

---

## 5. Migration Path (Phased)

### Phase 1 — Create components/ui/ (additive, no breaking changes)
1. Create `components/ui/` with HeroUI wrappers
2. Promote `EmptyState.tsx` and `StatCard.tsx` from `portal/common/` to `components/ui/`
3. Promote `CTable` to `components/ui/Table/`
4. All NEW components use `components/ui/`
5. All NEW forms use `components/ui/` + React Hook Form + Zod

### Phase 2 — Landing migration (incremental)
1. Update `components/landing/contact/ContactForm.tsx` → use `components/ui/Input`, `Select`, `Button`
2. Update `app/(landing)/courses/` → use `components/ui/`
3. Update other landing forms and interactive elements

### Phase 3 — Retire components/landing/common/ (long term)
Keep only landing-specific components that have no HeroUI equivalent:
- `SectionHeader.tsx` — landing-specific layout component
- `AnimatedSection.tsx` — scroll-triggered wrapper
- `ContactBubbles.tsx` / `LazyFloatingWidgets.tsx` — Zalo/Messenger specific
- `FooterFAQ.tsx` — landing accordion
- `MaterialIconsLoader.tsx` — font loader

Remove: Button, Input, Select, Textarea, Checkbox, Radio, Label, Switch, Badge, BaseModal, BaseDrawer, LoadingSpinner, OptimizedImage (use next/image directly), Pagination

---

## 6. CSS Keyframe Utilities

Keep all keyframe animations in `globals.css`. They are pure CSS and have zero library dependency.

**Document available animation classes:**
```
animate-fade-in         Section entrance (opacity + translateY)
animate-fade-in-up      Staggered entrance
animate-slide-up        Card entrance
animate-bounce-slow     Icon bounce (2s loop)
animate-float           Floating elements (3s loop)
animate-shimmer         Loading shimmer
animate-pulse-soft      Soft pulse (3s loop)
animate-wiggle          Interaction wiggle (0.5s)
animate-scale-in        Modal/card scale entrance
animate-gradient        Gradient position shift
hover-lift              Card hover lift (-8px)
hover-glow              Box shadow glow
gradient-text           Animated gradient heading text
shimmer-effect          Pseudo-element hover sweep
```

**Flashcard 3D utilities (keep — domain-specific):**
`perspective-1000`, `preserve-3d`, `backface-hidden`, `rotate-y-180`

---

## 7. prefers-reduced-motion Fix (R13)

Add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

For `AnimatedSection.tsx` (Framer Motion):
```ts
import { useReducedMotion } from 'framer-motion'
const shouldReduceMotion = useReducedMotion()
// Skip animation variants if true
```

---

## 8. Dark Mode (R14)

Three options:

**Option A: Wire a theme toggle (recommended for later)**
- Add `ThemeProvider` in `app/(portal)/layout.tsx`
- Toggle adds/removes `dark` class on `<html>`
- All dark mode tokens in globals.css already work
- Effort: Medium (Phase 3+)

**Option B: Remove dark variant definitions**
- Remove `@custom-variant dark (&:is(.dark *))` from globals.css
- Remove all `dark:` classes from components
- Clean but loses future capability
- Effort: Medium

**Option C: Keep as-is (current)**
- `<html className="light">` hardcoded
- Dark tokens defined but never applied
- No user impact — but wastes token definitions
- Zero effort — acceptable for now

**Recommendation:** Keep Option C for now. Add dark mode toggle in Phase 3+ once design system is stable.

---

## 9. lang="zh" Audit Required

The following component types need `lang="zh"` on their Chinese text elements:

```tsx
// Vocabulary word display
<span lang="zh" className="font-chinese text-4xl">{vocabulary.word}</span>

// Lesson title in Chinese
<h2 lang="zh">{lesson.titleChinese}</h2>

// Example sentences
<p lang="zh">{vocabulary.exampleSentence}</p>

// Practice flashcard face
<div lang="zh" className="font-chinese">{word}</div>
```

Files to audit:
- `components/portal/practice/FlashcardTab.tsx`
- `components/portal/practice/VocabItem.tsx`
- Any component rendering `vocabulary.word`, `lesson.titleChinese`, `vocabulary.exampleSentence`

---

## 10. Implementation Priority

```
1. Fix R11: tailwind.config.js content array          ← do in Phase 0
2. Fix R13: prefers-reduced-motion in globals.css     ← do in Phase 1
3. Create components/ui/ shared layer                 ← Phase 1
4. Migrate new forms to React Hook Form + Zod         ← Phase 1
5. Add lang="zh" to Chinese text elements             ← Phase 1
6. Landing migration to components/ui/                ← Phase 2
7. Retire components/landing/common/ primitives       ← Phase 3
8. Dark mode toggle                                   ← Phase 3+
```
