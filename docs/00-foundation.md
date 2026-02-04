# 00 — Foundation / Setup Guide (Next.js + NextAuth + Shadcn)

## 1) Packages cần có
```bash
npm i next-auth @auth/prisma-adapter
npm i zod react-hook-form @hookform/resolvers react-toastify dayjs @radix-ui/react-tooltip
npm i clsx tailwind-merge
# shadcn
npx shadcn@latest init
```

Gợi ý thêm (không bắt buộc):
- `@tanstack/react-table` (table nâng cao)
- `react-virtual` (virtualize attendance table nếu nhiều cột)

## 2) Shadcn components (portal hay dùng)
```bash
npx shadcn@latest add button input label badge card tabs dialog dropdown-menu table avatar separator sheet form toast
npx shadcn@latest add tooltip calendar select textarea checkbox radio-group
```

## 3) Folder structure (App Router)
```
Dynamic Route như hiện tại
```

## 4) RBAC (3 roles)
Roles:
- `SYSTEM_ADMIN`
- `TEACHER`
- `STUDENT`

Route rules (MVP):
- `/admin/**` => SYSTEM_ADMIN
- `/teacher/**` => TEACHER
- `/student/**` => STUDENT

## 5) Prisma schema (gợi ý tối thiểu để chạy NextAuth + role)

```prisma
enum UserRole {
  SYSTEM_ADMIN
  TEACHER
  STUDENT
}

## 6) NextAuth config (App Router)
Tạo `app/api/auth/[...nextauth]/route.ts`:
- Provider: Google (MVP) + Credentials (email/password) nếu cần
- PrismaAdapter
- callbacks:
  - `jwt` thêm `role`, `status`
  - `session` expose `user.role`, `user.id`
  - chặn user `LOCKED`

Pseudo (không phải code hoàn chỉnh):
- `callbacks.jwt({ token, user })` → set `token.role = user.role`
- `callbacks.session({ session, token })` → set `session.user.role = token.role`

## 7) Middleware guard (bắt buộc)
- Dùng `withAuth` hoặc đọc JWT từ NextAuth để redirect/403.
- Matchers:
  - `/admin/:path*`
  - `/teacher/:path*`
  - `/student/:path*`
- Logic:
  - chưa login → redirect `/login`
  - sai role → redirect về dashboard đúng role hoặc show 403

## 8) Form pattern chuẩn (react-hook-form + zod + toastify)
- Zod schema ở `lib/validators/*`
- `zodResolver`
- Toast success/error
- Client components cho form; server actions cho create/update nếu phù hợp

## 9) Conventions UI
- Layout shell: sidebar trái + topbar (search + bell + user menu)
- Dùng shadcn: `Sheet/Dialog/DropdownMenu/Table`
- States: loading / empty / error luôn có

## 10) Definition of Done (DoD)
- RBAC OK (không leak dữ liệu)
- CRUD chạy + validation zod
- UX: optimistic update (attendance) + toast feedback
- Seed demo data đủ để demo luồng
- Basic tests: smoke e2e (login → class → session → attendance)
