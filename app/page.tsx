import {
  HeroSlideShow,
  HSKLevelsSection,
  WhyChooseUsSection,
  GallerySection,
  CTASection,
  ReviewsSection,
} from "./components/home";
import { AnimatedSection } from "./components/shared/AnimatedSection";
import { getPageMetadata } from "./services/metadata.service";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/");
  return metadata || {
    title: "Trung tâm tiếng Trung uy tín | Lộ trình HSK bài bản",
    description:
      "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
  };
}

export default async function Home() {
  return (
    <main className="flex-1">
      {/* Hero Slideshow Section */}
      <AnimatedSection variant="fadeInUp">
        <HeroSlideShow />
      </AnimatedSection>

      {/* HSK Levels Section */}
      <AnimatedSection variant="fadeInUp">
        <HSKLevelsSection />
      </AnimatedSection>

      {/* Why Choose Us Section */}
      <AnimatedSection variant="fadeInUp">
        <WhyChooseUsSection />
      </AnimatedSection>

      {/* Gallery Section */}
      <AnimatedSection variant="fadeInUp">
        <GallerySection />
      </AnimatedSection>

      {/* Reviews Section */}
      <AnimatedSection variant="fadeInUp">
        <ReviewsSection />
      </AnimatedSection>

      {/* CTA Section (Before Footer) */}
      <AnimatedSection variant="fadeInUp">
        <CTASection />
      </AnimatedSection>
    </main>
  );
}
