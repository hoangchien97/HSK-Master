# Calendar UI Implementation - HSK Master

## ✅ Đã hoàn thành

### 1. **Core Components**

#### Calendar Components
- ✅ `ScheduleCalendar.tsx` - Schedule-X integration với custom config
- ✅ `CalendarHeader.tsx` - Header với search, view switcher, create button
- ✅ `TeacherSchedulePage.tsx` - Teacher calendar page với full CRUD
- ✅ `StudentSchedulePage.tsx` - Student read-only calendar

#### Types & Interfaces
- ✅ `calendar.types.ts` - Full TypeScript types cho schedules
- ✅ `calendar.ts` - Utility functions (event states, colors, formatting, recurrence)

#### Styling
- ✅ `schedule-calendar-custom.css` - Custom Schedule-X styles với HSK Master theme

### 2. **Features Implemented**

#### Calendar Views
- ✅ Day view
- ✅ Week view (7 days, 07:00-21:00)
- ✅ Month view

#### Event States (Auto-calculated)
- ✅ **Đã qua** (Past) - Gray
- ✅ **Sắp diễn ra** (Upcoming) - Red
- ✅ **Tương lai** (Future) - Yellow

#### Interactions
- ✅ Single click event → Open Event Drawer (placeholder)
- ✅ Double click event → Open Edit Modal (placeholder)
- ✅ Click empty slot → Open Day Drawer (placeholder)
- ✅ Double click empty slot → Open Create Modal (placeholder)

#### Search & Filter
- ✅ Real-time search by class name/title
- ✅ Filter events dynamically

### 3. **API Routes**

#### Teacher Routes
- ✅ `GET /api/portal/schedules` - Get all teacher's schedules
- ✅ `POST /api/portal/schedules` - Create schedule (with recurrence support)
- ✅ `PUT /api/portal/schedules/[id]` - Update schedule
- ✅ `DELETE /api/portal/schedules/[id]` - Delete schedule

#### Student Routes
- ✅ `GET /api/portal/schedules/student` - Get enrolled class schedules

### 4. **File Structure**

\`\`\`
app/
├── (portal)/portal/[role]/schedule/
│   ├── page.tsx                    # Route entry (role-based)
│   ├── TeacherSchedulePage.tsx     # Teacher calendar page
│   └── StudentSchedulePage.tsx     # Student calendar page
├── components/portal/calendar/
│   ├── ScheduleCalendar.tsx        # Schedule-X wrapper
│   └── CalendarHeader.tsx          # Header component
├── components/common/
│   ├── Dialog.tsx                  # Modal component (shadcn)
│   └── Drawer.tsx                  # Drawer component (vaul)
├── interfaces/portal/
│   └── calendar.types.ts           # TypeScript types
├── utils/
│   └── calendar.ts                 # Utility functions
└── styles/
    └── schedule-calendar-custom.css # Custom styling
\`\`\`

---

## 🚧 Cần implement tiếp

### 1. **Modal Components** (Priority: HIGH)

#### CreateScheduleModal
\`\`\`tsx
- Form fields:
  - Select class (dropdown)
  - Title (text input)
  - Date picker
  - Time range (start/end)
  - Location (optional)
  - Meeting link (optional)
  - Toggle: Recurring
    - Days of week (checkboxes)
    - End date
  - Toggle: Sync to Google
- Actions: Cancel, Save
\`\`\`

#### EditScheduleModal
\`\`\`tsx
- Pre-filled form (same as Create)
- Additional: Delete button
- Show sync status
\`\`\`

### 2. **Drawer Components** (Priority: HIGH)

#### DayDetailDrawer
\`\`\`tsx
- Display:
  - Date (e.g., "Thứ Hai, 12/08/2026")
  - Total events count
  - Grouped by state:
    - Past events (count + list)
    - Upcoming events (count + list)
    - Future events (count + list)
- Action: Create new event button
\`\`\`

#### EventDetailDrawer
\`\`\`tsx
- Display:
  - Event title
  - Class info (name, level, student count)
  - Time range
  - Status badge
  - Location
  - Meeting link
  - Notes
  - Google sync status
- Actions: Edit, Delete buttons
\`\`\`

### 3. **Google Calendar Integration** (Priority: MEDIUM)

#### Setup
\`\`\`typescript
// lib/utils/google-calendar.ts
- createGoogleEvent()
- updateGoogleEvent()
- deleteGoogleEvent()
- syncScheduleToGoogle()
\`\`\`

#### API Updates
\`\`\`typescript
- POST /api/portal/schedules
  → If syncToGoogle=true, create Google event
  → Save googleEventId

- PUT /api/portal/schedules/[id]
  → If googleEventId exists, update Google event

- DELETE /api/portal/schedules/[id]
  → If googleEventId exists, delete Google event
\`\`\`

### 4. **Additional Features**

#### Recurring Events
- ✅ Backend logic exists (`generateRecurringSessions`)
- ⏳ Frontend UI for recurrence selection
- ⏳ Display recurrence description

#### Drag & Drop
- Schedule-X supports drag & drop
- Need to implement update handler

#### Batch Operations
- Delete all recurring events
- Update all recurring events

---

## 📦 Dependencies

### Already Installed
- `@schedule-x/calendar` - Calendar UI
- `@schedule-x/react` - React wrapper
- `@schedule-x/events-service` - Event management
- `@schedule-x/theme-default` - Default theme
- `@radix-ui/react-dialog` - Modal (shadcn)
- `vaul` - Drawer component
- `date-fns` - Date utilities
- `react-hook-form` - Form handling
- `zod` - Validation

### Need to Install (for Modals/Drawers)
\`\`\`bash
# None required - all dependencies ready!
\`\`\`

---

## 🎯 Next Steps

### Immediate (Can start now)
1. **Create Modal Forms**
   - CreateScheduleModal with react-hook-form + zod
   - EditScheduleModal (reuse Create form)
   - Wire up to Calendar page

2. **Create Drawer Components**
   - DayDetailDrawer - show events for selected date
   - EventDetailDrawer - show event details

3. **Connect Everything**
   - Update TeacherSchedulePage to show modals/drawers
   - Handle form submissions
   - Refresh calendar after CRUD

### Later
4. **Google Calendar Sync**
   - Implement OAuth flow
   - Create sync utilities
   - Update API routes

5. **Polish**
   - Loading states
   - Error handling
   - Toast notifications
   - Animations

---

## 🧪 Testing

### Manual Test Steps
1. Navigate to \`/portal/teacher/schedule\`
2. Calendar should render with Schedule-X
3. Click date → Should log "open day drawer"
4. Double click date → Should log "create event"
5. Search should filter events
6. View switcher should work

### Current State
- ✅ Calendar renders properly
- ✅ Events display with correct colors
- ✅ API routes functional
- ⏳ Modals/Drawers need implementation
- ⏳ Full CRUD flow needs testing

---

## 💡 Tips for Implementation

### Modal Best Practices
\`\`\`tsx
// Use react-hook-form + zod for validation
const schema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  classId: z.string(),
  startTime: z.date(),
  endTime: z.date(),
})

const form = useForm<CreateScheduleInput>({
  resolver: zodResolver(schema),
})
\`\`\`

### Drawer Pattern
\`\`\`tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Chi tiết ngày</DrawerTitle>
    </DrawerHeader>
    {/* Content */}
    <DrawerFooter>
      {/* Actions */}
    </DrawerFooter>
  </DrawerContent>
</Drawer>
\`\`\`

### State Management
\`\`\`tsx
// Refresh calendar after CRUD
const handleSuccess = () => {
  fetchEvents() // Re-fetch from API
  setShowModal(false)
  toast.success("Thành công!")
}
\`\`\`

---

Bây giờ bạn có thể:
- Test Calendar UI tại \`/portal/teacher/schedule\`
- Bắt đầu implement Modals
- Bắt đầu implement Drawers
- Hoặc hỏi tôi về bất kỳ phần nào!
