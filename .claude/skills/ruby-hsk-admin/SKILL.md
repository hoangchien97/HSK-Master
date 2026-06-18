# ruby-hsk-admin

## When to use
Building or modifying portal modules for any role (admin, teacher, student), navigation, or portal layout.

## Portal layout components

| Component | File | Role |
|---|---|---|
| `PortalSidebar` | `components/portal/PortalSidebar.tsx` | Nav links, sign-out |
| `PortalHeader` | `components/portal/PortalHeader.tsx` | Topbar, notifications |
| `PortalBreadcrumb` | `components/portal/PortalBreadcrumb.tsx` | Path breadcrumb |
| `PortalContent` | `components/portal/PortalContent.tsx` | Page content wrapper |

Do not restructure these components — they are shared across all roles.

## Module inventory

**SYSTEM_ADMIN** (`/portal/admin/`):
dashboard, hero-slides, courses, hsk-levels, categories, albums, reviews, features, cta-stats, users, registrations, seo

**TEACHER** (`/portal/teacher/`):
dashboard, classes, assignments, attendance, schedule, students

**STUDENT** (`/portal/student/`):
dashboard, practice, progress, vocabulary, quizzes, bookmarks, schedule

## Adding a new module — checklist

- [ ] `app/(portal)/portal/[role]/<module>/page.tsx` — Server Component, fetch data, render
- [ ] Page-level role guard at top of page
- [ ] `services/portal/<module>.service.ts` — read queries
- [ ] `actions/<module>.actions.ts` — mutations (thin, Zod-validated)
- [ ] `components/portal/<module>/` — UI components
- [ ] Nav item in `constants/portal/navigation.ts` with correct `roles: [USER_ROLE.X]`
- [ ] Manual test: correct role sees it, other roles don't

## Navigation

Sidebar reads `getNavItemsByRole(userRole)` from `constants/portal/navigation.ts`.  
Each `NavItem` has `{ href, label, icon, roles[] }`.  
Active state is checked by `pathname.startsWith(href)` in `PortalSidebar`.

## Dashboard pattern (role-dispatched)

`app/(portal)/portal/[role]/page.tsx` switches on `routeToRole(urlRole)`:
- `SYSTEM_ADMIN` → `<AdminDashboard />`
- `TEACHER` → `<TeacherDashboard />`
- `STUDENT` → fetches stats in parallel, passes to `<StudentDashboard />`

Follow this pattern for any role-conditional rendering.

## Admin CMS pattern

CMS modules (courses, hero-slides, etc.) follow this structure:
```
components/portal/admin/<module>/
  <Module>Table.tsx    # List view with HeroUI Table
  <Module>Form.tsx     # Create/edit form (React Hook Form + Zod)
  <Module>Modal.tsx    # Wraps form in HeroUI Modal
```

Server Action in `actions/<module>.actions.ts`:
- `create<Module>` / `update<Module>` / `delete<Module>`
- Validate with Zod schema, call service, revalidate path

## Notifications

Realtime notifications via Supabase channel — see `components/portal/NotificationDropdown.tsx`.  
Backend: `services/portal/notification.service.ts` + `actions/notification.actions.ts`.
