# HSK Portal --- Assignment Feature Spec (Teacher ↔ Student)

------------------------------------------------------------------------

# 1. Overview

Feature: Homework / Assignment management between Teacher and Student.

Goal: - Teacher creates and publishes assignments. - Students receive
notification and submit homework. - Teacher grades and sends
notification back. - System tracks status and in-app notifications.

------------------------------------------------------------------------

# 2. V1 Scope (Build Fast & Stable)

## 2.1 Assignment Management

### Included in V1

-   Assignment status: `DRAFT` / `PUBLISHED`
-   Create / Edit Assignment
-   Attachments upload (image, docx, ppt, pdf...)
-   Image preview support
-   Optional external link
-   Hashtag input (Tab / Enter → chip)
-   Class selection (required)
-   Toggle Draft/Published (default = Draft)

### Rules

-   Default status = DRAFT
-   When switching to PUBLISHED:
    -   Set `publishedAt`
    -   Send notification to all students in class
-   Draft assignments are visible only to Teacher

------------------------------------------------------------------------

## 2.2 Student Side (V1)

### Features

-   View assignment list (by class)
-   View assignment detail
-   Download attachments
-   Submit homework (upload file)
-   Re-submit (override previous submission)
-   View grading result (score + comment)

### Submission Status

-   NOT_SUBMITTED
-   SUBMITTED
-   RESUBMITTED
-   GRADED
-   RETURNED

------------------------------------------------------------------------

## 2.3 Teacher Side (V1)

### Features

-   View assignment list
-   View submissions list per assignment
-   See submitted / not submitted count
-   Grade submission (score + comment)
-   Mark as GRADED or RETURNED

------------------------------------------------------------------------

## 2.4 Notifications (V1)

### In-App Notification

-   Bell icon with unread badge
-   Notification list dropdown/page
-   Mark as read

### Notification Types

-   ASSIGNMENT_PUBLISHED
-   SUBMISSION_SUBMITTED
-   SUBMISSION_RESUBMITTED
-   SUBMISSION_GRADED
-   SUBMISSION_RETURNED

### Trigger Rules

-   Publish assignment → notify all students in class
-   Student submit → notify teacher
-   Teacher grade → notify student

------------------------------------------------------------------------

# 3. V2 Scope (Future Enhancements)

## 3.1 Assignment Enhancements

-   Due date field
-   Reminder notification before due date
-   Update published assignment → send update notification
-   Archive assignment

## 3.2 Grading Improvements

-   Rubric / Multiple criteria scoring
-   Auto calculate total score
-   Grade breakdown UI

## 3.3 Communication

-   Comment thread under submission
-   Real-time comment updates
-   Mention teacher/student

## 3.4 Smart Features

-   Deadline reminder scheduler
-   Overdue highlight
-   Submission analytics
-   Student performance report per assignment

------------------------------------------------------------------------

# 4. Acceptance Criteria (V1)

Assignment: - Can create draft - Can publish - Students receive
notification - Students can view & submit - Teacher can grade - Student
receives grade notification

Notifications: - Unread count accurate - Clicking notification navigates
to correct page - Mark as read works

------------------------------------------------------------------------

# 5. Future Scalability Notes

-   Store notifications in DB (not transient)
-   Use event-driven trigger service
-   Support push notification in future
-   Make grading structure extensible for rubric system

------------------------------------------------------------------------

END OF SPEC
