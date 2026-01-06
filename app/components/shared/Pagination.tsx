import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  currentItemsCount: number;
  basePath?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  currentItemsCount,
  basePath = "",
}: PaginationProps) {
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const buildPageUrl = (page: number) => {
    return `${basePath}?page=${page}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Link
          href={hasPrevPage ? buildPageUrl(currentPage - 1) : "#"}
          className={`inline-flex items-center justify-center size-10 rounded-lg border transition-colors ${
            hasPrevPage
              ? "border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main-light dark:text-white"
              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed pointer-events-none"
          }`}
          aria-disabled={!hasPrevPage}
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </Link>

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
            <Link
              key={pageNum}
              href={buildPageUrl(pageNum)}
              className={`inline-flex items-center justify-center size-10 rounded-lg font-bold transition-all ${
                pageNum === currentPage
                  ? "bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white shadow-lg shadow-red-500/50 dark:shadow-red-900/50 scale-110 ring-2 ring-red-300 dark:ring-red-800"
                  : "border border-border-light dark:border-border-dark hover:bg-gradient-to-br hover:from-red-50 hover:to-orange-50 dark:hover:from-red-950/30 dark:hover:to-orange-950/30 hover:border-red-300 dark:hover:border-red-700 text-text-main-light dark:text-white"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}

        {/* Next Button */}
        <Link
          href={hasNextPage ? buildPageUrl(currentPage + 1) : "#"}
          className={`inline-flex items-center justify-center size-10 rounded-lg border transition-colors ${
            hasNextPage
              ? "border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main-light dark:text-white"
              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed pointer-events-none"
          }`}
          aria-disabled={!hasNextPage}
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </Link>
      </div>

      {/* Page Info */}
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Trang{" "}
        <span className="font-medium text-text-main-light dark:text-white">
          {currentPage}
        </span>{" "}
        /{" "}
        <span className="font-medium text-text-main-light dark:text-white">
          {totalPages}
        </span>{" "}
        • Hiển thị {currentItemsCount} trong tổng số {totalItems} khóa học
      </p>
    </div>
  );
}
