'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/landing/common/Button';
import type { Course } from '@/services';

interface CoursesSectionClientProps {
  courses: Course[];
}

const filters = [
  { id: 'all', label: 'Tất cả', value: 'all' },
  { id: 'beginner', label: 'Sơ cấp (HSK 1-2)', value: 'beginner' },
  { id: 'intermediate', label: 'Trung cấp (HSK 3-4)', value: 'intermediate' },
  { id: 'advanced', label: 'Cao cấp (HSK 5-6)', value: 'advanced' },
];

export default function CoursesSectionClient({ courses }: CoursesSectionClientProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const filteredCourses =
    selectedFilter === 'all'
      ? courses
      : courses.filter((course) => course.level === selectedFilter);

  return (
    <section className="py-12 bg-white dark:bg-background-dark" id="courses">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex lg:hidden items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">filter_list</span>
            <span>Lọc khóa học</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <div className="flex flex-col gap-4 sticky top-24">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">tune</span>
                  <span>Bộ lọc</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Trình độ HSK
                    </h4>
                    <div className="space-y-2 pl-1">
                      {filters.map((filter) => (
                        <label
                          key={filter.id}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="level"
                            value={filter.value}
                            checked={selectedFilter === filter.value}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600">
                            {filter.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Dropdown */}
          {showMobileFilter && (
            <div className="lg:hidden p-4 rounded-xl bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-4">
                Trình độ HSK
              </h3>
              <div className="space-y-2">
                {filters.map((filter) => (
                  <label key={filter.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="level-mobile"
                      value={filter.value}
                      checked={selectedFilter === filter.value}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {filter.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Courses Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Course Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={course.image || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {course.tag && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {course.tag}
                      </span>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 p-4 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    {course.instructor && (
                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={course.instructorAvatar || 'https://i.pravatar.cc/150?img=5'}
                          alt={course.instructor}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {course.instructor}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    {course.enrollmentCount > 0 && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-red-500">
                            group
                          </span>
                          <span>{course.enrollmentCount} học viên</span>
                        </div>
                      </div>
                    )}

                    {/* Course Info - Vocabulary & Grammar count */}
                    <div className="mt-auto flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-indigo-500">
                          book
                        </span>
                        <span>{course.vocabularyCount} từ</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-purple-500">
                          school
                        </span>
                        <span>{course.lessonCount} bài</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-10 text-center">
              <Button
                variant="secondary"
                size="md"
                icon={<span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              >
                Xem tất cả khóa học
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
