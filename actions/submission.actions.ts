'use server';

/**
 * Submission Server Actions
 * Server-side actions for student assignment submissions
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Submit or update an assignment submission
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

    // Verify assignment exists and student is enrolled
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

    if (assignment.class.enrollments.length === 0) {
      return { success: false, error: 'Bạn không được ghi danh trong lớp này' };
    }

    // Check for existing submission
    const existing = await prisma.portalAssignmentSubmission.findFirst({
      where: { assignmentId, studentId: session.user.id },
    });

    let submission;

    if (existing) {
      // Update existing
      submission = await prisma.portalAssignmentSubmission.update({
        where: { id: existing.id },
        data: {
          content: content || null,
          attachments: attachments || [],
          submittedAt: new Date(),
        },
        include: {
          student: { select: { id: true, fullName: true, email: true, image: true } },
        },
      });
    } else {
      // Create new
      submission = await prisma.portalAssignmentSubmission.create({
        data: {
          assignmentId,
          studentId: session.user.id,
          content: content || null,
          attachments: attachments || [],
          submittedAt: new Date(),
        },
        include: {
          student: { select: { id: true, fullName: true, email: true, image: true } },
        },
      });
    }

    revalidatePath('/portal/student/assignments');
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
 */
export async function gradeSubmissionAction(
  submissionId: string,
  data: {
    score: number;
    feedback?: string;
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

    await prisma.portalAssignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback || null,
        status: 'GRADED',
      },
    });

    revalidatePath('/portal/teacher/assignments');
    return { success: true };
  } catch (error) {
    console.error('Error grading submission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chấm bài thất bại',
    };
  }
}
