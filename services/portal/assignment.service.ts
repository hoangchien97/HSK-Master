'use server';

import { prisma } from '@/lib/prisma';
import { ASSIGNMENT_STATUS } from '@/constants/portal/roles';
import type { Prisma } from '@prisma/client';
import { generateUniqueSlug } from '@/utils/slug';

/* ───────── Types ───────── */

interface AssignmentClassInfo {
  id: string;
  className: string;
  classCode: string;
}

interface AssignmentItem {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  dueDate?: Date | null;
  maxScore: number;
  attachments: string[];
  tags: string[];
  externalLink?: string | null;
  status: string;
  publishedAt?: Date | null;
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
  dueDate?: string;
  maxScore?: number;
  status?: string;
  attachments?: string[];
  tags?: string[];
  externalLink?: string;
}

type UpdateAssignmentDTO = Partial<CreateAssignmentDTO>

/* ───────── Fetch teacher assignments with filtering & pagination ───────── */

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

/* ───────── Fetch student assignments (only PUBLISHED) ───────── */

export async function getStudentAssignments(
  studentId: string,
  params: { search?: string; classId?: string; status?: string; page?: number; pageSize?: number } = {}
): Promise<GetAssignmentsResult> {
  const { search = '', classId = '', status = '', page = 1, pageSize = 10 } = params;

  // Get classes where student is enrolled
  const enrollments = await prisma.portalClassEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const enrolledClassIds = enrollments.map((e) => e.classId);

  if (enrolledClassIds.length === 0) {
    return { items: [], total: 0, classes: [] };
  }

  const where: Prisma.PortalAssignmentWhereInput = {
    classId: { in: classId ? [classId] : enrolledClassIds },
    status: ASSIGNMENT_STATUS.PUBLISHED, // Students only see PUBLISHED
    ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
  };

  // Optional: filter by submission status
  if (status === 'SUBMITTED') {
    where.submissions = { some: { studentId } };
  } else if (status === 'NOT_SUBMITTED') {
    where.submissions = { none: { studentId } };
  } else if (status === 'GRADED') {
    where.submissions = { some: { studentId, status: 'GRADED' } };
  }

  const [items, total, classes] = await Promise.all([
    prisma.portalAssignment.findMany({
      where,
      include: {
        class: { select: { id: true, className: true, classCode: true } },
        submissions: {
          where: { studentId },
          include: { student: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.portalAssignment.count({ where }),
    prisma.portalClass.findMany({
      where: { id: { in: enrolledClassIds }, status: 'ACTIVE' },
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

  const isPublished = data.status === ASSIGNMENT_STATUS.PUBLISHED;

  // Auto-generate slug from title
  const slug = await generateUniqueSlug(
    data.title,
    async (s) => !!(await prisma.portalAssignment.findUnique({ where: { slug: s } })),
  );

  const created = await prisma.portalAssignment.create({
    data: {
      title: data.title,
      slug,
      description: data.description || null,
      classId: data.classId,
      teacherId,
      assignmentType: 'HOMEWORK',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      maxScore: data.maxScore || 100,
      attachments: data.attachments || [],
      tags: data.tags || [],
      externalLink: data.externalLink || null,
      status: data.status || ASSIGNMENT_STATUS.DRAFT,
      publishedAt: isPublished ? new Date() : null,
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

  // Detect publish transition: was DRAFT → now PUBLISHED
  const isPublishTransition =
    existing.status === ASSIGNMENT_STATUS.DRAFT &&
    data.status === ASSIGNMENT_STATUS.PUBLISHED;

  // Regenerate slug if title changed
  let slugUpdate: { slug: string } | Record<string, never> = {};
  if (data.title && data.title !== existing.title) {
    const newSlug = await generateUniqueSlug(
      data.title,
      async (s) => {
        const found = await prisma.portalAssignment.findUnique({ where: { slug: s } });
        return !!found && found.id !== assignmentId;
      },
    );
    slugUpdate = { slug: newSlug };
  }

  const updated = await prisma.portalAssignment.update({
    where: { id: assignmentId },
    data: {
      ...(data.title && { title: data.title }),
      ...slugUpdate,
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.classId && { classId: data.classId }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.maxScore !== undefined && { maxScore: data.maxScore }),
      ...(data.attachments !== undefined && { attachments: data.attachments }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.externalLink !== undefined && { externalLink: data.externalLink || null }),
      ...(data.status && { status: data.status }),
      ...(isPublishTransition && { publishedAt: new Date() }),
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
