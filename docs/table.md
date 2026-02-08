# SPEC – Portal Management List Page (Áp dụng cho Quản lý lớp học & các màn tương tự)

Áp dụng cho các màn dạng **Management / CRUD List** trong portal HSK:
- Quản lý lớp học
- Học viên
- Bài tập
- Điểm danh
- Bài kiểm tra
- … (cùng pattern)

---

## 0) Mục tiêu UX
- Giao diện **sắc nét – rõ ràng – thao tác nhanh**
- Không reload page sau các action CRUD
- Tối ưu cho giáo viên sử dụng hằng ngày
- Sẵn sàng mở rộng: bulk action, export, filter nâng cao

---

## 1) Data display rules (IMPORTANT)

### 1.1 Text vs Chip
- **Không dùng Chip/Badge cho dữ liệu KHÔNG phải constant**
  - Ví dụ:
    - `Mã lớp` → text thường
    - `Tên lớp` → text + hover
- **Dùng Chip/Badge cho dữ liệu có enum/constants**
  - Ví dụ:
    - `Trình độ` (HSK1, HSK2…) → Chip màu
    - `Trạng thái` (Đang hoạt động / Ngưng) → Chip màu

---

## 2) Table Structure

### 2.1 Columns (Quản lý lớp học – example)
1. **STT**
2. **Tên lớp**
3. Mã lớp
4. Trình độ (Chip)
5. Học viên (current/max)
6. Ngày bắt đầu (format)
7. Trạng thái (Chip)
8. Actions (…)

> Các màn khác kế thừa pattern này, chỉ thay cột data.

---

## 3) Interaction rules

### 3.1 Hover & Navigation
- Hover vào **cell Tên lớp**:
  - Cursor pointer
  - Click → navigate **Detail page**
- **Remove action “Chi tiết” trong menu**
  - Detail chỉ mở bằng click tên

### 3.2 Row hover
- Hover row:
  - Highlight background nhẹ
  - Không ảnh hưởng layout

---

## 4) Action menu (Row actions)
- Chỉ gồm:
  - ✏️ Chỉnh sửa
  - 🗑️ Xóa
- UI và UX hover giống nhau ( k cần đỏ )
- Không có “Chi tiết”

---

## 5) Date & Format
- Tất cả ngày hiển thị format:
  - `dd/MM/YYYY`
- Không hiển thị raw ISO string

---

## 6) Selection & Bulk actions

### 6.1 Selection
- Table support:
  ```tsx
  selectedKeys={selectedKeys}
  selectionMode="multiple"

Xóa nhiều và export ( TODO - > làm sau)

## 7) Hiển thị cả số selectedKeys

## 8) Hiển thị options change pageSize

Hiển thị 15 / 15 học viên -> move ra ngoài table
implemennt cho tôi

## 9) Nhớ udpate Filter đồng bộ ác màn

## 10) Breadcrumb có thể thay đổi title

update màn quản lý lớp trước
và sau đó áp dụng hết toàn bộ các màn còn lại ( về loading - layout, filter...) - Học viên, Lịch giảng dạy, Điểm danh cũng đang không được như này
-> Dạy xog -> training cho bạn :D

## 11)
Function xóa:
Build 1 component AlertDialog
tham khảo: https://v3.heroui.com/docs/react/components/alert-dialog
