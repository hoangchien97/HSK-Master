import HeroSlideShow from "./components/HeroSlideShow";
import HSKLevelsSection from "./components/HSKLevelsSection";
import CoursesSection from "./components/CoursesSection";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import CTASection from "./components/CTASection";

export const revalidate = 3600;

export const metadata = {
  title: "Trung tâm tiếng Trung uy tín | Lộ trình HSK bài bản",
  description:
    "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
};

export default async function Home() {
  return (
    <main className="flex-1">
      {/* Hero Slideshow Section */}
      <HeroSlideShow />

      {/* HSK Levels Section */}
      <HSKLevelsSection />

      {/* Courses Section */}
      <CoursesSection />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* CTA Section (Before Footer) */}
      <CTASection />
    </main>
  );
}
