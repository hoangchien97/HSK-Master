import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/app/components/shared/Button";
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
    <main className="flex-grow w-full flex justify-center py-5 px-4 md:px-10">
      <div className="flex flex-col max-w-[960px] flex-1 w-full gap-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 px-0 md:px-4">
          <Link
            href="/"
            className="text-[#896161] dark:text-gray-400 hover:text-primary text-sm font-medium leading-normal transition-colors"
          >
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-[#896161] dark:text-gray-500 text-[16px]">
            chevron_right
          </span>
          <Link
            href="/courses"
            className="text-[#896161] dark:text-gray-400 hover:text-primary text-sm font-medium leading-normal transition-colors"
          >
            Khóa học
          </Link>
          <span className="material-symbols-outlined text-[#896161] dark:text-gray-500 text-[16px]">
            chevron_right
          </span>
          <span className="text-[#181111] dark:text-white text-sm font-bold leading-normal">
            {course.level}
          </span>
        </div>

        {/* Page Heading & Hero */}
        <div className="flex flex-col md:flex-row justify-between gap-6 px-0 md:px-4 items-start md:items-center">
          <div className="flex flex-col gap-3 max-w-2xl">
            {course.badgeText && (
              <div className="inline-flex items-center gap-2">
                <span className={`px-2 py-1 rounded ${course.badgeColor || "bg-primary/10 text-primary"} text-xs font-bold uppercase tracking-wider`}>
                  {course.badgeText}
                </span>
              </div>
            )}
            <h1 className="text-[#181111] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
              {course.title}
            </h1>
            <p className="text-[#896161] dark:text-gray-300 text-base md:text-lg font-normal leading-relaxed">
              {course.description}
            </p>
          </div>
          <Button 
            variant="gradient"
            size="lg"
            className="min-w-[160px] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5"
            icon={<span className="material-symbols-outlined">arrow_forward</span>}
            iconPosition="right"
          >
            Bắt đầu học
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-0 md:px-4">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 shadow-sm hover:border-primary/30 transition-colors group">
            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <p className="text-[#555] dark:text-gray-400 text-sm font-medium">
              Từ vựng
            </p>
            <p className="text-[#181111] dark:text-white text-xl font-bold">
              {course.vocabularyCount} từ
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 shadow-sm hover:border-primary/30 transition-colors group">
            <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <p className="text-[#555] dark:text-gray-400 text-sm font-medium">
              Ngữ pháp
            </p>
            <p className="text-[#181111] dark:text-white text-xl font-bold">
              {course.grammarCount} điểm
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 shadow-sm hover:border-primary/30 transition-colors group">
            <div className="size-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">play_lesson</span>
            </div>
            <p className="text-[#555] dark:text-gray-400 text-sm font-medium">
              Bài học
            </p>
            <p className="text-[#181111] dark:text-white text-xl font-bold">
              {course.lessonCount} bài
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 shadow-sm hover:border-primary/30 transition-colors group">
            <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-1 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <p className="text-[#555] dark:text-gray-400 text-sm font-medium">
              Thời lượng
            </p>
            <p className="text-[#181111] dark:text-white text-xl font-bold">
              {course.durationHours} giờ
            </p>
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
        <div className="mx-0 md:mx-4 mt-8 mb-8 rounded-2xl p-8 md:p-12 relative overflow-hidden text-center bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-colors">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-red-700"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-100 dark:bg-yellow-900/10 rounded-full blur-2xl opacity-60"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-100 dark:bg-red-900/10 rounded-full blur-2xl opacity-60"></div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl font-black text-[#181111] dark:text-white tracking-tight">
              Sẵn sàng chinh phục {course.level}?
            </h2>
            <p className="text-[#896161] dark:text-gray-300 text-lg">
              Tham gia cùng hơn 10,000 học viên đang học tiếng Trung với nền tảng tương tác của chúng tôi. 
              Theo dõi tiến độ và nhận chứng chỉ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button
                variant="gradient"
                size="lg"
                className="shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:-translate-y-0.5"
              >
                Dùng thử miễn phí
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[#181111] dark:text-white hover:bg-gray-50 dark:hover:bg-white/20"
              >
                Kiểm tra trình độ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
