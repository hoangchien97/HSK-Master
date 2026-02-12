'use server';

/**
 * Class Server Actions
 * Server-side actions for class management
 */

import { revalidatePath } from 'next/cache';
import {
  getClasses as getClassesService,
  createClass as createClassService,
  updateClass as updateClassService,
  deleteClass as deleteClassService,
} from '@/services/portal/class.service';
import type { IClass, ICreateClassDTO, IUpdateClassDTO, IGetClassResponse } from '@/interfaces/portal';
import { auth } from '@/auth';

/**
 * Fetch classes with filtering & pagination
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

    const data = await getClassesService(session.user.id, params);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching classes:', error);
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

    const classData = await updateClassService(classId, session.user.id, data);
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
