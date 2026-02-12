'use server';

/**
 * Student Server Actions
 * Server-side actions for student management
 */

import {
  getStudents as getStudentsService,
  getClassesForFilter as getClassesForFilterService,
} from '@/services/portal/student.service';
import type { IGetStudentResponse } from '@/interfaces/portal';
import { auth } from '@/auth';

/**
 * Fetch students with filtering & pagination
 */
export async function fetchStudents(
  params: { search?: string; level?: string; classId?: string; page?: number; pageSize?: number } = {}
): Promise<{
  success: boolean;
  data?: IGetStudentResponse;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const data = await getStudentsService(session.user.id, params);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Không thể tải danh sách học viên' };
  }
}

/**
 * Fetch classes for filter dropdown
 */
export async function fetchClassesForFilter(): Promise<{
  success: boolean;
  classes?: { id: string; className: string; classCode: string }[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const classes = await getClassesForFilterService(session.user.id);
    return { success: true, classes };
  } catch (error) {
    console.error('Error fetching classes for filter:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Không thể tải danh sách lớp' };
  }
}
