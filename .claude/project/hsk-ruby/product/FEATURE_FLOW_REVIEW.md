# Ruby HSK — Feature Flow Review

**Date:** 2026-06-24
**Source:** Codebase audit + navigation.ts + portal module analysis

---

## 1. Public Visitor Flow

### Current behavior
```
Landing (/) → Hero CTA → /contact → Contact form → Registration created → (nothing)
```

### Problems
1. Visitor phải navigate sang trang khác để đăng ký → drop-off
2. Sau khi form submit, admin không biết lead đến (không có status pipeline)
3. Không có trial/preview → visitor không trải nghiệm sản phẩm trước khi đăng ký
4. Không có FAQ → câu hỏi thường gặp (học phí, lịch học, trình độ) phải hỏi qua contact

### Recommended flow
```
Landing (/) 
  → Hero (3-field inline form: name, phone, level)
      → Registration created (status: PENDING)
      → Success message inline
      → Admin nhận notification: "Đăng ký mới từ [name]"
  → OR Trial CTA → /courses/[hsk-1-slug] preview (no login)
  → FAQ accordion (học phí, lịch, trình độ, online/offline)
```

### Required modules
- Hero inline lead form (P1)
- Registration status pipeline (P1)
- Notification khi có registration mới (có thể dùng email, hoặc admin dashboard count)
- FAQ section (P2)
- Trial/preview entry point (P1)

---

## 2. Student Flow

### Current behavior
```
Login → /portal/student (dashboard)
  → Continue learning card → /student/practice/[level]/[slug]
  → Schedule (view only)
  → Classes (enrolled list)
  → Attendance (read-only)
  → Assignments (submit)
  → Vocabulary / Bookmarks / Progress
  → AI Chatbot (floating bubble, undiscoverable)
```

### Problems
1. AI Chatbot không có entry point rõ ràng — học viên không biết có feature này
2. "Bài kiểm tra" (Quizzes) trong sidebar dẫn tới trang "Đang phát triển" — gây thất vọng
3. Không có luồng rõ ràng: học bài → luyện tập → kiểm tra tiến độ

### Recommended flow
```
Login → Dashboard
  → "Tiếp tục học" (dominant element) → Practice session
  → "Lịch học hôm nay" → Schedule
  → "Bài tập chờ nộp" → Assignments
  → Sidebar: Luyện tập / Từ vựng / Đã lưu / Tiến độ / AI Trợ lý (✅ visible)
  → Quizzes: Build out hoặc ẩn nav item cho đến khi có
```

### Required modules
- AI Chatbot sidebar nav item + onboarding tooltip (P1)
- Quizzes: build out (P2) hoặc remove nav item (P0)
- Continue learning card là dominant visual element (P2 — design)

---

## 3. Teacher Flow

### Current behavior
```
Login → /portal/teacher (dashboard)
  → Classes → Class detail (students, schedule, assignments)
  → Students (own class only)
  → Schedule (BigCalendar + Google Calendar sync)
  → Attendance (matrix view + Excel export)
  → Assignments (create/edit/grade)
  → "Bài kiểm tra" → BUG: notFound()
```

### Problems
1. **BUG:** "Bài kiểm tra" nav item → `notFound()` vì page chỉ cho phép STUDENT
2. Không có aggregate view điểm (grade book) — chấm từng bài một
3. Không xem được tiến độ học của từng học viên
4. Google Calendar scope request ngay lúc login, ngay cả khi teacher không dùng — giảm conversion

### Recommended flow
```
Login → Dashboard (stats + today schedule + pending submissions)
  → My Classes → Class detail
      → Tab: Học viên (+ tiến độ luyện tập per student — P2)
      → Tab: Lịch học
      → Tab: Bài tập (+ aggregate score view — 📌 Todo)
  → Điểm danh (matrix + export)
  → Lịch giảng dạy (calendar + Google Cal sync — incremental auth P2)
  → [REMOVE "Bài kiểm tra" nav item — P0]
```

### Required modules
- Fix/remove teacher quizzes nav item (P0)
- Student progress view in class detail (P2)
- Incremental Google Calendar auth for teachers only (P2 — R02)

---

## 4. SYSTEM_ADMIN Flow

### Current behavior
```
Login → /portal/admin (sparse dashboard — CMS quick links + content counts)
  → CMS modules (hero-slides, courses, hsk-levels, categories, albums, reviews, features, cta-stats, seo)
  → Users (CRUD all users)
  → Registrations (view list only — no status)
```

### Problems
1. Dashboard không cho thấy tình trạng vận hành: registrations mới, lớp hôm nay, học viên mới
2. Registrations không có status pipeline → leads bị bỏ quên
3. Không có dedicated teacher management view (workload, classes, schedule)
4. Không thể xem tiến độ học viên từ admin

### Recommended flow
```
Login → Dashboard
  → Top row: 4 quick actions (Thêm học viên, Thêm lớp, Xem đăng ký, Export)
  → Left 2/3: Activity feed (đăng ký mới, học viên mới, lớp hôm nay)
  → Right 1/3: Stats (tổng học viên, đăng ký chờ xử lý, lớp đang hoạt động)

  → Quản lý
      → Người dùng (all users CRUD)
      → Học viên (students view)
      → Giáo viên (teachers view — P2)
      → Đăng ký (status pipeline: PENDING→CONTACTED→ENROLLED→CLOSED — P1)
      → Lớp học (all classes)

  → CMS (grouped under collapsible section in sidebar)
```

### Required modules
- Admin dashboard activity feed (P2)
- Registration status pipeline (P1)
- Teacher management page (P2)
- Sidebar CMS grouping (P2 — design/nav)
