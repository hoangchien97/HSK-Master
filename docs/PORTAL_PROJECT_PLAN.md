# HSK Master Portal - Project Plan & Implementation Guide

## 📋 Tổng quan dự án (Project Overview)

### Mục tiêu (Objectives)
Xây dựng hệ thống Portal quản lý học tập tiếng Trung với:
- **Landing Page**: Trang giới thiệu công khai (hiện tại)
- **Portal System**: Hệ thống quản lý học tập cho Giáo viên và Học sinh

---

## 🏗️ Architecture Review & Restructuring

### Current Structure Analysis
✅ **Strengths:**
- Clean landing page structure
- Tailwind CSS + Component-based architecture
- Good SEO implementation
- Prisma ORM with PostgreSQL
- Server Actions for forms

❌ **Needs Improvement:**
- No authentication system
- No portal/admin section
- No role-based access control
- Mixed landing/portal concerns

### Proposed New Structure

```
app/
├── (landing)/                    # Landing page group
│   ├── layout.tsx               # Landing layout (Header, Footer)
│   ├── page.tsx                 # Home page
│   ├── about/
│   ├── courses/
│   ├── contact/
│   ├── vocabulary/
│   └── components/              # Landing-specific components
│       ├── home/
│       ├── about/
│       ├── courses/
│       └── contact/
│
├── (portal)/                    # Portal group (protected)
│   ├── layout.tsx               # Portal layout (Sidebar, Header)
│   ├── dashboard/               # Student dashboard
│   │   └── page.tsx
│   ├── teacher/                 # Teacher routes (admin)
│   │   ├── classes/            # Quản lý lớp học
│   │   ├── students/           # Quản lý học sinh
│   │   ├── assignments/        # Quản lý bài tập
│   │   ├── schedule/           # Quản lý lịch học
│   │   ├── attendance/         # Điểm danh
│   │   └── overview/           # Dashboard tổng quan
│   ├── student/                 # Student routes
│   │   ├── assignments/        # Xem bài tập
│   │   ├── attendance/         # Xem điểm danh
│   │   ├── learning/           # Học tập
│   │   │   ├── listening/     # Nghe
│   │   │   ├── speaking/      # Nói
│   │   │   ├── reading/       # Đọc
│   │   │   └── writing/       # Viết
│   │   ├── vocabulary/         # Từ vựng
│   │   ├── flashcards/         # Flashcards
│   │   ├── quiz/               # Quiz
│   │   ├── bookmarks/          # Bookmark
│   │   └── profile/            # Edit profile
│   └── components/              # Portal-specific components
│       ├── layout/
│       │   ├── Sidebar.tsx
│       │   ├── PortalHeader.tsx
│       │   └── UserMenu.tsx
│       ├── teacher/
│       ├── student/
│       └── shared/
│
├── auth/                        # Auth pages (public)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── error/
│   │   └── page.tsx
│   └── callback/
│       └── page.tsx
│
├── api/
│   ├── auth/
│   │   └── [...nextauth]/      # NextAuth routes
│   │       └── route.ts
│   ├── portal/                  # Portal APIs
│   │   ├── classes/
│   │   ├── students/
│   │   ├── assignments/
│   │   ├── attendance/
│   │   ├── schedule/
│   │   └── learning/
│   └── landing/                 # Landing APIs (existing)
│
├── components/
│   ├── shared/                  # Shared across landing & portal
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ... (keep existing)
│   └── ui/                      # UI primitives (optional - shadcn/ui)
│
├── lib/
│   ├── auth.ts                  # NextAuth config
│   ├── prisma.ts               # Existing
│   ├── utils.ts                # Existing
│   └── permissions.ts          # RBAC utilities
│
├── hooks/
│   ├── useAuth.ts              # Auth hook
│   ├── usePortal.ts            # Portal data hook
│   └── useResponsive.ts        # Existing
│
├── types/
│   ├── auth.ts                 # Auth types
│   ├── portal.ts               # Portal types
│   └── ... (existing)
│
└── middleware.ts                # Auth & route protection
```

---

## 🎨 UI Library Decision

### Option 1: Keep Current Approach (Recommended)
**✅ Pros:**
- Already have high-quality components in `/components/shared`
- Consistent with landing page design
- No additional dependencies
- Full control over styling

**📦 What we have:**
- Button, Input, Textarea, Select, Checkbox, Radio, Switch
- Badge, Pagination, Tooltip
- Modal/Dialog patterns can be added easily

**🔧 What to add:**
- Table component
- Sidebar/Navigation
- Dropdown Menu
- Calendar (for schedule)
- Toast/Notification
- Tabs

### Option 2: Add Lightweight UI Library
**shadcn/ui** (Copy-paste components, not a package)
- Lightweight (only add what you need)
- Built on Radix UI (already using for Tooltip)
- Tailwind-based (perfect fit)
- Copy components to `/components/ui`

**Recommendation: Hybrid Approach**
1. **Keep** existing `/components/shared` for reusable UI
2. **Add shadcn/ui** for complex portal components:
   - Table (for student lists, assignments)
   - Dropdown Menu (user menu, actions)
   - Calendar (schedule management)
   - Data Table (with sorting, filtering)
   - Tabs (for different views)
   - Dialog/Sheet (modals, sidebars)

---

## 🗄️ Database Schema Updates

### New Portal Tables (with `portal_` prefix)

```prisma
// ============================================
// PORTAL AUTHENTICATION & USERS
// ============================================

model PortalUser {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  phone         String?
  image         String?
  role          PortalRole @default(STUDENT)

  // Google OAuth
  googleId      String?   @unique
  emailVerified DateTime?

  // Password (for email/password auth)
  hashedPassword String?

  // Status
  isActive      Boolean   @default(true)
  lastLogin     DateTime?

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      PortalAccount[]
  sessions      PortalSession[]
  studentProfile PortalStudent?
  teacherProfile PortalTeacher?

  @@index([email])
  @@index([googleId])
  @@map("portal_users")
}

enum PortalRole {
  STUDENT
  TEACHER
  ADMIN
}

// NextAuth Account
model PortalAccount {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user PortalUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("portal_accounts")
}

// NextAuth Session
model PortalSession {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         PortalUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("portal_sessions")
}

model PortalVerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("portal_verification_tokens")
}

// ============================================
// PORTAL STUDENTS & TEACHERS
// ============================================

model PortalStudent {
  id              String   @id @default(uuid())
  userId          String   @unique
  studentCode     String   @unique // Auto-generated: STU-XXXXXX

  // Profile
  bio             String?
  avatar          String?
  dateOfBirth     DateTime?
  address         String?

  // Learning Progress
  totalXP         Int      @default(0)
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  user            PortalUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  classEnrollments PortalClassEnrollment[]
  assignmentSubmissions PortalAssignmentSubmission[]
  attendances     PortalAttendance[]
  learningProgress PortalLearningProgress[]
  bookmarks       PortalBookmark[]
  quizAttempts    PortalQuizAttempt[]

  @@index([studentCode])
  @@map("portal_students")
}

model PortalTeacher {
  id           String   @id @default(uuid())
  userId       String   @unique
  teacherCode  String   @unique // Auto-generated: TEA-XXXXXX

  // Profile
  bio          String?
  avatar       String?
  specialization String?
  experience   Int?     // Years of experience

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  user         PortalUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  classes      PortalClass[]
  assignments  PortalAssignment[]

  @@index([teacherCode])
  @@map("portal_teachers")
}

// ============================================
// PORTAL CLASSES
// ============================================

model PortalClass {
  id              String   @id @default(uuid())
  name            String
  code            String   @unique // HSK1-MON-001
  description     String?

  // Class Info
  hskLevel        Int      // 1-6
  capacity        Int      @default(20)
  startDate       DateTime
  endDate         DateTime?

  // Schedule
  schedule        String?  // JSON: [{day: 'Monday', time: '08:00-09:30'}]

  // Google Calendar Integration
  googleCalendarId String?
  syncToGoogle    Boolean  @default(false)

  // Status
  isActive        Boolean  @default(true)

  // Teacher
  teacherId       String

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  teacher         PortalTeacher @relation(fields: [teacherId], references: [id])
  enrollments     PortalClassEnrollment[]
  schedules       PortalSchedule[]
  assignments     PortalAssignment[]
  attendances     PortalAttendance[]

  @@index([code])
  @@index([teacherId])
  @@map("portal_classes")
}

model PortalClassEnrollment {
  id          String   @id @default(uuid())
  classId     String
  studentId   String

  // Status
  status      EnrollmentStatus @default(ACTIVE)
  enrolledAt  DateTime @default(now())
  completedAt DateTime?

  // Relations
  class       PortalClass @relation(fields: [classId], references: [id], onDelete: Cascade)
  student     PortalStudent @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([classId, studentId])
  @@map("portal_class_enrollments")
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  DROPPED
  SUSPENDED
}

// ============================================
// PORTAL SCHEDULE & ATTENDANCE
// ============================================

model PortalSchedule {
  id              String   @id @default(uuid())
  classId         String

  // Schedule Info
  title           String
  description     String?
  date            DateTime
  startTime       String   // HH:mm format
  endTime         String   // HH:mm format

  // Lesson Content
  lessonTopic     String?
  materials       String?  // JSON array of URLs

  // Google Calendar
  googleEventId   String?

  // Status
  isCancelled     Boolean  @default(false)
  cancelReason    String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  class           PortalClass @relation(fields: [classId], references: [id], onDelete: Cascade)
  attendances     PortalAttendance[]

  @@index([classId])
  @@index([date])
  @@map("portal_schedules")
}

model PortalAttendance {
  id          String   @id @default(uuid())
  scheduleId  String
  studentId   String
  classId     String

  // Attendance
  status      AttendanceStatus @default(ABSENT)
  note        String?          // Reason if absent

  // Check-in
  checkInTime DateTime?
  checkInBy   String?          // Teacher/Student ID

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  schedule    PortalSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  student     PortalStudent @relation(fields: [studentId], references: [id], onDelete: Cascade)
  class       PortalClass @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@unique([scheduleId, studentId])
  @@index([classId])
  @@index([studentId])
  @@map("portal_attendances")
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

// ============================================
// PORTAL ASSIGNMENTS
// ============================================

model PortalAssignment {
  id              String   @id @default(uuid())
  classId         String
  teacherId       String

  // Assignment Info
  title           String
  description     String?
  type            AssignmentType

  // Skills (for HSK learning)
  skillTypes      String   // JSON: ['LISTENING', 'READING', 'WRITING', 'SPEAKING']

  // Content
  content         String?  // JSON: questions, exercises, etc.
  attachments     String?  // JSON: file URLs

  // Grading
  totalPoints     Int      @default(100)
  passingScore    Int      @default(60)

  // Dates
  dueDate         DateTime
  availableFrom   DateTime @default(now())

  // Status
  isPublished     Boolean  @default(false)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  class           PortalClass @relation(fields: [classId], references: [id], onDelete: Cascade)
  teacher         PortalTeacher @relation(fields: [teacherId], references: [id])
  submissions     PortalAssignmentSubmission[]

  @@index([classId])
  @@index([teacherId])
  @@map("portal_assignments")
}

enum AssignmentType {
  HOMEWORK
  QUIZ
  EXAM
  PROJECT
  PRACTICE
}

model PortalAssignmentSubmission {
  id              String   @id @default(uuid())
  assignmentId    String
  studentId       String

  // Submission
  content         String?  // JSON: answers
  attachments     String?  // JSON: file URLs
  submittedAt     DateTime @default(now())

  // Grading
  score           Int?
  feedback        String?
  gradedAt        DateTime?
  gradedBy        String?  // Teacher ID

  // Status
  status          SubmissionStatus @default(SUBMITTED)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  assignment      PortalAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student         PortalStudent @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([assignmentId, studentId])
  @@index([studentId])
  @@map("portal_assignment_submissions")
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  GRADED
  RETURNED
}

// ============================================
// PORTAL LEARNING (Student)
// ============================================

model PortalLearningProgress {
  id          String   @id @default(uuid())
  studentId   String

  // Skill Progress
  skillType   SkillType
  level       Int      @default(1) // Current level
  xp          Int      @default(0) // Experience points
  targetXP    Int      @default(500) // XP needed for next level

  // Stats
  totalPracticeTime Int @default(0) // Minutes
  completedExercises Int @default(0)
  accuracy    Float   @default(0.0) // Percentage

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  student     PortalStudent @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([studentId, skillType])
  @@map("portal_learning_progress")
}

enum SkillType {
  LISTENING
  SPEAKING
  READING
  WRITING
}

model PortalVocabulary {
  id          String   @id @default(uuid())

  // Vocabulary
  word        String
  pinyin      String
  meaning     String
  example     String?
  audioUrl    String?
  imageUrl    String?

  // HSK Level
  hskLevel    Int      // 1-6

  // Category
  category    String?  // e.g., "Numbers", "Colors", "Food"

  // Difficulty
  difficulty  Int      @default(1) // 1-5

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  bookmarks   PortalBookmark[]

  @@index([hskLevel])
  @@map("portal_vocabularies")
}

model PortalBookmark {
  id          String   @id @default(uuid())
  studentId   String
  vocabularyId String

  // Notes
  note        String?
  tags        String?  // JSON array

  // Learning
  masteryLevel Int     @default(0) // 0-5
  reviewCount Int     @default(0)
  lastReviewedAt DateTime?

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  student     PortalStudent @relation(fields: [studentId], references: [id], onDelete: Cascade)
  vocabulary  PortalVocabulary @relation(fields: [vocabularyId], references: [id], onDelete: Cascade)

  @@unique([studentId, vocabularyId])
  @@map("portal_bookmarks")
}

model PortalQuiz {
  id          String   @id @default(uuid())

  // Quiz Info
  title       String
  description String?
  hskLevel    Int      // 1-6
  skillType   SkillType

  // Content
  questions   String   // JSON: array of questions

  // Settings
  timeLimit   Int?     // Minutes
  passingScore Int     @default(70)

  // Status
  isPublished Boolean  @default(false)

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  attempts    PortalQuizAttempt[]

  @@index([hskLevel])
  @@map("portal_quizzes")
}

model PortalQuizAttempt {
  id          String   @id @default(uuid())
  quizId      String
  studentId   String

  // Attempt
  answers     String   // JSON: array of answers
  score       Int
  timeSpent   Int      // Seconds

  // Results
  correctCount Int
  totalQuestions Int

  // Timestamps
  startedAt   DateTime @default(now())
  completedAt DateTime?

  // Relations
  quiz        PortalQuiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  student     PortalStudent @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId])
  @@index([quizId])
  @@map("portal_quiz_attempts")
}
```

---

## 🔧 Technology Stack

### Current (Keep)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma
- **Language**: TypeScript
- **Deployment**: Vercel (assumed)

### New Additions
- **Auth**: NextAuth.js v5 (Auth.js)
  - Google OAuth provider
  - Credentials provider (email/password)
  - Session management

- **UI Components** (Optional):
  - **shadcn/ui** for complex components:
    - Table (react-table)
    - Calendar (react-day-picker)
    - Dropdown Menu
    - Dialog/Sheet
    - Tabs
    - Data Table

- **Google Calendar API**:
  - `googleapis` package
  - OAuth2 for calendar access

- **Form Validation**:
  - `zod` (already might be using)
  - `react-hook-form`

- **Charts** (for dashboards):
  - `recharts` (lightweight)
  - or `chart.js`

- **Date/Time**:
  - `date-fns` (lighter than moment.js)

- **File Upload**:
  - `uploadthing` or `react-dropzone`

- **Rich Text** (for assignments):
  - `tiptap` or `quill`

---

## 📦 Implementation Plan

### Phase 1: Setup & Authentication (Week 1)
1. **Route Groups Setup**
   - Create `(landing)` and `(portal)` route groups
   - Move existing pages to `(landing)`
   - Create portal layouts

2. **Database Migration**
   - Add portal schema
   - Run migrations
   - Update seed file

3. **NextAuth Setup**
   - Configure Google OAuth
   - Setup credentials provider
   - Create auth pages (login, register)
   - Setup middleware for route protection

4. **User Registration Flow**
   - Registration form (name, email, phone)
   - Email verification (optional)
   - Default role: STUDENT

### Phase 2: Portal Core (Week 2)
1. **Portal Layout**
   - Sidebar navigation
   - Header with user menu
   - Responsive design

2. **Role-based Routing**
   - Teacher dashboard
   - Student dashboard
   - Permission guards

3. **User Profile**
   - View profile
   - Edit profile
   - Avatar upload

### Phase 3: Teacher Features (Week 3-4)
1. **Class Management**
   - Create/edit/delete classes
   - View class list
   - Class details

2. **Student Management**
   - View students in class
   - Add/remove students
   - View student progress

3. **Assignment Management**
   - Create assignments
   - View submissions
   - Grade assignments
   - Feedback

4. **Schedule Management**
   - Create schedules
   - Calendar view
   - Google Calendar sync (optional)

5. **Attendance**
   - Mark attendance
   - View attendance reports
   - Export data

### Phase 4: Student Features (Week 5-6)
1. **Dashboard**
   - Upcoming classes
   - Pending assignments
   - Progress overview

2. **Assignments**
   - View assignments
   - Submit assignments
   - View grades & feedback

3. **Attendance**
   - View own attendance
   - View classmates attendance (optional)

4. **Learning Module**
   - Vocabulary practice
   - Flashcards
   - Quiz
   - Listening/Speaking/Reading/Writing exercises

5. **Bookmarks**
   - Save vocabulary
   - Review bookmarks

### Phase 5: Polish & Optimization (Week 7)
1. **Performance**
   - Optimize queries
   - Add caching
   - Image optimization

2. **UX/UI**
   - Loading states
   - Error handling
   - Animations

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

---

## 🎯 Prompt cho Claude 4.5

### Tiếng Việt

\`\`\`
Dự án: HSK Master - Hệ thống quản lý học tập tiếng Trung

Context:
- Dự án Next.js 15 (App Router) + Tailwind CSS + Prisma + PostgreSQL
- Đã có landing page hoàn chỉnh
- Cần xây dựng portal quản lý học tập với 2 role: Teacher (Admin) và Student

Yêu cầu:

1. AUTHENTICATION
- Tích hợp NextAuth.js v5 với Google OAuth (popup/redirect)
- Đăng ký: name, phone, email, role mặc định STUDENT
- Login với Google hoặc email/password
- Middleware bảo vệ route

2. RESTRUCTURE CODE
- Route groups: (landing) và (portal)
- Tách biệt components landing/portal
- Shared components cho cả 2 (reuse existing)
- Portal layout: Sidebar + Header

3. DATABASE SCHEMA
- Thêm portal tables với prefix "portal_"
- Models: PortalUser, PortalStudent, PortalTeacher, PortalClass, PortalAssignment, PortalAttendance, PortalSchedule, PortalVocabulary, PortalBookmark, PortalQuiz
- Seed data mẫu

4. TEACHER FEATURES
- Quản lý lớp học (CRUD)
- Quản lý học sinh (thêm/xóa khỏi lớp)
- Quản lý bài tập (tạo, chấm điểm, feedback)
- Quản lý lịch học (Calendar view, sync Google Calendar)
- Điểm danh (mark attendance, view reports, note reason)
- Dashboard tổng quan

5. STUDENT FEATURES
- Dashboard: upcoming classes, pending assignments, progress
- Xem bài tập của lớp
- Nộp bài tập
- Xem điểm danh (own + classmates)
- Learning module:
  - Nghe (Listening)
  - Nói (Speaking)
  - Đọc (Reading)
  - Viết (Writing)
  - Flashcards
  - Từ vựng (Vocabulary)
  - Quiz
  - Bookmark
- Edit profile

6. UI LIBRARY
- Đánh giá: nên dùng shadcn/ui hay tận dụng components hiện có?
- Nếu dùng shadcn/ui: chỉ add components phức tạp (Table, Calendar, Dropdown Menu)
- Reuse existing: Button, Input, Badge, etc.

Technical Stack:
- Next.js 15 + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js v5
- (Optional) shadcn/ui cho portal components
- googleapis (Google Calendar API)
- react-hook-form + zod
- recharts (dashboard charts)
- date-fns

Task:
Lên plan chi tiết từng bước implementation:
1. Setup NextAuth + Google OAuth
2. Database migration + seed
3. Route groups + layouts
4. Teacher features (từng feature một)
5. Student features (từng feature một)
6. Testing + optimization

Tạo structure code rõ ràng, component hierarchy, API routes, và checklist implementation.
\`\`\`

### English

\`\`\`
Project: HSK Master - Chinese Learning Management System

Context:
- Next.js 15 (App Router) + Tailwind CSS + Prisma + PostgreSQL
- Existing complete landing page
- Need to build learning management portal with 2 roles: Teacher (Admin) and Student

Requirements:

1. AUTHENTICATION
- Integrate NextAuth.js v5 with Google OAuth (popup/redirect)
- Registration: name, phone, email, default role STUDENT
- Login with Google or email/password
- Middleware for route protection

2. CODE RESTRUCTURE
- Route groups: (landing) and (portal)
- Separate landing/portal components
- Shared components for both (reuse existing)
- Portal layout: Sidebar + Header

3. DATABASE SCHEMA
- Add portal tables with prefix "portal_"
- Models: PortalUser, PortalStudent, PortalTeacher, PortalClass, PortalAssignment, PortalAttendance, PortalSchedule, PortalVocabulary, PortalBookmark, PortalQuiz
- Sample seed data

4. TEACHER FEATURES
- Class management (CRUD)
- Student management (add/remove from class)
- Assignment management (create, grade, feedback)
- Schedule management (Calendar view, Google Calendar sync)
- Attendance (mark attendance, view reports, note reason)
- Dashboard overview

5. STUDENT FEATURES
- Dashboard: upcoming classes, pending assignments, progress
- View class assignments
- Submit assignments
- View attendance (own + classmates)
- Learning module:
  - Listening
  - Speaking
  - Reading
  - Writing
  - Flashcards
  - Vocabulary
  - Quiz
  - Bookmark
- Edit profile

6. UI LIBRARY
- Evaluate: should use shadcn/ui or leverage existing components?
- If shadcn/ui: only add complex components (Table, Calendar, Dropdown Menu)
- Reuse existing: Button, Input, Badge, etc.

Technical Stack:
- Next.js 15 + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js v5
- (Optional) shadcn/ui for portal components
- googleapis (Google Calendar API)
- react-hook-form + zod
- recharts (dashboard charts)
- date-fns

Task:
Create detailed implementation plan step by step:
1. Setup NextAuth + Google OAuth
2. Database migration + seed
3. Route groups + layouts
4. Teacher features (one by one)
5. Student features (one by one)
6. Testing + optimization

Provide clear code structure, component hierarchy, API routes, and implementation checklist.
\`\`\`

---

## 📝 Next Steps

1. **Review this plan** and confirm approach
2. **Install dependencies**:
   ```bash
   npm install next-auth@beta @auth/prisma-adapter
   npm install react-hook-form zod @hookform/resolvers
   npm install date-fns
   npm install recharts
   npm install googleapis
   ```

3. **Optional - shadcn/ui**:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add table
   npx shadcn-ui@latest add calendar
   npx shadcn-ui@latest add dropdown-menu
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add tabs
   ```

4. **Create route groups** and move files
5. **Add portal schema** to Prisma
6. **Setup NextAuth** configuration
7. **Start implementing** phase by phase

---

## 🎨 Design References

Portal UI inspiration from: https://preview--hsk-portal.lovable.app/
- Clean, modern design
- Sidebar navigation
- Card-based dashboard
- Progress indicators
- Calendar view
- Table views for data

---

## ✅ Success Criteria

- [ ] Separate landing and portal routes
- [ ] Google OAuth login working
- [ ] Email/password registration
- [ ] Role-based access control
- [ ] Teacher can manage classes, students, assignments, attendance
- [ ] Student can view assignments, submit work, track progress
- [ ] Learning modules functional (vocabulary, flashcards, quiz)
- [ ] Responsive design (mobile-friendly)
- [ ] Performance optimized (< 3s load time)
- [ ] Production-ready (error handling, validation)

---

**Generated:** January 27, 2026
**Author:** AI Assistant
**Project:** HSK Master Portal
