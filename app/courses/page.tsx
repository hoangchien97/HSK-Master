import { prisma } from "@/lib/prisma";
import { Breadcrumb, Badge, Pagination, Select } from "../components/shared";
import { CourseFilter } from "../components/courses";
import { AnimatedSection } from "../components/shared/AnimatedSection";
import { CoursesGrid } from "./CoursesClient";

export const revalidate = 600;

export const metadata = {
  title: "Danh sách khóa học tiếng Trung | HSK 1–6",
  description:
    "Chinh phục HSK từ 1 đến 6 với lộ trình hợp lý, tập trung vào giao tiếp và kỹ năng làm bài thi.",
};

const ITEMS_PER_PAGE = 9;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [courses, totalCount, categories] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip,
    }),
    prisma.course.count({
      where: { isPublished: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

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

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* Decorative Background Images */}
          <div className="absolute left-0 top-20 w-32 h-32 opacity-5 dark:opacity-10 pointer-events-none hidden xl:block">
            <svg viewBox="0 0 200 200" className="text-red-600">
              <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.3" />
              <text x="100" y="120" fontSize="80" fontWeight="bold" textAnchor="middle" fill="currentColor">中</text>
            </svg>
          </div>
          <div className="absolute right-0 top-40 w-32 h-32 opacity-5 dark:opacity-10 pointer-events-none hidden xl:block">
            <svg viewBox="0 0 200 200" className="text-orange-500">
              <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.3" />
              <text x="100" y="120" fontSize="80" fontWeight="bold" textAnchor="middle" fill="currentColor">文</text>
            </svg>
          </div>

          {/* Sidebar Filter */}
          <CourseFilter categories={categories} />

          {/* Courses Grid */}
          <div className="flex-1 relative z-10">
            {/* Filter Tabs & Sort */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {/* <Badge variant="active">Tất cả</Badge>
                <Badge>HSK 1</Badge>
                <Badge>HSK 2</Badge>
                <Badge>HSK 3</Badge>
                <Badge>HSK 4</Badge>
                <Badge>HSK 5-6</Badge>
                <Badge>Luyện HSKK</Badge>
                <Badge>Giao tiếp</Badge> */}
              </div>

              <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
                  Sắp xếp:
                </span>
                <Select
                  size="sm"
                  options={[
                    { value: 'popular', label: 'Phổ biến nhất' },
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'price-asc', label: 'Giá thấp đến cao' },
                  ]}
                  defaultValue="popular"
                  className="min-w-[140px]"
                />
              </div>
            </div>

            {/* Courses Grid */}
            <CoursesGrid courses={courses} />

            {/* Pagination */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                currentItemsCount={courses.length}
                basePath="/courses"
                showInfo={true}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
