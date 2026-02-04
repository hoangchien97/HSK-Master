# Sprint 1 — Auth (NextAuth) + RBAC + Layout Shell

## Goal
Đăng nhập/đăng ký chạy bằng NextAuth, role-based routing đúng 3 role, có portal shell (sidebar/topbar) theo vibe design.

## Scope
### 1) Auth (NextAuth)
- Google login (bắt buộc)
- Credentials login (optional; nếu có form email/password như design)
- Register page (nếu dùng Credentials): tạo user + hash password (nếu bạn muốn)
- Forgot password (optional cho MVP nếu chỉ Google)
- Logout

### 2) Role & status
- Field `role` và `status` trên User (Prisma)
- Seed tạo 1 SYSTEM_ADMIN, 1 TEACHER, 2 STUDENT
- Admin có UI nhỏ để promote/demote role (có thể để Sprint 7; Sprint 1 chỉ seed)

### 3) RBAC middleware
- `/admin/**` only SYSTEM_ADMIN
- `/teacher/**` TEACHER
- `/student/**` STUDENT

### 4) Layout shell (shadcn)
- Sidebar items theo role
- Topbar: search (UI), bell dropdown (UI stub), user dropdown (profile/logout)

## Acceptance Criteria
- [ ] Login Google thành công → điều hướng theo role
- [ ] Middleware chặn truy cập sai role
- [ ] Refresh vẫn giữ session
- [ ] UI shell consistent (shadcn + tailwind)

## Tasks
- [ ] Setup NextAuth route handler + env vars
- [ ] Prisma models for NextAuth + role
- [ ] Seed users (admin/teacher/students)
- [ ] Implement middleware guards
- [ ] Build shell layout

## Demo checklist
- Login admin → /admin/dashboard
- Login teacher → /teacher/dashboard
- Login student → /student/home
- Student cố vào /admin/users → bị chặn
