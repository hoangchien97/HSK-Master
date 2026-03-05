# HSK Portal — Style Guide & Design System

> Phiên bản: 1.0 · Cập nhật: 2026-03-05

---

## 1. Tổng quan kiến trúc UI

### 1.1 Layout hệ thống

```
┌──────────────────────────────────────────────────────┐
│  PortalLayoutClient                                  │
│  ┌──────────┬───────────────────────────────────┐   │
│  │ Sidebar  │ Header (PortalHeader)              │   │
│  │ (fixed)  ├───────────────────────────────────┤   │
│  │          │ Breadcrumb (PortalBreadcrumb)      │   │
│  │          ├───────────────────────────────────┤   │
│  │          │ Page Content (flex-1, min-h-0)     │   │
│  │          │   ┌─ Toolbar / Filters ─────────┐ │   │
│  │          │   ├─ Table / Calendar / Content ─┤ │   │
│  │          │   └─ Pagination ────────────────┘ │   │
│  └──────────┴───────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 1.2 Breakpoint Strategy

| Breakpoint | Tailwind | Hành vi |
|------------|----------|---------|
| Mobile     | `< 768px` | Document flow, scroll toàn trang |
| Tablet+    | `md` (≥ 768px) | Full viewport height, flex layout, overflow hidden |
| Desktop    | `lg` (≥ 1024px) | Sidebar cố định bên trái (`lg:pl-64`) |

**Quy tắc:** Tất cả component sử dụng `md:flex-1 md:min-h-0` thay vì `xl:` để đảm bảo giao diện full-height từ tablet.

---

## 2. Component Library

### 2.1 CTable — Bảng dữ liệu chung

**Vị trí:** `components/portal/common/CTable.tsx`

**Tính năng:**
- ✅ Full-height layout từ `md` (768px+)
- ✅ Horizontal scroll (overflow-x-auto) cho tablet
- ✅ Sticky header (isHeaderSticky)
- ✅ Sort support (sortDescriptor + onSortChange)
- ✅ URL-synced pagination
- ✅ Empty state với icon, title, description
- ✅ Loading states: `isLoading` (first load) + `isFetching` (refresh dim)
- ✅ Selection mode (none/single/multiple)

**Sử dụng:**
```tsx
<CTable
  columns={columns}
  data={items}
  rowKey="id"
  page={urlPage}
  pageSize={urlPageSize}
  total={total}
  sortDescriptor={sortDescriptor}
  onSortChange={onSortChange}
  isFetching={isFetching}
  isLoading={!isLoaded}
  onPageChange={(p) => updateUrl({ page: String(p) })}
  onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
  toolbar={<MyToolbar />}
  actions={<CreateButton />}
  emptyContent={{
    icon: <Users className="w-12 h-12" />,
    title: "Chưa có dữ liệu",
    description: "Mô tả hành động tiếp theo",
  }}
/>
```

**Column sortable:**
```tsx
{
  key: "name",
  label: "Tên",
  sortable: true,  // ← Thêm prop này để enable sort icon
  render: (_v, row) => <span>{row.name}</span>,
}
```

### 2.2 CModal — Dialog chuẩn

**Vị trí:** `components/portal/common/CModal.tsx`

**Quy tắc form layout trong modal:**
- Fields liên quan đặt cùng 1 row: `grid grid-cols-1 sm:grid-cols-2 gap-4`
- Tags/hashtag luôn full width
- Switch toggles đặt trong card: `p-4 bg-default-50 rounded-xl border border-default-200`
- Footer: Hủy (variant="flat") + Submit (color="primary")

### 2.3 EmptyState

**Vị trí:** `components/portal/common/EmptyState.tsx`

Sử dụng trong CTable (tự động) hoặc standalone:
```tsx
<EmptyState
  icon={<Users className="w-12 h-12" />}
  title="Chưa có dữ liệu"
  description="Mô tả"
  action={<Button>Tạo mới</Button>}
/>
```

### 2.4 CSpinner — Loading indicators

- `variant="overlay"` — Overlay toàn bộ parent (first load)
- `variant="pill"` — Small pill indicator (refetch)

---

## 3. Design Patterns

### 3.1 Page Pattern — Danh sách CRUD

Mỗi trang danh sách PHẢI tuân theo pattern:

```
1. URL-synced state (search, filters, page, pageSize, sortBy, sortOrder)
2. Debounced search → useSyncSearchToUrl()
3. Sort → useTableSort()
4. Server action data fetching
5. Loading states: isLoaded (first load) + isFetching (refetch)
6. CTable với toolbar, actions, emptyContent
7. Modals: Create + Edit + Delete (nếu có)
```

**Ví dụ chuẩn:** `ClassesTable.tsx`, `AssignmentsTable.tsx`

### 3.2 Loading Strategy

| Tình huống | Xử lý |
|------------|--------|
| Route change | Next.js `loading.tsx` (React Suspense) |
| First data load | `<CSpinner variant="overlay" />` hoặc CTable `isLoading` |
| Data refetch | CTable `isFetching` (dim + disable) |
| Form submit | Button `isLoading` prop |

**KHÔNG dùng:** Global overlay, page-level loading cho data refetch

### 3.3 URL Sync Pattern

```tsx
// Hooks sử dụng
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams"

// Sort hook
const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams)

// URL params
const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE)
const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE)
```

### 3.4 Sort Pattern

Tất cả CTable PHẢI support sort cho các cột quan trọng:

| Loại cột | Nên sortable? |
|----------|---------------|
| Tên / Tiêu đề | ✅ Luôn luôn |
| Ngày tháng (startDate, dueDate) | ✅ Luôn luôn |
| Trạng thái | ✅ Nên có |
| Trình độ / Level | ✅ Nên có |
| STT / Actions | ❌ Không |
| Computed fields (progress) | ❌ Không |

---

## 4. Color System & Status

### 4.1 Assignment Deadline Status

**Constants:** `constants/portal/deadline.ts`

| Status | Label | Color | Điều kiện |
|--------|-------|-------|-----------|
| `OVERDUE` | Quá hạn | `danger` (đỏ) | Đã qua hạn & PUBLISHED |
| `DUE_SOON` | Sắp hết hạn | `warning` (cam) | ≤ 24h |
| `APPROACHING` | Sắp đến hạn | `primary` (xanh) | ≤ 72h |
| `ON_TIME` | Còn hạn | `success` (xanh lá) | > 72h |
| `NO_DEADLINE` | Không có hạn | `default` (xám) | Không có dueDate |

**Hiển thị:** Chip màu sắc + Tooltip hiện datetime chi tiết khi hover.

### 4.2 Class Status

| Status | Label | Color |
|--------|-------|-------|
| `ACTIVE` | Đang hoạt động | `success` |
| `COMPLETED` | Đã kết thúc | `primary` |
| `CANCELLED` | Đã hủy | `danger` |

### 4.3 Assignment Status

| Status | Label | Color |
|--------|-------|-------|
| `PUBLISHED` | Đã công bố | `success` |
| `DRAFT` | Nháp | `default` |
| `CLOSED` | Đã đóng | `warning` |

### 4.4 Schedule Event State

| State | Label | Background | Text |
|-------|-------|------------|------|
| `UPCOMING` | Sắp diễn ra | `#FEF3C7` | `#92400E` |
| `FUTURE` | Tương lai | `#ECFEFF` | `#065F46` |
| `PAST` | Đã qua | `#F3F4F6` | `#9CA3AF` |

---

## 5. Responsive Guidelines

### 5.1 Table (CTable)

- Mobile (`< 768px`): Horizontal scroll, `min-w-[640px]` trên table
- Tablet+ (`≥ 768px`): Full-height layout, sticky header, vertical scroll
- Column widths: Dùng `headerClassName: "w-12"` cho STT, `max-w-50` cho text truncate

### 5.2 Calendar (BigCalendarView)

- Mobile: Stack toolbar, natural height (`min-h-[500px]`)
- Tablet+: Compact header, full-height flex layout
- Button text rút gọn: "Thêm buổi học" → "Thêm" trên mobile

### 5.3 Modal / Form

- `size="2xl"` hoặc `size="3xl"` cho form modals
- Grid responsive: `grid grid-cols-1 sm:grid-cols-2 gap-4`
- `scrollBehavior="inside"` cho nội dung dài

---

## 6. Folder Structure Convention

```
components/portal/
├── common/           # Shared components: CTable, CModal, CSpinner, EmptyState, etc.
├── calendar/         # BigCalendarView, ScheduleModal, EventDetailDrawer
├── classes/          # ClassesTable, ClassFormModal, StudentClassesView
├── students/         # StudentsTable, StudentsToolbar
├── assignments/      # AssignmentsTable, AssignmentFormModal
├── attendance/       # AttendanceMatrixView, AttendanceHeader, AttendanceTable
├── schedules/        # TeacherScheduleCalendar, StudentScheduleView
└── [module]/         # Component folder per feature module

constants/portal/
├── index.ts          # Barrel export
├── portal.ts         # Status constants (USER_ROLE, CLASS_STATUS, etc.)
├── class.ts          # Class-specific constants
├── student.ts        # Student-specific constants
├── deadline.ts       # Deadline status (NEW)
├── pagination.ts     # Pagination defaults
├── navigation.ts     # Sidebar nav items
├── roles.ts          # Role labels, colors
├── date.ts           # Date format constants
└── practice.ts       # Practice mode constants

hooks/
├── useTableParams.ts # URL sync, debounce, sort hook
├── useResponsive.ts  # Responsive breakpoint hook
└── useClickOutside.ts
```

---

## 7. Naming Conventions

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component file | PascalCase | `ClassesTable.tsx` |
| Hook file | camelCase prefix `use` | `useTableParams.ts` |
| Constant file | camelCase | `pagination.ts` |
| Constants | SCREAMING_SNAKE_CASE | `ASSIGNMENT_STATUS` |
| Enum values | SCREAMING_SNAKE_CASE | `PUBLISHED`, `DRAFT` |
| Interface | PascalCase prefix `I` | `IClass`, `IGetClassResponse` |
| Type | PascalCase | `DeadlineStatus` |
| Server action | camelCase | `fetchClasses()` |

---

## 8. Code Quality Checklist

### 8.1 Component Checklist

- [ ] Sử dụng `"use client"` chỉ khi cần (hooks, event handlers)
- [ ] Props interface được định nghĩa rõ ràng
- [ ] `useMemo` / `useCallback` cho computed values và handlers
- [ ] Empty state được xử lý
- [ ] Loading states được xử lý (first load + refetch)
- [ ] Error handling có toast notification
- [ ] Responsive design hoạt động ≥ 768px

### 8.2 Table Page Checklist

- [ ] URL-synced params (search, filters, page, pageSize, sortBy, sortOrder)
- [ ] Debounced search
- [ ] Sort support trên các cột quan trọng
- [ ] CTable với toolbar, actions, emptyContent
- [ ] Pagination
- [ ] Loading states: `isLoading` + `isFetching`

### 8.3 Code Review Checklist

- [ ] Không có `any` type (trừ trường hợp cần thiết)
- [ ] Không có console.log trong production code
- [ ] Constants được sử dụng thay vì magic strings
- [ ] Import paths sử dụng `@/` alias
- [ ] Barrel exports (`index.ts`) được cập nhật
- [ ] Responsive breakpoints sử dụng `md:` (768px) cho full-height layout

---

## 9. Version Control & Git Workflow

### 9.1 Branch Naming

```
feature/<module>-<description>    # feature/assignment-deadline-status
fix/<module>-<description>        # fix/ctable-horizontal-scroll
refactor/<description>            # refactor/portal-breakpoints
docs/<description>                # docs/style-guide
```

### 9.2 Commit Message Format

```
<type>(<scope>): <description>

feat(CTable): add horizontal scroll support for tablet
fix(calendar): fix month view not showing dates
refactor(portal): change full-height breakpoint from xl to md
docs(portal): add style guide and design system
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `test`

### 9.3 PR Template

```markdown
## Changes
- Brief description of changes

## Checklist
- [ ] Responsive tested (≥ 768px)
- [ ] Loading states correct
- [ ] Empty states correct
- [ ] Sort working
- [ ] No TypeScript errors
- [ ] Follows style guide
```

---

## 10. Tổng kết thay đổi v1.0

| # | Thay đổi | Files |
|---|----------|-------|
| 1 | Full-height breakpoint: `xl` → `md` (768px) | CTable, PortalLayoutClient, PortalContent |
| 2 | Horizontal scroll cho tablet | CTable (overflow-x-auto) |
| 3 | Calendar month view fix | BigCalendarView, big-calendar-custom.css |
| 4 | Calendar header compact | BigCalendarView |
| 5 | Attendance layout consistency | AttendanceMatrixView |
| 6 | Deadline status system | constants/portal/deadline.ts (NEW) |
| 7 | Assignment deadline Chip + Tooltip | AssignmentsTable |
| 8 | Form modal layout improvements | AssignmentFormModal |
| 9 | Sort support all tables | useTableSort hook, 4 table pages |
| 10 | Style guide document | docs/PORTAL_STYLE_GUIDE.md (NEW) |
