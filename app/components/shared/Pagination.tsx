"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  currentItemsCount?: number;
  basePath?: string;
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "pill" | "square";
  showInfo?: boolean;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  currentItemsCount,
  basePath = "",
  size = "md",
  shape = "rounded",
  showInfo = false,
  onPageChange,
}: PaginationProps) {
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "size-8 text-xs",
      gap: "gap-1",
    },
    md: {
      button: "size-10 text-sm",
      gap: "gap-2",
    },
    lg: {
      button: "size-12 text-base",
      gap: "gap-3",
    },
  };

  // Shape configurations
  const shapeConfig = {
    rounded: "rounded-xl",
    pill: "rounded-full",
    square: "rounded-md",
  };

  const config = sizeConfig[size];
  const shapeClass = shapeConfig[shape];

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const buildPageUrl = (page: number) => {
    return `${basePath}?page=${page}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center ${config.gap}`}>
      <div className={`flex items-center ${config.gap}`}>
        {/* Previous Button */}
        {onPageChange ? (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={!hasPrevPage}
            className={`
              inline-flex items-center justify-center ${config.button} ${shapeClass}
              border-2 font-bold transition-all
              ${
                hasPrevPage
                  ? "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700"
                  : "border-gray-100 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href={hasPrevPage ? buildPageUrl(currentPage - 1) : "#"}
            className={`
              inline-flex items-center justify-center ${config.button} ${shapeClass}
              border-2 font-bold transition-all
              ${
                hasPrevPage
                  ? "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700"
                  : "border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none"
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        )}

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
              <span key={pageNum} className="px-2 text-gray-400 font-bold">
                ...
              </span>
            );
          }

          if (!showPage) return null;

          const isActive = pageNum === currentPage;

          const pageButton = (
            <span
              className={`
                inline-flex items-center justify-center ${config.button} ${shapeClass}
                font-bold transition-all
                ${
                  isActive
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110 border-2 border-primary-600"
                    : "border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700"
                }
              `}
            >
              {pageNum}
            </span>
          );

          return onPageChange ? (
            <button key={pageNum} onClick={() => handlePageClick(pageNum)}>
              {pageButton}
            </button>
          ) : (
            <Link key={pageNum} href={buildPageUrl(pageNum)}>
              {pageButton}
            </Link>
          );
        })}

        {/* Next Button */}
        {onPageChange ? (
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={!hasNextPage}
            className={`
              inline-flex items-center justify-center ${config.button} ${shapeClass}
              border-2 font-bold transition-all
              ${
                hasNextPage
                  ? "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700"
                  : "border-gray-100 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href={hasNextPage ? buildPageUrl(currentPage + 1) : "#"}
            className={`
              inline-flex items-center justify-center ${config.button} ${shapeClass}
              border-2 font-bold transition-all
              ${
                hasNextPage
                  ? "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700"
                  : "border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none"
              }
            `}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Page Info */}
      {showInfo && totalItems && (
        <p className="text-sm text-gray-500">
          Trang <span className="font-bold text-gray-900">{currentPage}</span> /{" "}
          <span className="font-bold text-gray-900">{totalPages}</span> •{" "}
          {currentItemsCount && `Hiển thị ${currentItemsCount} trong `}tổng số{" "}
          {totalItems}
        </p>
      )}
    </div>
  );
}
