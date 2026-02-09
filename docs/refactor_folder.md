# REFACTOR SUMMARY – HSK Master (Next.js App Router) + utils decision

Mục tiêu: tổng hợp các refactor đã thống nhất để làm sạch cấu trúc dự án, tránh “nhét hết vào `app/`”, và chốt cách tổ chức `utils` (không over-engineering).

---

## 1) Vấn đề hiện tại (Current issues)
- `app/` đang chứa quá nhiều thứ không thuộc routing (constants/enums/interfaces/types/services/hooks/providers/utils…)
- Dễ rối dependency (app import app), khó scale portal
- `utils` đang gây “cấn cấn”: tách folder sớm hay để file?

---

## 2) Refactor goals (Must)
- `app/` chỉ dùng cho **routes/layout/page/api/actions**
- Code dùng chung đưa ra root-level theo đúng trách nhiệm:
  - `components/` cho UI dùng lại
  - `lib/` cho core logic (http/db/auth/validators ( nếu có )/portal helpers)
  - `services/` cho layer gọi API từ client
  - `constants/enums/types/interfaces` ở root-level
- Import chuẩn bằng alias `@/`
- Không đổi business logic, chỉ di chuyển + update import
- Không reload page sau CRUD (update state/refetch data không reload route)

---

## 3) Target structure (Sau refactor)

```txt
.
├─ app/
│  ├─ (landing)/
│  ├─ (portal)/
│  ├─ (portal-auth)/
│  ├─ api/                  # route handlers
│  ├─ actions/              # server actions (nếu dùng)
│  ├─ layout.tsx
│  └─ globals.css
│
├─ components/              # shared UI
│  ├─ portal/
│  ├─ landing/
│  └─ ui/
│
├─ lib/                     # core logic
│  ├─ http/                 # axios client + loaderBridge
│  ├─ portal/               # breadcrumb helpers (folder)
│  └─ utils.ts              # ✅ utils as a single file (see section 4)
│  ├─ db/                   # prisma/supabase helpers (optional)
│  ├─ auth/                 # next-auth helpers (optional)
│  ├─ validators/           # zod schemas (folder)
│
├─ services/                # client service layer (optional)
│  ├─ classes.service.ts
│  ├─ students.service.ts
│  └─ attendance.service.ts
│
├─ constants/
├─ enums/
├─ interfaces/
├─ types/
├─ hooks/
├─ providers/
├─ styles/
├─ prisma/
└─ public/

II. Tiếp đến, Check lại favicon cho tôi
Export
