# Phase 1 Setup Complete! 🎉

## ✅ Completed Tasks

1. **Database Schema** - Added portal models to Prisma
2. **Migration** - Database synced successfully
3. **NextAuth.js v5** - Configured with Google OAuth + Credentials
4. **Route Groups** - Created `(landing)` and `(portal)` structure
5. **Authentication Pages** - Login, Register, Logout, Error pages
6. **Middleware** - Route protection for `/portal/*` routes

---

## 🔐 Environment Variables Setup

Update your `.env` file with the following:

```env
# NextAuth.js v5 Configuration
AUTH_SECRET="7j/yuIBUNxo4Yc96o+kZdPRPFwvbI2gjYgTmN1Sq+ik="
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### How to get Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret** to `.env`

---

## 📂 Project Structure

```
app/
├── (landing)/              # Landing page routes (public)
│   ├── layout.tsx
│   └── ...existing pages will be moved here
│
├── (portal)/              # Portal routes (protected)
│   ├── layout.tsx
│   └── portal/
│       ├── page.tsx       # Redirect to teacher/student
│       ├── teacher/
│       │   └── page.tsx   # Teacher dashboard
│       └── student/
│           └── page.tsx   # Student dashboard
│
├── auth/                  # Authentication pages (public)
│   ├── login/
│   ├── register/
│   ├── logout/
│   └── error/
│
└── api/
    └── auth/
        ├── [...nextauth]/  # NextAuth.js handler
        └── register/       # Registration API
```

---

## 🚀 Test the Authentication

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test registration:**
   - Go to `http://localhost:3000/auth/register`
   - Create a new account
   - Login at `http://localhost:3000/auth/login`

3. **Test Google OAuth:**
   - Update `.env` with Google credentials
   - Click "Sign in with Google" button

4. **Access Portal:**
   - After login, you'll be redirected to `/portal`
   - Default users are `STUDENT` role
   - Students → `/portal/student`
   - Teachers → `/portal/teacher`

---

## 👥 Create Test Users

### Option 1: Via Registration Page
- Go to `/auth/register` and create accounts

### Option 2: Direct Database Insert
```sql
-- Teacher/Admin user
INSERT INTO portal_users (id, name, email, password, role)
VALUES (
  'teacher-1',
  'Giáo Viên Test',
  'teacher@hsk.com',
  -- Password: "123456" (hashed with bcrypt)
  '$2a$10$rOHJPDzN8H8vXZ9QX9YZ9eWKZN0T8QX9YZ9eWKZN0T8QX9YZ9eWK',
  'TEACHER'
);

-- Student user
INSERT INTO portal_users (id, name, email, password, role)
VALUES (
  'student-1',
  'Học Sinh Test',
  'student@hsk.com',
  '$2a$10$rOHJPDzN8H8vXZ9QX9YZ9eWKZN0T8QX9YZ9eWKZN0T8QX9YZ9eWK',
  'STUDENT'
);
```

---

## 🔄 Next Steps (Phase 2)

### Week 2-3: Teacher Features

1. **Class Management** (`/portal/teacher/classes`)
   - Create/edit/delete classes
   - View class details and enrolled students
   - Class roster management

2. **Student Management** (`/portal/teacher/students`)
   - View all students
   - Student profiles
   - Enrollment management
   - Student progress tracking

3. **Assignment Management** (`/portal/teacher/assignments`)
   - Create assignments
   - View submissions
   - Grade submissions
   - Provide feedback

4. **Schedule Management** (`/portal/teacher/schedule`)
   - Create class schedules
   - Calendar view
   - Meeting links (Google Meet integration)

5. **Attendance Tracking** (`/portal/teacher/attendance`)
   - Mark attendance
   - View attendance reports
   - Attendance statistics

---

## 🛠️ Database Models Overview

### Authentication
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification
- `PortalUser` - Base user model

### User Profiles
- `PortalStudent` - Student extended profile
- `PortalTeacher` - Teacher extended profile

### Class Management
- `PortalClass` - Classes
- `PortalClassEnrollment` - Student enrollments
- `PortalSchedule` - Class schedules
- `PortalAttendance` - Attendance records

### Learning & Assessment
- `PortalAssignment` - Assignments
- `PortalAssignmentSubmission` - Student submissions
- `PortalLearningProgress` - Learning tracking
- `PortalVocabulary` - Vocabulary learning
- `PortalBookmark` - Bookmarks
- `PortalQuiz` - Quizzes
- `PortalQuizAttempt` - Quiz attempts

---

## 📝 Implementation Tips

1. **Server Components by default** - Use `"use client"` only when needed
2. **Server Actions** - Use for form submissions and mutations
3. **Protected Routes** - Middleware automatically protects `/portal/*`
4. **Session Access** - Use `await auth()` to get current user
5. **Role-based Access** - Check `session.user.role` for permissions

---

## 🐛 Troubleshooting

### Issue: "NEXTAUTH_URL not set"
**Solution:** Add `NEXTAUTH_URL="http://localhost:3000"` to `.env`

### Issue: "OAuth error"
**Solution:** Verify Google OAuth credentials and redirect URIs

### Issue: "Prisma Client not found"
**Solution:** Run `npx prisma generate`

### Issue: "Database connection error"
**Solution:** Check `DATABASE_URL` and `DIRECT_URL` in `.env`

---

## 📚 Documentation

- [NextAuth.js v5 Docs](https://authjs.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

---

**Ready to continue with Phase 2?** Let me know what feature you'd like to implement first! 🚀
