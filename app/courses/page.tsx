import { Breadcrumb } from "../components/shared";
import { AnimatedSection } from "../components/shared/AnimatedSection";
import { CoursesContainer } from "./CoursesClient";
import { getFilteredCourses, getCategories } from "../services/course.service";
import { getPageMetadata } from "../services/metadata.service";
import type { Metadata } from "next";

export const revalidate = 600;

const ITEMS_PER_PAGE = 6;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/courses");
  return metadata || {
    title: "Danh sách khóa học tiếng Trung | HSK 1–6",
    description:
      "Chinh phục HSK từ 1 đến 6 với lộ trình hợp lý, tập trung vào giao tiếp và kỹ năng làm bài thi.",
  };
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; hskLevel?: string; search?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);

  const filters = {
    categoryId: params.category,
    hskLevelGroup: params.hskLevel as 'beginner' | 'intermediate' | 'advanced' | undefined,
    search: params.search,
    sortBy: (params.sort as 'featured' | 'newest') || 'featured',
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  };

  const [courses, categories, allCourses] = await Promise.all([
    getFilteredCourses(filters),
    getCategories(),
    getFilteredCourses({
      categoryId: params.category,
      hskLevelGroup: params.hskLevel as 'beginner' | 'intermediate' | 'advanced' | undefined,
      search: params.search,
      sortBy: (params.sort as 'featured' | 'newest') || 'featured',
    }), // Get all courses for total count
  ]);

  const totalCount = allCourses.length;

  return (
    <main className="flex-1">
      {/* Breadcrumb Section */}
      <div className="bg-gray-50 dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Khóa học tiếng Trung", href: "/courses" },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <AnimatedSection variant="fadeInUp">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">
                Danh sách khóa học Tiếng Trung
              </h1>
              <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
                Chinh phục HSK từ 1 đến 6 với lộ trình rõ ràng, tập trung vào giao tiếp và kỹ năng làm bài thi.
              </p>
            </div>
            <button className="flex lg:hidden items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">filter_list</span>
              Bộ lọc
            </button>
          </div>
        </AnimatedSection>

        {/* Courses Container with Filters */}
        <CoursesContainer
          initialCourses={courses}
          categories={categories}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </main>
  );
}
