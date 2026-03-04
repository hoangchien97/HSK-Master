You are a senior full-stack engineer. Implement Attendance Export Excel V2 that matches the current UI grid layout (date columns like the table), in a Next.js App Router project using Supabase + Prisma (or Supabase client) and HeroUI.

Context:
- Attendance page shows:
  - Left fixed columns: STT + Student (name + optional student code)
  - Right scrollable columns: a sequence of session dates (like 28/02 T7, 01/03 CN, ...)
  - Each cell is a mark: Present (✓ green) or Absent (✗ red), blank if not taken.
- We need an .xlsx export that looks like this grid.
- No avatar, no note columns.

GOAL:
- Export .xlsx file for selected class and current visible schedule columns (dates shown on UI grid).
- File name: "<className-or-slug>_DD_MM_YYYY.xlsx" in Asia/Ho_Chi_Minh timezone.
- The exported sheet must match UI structure:
  - Same date columns order and headers.
  - Same summary counts: total present / absent overall and per student.

INPUT:
- The UI knows the currently displayed date columns (array of session objects or dates).
- Provide API with: classId + sessionIds (preferred) OR from/to if sessionIds not available.

REQUIREMENTS:

1) UI Button
- Add "Export Excel" button near filters (top right of header) and/or bottom right next to "Điểm danh".
- Disabled when no class selected or no visible sessions.
- On click, call:
  - POST /api/attendance/export (recommended)
  - Body: { classId, sessionIds: string[], timezone: "Asia/Ho_Chi_Minh" }
- Use toast for loading/success/fail.

2) API Route (App Router)
- Route: POST /api/attendance/export
- Auth guard: teacher role only.
- Parse body:
  - classId (required)
  - sessionIds: string[] (required) => ensures export matches UI columns exactly
  - timezone (optional default Asia/Ho_Chi_Minh)
- Query DB:
  - Class: name/slug
  - Sessions: by sessionIds, ordered by startAt asc
  - Students in class: ordered by lastName/firstName (or current UI order if stored)
  - Attendance records: where sessionId IN sessionIds AND studentId IN class students
- Build lookup maps in memory:
  - sessionIndexById
  - studentIndexById
  - attendanceByStudentSessionKey = present/absent

3) Excel Layout (Match UI Grid)
Use "exceljs" server-side.

Sheet name: "DiemDanh"
Top section:
- Row 1: merged title across all columns:
  "ĐIỂM DANH - <Class Name>"
  (Bold, size 14-16, center)
- Row 2: "Ngày export: DD/MM/YYYY" (local timezone)
- Row 3: "Số buổi (hiển thị): <N sessions> | Số học viên: <N students>"

Header rows (like UI):
- Row 5: table header
  Columns:
  A: "STT"
  B: "HỌC VIÊN"
  C: "MSHV" (optional if exists, else remove column C)
  Then for each session column:
    Header should be 2 lines like UI:
    Line 1: "DD/MM"
    Line 2: weekday label: "T2 T3 T4 T5 T6 T7 CN"
  After date columns:
    "TỔNG CÓ MẶT"
    "TỔNG VẮNG"

Formatting:
- Freeze panes at Row 5 and first 2-3 columns like UI:
  - Freeze rows above header
  - Freeze columns A-C (or A-B if no MSHV)
- Set column widths:
  - STT: 6
  - HỌC VIÊN: 26-32
  - MSHV: 14
  - Date columns: 8-10
  - Totals: 14
- Header style:
  - Bold
  - Center alignment
  - Light fill background
  - Border thin for grid

Body rows:
- One row per student (same order as UI list).
- STT is 01..N with leading zero like UI.
- HỌC VIÊN: plain text name (no avatar).
- MSHV: student code if exists.
- For each session date column:
  - If attendance present => value "✓"
  - If absent => value "✗"
  - If not recorded => blank
  - Center align
  - Apply conditional font color:
    - ✓ green, ✗ red (use ExcelJS font color, no need background)
- Compute per student totals:
  - totalPresentCount
  - totalAbsentCount
  Put into the last 2 columns.

Footer summary rows (like UI bottom summary chips):
- After last student row, add 2 summary rows:
  - Row: "TỔNG" in first columns
  - For each session date column:
      show "P/A" format e.g. "9/1" (present/absent) for that date
      (or two lines "✓ 9" and "✗ 1" if Excel supports wrap text)
  - Last columns:
      overall present total
      overall absent total
- Optionally add a legend row:
  "✓: Có mặt   ✗: Vắng   (blank): Chưa điểm danh"

4) Download Response
- Return binary buffer with correct headers:
  Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  Content-Disposition: attachment; filename="<sanitizedClass>_DD_MM_YYYY.xlsx"

5) Client Download
- Fetch POST as blob and trigger download using an anchor with URL.createObjectURL(blob).
- Ensure file name matches response header, fallback to constructed name if header missing.

6) Edge Cases
- If sessionIds is empty => 400
- If attendance missing for a student in a session => blank (do NOT auto mark absent in V2)
- If student list large => optimize using single attendance query + index maps (no N+1)
- Ensure timezone correctness for date headers and export date.

DELIVERABLES:
- UI: export button + collects current visible sessionIds from UI state.
- API route: /api/attendance/export (POST)
- Server module: lib/excel/exportAttendanceGrid.ts
- Utilities:
  - formatDateDDMM
  - weekdayLabelVI(T2..CN)
  - sanitizeFilename
- Include minimal unit test (optional) for weekday mapping + filename format.
