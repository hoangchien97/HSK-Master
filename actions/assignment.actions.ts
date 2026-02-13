'use server';

/**
 * Assignment Server Actions
 * Server-side actions for assignment management
 */

import { revalidatePath } from 'next/cache';
import {
  getAssignments as getAssignmentsService,
  createAssignment as createAssignmentService,
  updateAssignment as updateAssignmentService,
  deleteAssignment as deleteAssignmentService,
} from '@/services/portal/assignment.service';
import { createBulkNotifications } from '@/services/portal/notification.service';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Fetch assignments with filtering & pagination
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

    const data = await getAssignmentsService(session.user.id, params);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Không thể tải danh sách bài tập' };
  }
}

/**
 * Create a new assignment
 */
export async function createAssignmentAction(
  data: {
    classId: string;
    title: string;
    description?: string;
    assignmentType?: string;
    dueDate?: string;
    maxScore?: number;
    status?: string;
    attachments?: string[];
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

    // Notify all enrolled students
    try {
      const enrollments = await prisma.portalClassEnrollment.findMany({
        where: { classId: data.classId },
        select: { studentId: true },
      });
      const studentIds = enrollments.map((e) => e.studentId);
      if (studentIds.length > 0) {
        await createBulkNotifications(studentIds, {
          type: 'ASSIGNMENT_CREATED',
          title: 'Bài tập mới',
          message: `Giáo viên vừa giao bài tập "${assignment.title}"`,
          link: `/portal/student/assignments/${assignment.id}`,
        });
      }
    } catch (notifyError) {
      console.error('Error sending assignment notifications:', notifyError);
      // Don't fail the whole action for a notification error
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
 */
export async function updateAssignmentAction(
  assignmentId: string,
  data: {
    classId?: string;
    title?: string;
    description?: string;
    assignmentType?: string;
    dueDate?: string;
    maxScore?: number;
    status?: string;
    attachments?: string[];
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

    const assignment = await updateAssignmentService(assignmentId, session.user.id, data);
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
