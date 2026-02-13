'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/* ───────── Types ───────── */

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: Date | string;
}

/* ───────── Create a single notification ───────── */

export async function createNotification(data: NotificationData): Promise<void> {
  await prisma.portalNotification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.DbNull,
    },
  });
}

/* ───────── Create notifications for multiple users ───────── */

export async function createBulkNotifications(
  userIds: string[],
  data: Omit<NotificationData, 'userId'>
): Promise<void> {
  if (userIds.length === 0) return;

  await prisma.portalNotification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.DbNull,
    })),
  });
}

/* ───────── Get notifications for a user ───────── */

export async function getNotifications(
  userId: string,
  params: { limit?: number; unreadOnly?: boolean } = {}
): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const { limit = 20, unreadOnly = false } = params;

  const where = {
    userId,
    ...(unreadOnly && { isRead: false }),
  };

  const [items, unreadCount] = await Promise.all([
    prisma.portalNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.portalNotification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    items: items as unknown as NotificationItem[],
    unreadCount,
  };
}

/* ───────── Mark notification as read ───────── */

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.portalNotification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

/* ───────── Mark all notifications as read ───────── */

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.portalNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
