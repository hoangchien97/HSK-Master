# App Structure: API vs Services

## 📁 `app/api/` - Next.js API Routes (Backend Endpoints)

### Mục đích
- **Backend API endpoints** sử dụng Next.js Route Handlers
- Xử lý HTTP requests từ client (GET, POST, PUT, DELETE, etc.)
- Truy cập database, thực hiện business logic server-side
- Bảo mật với authentication/authorization

### Đặc điểm
- File phải tên là `route.ts` hoặc `route.js`
- Export các functions: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Chạy **server-side only** - có thể truy cập database, secrets
- Trả về Response objects (JSON, status codes, headers)

### Ví dụ
```typescript
// app/api/portal/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data,
  });

  return NextResponse.json(updated);
}
```

### Khi nào dùng
- ✅ Cần xử lý HTTP requests từ client
- ✅ Truy cập database trực tiếp
- ✅ Authentication/Authorization checks
- ✅ Upload files, external API calls
- ✅ CRUD operations với bảo mật

---

## 📁 `app/services/` - Business Logic Layer (Service Functions)

### Mục đích
- **Reusable business logic functions**
- Tách logic phức tạp ra khỏi components và API routes
- Data fetching, transformations, calculations
- Có thể dùng ở cả server components và API routes

### Đặc điểm
- TypeScript modules với exported functions
- **Server-side only** nếu có database queries
- Không nhận Request/Response objects
- Trả về plain data (objects, arrays, primitives)
- Tái sử dụng được ở nhiều nơi

### Ví dụ
```typescript
// app/services/portal/profile.service.ts
import { prisma } from "@/lib/prisma";
import type { PortalUser } from "@/app/interfaces/portal/profile";

export async function getUserProfile(email: string): Promise<PortalUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      fullName: true,
      email: true,
      image: true,
      role: true,
      phoneNumber: true,
      address: true,
      dateOfBirth: true,
      biography: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function updateUserProfile(
  email: string,
  data: Partial<PortalUser>
): Promise<PortalUser> {
  const updated = await prisma.user.update({
    where: { email },
    data: {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
      biography: data.biography,
      image: data.image,
    },
  });

  return updated;
}
```

### Sử dụng trong API Route
```typescript
// app/api/portal/profile/route.ts
import { getUserProfile, updateUserProfile } from "@/app/services/portal/profile.service";

export async function GET() {
  const session = await auth();
  const user = await getUserProfile(session.user.email); // Sử dụng service
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const data = await req.json();
  const updated = await updateUserProfile(session.user.email, data); // Sử dụng service
  return NextResponse.json(updated);
}
```

### Sử dụng trong Server Component
```typescript
// app/(portal)/portal/profile/page.tsx
import { getUserProfile } from "@/app/services/portal/profile.service";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  const user = await getUserProfile(session.user.email); // Sử dụng service trực tiếp

  return <ProfileClient user={user} />;
}
```

### Khi nào dùng
- ✅ Logic cần tái sử dụng ở nhiều nơi
- ✅ Complex data transformations
- ✅ Database queries cần dùng ở cả Server Components và API routes
- ✅ Business rules, calculations
- ✅ Giữ code sạch, dễ test

---

## 🎯 So sánh

| Tiêu chí | `app/api/` | `app/services/` |
|----------|-----------|----------------|
| **Loại** | HTTP endpoints | Business logic functions |
| **File name** | `route.ts` | `*.service.ts` |
| **Nhận** | Request objects | Plain parameters |
| **Trả về** | Response objects | Plain data |
| **Dùng ở** | Client calls (fetch) | Server Components, API routes |
| **HTTP methods** | GET, POST, PUT, DELETE | N/A |
| **Auth check** | Mỗi route phải check | Không (caller phải check) |

---

## 💡 Best Practices

### 1. Separation of Concerns
```typescript
// ❌ BAD: Everything in API route
export async function GET() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const transformedData = { ...user, displayName: `${user.fullName} (${user.role})` };
  return NextResponse.json(transformedData);
}

// ✅ GOOD: Service handles logic
export async function GET() {
  const session = await auth();
  const user = await getUserDisplayProfile(session.user.email); // Service
  return NextResponse.json(user);
}
```

### 2. Reusability
```typescript
// app/services/portal/schedule.service.ts
export async function getTeacherSchedule(teacherId: string) {
  return await prisma.schedule.findMany({
    where: { teacherId },
    include: { class: true },
  });
}

// Sử dụng ở API route
// app/api/portal/schedules/route.ts
export async function GET() {
  const schedule = await getTeacherSchedule(session.user.id);
  return NextResponse.json(schedule);
}

// Sử dụng ở Server Component
// app/(portal)/portal/schedule/page.tsx
const schedule = await getTeacherSchedule(session.user.id);
```

### 3. Type Safety
```typescript
// app/services/portal/types.ts
export interface ScheduleDTO {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  className: string;
}

// app/services/portal/schedule.service.ts
export async function getScheduleEvents(): Promise<ScheduleDTO[]> {
  const events = await prisma.schedule.findMany();
  return events.map(transformToDTO);
}
```

---

## 🔄 Request Flow Example

```
Client (Browser)
  │
  ├─ fetch("/api/portal/profile")    ← HTTP Request
  │
  └─► app/api/portal/profile/route.ts
       │
       ├─ Check authentication
       ├─ Validate request
       │
       └─► app/services/portal/profile.service.ts
            │
            ├─ Query database
            ├─ Transform data
            └─ Return data
       │
       ├─ Format response
       └─ Return NextResponse
  │
Client receives JSON ◄─
```

---

## 📝 Summary

- **`app/api/`**: Các endpoint HTTP mà client gọi qua fetch/axios
- **`app/services/`**: Business logic được sử dụng bởi API routes và Server Components
- **httpClient hook**: Wrapper xung quanh fetch để tự động show loading spinner, error handling
- **Services** làm code dễ maintain, test, và reuse hơn
