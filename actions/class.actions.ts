'use server';

/**
 * Class Server Actions
 * Server-side actions for class management
 */

import { revalidatePath } from 'next/cache';
import {
  getClasses as getClassesService,
  getStudentClasses as getStudentClassesService,
  createClass as createClassService,
  updateClass as updateClassService,
  deleteClass as deleteClassService,
} from '@/services/portal/class.service';
import { createBulkNotifications } from '@/services/portal/notification.service';
import { prisma } from '@/lib/prisma';
import type { IClass, ICreateClassDTO, IUpdateClassDTO, IGetClassResponse } from '@/interfaces/portal';
import { auth } from '@/auth';
import { USER_ROLE } from '@/constants/portal/roles';

/**
 * Fetch classes with filtering & pagination (role-aware)
 */
export async function fetchClasses(
  params: { search?: string; status?: string; page?: number; pageSize?: number } = {}
): Promise<{
  success: boolean;
  data?: IGetClassResponse;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    // Students get their enrolled classes
    if (session.user.role === USER_ROLE.STUDENT) {
      const data = await getStudentClassesService(session.user.id, params);
      return { success: true, data };
    }

    // Teachers/admins get their own classes
    const data = await getClassesService(session.user.id, params);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Không thể tải danh sách lớp' };
  }
}

/**
 * Fetch enrolled classes for the current student
 */
export async function fetchStudentClasses(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<{
  success: boolean;
  data?: IGetClassResponse;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const data = await getStudentClassesService(session.user.id, params);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching student classes:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Không thể tải danh sách lớp' };
  }
}

/**
 * Create a new class
 */
export async function createClassAction(
  data: ICreateClassDTO
): Promise<{
  success: boolean;
  classData?: IClass;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const classData = await createClassService(session.user.id, data);

    // Notify newly added students
    if (data.studentIds && data.studentIds.length > 0) {
      try {
        await createBulkNotifications(data.studentIds, {
          type: 'CLASS_ENROLLED',
          title: 'Bạn được thêm vào lớp học',
          message: `Bạn đã được thêm vào lớp "${data.className}"`,
          link: `/portal/student/classes`,
        });
      } catch (e) { console.error('Enrollment notification error:', e); }
    }

    revalidatePath('/portal/teacher/classes');
    return { success: true, classData };
  } catch (error) {
    console.error('Error creating class:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Tạo lớp thất bại' };
  }
}

/**
 * Update class
 */
export async function updateClassAction(
  classId: string,
  data: IUpdateClassDTO
): Promise<{
  success: boolean;
  classData?: IClass;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    // Get current enrolled students before update (to detect new additions)
    const currentEnrollments = await prisma.portalClassEnrollment.findMany({
      where: { classId, status: 'ENROLLED' },
      select: { studentId: true },
    });
    const currentStudentIds = new Set(currentEnrollments.map((e) => e.studentId));

    const classData = await updateClassService(classId, session.user.id, data);

    // Notify newly added students
    if (data.studentIds) {
      const newStudentIds = data.studentIds.filter((id) => !currentStudentIds.has(id));
      if (newStudentIds.length > 0) {
        try {
          const className = data.className || classData?.className || 'lớp học';
          await createBulkNotifications(newStudentIds, {
            type: 'CLASS_ENROLLED',
            title: 'Bạn được thêm vào lớp học',
            message: `Bạn đã được thêm vào lớp "${className}"`,
            link: `/portal/student/classes`,
          });
        } catch (e) { console.error('Enrollment notification error:', e); }
      }
    }

    revalidatePath('/portal/teacher/classes');
    return { success: true, classData };
  } catch (error) {
    console.error('Error updating class:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Cập nhật lớp thất bại' };
  }
}

/**
 * Delete class (soft delete)
 */
export async function deleteClassAction(
  classId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await deleteClassService(classId, session.user.id);
    revalidatePath('/portal/teacher/classes');
    return { success: true };
  } catch (error) {
    console.error('Error deleting class:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Xóa lớp thất bại' };
  }
}
