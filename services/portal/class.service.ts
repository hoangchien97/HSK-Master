'use server';

import { prisma } from '@/lib/prisma';
import type { IClass, ICreateClassDTO, IUpdateClassDTO, IGetClassResponse } from '@/interfaces/portal';
import { CLASS_STATUS } from '@/constants/portal/roles';
import type { Prisma } from '@prisma/client';

/* ───────── Fetch classes with filtering & pagination ───────── */

export async function getClasses(
  teacherId: string,
  params: { search?: string; status?: string; page?: number; pageSize?: number } = {}
): Promise<IGetClassResponse> {
  const { search = '', status = '', page = 1, pageSize = 10 } = params;

  const where: Prisma.PortalClassWhereInput = {
    teacherId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { className: { contains: search, mode: 'insensitive' as const } },
        { classCode: { contains: search, mode: 'insensitive' as const } },
        { level: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.portalClass.findMany({
      where,
      include: {
        teacher: { select: { id: true, fullName: true, email: true, image: true } },
        _count: { select: { enrollments: true, schedules: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.portalClass.count({ where }),
  ]);

  return { items: items as unknown as IClass[], total };
}

/* ───────── Create class ───────── */

export async function createClass(
  teacherId: string,
  data: ICreateClassDTO
): Promise<IClass> {
  // Check if class code already exists
  const existing = await prisma.portalClass.findUnique({
    where: { classCode: data.classCode },
  });
  if (existing) {
    throw new Error('Mã lớp đã tồn tại');
  }

  const newClass = await prisma.portalClass.create({
    data: {
      className: data.className,
      classCode: data.classCode,
      description: data.description || null,
      level: data.level || null,
      maxStudents: data.maxStudents || 20,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      teacherId,
      status: CLASS_STATUS.ACTIVE,
    },
    include: {
      teacher: { select: { id: true, fullName: true, email: true, image: true } },
      _count: { select: { enrollments: true, schedules: true } },
    },
  });

  return newClass as unknown as IClass;
}

/* ───────── Update class ───────── */

export async function updateClass(
  classId: string,
  teacherId: string,
  data: IUpdateClassDTO
): Promise<IClass> {
  const existing = await prisma.portalClass.findUnique({ where: { id: classId } });
  if (!existing) throw new Error('Không tìm thấy lớp học');
  if (existing.teacherId !== teacherId) throw new Error('Bạn không có quyền chỉnh sửa lớp này');

  const updated = await prisma.portalClass.update({
    where: { id: classId },
    data: {
      ...(data.className && { className: data.className }),
      ...(data.classCode && { classCode: data.classCode }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.level !== undefined && { level: data.level || null }),
      ...(data.maxStudents && { maxStudents: data.maxStudents }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.status && { status: data.status }),
    },
    include: {
      teacher: { select: { id: true, fullName: true, email: true, image: true } },
      _count: { select: { enrollments: true, schedules: true } },
    },
  });

  return updated as unknown as IClass;
}

/* ───────── Delete class (soft delete) ───────── */

export async function deleteClass(classId: string, teacherId: string): Promise<void> {
  const existing = await prisma.portalClass.findUnique({ where: { id: classId } });
  if (!existing) throw new Error('Không tìm thấy lớp học');
  if (existing.teacherId !== teacherId) throw new Error('Bạn không có quyền xóa lớp này');

  await prisma.portalClass.update({
    where: { id: classId },
    data: { status: 'CANCELLED' },
  });
}
