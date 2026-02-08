# Spec – Màn hình Điểm danh theo buổi (Offline-first) – V1 (2 trạng thái)

> Mục tiêu: Giáo viên điểm danh nhanh theo **ma trận (table)**, hỗ trợ **offline**, có **Save** để lưu, và có thao tác **tích luôn “cả ngày đi học”** để giảm thao tác.
> Trạng thái hiện tại chỉ cần: **Đi học / Không đi**.

---

## 1) Phạm vi V1
- Chỉ 2 trạng thái:
  - `PRESENT` (✅ Đi học)
  - `ABSENT` (❌ Không đi)
  - `UNMARKED` (— Chưa điểm danh, chỉ là state hiển thị UI)
- Hiển thị ma trận điểm danh theo **lịch của lớp** trong **tháng** (hoặc tuần).
- Offline-first: thao tác khi mất mạng, dữ liệu lưu local và sync sau.
- Có nút **Save** để lưu thay đổi (tạo pending changes + toast).

Ngoài scope V1:
- Không cần status nâng cao (đến muộn, có phép…)
- Không cần tính toán chuyên cần / báo cáo (để V2)

---

## 2) Đối tượng sử dụng & quyền
### Giáo viên (Admin)
- Xem danh sách học viên của lớp.
- Điểm danh cho ngày hiện tại / ngày được phép sửa.
- Ghi note đơn giản cho từng ô (optional).
- Save & Sync.

### Học sinh
- Không nằm trong scope màn này (màn portal giáo viên).

---

## 3) Layout tổng quan
### 3.1 Header trang
- Title: `Ma trận điểm danh`
- Chip hiển thị lớp/khoá (vd: `KHOÁ HSK 3 - K24`)
- Bộ lọc:
  - Chọn **tháng** (month picker)
  - (Optional) Toggle view: `Tháng` / `Tuần`
- Actions:
  - Button **Save** (primary)
  - (Optional) Button `Sync` (secondary, chỉ active khi online & có pending)
  - Hiển thị trạng thái mạng: `Online / Offline` + số pending changes

### 3.2 Thanh tìm kiếm & meta
- Search input: `Tìm tên học viên...`
- Text: `Hiển thị N học viên`
- (Optional quick filter) `Chưa điểm danh`, `Vắng`

---

## 4) Table (Attendance Matrix)
### 4.1 Cột cố định bên trái
- `STT`
- `Họ và tên`:
  - Avatar + tên
  - Mã học viên (subtext)

### 4.2 Cột ngày (dynamic)
- Mỗi cột ứng với **một ngày học trong tháng** (lấy theo schedule lớp).
- **Header mỗi cột phải có**:
  - Ngày (dd/MM hoặc dd)
  - Thứ mấy (T2..T7, CN)
- Ví dụ header như UI mẫu:
  - Dòng 1: `01/10`
  - Dòng 2: `T2`

> Lưu ý: Có thể không render các ngày không có lịch học để table gọn.

---

## 5) Tương tác trong cell (V1)
### 5.1 Trạng thái hiển thị trong cell
- `PRESENT`: icon ✅ màu xanh
- `ABSENT`: icon ❌ màu đỏ
- `UNMARKED`: hiển thị `—` hoặc vòng tròn rỗng

### 5.2 Click để đổi trạng thái (toggle)
- Click vào cell (hoặc click icon trong cell) sẽ **cycle trạng thái**:
  - `UNMARKED -> PRESENT -> ABSENT -> UNMARKED`
  *(hoặc chỉ toggle PRESENT/ABSENT nếu muốn đơn giản; nhưng nên có UNMARKED để sửa sai)*
- Sau khi click:
  - Update UI ngay (optimistic)
  - Mark cell là `dirty/pending`

### 5.3 Hover/Popover (optional trong V1)
- Hover cell hiển thị icon 📝 (note).
- Click 📝 mở popover:
  - Textarea note
  - Save note
- Note chỉ là text, không phải status.

---

## 6) Requirement đặc biệt: “Tích luôn cả ngày đi học”
> Để giáo viên thao tác nhanh theo ngày.

### 6.1 Nút “Đánh dấu cả ngày: Đi học”
- Ở header của mỗi **cột ngày**, có action (icon/button):
  - `Mark all PRESENT` (vd: icon ✅ nhỏ)
- Khi click:
  - Set tất cả học viên của cột ngày đó thành `PRESENT`
  - Không override những học viên đã `ABSENT` nếu chọn chế độ “an toàn” (optional)
  - Hoặc có popup chọn:
    - (A) “Đánh dấu tất cả là Đi học”
    - (B) “Chỉ đánh dấu các ô chưa điểm danh”
- UI feedback:
  - Show confirm toast: `Đã đánh dấu X học viên đi học (ngày dd/MM)`
- Những cell bị thay đổi phải được mark `pending`.

### 6.2 Trường hợp đảo trạng thái nhanh cho 1 bạn
- Sau khi “mark all PRESENT”, giáo viên có thể click vào cell của 1 bạn để đổi thành `ABSENT`.
- Không cần modal, click là đổi ngay.

---

## 7) Disable / Lock theo thời gian
### 7.1 Quá khứ
- Mặc định: ngày `< today` => **read-only** (disabled)
  - Không cho click đổi status
  - Cho hover xem detail (status + note)
- Hiển thị disabled style (opacity/gray background)

### 7.2 Hôm nay
- Cho phép edit

### Tương lai
- hiển thị -

### 7.3 (Optional V2) “Unlock ngày cũ”
- Toggle “Cho phép sửa ngày cũ” + audit log (ngoài scope V1)

---

## 8) Save & dữ liệu (Offline-first)
### 8.1 Save button
- Khi bấm Save:
  - Toast:
    - Success: `Đã lưu (chờ đồng bộ)` hoặc `Đã lưu`
    - Error: `Lưu thất bại`

### 8.2 Sync (auto)
- Khi app online:
  - Tự động sync pending theo batch
  - Nếu sync thành công: clear pending & update UI “synced”
- Nếu sync fail: giữ pending & hiện badge.

### 8.3 UI trạng thái pending
- Cell pending có dot nhỏ hoặc viền.
- Header có badge `Pending: N`.

---

## 9) Data Model tối giản (gợi ý)
### PortalAttendance bắt buộc có
- `classId`
- `date` (YYYY-MM-DD)
- `studentId`
- `teadcherId`
- `status`: `PRESENT | ABSENT`
- `note?` (string optional)
- `updatedAt`
- `updatedBy`

> Nếu tương lai cần “đầu giờ/cuối giờ”, thêm `session` (`START|END`) hoặc `sessionId`.

---

---

## 11) Acceptance Criteria (Checklist)
- [ ] Hiển thị table: STT + Họ tên + các cột ngày học trong tháng
- [ ] Header ngày: có `dd/MM` + `Thứ` (T2..CN)
- [ ] Cell hiển thị 3 state UI: PRESENT / ABSENT / UNMARKED
- [ ] Click cell đổi trạng thái nhanh
- [ ] Ngày quá khứ disabled (read-only)
- [ ] Có nút “Mark all PRESENT” ở header cột ngày
- [ ] Có nút Save để lưu local/pending và toast feedback
- [ ] Offline: vẫn thao tác, pending được hiển thị và sync khi online

---

## 12) Notes UI/UX
- Table nên có:
  - Sticky header (ngày)
  - Sticky left columns (STT + Họ tên)
  - Virtualize nếu danh sách học viên lớn (>= 200)
- Mobile: có thể chuyển sang list view (ngoài scope V1)

---
