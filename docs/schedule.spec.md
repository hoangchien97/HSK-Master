# 📄 spec.md – Màn hình Lịch giảng dạy giáo viên (Calendar CRUD)

## 1. Mục tiêu
Xây dựng màn hình **Lịch giảng dạy của giáo viên** cho web app, cho phép:
- Xem lịch dạy theo **Ngày / Tuần / Tháng**
- Tạo / chỉnh sửa / xoá buổi học (CRUD)
- Hiển thị trạng thái buổi học theo thời gian
- Tuỳ chọn **đồng bộ Google Calendar**
- Trải nghiệm người dùng tương đương Google Calendar / Outlook nhưng UI hiện đại hơn

---

## 2. Phạm vi & đối tượng sử dụng
- **Đối tượng:** Giáo viên
- **Thiết bị:** Desktop
- **Độ phân giải mục tiêu:** `1920 x 1080`
- **Ngôn ngữ giao diện:** Tiếng Việt
- **Chưa hỗ trợ mobile trong phase này**

---

## 3. Layout tổng thể

### 3.1 Nguyên tắc layout
- **Calendar chiếm 100% main content**
- **Drawer (bên phải)** chỉ xuất hiện khi cần (overlay)
- **Modal** dùng cho Create / Edit buổi học
- Không chia layout cố định 2 cột

### 3.2 Thành phần chính
- Header (trên cùng)
- Calendar (nội dung chính)
- Drawer (overlay bên phải)
- Modal (popup)
- Toast (feedback)

---

## 4. Header

### 4.1 Thành phần
- Tiêu đề: **“Lịch giảng dạy”**
- Switch view: **Ngày | Tuần | Tháng**
- Ô tìm kiếm (tên lớp / ghi chú)
- Nút chính: **“Thêm lịch học”**
- Menu giáo viên (avatar)

---

## 5. Calendar View

### 5.1 Mode view
- **Ngày**
- **Tuần**
- **Tháng**

### 5.2 Khung giờ (Day / Week)
- Mặc định: `07:00 – 21:00`
- Slot 30 phút

---

## 6. Buổi học (Event)

### 6.1 Trạng thái buổi học
Trạng thái được xác định tự động dựa trên thời gian hiện tại:

| Trạng thái | Điều kiện |
|-----------|----------|
| Đã qua | `endAt < hiện tại` |
| Sắp diễn ra | `startAt ≤ hiện tại + 7 ngày` |
| Tương lai | `startAt > hiện tại + 7 ngày` |

### 6.2 Hiển thị UI
- Màu sắc khác nhau theo trạng thái
- Hiển thị nhãn (pill):
  - “Đã qua”
  - “Sắp diễn ra”
  - “Tương lai”

---

## 7. Tương tác người dùng

### 7.1 Click & Double click
| Hành động | Kết quả |
|---------|--------|
| Click ô ngày / khung giờ trống | Mở Drawer – **Chi tiết ngày** |
| Double click ô ngày / khung giờ trống | Mở Modal – **Tạo lịch học mới** |
| Click buổi học | Mở Drawer – **Chi tiết buổi học** |
| Double click buổi học | Mở Modal – **Chỉnh sửa buổi học** |

---

## 8. Drawer (Overlay bên phải)

### 8.1 Quy tắc chung
- Chỉ có **1 Drawer** tại 1 thời điểm
- Đóng Drawer bằng:
  - Nút đóng
  - Nhấn ESC
  - Click ra ngoài

---

### 8.2 Drawer – Chi tiết ngày
Mở khi click vào ô ngày / khung giờ trống.

**Nội dung:**
- Ngày (VD: *Thứ Hai, 12/08/2026*)
- Tổng số buổi học trong ngày
- Phân loại:
  - Đã qua
  - Sắp diễn ra
  - Tương lai
- Danh sách buổi học trong ngày (dạng list gọn)
- Nút: **“Tạo lịch học mới”**

---

### 8.3 Drawer – Chi tiết buổi học
Mở khi click vào buổi học.

**Nội dung:**
- Tên buổi học
- Lớp học (HSK level, số học viên)
- Thời gian học
- Trạng thái buổi học
- Ghi chú (nếu có)
- Trạng thái đồng bộ Google (icon + text)

**Hành động:**
- **Chỉnh sửa**
- **Xoá**

---

## 9. Modal – Tạo / Chỉnh sửa buổi học

### 9.1 Modal Tạo lịch học mới

**Trường thông tin:**
- Chọn lớp học
- Ngày học
- Giờ bắt đầu – Giờ kết thúc
- Toggle: **Lặp lại**
  - Nếu bật:
    - Chọn thứ trong tuần
    - Chọn ngày kết thúc
    - Hiển thị mô tả lặp (readonly)
- Toggle: **Đồng bộ Google Calendar**

**Nút:**
- Huỷ
- Lưu

---

### 9.2 Modal Chỉnh sửa buổi học
Giống modal tạo mới nhưng:
- Dữ liệu được điền sẵn
- Có thêm nút **“Xoá buổi học”**
- Hiển thị trạng thái hiện tại

---

## 10. Toast & phản hồi hệ thống

### 10.1 Trường hợp hiển thị
- Tạo lịch học thành công
- Cập nhật lịch học thành công
- Xoá buổi học thành công

### 10.2 Yêu cầu
- Toast hiển thị góc phải
- Calendar & Drawer cập nhật ngay (không reload)

---

## 11. Đồng bộ Google Calendar

### 11.1 Nguyên tắc
- Database của hệ thống là **nguồn dữ liệu chính**
- Google Calendar chỉ là bản sao (sync)

### 11.2 Hành vi
- Khi bật “Đồng bộ Google”:
  - Tạo event trên Google Calendar
  - Lưu `googleEventId`
- Khi tắt:
  - Xoá event Google tương ứng
- Khi chỉnh sửa / xoá:
  - Nếu có `googleEventId` → sync tương ứng

---

## 12. Tech stack đề xuất
Calendar UI: Schedule-X
Modal / Drawer: shadcn/ui
Auth: NextAuth (Google)
Database: Prisma + Supabase
Google Sync: Google Calendar API
Toast: react-toastify
Sử dụng React-hook-form và zod để validate


---

## 13. Phạm vi chưa triển khai
- Giao diện mobile
- Học sinh chỉnh sửa lịch
- Đồng bộ Outlook / Apple Calendar

---

## 14. Tiêu chí hoàn thành
- Giáo viên tạo / chỉnh sửa lịch trong < 5 giây
- Không reload trang
- UX quen thuộc như Google Calendar
- Code dễ mở rộng và bảo trì
