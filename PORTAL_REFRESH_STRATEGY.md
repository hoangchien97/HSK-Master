# Portal Data Refresh Strategy - Giải quyết vấn đề UI không cập nhật

## 📋 Vấn đề hiện tại

**Triệu chứng:** Sau khi Create/Update/Delete, phải force reload page mới thấy data mới nhất.

**Nguyên nhân:** Portal đang dùng **Client Components + API Routes** nhưng không có cơ chế refresh sau khi mutation.

---

## 🔍 Phân tích kiến trúc hiện tại

### ✅ Màn đã FIX (Calendar/Schedule)
- **File:** `components/portal/schedules/TeacherScheduleCalendar.tsx`
- **Pattern:** Server Actions + Optimistic Updates
- **Cách hoạt động:**
  ```tsx
  // 1. Gọi server action
  const result = await createSchedule(data)

  // 2. Optimistic update state
  setSchedules(prev => [...prev, ...result.schedules!])

  // 3. Server action tự revalidatePath
  revalidatePath('/portal/teacher/schedule')
  ```
- **Kết quả:** UI cập nhật NGAY LẬP TỨC, không cần reload

### ⚠️ Các màn chưa FIX
1. **Assignments** (`app/(portal)/portal/[role]/assignments/page.tsx`)
   - Student: Server fetch trong page component ✅ (đã dùng Server Component)
   - Teacher: Client component `AssignmentsTable` - likely dùng API fetch ❌

2. **Classes** (`components/portal/classes/`)
   - `ClassesTable.tsx` - dùng `refreshKey` pattern nhưng có thể chưa đủ
   - Cần verify xem `onSuccess` callback có được gọi đúng không

3. **Attendance** (`components/portal/attendance/`)
   - `AttendanceMatrixView.tsx` - có optimistic updates
   - Cần verify flow save có đúng không

4. **Students** (`app/(portal)/portal/[role]/students/page.tsx`)
   - Chưa xem code chi tiết

---

## ⚡ Giải pháp được recommend (Theo thứ tự ưu tiên)

### 🥇 Solution 1: Server Actions + revalidatePath (BEST - như Calendar đã làm)

**Ưu điểm:**
- Không cần API routes
- Server-side validation an toàn hơn
- `revalidatePath()` tự động cache bust
- Optimistic updates dễ implement
- Type-safe end-to-end

**Cách implement:**

```tsx
// 1. Tạo Server Action (actions/assignment.actions.ts)
'use server'

import { revalidatePath } from 'next/cache'
import { createAssignment as createAssignmentService } from '@/services/portal/assignment.service'

export async function createAssignment(data: IAssignmentFormData) {
  try {
    const result = await createAssignmentService(data)
    revalidatePath('/portal/teacher/assignments')
    return { success: true, assignment: result }
  } catch (error) {
    return { success: false, error: 'Failed to create assignment' }
  }
}

// 2. Client component
'use client'

import { createAssignment } from '@/actions/assignment.actions'

export default function AssignmentsTable() {
  const [assignments, setAssignments] = useState([])

  const handleCreate = async (data) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`
    setAssignments(prev => [...prev, { ...data, id: tempId }])

    // Server action
    const result = await createAssignment(data)

    if (result.success) {
      // Replace temp với real data
      setAssignments(prev => prev.map(a =>
        a.id === tempId ? result.assignment : a
      ))
      toast.success('Đã tạo assignment thành công!')
    } else {
      // Rollback optimistic update
      setAssignments(prev => prev.filter(a => a.id !== tempId))
      toast.error(result.error)
    }
  }
}
```

**Files cần sửa:**
1. Tạo `actions/assignment.actions.ts`
2. Tạo `services/portal/assignment.service.ts` (nếu chưa có)
3. Sửa `components/portal/assignments/AssignmentsTable.tsx`

---

### 🥈 Solution 2: Client Components + router.refresh() (Quick fix)

**Ưu điểm:**
- Sửa nhanh, ít code
- Giữ nguyên API routes hiện tại
- Không cần refactor lớn

**Nhược điểm:**
- Vẫn phải fetch lại toàn bộ data
- Không có optimistic updates
- Chậm hơn Solution 1

**Cách implement:**

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function AssignmentsTable() {
  const router = useRouter()

  const handleCreate = async (data) => {
    try {
      await api.post('/portal/assignments', data)
      toast.success('Đã tạo assignment thành công!')

      // Refresh server component data
      router.refresh()
    } catch (error) {
      toast.error('Không thể tạo assignment')
    }
  }
}
```

**Khi nào dùng:**
- Cần fix nhanh, không có thời gian refactor
- Screen không cần optimistic updates
- Data không thay đổi thường xuyên

---

### 🥉 Solution 3: Pure Client State + Optimistic Updates (Như calendar cũ)

**Ưu điểm:**
- UI phản hồi tức thì
- Không phụ thuộc server revalidation
- Trải nghiệm người dùng mượt mà

**Nhược điểm:**
- Phải maintain state sync logic
- Nhiều code hơn
- Dễ bị out-of-sync nếu có nhiều tabs

**Cách implement:**

```tsx
'use client'

export default function AssignmentsTable() {
  const [assignments, setAssignments] = useState([])

  const handleCreate = async (data) => {
    try {
      // 1. Optimistic update
      const optimisticAssignment = { ...data, id: 'temp-' + Date.now() }
      setAssignments(prev => [...prev, optimisticAssignment])

      // 2. API call
      const response = await api.post('/portal/assignments', data)
      const newAssignment = response.data

      // 3. Replace optimistic với real data
      setAssignments(prev =>
        prev.map(a => a.id === optimisticAssignment.id ? newAssignment : a)
      )

      toast.success('Đã tạo assignment thành công!')
    } catch (error) {
      // Rollback optimistic update
      setAssignments(prev =>
        prev.filter(a => a.id !== optimisticAssignment.id)
      )
      toast.error('Không thể tạo assignment')
    }
  }

  const handleDelete = async (id) => {
    try {
      // 1. Optimistic removal
      const backup = assignments.find(a => a.id === id)
      setAssignments(prev => prev.filter(a => a.id !== id))

      // 2. API call
      await api.delete(`/portal/assignments/${id}`)

      toast.success('Đã xóa assignment thành công!')
    } catch (error) {
      // Rollback
      if (backup) {
        setAssignments(prev => [...prev, backup])
      }
      toast.error('Không thể xóa assignment')
    }
  }
}
```

---

## 📁 Về việc move API folder

### ❌ KHÔNG NÊN move `app/api` ra ngoài

**Lý do:**

1. **Next.js App Router Convention:**
   - `app/api/*` là structure CHUẨN của Next.js 13+
   - Next.js routing tự động map `/api/*` → `app/api/*`
   - Move ra ngoài sẽ BREAK routing

2. **File-system based routing:**
   ```
   app/api/portal/schedules/route.ts
   → Tự động tạo endpoint: /api/portal/schedules
   ```

3. **Monorepo structure:**
   - Nếu move ra ngoài, Next.js sẽ KHÔNG nhận diện
   - Phải config lại routing manually (phức tạp, không cần thiết)

### ✅ Giữ nguyên structure hiện tại

```
app/
  api/                    ← GIỮ NGUYÊN Ở ĐÂY
    portal/
      schedules/
        route.ts          ← /api/portal/schedules
        [id]/
          route.ts        ← /api/portal/schedules/:id
      assignments/
        route.ts
  (portal)/
    portal/
      [role]/
        schedule/
          page.tsx
```

**Nếu muốn tách logic:**
- Đưa business logic vào `services/portal/`
- Đưa database queries vào `lib/db/`
- API routes CHỈ là thin wrapper:

```ts
// app/api/portal/schedules/route.ts
import { createSchedules } from '@/services/portal/schedule.service'

export async function POST(request: Request) {
  const data = await request.json()
  const result = await createSchedules(data) // ← Logic ở service
  return Response.json(result)
}
```

---

## 🎯 Action Plan - Ưu tiên sửa theo thứ tự

### Phase 1: Quick Wins (1-2h)
- [ ] Add `router.refresh()` vào tất cả mutation handlers
- [ ] Test xem data có refresh không
- [ ] Verify ClassesTable `refreshKey` pattern hoạt động đúng

### Phase 2: Migrate to Server Actions (3-5h)
- [ ] Assignments: Tạo actions + service
- [ ] Students: Tạo actions + service
- [ ] Migrate API logic sang server actions

### Phase 3: Optimistic Updates (2-3h)
- [ ] Add optimistic state updates cho các màn chính
- [ ] Error handling + rollback logic
- [ ] Loading states

### Phase 4: Polish (1h)
- [ ] Remove unused API routes (nếu đã migrate hết)
- [ ] Clean up code
- [ ] Test edge cases

---

## 🔥 Recommendation cuối cùng

**Đối với dự án này:**

1. ✅ **Giữ nguyên `app/api` structure** - ĐÚNG với Next.js convention
2. ✅ **Migrate sang Server Actions** (Solution 1) cho tất cả mutations
3. ✅ **Add optimistic updates** cho trải nghiệm mượt mà
4. ✅ **Học theo Calendar screen** - đã implement đúng pattern

**Màn Calendar là reference implementation tốt nhất:**
- Server Actions ✅
- Optimistic updates ✅
- Error handling ✅
- revalidatePath ✅

**Copy pattern này sang các màn khác là xong!**

---

## 📚 References

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Optimistic Updates Pattern](https://www.patterns.dev/react/optimistic-ui)

---

**Tóm lại:**
- API folder ở `app/api` là ĐÃ ĐÚNG, KHÔNG cần move
- Vấn đề là thiếu refresh mechanism
- Solution tốt nhất: Server Actions + Optimistic Updates (như Calendar)
- Quick fix: `router.refresh()` sau mỗi mutation
