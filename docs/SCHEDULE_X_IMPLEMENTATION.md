# Calendar Implementation với Schedule-X - Complete Guide

## ✅ Đã implement

### 1. **Schedule-X Calendar Integration**
- ✅ Installed packages: `@schedule-x/calendar`, `@schedule-x/theme-default`, `@schedule-x/events-service`
- ✅ 3 view modes: Day / Week / Month
- ✅ Custom styling phù hợp với HSK design system (đỏ #dc2626)

### 2. **Components Created**

#### [ScheduleXCalendarView.tsx](c:\\DEV\\HSK-Master\\app\\components\\portal\\calendar\\ScheduleXCalendarView.tsx)
- Schedule-X calendar integration
- View switcher (Ngày / Tuần / Tháng)
- Navigation controls (Hôm nay, Previous, Next)
- Event click & double click handlers
- "Thêm buổi học" button

#### [EventDetailPanel.tsx](c:\\DEV\\HSK-Master\\app\\components\\portal\\calendar\\EventDetailPanel.tsx)
- Slide-in panel from right side
- Show schedule details when clicking on calendar event
- Class info, time, description, status
- Google Calendar sync status indicator
- Edit & Delete buttons

#### [ScheduleModalNew.tsx](c:\\DEV\\HSK-Master\\app\\components\\portal\\calendar\\ScheduleModalNew.tsx)
- Sử dụng **common components** (Input, Label, Select, Textarea, Button, Switch)
- Form validation với `react-hook-form` + `zod`
- **Ẩn trường Địa điểm và Link học online** (theo yêu cầu)
- Google Calendar sync toggle với Switch component
- Recurrence toggle và options (weekly pattern)
- Preview count cho recurring schedules

#### [DeleteScheduleModal.tsx](c:\\DEV\\HSK-Master\\app\\components\\portal\\calendar\\DeleteScheduleModal.tsx)
- Confirmation modal khi xóa
- Warning nếu schedule đã sync với Google Calendar
- Sử dụng common Button component

#### [TeacherScheduleCalendarNew.tsx](c:\\DEV\\HSK-Master\\app\\components\\portal\\schedules\\TeacherScheduleCalendarNew.tsx)
- Main container component
- Layout: Calendar + Side Panel (khi click event)
- Integrate tất cả components
- Handle CRUD operations (Create, Update, Delete)

### 3. **API Routes**

#### [schedules/[id]/route.ts](c:\\DEV\\HSK-Master\\app\\api\\portal\\schedules\\[id]\\route.ts)
- **GET**: Fetch single schedule
- **PATCH**: Update schedule (auto-sync Google Calendar nếu có)
- **DELETE**: Delete schedule (auto-delete from Google Calendar)
- Next.js 16 compatibility với `params: Promise<{id}>`

### 4. **Features Implemented**

**✅ View Switcher (Ngày/Tuần/Tháng)**
```tsx
<div className="flex bg-gray-100 rounded-lg p-1">
  <button onClick={() => setSelectedView('day')}>Ngày</button>
  <button onClick={() => setSelectedView('week')}>Tuần</button>
  <button onClick={() => setSelectedView('month')}>Tháng</button>
</div>
```

**✅ Recurrence Support**
- Toggle "Lặp lại buổi học" with Switch component
- Select weekdays (T2, T3, T4, T5, T6, T7, CN)
- Set interval (every N weeks)
- Set end date
- Preview count: "Sẽ tạo 36 buổi học"

**✅ Google Calendar Sync**
- Toggle "Đồng bộ Google Calendar" với Switch component
- Blue card với Calendar icon
- Auto-sync on create (nếu enabled)
- Sync on update
- Delete from Google on delete

**✅ Event Interactions**
- **Single click** → Show detail panel on right side
- **Double click** → Open edit modal
- Detail panel shows:
  - Title & date
  - Class info (name, code, level)
  - Time & duration
  - Description
  - Status badge
  - Google sync indicator
  - Edit & Delete buttons

**✅ Form Components (Matching Login/Register)**
All forms sử dụng common components:
- `<Input />` from `@/app/components/common`
- `<Label />` from `@/app/components/common`
- `<Select />` from `@/app/components/common`
- `<Textarea />` from `@/app/components/common`
- `<Button />` from `@/app/components/common`
- `<Switch />` from `@/app/components/common`

Giống như màn login:
```tsx
<div className="space-y-2">
  <Label htmlFor="title">
    Tiêu đề <span className="text-red-500">*</span>
  </Label>
  <Input
    {...register('title')}
    id="title"
    placeholder="VD: Bài 1 - Chào hỏi"
    className={errors.title ? 'border-red-300 bg-red-50' : ''}
  />
  {errors.title && (
    <p className="text-sm text-red-600">{errors.title.message}</p>
  )}
</div>
```

**✅ Ẩn trường không cần thiết**
- ❌ Địa điểm (location) - REMOVED
- ❌ Link học online (meetingLink) - REMOVED
- Chỉ còn: Lớp học, Tiêu đề, Mô tả, Ngày/Giờ

### 5. **Styling**

#### [schedule-x-custom.css](c:\\DEV\\HSK-Master\\app\\styles\\schedule-x-custom.css)
Custom CSS cho Schedule-X:
- Primary color: `#dc2626` (HSK red)
- Events: Red background với red border-left
- Hover effects: Lift & shadow
- Today highlight: Red background
- Responsive breakpoints

Imported trong [layout.tsx](c:\\DEV\\HSK-Master\\app\\layout.tsx):
```tsx
import "./styles/schedule-x-custom.css";
```

### 6. **Page Route**

#### [schedule/page.tsx](c:\\DEV\\HSK-Master\\app\\(portal)\\portal\\[role]\\schedule\\page.tsx)
```tsx
if (userRole === "teacher") {
  return <TeacherScheduleCalendarNew />
}

if (userRole === "student") {
  return <StudentScheduleView />
}
```

## 🎯 User Flow

### Teacher Creates Schedule

1. Click "Thêm buổi học" button
2. Modal opens với form (common components)
3. Select lớp học từ dropdown
4. Nhập tiêu đề: "Bài 1 - Chào hỏi"
5. Nhập mô tả (optional)
6. Chọn ngày: 2026-02-10
7. Chọn giờ: 09:00 - 11:00
8. **Toggle "Đồng bộ Google Calendar"** ✅ (optional)
9. **Toggle "Lặp lại buổi học"** ✅ (optional)
   - Chọn: Mỗi 1 tuần
   - Chọn ngày: T2, T4, T6
   - Kết thúc: 2026-05-30
   - Preview: **"Sẽ tạo 36 buổi học"**
10. Click **"Tạo 36 buổi học"**
11. Toast: "Đã tạo 36 buổi học thành công!"
12. Calendar refresh → show all events

### Teacher Views Schedule

1. Calendar loads với tất cả schedules
2. Switch view: **Ngày | Tuần | Tháng**
3. Navigate: ◀ Previous | Hôm nay | Next ▶
4. Events hiển thị với:
   - Title
   - Class name
   - Time
   - Red color scheme

### Teacher Edits Schedule

1. **Double click** on calendar event
2. Edit modal opens (pre-filled với data)
3. Change title, time, description...
4. Click "Cập nhật"
5. If synced to Google → auto-update Google event
6. Toast: "Đã cập nhật buổi học thành công!"

### Teacher Views Details

1. **Single click** on calendar event
2. Detail panel slides in from right
3. Shows:
   - Full title & date
   - Class info card (red theme)
   - Time & duration
   - Description
   - Status badge
   - Google sync indicator (if synced)
4. Actions:
   - "Chỉnh sửa" button (blue)
   - "Xóa buổi học" button (red outline)

### Teacher Deletes Schedule

1. Click "Xóa buổi học" in detail panel
2. Confirmation modal appears
3. Shows schedule info
4. Warning if Google synced: "⚠️ Buổi học này đã được đồng bộ..."
5. Click "Xóa buổi học"
6. If synced → auto-delete from Google Calendar
7. Toast: "Đã xóa buổi học thành công!"

## 📊 Data Flow

```
User Action → Component → API Route → Database → Google Calendar (optional)
```

### Create Flow:
```
ScheduleModalNew
  → onSubmit(data)
  → POST /api/portal/schedules
  → Prisma.create()
  → if (syncToGoogle):
      → POST /api/portal/google-calendar/sync
      → createGoogleCalendarEvent()
      → Update schedule with googleEventId
  → Response with message
  → Toast notification
  → Refresh data
```

### Update Flow:
```
EventDetailPanel
  → Click "Chỉnh sửa"
  → ScheduleModalNew (edit mode)
  → onSubmit(data)
  → PATCH /api/portal/schedules/[id]
  → Prisma.update()
  → if (googleEventId exists):
      → PATCH /api/portal/google-calendar/sync
      → updateGoogleCalendarEvent()
  → Response
  → Toast
  → Refresh
```

### Delete Flow:
```
DeleteScheduleModal
  → onConfirm(scheduleId)
  → DELETE /api/portal/schedules/[id]
  → if (googleEventId exists):
      → DELETE /api/portal/google-calendar/sync?scheduleId=xxx
      → deleteGoogleCalendarEvent()
  → Prisma.delete()
  → Response
  → Toast
  → Refresh
```

## 🚀 Testing Checklist

- [ ] View switcher (Ngày/Tuần/Tháng) works
- [ ] Create single schedule without recurrence
- [ ] Create recurring schedule (T2/T4/T6)
- [ ] Preview count shows correct number
- [ ] Google sync toggle works
- [ ] Single click → Detail panel appears
- [ ] Double click → Edit modal opens
- [ ] Edit schedule updates successfully
- [ ] Delete schedule with confirmation
- [ ] Google Calendar sync creates event
- [ ] Google Calendar sync updates event
- [ ] Google Calendar sync deletes event
- [ ] All forms use common components
- [ ] Validation errors display correctly
- [ ] Toast notifications appear
- [ ] Responsive layout works

## 🎨 Design Consistency

**Color Scheme:**
- Primary: `#dc2626` (red-600)
- Hover: `#b91c1c` (red-700)
- Light: `#fee2e2` (red-100)
- Border: `#fca5a5` (red-300)

**Components Match Login/Register:**
```tsx
// Login form
<Input {...register("email")} className={errors.email ? "border-red-300 bg-red-50" : ""} />

// Schedule form (SAME PATTERN)
<Input {...register("title")} className={errors.title ? "border-red-300 bg-red-50" : ""} />
```

**Buttons:**
```tsx
// Primary action
<Button className="bg-red-600 hover:bg-red-700">Tạo buổi học</Button>

// Secondary action
<Button variant="outline">Hủy</Button>

// Danger action
<Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
  Xóa buổi học
</Button>
```

## 🔧 Technical Notes

**Schedule-X API:**
```tsx
const calendar = createCalendar({
  locale: 'vi-VN',
  views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
  events: [],
  callbacks: {
    onEventClick(event) { ... },
    onDoubleClickEvent(event) { ... },
  },
});
```

**Next.js 16 Params:**
```tsx
// Old (Next.js 15)
{ params }: { params: { id: string } }

// New (Next.js 16)
{ params }: { params: Promise<{ id: string }> }

// Usage
const { id } = await params;
```

**React Hook Form + Zod:**
```tsx
const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  classId: z.string().min(1, 'Vui lòng chọn lớp học'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## 📝 Summary

**Tất cả requirements đã được implement:**
- ✅ Dùng Schedule-X library
- ✅ View switcher (Ngày/Tuần/Tháng)
- ✅ Recurrence support với toggle (Common Switch)
- ✅ Google Calendar sync với toggle
- ✅ Double click → Edit modal
- ✅ Single click → Detail panel bên phải
- ✅ Ẩn trường Địa điểm và Link học online
- ✅ Tất cả form dùng common components (như login/register)
- ✅ Full CRUD operations
- ✅ Toast notifications
- ✅ Validation errors
- ✅ Responsive design

**Files Created:**
1. ScheduleXCalendarView.tsx
2. EventDetailPanel.tsx
3. ScheduleModalNew.tsx
4. DeleteScheduleModal.tsx
5. TeacherScheduleCalendarNew.tsx
6. schedules/[id]/route.ts (API)
7. schedule-x-custom.css

Ready to use! 🎉
