import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  maxVisible?: number;
  className?: string;
}

function getPageUrl(baseUrl: string, page: number): string {
  const url = new URL(baseUrl, "http://x");
  url.searchParams.set("page", String(page));
  return url.pathname + url.search;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  maxVisible = 5,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const btnBase =
    "inline-flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      <Link
        href={getPageUrl(baseUrl, currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={cn(
          btnBase,
          "border border-(--color-smoke)",
          currentPage <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-(--color-paper)"
        )}
      >
        <ChevronLeft size={16} />
      </Link>

      {start > 1 && (
        <>
          <Link
            href={getPageUrl(baseUrl, 1)}
            className={cn(btnBase, "hover:bg-(--color-paper)")}
          >
            1
          </Link>
          {start > 2 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={getPageUrl(baseUrl, p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={cn(
            btnBase,
            p === currentPage
              ? "bg-(--color-vermillion) text-white"
              : "hover:bg-(--color-paper) text-(--color-ink)"
          )}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <Link
            href={getPageUrl(baseUrl, totalPages)}
            className={cn(btnBase, "hover:bg-(--color-paper)")}
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={getPageUrl(baseUrl, currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={cn(
          btnBase,
          "border border-(--color-smoke)",
          currentPage >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-(--color-paper)"
        )}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
export default Pagination;
