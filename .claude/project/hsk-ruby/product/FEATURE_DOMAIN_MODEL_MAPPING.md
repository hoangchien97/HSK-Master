# Ruby HSK — Feature Domain Model Mapping

**Date:** 2026-06-24
**Source:** prisma/schema.prisma (814 lines, 30+ models)

---

## Domain → Existing Prisma Models

| Domain | Existing Models | Coverage |
|---|---|---|
| Landing CMS | `HeroSlide`, `Feature`, `CtaStat`, `Review`, `Album`, `Photo`, `PageMetadata` | ✅ Full |
| Course Content | `Category`, `Course`, `Lesson`, `Vocabulary`, `GrammarPoint`, `HSKLevel` | ✅ Full |
| Lead Capture | `Registration` | ⚠ Missing `status` field |
| Auth | `PortalUser`, `Account`, `Session`, `VerificationToken` | ✅ Full |
| User Profiles | `PortalUser` (name, email, phone, address, dob, biography, notes) | ✅ Full |
| Class Management | `PortalClass`, `PortalClassEnrollment` | ✅ Full |
| Scheduling | `PortalScheduleSeries`, `PortalSchedule` | ✅ Full |
| Attendance | `PortalAttendance` | ✅ Full |
| Assignments | `PortalAssignment`, `PortalAssignmentSubmission` | ✅ Full |
| Practice / SRS | `PortalLessonProgress`, `PortalItemProgress`, `PortalItemSkillProgress`, `PortalLessonSkillProgress`, `PortalLessonSessionState`, `PortalPracticeSession`, `PortalPracticeAttempt` | ✅ Full |
| Notifications | `PortalNotification` | ✅ Full |
| AI Chatbot | `ChatSession`, `ChatMessage` | ✅ Full |
| Google Calendar | `GoogleCalendarToken` | ✅ Full |

---

## Missing Models (schema changes needed)

### Registration Pipeline — P1

**Problem:** `Registration` model không có `status` field.

```prisma
// Required addition to existing Registration model:
// status  String  @default("PENDING") // PENDING, CONTACTED, ENROLLED, CLOSED
// notes   String? @db.Text            // Admin follow-up notes
// updatedAt DateTime @updatedAt
```

**Risk if built without:** Admin thấy danh sách lead nhưng không track được follow-up.

---

### Finance / Tuition — 📌 Todo

**Problem:** Toàn bộ domain vắng mặt.

```prisma
// FUTURE — do not implement until approved

model TuitionPayment {
  id            String   @id @default(cuid())
  studentId     String
  classId       String
  amount        Float
  paidAt        DateTime
  method        String   // CASH, TRANSFER, CARD
  note          String?
  createdAt     DateTime @default(now())
  student       PortalUser  @relation(...)
  class         PortalClass @relation(...)
  @@map("tuition_payments")
}

model FinanceTransaction {
  id            String   @id @default(cuid())
  type          String   // INCOME, EXPENSE
  categoryId    String
  amount        Float
  description   String?
  transactionAt DateTime
  createdAt     DateTime @default(now())
  category      FinanceCategory @relation(...)
  @@map("finance_transactions")
}

model FinanceCategory {
  id            String   @id @default(cuid())
  name          String
  type          String   // INCOME, EXPENSE
  transactions  FinanceTransaction[]
  @@map("finance_categories")
}
```

---

### Teacher Salary — 📌 Todo

**Problem:** Toàn bộ domain vắng mặt.

```prisma
// FUTURE — do not implement until approved

model TeacherSalaryConfig {
  id          String   @id @default(cuid())
  teacherId   String   @unique
  ratePerSession Float
  fixedMonthly   Float?
  effectiveFrom  DateTime
  teacher     PortalUser @relation(...)
  @@map("teacher_salary_configs")
}

model TeachingSessionLog {
  id          String   @id @default(cuid())
  teacherId   String
  classId     String
  scheduleId  String?
  sessionDate DateTime
  durationHrs Float
  createdAt   DateTime @default(now())
  teacher     PortalUser  @relation(...)
  class       PortalClass @relation(...)
  @@map("teaching_session_logs")
}
```

---

### FAQ CMS — P2 (optional)

**Decision:** Can start as static copy; upgrade to CMS when content grows.

```prisma
// Optional — only if FAQ needs admin management

model FAQItem {
  id        String   @id @default(cuid())
  question  String
  answer    String   @db.Text
  category  String?  // e.g., "Học phí", "Lịch học", "Trình độ"
  order     Int
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("faq_items")
}
```

---

## Models Requiring Verification

| Model / Field | Issue | How to verify |
|---|---|---|
| `Vocabulary.word` vs `hanzi` | `BookmarksClient.tsx` references `vocabulary.hanzi` but schema has `vocabulary.word` | Read bookmark page.tsx server query + type definitions |
| `Vocabulary` → `hskLevel` | BookmarksClient shows `hskLevel.level` but Vocabulary has no direct hskLevel relation | Check if service joins via `Lesson.course.hskLevelId` |
| `Registration.status` | Does `Registration` model have a status field already? | `grep -n "status" prisma/schema.prisma` near Registration |
| `PortalSchedule.location` | Is `location` field being used in UI? | Sufficient for 1-room center |

---

## Schema Integrity Notes

- All models use either `uuid()` (landing/CMS) or `cuid()` (portal) — consistent within each domain
- All portal user-linked models use `onDelete: Cascade` — safe
- Missing indexes to verify: `PortalAttendance` on `[studentId, date]` and `[classId, date]` — check migration history
- `PortalAssignment.attachments` and `.tags` are `String[]` — Postgres array; confirm Supabase/Prisma handles correctly
