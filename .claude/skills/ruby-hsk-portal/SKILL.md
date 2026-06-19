# ruby-hsk-portal

## When to use
Building or modifying portal features for admin/teacher/student, data tables, form patterns, module structure, navigation, AI chatbot.

---

## Portal module matrix

| Module | Admin | Teacher | Student | Notes |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | Role-specific stats |
| User management | ✅ | — | — | PortalUser CRUD |
| Class management | ✅ | ✅ read | — | PortalClass + Enrollment |
| Schedule | ✅ | ✅ | ✅ read | Google Calendar sync (teacher) |
| Assignment | ✅ | ✅ | ✅ | Submission + grading |
| Attendance | ✅ | ✅ | ✅ read | ExcelJS export |
| Courses (CMS) | ✅ | — | — | Admin CMS for public courses |
| Vocabulary (CMS) | ✅ | — | — | HSK vocabulary management |
| Grammar (CMS) | ✅ | — | — | GrammarPoint management |
| CMS general | ✅ | — | — | HeroSlides, Features, Reviews |
| Registrations | ✅ | — | — | Lead capture list |
| Practice | — | — | ✅ | Flashcard, quiz, listen, write tabs |
| Notifications | ✅ | ✅ | ✅ | Realtime via Supabase |
| AI Chatbot | ✅ | ✅ | ✅ | DeepSeek-backed, all pages |

---

## Portal route structure

```
app/(portal)/portal/[role]/
  admin/
    dashboard/page.tsx
    users/page.tsx
    classes/page.tsx
    schedule/page.tsx
    assignments/page.tsx
    attendance/page.tsx
    courses/page.tsx
    vocabulary/page.tsx
    grammar/page.tsx
    cms/page.tsx
    registrations/page.tsx
  teacher/
    dashboard/page.tsx
    classes/page.tsx
    schedule/page.tsx
    assignments/page.tsx
    attendance/page.tsx
  student/
    dashboard/page.tsx
    practice/page.tsx
    assignments/page.tsx
    schedule/page.tsx
```

All are async Server Components. Data fetched server-side, passed to client components.

---

## CTable pattern (standard portal table)

Use `CTable` from `components/portal/common/CTable.tsx` for all tabular data:

```tsx
<CTable
  columns={[
    { key: 'name', label: 'Họ tên', sortable: true },
    { key: 'role', label: 'Vai trò' },
    { key: 'actions', label: '' },
  ]}
  rows={users}
  emptyContent={<EmptyState title="Chưa có dữ liệu" />}
  pagination={{ page, pages, onChange: setPage }}
/>
```

CTable wraps HeroUI `Table` with: sorting, controlled pagination, row selection, empty state.

---

## Portal common components

`components/portal/common/`:

| Component | Use |
|---|---|
| `CTable` | All data tables |
| `CModal` | Confirmation dialogs, form modals |
| `CDrawer` | Detail panels, edit drawers |
| `EmptyState` | Empty list states (icon + title + description + action) |
| `StatCard` | Dashboard metric cards (icon, count, color, label) |
| `DataCard` | Generic content card container |
| `PageHeader` | Section title + description |
| `FileUploadZone` | Drag-drop file upload (client) |

Always check this folder before building a new common UI pattern.

---

## Forms (R10 — current gap)

**Current state:** All portal forms use `useState` + manual `updateField()` helper. `react-hook-form` is installed but NOT used anywhere.

```ts
// Current pattern — do NOT switch to react-hook-form without approval
const [form, setForm] = useState({ name: '', email: '' })
const updateField = (key: string) => (value: string) => setForm(prev => ({ ...prev, [key]: value }))
```

**Validation gap:** Client-side validation is minimal or absent on portal forms. Server-side validation exists via Zod in Server Actions, but errors are not always surfaced to the UI.

**Do not refactor to react-hook-form** without user approval — it touches every portal form.

---

## Server Actions pattern

```ts
// actions/user.actions.ts
"use server"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { userService } from "@/services/portal/user.service"

const UpdateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
})

export async function updateUser(data: unknown) {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    throw new Error("Unauthorized")
  }
  const parsed = UpdateUserSchema.parse(data)
  await userService.updateUser(parsed)
  revalidatePath("/portal/admin/users")
}
```

Always: re-verify session inside the action, Zod parse input, call service, revalidatePath.

---

## Services pattern

```ts
// services/portal/user.service.ts
import { prisma } from "@/lib/prisma"

export const userService = {
  async getUsers(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize
    const [users, total] = await Promise.all([
      prisma.portalUser.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.portalUser.count(),
    ])
    return { users, total, pages: Math.ceil(total / pageSize) }
  },
}
```

Services: Prisma queries only. No auth, no validation, no side effects.

---

## AIChatbot

DeepSeek-backed floating chat assistant. Present on all portal pages via `PortalLayoutClient.tsx`.

```
User message → /api/portal/chat/ → DeepSeek API → streaming response
ChatSession + ChatMessage persisted to DB (linked to PortalUser)
```

Key files:
- `app/api/portal/chat/` — chat route
- `services/portal/chat.service.ts` — session + message persistence
- `components/portal/AIChatbot.tsx` (or similar) — floating UI

Do not disable the chatbot for new modules — it's mounted at layout level.

---

## Google Calendar integration (Teacher)

Teachers can sync class schedules to/from Google Calendar.

- `GoogleCalendarToken` model: stores OAuth tokens (AES-256-GCM encrypted)
- `google-auth-library` + `googleapis` packages
- API routes under `app/api/portal/calendar/`
- Scope `calendar.events` requested at Google OAuth login for all users (R02 risk — scoped too broadly)

---

## Attendance export

`ExcelJS` — generates `.xlsx` attendance reports. Triggered from attendance module for admin/teacher.
API route: `app/api/portal/attendance/export/` (To verify exact path).
Output: streamed xlsx download.

---

## Loading gaps (R15)

Individual module pages have no `loading.tsx` files. Only root group-level loading exists. Add `loading.tsx` for every new module:

```tsx
// app/(portal)/portal/[role]/users/loading.tsx
import { Skeleton } from "@heroui/react"
export default function Loading() {
  return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>
}
```

---

## Adding a new portal module

1. **Page:** `app/(portal)/portal/[role]/<module>/page.tsx` — async Server Component with page-level role guard
2. **Loading:** `app/(portal)/portal/[role]/<module>/loading.tsx` — skeleton
3. **Service:** `services/portal/<module>.service.ts` — Prisma reads
4. **Actions:** `actions/<module>.actions.ts` — Zod + mutations + revalidatePath
5. **Components:** `components/portal/<module>/` — HeroUI-based client components
6. **Nav:** `constants/portal/navigation.ts` — add NavItem with `roles: [USER_ROLE.X]`

---

## Portal navigation

`constants/portal/navigation.ts` — array of `NavItem` objects. Each has `href`, `label`, `icon`, `roles: USER_ROLE[]`.

`PortalSidebar.tsx` filters items by `session.user.role`. Do not hardcode routes in sidebar — always add to navigation constants.
