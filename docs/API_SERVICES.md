# API vs Services Architecture

## Tóm tắt

- **`app/api/`**: Next.js Route Handlers - HTTP endpoints phía server
- **`app/services/`**: Business logic layer - tái sử dụng code giữa server/client

---

## 📁 `app/api/` - Next.js Route Handlers

### Mục đích
- Tạo REST API endpoints cho frontend gọi
- Handle HTTP requests (GET, POST, PUT, DELETE)
- Server-side validation & authorization
- Direct database operations via Prisma

### Cấu trúc
```
app/api/
  portal/
    profile/
      route.ts       → GET /api/portal/profile
    schedules/
      route.ts       → GET/POST /api/portal/schedules
      [id]/
        route.ts     → GET/PUT/DELETE /api/portal/schedules/:id
```

### Ví dụ
```typescript
// app/api/portal/profile/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true }
  })

  return Response.json(user)
}
```

### Khi nào dùng?
✅ Cần expose endpoint cho client gọi  
✅ Handle form submissions  
✅ Upload files  
✅ Webhook handlers  
✅ Third-party API integrations  

---

## 📁 `app/services/` - Business Logic Layer

### Mục đích
- Tách logic nghiệp vụ ra khỏi API routes
- Tái sử dụng code giữa nhiều routes
- Dùng trong Server Components & API routes
- Unit testing dễ dàng hơn

### Cấu trúc
```
app/services/
  portal/
    profile.service.ts    → getProfile(), updateProfile()
    schedule.service.ts   → getSchedules(), createSchedule()
    index.ts              → Export all services
```

### Ví dụ
```typescript
// app/services/portal/profile.service.ts
import { prisma } from "@/lib/prisma"

export async function getProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  })
}

export async function updateProfile(userId: string, data: UpdateProfileData) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  })
}
```

### Sử dụng trong API route
```typescript
// app/api/portal/profile/route.ts
import { auth } from "@/auth"
import { getProfile, updateProfile } from "@/app/services/portal/profile.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await getProfile(session.user.id)
  return Response.json(profile)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await req.json()
  const updated = await updateProfile(session.user.id, data)
  return Response.json(updated)
}
```

### Sử dụng trong Server Component
```typescript
// app/(portal)/portal/profile/page.tsx
import { auth } from "@/auth"
import { getProfile } from "@/app/services/portal/profile.service"

export default async function ProfilePage() {
  const session = await auth()
  const profile = await getProfile(session!.user.id)
  
  return <ProfileView profile={profile} />
}
```

### Khi nào dùng?
✅ Logic nghiệp vụ phức tạp  
✅ Cần dùng lại ở nhiều nơi  
✅ Server Components cần data  
✅ Testing isolated business logic  

---

## 🔄 Luồng hoạt động

### Client → API → Service
```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐
│   Client    │─────→│  API Route   │─────→│    Service     │
│ (fetch)     │ HTTP │ /api/portal/ │      │ profile.srv.ts │
└─────────────┘      └──────────────┘      └────────────────┘
                            │                       │
                            ↓                       ↓
                      Auth Check            ┌─────────────┐
                      Validation            │   Prisma    │
                      Error Handling        └─────────────┘
```

### Server Component → Service
```
┌──────────────────┐      ┌────────────────┐
│ Server Component │─────→│    Service     │
│   (async fn)     │      │ profile.srv.ts │
└──────────────────┘      └────────────────┘
         │                       │
         ↓                       ↓
    Auth from          ┌─────────────┐
    session            │   Prisma    │
                       └─────────────┘
```

---

## 💡 Best Practices

### API Routes
- ✅ Validate input với Zod schema
- ✅ Check authentication & authorization
- ✅ Return consistent error format
- ✅ Use HTTP status codes đúng (200, 201, 400, 401, 404, 500)
- ❌ Không viết business logic phức tạp trong route

### Services
- ✅ Pure functions, predictable
- ✅ Single Responsibility Principle
- ✅ TypeScript types rõ ràng
- ✅ Error handling với try-catch
- ❌ Không handle HTTP requests
- ❌ Không trả về Response objects

---

## 📝 So sánh

| Tiêu chí | `app/api/` | `app/services/` |
|----------|------------|-----------------|
| **Purpose** | HTTP endpoints | Business logic |
| **Run** | Server only | Server only |
| **Call from** | Client (fetch) | Server Component, API route |
| **Return** | `Response` object | Data/objects |
| **Auth** | Check session | Receive userId param |
| **Validation** | Input validation | Data transformation |
| **Testing** | Integration test | Unit test |

---

## 🎯 useHttpClient Hook

### Mục đích
- Tự động hiển thị global loading spinner khi gọi API
- Centralized error handling
- Consistent fetch wrapper cho client components

### Sử dụng
```typescript
"use client"

import { useHttpClient } from "@/app/hooks"
import { useEffect, useState } from "react"

export default function ProfileClient() {
  const http = useHttpClient()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      const { data, ok } = await http.get("/api/portal/profile")
      if (ok) {
        setProfile(data)
      }
    }
    loadProfile()
  }, [])

  const handleUpdate = async (newData) => {
    const { data, ok } = await http.put("/api/portal/profile", newData)
    if (ok) {
      setProfile(data)
      toast.success("Cập nhật thành công!")
    }
  }

  return <div>...</div>
}
```

### Lợi ích
✅ Auto-show loading spinner (LoadingContext)  
✅ Auto-show error toast  
✅ Consistent API across codebase  
✅ Abort ongoing requests on unmount  

---

## 📚 Kết luận

- `app/api/`: HTTP interface cho client
- `app/services/`: Business logic tái sử dụng
- `useHttpClient`: Wrapper cho fetch trong client components
- Services giúp code clean, testable, reusable
- API routes chỉ lo routing & validation
