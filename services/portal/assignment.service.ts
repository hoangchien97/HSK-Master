'use server';

import { prisma } from '@/lib/prisma';
import { ASSIGNMENT_STATUS } from '@/constants/portal/roles';
import type { Prisma } from '@prisma/client';

/* ───────── Types ───────── */

interface AssignmentClassInfo {
  id: string;
  className: string;
  classCode: string;
}

interface AssignmentItem {
  id: string;
  title: string;
  description?: string | null;
  assignmentType: string;
  dueDate?: Date | null;
  maxScore: number;
  attachments: string[];
  status: string;
  class: AssignmentClassInfo;
  submissions: { id: string; student: { id: string; name: string }; status: string; score?: number | null }[];
  createdAt: Date;
}

interface GetAssignmentsResult {
  items: AssignmentItem[];
  total: number;
  classes: AssignmentClassInfo[];
}

interface CreateAssignmentDTO {
  classId: string;
  title: string;
  description?: string;
  assignmentType?: string;
  dueDate?: string;
  maxScore?: number;
  status?: string;
  attachments?: string[];
}

type UpdateAssignmentDTO = Partial<CreateAssignmentDTO>

/* ───────── Fetch assignments with filtering & pagination ───────── */

export async function getAssignments(
  teacherId: string,
  params: { search?: string; classId?: string; status?: string; page?: number; pageSize?: number } = {}
): Promise<GetAssignmentsResult> {
  const { search = '', classId = '', status = '', page = 1, pageSize = 10 } = params;

  const where: Prisma.PortalAssignmentWhereInput = {
    teacherId,
    ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
    ...(classId && { classId }),
    ...(status && { status }),
  };

  const [items, total, classes] = await Promise.all([
    prisma.portalAssignment.findMany({
      where,
      include: {
        class: { select: { id: true, className: true, classCode: true } },
        submissions: {
          include: { student: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.portalAssignment.count({ where }),
    prisma.portalClass.findMany({
      where: { teacherId, status: 'ACTIVE' },
      select: { id: true, className: true, classCode: true },
      orderBy: { className: 'asc' },
    }),
  ]);

  return {
    items: items as unknown as AssignmentItem[],
    total,
    classes,
  };
}

/* ───────── Create assignment ───────── */

export async function createAssignment(
  teacherId: string,
  data: CreateAssignmentDTO
): Promise<AssignmentItem> {
  // Verify the class belongs to this teacher
  const classItem = await prisma.portalClass.findFirst({
    where: { id: data.classId, teacherId },
  });
  if (!classItem) throw new Error('Lớp học không hợp lệ');

  const created = await prisma.portalAssignment.create({
    data: {
      title: data.title,
      description: data.description || null,
      classId: data.classId,
      teacherId,
      assignmentType: data.assignmentType || 'HOMEWORK',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      maxScore: data.maxScore || 100,
      attachments: data.attachments || [],
      status: data.status || ASSIGNMENT_STATUS.ACTIVE,
    },
    include: {
      class: { select: { id: true, className: true, classCode: true } },
      submissions: {
        include: { student: { select: { id: true, name: true } } },
      },
    },
  });

  return created as unknown as AssignmentItem;
}

/* ───────── Update assignment ───────── */

export async function updateAssignment(
  assignmentId: string,
  teacherId: string,
  data: UpdateAssignmentDTO
): Promise<AssignmentItem> {
  const existing = await prisma.portalAssignment.findUnique({ where: { id: assignmentId } });
  if (!existing) throw new Error('Không tìm thấy bài tập');
  if (existing.teacherId !== teacherId) throw new Error('Bạn không có quyền chỉnh sửa bài tập này');

  const updated = await prisma.portalAssignment.update({
    where: { id: assignmentId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.classId && { classId: data.classId }),
      ...(data.assignmentType && { assignmentType: data.assignmentType }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.maxScore !== undefined && { maxScore: data.maxScore }),
      ...(data.attachments !== undefined && { attachments: data.attachments }),
      ...(data.status && { status: data.status }),
    },
    include: {
      class: { select: { id: true, className: true, classCode: true } },
      submissions: {
        include: { student: { select: { id: true, name: true } } },
      },
    },
  });

  return updated as unknown as AssignmentItem;
}

/* ───────── Delete assignment ───────── */

export async function deleteAssignment(assignmentId: string, teacherId: string): Promise<void> {
  const existing = await prisma.portalAssignment.findUnique({ where: { id: assignmentId } });
  if (!existing) throw new Error('Không tìm thấy bài tập');
  if (existing.teacherId !== teacherId) throw new Error('Bạn không có quyền xóa bài tập này');

  await prisma.portalAssignment.delete({ where: { id: assignmentId } });
}
