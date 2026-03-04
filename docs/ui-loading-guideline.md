PHẦN 1 — Option A (Giữ data cũ khi refetch)

Đây là pattern dùng trong:

Stripe Dashboard

Linear

Notion

Admin enterprise apps

🎯 Tư duy cốt lõi

Khi filter/search/pagination:

Không xóa dữ liệu cũ.
Không reset table.
Chỉ báo rằng đang “refreshing”.

User không được thấy “trạng thái trống”.

✅ Logic chuẩn cho Table-level loading
Khi user:

Gõ search

Đổi filter

Bấm trang 2

Refetch sau mutation

Flow đúng:

Trigger fetch

Set isFetching = true

Giữ nguyên rows hiện tại

Disable interaction

Hiển thị indicator nhỏ

Khi xong:

Replace data

isFetching = false

🎨 Hành vi UI chuẩn
Table khi fetching:

opacity: 0.6

pointer-events: none

cursor: progress

Optional:

Hiện loading indicator nhỏ góc phải table header

Ví dụ cảm giác UI:

Quản lý lớp học

[ Filter bar ]

--------------------------------
| STT | Tên lớp | ...         |
--------------------------------
| HSK 1 - Lớp Sáng           |
| HSK 1 - Lớp Tối            |
--------------------------------
( table hơi mờ + icon loading nhỏ )

Cảm giác:
👉 “Đang cập nhật”
Không phải “đang reload”.

🧠 Vì sao Option A tốt hơn clear table?

Nếu bạn clear table:

Layout shift

Mắt user phải scan lại

Tạo cảm giác app chậm

UX giống reload trang

Option A:

Giữ visual stability

Tạo cảm giác real-time

Nhìn senior-level hơn rất nhiều

⚠️ Lưu ý quan trọng

Không dim toàn bộ content.
Chỉ dim table container.

Filter phải vẫn active nhưng disabled.

PHẦN 2 — Review UX hiện tại (dựa theo ảnh bạn gửi)

Mình phân tích như một production system nhé.

👍 Điểm tốt
1. Layout rõ ràng

Sidebar fixed, content card tách biệt tốt.

2. Table spacing ổn

Row height ổn định, không quá chật.

3. Status badge rõ ràng

“Đang hoạt động” nhìn sạch sẽ.

4. Action menu cuối row hợp lý

Không quá rối.

⚠️ Các điểm có thể gây giật khi scale
1️⃣ Không thấy min-height cho table container

Hiện tại nếu:

Filter trả về 0 rows

Hoặc pageSize thay đổi

Table có thể collapse.

Khi scale 10–20 module:

User chuyển tab liên tục

Layout nhảy sẽ rất khó chịu

👉 Cần cố định chiều cao vùng table.

2️⃣ Search input có thể gây spam fetch

Hiện tại nhìn UI là search realtime.

Nếu không debounce:

Mỗi ký tự = 1 request

Table sẽ dim liên tục

UX sẽ giật

Scale lên 10 module = load server nhiều hơn.

3️⃣ Không thấy indicator “đang refetch”

Nếu bạn chỉ dim mà không có indicator nhỏ:

User có thể nghĩ:

App bị lag?

Phải có 1 visual cue rõ ràng nhưng nhẹ.

4️⃣ Tổng số “Tổng 2” đang nằm phía trên table

Khi refetch:

Nếu tổng số thay đổi

Và table data thay đổi

Mà bạn update total trước table → giật.

Khi scale nhiều module, inconsistency này sẽ lộ rõ.

👉 Total và table phải update cùng lúc.

5️⃣ Pagination dropdown góc phải dưới

Nếu khi đổi page:

Clear table

Hoặc scroll bị reset

User sẽ cảm giác “reload”.

Phải giữ scroll position ổn định.

6️⃣ Khi scale 10–20 module sẽ xuất hiện vấn đề sau:
❌ Loading không nhất quán

Ví dụ:

Module A dim table

Module B clear table

Module C spinner giữa content

UX sẽ rất rối.

👉 Cần thống nhất 1 logic toàn portal.

7️⃣ Mutation có nguy cơ reload full table

Ví dụ:

Click “Tạo lớp mới”:

Nếu sau khi tạo bạn refetch toàn bộ table:

Table dim

Total đổi

Row nhảy

Cảm giác sẽ “hard refresh”.

Giải pháp tốt hơn:

Append row mới vào đầu

Sau đó background refetch

PHẦN 3 — Khi scale lên 10–20 module, nguy cơ lớn nhất
1. Không đồng bộ Loading Pattern

Nếu mỗi màn 1 kiểu → portal mất tính enterprise.

2. Layout shift do Empty State

Một số module có thể có:

Card grid

Table

Chart

Nếu empty state không fix height → nhảy layout rất rõ.

3. Scroll jump

Khi:

User ở page 3

Filter thay đổi

Scroll bị reset top

User sẽ thấy “giật”.

4. Global loading vô tình xuất hiện

Dev mới vào team dễ làm:

setGlobalLoading(true)

→ phá vỡ toàn bộ UX portal.

PHẦN 4 — Kết luận chiến lược

Với UI bạn hiện tại:

👉 Option A là lựa chọn đúng.
👉 Phải chuẩn hóa từ bây giờ trước khi có 10–20 module.

🎯 Quyết định cho HSK Portal

Loading rule chính thức nên là:

Route change → content-level loading
Refetch → dim table, giữ data cũ
Mutation → button loading + optimistic update
Không bao giờ clear table trừ khi filter thực sự đổi dataset
