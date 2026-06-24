import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  // URL-based (use baseUrl OR onPageChange — not both)
  baseUrl?: string;
  // Callback-based navigation (landing courses client)
  onPageChange?: (page: number) => void;
  // Display options
  maxVisible?: number;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  currentItemsCount?: number;
  className?: string;
  // Compat no-op props (system-design demo)
  size?: string;
  shape?: string;
}

interface PageBtnProps {
  page: number;
  disabled?: boolean;
  isActive?: boolean;
  border?: boolean;
  children: ReactNode;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
}

function getPageUrl(baseUrl: string, page: number): string {
  const url = new URL(baseUrl, "http://x");
  url.searchParams.set("page", String(page));
  return url.pathname + url.search;
}

const btnBase =
  "inline-flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors";

function PageBtn({ page, disabled, isActive, border, children, baseUrl, onPageChange }: PageBtnProps) {
  const cls = cn(
    btnBase,
    border && "border border-(--color-smoke)",
    isActive
      ? "bg-(--color-vermillion) text-white"
      : "hover:bg-(--color-paper) text-(--color-ink)",
    disabled && "pointer-events-none opacity-40"
  );

  if (onPageChange) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPageChange(page)}
        aria-current={isActive ? "page" : undefined}
        className={cls}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      href={getPageUrl(baseUrl!, page)}
      aria-disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      className={cls}
    >
      {children}
    </Link>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  onPageChange,
  maxVisible = 5,
  showInfo,
  totalItems,
  itemsPerPage,
  currentItemsCount: _currentItemsCount,
  size: _size,
  shape: _shape,
  className,
}: PaginationProps) {
  void _size;
  void _shape;
  void _currentItemsCount;
  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const shared = { baseUrl, onPageChange };

  const startItem =
    totalItems && itemsPerPage
      ? (currentPage - 1) * itemsPerPage + 1
      : undefined;
  const endItem =
    totalItems && itemsPerPage
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : undefined;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {showInfo && totalItems !== undefined && startItem && endItem && (
        <p className="text-sm text-muted-foreground">
          {"Hiển thị "}
          <span className="font-medium">{startItem}–{endItem}</span>
          {" trong "}
          <span className="font-medium">{totalItems}</span>
          {" kết quả"}
        </p>
      )}

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <PageBtn {...shared} page={currentPage - 1} disabled={currentPage <= 1} border>
          <ChevronLeft size={16} />
        </PageBtn>

        {start > 1 && (
          <>
            <PageBtn {...shared} page={1}>1</PageBtn>
            {start > 2 && <span className="px-1 text-muted-foreground">…</span>}
          </>
        )}

        {pages.map((p) => (
          <PageBtn {...shared} key={p} page={p} isActive={p === currentPage}>
            {p}
          </PageBtn>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <PageBtn {...shared} page={totalPages}>{totalPages}</PageBtn>
          </>
        )}

        <PageBtn {...shared} page={currentPage + 1} disabled={currentPage >= totalPages} border>
          <ChevronRight size={16} />
        </PageBtn>
      </nav>
    </div>
  );
}
export default Pagination;
