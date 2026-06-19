# Phased Implementation Plan

**Date:** 2026-06-19
**Source:** Audit risk register (R01–R25) + gap analysis
**Status:** Recommended — not yet approved or scheduled

---

## Phase 0 — Production readiness (blocker fixes)

These must be done before any production deployment. Each item is a standalone file-level fix.

### 0.1 Fix Tailwind content array (R11)

**File:** `tailwind.config.js`
**Change:** Add `app/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}`, `constants/**/*.{ts,tsx}` to `content` array
**Test:** `npm run build` — verify no visual regressions

### 0.2 Add error boundaries (R17)

**Files to create:**
- `app/(portal)/portal/[role]/admin/*/error.tsx` (per module)
- `app/(portal)/portal/[role]/teacher/*/error.tsx`
- `app/(portal)/portal/[role]/student/*/error.tsx`

**Pattern:**
```tsx
"use client"
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-danger">Đã xảy ra lỗi. Vui lòng thử lại.</p>
      <Button onPress={reset}>Thử lại</Button>
    </div>
  )
}
```

### 0.3 Add per-module loading.tsx (R15)

Same file set as 0.2 — create `loading.tsx` alongside each `page.tsx`.

**Pattern:**
```tsx
import { Skeleton } from "@heroui/react"
export default function Loading() {
  return <div className="space-y-4 p-6"><Skeleton className="h-8 w-48 rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /></div>
}
```

### 0.4 Restrict calendar.events scope (R02)

**File:** `auth.ts`
**Change:** Move `calendar.events` scope to teacher-only sign-in flow. Non-teacher Google OAuth should not request calendar scope.
**Risk:** Requires testing Google OAuth flow end-to-end.

### 0.5 Resolve dual Supabase URLs (R07)

**File:** `next.config.ts`
**Task:** Identify which of the two Supabase project IDs (`ukbeoggejnqgdxqoqkvj` vs `alfbzgjpjvrcfaxxvijl`) is the active project. Remove stale URL from `remotePatterns`.

---

## Phase 1 — Form validation improvements (R10)

Target: portal admin + teacher forms with highest daily traffic.

### 1.1 Zod error surfacing

**Pattern for Server Action with error return:**
```ts
export async function createClass(data: unknown) {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }
  
  const result = CreateClassSchema.safeParse(data)
  if (!result.success) return { success: false, errors: result.error.flatten().fieldErrors }
  
  await classService.createClass(result.data)
  revalidatePath("/portal/admin/classes")
  return { success: true }
}
```

**Client component pattern:**
```tsx
const [errors, setErrors] = useState<Record<string, string[]>>({})
const handleSubmit = async () => {
  const result = await createClass(form)
  if (!result.success) { setErrors(result.errors ?? {}); return }
  onClose()
}
// In form:
<Input isInvalid={!!errors.name?.[0]} errorMessage={errors.name?.[0]} />
```

**Priority forms:** user create/edit, class create, assignment create

### 1.2 Required field client hints

Add `isRequired` prop to all HeroUI Input/Select components for fields with Zod `min(1)` constraint. This shows the asterisk and prevents submission of visibly empty fields.

---

## Phase 2 — RBAC audit (R04)

Systematically verify every portal page has a Layer 3 guard.

### 2.1 Audit script (manual)

For each file matching `app/(portal)/portal/[role]/**/page.tsx`:
- [ ] Confirm `const session = await auth()` present
- [ ] Confirm role check against `USER_ROLE.*` constant
- [ ] Confirm redirect on failure

### 2.2 Missing guards

Add guards following the pattern in `ruby-hsk-auth-rbac-nextauth` skill — Layer 3 pattern section.

---

## Phase 3 — UI polish

### 3.1 Dark mode toggle

**Files:** `app/(portal)/layout.tsx` or `PortalHeader.tsx` — add ThemeSwitcher component.
`@custom-variant dark` is already in `globals.css`. Root needs to switch between `class="light"` and `class="dark"`.

**Implementation:** `next-themes` package (install) → wrap root with `ThemeProvider` → add toggle button in portal header.

### 3.2 Animations — prefers-reduced-motion (R13)

**File:** `app/globals.css`
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
Add this block at the end of globals.css animations section.

---

## Phase 4 — New features (post-stabilization)

These should only start after Phase 0 is complete.

### 4.1 Course progress tracker
- New computed column or separate `CourseProgress` aggregation
- Student portal dashboard: % complete per course
- Depends on: `PortalLessonProgress` model (already exists)

### 4.2 Vocabulary bookmarks
- New `PortalVocabBookmark` model (schema change — needs approval)
- Student: star icon on vocabulary items
- Separate "My bookmarks" practice session

### 4.3 Teacher profile pages
- New `TeacherProfile` model (schema change — needs approval)
- Landing: `/teachers` listing page
- Fields: bio, specialization, years experience, photo

---

## Implementation rules (non-negotiable)

1. **No Supabase Auth** — NextAuth only
2. **Prisma only** for DB queries
3. **No schema changes** without user approval
4. **No react-hook-form** without user approval
5. **Preserve `/portal`** route naming
6. **Preserve ADMIN/TEACHER/STUDENT** roles
7. **HeroUI** for all portal UI, **landing/common** for all landing UI
8. Every new portal page needs: `loading.tsx`, `error.tsx`, Layer 3 RBAC guard
