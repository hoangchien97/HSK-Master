# ui-ux-pro-max

## When to use
Significant UI design work, new page layouts, visual redesigns, or when the current UI feels generic. Load before opening any component file.

---

## Ruby HSK Design Identity

This is a **Chinese language learning app** for a Vietnamese audience. The visual language should feel:
- **Warm and energetic** — red/yellow brand palette, not cold/corporate
- **Culturally grounded** — subtle Chinese aesthetic references (not kitsch)
- **Trustworthy** — clean hierarchy, not flashy; a school, not a startup

Do not let it look like a generic SaaS dashboard or a Tailwind starter template.

---

## Color system

| Role | Token | Hex | Use |
|---|---|---|---|
| Primary | `--color-primary` | `#ec131e` | CTAs, active states, brand moments |
| Accent | `--color-accent-400` | `#facc15` | Highlights, badges, gradient endpoint |
| Brand gradient | `--gradient-brand` | Yellow → Red | Hero sections, headings, scrollbar |
| Chinese red | `--color-chinese-red` | `#dc143c` | Cultural accent moments |
| Chinese gold | `--color-chinese-gold` | `#ffd700` | Achievement, premium |
| Chinese jade | `--color-chinese-jade` | `#00a86b` | Success, completed states |

**Contrast rule:** red on white = large text only. Body text on red backgrounds must be white.

---

## Typography

| Context | Font var | Notes |
|---|---|---|
| Vietnamese UI text | `--font-vietnamese` (Noto Sans) | Default for all UI |
| Chinese characters | `--font-chinese` | Add `lang="zh"` on the element |
| Display headings | `--font-display` | Can use gradient-text class |
| Code / mono | `--font-mono` | Pinyin transcription if needed |

**Scale:** use existing `--font-size-*` tokens. Do not introduce new sizes.  
**Weight:** 400 (body), 500 (labels/nav), 700 (headings). No other weights are loaded.

---

## Spacing and layout

- Use Tailwind spacing scale — no magic pixel values
- Portal pages: consistent `p-6` content padding, `gap-4` or `gap-6` for card grids
- Landing sections: generous vertical padding (`py-16` to `py-24`) for breathing room
- Max content width on landing: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## Motion principles

Use motion to **communicate**, not decorate.

| Animation | When | Class / library |
|---|---|---|
| Page section enter | On scroll into view | `animate-fade-in-up` |
| Card hover lift | Interactive cards | `hover-lift` |
| Gradient text shimmer | Brand headings | `gradient-text` |
| Button shimmer on hover | Primary CTAs | `shimmer-effect` |
| Flashcard 3D flip | Vocabulary practice | `perspective-1000 preserve-3d` |
| Complex transitions | Hero, modals | Framer Motion |

**Do not:** add animations to every element. Animate only the most important one per section.

---

## Component conventions

**Cards**
- Background: `bg-surface-light` (white), border `border-border-light`, radius `rounded-xl`
- Hover: `hover-lift` + subtle shadow increase
- No heavy drop shadows at rest — use `shadow-soft`

**Buttons**
- Primary: HeroUI `<Button color="primary">` — uses brand red
- Secondary / ghost: HeroUI variants, never raw `<button>` with manual styling
- Icon buttons: HeroUI `isIconOnly` prop

**Tables (admin)**
- Use HeroUI `<Table>` — sorting, pagination built in
- Action column: icon buttons (Edit, Delete) aligned right
- Empty state: centered illustration + CTA, not just "No data"

**Forms**
- React Hook Form + Zod always
- HeroUI `<Input>`, `<Select>`, `<Textarea>` — not raw HTML elements
- Error messages below the field, red text, `text-sm`

---

## Landing page design principles

1. **Hero** — large gradient headline, sub-text in muted color, two CTAs (primary + ghost)
2. **Social proof early** — stats (CTA Stats) within first two sections
3. **Scannable** — every section has a SectionHeader with label + title + subtitle
4. **Images** — real photos of students/teachers over stock art; use `next/image`
5. **Chinese cultural touches** — subtle use of `--color-chinese-red/gold/jade`, not overwhelming

---

## Portal / dashboard design principles

1. **Information density** — dashboards should show the most important metric first, above the fold
2. **Role distinction** — admin portal feels like a CMS tool; student portal feels like a learning app
3. **Empty states** — every data-driven component needs a designed empty state
4. **Loading states** — use HeroUI Skeleton, not spinners, for content that loads
5. **Sidebar** — fixed, always visible on desktop; slide-in on mobile (already implemented — don't change the structure)

---

## Anti-patterns to avoid

- Generic SaaS look: flat gray cards, blue primary color, rounded-2xl everything
- Over-animation: every card bouncing, every text fading in
- Inconsistent border radius (pick `rounded-xl` for cards, `rounded-lg` for inputs, `rounded-full` for badges — stick to it)
- Dark backgrounds on landing sections — keep landing light/white; use color as accent only
- Hardcoded colors in JSX — always tokens
