"use client";

import { useState, useTransition, useEffect } from "react";
import { CourseFilter } from "@/components/landing/courses";
import { CourseFilterBody } from "@/components/landing/courses/CourseFilter";
import { Select, Input, Pagination, Popover } from "@/components/ui";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCoursesAction } from "./actions";
import { CoursesGrid } from "./CoursesGrid";
import type { CourseWithCategory } from "@/services/course.service";

interface CoursesContainerProps {
  initialCourses: CourseWithCategory[];
  categories: { id: string; name: string; slug: string }[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export function CoursesContainer({
  initialCourses,
  categories,
  totalCount,
  currentPage,
  itemsPerPage,
}: CoursesContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedHskLevels, setSelectedHskLevels] = useState<string[]>(
    searchParams.get("hskLevel")?.split(",").filter(Boolean) ?? []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) ?? []
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [courses, setCourses] = useState<CourseWithCategory[]>(initialCourses);
  const [page, setPage] = useState(currentPage);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const hskLevels = searchParams.get("hskLevel")?.split(",").filter(Boolean) ?? [];
    const cats = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
    const searchQuery = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "featured";
    const pageNum = parseInt(searchParams.get("page") || "1", 10);

    setSelectedHskLevels(hskLevels);
    setSelectedCategories(cats);
    setSearch(searchQuery);
    setSortBy(sort);
    setPage(pageNum);

    fetchFilteredCourses({
      hskLevels,
      categories: cats,
      search: searchQuery || undefined,
      sort,
      page: pageNum,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilters = (
    params: {
      hskLevels?: string[];
      categories?: string[];
      search?: string | null;
      sort?: string;
      page?: number;
    },
    resetPage = true
  ) => {
    const resolved = {
      hskLevels: params.hskLevels ?? selectedHskLevels,
      categories: params.categories ?? selectedCategories,
      search: params.search !== undefined ? params.search : search || null,
      sort: params.sort ?? sortBy,
      page: params.page ?? (resetPage ? 1 : page),
    };

    const newParams = new URLSearchParams();
    if (resolved.hskLevels.length > 0) newParams.set("hskLevel", resolved.hskLevels.join(","));
    if (resolved.categories.length > 0) newParams.set("category", resolved.categories.join(","));
    if (resolved.search) newParams.set("search", resolved.search);
    if (resolved.sort) newParams.set("sort", resolved.sort);
    if (resolved.page > 1) newParams.set("page", String(resolved.page));

    startTransition(() => {
      router.push(`/courses?${newParams.toString()}`, { scroll: false });
    });

    fetchFilteredCourses(resolved);
  };

  const fetchFilteredCourses = async (filters: {
    hskLevels?: string[];
    categories?: string[];
    search?: string | null;
    sort?: string;
    page?: number;
  }) => {
    const data = await getCoursesAction({
      hskLevels: filters.hskLevels,
      categories: filters.categories,
      search: filters.search,
      sort: filters.sort,
      page: filters.page,
      limit: itemsPerPage,
    });
    setCourses(data.courses);
    if (filters.page) setPage(filters.page);
  };

  const handleHskLevelChange = (levels: string[]) => {
    setSelectedHskLevels(levels);
    updateFilters({ hskLevels: levels }, true);
  };

  const handleCategoryChange = (cats: string[]) => {
    setSelectedCategories(cats);
    updateFilters({ categories: cats }, true);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sort: value }, true);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value || null }, true);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      {/* Decorative Background */}
      <div className="absolute left-0 top-20 w-32 h-32 opacity-5 dark:opacity-10 pointer-events-none hidden xl:block">
        <svg viewBox="0 0 200 200" className="text-red-600">
          <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.3" />
          <text x="100" y="120" fontSize="80" fontWeight="bold" textAnchor="middle" fill="currentColor">中</text>
        </svg>
      </div>

      {/* Sidebar Filter */}
      <CourseFilter
        categories={categories}
        selectedHskLevels={selectedHskLevels}
        selectedCategories={selectedCategories}
        onHskLevelChange={handleHskLevelChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Mobile filter trigger — hidden on desktop where the sidebar is visible */}
        <div className="lg:hidden mb-4">
          <Popover
            trigger={
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                  <span>Bộ lọc</span>
                  {(selectedHskLevels.length + selectedCategories.length) > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-primary-500 text-white text-xs font-bold px-1">
                      {selectedHskLevels.length + selectedCategories.length}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
            }
            align="start"
            className="w-80"
          >
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border-light dark:border-border-dark">
                <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Bộ lọc tìm kiếm
                </span>
              </div>
              <CourseFilterBody
                categories={categories}
                selectedHskLevels={selectedHskLevels}
                selectedCategories={selectedCategories}
                onHskLevelChange={handleHskLevelChange}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </Popover>
        </div>

        {/* Top Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              Hiển thị:
            </span>
            <span className="font-semibold text-text-main-light dark:text-text-main-dark">
              {courses.length} khóa học
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <Select
                size="sm"
                options={[
                  { value: "featured", label: "Nổi bật" },
                  { value: "newest", label: "Mới nhất" },
                ]}
                value={sortBy}
                onChange={handleSortChange}
                placeholder="Sắp xếp"
              />
            </div>
            <div className="w-full sm:w-80">
              <Input
                variant="search"
                placeholder="Tìm kiếm khóa học..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        <CoursesGrid courses={courses} />

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              currentItemsCount={courses.length}
              showInfo={true}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
