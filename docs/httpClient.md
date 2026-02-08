# PROMPT (Vibe Coding Copilot) – Portal Layout (App Router) + Global Loading Overlay + Axios Client + Breadcrumb (Spec-first)

Bạn đang triển khai portal quản lý HSK bằng **Next.js App Router** + **Tailwind** + **Prisma** + **Supabase**.
Hãy tạo portal layout chuẩn dashboard: **Sidebar + Header cố định**, chỉ **Page Content** scroll được.
Thêm **Global Loading Overlay** chỉ phủ vùng Page Content (không che sidebar/header).
Tạo **Axios client** có interceptor tự bật/tắt loading theo `meta.loading`.
Thêm **Breadcrumb** hiển thị đúng context điều hướng trong portal (đặt trong Page Content, ngay dưới header).

> Lưu ý: **Không cần hardcode Tailwind class chính xác**. Hãy tự chọn class/layout phù hợp miễn đúng behavior & UX.

---

## 0) Goals (Must)
### 0.1 Layout
- Có `PortalSidebar` cố định bên trái, full height (`100vh`).
- Có `PortalHeader` cố định/sticky ở top của vùng bên phải, height cố định (ví dụ 64px).
- **Chỉ phần Page Content (render children)** là scrollable.
- Không scroll toàn body (tránh việc header/sidebar bị cuộn theo).
- Sidebar có thể có scroll riêng nếu menu dài.
- Không scroll toàn body (tránh việc header/sidebar bị cuộn theo).
Nếu - có loading - 100vh - height Portal Header để loading căn giữa
Nếu k có - thì height có thể có scroll hay k thì tùy
### 0.2 Loading
- Có `PortalUIProvider` quản lý loading global theo dạng **counter** hoặc **key map** để support nhiều request cùng lúc.
- Khi page fetch data bằng axios → overlay loading tự hiển thị.
- Overlay **chỉ phủ Page Content** (không che header/sidebar).
- Overlay chặn tương tác vùng content khi đang loading.

### 0.3 HTTP client
- Dùng axios instance gọi `/api/...`
- Interceptor:
  - request: start loading (default)
  - response/error: stop loading
- Cho phép tắt loading theo request:
  - `meta: { loading: false }` → không bật overlay
- Chuẩn hóa lỗi trả về (normalize) `{ message, status }` để sau này toast.

### 0.4 Breadcrumb
- Có Breadcrumb ở **đầu Page Content**, ngay dưới header (breadcrumb scroll theo content).
- Breadcrumb thể hiện cấp điều hướng: vd `Quản lý lớp / Danh sách lớp`.
- Item cuối cùng (current) **không clickable**.
- Các item trước clickable, navigate bằng `next/link`.
- Không render breadcrumb ở Dashboard (optional), nhưng render ở các trang quản lý.

---

## 1) File structure (Create/Update)
Tạo/cập nhật tối thiểu các file sau:

### 1.1 Layout
1) `app/(portal)/layout.tsx` (Server Component)
- Wrap `PortalUIProvider` (Client)
- Render:
  - `<PortalSidebar />`
  - Right area:
    - `<PortalHeader />`
    - `<PortalContent>{children}</PortalContent>`

### 1.2 Provider + Store
2) `app/providers/PortalUIProvider.tsx` (Client)
- context + hook `usePortalUI()`
- expose:
  - `startLoading(key?: string)`
  - `stopLoading(key?: string)`
  - `isLoading`

### 1.3 Components
3) `app/components/portal/PortalSidebar.tsx`
4) `app/components/portal/PortalHeader.tsx`
5) `app/components/portal/PortalContent.tsx` (Client)
- render breadcrumb area (slot) + children
- render Global Loading Overlay khi `isLoading === true`

### 1.4 Breadcrumb
6) `app/components/portal/PortalBreadcrumb.tsx` (Client/Server đều được)
- Nhận `items: Array<{ label: string; href?: string }>`
- Render theo rules: item cuối không link

7) `lib/portal/breadcrumb.ts`
- `routeMeta` map: pathname -> label (static)
- helper build breadcrumb từ pathname + params + optional dynamic labels

8) `lib/portal/useBreadcrumb.ts` (Client hook)
- dùng `usePathname()` để build breadcrumb items
- hỗ trợ dynamic label (vd class name) qua props hoặc store

### 1.5 HTTP client
9) `lib/http/loaderBridge.ts`
- `setGlobalLoader(fnStart, fnStop)`
- `globalStartLoading(key)`
- `globalStopLoading(key)`

10) `lib/http/client.ts`
- axios instance `api`
- baseURL `/api`
- interceptor tích hợp loaderBridge
- hỗ trợ `meta.loading === false`

### 1.6 Demo API & pages
11) `app/api/classes/route.ts`: mock list class JSON.
12) `app/(portal)/classes/page.tsx`: client page fetch `/api/classes`, hiển thị list + search (basic), breadcrumb `Quản lý lớp / Danh sách lớp`.
13) (Optional but recommended) `app/(portal)/classes/[id]/page.tsx`: page detail demo breadcrumb `Quản lý lớp / <Tên lớp>` (dynamic label).

---

## 2) Behavior Spec (Strict)
### 2.1 Scroll behavior
- Sidebar & Header luôn đứng yên.
- Page Content scroll khi nội dung dài.
- Breadcrumb nằm trong Page Content nên cũng scroll theo.

### 2.2 Loading overlay behavior
- Khi axios request chạy (mặc định) → overlay hiện.
- Khi request xong (success/fail) → overlay tắt.
- Nếu nhiều request đồng thời → overlay chỉ tắt khi tất cả đã xong (counter/map).
- `meta.loading:false` → request đó không làm overlay hiện.

### 2.3 Error normalize
- Từ axios error → chuẩn hóa:
  - `status` (number | undefined)
  - `message` (string)
- Không cần toast trong task này, chỉ chuẩn hóa output để sau thêm toast.

### 2.4 Breadcrumb rules (Strict)
- Breadcrumb hiển thị tối đa 3–4 cấp (nếu sâu hơn thì collapse middle: `A / ... / C`).
- Item cuối (current page) không clickable.
- Items có href phải dùng `<Link>` để navigate.
- Breadcrumb label static lấy từ `routeMeta`.
- Breadcrumb label dynamic (vd tên lớp) phải hỗ trợ:
  - lấy từ `searchParams`/`params` và gọi API để resolve name
  - hoặc nhận `dynamicLabels` từ page (recommended cho đơn giản)

---

## 3) Breadcrumb Spec – routeMeta (example)
Tạo `routeMeta` như sau (chỉ là gợi ý, có thể chỉnh):
- `/portal/classes` -> `Quản lý lớp`
- `/portal/classes/[id]` -> `Chi tiết lớp`
- `/portal/attendance` -> `Điểm danh`
- `/portal/students` -> `Học viên`
- `/portal/homework` -> `Bài tập`

### Rules mapping
- Với App Router group `(portal)`, pathname thực tế có thể là `/classes` nếu bạn cấu hình vậy.
- Hãy đảm bảo breadcrumb builder match đúng theo routing bạn dùng (có thể prefix `/portal` hoặc không).

---

## 4) Output expectations (Acceptance Criteria)
- Portal layout chạy đúng: fixed sidebar/header + scrollable content.
- Loading overlay hoạt động đúng theo axios interceptor.
- Support nhiều request đồng thời không bị tắt sai.
- Breadcrumb hiển thị đúng theo route:
  - `/classes` => `Quản lý lớp / Danh sách lớp`
  - `/classes/abc` => `Quản lý lớp / <Tên lớp>`
- Item cuối không clickable, item trước clickable.
- Page demo `/classes` fetch và render list thành công.
- Không phụ thuộc UI framework ngoài (HeroUI làm sau).
- Code clean, dễ mở rộng.

---

## 5) Notes (Implementation hints, not strict)
- `PortalUIProvider` nên gọi `setGlobalLoader(startLoading, stopLoading)` trong `useEffect` để nối axios ↔ provider.
- Content scroll trong layout flex cần `min-height: 0` ở container phù hợp để overflow hoạt động đúng.
- Breadcrumb builder có thể:
  - split pathname segments
  - map segments -> labels
  - handle dynamic segments `[id]` bằng placeholder + dynamic label resolver

## 6) Example usage in a portal page - app/(portal)/classes/page.tsx (Client hoặc Server) - Nếu Client page: - useEffect gọi api.get("/classes") => overlay tự bật - Nếu Server page: - data fetch server side (không cần overlay), nhưng actions client vẫn dùng axios

## 7) Đồng bộ lại các màn, sẽ có Breadcrumb ( nên tạo component commmon portal để handle )

## 8) Các màn hình quản lý có Filter/Table/Paging thì cũng nên đồng bộ nhau và cách UI/UX. rà soát và update lại các màn

---
Note: Đã cài axios cho dự án, UI sử dụng HeroUI
- scope: update liên quan tới portal
- Và ở các màn quản lý, cần dùng client render thì dùng
