# Ruby HSK — UI Migration Plan
## HeroUI → Pure Tailwind v4 + headlessui/react
**Created:** 2026-06-19 | **Status:** Approved, Phase 0 not started

---

## Design Decision

Ruby HSK is a premium Vietnamese language center specializing in Chinese. The UI must feel like:
- **Landing:** Warm, cultural, energetic — red/gold accents, subtle Chinese aesthetics (田字格 grid pattern), section animations
- **Portal:** Clean data workspace — paper-white background, structured, focused

Current HeroUI flattens this. Generic SaaS aesthetic defeats the brand.

---

## New Token System (6 named values)

| Token | Hex | Role |
|---|---|---|
| `--color-vermillion` | `#e31b1e` | Primary brand — CTAs, active nav, focus rings |
| `--color-gold` | `#f0b429` | Warm gold — achievement, gradient end (warmer than current `#facc15`) |
| `--color-ink` | `#1c0e0f` | Near-black with warmth — headings, primary text |
| `--color-paper` | `#faf8f5` | Warm white — page background |
| `--color-surface` | `#ffffff` | Card surface |
| `--color-smoke` | `#ede9e5` | Borders, dividers, subtle backgrounds |
| `--color-muted` | `#6b5558` | Secondary text, labels — warm gray-red, not blue-gray |

**Component geometry:**
- `rounded-sm` (2px) inputs — precision of exam forms
- `rounded-md` (6px) buttons
- `rounded-xl` (12px) cards and modals
- Borders: 1px `--color-smoke`
- Shadow: `0 1px 3px rgba(28,14,15,0.08)`
- Red used ONLY for: primary buttons, active nav, error states, focus rings. Never as fill.

**Typography:**
- Display headings: Noto Serif — authoritative, literary, Chinese cultural context
- Body + UI: Noto Sans — Vietnamese glyph support
- Chinese characters: `PingFang SC → Microsoft YaHei → Noto Sans SC`

**The 田字格 detail:** The quadrant grid paper Chinese learners use — rendered as a near-invisible 1px smoke background pattern in the practice write module and as a faint section watermark on landing. One SVG tile, one CSS class.

---

## Library Stack

**Add:**
- `@headlessui/react` — headless accessible primitives (Dialog, Menu, Listbox, Tabs, Switch, Accordion)

**Keep as-is:**
- `framer-motion` — 5 active landing files
- `lucide-react` — icons
- `embla-carousel` — hero slideshow + reviews
- `react-big-calendar` — teacher schedule
- `hanzi-writer` — stroke animation (irreplaceable)
- `react-toastify` — keep for now, evaluate Phase 3
- `vaul` — promote to direct dep for Drawer
- `react-hook-form` + `zod` — finally deployed in Phase 2

**Remove (after migration complete):**
- `@heroui/react` — after all 77 files migrated
- `@radix-ui/*` — after migration
- `hero.ts` — no longer needed

---

## New Component Architecture

```
components/
├── ui/                              ← Ruby HSK design system
│   ├── primitives/                  ← Pure Tailwind v4
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Card.tsx
│   │   ├── Divider.tsx              ← optional 田字格 SVG variant
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   └── Progress.tsx
│   ├── forms/                       ← RHF compatible
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx               ← headlessui Listbox
│   │   ├── Checkbox.tsx
│   │   ├── Switch.tsx               ← headlessui Switch
│   │   ├── Radio.tsx
│   │   ├── Label.tsx
│   │   └── FormField.tsx            ← RHF Controller wrapper
│   ├── overlays/                    ← headlessui + vaul
│   │   ├── Modal.tsx                ← headlessui Dialog
│   │   ├── Drawer.tsx               ← vaul Drawer
│   │   ├── Dropdown.tsx             ← headlessui Menu
│   │   └── Tooltip.tsx              ← headlessui Popover
│   ├── navigation/
│   │   ├── Tabs.tsx                 ← headlessui Tabs
│   │   ├── Accordion.tsx            ← headlessui Disclosure
│   │   ├── Breadcrumb.tsx
│   │   └── Pagination.tsx
│   ├── data/
│   │   └── Table.tsx                ← pure HTML + Tailwind
│   └── index.ts                     ← barrel export
│
├── portal/common/                   ← Migrate to wrap components/ui/
│   ├── CTable.tsx                   ← rewrite → ui/data/Table.tsx
│   ├── CModal.tsx                   ← rewrite → ui/overlays/Modal.tsx
│   └── CDrawer.tsx                  ← rewrite → ui/overlays/Drawer.tsx
│
└── landing/common/                  ← Freeze, retire file-by-file in Phase 5
```

**Import convention:**
```ts
// New work — always import from @/components/ui
import { Button, Input, Badge } from "@/components/ui"

// Portal existing work — HeroUI direct is acceptable (do not refactor)
import { Table, Chip, Avatar } from "@heroui/react"
```

---

## Phases

### Phase 0 — Design system foundation *(no portal files touched)*
1. Update `globals.css` — new palette tokens, add 田字格 SVG pattern, add `prefers-reduced-motion` global guard
2. Update `hero.ts` — remove HeroUI semantic overrides (now dead config)
3. Install `@headlessui/react`
4. Build all `components/ui/` components (full inventory above)
5. Test at `/system-design` — visually verify every component
6. **Zero migration of existing files in Phase 0**

### Phase 1 — Portal common components *(7-10 files, high leverage)*
- Rewrite CTable, CModal, CDrawer, CSpinner, FormInput, RoleBadge, StatCard, DataCard, PageHeader, EmptyState
- All 77 portal consumers automatically get new system via these wrappers
- Add per-module `loading.tsx` + `error.tsx` during Phase 1

### Phase 2 — Form system
- Enable React Hook Form + Zod on all existing portal forms (admin first)
- Contact form on landing
- `components/ui/forms/` proven in production

### Phase 3 — Portal modules: Admin *(~20 files)*
- Replace remaining `@heroui/react` imports with `@/components/ui`
- Test per-module before moving to next

### Phase 4 — Portal modules: Teacher + Student + Auth *(~20 files)*
- Same pattern as Phase 3
- Practice module: keep hanzi-writer, replace only HeroUI wrappers

### Phase 5 — Landing migration *(17 files in landing/common/)*
- Apply 田字格 section dividers
- Noto Serif for display headings
- Replace landing custom primitives with `components/ui/`
- Retire `components/landing/common/` folder

### Phase 6 — Remove dead dependencies
- Remove `@heroui/react`, `@radix-ui/*`, `hero.ts`, `providers/ui-provider.tsx`
- Verify with `npm run build` — zero HeroUI references

---

## What NOT to touch (any phase)
- `prisma/schema.prisma` — no schema changes
- `auth.ts`, `auth.config.ts` — RBAC unchanged
- `actions/`, `services/` — server-side logic unchanged
- `lib/prisma.ts`, `lib/supabase-*.ts` — unchanged
- Any working feature — migrate by replacement, not removal

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Phase 0 takes longer — 25+ components | High | Start with top 10 (Button, Input, Modal, Table, Badge, Spinner, Dropdown, Tabs, Drawer, Card) |
| Portal visual regressions | Medium | One module at a time, never break build |
| headlessui API differs from HeroUI | Medium | CTable/CModal/CDrawer are buffers — keep external prop API stable |
| react-big-calendar CSS conflicts | Medium | Wrap with custom override file using token values |
| landing/common/ has many consumers | Low | Phase 5 is last — everything else working first |
