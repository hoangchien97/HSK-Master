import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "../components/shared";
import { CourseFilter, CourseCard } from "../components/courses";

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
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
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

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <CourseFilter categories={categories} />

          {/* Courses Grid */}
          <div className="flex-1">
            {/* Filter Tabs & Sort */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <button className="whitespace-nowrap rounded-full bg-brand-gradient px-4 py-1.5 text-sm font-bold text-white shadow-sm">
                  Tất cả
                </button>
                <button className="whitespace-nowrap rounded-full bg-white dark:bg-surface-dark px-4 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 transition-colors">
                  HSK 1
                </button>
                <button className="whitespace-nowrap rounded-full bg-white dark:bg-surface-dark px-4 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 transition-colors">
                  HSK 3
                </button>
                <button className="whitespace-nowrap rounded-full bg-white dark:bg-surface-dark px-4 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 transition-colors">
                  Luyện HSKK
                </button>
                <button className="whitespace-nowrap rounded-full bg-white dark:bg-surface-dark px-4 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 transition-colors">
                  Giao tiếp cơ bản
                </button>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
                  Sắp xếp:
                </span>
                <select className="block w-full rounded-md border-0 bg-transparent py-1.5 pl-3 pr-8 text-sm text-text-main-light dark:text-white ring-1 ring-inset ring-border-light dark:ring-border-dark focus:ring-2 focus:ring-red-500 cursor-pointer">
                  <option>Phổ biến nhất</option>
                  <option>Mới nhất</option>
                  <option>Giá thấp đến cao</option>
                </select>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                    search_off
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Không tìm thấy khóa học
                  </h3>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    Vui lòng thử lại với bộ lọc khác
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <a
                    href={hasPrevPage ? `?page=${currentPage - 1}` : "#"}
                    className={`inline-flex items-center justify-center size-10 rounded-lg border transition-colors ${
                      hasPrevPage
                        ? "border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main-light dark:text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    }`}
                    aria-disabled={!hasPrevPage}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </a>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                    const showEllipsis =
                      (pageNum === 2 && currentPage > 3) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <span
                          key={pageNum}
                          className="px-2 text-text-secondary-light dark:text-text-secondary-dark"
                        >
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <a
                        key={pageNum}
                        href={`?page=${pageNum}`}
                        className={`inline-flex items-center justify-center size-10 rounded-lg font-medium transition-all ${
                          pageNum === currentPage
                            ? "bg-brand-gradient text-white shadow-md"
                            : "border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main-light dark:text-white"
                        }`}
                      >
                        {pageNum}
                      </a>
                    );
                  })}

                  {/* Next Button */}
                  <a
                    href={hasNextPage ? `?page=${currentPage + 1}` : "#"}
                    className={`inline-flex items-center justify-center size-10 rounded-lg border transition-colors ${
                      hasNextPage
                        ? "border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main-light dark:text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    }`}
                    aria-disabled={!hasNextPage}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </a>
                </div>

                {/* Page Info */}
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Trang <span className="font-medium text-text-main-light dark:text-white">{currentPage}</span> /{" "}
                  <span className="font-medium text-text-main-light dark:text-white">{totalPages}</span>
                  {" "}• Hiển thị {courses.length} trong tổng số {totalCount} khóa học
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
