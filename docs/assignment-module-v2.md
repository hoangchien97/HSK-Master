# Assignment Module — v2 Implementation Guide

> **Phiên bản**: v2
> **Cập nhật**: March 2026
> **Tác giả**: Senior FE — HSK Master Portal

---

## 1. Tổng quan kiến trúc

Module quản lý bài tập (Assignment) của Portal HSK được xây dựng theo kiến trúc **Next.js 15 App Router** với Server Actions pattern. Dữ liệu được truy cập thông qua Prisma ORM và giao diện sử dụng thư viện HeroUI.

### Luồng dữ liệu

```
Page (SSR) → Server Action → Service (Prisma) → PostgreSQL
     ↕
Client Component (UI) → Server Action → Revalidate → Re-render
```

---

## 2. Status Lifecycle (v2)

### Assignment Status

```
DRAFT ──→ PUBLISHED ──→ CLOSED
```

| Status      | Mô tả                                      | Constant                     |
|-------------|---------------------------------------------|------------------------------|
| `DRAFT`     | Bài tập chưa công bố, chỉ giáo viên thấy  | `ASSIGNMENT_STATUS.DRAFT`    |
| `PUBLISHED` | Đã công bố, học viên có thể nộp bài        | `ASSIGNMENT_STATUS.PUBLISHED`|
| `CLOSED`    | Đã đóng, không nhận bài nộp mới            | `ASSIGNMENT_STATUS.CLOSED`   |

### Submission Status

```
(chưa tồn tại) ──→ SUBMITTED ──→ REVIEWED ──→ COMPLETED
                                     └──────→ REVISION_REQUIRED ──→ SUBMITTED (nộp lại)
```

| Status               | Mô tả                                    | Constant                                |
|----------------------|------------------------------------------|-----------------------------------------|
| `NOT_SUBMITTED`      | Học viên chưa nộp (computed, không lưu DB) | `SUBMISSION_STATUS.NOT_SUBMITTED`      |
| `SUBMITTED`          | Đã nộp, chờ giáo viên chấm              | `SUBMISSION_STATUS.SUBMITTED`           |
| `REVIEWED`           | Giáo viên đã xem xét                    | `SUBMISSION_STATUS.REVIEWED`            |
| `COMPLETED`          | Hoàn thành — có điểm số                 | `SUBMISSION_STATUS.COMPLETED`           |
| `REVISION_REQUIRED`  | Cần sửa lại — giáo viên trả về         | `SUBMISSION_STATUS.REVISION_REQUIRED`   |
| `OVERDUE`            | Quá hạn (computed, không lưu DB)        | `SUBMISSION_STATUS.OVERDUE`             |

> ⚠️ Không còn các status v1: `RESUBMITTED`, `GRADED`, `RETURNED`, `ARCHIVED`

---

## 3. Constants

Tất cả status được định nghĩa tập trung tại:

**`constants/portal/roles.ts`**

```typescript
export const ASSIGNMENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
} as const

export const SUBMISSION_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  SUBMITTED: 'SUBMITTED',
  REVIEWED: 'REVIEWED',
  COMPLETED: 'COMPLETED',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  OVERDUE: 'OVERDUE',
} as const

export const CLASS_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
```

Barrel export qua `@/constants/portal` (re-exports toàn bộ từ `roles.ts`).

> **Quy tắc**: Không hardcode string status trong code. Luôn dùng constant.

---

## 4. Cấu trúc file

```
services/portal/
  assignment.service.ts       # Prisma data access layer
actions/
  assignment.actions.ts       # Server Actions — CRUD + close
  submission.actions.ts       # Server Actions — submit + grade
components/portal/assignments/
  AssignmentsTable.tsx        # Teacher: danh sách bài tập + tiến độ
  AssignmentDetailView.tsx    # Teacher + Student: chi tiết + chấm bài
  AssignmentFormModal.tsx     # Teacher: tạo / sửa bài tập
  StudentAssignmentsView.tsx  # Student: danh sách bài tập của mình
app/(portal)/portal/[role]/assignments/
  page.tsx                    # List page (teacher / student)
  [id]/page.tsx               # Detail page (SSR + auth guard)
```

---

## 5. Service Layer

### `assignment.service.ts`

#### `getAssignments(teacherId, params)` — Teacher view
- **Filters đặc biệt**: `NEEDS_GRADING` (có bài chờ chấm), `OVERDUE` (quá hạn chưa đóng)
- **Include**: `class.enrollments` (để tính tổng học viên), `submissions`
- **Class filter**: chỉ lấy class có `status = CLASS_STATUS.ACTIVE`

#### `getStudentAssignments(studentId, params)` — Student view
- Chỉ trả về bài tập có `status = ASSIGNMENT_STATUS.PUBLISHED`
- **Submission filters**: `SUBMITTED`, `NOT_SUBMITTED`, `COMPLETED`, `REVISION_REQUIRED`

#### `closeAssignment(assignmentId, teacherId)`
- Kiểm tra: bài tập phải đang `PUBLISHED`
- Chuyển sang `ASSIGNMENT_STATUS.CLOSED`
- Trả về `{ id, title, classId, slug }`

---

## 6. Server Actions

### `assignment.actions.ts`

| Action                  | Mô tả                               | Auth       |
|-------------------------|--------------------------------------|------------|
| `fetchAssignments`      | Lấy danh sách bài tập               | Teacher/Student |
| `createAssignmentAction`| Tạo bài tập mới                     | Teacher    |
| `updateAssignmentAction`| Cập nhật bài tập                    | Teacher    |
| `deleteAssignmentAction`| Xóa bài tập                         | Teacher    |
| `closeAssignmentAction` | Đóng bài tập (PUBLISHED → CLOSED)   | Teacher    |

### `submission.actions.ts`

| Action                  | Mô tả                               | Auth    |
|-------------------------|--------------------------------------|---------|
| `submitAssignmentAction`| Nộp / nộp lại bài                   | Student |
| `gradeSubmissionAction` | Chấm bài (`GRADED` → `COMPLETED`, `RETURNED` → `REVISION_REQUIRED`) | Teacher |

**Guard trong `submitAssignmentAction`**:
```typescript
if (assignment.status !== ASSIGNMENT_STATUS.PUBLISHED) {
  return {
    success: false,
    error: assignment.status === ASSIGNMENT_STATUS.CLOSED
      ? 'Bài tập đã đóng, không thể nộp bài'
      : 'Bài tập chưa được công bố'
  }
}
```

---

## 7. Component Details

### `AssignmentsTable.tsx` (Teacher)

**Columns**: STT · Bài tập · Lớp · Hạn nộp · **Tiến độ nộp bài** · **Chờ chấm** · **Hoàn thành** · Trạng thái · Actions

**Filters**: Tất cả · Đã công bố · Nháp · Đã đóng · **Cần chấm bài** · **Quá hạn**

**Actions per row**: Xem chi tiết · Chỉnh sửa (disabled if CLOSED) · **Đóng bài tập** (disabled if not PUBLISHED) · Xóa

**Status config** (dùng computed keys):
```typescript
const STATUS_CONFIG = {
  [ASSIGNMENT_STATUS.PUBLISHED]: { label: 'Đã công bố', color: 'success' },
  [ASSIGNMENT_STATUS.DRAFT]:     { label: 'Nháp',       color: 'default' },
  [ASSIGNMENT_STATUS.CLOSED]:    { label: 'Đã đóng',    color: 'warning' },
}
```

### `AssignmentDetailView.tsx` (Teacher + Student)

**Teacher view**:
- **Stats bar**: Học viên · Đã nộp · Chờ chấm · Hoàn thành · Quá hạn
- **Tabs**: Tổng quan · Bài nộp · Bình luận
- **Submission filter**: ALL / NOT_SUBMITTED / SUBMITTED / COMPLETED / REVISION_REQUIRED / OVERDUE
- **Grading actions**: "Hoàn thành" (→ COMPLETED + điểm) · "Yêu cầu sửa lại" (→ REVISION_REQUIRED)
- **Close button**: hiện khi `status === ASSIGNMENT_STATUS.PUBLISHED`

**Student view**:
- Xem được bài `PUBLISHED` và `CLOSED` (read-only khi CLOSED)
- Upload + submit form: chỉ active khi `PUBLISHED` và chưa quá hạn
- Trạng thái bài nộp: hiển thị với màu và icon tương ứng
- Khi `REVISION_REQUIRED`: cho phép nộp lại

### `StudentAssignmentsView.tsx` (Student)

**Status config** (dùng computed keys):
```typescript
const SUBMISSION_STATUS_CONFIG = {
  [SUBMISSION_STATUS.NOT_SUBMITTED]:     { label: 'Chưa nộp',       color: 'warning' },
  [SUBMISSION_STATUS.SUBMITTED]:         { label: 'Đã nộp',         color: 'primary' },
  [SUBMISSION_STATUS.REVIEWED]:          { label: 'Đã xem xét',     color: 'secondary' },
  [SUBMISSION_STATUS.COMPLETED]:         { label: 'Hoàn thành',     color: 'success' },
  [SUBMISSION_STATUS.REVISION_REQUIRED]: { label: 'Cần sửa lại',    color: 'danger' },
  [SUBMISSION_STATUS.OVERDUE]:           { label: 'Quá hạn',        color: 'danger' },
}
```

### `AssignmentFormModal.tsx` (Teacher)

- **Toggle**: DRAFT ↔ PUBLISHED (Switch component)
- Status được tính từ boolean: `isPublished ? ASSIGNMENT_STATUS.PUBLISHED : ASSIGNMENT_STATUS.DRAFT`
- Detect publish transition (DRAFT → PUBLISHED) để set `publishedAt`

---

## 8. Detail Page (SSR)

**`app/(portal)/portal/[role]/assignments/[id]/page.tsx`**

Authorization logic:
```typescript
// Teacher: must own the assignment
if (userRole === 'teacher' && assignment.teacherId !== session.user.id) notFound()

// Student: must be enrolled + assignment must be PUBLISHED or CLOSED
if (userRole === 'student') {
  if (
    assignment.status !== ASSIGNMENT_STATUS.PUBLISHED &&
    assignment.status !== ASSIGNMENT_STATUS.CLOSED
  ) notFound()

  const isEnrolled = assignment.class.enrollments.some(e => e.studentId === session.user.id)
  if (!isEnrolled) notFound()
}
```

Lookup hỗ trợ cả **slug** và **CUID**:
```typescript
const isCuid = /^c[a-z0-9]{24,}$/.test(id)
const assignment = await prisma.portalAssignment.findFirst({
  where: isCuid ? { id } : { slug: id },
})
```

---

## 9. Database Schema (Prisma)

```prisma
model PortalAssignment {
  status       String   @default("DRAFT")    // DRAFT | PUBLISHED | CLOSED
  publishedAt  DateTime?
  slug         String?  @unique
  // ...
}

model PortalAssignmentSubmission {
  status       String   @default("SUBMITTED") // SUBMITTED | REVIEWED | COMPLETED | REVISION_REQUIRED
  score        Float?
  feedback     String?
  submittedAt  DateTime
  // ...
}
```

---

## 10. Notification Events

| Event                    | Trigger                             | Recipient |
|--------------------------|-------------------------------------|-----------|
| `ASSIGNMENT_PUBLISHED`   | Giáo viên publish bài tập           | Học viên lớp |
| `SUBMISSION_SUBMITTED`   | Học viên nộp bài lần đầu           | Giáo viên |
| `SUBMISSION_RESUBMITTED` | Học viên nộp lại                    | Giáo viên |
| `SUBMISSION_GRADED`      | Giáo viên chấm → COMPLETED          | Học viên |
| `SUBMISSION_RETURNED`    | Giáo viên trả về → REVISION_REQUIRED | Học viên |

---

## 11. Quy tắc phát triển

1. **Không hardcode status string** — luôn dùng `ASSIGNMENT_STATUS.*` hoặc `SUBMISSION_STATUS.*`
2. **Config objects** — dùng computed property keys: `[ASSIGNMENT_STATUS.PUBLISHED]: { ... }`
3. **Guard ở action layer** — kiểm tra quyền trước khi ghi DB
4. **Revalidate** — gọi `revalidatePath` sau mỗi mutation để refresh cache
5. **Slug-based routing** — ưu tiên slug thay vì CUID trong URL
6. **NOT_SUBMITTED và OVERDUE** — là computed status, không lưu vào DB
