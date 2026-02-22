'use server';

/**
 * Assignment Server Actions
 * Server-side actions for assignment management (V1 spec)
 */

import { revalidatePath } from 'next/cache';
import {
  getAssignments as getAssignmentsService,
  getStudentAssignments as getStudentAssignmentsService,
  createAssignment as createAssignmentService,
  updateAssignment as updateAssignmentService,
  deleteAssignment as deleteAssignmentService,
} from '@/services/portal/assignment.service';
import { createBulkNotifications } from '@/services/portal/notification.service';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { ASSIGNMENT_STATUS } from '@/constants/portal/roles';

/**
 * Fetch assignments — role-aware (teacher sees all, student sees PUBLISHED only)
 */
export async function fetchAssignments(
  params: { search?: string; classId?: string; status?: string; page?: number; pageSize?: number } = {}
): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: { items: any[]; total: number; classes: any[] };
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const role = session.user.role?.toUpperCase();

    let data;
    if (role === 'STUDENT') {
      data = await getStudentAssignmentsService(session.user.id, params);
    } else {
      data = await getAssignmentsService(session.user.id, params);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Không thể tải danh sách bài tập' };
  }
}

/**
 * Create a new assignment
 * If status = PUBLISHED → set publishedAt + notify students
 * If status = DRAFT → no notification
 */
export async function createAssignmentAction(
  data: {
    classId: string;
    title: string;
    description?: string;
    dueDate?: string;
    maxScore?: number;
    status?: string;
    attachments?: string[];
    tags?: string[];
    externalLink?: string;
  }
): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignment?: any;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const assignment = await createAssignmentService(session.user.id, data);

    // Only notify students when PUBLISHED
    if (data.status === ASSIGNMENT_STATUS.PUBLISHED) {
      try {
        const enrollments = await prisma.portalClassEnrollment.findMany({
          where: { classId: data.classId },
          select: { studentId: true },
        });
        const studentIds = enrollments.map((e) => e.studentId);
        if (studentIds.length > 0) {
          await createBulkNotifications(studentIds, {
            type: 'ASSIGNMENT_PUBLISHED',
            title: 'Bài tập mới',
            message: `Giáo viên vừa giao bài tập "${assignment.title}"`,
            link: `/portal/student/assignments/${assignment.slug || assignment.id}`,
          });
        }
      } catch (notifyError) {
        console.error('Error sending assignment notifications:', notifyError);
      }
    }

    revalidatePath('/portal/teacher/assignments');
    return { success: true, assignment };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Tạo bài tập thất bại' };
  }
}

/**
 * Update assignment
 * If transition DRAFT → PUBLISHED → notify students
 */
export async function updateAssignmentAction(
  assignmentId: string,
  data: {
    classId?: string;
    title?: string;
    description?: string;
    dueDate?: string;
    maxScore?: number;
    status?: string;
    attachments?: string[];
    tags?: string[];
    externalLink?: string;
  }
): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignment?: any;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    // Check if this is a DRAFT → PUBLISHED transition
    const existing = await prisma.portalAssignment.findUnique({
      where: { id: assignmentId },
      select: { status: true, classId: true },
    });
    const isPublishTransition =
      existing?.status === ASSIGNMENT_STATUS.DRAFT &&
      data.status === ASSIGNMENT_STATUS.PUBLISHED;

    const assignment = await updateAssignmentService(assignmentId, session.user.id, data);

    // Notify students on publish
    if (isPublishTransition && existing) {
      try {
        const enrollments = await prisma.portalClassEnrollment.findMany({
          where: { classId: existing.classId },
          select: { studentId: true },
        });
        const studentIds = enrollments.map((e) => e.studentId);
        if (studentIds.length > 0) {
          await createBulkNotifications(studentIds, {
            type: 'ASSIGNMENT_PUBLISHED',
            title: 'Bài tập mới',
            message: `Giáo viên vừa giao bài tập "${assignment.title}"`,
            link: `/portal/student/assignments/${assignment.slug || assignment.id}`,
          });
        }
      } catch (notifyError) {
        console.error('Error sending publish notifications:', notifyError);
      }
    }

    revalidatePath('/portal/teacher/assignments');
    return { success: true, assignment };
  } catch (error) {
    console.error('Error updating assignment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Cập nhật bài tập thất bại' };
  }
}

/**
 * Delete assignment
 */
export async function deleteAssignmentAction(
  assignmentId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await deleteAssignmentService(assignmentId, session.user.id);
    revalidatePath('/portal/teacher/assignments');
    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Xóa bài tập thất bại' };
  }
}
