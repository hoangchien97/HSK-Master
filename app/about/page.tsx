import type { Metadata } from "next";
import { Breadcrumb } from "../components/shared";
import {
  AboutHero,
  TeacherProfile,
  WhyChooseUs,
  TeachingPhilosophy,
  Environment
} from "../components/about";
import { AnimatedSection } from "../components/shared/AnimatedSection";

export const metadata: Metadata = {
  title: "Giới thiệu - HSK Master | Học tiếng Trung chuẩn quốc tế",
  description:
    "HSK Master - Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao, giảng viên giàu kinh nghiệm, lộ trình học rõ ràng.",
  openGraph: {
    title: "Giới thiệu HSK Master",
    description: "Học tiếng Trung bài bản – luyện thi HSK – giao tiếp thực tế.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="bg-gray-50 dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Giới thiệu", href: "/about" },
            ]}
          />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AnimatedSection variant="fadeInUp">
          <AboutHero />
        </AnimatedSection>
        <AnimatedSection variant="fadeInUp">
          <TeacherProfile />
        </AnimatedSection>
        <AnimatedSection variant="fadeInUp">
          <WhyChooseUs />
        </AnimatedSection>
        <AnimatedSection variant="fadeInUp">
          <TeachingPhilosophy />
        </AnimatedSection>
        <AnimatedSection variant="fadeInUp">
          <Environment />
        </AnimatedSection>
      </div>
    </main>
  );
}
