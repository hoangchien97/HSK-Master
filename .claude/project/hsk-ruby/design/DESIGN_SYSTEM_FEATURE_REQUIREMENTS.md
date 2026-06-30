# Ruby HSK — Design System Feature Requirements

**Date:** 2026-06-24
**Source:** FEATURE_SYSTEM_AUDIT.md + FINAL_DESIGN_SYSTEM.md
**Scope:** Components required by new/improved features in the active roadmap

---

## Current Design System Status

| Phase | Status |
|---|---|
| UI-1: Design tokens (vermillion, gold, ink, paper, smoke, muted) | ✅ Complete |
| UI-2: `components/ui/` — 26 components | ✅ Complete |
| UI-3: Landing homepage rebuild | 🔄 In progress (branch: chore/setup-claude-ai-workflow) |
| UI-4: Portal rebuild (HeroUI → components/ui/) | ❌ Not started |
| HSK level color tokens in globals.css | ❌ Pending (Phase UI-3) |

---

## Required Page Templates

| Template | Context | Priority |
|---|---|---|
| Landing section with inline form | Hero + lead capture | P1 |
| Landing FAQ accordion section | FAQ | P2 |
| Landing HSK level stepper | HSK path visualization | P2 |
| Landing vocabulary preview | Public vocab widget | P2 |
| Portal table page | All CMS + management modules | Existing via CTable |
| Portal form modal | Create/edit flows | Existing via CModal |
| Portal dashboard page | Admin/Teacher/Student | Existing |
| Portal registration pipeline view | Admin registrations | P1 |

---

## Required Portal Common Components

### New (not yet built)

| Component | Use | Priority |
|---|---|---|
| `RegistrationStatusBadge` | Pipeline status (PENDING/CONTACTED/ENROLLED/CLOSED) | P1 |
| `RegistrationPipelineRow` | Table row with inline status update | P1 |
| `ActivityFeedItem` | Admin dashboard recent activity row | P2 |
| `ProgressMiniBar` | Student mastery % in teacher view | P2 |
| `TeacherWorkloadCard` | Teacher management page — class count, student count | P2 |

### Existing (keep, do not migrate yet)

Per `FINAL_DESIGN_SYSTEM.md §5d` — high risk, many consumers:
- `CTable.tsx` — 331 lines, 12+ consumers
- `CModal.tsx` — 10+ consumers
- `CDrawer.tsx` — 8+ consumers
- `BigCalendarView.tsx` — react-big-calendar dependency
- `PortalSidebar.tsx` — layout-critical
- `PortalHeader.tsx` — layout-critical

---

## Required Landing Components (Phase UI-3)

| Component | Use | Notes |
|---|---|---|
| `HeroLeadForm` | Inline 3-field registration form in hero | RHF + Zod; `Registration` model |
| `TrialCTASection` | Trial lesson / free preview CTA block | P1 |
| `FAQAccordion` | Accordion with question/answer items | headlessui Disclosure |
| `HSKLevelStepper` | Visual HSK 1→6 progression | Static or CMS-driven |
| `VocabPreviewCard` | Public vocabulary card (hanzi + pinyin + meaning) | No login required |
| `TeacherCard` | Teacher photo + name + credential | Static or Album data |

All landing components → import from `@/components/ui` (Phase UI-2 complete).
Do not use `components/landing/common/` — deleted in Phase UI-3.

---

## Required Form Components

All new forms must use **React Hook Form + Zod**. No new `useState` forms.

| Form | Location | Fields | Priority |
|---|---|---|---|
| Hero Lead Form | Landing hero section | name, phone, hskLevel | P1 |
| Contact Form (improve) | `/contact` | name, phone, email, note | P1 |
| Registration status update | Admin registrations | status, notes | P1 |

---

## Required State Components

| State | Component | Status |
|---|---|---|
| Table loading | `loading.tsx` per portal module (Skeleton) | ❌ Missing — P0 |
| Page error | `error.tsx` per portal module | ❌ Missing — P0 |
| Empty table | `EmptyState.tsx` | ✅ Exists |
| Button loading | `Spinner` inline in Button | ✅ via components/ui |
| Form field error | Inline below input (not toast) | ⚠ Inconsistent — enforce in new forms |

---

## Required Learning-Domain Components

| Component | Context | Status |
|---|---|---|
| `HSKLevelBadge` | Course catalog, vocabulary, practice tabs | ⚠ Implemented inconsistently — standardize |
| Hanzi display (`lang="zh"`) | All Chinese characters | ⚠ Inconsistent — R in FINAL_DESIGN_SYSTEM |
| Pinyin text | Below hanzi (`text-sm tracking-wide`) | ⚠ Inconsistent |
| Flashcard (3D flip) | Practice module | ✅ Exists in practice tabs |
| Progress bar (mastery %) | Lesson progress, student dashboard | ✅ Exists |
| Attendance status badge | PRESENT/ABSENT/LATE/EXCUSED | ✅ Exists |
| `VocabPreviewCard` | Landing public preview | ❌ Missing |
| `ProgressMiniBar` | Teacher → student progress view | ❌ Missing |

---

## Token Additions Needed (Phase UI-3)

Add to `app/globals.css @theme inline` and `tailwind.config.js theme.extend.colors`:

```css
/* app/globals.css */
--color-hsk-1: #16a34a;
--color-hsk-2: #0891b2;
--color-hsk-3: #2563eb;
--color-hsk-4: #7c3aed;
--color-hsk-5: #d97706;
--color-hsk-6: #e31b1e;

/* Registration pipeline status */
--color-status-pending:   #d97706;  /* amber */
--color-status-contacted: #3b82f6;  /* blue */
--color-status-enrolled:  #16a34a;  /* green */
--color-status-closed:    #6b7280;  /* gray */
```

---

## Navigation Changes Needed

| Change | File | Priority |
|---|---|---|
| Remove "Bài kiểm tra" from `teacherNavItems` | `constants/portal/navigation.ts` | P0 |
| Add "AI Trợ lý" to all 3 role nav arrays | `constants/portal/navigation.ts` | P1 |
| Group admin CMS items under collapsible "CMS" section | `PortalSidebar.tsx` | P2 |

---

## Accessibility Checklist for New Components

Per `FINAL_DESIGN_SYSTEM.md §11`:

- [ ] `lang="zh"` on all elements rendering Chinese characters
- [ ] Inline form errors below input (never toast for validation)
- [ ] Focus rings: headlessui handles automatically for overlay components
- [ ] `prefers-reduced-motion` guard on any new animation (global guard already in globals.css)
- [ ] Image alt text on all `<Image>` components
