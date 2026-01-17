import Link from "next/link";
import Image from "next/image";
import { Tooltip } from "../shared";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    instructor: string | null;
    instructorAvatar: string | null;
    price: string | null;
    originalPrice: string | null;
    students: string | null;
    rating: string | null;
    tag: string | null;
    badgeText: string | null;
    lectures: number;
    durationHours: number;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const defaultImage = `https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop&q=80`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm transition-all hover:shadow-lg hover:border-red-200 dark:hover:border-red-900">
      <Link href={`/courses/${course.slug}`} className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <Image
          src={course.image || defaultImage}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {course.badgeText && (
          <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-red-600 backdrop-blur-sm shadow-md dark:bg-gray-900/95 dark:text-red-400 border border-red-200 dark:border-red-800">
            {course.badgeText}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 text-lg font-bold leading-snug text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
          {course.description || "Khóa học tiếng Trung chất lượng cao, giúp bạn nâng cao kỹ năng giao tiếp và đạt chứng chỉ HSK."}
        </p>

        <div className="mb-4 flex items-center gap-4 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
          <Tooltip content="Số lượng bài giảng trong khóa học">
            <div className="flex items-center gap-1.5 cursor-help">
              <span className="material-symbols-outlined text-[18px] text-red-500">play_circle</span>
              <span>{course.lectures || 0} bài giảng</span>
            </div>
          </Tooltip>
          <Tooltip content="Tổng thời lượng khóa học">
            <div className="flex items-center gap-1.5 cursor-help">
              <span className="material-symbols-outlined text-[18px] text-orange-500">schedule</span>
              <span>{course.durationHours || 0} giờ</span>
            </div>
          </Tooltip>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border-light dark:border-border-dark pt-4">
          <div className="flex items-center gap-2.5">
            {course.instructorAvatar ? (
              <Image
                src={course.instructorAvatar}
                alt={course.instructor || "Instructor"}
                width={36}
                height={36}
                className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
              />
            ) : (
              <div className="size-9 rounded-full bg-linear-to-br from-orange-400 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {course.instructor?.charAt(0) || "C"}
              </div>
            )}
            <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">
              {course.instructor || "Cô Ngọc"}
            </span>
          </div>
          <div className="text-right">
            {course.originalPrice && (
              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark line-through mb-0.5">
                {course.originalPrice}
              </div>
            )}
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {course.price || "Liên hệ"}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
