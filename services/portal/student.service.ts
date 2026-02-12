'use server';

import { prisma } from '@/lib/prisma';
import type { IStudent, IGetStudentResponse } from '@/interfaces/portal';
import type { Prisma } from '@prisma/client';

/* ───────── Fetch students with filtering & pagination ───────── */

export async function getStudents(
  teacherId: string,
  params: { search?: string; level?: string; classId?: string; page?: number; pageSize?: number } = {}
): Promise<IGetStudentResponse> {
  const { search = '', level = '', classId = '', page = 1, pageSize = 10 } = params;

  // Find all class IDs belonging to this teacher
  const teacherClassIds = await prisma.portalClass.findMany({
    where: { teacherId },
    select: { id: true },
  });

  const classIds = teacherClassIds.map((c) => c.id);
  if (classIds.length === 0) return { items: [], total: 0 };

  const enrollmentFilter: Prisma.PortalClassEnrollmentWhereInput = {
    classId: classId ? { equals: classId } : { in: classIds },
    ...(level && {
      class: { level: { equals: level, mode: 'insensitive' as const } },
    }),
  };

  const where: Prisma.PortalUserWhereInput = {
    enrollments: { some: enrollmentFilter },
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [students, total] = await Promise.all([
    prisma.portalUser.findMany({
      where,
      include: {
        enrollments: {
          where: { classId: { in: classIds } },
          include: {
            class: { select: { id: true, className: true, classCode: true, level: true } },
          },
        },
      },
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.portalUser.count({ where }),
  ]);

  const items: IStudent[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    fullName: s.fullName,
    email: s.email,
    phoneNumber: s.phoneNumber,
    image: s.image,
    level: s.enrollments[0]?.class?.level ?? null,
    status: s.status,
    classes: s.enrollments.map((e) => e.class),
  }));

  return { items, total };
}

/* ───────── Fetch classes for filter dropdown ───────── */

export async function getClassesForFilter(
  teacherId: string
): Promise<{ id: string; className: string; classCode: string }[]> {
  return prisma.portalClass.findMany({
    where: { teacherId },
    select: { id: true, className: true, classCode: true },
    orderBy: { className: 'asc' },
  });
}
