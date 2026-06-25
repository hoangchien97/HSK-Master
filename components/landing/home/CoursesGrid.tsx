import Link from "next/link";
import { Button } from "@/components/ui";
import type { Course } from "@/services";

interface CoursesGridProps {
  courses: Course[];
}

export function CoursesGrid({ courses }: CoursesGridProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
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

              {course.enrollmentCount > 0 && (
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-red-500">group</span>
                    <span>{course.enrollmentCount} học viên</span>
                  </div>
                </div>
              )}

              <div className="mt-auto flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-indigo-500">book</span>
                  <span>{course.vocabularyCount} từ</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-purple-500">school</span>
                  <span>{course.lessonCount} bài</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

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
  );
}
