# ruby-hsk-design-system

## When to use
Styling, building UI components, HeroUI usage, tokens, animations, dark mode, adding landing or portal UI.

---

## Two component systems (audit finding)

The codebase has **two parallel component systems**:

| Surface | Components | Library |
|---|---|---|
| Landing pages | `components/landing/common/` (19 custom primitives: Button, Input, Select, Textarea, Checkbox, Radio, Label, Badge, Modal, Drawer, etc.) | Custom — NOT HeroUI |
| Portal | `components/portal/` | **HeroUI v2** (77 files) |

Do not mix systems. When building in portal, use HeroUI. When modifying landing, use the existing landing common components.

**Recommended long-term direction:** Unify under HeroUI. Create `components/ui/` shared layer wrapping HeroUI with Ruby HSK defaults. Retire landing custom primitives gradually.

---

## HeroUI v2

Primary component library for portal. Used for: `Button`, `Input`, `Select`, `Form`, `Table`, `Modal`, `Chip`, `Avatar`, `Dropdown`, `Switch`, `Divider`, `Spinner`, `Skeleton`.

Config source: `hero.ts` (root) — HeroUI Tailwind v4 theme with Ruby HSK color palette.

Always import from `@heroui/react`. Do not reimplement components that HeroUI provides.

---

## Tailwind v4 — CSS-first config

Design tokens live in `app/globals.css` under `@theme inline {}`. Do not add theme rules to `tailwind.config.js`.

```
tailwind.config.js → only contains heroui() plugin
hero.ts            → HeroUI component token overrides
app/globals.css    → @theme inline {} — all CSS custom properties
```

**Always use tokens, never hardcode hex:**
```ts
// ✅ correct
className="text-primary bg-background-light"
// ❌ wrong
className="text-[#ec131e] bg-[#f8f6f6]"
```

---

## Key tokens

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#ec131e` | Brand red — CTAs, active states |
| `--color-accent-400` | `#facc15` | Yellow — gradient endpoint, badges |
| `--gradient-brand` | yellow → red | Hero sections, headings |
| `--color-background-light` | `#f8f6f6` | Page background |
| `--color-surface-light` | `#ffffff` | Card background |
| `--color-chinese-red` | `#dc143c` | Cultural accent |
| `--color-chinese-gold` | `#ffd700` | Achievement, premium |
| `--font-vietnamese` | Noto Sans | Default body font |
| `--font-chinese` | Noto Sans + YaHei | Chinese text elements |

---

## Critical: tailwind.config.js content array (R11)

The content array only lists HeroUI theme paths. `app/**`, `components/**`, `constants/**` are missing. In production builds, Tailwind may purge CSS classes used in app files. **Verify this before shipping new UI work.**

---

## Radix UI

Present in only 2 files:
- `components/landing/common/Tooltip.tsx` — wraps `@radix-ui/react-tooltip`
- `app/(portal)/layout.tsx` — `TooltipPrimitive.Provider`

Radix UI is not the primary component system. Do not add new Radix components — use HeroUI equivalents in portal.

---

## Framer Motion

In `dependencies` and `optimizePackageImports`. `AnimatedSection.tsx` in `components/landing/shared/` likely wraps it for scroll-triggered entrance animations. Verify actual imports before assuming it's unavailable.

**Use for:** page transitions, complex enter/exit animations in landing.
**Do not use for:** simple hover or toggle effects — use CSS keyframes or HeroUI transitions.

---

## CSS keyframes (globals.css)

15 animations defined — use for simple, pure-CSS effects:

```
animate-fade-in, animate-fade-in-up, animate-slide-up, animate-float
animate-shimmer, animate-wiggle, animate-scale-in, animate-bounce-slow
gradient-text (animated gradient on text)
shimmer-effect (hover shimmer on elements)
hover-lift (translateY on hover)
```

**Flashcard 3D flip** (practice module):
```
perspective-1000, preserve-3d, backface-hidden, rotate-y-180
```

---

## Dark mode (R14)

`@custom-variant dark (&:is(.dark *))` is defined in `globals.css`. Root is hardcoded `<html className="light">`. Dark mode is not user-switchable. Do not build dark-only UI or remove dark variant definitions — they are intentional placeholders.

---

## Accessibility (R13)

No `prefers-reduced-motion` guards exist on animations. Add this when building new animated components:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-* { animation: none; }
}
```

---

## Font and language

- Apply `font-chinese` class and `lang="zh"` on elements rendering Chinese characters
- Body default: Noto Sans via `--font-vietnamese`
- Chinese fallback stack: Noto Sans → Microsoft YaHei → PingFang SC → SimHei

---

## Color contrast

`#ec131e` on white background: passes WCAG AA for large text (≥18pt) only. Use white text on red backgrounds. Do not use red for body text on white.

---

## Portal common components

`components/portal/common/`:
- `CTable` — sortable, paginated, selectable HeroUI table wrapper
- `CModal`, `CDrawer` — HeroUI modal/drawer wrappers
- `EmptyState` — icon + title + description + action button
- `StatCard` — metric card with icon, count, color
- `DataCard` — generic card container
- `PageHeader` — section title + description
- `FileUploadZone` — drag-drop upload (client)
