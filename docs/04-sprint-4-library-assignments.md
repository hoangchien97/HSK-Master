# Sprint 4 — Library (Tài liệu) + Assignments (Wizard tạo bài tập)

## Goal
Teacher upload tài liệu, tổ chức folder; tạo bài tập theo wizard; giao cho lớp; student làm & nộp.

## Scope
### 1) Library
- Folder grid + files table (pdf/mp3/mp4/quiz)
- Upload file (Storage: Supabase/Cloudinary/S3; MVP có thể stub)
- Metadata: type, size, uploadedAt, visibility (PRIVATE/CLASS/PUBLIC)
- Actions: rename, move, delete (soft)

### 2) Assignment wizard (MVP)
Step 1: Setup
- title, description, skill, dueAt, maxScore
Step 2: Content
- Question types MVP: MCQ, Fill blank
Step 3: Publish & Assign
- choose class, openAt, dueAt, allowLate

### 3) Student
- Assigned list
- Detail + start attempt / submit
- Submission status: draft/submitted/late

## Data model
- `Folder`, `Material`
- `Assignment`, `Question`, `Submission`, `SubmissionAnswer`

## Acceptance Criteria
- [ ] Upload file hiển thị đúng icon/type
- [ ] Create assignment + assign class
- [ ] Student sees assignment + submits
- [ ] DueAt rules enforced

## Tasks
- [ ] CRUD folders/materials
- [ ] Wizard UI shadcn (Tabs/Stepper)
- [ ] API create assignment + questions
- [ ] Student pages

## Demo
- Upload mp3 listening → create MCQ homework → student submit
