# Ruby HSK — UI Dependency Scan
## Phase UI-0 Baseline
**Date:** 2026-06-19 | **Status:** Complete

---

## Summary Statistics

| Library | Files | Status |
|---|---|---|
| `lucide-react` | 121 | Ubiquitous icons — NOT replacing |
| `@heroui/react` | 88 | Primary portal framework |
| `react-toastify` | 52 | Standard portal notification |
| `framer-motion` | 10 | Landing animations only |
| `@radix-ui/react-tooltip` | 3 | One component only |
| `vaul` | 0 | Installed, never imported — dead dep |

---

## @heroui/react — Top Named Imports

| Component | Sites | Where |
|---|---|---|
| `Button` | 18 | Portal-wide |
| `Chip` | 12 | Portal (badges, status) |
| `useDisclosure` | 9 | Modal/drawer control hook |
| `Input` | 9 | Portal forms |
| `Card` / `CardBody` | 8 each | Portal containers |
| `Dropdown*` | 8 combined | Portal nav, menus |
| `Progress` | 6 | Practice module |
| `Select` / `SelectItem` | 5 | Tables, forms |
| `Modal*` | 4 | Admin forms |
| `Tabs` / `Tab` | 2 | Practice tabs |
| `Drawer*` | 1 | Calendar/event detail |
| `HeroUIProvider` | 1 | `providers/ui-provider.tsx` |

---

## framer-motion — All 10 Import Sites

| File | Purpose |
|---|---|
| `app/(landing)/courses/CoursesGrid.tsx` | Grid entrance animation |
| `app/(landing)/courses/[slug]/CourseResourceCards.tsx` | Card entrance animation |
| `app/(landing)/courses/[slug]/CourseStatsGrid.tsx` | Stats grid animation |
| `app/(landing)/system-design/page.tsx` | Dev/demo page |
| `components/landing/home/CountUp.tsx` | Number count-up |
| `components/landing/home/HeroSlideContent.tsx` | Hero text animation |
| `components/landing/home/HeroSlideShowClient.tsx` | Slide transitions |
| `components/landing/home/TypingText.tsx` | Typing effect |
| `components/landing/shared/ContactBubbles.tsx` | Floating Zalo/Messenger |
| `next.config.ts` | optimizePackageImports only |

---

## Portal Common Components

| Component | HeroUI Deps | Consumers | Replace Risk |
|---|---|---|---|
| `CTable.tsx` (331L) | Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Select, SelectItem | 12+ | HIGH |
| `CModal.tsx` | Modal, ModalContent, Header, Body, Footer | 10+ | Medium |
| `CDrawer.tsx` | Drawer, DrawerContent, Header, Body, Footer | 8+ | Medium |
| `FileUploadZone.tsx` | Button, Chip | 5+ | Medium |
| `FilePreviewList.tsx` | Modal, ModalContent, Header, Body, Footer, Button | 1 | Low |
| `FormInput.tsx` | Input | 5+ | Low |
| `CSpinner.tsx` | Spinner | ~5 | Very low |
| `RoleBadge.tsx` | Chip | ~5 | Very low |
| `StatCard.tsx` | Card, CardBody | 4 | Very low |
| `DataCard.tsx` | minimal/none | 3 | Very low |
| `EmptyState.tsx` | none visible | 4 | Very low |

---

## Landing Common Components (all custom, no HeroUI)

| Component | Deps | Consumers |
|---|---|---|
| `Button.tsx` | pure CSS | 18 |
| `Input.tsx` | pure CSS | 9 |
| `Select.tsx` | lucide-react | 6 |
| `BaseModal.tsx` | lucide-react | 3 |
| `BaseDrawer.tsx` | lucide-react | 2 |
| `Tooltip.tsx` | @radix-ui/react-tooltip | 1 |
| Badge, Checkbox, Radio, etc. | pure CSS | 1–3 each |

---

## Replace-First Candidates (Phase UI-4 start)

| Component | Target | Reason |
|---|---|---|
| `CSpinner.tsx` | `ui/primitives/Spinner` | 1 HeroUI dep, trivial |
| `RoleBadge.tsx` | `ui/primitives/Badge` | 1 HeroUI Chip dep |
| `StatCard.tsx` | `ui/primitives/Card` variant | Card+CardBody only |
| `DataCard.tsx` | Pure Tailwind | Likely no HeroUI deps |
| `EmptyState.tsx` | Pure Tailwind | Likely no HeroUI deps |
| `FormInput.tsx` | `ui/forms/Input` | Wraps HeroUI Input |
| `PageHeader.tsx` | Pure Tailwind | Layout only |
| `CModal.tsx` | `ui/overlays/Modal` | High leverage (10+ consumers) |

---

## High-Risk Components (do not touch until Phase UI-4 complete)

| Component | Why |
|---|---|
| `CTable.tsx` | 331 lines, 8 HeroUI imports, 12+ consumers |
| `BigCalendarView.tsx` | react-big-calendar, teacher schedule |
| Practice tabs (5 files) | hanzi-writer, Web Speech API |
| `HeroSlideShowClient.tsx` | embla-carousel + framer-motion |
| `providers/ui-provider.tsx` | HeroUIProvider — app root |
| `LoginForm.tsx` / `RegisterForm.tsx` | Auth-critical |

---

## Components NOT Safe to Touch Yet

- Practice module tabs (FlashcardTab, QuizTab, ListenTab, WriteTab, LookupTab)
- BigCalendarView
- AttendanceView + related
- LoginForm / RegisterForm
- All admin form modals (defer to Phase UI-4 late)
- PortalSidebar / PortalHeader

---

## Removal Candidates (Phase UI-6 only)

| Package | Condition |
|---|---|
| `vaul` | 0 imports — safe to remove |
| `@heroui/react` | After all 88 files migrated |
| `@radix-ui/react-tooltip` | After Tooltip migrated |
| `hero.ts` | After HeroUI provider removed |
| `providers/ui-provider.tsx` | After Phase UI-6 |

---

## Implementation Sequence

- **Phase UI-1** — Design tokens (globals.css, tailwind.config.js, Noto Serif, headlessui install)
- **Phase UI-2** — Core components (build entire components/ui/ — zero existing files touched)
- **Phase UI-3** — Homepage rebuild (landing/common → components/ui/, framer-motion → CSS)
- **Phase UI-4** — Portal rebuild (portal/common wrappers, then admin, then teacher/student)
- **Phase UI-6** — Remove HeroUI (after all migrations verified)
