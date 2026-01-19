import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Button from "@/app/components/shared/Button";
import { Breadcrumb } from "@/app/components/shared";
import { AnimatedSection } from "@/app/components/shared/AnimatedSection";
import LessonList from "./LessonList";
import { CourseStatsGrid, CourseResourceCards } from "./CourseClient";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 }
  }
};

export const revalidate = 600; // ISR - revalidate every 10 minutes

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate static paths for all courses
export async function generateStaticParams() {
  try {
    const courses = await prisma.course.findMany({
      select: { slug: true },
    });
    return courses.map((course: { slug: string }) => ({
      slug: course.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

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
        <AnimatedSection variant="fadeInUp">
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
        </AnimatedSection>

        {/* Statistics */}
        <CourseStatsGrid stats={{
          vocabularyCount: course.vocabularyCount,
          grammarCount: course.grammarCount,
          lessonCount: course.lessonCount,
          durationHours: course.durationHours
        }} />

        {/* Main Learning Path Section */}
        <LessonList lessons={course.lessons} initialDisplayCount={3} />

        {/* Resources Split Section */}
        <CourseResourceCards course={{
          vocabularyCount: course.vocabularyCount,
          grammarCount: course.grammarCount,
          level: course.level || "HSK",
          grammarPoints: course.grammarPoints
        }} />

        {/* Bottom CTA */}
        <AnimatedSection variant="scaleIn" className="mt-8 mb-8">
          <div className="mx-0 md:mx-4 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-2 border-orange-200/50 dark:border-orange-900/30">
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
        </AnimatedSection>
      </div>
    </main>
  );
}
