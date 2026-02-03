# Portal Structure Refactor Proposal

## Current Structure (Có duplicate)
```
app/(portal)/portal/
├── student/
│   ├── page.tsx              # Dashboard
│   ├── assignments/          # DUPLICATE
│   ├── schedule/             # DUPLICATE  
│   ├── vocabulary/
│   └── bookmarks/
└── teacher/
    ├── page.tsx              # Dashboard
    ├── assignments/          # DUPLICATE
    ├── schedule/             # DUPLICATE
    ├── classes/
    ├── students/
    └── attendance/
```

## Proposed Structure (Share components)

### Option 1: Dynamic Routes (Recommended) ⭐
```
app/(portal)/portal/
├── [role]/
│   ├── page.tsx                    # /portal/student | /portal/teacher
│   ├── assignments/
│   │   └── page.tsx                # Share logic, conditional render
│   ├── schedule/
│   │   └── page.tsx                # Share logic, conditional render
│   ├── vocabulary/                 # Student only
│   │   └── page.tsx
│   ├── bookmarks/                  # Student only
│   │   └── page.tsx
│   ├── classes/                    # Teacher only
│   │   └── page.tsx
│   ├── students/                   # Teacher only
│   │   └── page.tsx
│   └── attendance/                 # Teacher only
│       └── page.tsx
└── components/                     # Shared components
    ├── AssignmentCard.tsx
    ├── ScheduleCalendar.tsx
    └── ...
```

**Example: `app/(portal)/portal/[role]/assignments/page.tsx`**
```tsx
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import StudentAssignmentsView from "@/app/components/portal/StudentAssignmentsView"
import TeacherAssignmentsView from "@/app/components/portal/TeacherAssignmentsView"

type Props = {
  params: Promise<{ role: string }>
}

export default async function AssignmentsPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/portal/login")

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()

  // Validate role matches URL
  if (urlRole !== userRole) {
    notFound()
  }

  // Fetch data based on role
  if (userRole === "student") {
    const assignments = await getStudentAssignments(session.user.email)
    return <StudentAssignmentsView assignments={assignments} />
  }

  if (userRole === "teacher") {
    const assignments = await getTeacherAssignments(session.user.email)
    return <TeacherAssignmentsView assignments={assignments} />
  }

  notFound()
}
```

### Option 2: Single Route (Simpler, but less semantic URLs)
```
app/(portal)/portal/
├── page.tsx                        # /portal (redirect based on role)
├── assignments/
│   └── page.tsx                    # /portal/assignments (check role)
├── schedule/
│   └── page.tsx                    # /portal/schedule (check role)
├── vocabulary/
│   └── page.tsx                    # /portal/vocabulary (student only)
├── classes/
│   └── page.tsx                    # /portal/classes (teacher only)
└── ...
```

**Example: `app/(portal)/portal/assignments/page.tsx`**
```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import StudentAssignmentsView from "@/app/components/portal/StudentAssignmentsView"
import TeacherAssignmentsView from "@/app/components/portal/TeacherAssignmentsView"

export default async function AssignmentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/portal/login")

  const role = session.user.role.toLowerCase()

  if (role === "student") {
    const assignments = await getStudentAssignments(session.user.email)
    return <StudentAssignmentsView assignments={assignments} />
  }

  if (role === "teacher") {
    const assignments = await getTeacherAssignments(session.user.email)
    return <TeacherAssignmentsView assignments={assignments} />
  }

  redirect("/portal")
}
```

## Benefits of Refactoring

### ✅ No More Duplicate Code
- Một file `page.tsx` cho cả student và teacher
- Share components giữa roles
- Dễ maintain và update

### ✅ Better DX (Developer Experience)
- Giống React SPA: conditional rendering
- Centralized logic
- Single source of truth

### ✅ Flexible
- Dễ thêm role mới (ADMIN, TA, etc.)
- Reuse components
- Easier testing

## Migration Steps

1. **Create shared components**
   ```
   app/components/portal/
   ├── StudentAssignmentsView.tsx
   ├── TeacherAssignmentsView.tsx
   ├── StudentScheduleView.tsx
   ├── TeacherScheduleView.tsx
   └── ...
   ```

2. **Create dynamic route structure**
   ```
   app/(portal)/portal/[role]/assignments/page.tsx
   ```

3. **Move existing logic to components**
   - Extract student logic → StudentAssignmentsView
   - Extract teacher logic → TeacherAssignmentsView

4. **Update navigation/sidebar**
   - Update links to use dynamic routes
   - `/portal/${role}/assignments`

5. **Test thoroughly**
   - Student role access
   - Teacher role access
   - 404 for invalid roles

## Recommendation

**Use Option 1 (Dynamic Routes)** because:
- ✅ Clean URLs: `/portal/student/assignments` vs `/portal/assignments`
- ✅ SEO-friendly và semantic
- ✅ Easier to understand URL structure
- ✅ Better for analytics tracking
- ✅ Clear separation of concerns

**When to use Option 2:**
- URLs không quan trọng (internal tool)
- Muốn code đơn giản hơn
- Ít roles, ít pages
