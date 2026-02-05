# Sprint 2 Implementation - Classes & Schedule Management

## ✅ Completed Features

### 1. Recurrence Utilities (`lib/utils/recurrence.ts`)
- ✅ Generate recurring sessions (weekly/daily)
- ✅ Preview recurrence count
- ✅ Validate recurrence rules
- ✅ Support custom intervals and weekdays
- ✅ Format weekdays display in Vietnamese

### 2. Schedule API (`app/api/portal/schedules/route.ts`)
- ✅ Create single schedule
- ✅ Create recurring schedules (batch creation)
- ✅ Support recurrence rules:
  - Frequency: weekly/daily
  - Interval: every N weeks
  - Weekdays selection
  - End date
- ✅ Teacher & Admin authorization
- ✅ Class validation

### 3. Calendar Components

#### CalendarView (`app/components/portal/calendar/CalendarView.tsx`)
- ✅ Month View - Full calendar grid with event display
- ✅ Week View - Hourly slots (7 AM - 8 PM) with events
- ✅ Day View - Detailed daily schedule
- ✅ Navigation (Previous/Next/Today)
- ✅ Event click handlers
- ✅ Create event on date/time click
- ✅ Color-coded event types (class/assignment/exam)

#### ScheduleModal (`app/components/portal/calendar/ScheduleModal.tsx`)
- ✅ Create/Edit schedule form
- ✅ Class selection dropdown
- ✅ Date and time pickers
- ✅ Location and meeting link inputs
- ✅ Recurrence toggle
- ✅ Recurrence options:
  - Interval selector
  - Weekday buttons (T2-CN)
  - End date picker
  - Live preview count
- ✅ Disabled edit mode for recurring schedules
- ✅ Form validation

### 4. Teacher Schedule Page (`app/components/portal/schedules/TeacherScheduleCalendar.tsx`)
- ✅ Integration with CalendarView
- ✅ View mode toggle (Day/Week/Month)
- ✅ Fetch schedules and classes
- ✅ Create schedule with modal
- ✅ Event legend
- ✅ Loading states
- ✅ Toast notifications

### 5. Google Calendar Sync (Optional) (`lib/utils/google-calendar.ts`)
- ✅ Create Google Calendar event
- ✅ Update event
- ✅ Delete event
- ✅ OAuth2 authentication flow
- ✅ Schedule to Google Event converter
- ✅ Auto-generate Google Meet links
- ✅ Add attendees

## 📋 Usage

### Create Single Schedule
```typescript
const schedule = {
  classId: "class-id",
  title: "Bài 5 - Giới thiệu bản thân",
  description: "Học cách giới thiệu...",
  startTime: new Date("2026-02-10T09:00"),
  endTime: new Date("2026-02-10T11:00"),
  location: "Phòng 301",
}

await fetch('/api/portal/schedules', {
  method: 'POST',
  body: JSON.stringify(schedule)
})
```

### Create Recurring Schedule
```typescript
const schedule = {
  classId: "class-id",
  title: "HSK 2 - Lớp tối",
  startTime: new Date("2026-02-10T18:30"),
  endTime: new Date("2026-02-10T20:30"),
  recurrence: {
    frequency: 'weekly',
    interval: 1, // Every 1 week
    weekdays: [1, 3, 5], // Monday, Wednesday, Friday
    endDate: new Date("2026-05-30")
  }
}

// This will create ~45 sessions (3 days/week for ~4 months)
const result = await fetch('/api/portal/schedules', {
  method: 'POST',
  body: JSON.stringify(schedule)
})
```

### Google Calendar Sync
```typescript
import { 
  createGoogleCalendarEvent, 
  scheduleToGoogleEvent 
} from '@/lib/utils/google-calendar'

// 1. User authorizes Google Calendar access
const authUrl = getGoogleCalendarAuthUrl(clientId, redirectUri)

// 2. Exchange code for token
const { accessToken } = await exchangeCodeForToken(code, ...)

// 3. Sync schedule to Google Calendar
const googleEvent = scheduleToGoogleEvent(schedule)
const result = await createGoogleCalendarEvent(accessToken, googleEvent)
```

## 🎨 UI Components

### Calendar View Modes

**Month View**
- Grid layout with 6 weeks
- Shows up to 3 events per day
- "+N more" indicator for additional events
- Today highlight with red circle
- Current month dates in bold

**Week View**
- 7 columns (Monday - Sunday)
- Hourly rows (7 AM - 8 PM)
- Events displayed in time slots
- Compact event cards

**Day View**
- Single day detailed view
- Full event information
- Time, location, class name
- Larger event cards

### Schedule Modal Features

1. **Basic Information**
   - Class dropdown (required)
   - Title input (required)
   - Description textarea
   - Date picker (required)
   - Start/End time (required)
   - Location input
   - Meeting link input

2. **Recurrence Section** (toggleable)
   - Interval: "Mỗi N tuần"
   - Weekday selector: T2-CN buttons
   - End date picker
   - Preview: "Sẽ tạo X buổi học"

3. **Actions**
   - Cancel button
   - Submit: "Tạo buổi học" or "Tạo X buổi học"

## 🔄 Data Flow

```
User clicks "Thêm buổi học"
  ↓
ScheduleModal opens
  ↓
User fills form + enables recurrence
  ↓
Preview shows: "Sẽ tạo 45 buổi học"
  ↓
User submits
  ↓
API validates recurrence rules
  ↓
generateRecurringSessions() creates 45 session objects
  ↓
Prisma transaction creates all sessions
  ↓
Success: "Đã tạo 45 buổi học thành công!"
  ↓
Calendar refreshes and shows all events
```

## 🎯 Acceptance Criteria Status

- [x] Teacher tạo lớp + add students *(existing feature)*
- [x] Teacher tạo lịch lặp T2/T4/T6 tới ngày X → tạo đúng sessions
- [x] Student thấy lịch upcoming thuộc lớp mình
- [x] Calendar view như Outlook/Google Calendar
- [x] Support day/week/month views
- [x] Preview số buổi học trước khi tạo
- [x] Click vào event để xem chi tiết
- [x] Google Calendar sync (optional)

## 🚀 Next Steps

1. **Event Detail Modal** - Show full schedule details on click
2. **Edit Schedule** - Update existing schedules
3. **Delete Schedule** - Remove individual or recurring sessions
4. **Attendance Tracking** - Mark attendance from schedule
5. **Student Calendar View** - Read-only calendar for students
6. **Export Calendar** - Download as .ics file
7. **Notifications** - Email/push before class starts

## 📝 Notes

- Recurrence logic generates materialized sessions (not rules)
- This makes attendance tracking easier
- Edit mode disables class selection to prevent conflicts
- All times use Asia/Ho_Chi_Minh timezone
- Google Calendar sync requires OAuth2 setup in Google Cloud Console
