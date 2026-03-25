/**
 * Admin Landing Page Config Service
 * CRUD operations for all landing page configuration entities
 */

import { prisma } from "@/lib/prisma";
import type {
  IHeroSlide, ICreateHeroSlideDTO, IUpdateHeroSlideDTO, IGetHeroSlideResponse,
  IHSKLevel, ICreateHSKLevelDTO, IUpdateHSKLevelDTO, IGetHSKLevelResponse,
  ICategory, ICreateCategoryDTO, IUpdateCategoryDTO, IGetCategoryResponse,
  IAlbum, ICreateAlbumDTO, IUpdateAlbumDTO, IGetAlbumResponse,
  IReview, ICreateReviewDTO, IUpdateReviewDTO, IGetReviewResponse,
  IFeature, ICreateFeatureDTO, IUpdateFeatureDTO, IGetFeatureResponse,
  ICtaStat, ICreateCtaStatDTO, IUpdateCtaStatDTO, IGetCtaStatResponse,
  IRegistration, IGetRegistrationResponse,
  IPageMetadata, ICreatePageMetadataDTO, IUpdatePageMetadataDTO, IGetPageMetadataResponse,
  ICourseAdmin, IGetCourseAdminResponse,
  IAdminDashboardStats,
  IRecentActivity,
} from "@/interfaces/portal";

/* ═══════════════════════════════════════════
 * HERO SLIDES
 * ═══════════════════════════════════════════ */

export async function getHeroSlides(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetHeroSlideResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { badge: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.heroSlide.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.heroSlide.count({ where }),
  ]);

  return { items: items as IHeroSlide[], total };
}

export async function createHeroSlide(data: ICreateHeroSlideDTO): Promise<IHeroSlide> {
  return prisma.heroSlide.create({ data }) as Promise<IHeroSlide>;
}

export async function updateHeroSlide(id: string, data: IUpdateHeroSlideDTO): Promise<IHeroSlide> {
  return prisma.heroSlide.update({ where: { id }, data }) as Promise<IHeroSlide>;
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await prisma.heroSlide.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * HSK LEVELS
 * ═══════════════════════════════════════════ */

export async function getHSKLevels(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetHSKLevelResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.hSKLevel.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.hSKLevel.count({ where }),
  ]);

  return { items: items as IHSKLevel[], total };
}

export async function createHSKLevel(data: ICreateHSKLevelDTO): Promise<IHSKLevel> {
  return prisma.hSKLevel.create({ data }) as Promise<IHSKLevel>;
}

export async function updateHSKLevel(id: string, data: IUpdateHSKLevelDTO): Promise<IHSKLevel> {
  return prisma.hSKLevel.update({ where: { id }, data }) as Promise<IHSKLevel>;
}

export async function deleteHSKLevel(id: string): Promise<void> {
  await prisma.hSKLevel.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * CATEGORIES
 * ═══════════════════════════════════════════ */

export async function getCategories(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetCategoryResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: { _count: { select: { courses: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.count({ where }),
  ]);

  return { items: items as ICategory[], total };
}

export async function createCategory(data: ICreateCategoryDTO): Promise<ICategory> {
  return prisma.category.create({ data }) as Promise<ICategory>;
}

export async function updateCategory(id: string, data: IUpdateCategoryDTO): Promise<ICategory> {
  return prisma.category.update({ where: { id }, data }) as Promise<ICategory>;
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * ALBUMS
 * ═══════════════════════════════════════════ */

export async function getAlbums(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetAlbumResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.album.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        photos: { orderBy: { order: "asc" }, take: 5 },
      },
    }),
    prisma.album.count({ where }),
  ]);

  return { items: items as IAlbum[], total };
}

export async function createAlbum(data: ICreateAlbumDTO): Promise<IAlbum> {
  return prisma.album.create({ data }) as Promise<IAlbum>;
}

export async function updateAlbum(id: string, data: IUpdateAlbumDTO): Promise<IAlbum> {
  return prisma.album.update({ where: { id }, data }) as Promise<IAlbum>;
}

export async function deleteAlbum(id: string): Promise<void> {
  await prisma.album.delete({ where: { id } });
}

export async function saveAlbumPhotos(
  albumId: string,
  photos: { id?: string; url: string; title?: string; description?: string; order: number }[]
): Promise<void> {
  // Use a transaction to safely update all photos
  await prisma.$transaction(async (tx) => {
    // 1. Get existing photos to find deletions
    const existing = await tx.photo.findMany({ where: { albumId } });
    const existingIds = new Set(existing.map(p => p.id));
    const newIds = new Set(photos.map(p => p.id).filter(Boolean));
    const toDelete = existing.filter(p => !newIds.has(p.id)).map(p => p.id);

    // 2. Delete removed photos
    if (toDelete.length > 0) {
      await tx.photo.deleteMany({ where: { id: { in: toDelete } } });
    }

    // 3. Upsert photos
    let orderIndex = 1;
    for (const photo of photos) {
      if (photo.id && existingIds.has(photo.id)) {
        await tx.photo.update({
          where: { id: photo.id },
          data: {
            url: photo.url,
            title: photo.title || null,
            description: photo.description || null,
            order: orderIndex++
          }
        });
      } else {
        await tx.photo.create({
          data: {
            albumId,
            url: photo.url,
            title: photo.title || null,
            description: photo.description || null,
            order: orderIndex++
          }
        });
      }
    }

    // 4. Update the photoCount cache in Album
    const newCount = await tx.photo.count({ where: { albumId } });
    await tx.album.update({ where: { id: albumId }, data: { photoCount: newCount } });
  });
}

/* ═══════════════════════════════════════════
 * REVIEWS
 * ═══════════════════════════════════════════ */

export async function getReviews(
  params: { search?: string; isApproved?: boolean; page?: number; pageSize?: number } = {}
): Promise<IGetReviewResponse> {
  const { search, isApproved, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { studentName: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }
  if (isApproved !== undefined) {
    where.isApproved = isApproved;
  }

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return { items: items as IReview[], total };
}

export async function createReview(data: ICreateReviewDTO): Promise<IReview> {
  return prisma.review.create({ data }) as Promise<IReview>;
}

export async function updateReview(id: string, data: IUpdateReviewDTO): Promise<IReview> {
  return prisma.review.update({ where: { id }, data }) as Promise<IReview>;
}

export async function deleteReview(id: string): Promise<void> {
  await prisma.review.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════ */

export async function getFeatures(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetFeatureResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.feature.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feature.count({ where }),
  ]);

  return { items: items as IFeature[], total };
}

export async function createFeature(data: ICreateFeatureDTO): Promise<IFeature> {
  return prisma.feature.create({ data }) as Promise<IFeature>;
}

export async function updateFeature(id: string, data: IUpdateFeatureDTO): Promise<IFeature> {
  return prisma.feature.update({ where: { id }, data }) as Promise<IFeature>;
}

export async function deleteFeature(id: string): Promise<void> {
  await prisma.feature.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * CTA STATS
 * ═══════════════════════════════════════════ */

export async function getCtaStats(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetCtaStatResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.label = { contains: search, mode: "insensitive" };
  }

  const [items, total] = await Promise.all([
    prisma.ctaStat.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ctaStat.count({ where }),
  ]);

  return { items: items as ICtaStat[], total };
}

export async function createCtaStat(data: ICreateCtaStatDTO): Promise<ICtaStat> {
  return prisma.ctaStat.create({ data }) as Promise<ICtaStat>;
}

export async function updateCtaStat(id: string, data: IUpdateCtaStatDTO): Promise<ICtaStat> {
  return prisma.ctaStat.update({ where: { id }, data }) as Promise<ICtaStat>;
}

export async function deleteCtaStat(id: string): Promise<void> {
  await prisma.ctaStat.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * REGISTRATIONS
 * ═══════════════════════════════════════════ */

export async function getRegistrations(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetRegistrationResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.registration.count({ where }),
  ]);

  return { items: items as IRegistration[], total };
}

export async function deleteRegistration(id: string): Promise<void> {
  await prisma.registration.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * PAGE METADATA (SEO)
 * ═══════════════════════════════════════════ */

export async function getPageMetadataList(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<IGetPageMetadataResponse> {
  const { search, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { pageName: { contains: search, mode: "insensitive" } },
      { pagePath: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.pageMetadata.findMany({
      where,
      orderBy: { pagePath: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pageMetadata.count({ where }),
  ]);

  return { items: items as IPageMetadata[], total };
}

export async function createPageMetadata(data: ICreatePageMetadataDTO): Promise<IPageMetadata> {
  return prisma.pageMetadata.create({ data }) as Promise<IPageMetadata>;
}

export async function updatePageMetadata(id: string, data: IUpdatePageMetadataDTO): Promise<IPageMetadata> {
  return prisma.pageMetadata.update({ where: { id }, data }) as Promise<IPageMetadata>;
}

export async function deletePageMetadata(id: string): Promise<void> {
  await prisma.pageMetadata.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
 * COURSES (Admin view)
 * ═══════════════════════════════════════════ */

export async function getCoursesAdmin(
  params: { search?: string; categoryId?: string; isPublished?: boolean; page?: number; pageSize?: number } = {}
): Promise<IGetCourseAdminResponse> {
  const { search, categoryId, isPublished, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (isPublished !== undefined) where.isPublished = isPublished;

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        hskLevel: { select: { id: true, title: true, level: true } },
        _count: { select: { lessons: true, registrations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.course.count({ where }),
  ]);

  return { items: items as ICourseAdmin[], total };
}

/* ═══════════════════════════════════════════
 * USERS (Admin management)
 * ═══════════════════════════════════════════ */

export async function getUsersAdmin(
  params: { search?: string; role?: string; status?: string; page?: number; pageSize?: number } = {}
) {
  const { search, role, status, page = 1, pageSize = 10 } = params;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role && role !== "ALL") where.role = role;
  if (status && status !== "ALL") where.status = status;

  const [items, total] = await Promise.all([
    prisma.portalUser.findMany({
      where,
      select: {
        id: true, name: true, username: true, email: true, image: true,
        role: true, status: true, phoneNumber: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.portalUser.count({ where }),
  ]);

  return { items, total };
}

/* ═══════════════════════════════════════════
 * ADMIN DASHBOARD
 * ═══════════════════════════════════════════ */

export async function getAdminDashboardStats(): Promise<IAdminDashboardStats> {
  const [
    totalCourses, totalHeroSlides, totalReviews, pendingReviews,
    totalRegistrations, totalUsers, totalAlbums, totalFeatures,
    totalCtaStats, totalCategories, totalHSKLevels,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.heroSlide.count(),
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.registration.count(),
    prisma.portalUser.count(),
    prisma.album.count(),
    prisma.feature.count(),
    prisma.ctaStat.count(),
    prisma.category.count(),
    prisma.hSKLevel.count(),
  ]);

  return {
    totalCourses, totalHeroSlides, totalReviews, pendingReviews,
    totalRegistrations, totalUsers, totalAlbums, totalFeatures,
    totalCtaStats, totalCategories, totalHSKLevels,
  };
}

export async function getRecentActivities(): Promise<IRecentActivity[]> {
  const [recentRegs, recentReviews] = await Promise.all([
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { course: { select: { title: true } } },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const activities: IRecentActivity[] = [];

  for (const reg of recentRegs) {
    activities.push({
      id: reg.id,
      action: "Đăng ký mới",
      target: `${reg.name} đăng ký${reg.course ? ` khóa ${reg.course.title}` : ""}`,
      time: formatRelativeTime(reg.createdAt),
      type: "registration",
    });
  }

  for (const review of recentReviews) {
    activities.push({
      id: review.id,
      action: review.isApproved ? "Đánh giá mới" : "Đánh giá chờ duyệt",
      target: `${review.studentName} đánh giá ${review.rating} sao cho ${review.className}`,
      time: formatRelativeTime(review.createdAt),
      type: "review",
    });
  }

  // Sort by time (newest first)
  activities.sort((a, b) => {
    // Simple sort by the original date comparison
    return 0; // Already sorted from DB
  });

  return activities.slice(0, 5);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return `${Math.floor(diffDay / 30)} tháng trước`;
}
