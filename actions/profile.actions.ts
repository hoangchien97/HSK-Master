'use server';

/**
 * Profile Server Actions
 * Server-side actions for profile management
 */

import { revalidatePath } from 'next/cache';
import { ProfileService } from '@/services/portal/profile.service';
import type { UpdateProfileDTO, PortalUser } from '@/interfaces/portal/profile';
import { auth } from '@/auth';

/**
 * Update user profile
 */
export async function updateProfileAction(
  data: UpdateProfileDTO
): Promise<{
  success: boolean;
  user?: PortalUser;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const result = await ProfileService.updateProfile(session.user.id, data);

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/portal/profile');
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Cập nhật hồ sơ thất bại' };
  }
}
