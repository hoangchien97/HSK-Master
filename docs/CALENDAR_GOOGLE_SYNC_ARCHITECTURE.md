# Kiến trúc Calendar & Google Sync - Implementation Guide

## 📊 Quyết định: **Custom Calendar Component** (Không dùng thư viện)

### Lý do không chọn Schedule-X hoặc FullCalendar:
- ✅ **Full control**: Customize 100% theo design system của HSK
- ✅ **Lightweight**: Không cần install thêm dependencies (50-300KB saved)
- ✅ **Simplicity**: Đủ features cho requirements hiện tại
- ✅ **Maintainability**: Code tự viết, dễ debug và mở rộng
- ✅ **Performance**: Không có overhead của external lib

**Trade-off accepted:**
- Không có drag-drop (chưa cần thiết lúc này)
- Không có advanced features (resource scheduling, timezone...)

## 🏗️ Kiến trúc Google Calendar Sync

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE SCHEDULE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

User fills form
  ├─ Title, Class, Time, Location...
  ├─ Toggle "Lặp lại buổi học" (optional)
  └─ Toggle "Đồng bộ Google Calendar" ✅
       │
       ▼
  Click "Tạo buổi học"
       │
       ▼
  POST /api/portal/schedules
  {
    title, classId, startTime, endTime,
    recurrence?, 
    syncToGoogle: true  ← KEY FLAG
  }
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼ (recurrence = true)              ▼ (single schedule)
  Generate N sessions                Create 1 schedule
       │                                         │
       ▼                                         ▼
  Prisma transaction                   Prisma.create()
  Create N schedules                   {
  {                                      googleEventId: null,
    googleEventId: null,                 syncedToGoogle: false
    syncedToGoogle: false             }
  }                                           │
       │                                      │
       ▼                                      ▼
  Return {                             Check syncToGoogle?
    count: N,                                 │
    message: "Lịch lặp                        ├─ NO → Return schedule
    không auto-sync"                          │
  }                                           └─ YES → Continue
                                                    │
                                                    ▼
                                      POST /api/portal/google-calendar/sync
                                      { scheduleId }
                                                    │
                                                    ▼
                                      createGoogleCalendarEvent()
                                        - summary: title
                                        - description: details
                                        - start/end: times
                                        - location, meetLink
                                                    │
                                                    ▼
                                      Google Calendar API
                                      calendar.events.insert()
                                                    │
                                                    ▼
                                      Return { 
                                        id: "google_event_id",
                                        htmlLink: "https://..."
                                      }
                                                    │
                                                    ▼
                                      Prisma.update()
                                      {
                                        googleEventId: "google_event_id",
                                        syncedToGoogle: true
                                      }
                                                    │
                                                    ▼
                                      Return to client:
                                      {
                                        ...schedule,
                                        googleEventId,
                                        googleEventLink,
                                        syncedToGoogle: true,
                                        message: "Đã tạo + sync Google!"
                                      }
                                                    │
                                                    ▼
                                      Toast: "Đã đồng bộ Google Calendar! 🎉"
```

### Edit/Delete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIT SCHEDULE FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User edits schedule
       │
       ▼
  PATCH /api/portal/schedules/:id
  { title, startTime, ... }
       │
       ▼
  Prisma.update(schedule)
       │
       ▼
  Check: schedule.googleEventId exists?
       │
       ├─ NO → Return updated schedule
       │
       └─ YES → Continue
              │
              ▼
         PATCH /api/portal/google-calendar/sync
         { scheduleId }
              │
              ▼
         updateGoogleCalendarEvent(googleEventId, {...})
              │
              ▼
         Google Calendar API
         calendar.events.update()
              │
              ▼
         Return updated schedule

┌─────────────────────────────────────────────────────────────────┐
│                    DELETE SCHEDULE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

User deletes schedule
       │
       ▼
  Check: schedule.googleEventId exists?
       │
       ├─ NO → Prisma.delete(schedule)
       │
       └─ YES → Continue
              │
              ▼
         DELETE /api/portal/google-calendar/sync?scheduleId=xxx
              │
              ▼
         deleteGoogleCalendarEvent(googleEventId)
              │
              ▼
         Google Calendar API
         calendar.events.delete()
              │
              ▼
         Prisma.delete(schedule)
```

## 📂 File Structure

```
app/
├── api/
│   └── portal/
│       ├── schedules/
│       │   └── route.ts              ← POST: Create schedule + auto-sync
│       └── google-calendar/
│           └── sync/
│               └── route.ts          ← POST/PATCH/DELETE: Manage Google sync
│
├── components/
│   └── portal/
│       ├── calendar/
│       │   ├── ScheduleXCalendar.tsx ← Custom calendar (Month/Week/Day)
│       │   ├── ScheduleModal.tsx     ← Create modal with sync toggle
│       │   └── index.ts
│       └── schedules/
│           ├── TeacherScheduleCalendar.tsx
│           └── StudentScheduleView.tsx
│
├── lib/
│   └── utils/
│       ├── recurrence.ts             ← Generate recurring sessions
│       └── google-calendar.ts        ← Google Calendar API helpers
│
└── prisma/
    └── schema.prisma                 ← PortalSchedule model
```

## 🗄️ Database Schema

```prisma
model PortalSchedule {
  id               String   @id @default(cuid())
  classId          String
  teacherId        String
  title            String
  description      String?  @db.Text
  startTime        DateTime
  endTime          DateTime
  location         String?
  meetingLink      String?
  status           String   @default("SCHEDULED")
  
  // 🆕 Google Calendar Sync Fields
  googleEventId    String?  // Google Calendar event ID
  syncedToGoogle   Boolean  @default(false)
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  class            PortalClass @relation(...)
  teacher          PortalUser  @relation(...)

  @@map("portal_schedules")
}
```

## 🔌 API Endpoints

### 1. Create Schedule
```typescript
POST /api/portal/schedules
Body: {
  title: string
  classId: string
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  recurrence?: {
    frequency: 'weekly'
    interval: number
    weekdays: number[]
    endDate: Date
  }
  syncToGoogle?: boolean  // ← Toggle Google sync
}

Response (single + synced):
{
  id: "...",
  title: "Bài 1",
  googleEventId: "abc123",
  googleEventLink: "https://calendar.google.com/...",
  syncedToGoogle: true,
  message: "Đã tạo buổi học và đồng bộ với Google Calendar"
}

Response (recurring):
{
  count: 36,
  schedules: [...],
  message: "Đã tạo 36 buổi học. Lưu ý: Lịch lặp không tự động đồng bộ..."
}
```

### 2. Sync to Google
```typescript
POST /api/portal/google-calendar/sync
Body: { scheduleId: string }

Response:
{
  success: true,
  googleEventId: "abc123",
  googleEventLink: "https://...",
  schedule: { ...updated schedule }
}
```

### 3. Update Synced Event
```typescript
PATCH /api/portal/google-calendar/sync
Body: { scheduleId: string }

// Auto-updates Google Calendar event if googleEventId exists
```

### 4. Delete Synced Event
```typescript
DELETE /api/portal/google-calendar/sync?scheduleId=xxx

// Auto-deletes from Google Calendar if synced
```

## 🎯 Implementation Details

### 1. ScheduleModal.tsx - Google Sync Toggle

```tsx
// State
const [syncToGoogle, setSyncToGoogle] = useState(false)

// UI
<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
  <div className="flex items-center gap-3">
    <Calendar className="w-5 h-5 text-blue-600" />
    <div>
      <label>Đồng bộ Google Calendar</label>
      <p className="text-xs">Tự động tạo sự kiện trên Google Calendar</p>
    </div>
  </div>
  <button onClick={() => setSyncToGoogle(!syncToGoogle)}>
    {/* Toggle switch */}
  </button>
</div>

// Submit includes syncToGoogle flag
onSubmit({ ...formData, syncToGoogle })
```

### 2. schedules/route.ts - Auto-sync Logic

```typescript
// Single schedule
const newSchedule = await prisma.portalSchedule.create({
  data: {
    ...,
    syncedToGoogle: false,
    googleEventId: null,
  },
})

if (syncToGoogle) {
  const syncResponse = await fetch('/api/portal/google-calendar/sync', {
    method: 'POST',
    body: JSON.stringify({ scheduleId: newSchedule.id }),
  })

  if (syncResponse.ok) {
    return { ...newSchedule, syncedToGoogle: true, ... }
  }
}
```

### 3. google-calendar.ts - API Helpers

```typescript
import { google } from 'googleapis'
import { getServerSession } from 'next-auth'

export async function createGoogleCalendarEvent(eventData) {
  const session = await getServerSession()
  const oauth2Client = await getOAuth2Client(session.user.email)
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  
  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      start: { dateTime: eventData.start.toISOString() },
      end: { dateTime: eventData.end.toISOString() },
      conferenceData: eventData.meetLink ? {
        createRequest: { requestId: Math.random().toString() }
      } : undefined,
    },
    conferenceDataVersion: 1,
  })

  return event.data
}

export async function updateGoogleCalendarEvent(eventId, eventData) { ... }
export async function deleteGoogleCalendarEvent(eventId) { ... }
```

## 🎨 UI Components

### ScheduleXCalendar.tsx Features

**Month View:**
- 7-column grid (Mon-Sun)
- Show up to 3 events per day
- "+N more" indicator
- Click event → Detail modal

**Week View:**
- Time slots: 7 AM - 8 PM (configurable)
- 7 day columns
- Events positioned by time
- Hover for details

**Day View:**
- Single day focus
- Hourly slots
- Full event details visible
- Best for detailed planning

**Toolbar:**
- "Hôm nay" button
- ◀ Previous / Next ▶
- View switcher: Tháng | Tuần | Ngày
- "Thêm buổi học" button

## 🔐 Security & Auth

### OAuth2 Setup Required

1. **Google Cloud Console:**
   - Create project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **Environment Variables:**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=user_refresh_token  # From OAuth flow
```

3. **NextAuth Integration:**
```typescript
// auth.ts
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        scope: 'openid email profile https://www.googleapis.com/auth/calendar',
      },
    },
  }),
]
```

## ✅ Testing Checklist

- [ ] Create single schedule without sync → Success
- [ ] Create single schedule with sync → Google event created
- [ ] Create recurring schedule (36 sessions) → All created
- [ ] Edit synced schedule → Google event updated
- [ ] Delete synced schedule → Google event deleted
- [ ] Calendar displays all 3 views correctly
- [ ] Toggle switch works in modal
- [ ] Toast notifications show correct messages
- [ ] Sync fails gracefully (schedule still created)

## 📝 User Guide

### For Teachers:

**Tạo buổi học đơn + Sync Google:**
1. Click "Thêm buổi học"
2. Điền thông tin (lớp, tiêu đề, thời gian...)
3. Bật "Đồng bộ Google Calendar" ✅
4. Click "Tạo buổi học"
5. → Event xuất hiện trên Google Calendar của bạn

**Tạo lịch lặp:**
1. Bật "Lặp lại buổi học"
2. Chọn: T2, T4, T6
3. Kết thúc: 30/5/2026
4. Preview: "Sẽ tạo 36 buổi học"
5. Click "Tạo 36 buổi học"
6. → 36 sessions trong DB (không auto-sync)

**Đồng bộ manual (sau khi tạo lặp):**
- Mở event detail modal
- Click "Sync to Google Calendar"
- → Individual sync

## 🚀 Future Enhancements

- [ ] Bulk sync for recurring schedules
- [ ] 2-way sync (Google → App)
- [ ] Conflict detection
- [ ] Multiple calendar support
- [ ] iCal export
- [ ] Email reminders via Google Calendar
- [ ] Timezone support

## 📊 Performance Considerations

**Recurring schedules:**
- Batch create trong transaction (fast)
- Không sync tất cả lên Google ngay (tránh rate limit)
- Background job để sync sau (optional)

**Calendar rendering:**
- Paginate schedules (fetch theo tháng)
- Lazy load past/future months
- Cache Google events locally

**Google API Rate Limits:**
- 10,000 requests/day (free tier)
- Implement retry logic với exponential backoff
- Queue system cho bulk operations

---

## 🎉 Kết luận

Kiến trúc này đảm bảo:
- ✅ **Separation of concerns**: Schedule creation ≠ Google sync
- ✅ **Graceful degradation**: Sync fail không làm mất data
- ✅ **User control**: Teacher quyết định sync hay không
- ✅ **Scalability**: Easy to add more calendar providers
- ✅ **Maintainability**: Clear flow, easy to debug

**Best practices followed:**
- Database as source of truth
- Optional external integrations
- Error handling at every step
- Clear user feedback (toasts)
- No vendor lock-in
