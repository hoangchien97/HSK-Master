import { Suspense } from "react";
import { AnimatedSection } from "@/components/landing/shared/AnimatedSection";
import { CoursesContainer } from "./CoursesClient";
import { getFilteredCoursesWithCount, getCategories } from "@/services/course.service";
import { OG_IMAGE } from "@/constants/brand";
import { getPageMetadata } from "@/services/metadata.service";
import type { Metadata } from "next";

export const revalidate = 600;

const ITEMS_PER_PAGE = 6;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/courses");
  return metadata || {
    title: "Danh sách khóa học tiếng Trung | HSK 1–6",
    description:
      "Chinh phục HSK từ 1 đến 6 với lộ trình hợp lý, tập trung vào giao tiếp và kỹ năng làm bài thi.",
    openGraph: {
      title: "Khóa học tiếng Trung | Ruby HSK",
      description: "Chinh phục HSK từ 1 đến 6 với lộ trình hợp lý, tập trung vào giao tiếp và kỹ năng làm bài thi.",
      url: "/courses",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: "Khóa học tiếng Trung | Ruby HSK",
      description: "Chinh phục HSK từ 1 đến 6 với lộ trình hợp lý, tập trung vào giao tiếp và kỹ năng làm bài thi.",
      images: [OG_IMAGE],
    },
  };
}

type HskGroup = 'beginner' | 'intermediate' | 'advanced';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; hskLevel?: string; search?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);

  const hskLevelGroups = params.hskLevel
    ? (params.hskLevel.split(',').filter(Boolean) as HskGroup[])
    : undefined;
  const categoryIds = params.category
    ? params.category.split(',').filter(Boolean)
    : undefined;

  const filters = {
    categoryIds,
    hskLevelGroups,
    search: params.search,
    sortBy: (params.sort as 'featured' | 'newest') || 'featured',
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  };

  const [{ items: courses, total: totalCount }, categories] = await Promise.all([
    getFilteredCoursesWithCount(filters),
    getCategories(),
  ]);

  return (
    <main className="flex-1">

      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <AnimatedSection variant="fadeInUp">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">
              Danh sách khóa học Tiếng Trung
            </h1>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
              Chinh phục HSK từ 1 đến 6 với lộ trình rõ ràng, tập trung vào giao tiếp và kỹ năng làm bài thi.
            </p>
          </div>
        </AnimatedSection>

        {/* Courses Container with Filters */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        }>
          <CoursesContainer
            initialCourses={courses}
            categories={categories}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </Suspense>
      </div>
    </main>
  );
}
