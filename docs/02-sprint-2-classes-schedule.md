# Sprint 2 — Classes + Enrollments + Schedule + Recurrence

## Goal
Teacher quản lý lớp, roster; tạo buổi học (one-time + recurring); student xem lịch upcoming.

## Scope
### 1) Class management
- Create class: name, HSK level, status
- List classes (my classes for teacher; all classes for admin)
- Class detail: roster

### 2) Enrollments
- Add student by email (search user)
- Remove student (soft remove)
- Student can see enrolled classes

### 3) Schedule
- Teacher schedule list (today/week)
- Create session (start/end, topic)
- Recurrence (weekly):
  - interval (every N weeks)
  - weekdays
  - until date
  - preview created count
- Generate sessions as rows (materialized) for attendance easier

### 4) Student view
- Upcoming sessions list + join link placeholder

## Data model (gợi ý)
- `Class`, `Enrollment`, `Session`
- `Session` fields: `classId`, `startAt`, `endAt`, `topic`, `status`, `finalizedAt?`

## Acceptance Criteria
- [ ] Teacher tạo lớp + add students
- [ ] Teacher tạo lịch lặp T2/T4/T6 tới ngày X → tạo đúng sessions
- [ ] Student thấy lịch upcoming thuộc lớp mình

## Tasks
- [ ] Prisma models + migrations
- [ ] Teacher pages: classes list/detail, schedule list, create session modal
- [ ] Recurrence generator util (server-side)
- [ ] Student upcoming widget

## Demo
- HSK4 class → add 3 students → create weekly sessions → student sees schedule
