"use server";

/**
 * Admin Server Actions
 * Server-side actions for landing page configuration management
 */

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { USER_ROLE } from "@/constants/portal/roles";
import * as adminService from "@/services/portal/admin.service";
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

/* ───────── Auth Guard ───────── */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    throw new Error("Unauthorized: admin access required");
  }
  return session;
}

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* ═══════════════════════════════════════════
 * HERO SLIDES
 * ═══════════════════════════════════════════ */

export async function fetchHeroSlides(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetHeroSlideResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getHeroSlides(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải danh sách Hero Slides" };
  }
}

export async function createHeroSlideAction(data: ICreateHeroSlideDTO): Promise<ActionResult<IHeroSlide>> {
  try {
    await requireAdmin();
    const result = await adminService.createHeroSlide(data);
    revalidatePath("/portal/admin/hero-slides");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo slide thất bại" };
  }
}

export async function updateHeroSlideAction(id: string, data: IUpdateHeroSlideDTO): Promise<ActionResult<IHeroSlide>> {
  try {
    await requireAdmin();
    const result = await adminService.updateHeroSlide(id, data);
    revalidatePath("/portal/admin/hero-slides");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật slide thất bại" };
  }
}

export async function deleteHeroSlideAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteHeroSlide(id);
    revalidatePath("/portal/admin/hero-slides");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa slide thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * HSK LEVELS
 * ═══════════════════════════════════════════ */

export async function fetchHSKLevels(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetHSKLevelResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getHSKLevels(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải cấp độ HSK" };
  }
}

export async function createHSKLevelAction(data: ICreateHSKLevelDTO): Promise<ActionResult<IHSKLevel>> {
  try {
    await requireAdmin();
    const result = await adminService.createHSKLevel(data);
    revalidatePath("/portal/admin/hsk-levels");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo cấp độ thất bại" };
  }
}

export async function updateHSKLevelAction(id: string, data: IUpdateHSKLevelDTO): Promise<ActionResult<IHSKLevel>> {
  try {
    await requireAdmin();
    const result = await adminService.updateHSKLevel(id, data);
    revalidatePath("/portal/admin/hsk-levels");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật cấp độ thất bại" };
  }
}

export async function deleteHSKLevelAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteHSKLevel(id);
    revalidatePath("/portal/admin/hsk-levels");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa cấp độ thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * CATEGORIES
 * ═══════════════════════════════════════════ */

export async function fetchCategories(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetCategoryResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getCategories(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải danh mục" };
  }
}

export async function createCategoryAction(data: ICreateCategoryDTO): Promise<ActionResult<ICategory>> {
  try {
    await requireAdmin();
    const result = await adminService.createCategory(data);
    revalidatePath("/portal/admin/categories");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo danh mục thất bại" };
  }
}

export async function updateCategoryAction(id: string, data: IUpdateCategoryDTO): Promise<ActionResult<ICategory>> {
  try {
    await requireAdmin();
    const result = await adminService.updateCategory(id, data);
    revalidatePath("/portal/admin/categories");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật danh mục thất bại" };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteCategory(id);
    revalidatePath("/portal/admin/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa danh mục thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * ALBUMS
 * ═══════════════════════════════════════════ */

export async function fetchAlbums(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetAlbumResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getAlbums(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải album" };
  }
}

export async function createAlbumAction(data: ICreateAlbumDTO): Promise<ActionResult<IAlbum>> {
  try {
    await requireAdmin();
    const result = await adminService.createAlbum(data);
    revalidatePath("/portal/admin/albums");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo album thất bại" };
  }
}

export async function updateAlbumAction(id: string, data: IUpdateAlbumDTO): Promise<ActionResult<IAlbum>> {
  try {
    await requireAdmin();
    const result = await adminService.updateAlbum(id, data);
    revalidatePath("/portal/admin/albums");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật album thất bại" };
  }
}

export async function deleteAlbumAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteAlbum(id);
    revalidatePath("/portal/admin/albums");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa album thất bại" };
  }
}

export async function saveAlbumPhotosAction(
  albumId: string,
  photos: { id?: string; url: string; title?: string; description?: string; order: number }[]
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.saveAlbumPhotos(albumId, photos);
    revalidatePath("/portal/admin/albums");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lưu danh sách ảnh thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * REVIEWS
 * ═══════════════════════════════════════════ */

export async function fetchReviews(
  params: { search?: string; isApproved?: boolean; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetReviewResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getReviews(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải đánh giá" };
  }
}

export async function createReviewAction(data: ICreateReviewDTO): Promise<ActionResult<IReview>> {
  try {
    await requireAdmin();
    const result = await adminService.createReview(data);
    revalidatePath("/portal/admin/reviews");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo đánh giá thất bại" };
  }
}

export async function updateReviewAction(id: string, data: IUpdateReviewDTO): Promise<ActionResult<IReview>> {
  try {
    await requireAdmin();
    const result = await adminService.updateReview(id, data);
    revalidatePath("/portal/admin/reviews");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật đánh giá thất bại" };
  }
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteReview(id);
    revalidatePath("/portal/admin/reviews");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa đánh giá thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════ */

export async function fetchFeatures(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetFeatureResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getFeatures(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải tính năng" };
  }
}

export async function createFeatureAction(data: ICreateFeatureDTO): Promise<ActionResult<IFeature>> {
  try {
    await requireAdmin();
    const result = await adminService.createFeature(data);
    revalidatePath("/portal/admin/features");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo tính năng thất bại" };
  }
}

export async function updateFeatureAction(id: string, data: IUpdateFeatureDTO): Promise<ActionResult<IFeature>> {
  try {
    await requireAdmin();
    const result = await adminService.updateFeature(id, data);
    revalidatePath("/portal/admin/features");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật tính năng thất bại" };
  }
}

export async function deleteFeatureAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteFeature(id);
    revalidatePath("/portal/admin/features");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa tính năng thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * CTA STATS
 * ═══════════════════════════════════════════ */

export async function fetchCtaStats(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetCtaStatResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getCtaStats(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải CTA Stats" };
  }
}

export async function createCtaStatAction(data: ICreateCtaStatDTO): Promise<ActionResult<ICtaStat>> {
  try {
    await requireAdmin();
    const result = await adminService.createCtaStat(data);
    revalidatePath("/portal/admin/cta-stats");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo CTA stat thất bại" };
  }
}

export async function updateCtaStatAction(id: string, data: IUpdateCtaStatDTO): Promise<ActionResult<ICtaStat>> {
  try {
    await requireAdmin();
    const result = await adminService.updateCtaStat(id, data);
    revalidatePath("/portal/admin/cta-stats");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật CTA stat thất bại" };
  }
}

export async function deleteCtaStatAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteCtaStat(id);
    revalidatePath("/portal/admin/cta-stats");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa CTA stat thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * REGISTRATIONS
 * ═══════════════════════════════════════════ */

export async function fetchRegistrations(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetRegistrationResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getRegistrations(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải đăng ký" };
  }
}

export async function deleteRegistrationAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deleteRegistration(id);
    revalidatePath("/portal/admin/registrations");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa đăng ký thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * PAGE METADATA (SEO)
 * ═══════════════════════════════════════════ */

export async function fetchPageMetadata(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetPageMetadataResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getPageMetadataList(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải SEO metadata" };
  }
}

export async function createPageMetadataAction(data: ICreatePageMetadataDTO): Promise<ActionResult<IPageMetadata>> {
  try {
    await requireAdmin();
    const result = await adminService.createPageMetadata(data);
    revalidatePath("/portal/admin/seo");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tạo metadata thất bại" };
  }
}

export async function updatePageMetadataAction(id: string, data: IUpdatePageMetadataDTO): Promise<ActionResult<IPageMetadata>> {
  try {
    await requireAdmin();
    const result = await adminService.updatePageMetadata(id, data);
    revalidatePath("/portal/admin/seo");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Cập nhật metadata thất bại" };
  }
}

export async function deletePageMetadataAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await adminService.deletePageMetadata(id);
    revalidatePath("/portal/admin/seo");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Xóa metadata thất bại" };
  }
}

/* ═══════════════════════════════════════════
 * COURSES (Admin view)
 * ═══════════════════════════════════════════ */

export async function fetchCoursesAdmin(
  params: { search?: string; categoryId?: string; isPublished?: boolean; page?: number; pageSize?: number } = {}
): Promise<ActionResult<IGetCourseAdminResponse>> {
  try {
    await requireAdmin();
    const data = await adminService.getCoursesAdmin(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải khóa học" };
  }
}

/* ═══════════════════════════════════════════
 * USERS (Admin management)
 * ═══════════════════════════════════════════ */

export async function fetchUsersAdmin(
  params: { search?: string; role?: string; status?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = await adminService.getUsersAdmin(params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải người dùng" };
  }
}

/* ═══════════════════════════════════════════
 * DASHBOARD
 * ═══════════════════════════════════════════ */

export async function fetchAdminDashboardStats(): Promise<ActionResult<IAdminDashboardStats>> {
  try {
    await requireAdmin();
    const data = await adminService.getAdminDashboardStats();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải thống kê" };
  }
}

export async function fetchRecentActivities(): Promise<ActionResult<IRecentActivity[]>> {
  try {
    await requireAdmin();
    const data = await adminService.getRecentActivities();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi tải hoạt động" };
  }
}
