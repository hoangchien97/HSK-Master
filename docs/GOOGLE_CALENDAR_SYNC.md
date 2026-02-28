# V1 Google Calendar Hybrid Sync — Ruby-HSK

## Mục lục
1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc & Flow](#2-kiến-trúc--flow)
3. [Cấu hình Google Cloud Console](#3-cấu-hình-google-cloud-console)
4. [Cấu hình Environment Variables](#4-cấu-hình-environment-variables)
5. [Database Migration](#5-database-migration)
6. [Hướng dẫn sử dụng](#6-hướng-dẫn-sử-dụng)
7. [API Reference](#7-api-reference)
8. [Xử lý Edge Cases](#8-xử-lý-edge-cases)
9. [File Structure](#9-file-structure)

---

## 1. Tổng quan

### Business Rules (V1)
- **Ruby-HSK là nguồn dữ liệu chính** (one-way sync only)
- Teacher tạo/sửa/xóa lịch trên Ruby-HSK → tự động sync sang Google Calendar
- **Không có reverse sync** từ Google Calendar → Ruby-HSK
- **Không có webhooks/watch**

### Hybrid Sync Logic
Với mỗi attendee (teacher + students):

| Trạng thái | Hành vi |
|---|---|
| **Connected** (có GoogleCalendarToken hợp lệ) | Tạo/sửa/xóa event trực tiếp trên Google Calendar của họ |
| **Not connected** | Fallback: thêm email làm attendee trên event của Teacher (Google gửi invite email) |

---

## 2. Kiến trúc & Flow

### 2.1. OAuth Flow (Incremental Authorization)

```
Đăng nhập Google (basic):
  scope: openid email profile
  → Tạo tài khoản PortalUser + Account record

Kết nối Calendar (tùy chọn):
  User nhấn "Kết nối Google Calendar" trong Settings
  → GET /api/portal/calendar/connect
  → Redirect Google consent (scope: calendar.events, prompt=consent, access_type=offline)
  → GET /api/portal/calendar/callback
  → Exchange code → encrypt refresh_token (AES-256-GCM) → lưu GoogleCalendarToken
  → Redirect về /portal/{role}/schedule?calendar_connected=true
```

### 2.2. Schedule Sync Flow

```
Teacher tạo/sửa/xóa lịch trên Ruby-HSK:
  → schedule.actions.ts (createScheduleSeries/updateScheduleSeries/deleteScheduleSeries)
  → Lưu DB (ScheduleSeries + Schedule instances)
  → Gửi notification cho students
  → Gọi calendar-sync.service.ts:
      1. Lấy danh sách enrolled students
      2. Kiểm tra teacher có GoogleCalendarToken hợp lệ không
      3. Tạo/update/delete event trên Google Calendar của teacher
      4. Students được thêm làm attendee (Google gửi invite email)
      5. Lưu googleEventId vào ScheduleSeries
```

### 2.3. Token Encryption Flow

```
refresh_token (plaintext)
  → AES-256-GCM encrypt (key từ CALENDAR_TOKEN_SECRET env)
  → lưu vào google_calendar_tokens.encryptedRefresh
  → Khi cần dùng: decrypt → gọi Google API
  → Nếu access_token hết hạn: dùng refresh_token để lấy access_token mới
  → Cache access_token (encrypted) trong DB
```

---

## 3. Cấu hình Google Cloud Console

### Step 1: Tạo Project (nếu chưa có)
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện tại (VD: `HSK-Portal`)

### Step 2: Bật Google Calendar API
1. Vào **APIs & Services → Library**
2. Tìm **Google Calendar API**
3. Nhấn **Enable**

### Step 3: Cấu hình OAuth Consent Screen
1. Vào **Google Auth Platform → Branding**
2. Điền thông tin:
   - **Application home page**: `https://ruby-hsk.vercel.app` (hoặc domain production)
   - **Application privacy policy link**: `https://ruby-hsk.vercel.app/privacy`
   - **Application terms of service link**: `https://ruby-hsk.vercel.app/terms`
3. Upload logo (nếu muốn verify branding)

### Step 4: Cấu hình Scopes
1. Vào **Google Auth Platform → Data Access** (hoặc OAuth consent screen → Scopes)
2. Thêm scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/calendar.events`
3. Lưu

### Step 5: Tạo OAuth Client ID
1. Vào **Google Auth Platform → Clients** (hoặc Credentials)
2. Nhấn **+ Create Client**
3. Chọn **Web application**
4. Điền:
   - **Name**: `Ruby-HSK Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://ruby-hsk.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (NextAuth)
     - `https://ruby-hsk.vercel.app/api/auth/callback/google` (NextAuth production)
     - `http://localhost:3000/api/portal/calendar/callback` (Calendar connect)
     - `https://ruby-hsk.vercel.app/api/portal/calendar/callback` (Calendar connect production)
5. Lưu và copy **Client ID** + **Client Secret**

### Step 6: Verify Branding (Quan trọng cho production)
1. Vào **Google Auth Platform → Verification Center**
2. Nhấn **Verify branding**
3. Cần có:
   - Privacy Policy page (`/privacy`) ✅
   - Terms of Service page (`/terms`) ✅
   - Logo đúng kích thước
4. Submit và chờ Google review (1-3 ngày)

### Step 7: Cấu hình Audience (Test Users)
1. Khi app ở trạng thái **Testing**, chỉ test users mới đăng nhập được
2. Vào **Google Auth Platform → Audience**
3. Thêm email test users
4. Khi ready production: chuyển sang **Production** (cần verify branding trước)

---

## 4. Cấu hình Environment Variables

Thêm vào `.env`:

```env
# Google OAuth (đã có)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-auth-secret

# NEW: Calendar Token Encryption
# Tạo bằng: openssl rand -hex 32
CALENDAR_TOKEN_SECRET=your-random-32-char-string-for-encryption
```

**Lưu ý quan trọng:**
- `CALENDAR_TOKEN_SECRET` phải là chuỗi random ≥32 ký tự
- **KHÔNG BAO GIỜ** commit giá trị này vào Git
- Nếu thay đổi secret, tất cả token đã lưu sẽ không decrypt được → users phải kết nối lại

---

## 5. Database Migration

### Tự động (Prisma Migrate)
```bash
npx prisma migrate dev --name add_google_calendar_token
```

### Thủ công (SQL)
```sql
CREATE TABLE "google_calendar_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedRefresh" TEXT NOT NULL,
    "encryptedAccess" TEXT,
    "accessExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "google_calendar_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "google_calendar_tokens_userId_key" ON "google_calendar_tokens"("userId");

ALTER TABLE "google_calendar_tokens" ADD CONSTRAINT "google_calendar_tokens_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 6. Hướng dẫn sử dụng

### 6.1. Cho Teacher

#### Kết nối Google Calendar
1. Đăng nhập vào Portal
2. Vào trang **Lịch dạy** (`/portal/teacher/schedule`)
3. Nhấn nút **"Kết nối Google Calendar"** (GoogleCalendarCard component)
4. Google sẽ yêu cầu bạn cấp quyền cho Ruby-HSK tạo/sửa/xóa sự kiện lịch
5. Nhấn **Allow**
6. Quay về Portal → hiển thị "Đã kết nối" ✅

#### Tạo lịch dạy (tự động sync)
1. Nhấn **+ Tạo buổi học**
2. Chọn lớp, nhập tiêu đề, thời gian, địa điểm…
3. Nhấn **Tạo**
4. Ruby-HSK sẽ:
   - Lưu vào database
   - Gửi notification cho students
   - **Tự động tạo event trên Google Calendar** (nếu đã kết nối)
   - Students đã kết nối Calendar → event tạo trực tiếp trên lịch của họ
   - Students chưa kết nối → nhận email mời từ Google

#### Sync thủ công
- Với buổi học chưa sync: nhấn nút **🔄 Sync** trên card buổi học

### 6.2. Cho Student

#### Kết nối Google Calendar (tùy chọn)
1. Đăng nhập vào Portal
2. Trong trang Lịch học, nhấn **"Kết nối Google Calendar"**
3. Cấp quyền → Sự kiện lịch học sẽ tự động xuất hiện trên Google Calendar

#### Không kết nối
- Vẫn nhận email mời từ Google Calendar (fallback)
- Có thể Accept/Decline trong email

---

## 7. API Reference

### Calendar Connection

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/portal/calendar/connect` | Redirect tới Google consent (calendar scope) |
| `GET` | `/api/portal/calendar/callback` | Callback xử lý OAuth code → lưu encrypted tokens |
| `GET` | `/api/portal/calendar/status` | Trạng thái kết nối (safe cho client) |
| `DELETE` | `/api/portal/calendar/status` | Ngắt kết nối (xóa tokens) |

### Schedule Sync

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/portal/google-calendar/sync` | Sync 1 buổi học sang Google Calendar |

### Server Actions

| Action | Mô tả |
|--------|-------|
| `createScheduleSeries()` | Tạo series + sessions + auto sync Calendar |
| `updateScheduleSeries()` | Cập nhật series + propagate sessions + sync update |
| `deleteScheduleSeries()` | Soft-delete series + xóa sessions + sync delete |
| `syncSessionToGoogle()` | Sync thủ công 1 series sang Google Calendar |
| `getCalendarStatus()` | Lấy trạng thái kết nối |

---

## 8. Xử lý Edge Cases

| Trường hợp | Xử lý |
|---|---|
| **refresh_token missing** | UI hiện "Vui lòng kết nối lại" + nút Reconnect |
| **Token revoked/expired** | `isValid = false` → UI hiện cảnh báo vàng + nút "Kết nối lại" |
| **Teacher chưa kết nối** | Schedule vẫn tạo được, hiện "calendar sync pending" |
| **Google API 401** | Auto mark token invalid → prompt reconnect |
| **Duplicate invites** | Teacher event cập nhật full list attendees mỗi lần; student events không chứa all attendees |
| **CALENDAR_TOKEN_SECRET thay đổi** | Tất cả tokens invalid → users phải reconnect |
| **Google không trả refresh_token** | `prompt=consent` force consent mỗi lần connect → guarantee refresh_token |

---

## 9. File Structure

```
lib/
  utils/
    token-encryption.ts      # AES-256-GCM encrypt/decrypt
    google-calendar.ts        # Google Calendar API wrappers (existing, updated)
  portal/
    calendar-token.service.ts # Encrypted token CRUD + auto-refresh
    calendar-sync.service.ts  # Hybrid sync logic (create/update/delete)

app/api/portal/
  calendar/
    connect/route.ts          # Initiate incremental OAuth
    callback/route.ts         # Handle OAuth callback → save tokens
    status/route.ts           # GET status / DELETE disconnect
  google-calendar/
    sync/route.ts             # POST sync single schedule (updated)

actions/
  schedule.actions.ts         # Updated with auto sync + getCalendarStatus()

components/portal/
  settings/
    GoogleCalendarCard.tsx     # Connect/disconnect/status UI

prisma/
  schema.prisma               # GoogleCalendarToken model (added)
  migrations/
    20260227000000_add_google_calendar_token/
      migration.sql            # SQL migration

app/(landing)/
  privacy/page.tsx            # Privacy Policy (cho Google verification)
  terms/page.tsx              # Terms of Service (cho Google verification)
```
