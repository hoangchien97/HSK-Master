# Portal UI Refresh — Implementation Report

> Date: 2026-03-05 | Version: 1.0

---

## Summary

Comprehensive portal UI refresh addressing 11 key issues: responsive layout, table consistency, calendar fixes, sort support, deadline status system, form improvements, and design system documentation.

---

## Changes Made

### 0. Full-Height Layout Breakpoint: `xl` → `md` (768px)

**Problem:** Tables and calendar only became full-height at ≥1200px (`xl` breakpoint).
**Fix:** Changed to `md` (≥768px) across all layout components.

**Files modified:**
- `components/portal/common/CTable.tsx` — `md:flex-1 md:min-h-0`, wrapper `md:overflow-y-auto`
- `app/(portal)/PortalLayoutClient.tsx` — `md:h-screen`, `md:overflow-hidden`
- `components/portal/PortalContent.tsx` — `md:flex md:flex-col`

### 1. Empty State in CTable

**Status:** Already implemented. CTable renders `EmptyState` component with icon, title, description when data array is empty. The breakpoint fix ensures it's properly centered within the table height.

### 2. CTable Horizontal Scroll (Tablet)

**Problem:** Table broke on 768px tablet width with no horizontal scroll.
**Fix:** Added `overflow-x-auto` to table wrapper. Combined with existing `min-w-[640px]` on the table element.

**File:** `components/portal/common/CTable.tsx`

### 3. Schedule Month View

**Problem:** Month view not displaying dates, broken layout on tablet.
**Fix:**
- Changed `xl:` breakpoints to `md:` in `BigCalendarView.tsx`
- Added proper flex layout CSS for `.rbc-month-view` in `big-calendar-custom.css`
- Made header more compact for tablet (smaller buttons, responsive text)
- Added responsive "Thêm buổi học" → "Thêm" on mobile

**Files:**
- `components/portal/calendar/BigCalendarView.tsx`
- `styles/big-calendar-custom.css`
- `components/portal/schedules/TeacherScheduleCalendar.tsx`

### 4. Attendance Loading Pattern

**Problem:** Attendance page had different loading pattern from other pages.
**Fix:** Updated `AttendanceMatrixView` to use `md:flex-1 md:min-h-0` for consistent full-height behavior.

**File:** `components/portal/attendance/AttendanceMatrixView.tsx`

### 5. Assignment Page — Deadline Status System

**Problem:** Due date column showed raw datetime with red text for overdue.
**Fix:** Created a proper deadline status system with:
- Constants/enum: `DEADLINE_STATUS`, `DEADLINE_STATUS_LABEL`, `DEADLINE_STATUS_COLOR`
- Helper function: `getDeadlineStatus(dueDate, status)` — calculates OVERDUE/DUE_SOON/APPROACHING/ON_TIME/NO_DEADLINE
- Chip with color + Tooltip showing full datetime on hover

**Files:**
- `constants/portal/deadline.ts` (NEW)
- `constants/portal/index.ts` (updated barrel export)
- `components/portal/assignments/AssignmentsTable.tsx`

### 6. Assignment Form Modal

**Problem:** Hashtag field not full width, class & due date stacked vertically.
**Fix:**
- Class select + Due date in `grid grid-cols-1 sm:grid-cols-2 gap-4`
- Hashtag field remains full width (already was, layout improved)

**File:** `components/portal/assignments/AssignmentFormModal.tsx`

### 7. Portal Pages Consistency

**Verified:** All portal pages using CTable (ClassesTable, StudentsTable, AssignmentsTable, StudentClassesView) follow consistent patterns:
- URL-synced parameters
- Debounced search
- Sort support
- Loading states (isLoading + isFetching)
- Empty states with icons
- Responsive full-height from 768px

### 8–10. Style Guide, Code Review, Version Control

**Created:** `docs/PORTAL_STYLE_GUIDE.md` covering:
- Layout architecture & breakpoint strategy
- Component library documentation (CTable, CModal, EmptyState, CSpinner)
- Design patterns (CRUD page pattern, loading strategy, URL sync)
- Color system & status definitions
- Responsive guidelines
- Folder structure conventions
- Naming conventions
- Code quality checklists
- Git workflow (branch naming, commit format, PR template)

### 11. Sort Support for All Tables

**Created:** `useTableSort` hook in `hooks/useTableParams.ts`
- Reads `sortBy`/`sortOrder` from URL
- Returns `SortDescriptor` compatible with HeroUI Table
- Updates URL on sort change, resets to page 1

**Updated tables with sort support:**
| Table | Sortable Columns |
|-------|-----------------|
| ClassesTable | className, startDate, level, status |
| StudentsTable | student (name), level, status |
| AssignmentsTable | title, dueDate, status |
| StudentClassesView | className, startDate |

**Files modified:**
- `hooks/useTableParams.ts` — added `useTableSort` hook
- `components/portal/classes/ClassesTable.tsx`
- `components/portal/students/StudentsTable.tsx`
- `components/portal/assignments/AssignmentsTable.tsx`
- `components/portal/classes/StudentClassesView.tsx`

---

## Files Changed Summary

| File | Type | Changes |
|------|------|---------|
| `components/portal/common/CTable.tsx` | Modified | md breakpoints, overflow-x-auto |
| `app/(portal)/PortalLayoutClient.tsx` | Modified | md breakpoints |
| `components/portal/PortalContent.tsx` | Modified | md breakpoints |
| `components/portal/calendar/BigCalendarView.tsx` | Modified | md breakpoints, compact header, flex height |
| `styles/big-calendar-custom.css` | Modified | Month view flex layout |
| `components/portal/schedules/TeacherScheduleCalendar.tsx` | Modified | md breakpoints |
| `components/portal/attendance/AttendanceMatrixView.tsx` | Modified | md breakpoints |
| `components/portal/assignments/AssignmentsTable.tsx` | Modified | Deadline status, sort, Tooltip import |
| `components/portal/assignments/AssignmentFormModal.tsx` | Modified | Grid layout for class+date |
| `components/portal/classes/ClassesTable.tsx` | Modified | Sort support, sortable columns |
| `components/portal/students/StudentsTable.tsx` | Modified | Sort support, sortable columns |
| `components/portal/classes/StudentClassesView.tsx` | Modified | Sort support, sortable columns |
| `hooks/useTableParams.ts` | Modified | Added useTableSort hook |
| `constants/portal/deadline.ts` | NEW | Deadline status constants |
| `constants/portal/index.ts` | Modified | Export deadline |
| `docs/PORTAL_STYLE_GUIDE.md` | NEW | Style guide & design system |
| `docs/PORTAL_UI_REFRESH_REPORT.md` | NEW | This report |

---

## Testing Notes

1. **Responsive:** Test all table pages at 768px, 1024px, 1440px widths
2. **Sort:** Click column headers with sort arrows, verify URL updates
3. **Calendar:** Verify month view shows dates with events
4. **Deadline:** Check overdue (red), due soon (orange), approaching (blue), on time (green) chips
5. **Horizontal scroll:** Resize to 768px, verify table scrolls horizontally
6. **Empty state:** Search for non-existent data, verify empty state displays centered
