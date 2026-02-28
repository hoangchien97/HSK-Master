# SPEC – Schedule + Google Calendar Sync V1 (Hybrid Invite + Recurring Series)

## 0) Mục tiêu
Tính năng Schedule cho lớp học:
- Giáo viên tạo lịch học (1 buổi hoặc lặp).
- Khi bật “Đồng bộ Google Calendar”, lịch sẽ:
  - Được tạo vào Google Calendar của **giáo viên** (organizer).
  - Mời toàn bộ **học viên** (attendees) bằng email → học viên nhận invite và có thể **Accept all** với lịch lặp.
- Không yêu cầu học sinh phải connect Google / cấp token.

---

## 1) Option khuyến nghị V1: Hybrid – Teacher Sync + Invite Students (không cần token học sinh)

### 1.1 Nguyên tắc
- Người gửi / Organizer: **Giáo viên (người tạo lịch)**
- Người tham gia / Attendees: **toàn bộ học viên của lớp** (list email)
- Tạo/sửa/xóa lịch trên Ruby-HSK sẽ sync sang Google Calendar của giáo viên.
- Google sẽ gửi email invite/update/cancel tới học viên (sendUpdates = "all").

### 1.2 Vì sao chọn Hybrid
✅ Không cần refresh_token của học sinh
✅ Giảm độ phức tạp vận hành (token, revoke, quota theo từng student)
✅ Đảm bảo học viên nhận lịch qua email/invite
✅ Phù hợp V1 triển khai nhanh – ổn định – dễ maintain

---

## 2) Thiết kế dữ liệu: DB lưu Series + Instances

### 2.1 Lý do
Portal học tập cần tracking theo từng buổi:
- điểm danh
- bài tập/submission theo buổi
- chấm điểm/feedback theo buổi
- dời/huỷ 1 buổi cụ thể (exception)

=> DB nên lưu:
1) **Series**: mô tả quy luật lặp (như Google recurrence)
2) **Instances**: N buổi cụ thể được generate từ series

### 2.2 Ưu điểm (DB Instances)
✅ UI calendar/list dễ (query theo date range)
✅ Dễ điểm danh/submit bài/đánh giá theo buổi
✅ Dễ “nghỉ 1 buổi”, “dời riêng 1 buổi” (override)
✅ Không phụ thuộc Google (Google chỉ là kênh sync/notification)

---

## 3) Thiết kế dữ liệu đề xuất (tối thiểu)

### 3.1 Table: schedule_series
Lưu lịch gốc + rule lặp + mapping Google event series

Fields đề xuất:
- id (uuid)
- classId (uuid)
- createdByTeacherId (uuid)
- title (string)
- description (string, optional)
- location (string, optional / online link)
- timezone (string) — default "Asia/Ho_Chi_Minh"
- startTimeLocal (string "HH:mm") — giờ bắt đầu theo timezone
- endTimeLocal (string "HH:mm")
- isRecurring (boolean)
- repeatRule (jsonb, nullable)
  - freq: "WEEKLY"
  - byWeekDays: ["MO","TU","WE","TH","FR","SA","SU"] (Google format)
  - untilDateLocal: "YYYY-MM-DD" (ngày kết thúc lặp)
- isGoogleSynced (boolean)
- googleCalendarId (string) — thường "primary"
- googleSeriesEventId (string) — event.id của series trên Google
- syncedAt (timestamp, nullable)

### 3.2 Table: class_sessions (Prisma model: Schedule)
N buổi học cụ thể, phục vụ portal features

Fields đề xuất:
- id (uuid)
- classId (uuid)
- seriesId (uuid, nullable) — null nếu buổi đơn lẻ không thuộc series
- startAt (timestamp with tz)
- endAt (timestamp with tz)
- status (enum) — scheduled | cancelled
- isOverride (boolean) — default false
- overrideType (enum, nullable) — moved | cancelled | extra
- overrideReason (string, nullable)

> V1: không bắt buộc lưu googleInstanceEventId.

---

## 4) Google Calendar: chỉ tạo 1 recurring event series (để Accept all)

### 4.1 Mục tiêu
Khi schedule là lịch lặp:
- Google chỉ nên có **1 recurring series** (không tạo 18 events rời)
- Học viên nhận **1 invite** và có tùy chọn “accept all events”.

### 4.2 Insert event series (Teacher Calendar)
Google API:
- events.insert (calendarId: "primary")
- sendUpdates: "all"

Body bắt buộc:
- summary, description
- start.dateTime + start.timeZone
- end.dateTime + end.timeZone
- attendees: list email học viên
- recurrence: ["RRULE:..."]

RRULE mẫu:
- Weekly: `RRULE:FREQ=WEEKLY;BYDAY=SA,SU;UNTIL=20260428T165959Z`

Ghi chú:
- BYDAY dùng mã: MO TU WE TH FR SA SU
- UNTIL dùng UTC dạng `YYYYMMDDTHHMMSSZ` (convert từ local end-of-day 23:59:59)

### 4.3 Mapping cần lưu
Sau khi insert thành công:
- Lưu `googleSeriesEventId = event.id`
- Lưu `googleCalendarId = "primary"`
Vào record **Series** trong DB.

---

## 5) Transform rule lặp từ UI/DB -> RRULE

### 5.1 Mapping weekday
- T2 → MO
- T3 → TU
- T4 → WE
- T5 → TH
- T6 → FR
- T7 → SA
- CN → SU

### 5.2 Chuẩn hoá start date
`start.dateTime` gửi lên Google nên là **lần occurrence đầu tiên hợp lệ** theo rule:
- Nếu ngày startDate không nằm trong byWeekDays, chọn ngày gần nhất kế tiếp đúng weekday.

### 5.3 UNTIL
- lấy untilDateLocal + "23:59:59" tại timezone
- convert sang UTC để ra `...Z`

---

## 6) Sync hành vi (Create / Update / Delete)

### 6.1 Create
1) Tạo ScheduleSeries + generate Schedule instances (N sessions) trong DB
2) Nếu isGoogleSynced = true:
   - Insert recurring series lên Google (1 event)
   - Save googleEventId vào ScheduleSeries

### 6.2 Update
- Update DB:
  - ScheduleSeries fields
  - Propagate changes to future non-override Schedule instances
- Update Google:
  - events.patch theo googleEventId
  - sendUpdates: "all"

### 6.3 Delete
- Xóa/huỷ DB:
  - ScheduleSeries (soft delete) + hard-delete Schedule instances
- Xóa Google:
  - events.delete theo googleEventId
  - sendUpdates: "all"

---

## 7) OAuth / NextAuth (Teacher only trong V1)

### 7.1 Scope tối thiểu
- https://www.googleapis.com/auth/calendar.events

### 7.2 Refresh token ổn định
Google provider params:
- access_type: "offline"
- prompt: "consent" (ít nhất lần đầu để lấy refresh_token)

Lưu vào DB:
- teacher.googleRefreshToken
- (optional) teacher.googleEmail

> V1 không lưu token học sinh.

---

## 8) Out of Scope (V1)
- Sync ngược từ Google -> hệ thống (2-way)
- Webhook watch channel / syncToken incremental
- Insert thẳng event vào calendar học sinh bằng token học sinh
- Exception sync instance-level lên Google (nghỉ/dời 1 buổi) — để V2

---

## 9) Acceptance Criteria (V1)
- Giáo viên bật sync → tạo lịch → event xuất hiện trên Google Calendar của giáo viên
- Học viên nhận email invite (sendUpdates="all")
- Với lịch lặp: học viên có thể accept “All events” (do Google recurring series)
- Update / delete lịch → học viên nhận email update/cancel
- DB có ScheduleSeries + Schedule instances phục vụ portal query theo khoảng thời gian
- Meeting link không hiển thị trong Google Calendar description (N/A cho V1)
