"use client";

import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import { CourseCard, CourseFilter } from "../../components/courses";
import { Select, Input, Pagination } from "../../components/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { getCoursesAction } from "./actions";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

interface Course {
  id: string;
  [key: string]: any;
}

export function CoursesGrid({ courses }: { courses: Course[] }) {
  return (
    <motion.div
      key={courses.map(c => c.id).join(',')}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {courses.length > 0 ? (
        courses.map((course: any) => (
          <motion.div key={course.id} variants={staggerItem}>
            <CourseCard course={course} />
          </motion.div>
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
    </motion.div>
  );
}

interface CoursesContainerProps {
  initialCourses: Course[];
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
  itemsPerPage
}: CoursesContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedHskLevel, setSelectedHskLevel] = useState<string | null>(
    searchParams.get('hskLevel')
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [courses, setCourses] = useState(initialCourses);
  const [page, setPage] = useState(currentPage);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Sync state with URL params when navigation happens
  useEffect(() => {
    const hskLevel = searchParams.get('hskLevel');
    const category = searchParams.get('category');
    const searchQuery = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'featured';
    const pageNum = parseInt(searchParams.get('page') || '1', 10);

    setSelectedHskLevel(hskLevel);
    setSelectedCategory(category);
    setSearch(searchQuery);
    setSortBy(sort);
    setPage(pageNum);

    // Fetch courses with new params
    fetchFilteredCourses({
      hskLevel,
      category,
      search: searchQuery || undefined,
      sort,
      page: pageNum,
    });
  }, [searchParams]);

  const updateFilters = (params: Record<string, string | null | number>, resetPage = true) => {
    const newParams = new URLSearchParams();

    Object.entries({
      hskLevel: selectedHskLevel,
      category: selectedCategory,
      search: search || null,
      sort: sortBy,
      page: resetPage ? 1 : page,
      ...params
    }).forEach(([key, value]) => {
      if (value) newParams.set(key, String(value));
    });

    startTransition(() => {
      router.push(`/courses?${newParams.toString()}`, { scroll: false });
    });

    // Fetch filtered courses
    fetchFilteredCourses({
      hskLevel: params.hskLevel !== undefined ? params.hskLevel : selectedHskLevel,
      category: params.category !== undefined ? params.category : selectedCategory,
      search: params.search !== undefined ? params.search : search || undefined,
      sort: params.sort !== undefined ? params.sort : sortBy,
      page: params.page !== undefined ? Number(params.page) : (resetPage ? 1 : page),
    });
  };

  const fetchFilteredCourses = async (filters: Record<string, string | number | undefined | null>) => {
    const data = await getCoursesAction({
      category: filters.category as string | null | undefined,
      hskLevel: filters.hskLevel as string | null | undefined,
      search: filters.search as string | null | undefined,
      sort: filters.sort as string | null | undefined,
      page: filters.page as number | undefined,
      limit: itemsPerPage,
    });

    setCourses(data.courses);
    if (filters.page) setPage(Number(filters.page));
  };

  const handleHskLevelChange = (level: string | null) => {
    setSelectedHskLevel(level);
    updateFilters({ hskLevel: level }, true);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    updateFilters({ category: categoryId }, true);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sort: value }, true);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value || null }, true);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        selectedHskLevel={selectedHskLevel}
        selectedCategory={selectedCategory}
        onHskLevelChange={handleHskLevelChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Top Bar with Count, Sort & Search */}
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
                  { value: 'featured', label: 'Nổi bật' },
                  { value: 'newest', label: 'Mới nhất' },
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
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isPending && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Courses Grid */}
        <CoursesGrid courses={courses} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              currentItemsCount={courses.length}
              basePath="/courses"
              showInfo={true}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
