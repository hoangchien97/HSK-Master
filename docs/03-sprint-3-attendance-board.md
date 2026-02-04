# Sprint 3 — Attendance Board (Bảng tổng hợp điểm danh)

## Goal
Teacher điểm danh dạng bảng grid, toggles nhanh, có note, save draft & finalize.

## Scope
### 1) Attendance
- Status enum: `PRESENT`, `ABSENT`, `LATE` (optional), `EXCUSED` (optional)
- Upsert attendance record per (session, student)
- Note per attendance

### 2) Attendance board UI
- Fixed left columns: STT, Học viên
- Columns: sessions theo ngày (hoặc last N sessions)
- Highlight “Hôm nay”
- Search học viên
- Actions: Save draft / Finalize attendance

### 3) Locking
- `Session.finalizedAt` set on finalize
- API reject edits if finalized (unless SYSTEM_ADMIN override)

### 4) Student view (read-only)
- Student view own attendance list/summary

## Data model
- `Attendance(sessionId, studentId, status, note, updatedBy, updatedAt)`
- `Session.finalizedAt`, `finalizedBy`

## Acceptance Criteria
- [ ] Toggle status optimistic + persists
- [ ] Save draft works
- [ ] Finalize locks
- [ ] Notes stored and readable
- [ ] Student can read own attendance only

## Tasks
- [ ] Attendance API (bulk upsert)
- [ ] Board UI (table + sticky columns)
- [ ] RBAC checks in APIs
- [ ] Basic pagination/limit columns

## Demo
- Teacher điểm danh + note → finalize → student sees summary; teacher can’t edit
