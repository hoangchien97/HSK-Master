# NextAuth Authentication Spec — Dynamic Role Router (Next.js App Router)

## Scope
Authentication & authorization system for Portal using:
- **Next.js App Router**
- **NextAuth (Auth.js)**
- **Dynamic routing by role**: `/portal/[role]/...`
- **3 roles**: `SYSTEM_ADMIN`, `TEACHER`, `STUDENT`
- **Login methods**:
  - Google OAuth
  - Email / Password (Credentials)
  - Register (Email / Password)
- **No middleware** — use **server-side proxy guard in layout/page**
- UI login + callback flow giữ nguyên như hiện tại (NextAuth default endpoints)

---

## 1. Role Mapping

| Role enum        | Route segment |
|------------------|---------------|
| SYSTEM_ADMIN     | admin         |
| TEACHER          | teacher       |
| STUDENT          | student       |

Redirect rule sau login:
```
SYSTEM_ADMIN → /portal/admin/dashboard
TEACHER      → /portal/teacher/dashboard
STUDENT      → /portal/student/dashboard
```

---

## 2. Route Structure (Dynamic)

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  portal/
    page.tsx                  // role resolver (redirect)
    [role]/
      layout.tsx              // proxy guard (role-based)
      dashboard/page.tsx
      ...
  api/
    auth/
      [...nextauth]/route.ts
    auth/
      register/route.ts
```

---

## 3. Database Schema (Prisma)

### Enums
```prisma
enum UserRole {
  SYSTEM_ADMIN
  TEACHER
  STUDENT
}

enum UserStatus {
  ACTIVE
  LOCKED
  PENDING
}
```

### User Model
```prisma
model User {
  id            String      @id @default(cuid())
  name          String?
  email         String?     @unique
  emailVerified DateTime?
  image         String?

  role          UserRole    @default(STUDENT)
  status        UserStatus  @default(ACTIVE)

  phone         String?
  passwordHash  String?

  accounts      Account[]
  sessions      Session[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

> Các model `Account`, `Session`, `VerificationToken` dùng chuẩn của Prisma Adapter (NextAuth).

---

## 4. NextAuth Configuration Spec

### File: `lib/auth.ts`

**Requirements**
- Adapter: Prisma
- Session strategy: `jwt`
- Providers:
  - Google
  - Credentials (email/password)
- Default role cho user mới: `STUDENT`
- Chặn user `LOCKED` hoặc `PENDING`
- Expose `user.id`, `user.role`, `user.status` vào session

### Providers
- **Google**
  - Tạo user mới nếu chưa tồn tại
- **Credentials**
  - Verify email tồn tại
  - Verify password hash
  - Chặn nếu status != ACTIVE

### Callbacks

#### `signIn`
- Fetch user từ DB
- Return `false` nếu:
  - status = LOCKED
  - status = PENDING

#### `jwt`
- Lưu vào token:
  - `uid`
  - `role`
  - `status`
- Refresh từ DB nếu cần

#### `session`
- Gán:
  - `session.user.id`
  - `session.user.role`
  - `session.user.status`

#### `redirect`
- Giữ callbackUrl hiện tại (UI đang dùng)
- Chỉ cho redirect same-origin
- Fallback `/portal`

---

## 5. Register (Email / Password)

### Endpoint
```
POST /api/auth/register
```

### Input
```ts
{
  name: string
  email: string
  password: string
}
```

### Rules
- Validate bằng Zod
- Email unique
- Hash password (bcrypt / argon2)
- role = STUDENT
- status = ACTIVE (hoặc PENDING nếu muốn duyệt)

### After register
- UI gọi:
```ts
signIn("credentials", { email, password, callbackUrl: "/portal" })
```

---

## 6. Proxy Guard (Không dùng middleware)

### A. `/portal/page.tsx` — Role Resolver
Server component:
- `getServerSession`
- Nếu chưa login → `/login`
- Nếu login → redirect theo role

Pseudo:
```ts
if (!session) redirect("/login")
redirect(`/portal/${routeFromRole(session.user.role)}/dashboard`)
```

---

### B. `/portal/[role]/layout.tsx` — Role Guard

**Responsibilities**
- Chặn user chưa login
- Chặn role mismatch
- Chặn status != ACTIVE
- Render portal shell nếu hợp lệ

Pseudo:
```ts
const session = await getServerSession()
if (!session) redirect("/login")

if (session.user.status !== "ACTIVE")
  redirect("/login?error=locked")

if (params.role !== roleFromSession)
  redirect(`/portal/${roleFromSession}/dashboard`)
```

---

## 7. API Authorization Rule

Mọi API route phải:
1. `getServerSession`
2. Check role
3. Return `403` nếu không đủ quyền

Không rely vào UI guard.

---

## 8. Login UI Integration

### Google Login
```ts
signIn("google", { callbackUrl: "/portal" })
```

### Credentials Login
```ts
signIn("credentials", {
  email,
  password,
  callbackUrl: "/portal"
})
```

### Error Mapping (UI)
| Error code              | Message hiển thị |
|-------------------------|------------------|
| CredentialsSignin      | Sai email/mật khẩu |
| ACCOUNT_LOCKED          | Tài khoản bị khóa |
| OAuthAccountNotLinked   | Email đã dùng phương thức khác |

Toast hiển thị bằng `react-toastify`.

---

## 9. Acceptance Checklist

- [ ] Google login tạo user mới role STUDENT
- [ ] Register email/password → login được
- [ ] Session có `user.id`, `user.role`, `user.status`
- [ ] `/portal` redirect đúng role
- [ ] `/portal/[role]/*` chặn role mismatch
- [ ] User LOCKED không login được (Google + Credentials)
- [ ] API trả 403 nếu role không đủ

---

## 10. Notes cho Copilot

> “Implement NextAuth using Prisma Adapter, Google + Credentials providers.
> Use JWT session.
> Do NOT use middleware.
> Protect routes using server-side layout proxy in `/portal/[role]/layout.tsx`.
> Redirect user based on role enum.
> Keep NextAuth callback endpoints default.
> UI uses shadcn, react-hook-form, zod, toastify.”
