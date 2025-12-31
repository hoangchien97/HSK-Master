'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from './Button';

interface Course {
  id: string;
  title: string;
  image: string;
  instructor: string;
  instructorAvatar: string;
  price: string;
  originalPrice?: string;
  students: string;
  rating: string;
  level: string;
  tag?: string;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Nhập Môn Tiếng Trung Căn Bản Tốc',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop',
    instructor: 'Cô Bảo Anh',
    instructorAvatar: 'https://i.pravatar.cc/150?img=5',
    price: '499,000₫',
    students: '30 học viên',
    rating: '3 sao',
    level: 'beginner',
    tag: 'Bán chạy',
  },
  {
    id: '2',
    title: 'Luyện Giải Đề HSK 4 & 5 HSKK',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    instructor: 'Fredy Pham',
    instructorAvatar: 'https://i.pravatar.cc/150?img=12',
    price: '1,299,000₫',
    originalPrice: '1,999,000₫',
    students: '35 học viên',
    rating: '5 sao',
    level: 'intermediate',
    tag: 'Phổ biến HSK 4',
  },
  {
    id: '3',
    title: 'Tiếng Trung Kinh Doanh',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    instructor: 'Cô Ngọc',
    instructorAvatar: 'https://i.pravatar.cc/150?img=9',
    price: '699,000₫',
    students: '30 học viên',
    rating: '29 sao',
    level: 'advanced',
  },
  {
    id: '4',
    title: 'Tiếng Trung qua Phim Ảnh',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop',
    instructor: 'Mai Linh',
    instructorAvatar: 'https://i.pravatar.cc/150?img=20',
    price: '599,000₫',
    students: '30 học viên',
    rating: '3 sao',
    level: 'beginner',
    tag: 'Mới nhất',
  },
  {
    id: '5',
    title: 'Biện Pháp Dịch Trung - Việt',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    instructor: 'Kiều Phạm',
    instructorAvatar: 'https://i.pravatar.cc/150?img=32',
    price: '2,499,000₫',
    students: '35 học viên',
    rating: '5 sao',
    level: 'advanced',
  },
  {
    id: '6',
    title: 'Ngữ pháp HSK 1 Từng Nội dung',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    instructor: 'Cô Thi',
    instructorAvatar: 'https://i.pravatar.cc/150?img=44',
    price: '699,000₫',
    students: '35 học viên',
    rating: '5 sao',
    level: 'beginner',
    tag: 'Phổ biến HSK 1',
  },
];

const filters = [
  { id: 'all', label: 'Tất cả', value: 'all' },
  { id: 'beginner', label: 'Sơ cấp (HSK 1-2)', value: 'beginner' },
  { id: 'intermediate', label: 'Trung cấp (HSK 3-4)', value: 'intermediate' },
  { id: 'advanced', label: 'Cao cấp (HSK 5-6)', value: 'advanced' },
];

export default function CoursesSection() {
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
                  href={`/courses/${course.id}`}
                  className="group flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Course Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={course.image}
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
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructor}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.instructor}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-red-500">
                          group
                        </span>
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-yellow-500">
                          star
                        </span>
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-auto flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {course.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-10 text-center">
              <Button variant="secondary" size="md">
                Xem tất cả khóa học
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
