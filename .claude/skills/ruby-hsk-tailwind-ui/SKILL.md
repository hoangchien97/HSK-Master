# ruby-hsk-tailwind-ui

## When to use
Styling, building UI components, using HeroUI, animations, or dark mode.

## Tailwind v4 — CSS-first config

All design tokens live in `app/globals.css` under `@theme inline {}`.  
`tailwind.config.js` holds only the HeroUI plugin — do not add theme rules there.

**Always use tokens, never hardcode:**
```ts
// ✅
className="text-primary bg-background-light"
// ❌
className="text-[#ec131e] bg-[#f8f6f6]"
```

**Key tokens**
| Token | Value |
|---|---|
| `--color-primary` | `#ec131e` (Imperial Red) |
| `--color-background-light/dark` | `#f8f6f6` / `#221011` |
| `--color-surface-light/dark` | `#ffffff` / `#2d1a1b` |
| `--gradient-brand` | Yellow → Red |
| `--font-vietnamese` | Noto Sans |
| `--font-chinese` | Noto Sans + Microsoft YaHei fallback |

## Component library

**HeroUI** — use for all interactive components:
Button, Input, Modal, Table, Chip, Divider, Dropdown, Avatar, etc.

**Radix UI** — use for: Dialog, Tooltip, Label, Slot (already installed, do not swap for HeroUI equivalents without testing)

**Lucide React** — all icons. Do not add a second icon library.

## Animation

**Framer Motion** — page transitions, card hover effects, complex enter/exit animations.

**CSS keyframes** (in `globals.css`) — use for simpler, pure-CSS effects:
`animate-fade-in`, `animate-slide-up`, `animate-float`, `animate-shimmer`, `animate-wiggle`, `gradient-text`, `shimmer-effect`

**Flashcard 3D flip** — utility classes already defined: `perspective-1000`, `preserve-3d`, `backface-hidden`, `rotate-y-180`

## Dark mode

`@custom-variant dark (&:is(.dark *))` is defined but root is `<html className="light">`.  
**Do not build dark-mode-only UI** until the theme toggle is wired.  
Do not remove the dark variant definitions — they are intentional placeholders.

## Fonts

Loaded in `app/layout.tsx`: Geist Sans (`--font-geist-sans`) + Noto Sans (`--font-noto-sans`, Latin + Vietnamese subsets).  
Root body uses `--font-vietnamese`.  
For Chinese text blocks, apply `font-chinese` (`--font-chinese`).  
Add `lang="zh"` attribute on elements rendering Chinese characters.

## Color contrast note

Brand red `#ec131e` on white fails WCAG AA at body text sizes.  
Use white text on red backgrounds. Use red only for large headings or decorative elements on white.
