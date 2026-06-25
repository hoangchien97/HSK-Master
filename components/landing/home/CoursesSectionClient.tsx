'use client';

import { useState } from 'react';
import type { Course } from '@/services';
import { CourseFilterSidebar } from './CourseFilterSidebar';
import { CoursesGrid } from './CoursesGrid';

const FILTERS = [
  { id: 'all', label: 'Tất cả', value: 'all' },
  { id: 'beginner', label: 'Sơ cấp (HSK 1-2)', value: 'beginner' },
  { id: 'intermediate', label: 'Trung cấp (HSK 3-4)', value: 'intermediate' },
  { id: 'advanced', label: 'Cao cấp (HSK 5-6)', value: 'advanced' },
];

interface CoursesSectionClientProps {
  courses: Course[];
}

export default function CoursesSectionClient({ courses }: CoursesSectionClientProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const filteredCourses =
    selectedFilter === 'all'
      ? courses
      : courses.filter((course) => course.level === selectedFilter);

  return (
    <section className="py-12 bg-white dark:bg-background-dark" id="courses">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border-light dark:border-border-dark pb-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3">
              Khám phá khóa học Tiếng Trung
            </h2>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
              Lựa chọn phù hợp với mục đích học tập và bắt đầu hành trình.
            </p>
          </div>

          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex lg:hidden items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">filter_list</span>
            <span>Lọc khóa học</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <CourseFilterSidebar
            filters={FILTERS}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            showMobileFilter={showMobileFilter}
          />
          <CoursesGrid courses={filteredCourses} />
        </div>
      </div>
    </section>
  );
}
