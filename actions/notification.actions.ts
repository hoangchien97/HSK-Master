'use server';

/**
 * Notification Server Actions
 */

import { auth } from '@/auth';
import {
  getNotifications as getNotificationsService,
  markNotificationAsRead as markReadService,
  markAllNotificationsAsRead as markAllReadService,
} from '@/services/portal/notification.service';

/**
 * Fetch current user's notifications
 */
export async function fetchNotifications(
  params: { limit?: number; unreadOnly?: boolean } = {}
): Promise<{
  success: boolean;
  data?: { items: unknown[]; unreadCount: number };
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const data = await getNotificationsService(session.user.id, params);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Không thể tải thông báo' };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationReadAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await markReadService(notificationId, session.user.id);
    return { success: true };
  } catch (error) {
    console.error('Error marking notification:', error);
    return { success: false, error: 'Có lỗi xảy ra' };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await markAllReadService(session.user.id);
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications:', error);
    return { success: false, error: 'Có lỗi xảy ra' };
  }
}
