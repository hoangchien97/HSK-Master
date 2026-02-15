'use server';

/**
 * Submission Server Actions (V1 spec)
 * Statuses: NOT_SUBMITTED → SUBMITTED → GRADED / RETURNED → RESUBMITTED → GRADED
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createNotification } from '@/services/portal/notification.service';
import { SUBMISSION_STATUS } from '@/constants/portal/roles';

/**
 * Submit or re-submit an assignment
 * New submission → SUBMITTED + SUBMISSION_SUBMITTED notification
 * Existing submission → RESUBMITTED + SUBMISSION_RESUBMITTED notification
 */
export async function submitAssignmentAction(
  data: {
    assignmentId: string;
    content?: string;
    attachments?: string[];
  }
): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission?: any;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const { assignmentId, content, attachments } = data;

    if (!assignmentId) {
      return { success: false, error: 'Thiếu thông tin bài tập' };
    }

    // Verify assignment exists, is PUBLISHED, and student is enrolled
    const assignment = await prisma.portalAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          include: {
            enrollments: {
              where: { studentId: session.user.id },
            },
          },
        },
      },
    });

    if (!assignment) {
      return { success: false, error: 'Bài tập không tồn tại' };
    }

    if (assignment.status !== 'PUBLISHED') {
      return { success: false, error: 'Bài tập chưa được công bố' };
    }

    if (assignment.class.enrollments.length === 0) {
      return { success: false, error: 'Bạn không được ghi danh trong lớp này' };
    }

    // Check for existing submission
    const existing = await prisma.portalAssignmentSubmission.findFirst({
      where: { assignmentId, studentId: session.user.id },
    });

    let submission;
    let notificationType: string;
    let notificationTitle: string;

    if (existing) {
      // Re-submit → status = RESUBMITTED
      submission = await prisma.portalAssignmentSubmission.update({
        where: { id: existing.id },
        data: {
          content: content || null,
          attachments: attachments || [],
          submittedAt: new Date(),
          status: SUBMISSION_STATUS.RESUBMITTED,
          // Reset score & feedback on resubmit
          score: null,
          feedback: null,
        },
        include: {
          student: { select: { id: true, name: true, email: true, image: true } },
        },
      });
      notificationType = 'SUBMISSION_RESUBMITTED';
      notificationTitle = 'Bài nộp lại';
    } else {
      // First submit → status = SUBMITTED
      submission = await prisma.portalAssignmentSubmission.create({
        data: {
          assignmentId,
          studentId: session.user.id,
          content: content || null,
          attachments: attachments || [],
          submittedAt: new Date(),
          status: SUBMISSION_STATUS.SUBMITTED,
        },
        include: {
          student: { select: { id: true, name: true, email: true, image: true } },
        },
      });
      notificationType = 'SUBMISSION_SUBMITTED';
      notificationTitle = 'Bài nộp mới';
    }

    revalidatePath('/portal/student/assignments');

    // Notify the teacher
    try {
      const studentName = submission.student?.name || session.user.email || 'Học sinh';
      const action = existing ? 'nộp lại' : 'nộp';
      await createNotification({
        userId: assignment.teacherId,
        type: notificationType,
        title: notificationTitle,
        message: `${studentName} vừa ${action} bài "${assignment.title}"`,
        link: `/portal/teacher/assignments/${assignment.id}`,
      });
    } catch (notifyError) {
      console.error('Error sending submission notification:', notifyError);
    }

    return { success: true, submission };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nộp bài thất bại',
    };
  }
}

/**
 * Grade a submission (teacher only)
 * action = 'GRADED' | 'RETURNED'
 * GRADED: final grade with score + feedback
 * RETURNED: return for revision with feedback (no score required)
 */
export async function gradeSubmissionAction(
  submissionId: string,
  data: {
    score?: number;
    feedback?: string;
    action?: 'GRADED' | 'RETURNED';
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const submission = await prisma.portalAssignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      return { success: false, error: 'Không tìm thấy bài nộp' };
    }

    if (submission.assignment.teacherId !== session.user.id) {
      return { success: false, error: 'Bạn không có quyền chấm bài này' };
    }

    const gradeAction = data.action || 'GRADED';

    if (gradeAction === 'GRADED') {
      // Must have score for GRADED
      if (data.score === undefined || data.score === null) {
        return { success: false, error: 'Vui lòng nhập điểm' };
      }

      await prisma.portalAssignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score: data.score,
          feedback: data.feedback || null,
          status: SUBMISSION_STATUS.GRADED,
        },
      });

      // Notify student — GRADED
      try {
        await createNotification({
          userId: submission.studentId,
          type: 'SUBMISSION_GRADED',
          title: 'Bài tập đã được chấm điểm',
          message: `Bạn đạt ${data.score}/${submission.assignment.maxScore} điểm cho bài "${submission.assignment.title}"`,
          link: `/portal/student/assignments/${submission.assignment.id}`,
        });
      } catch (notifyError) {
        console.error('Error sending grading notification:', notifyError);
      }
    } else {
      // RETURNED — teacher returns for revision
      await prisma.portalAssignmentSubmission.update({
        where: { id: submissionId },
        data: {
          feedback: data.feedback || null,
          status: SUBMISSION_STATUS.RETURNED,
        },
      });

      // Notify student — RETURNED
      try {
        await createNotification({
          userId: submission.studentId,
          type: 'SUBMISSION_RETURNED',
          title: 'Bài tập được trả lại',
          message: `Giáo viên đã trả lại bài "${submission.assignment.title}" để bạn sửa lại`,
          link: `/portal/student/assignments/${submission.assignment.id}`,
        });
      } catch (notifyError) {
        console.error('Error sending return notification:', notifyError);
      }
    }

    revalidatePath('/portal/teacher/assignments');
    revalidatePath('/portal/student/assignments');
    return { success: true };
  } catch (error) {
    console.error('Error grading submission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chấm bài thất bại',
    };
  }
}
