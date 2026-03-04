Assignment Module Specification (v2)

HSK Portal – Teacher & Student Workflow

1. Overview

The Assignment Module enables teachers to:

Create and assign homework to a class

Attach files and external resources

Monitor submission progress (X / Y submitted)

Filter submissions by grading status

Provide feedback and comments

Mark assignments as completed or revision required

Students can:

Receive assignment notifications

View assignment details

Comment and mention users

Submit files or external links

Receive grading feedback and status updates

2. Core Objectives

This module must provide:

Clear progress tracking

Efficient grading workflow

Structured comment system with mentions

Real-time notification system

Clean and scalable database structure

Optimized UI for teachers managing multiple classes

3. Assignment Lifecycle
3.1 Teacher Flow

Create → Publish → Monitor → Review → Mark Completed → Close

3.2 Student Flow

Receive Notification → View Detail → Submit → Receive Feedback → Complete

4. Assignment List Page (Teacher View)
4.1 Table Columns
Column	Description
Title	Assignment title
Class	Assigned class
Deadline	Due date
Progress	Submitted / Total Students
Pending Review	Count of submissions waiting for grading
Status	Draft / Published / Closed
Actions	View / Edit / Close
4.2 Submission Progress Indicator

Display:

18 / 25 Submitted
7 Pending Review

Definitions:

Submitted = total students who submitted

Pending Review = submissions with status = SUBMITTED

Completed = submissions with status = COMPLETED

4.3 Teacher Filters (List Page)

Filters:

All

Draft

Published

Closed

Needs Grading (pendingReview > 0)

Overdue

5. Assignment Detail Page
5.1 Header Section

Displays:

Title

Class Name

Deadline

Hashtags (full width 100%)

Description

Attachments

External Link

Statistics Summary

Statistics Summary Example
Total Students: 25
Submitted: 18
Pending Review: 7
Completed: 11
Overdue: 3
5.2 Tabs

Overview

Submissions (Teacher Only)

Comments

6. Submissions Tab (Teacher Grading View)
6.1 Submission Filters

Filter by:

All

Not Submitted

Submitted

Pending Review

Completed

Revision Required

Overdue

6.2 Submission Card Layout

Each student submission displays:

Student Name

Status Badge

Submitted Time

Files Preview

Submission Link

Comment Count

Action Buttons:

Mark Completed

Request Revision

Add Feedback

6.3 Status Definitions
Status	Meaning
NOT_SUBMITTED	No submission
SUBMITTED	Submitted but not reviewed
REVIEWED	Reviewed but not finalized
COMPLETED	Grading completed
REVISION_REQUIRED	Student must resubmit
OVERDUE	Past deadline without submission
7. Student Assignment Detail

Displays:

Assignment info

Attachments

Deadline

Submission box

Comment section

Current submission status

7.1 Student Submission Options

Students can:

Upload files (images, PDF, DOC)

Submit external Google Docs link

Add notes/comments

After submission:

Status = SUBMITTED

Teacher receives notification

8. Comment System (Assignment + Submission Level)
8.1 Features

Threaded comments

@Mention support

Assignment-level comments

Submission-level comments

Notification on mention

Notification on reply

8.2 Mention Handling

When parsing content:

Detect @userId

Create Notification record

Support multiple mentions

9. Notification System
9.1 Trigger Events
Event	Receiver
Assignment Published	All students in class
Student Submitted	Teacher
Teacher Commented	Student
Mentioned in Comment	Mentioned User
Status Updated	Student
Revision Requested	Student
10. Database Schema (Updated Prisma Models)
model Assignment {
  id               String   @id @default(cuid())
  title            String
  description      String?
  classId          String
  teacherId        String
  deadline         DateTime?
  hashtags         String[]
  externalLink     String?
  status           AssignmentStatus @default(PUBLISHED)
  totalStudents    Int
  submittedCount   Int      @default(0)
  completedCount   Int      @default(0)
  pendingReview    Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  attachments      AssignmentAttachment[]
  submissions      AssignmentSubmission[]
  comments         AssignmentComment[]
}
model AssignmentSubmission {
  id               String @id @default(cuid())
  assignmentId     String
  studentId        String
  content          String?
  externalLink     String?
  status           SubmissionStatus @default(SUBMITTED)
  isOverdue        Boolean @default(false)
  reviewedAt       DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  attachments      SubmissionAttachment[]
  comments         AssignmentComment[]
}
model AssignmentComment {
  id            String @id @default(cuid())
  assignmentId  String?
  submissionId  String?
  userId        String
  content       String
  parentId      String?
  mentionedIds  String[]
  createdAt     DateTime @default(now())
}
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType
  entityId  String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
Enums
enum AssignmentStatus {
  DRAFT
  PUBLISHED
  CLOSED
}
enum SubmissionStatus {
  NOT_SUBMITTED
  SUBMITTED
  REVIEWED
  COMPLETED
  REVISION_REQUIRED
}
11. UX Design Requirements
11.1 Hashtag Field

Full width (100%)

Tag-style input

Enter / Tab to add

Click x to remove

Auto-trim whitespace

11.2 Teacher Dashboard UX

Must support:

Sorting by deadline

Sorting by pending review

Quick filter: Needs Grading

Clear progress visualization

Badge color system

11.3 Performance Optimization

Use pagination for submissions

Index:

assignmentId

studentId

classId

status

Use aggregated counters on Assignment table

Avoid counting submissions on every query

12. Edge Cases

Student joins class after assignment creation
→ Auto-create NOT_SUBMITTED record

Student resubmits after revision
→ Update status to SUBMITTED
→ Increase pendingReview counter

Deadline passes
→ Mark non-submitted as OVERDUE
→ Still allow submission (configurable)

Assignment closed
→ Disable submission
→ Allow read-only view

13. API Endpoints
Teacher

POST /api/assignments
GET /api/assignments
GET /api/assignments/:id
PATCH /api/assignments/:id
POST /api/assignments/:id/close

Student

GET /api/my-assignments
POST /api/assignments/:id/submit

Submission Review

PATCH /api/submissions/:id/status
POST /api/submissions/:id/comment

Comments

POST /api/comments
GET /api/comments?assignmentId=

Notification

GET /api/notifications
PATCH /api/notifications/:id/read

14. Final UX Goals

The system should feel like:

Google Classroom (structure)
Notion (clean layout)
Facebook (mentions & comments)

Teachers must:

Quickly see grading workload

Filter pending submissions

Give fast feedback

Students must:

Clearly see status

Easily submit

Be notified instantly
