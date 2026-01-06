import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Button from "@/app/components/shared/Button";
import { Breadcrumb } from "@/app/components/shared";
import LessonList from "./LessonList";

export const revalidate = 600; // ISR - revalidate every 10 minutes

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
  });

  return {
    title: course?.title || "Khóa học",
    description: course?.description || "Chi tiết khóa học tiếng Trung",
  };
}

export default async function CourseDetail({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      grammarPoints: {
        orderBy: { order: "asc" },
        take: 3,
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="flex-1">
      {/* Breadcrumb Section */}
      <div className="bg-gray-50 dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Khóa học", href: "/courses" },
              { label: course.level || course.title, href: `/courses/${course.slug}` },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Heading & Hero */}
        <div className="flex flex-col gap-6 items-center text-center mb-16 max-w-4xl mx-auto">
          {course.badgeText && (
            <div className="inline-flex items-center gap-2">
              <span className={`px-4 py-2 rounded-full ${course.badgeColor || "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400"} text-sm font-bold uppercase tracking-wider shadow-sm`}>
                {course.badgeText}
              </span>
            </div>
          )}
          <h1 className="text-[#181111] dark:text-white text-4xl md:text-6xl font-black leading-tight tracking-tight">
            {course.title}
          </h1>
          <p className="text-[#896161] dark:text-gray-300 text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
            {course.description}
          </p>
        </div>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-0 md:px-4 mb-12">
          <div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 inline-flex items-center justify-center size-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">menu_book</span>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
              Từ vựng
            </p>
            <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {course.vocabularyCount} từ
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 inline-flex items-center justify-center size-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
              Ngữ pháp
            </p>
            <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
              {course.grammarCount} điểm
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/20 dark:to-pink-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 inline-flex items-center justify-center size-14 bg-green-50 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400 transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">play_lesson</span>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
              Bài học
            </p>
            <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-green-600 dark:group-hover:text-green-400">
              {course.lessonCount} bài
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-900/20 dark:to-emerald-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 inline-flex items-center justify-center size-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl text-orange-600 dark:text-orange-400 transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">schedule</span>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
              Thời lượng
            </p>
            <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
              {course.durationHours} giờ
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900/20 dark:to-red-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Main Learning Path Section */}
        <LessonList lessons={course.lessons} initialDisplayCount={3} />

        {/* Resources Split Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-0 md:px-4 mt-4">
          {/* Vocabulary Card */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 p-6 flex flex-col justify-between h-full min-h-[240px] group hover:border-yellow-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/20 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                  translate
                </span>
                <h3 className="text-xl font-bold text-[#181111] dark:text-white">
                  Danh sách từ vựng
                </h3>
              </div>
              <p className="text-[#896161] dark:text-gray-300 mb-6">
                Xem lại tất cả {course.vocabularyCount} từ vựng cần thiết cho{" "}
                {course.level}. Bao gồm phát âm, pinyin và câu ví dụ.
              </p>
              {/* Mini Preview List */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                  我 (wǒ)
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                  你 (nǐ)
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                  好 (hǎo)
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 text-xs">
                  +{course.vocabularyCount - 3} từ khác
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              className="relative z-10 w-full border-2 border-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              icon={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              iconPosition="right"
            >
              Xem danh sách đầy đủ
            </Button>
          </div>

          {/* Grammar Card */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 p-6 flex flex-col justify-between h-full min-h-[240px] group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 dark:bg-red-900/20 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">
                  history_edu
                </span>
                <h3 className="text-xl font-bold text-[#181111] dark:text-white">
                  Điểm ngữ pháp
                </h3>
              </div>
              <p className="text-[#896161] dark:text-gray-300 mb-6">
                Nắm vững cấu trúc câu. Giải thích ngắn gọn cho tất cả{" "}
                {course.grammarCount} điểm ngữ pháp với ngữ cảnh thực tế.
              </p>
              <ul className="space-y-2 mb-6">
                {course.grammarPoints.slice(0, 3).map((gp) => (
                  <li
                    key={gp.id}
                    className="flex items-center gap-2 text-sm text-[#555] dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    <span className="size-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-red-600"></span>
                    {gp.title}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="secondary"
              className="relative z-10 w-full border-2 border-primary/20 text-primary hover:bg-primary/5"
              icon={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              iconPosition="right"
            >
              Xem hướng dẫn ngữ pháp
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mx-0 md:mx-4 mt-8 mb-8 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-2 border-orange-200/50 dark:border-orange-900/30">
          {/* Decorative background elements */}
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-gradient-to-br from-orange-300/30 to-red-300/30 dark:from-orange-900/20 dark:to-red-900/20 rounded-full blur-3xl"></div>
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 dark:from-orange-400 dark:via-red-400 dark:to-pink-400 tracking-tight leading-tight">
              Sẵn sàng học HSK 1?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
              Đăng ký ngay để được tư vấn lộ trình học phù hợp và nhận buổi học thử miễn phí
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
              <Button
                variant="gradient"
                size="md"
                icon={<span className="text-[18px]">🎓</span>}
                iconPosition="left"
              >
                Đăng ký học thử miễn phí
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="bg-white dark:bg-white/10 border-2 border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-800 shadow-md hover:shadow-lg transition-all duration-300"
                icon={<span className="text-[18px]">👩‍🏫</span>}
                iconPosition="left"
              >
                Tìm hiểu về cô Ngọc
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
