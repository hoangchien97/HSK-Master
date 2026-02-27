/**
 * Notification Constants
 *
 * Centralised event types, channel names, and helper labels
 * used across the notification system.
 */

import { NotificationType } from '@/enums/portal/common';

/* ═══════════════════════════════════════════════════════════
   SUPABASE REALTIME CHANNEL
   ═══════════════════════════════════════════════════════════ */

/** Channel name for notification subscriptions (one per user) */
export const NOTIFICATION_CHANNEL = 'portal-notifications';

/** Supabase Realtime table to listen on */
export const NOTIFICATION_TABLE = 'portal_notifications';

/** Realtime event types */
export const REALTIME_EVENT = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
} as const;

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION TYPE → Vietnamese LABEL
   ═══════════════════════════════════════════════════════════ */

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  // Assignments
  [NotificationType.ASSIGNMENT_PUBLISHED]: 'Bài tập mới',
  [NotificationType.ASSIGNMENT_DEADLINE]: 'Sắp đến hạn nộp bài',
  [NotificationType.ASSIGNMENT_DELETED]: 'Bài tập đã bị xoá',
  // Submissions
  [NotificationType.SUBMISSION_SUBMITTED]: 'Bài nộp mới',
  [NotificationType.SUBMISSION_RESUBMITTED]: 'Bài nộp lại',
  [NotificationType.SUBMISSION_GRADED]: 'Bài đã chấm điểm',
  [NotificationType.SUBMISSION_RETURNED]: 'Bài bị trả lại',
  // Classes
  [NotificationType.CLASS_ENROLLED]: 'Đã thêm vào lớp',
  [NotificationType.CLASS_REMOVED]: 'Đã rời khỏi lớp',
  [NotificationType.CLASS_COMPLETED]: 'Lớp học hoàn thành',
  // Schedule
  [NotificationType.SCHEDULE_CREATED]: 'Lịch học mới',
  [NotificationType.SCHEDULE_UPDATED]: 'Cập nhật lịch học',
  [NotificationType.SCHEDULE_CANCELLED]: 'Huỷ lịch học',
  [NotificationType.SCHEDULE_REMINDER]: 'Nhắc lịch học',
  // Attendance
  [NotificationType.ATTENDANCE_RECORDED]: 'Điểm danh thành công',
  [NotificationType.ATTENDANCE_ABSENT]: 'Vắng mặt',
  // Practice milestones
  [NotificationType.PRACTICE_LESSON_MASTERED]: 'Hoàn thành bài luyện tập',
  [NotificationType.PRACTICE_STREAK]: 'Chuỗi luyện tập',
  // System
  [NotificationType.SYSTEM_ANNOUNCEMENT]: 'Thông báo hệ thống',
  [NotificationType.PROFILE_UPDATED]: 'Cập nhật hồ sơ',
};

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION CATEGORY GROUPS (for future filtering UI)
   ═══════════════════════════════════════════════════════════ */

export const NOTIFICATION_CATEGORIES = {
  ASSIGNMENT: [
    NotificationType.ASSIGNMENT_PUBLISHED,
    NotificationType.ASSIGNMENT_DEADLINE,
    NotificationType.ASSIGNMENT_DELETED,
  ],
  SUBMISSION: [
    NotificationType.SUBMISSION_SUBMITTED,
    NotificationType.SUBMISSION_RESUBMITTED,
    NotificationType.SUBMISSION_GRADED,
    NotificationType.SUBMISSION_RETURNED,
  ],
  CLASS: [
    NotificationType.CLASS_ENROLLED,
    NotificationType.CLASS_REMOVED,
    NotificationType.CLASS_COMPLETED,
  ],
  SCHEDULE: [
    NotificationType.SCHEDULE_CREATED,
    NotificationType.SCHEDULE_UPDATED,
    NotificationType.SCHEDULE_CANCELLED,
    NotificationType.SCHEDULE_REMINDER,
  ],
  ATTENDANCE: [
    NotificationType.ATTENDANCE_RECORDED,
    NotificationType.ATTENDANCE_ABSENT,
  ],
  PRACTICE: [
    NotificationType.PRACTICE_LESSON_MASTERED,
    NotificationType.PRACTICE_STREAK,
  ],
  SYSTEM: [
    NotificationType.SYSTEM_ANNOUNCEMENT,
    NotificationType.PROFILE_UPDATED,
  ],
} as const;

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION DEFAULTS
   ═══════════════════════════════════════════════════════════ */

/** Max notifications to fetch in dropdown */
export const NOTIFICATION_FETCH_LIMIT = 20;

/** Max badge count display (shows 99+ after this) */
export const NOTIFICATION_MAX_BADGE = 99;
