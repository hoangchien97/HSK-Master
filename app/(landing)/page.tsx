import {
  HeroSlideShow,
  HSKLevelsSection,
  WhyChooseUsSection,
  GallerySection,
  CTASection,
  ReviewsSection,
} from "@/components/landing";
import { AnimatedSection } from "@/components/landing/shared/AnimatedSection";
import { getPageMetadata } from "@/services/metadata.service";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/");
  const homepageOgImage = "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/sign/metadata/share-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMjI2MTBhZi03OGEzLTQ4MTAtYTM1NC1lNWViNjg2YmVjMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZXRhZGF0YS9zaGFyZS1wcmV2aWV3LnBuZyIsImlhdCI6MTc3MjA0NzY2NCwiZXhwIjoxODAzNTgzNjY0fQ.dFuhrdZ1xh_BETqYo4JsPjBdWPBXO-qkA5bLOcxLqTo";
  return metadata || {
    title: "Trung tâm tiếng Trung uy tín | Lộ trình HSK bài bản",
    description:
      "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
    openGraph: {
      title: "Ruby HSK - Trung tâm tiếng Trung uy tín tại Hà Nội",
      description: "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
      url: "/",
      images: [{ url: homepageOgImage, width: 1200, height: 630, alt: "Ruby HSK - Học HSK Dễ Dàng & Hiệu Quả" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Ruby HSK - Trung tâm tiếng Trung uy tín tại Hà Nội",
      description: "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
      images: [homepageOgImage],
    },
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
