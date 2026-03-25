/**
 * Admin Landing Page Config Interfaces
 * Interfaces for all landing page configuration entities
 */

import type { IPaginationParams, IPaginatedResponse } from "./api";

/* ───────── Hero Slide ───────── */
export interface IHeroSlide {
  id: string;
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText?: string | null;
  secondaryCtaHref?: string | null;
  overlayGradient: string;
  order: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateHeroSlideDTO {
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  overlayGradient: string;
  order: number;
  isActive?: boolean;
}

export type IUpdateHeroSlideDTO = Partial<ICreateHeroSlideDTO>;

export interface IGetHeroSlideParams extends IPaginationParams {
  search?: string;
  isActive?: boolean;
}

export type IGetHeroSlideResponse = IPaginatedResponse<IHeroSlide>;

/* ───────── HSK Level ───────── */
export interface IHSKLevel {
  id: string;
  level: number;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  vocabularyCount: string;
  lessonCount: number;
  duration: string;
  targetAudience: string;
  targetIcon: string;
  accentColor: string;
  bgGradient: string;
  href: string;
  order: number;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateHSKLevelDTO {
  level: number;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  vocabularyCount: string;
  lessonCount?: number;
  duration?: string;
  targetAudience: string;
  targetIcon: string;
  accentColor: string;
  bgGradient: string;
  href: string;
  order: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export type IUpdateHSKLevelDTO = Partial<ICreateHSKLevelDTO>;
export type IGetHSKLevelResponse = IPaginatedResponse<IHSKLevel>;

/* ───────── Category ───────── */
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  _count?: { courses: number };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export type IUpdateCategoryDTO = Partial<ICreateCategoryDTO>;
export type IGetCategoryResponse = IPaginatedResponse<ICategory>;

/* ───────── Album ───────── */
export interface IAlbumPhoto {
  id: string;
  albumId: string;
  url: string;
  title?: string | null;
  description?: string | null;
  order: number;
  createdAt: Date | string;
}

export interface IAlbum {
  id: string;
  title: string;
  description?: string | null;
  thumbnail: string;
  photoCount: number;
  order: number;
  isActive: boolean;
  photos?: IAlbumPhoto[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateAlbumDTO {
  title: string;
  description?: string;
  thumbnail: string;
  order: number;
  isActive?: boolean;
}

export type IUpdateAlbumDTO = Partial<ICreateAlbumDTO>;
export type IGetAlbumResponse = IPaginatedResponse<IAlbum>;

/* ───────── Review ───────── */
export interface IReview {
  id: string;
  studentName: string;
  className: string;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateReviewDTO {
  studentName: string;
  className: string;
  content: string;
  rating: number;
  isApproved?: boolean;
}

export type IUpdateReviewDTO = Partial<ICreateReviewDTO>;

export interface IGetReviewParams extends IPaginationParams {
  search?: string;
  isApproved?: boolean;
}

export type IGetReviewResponse = IPaginatedResponse<IReview>;

/* ───────── Feature ───────── */
export interface IFeature {
  id: string;
  iconName: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateFeatureDTO {
  iconName: string;
  title: string;
  description: string;
  order: number;
  isActive?: boolean;
}

export type IUpdateFeatureDTO = Partial<ICreateFeatureDTO>;
export type IGetFeatureResponse = IPaginatedResponse<IFeature>;

/* ───────── CTA Stat ───────── */
export interface ICtaStat {
  id: string;
  value: number;
  suffix?: string | null;
  label: string;
  order: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateCtaStatDTO {
  value: number;
  suffix?: string;
  label: string;
  order: number;
  isActive?: boolean;
}

export type IUpdateCtaStatDTO = Partial<ICreateCtaStatDTO>;
export type IGetCtaStatResponse = IPaginatedResponse<ICtaStat>;

/* ───────── Registration ───────── */
export interface IRegistration {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  note?: string | null;
  courseId?: string | null;
  course?: { id: string; title: string } | null;
  createdAt: Date | string;
}

export type IGetRegistrationResponse = IPaginatedResponse<IRegistration>;

/* ───────── Page Metadata (SEO) ───────── */
export interface IPageMetadata {
  id: string;
  pagePath: string;
  pageName: string;
  title: string;
  description: string;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreatePageMetadataDTO {
  pagePath: string;
  pageName: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  isActive?: boolean;
}

export type IUpdatePageMetadataDTO = Partial<ICreatePageMetadataDTO>;
export type IGetPageMetadataResponse = IPaginatedResponse<IPageMetadata>;

/* ───────── Admin Dashboard ───────── */
export interface IAdminDashboardStats {
  totalCourses: number;
  totalHeroSlides: number;
  totalReviews: number;
  totalRegistrations: number;
  pendingReviews: number;
  totalUsers: number;
  totalAlbums: number;
  totalFeatures: number;
  totalCtaStats: number;
  totalCategories: number;
  totalHSKLevels: number;
}

export interface IRecentActivity {
  id: string;
  action: string;
  target: string;
  time: string;
  type: "registration" | "review" | "course" | "user";
}

/* ───────── Course (Admin) ───────── */
export interface ICourseAdmin {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  instructor?: string | null;
  level?: string | null;
  tag?: string | null;
  badgeText?: string | null;
  badgeColor?: string | null;
  vocabularyCount: number;
  grammarCount: number;
  lessonCount: number;
  durationHours: number;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  enrollmentCount: number;
  categoryId: string;
  hskLevelId?: string | null;
  category?: { id: string; name: string };
  hskLevel?: { id: string; title: string; level: number } | null;
  _count?: { lessons: number; registrations: number };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type IGetCourseAdminResponse = IPaginatedResponse<ICourseAdmin>;
