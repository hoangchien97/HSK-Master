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
import { Suspense } from "react";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hskmaster.edu.vn";
  const ogImageUrl = `${siteUrl}/preview/thumb.png`;
  return metadata || {
    title: "Trung tâm tiếng Trung uy tín | Lộ trình HSK bài bản",
    description:
      "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
    openGraph: {
      title: "Ruby HSK - Trung tâm tiếng Trung uy tín tại Hà Nội",
      description: "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
      url: "/",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "Ruby HSK - Học HSK Dễ Dàng & Hiệu Quả" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Ruby HSK - Trung tâm tiếng Trung uy tín tại Hà Nội",
      description: "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
      images: [ogImageUrl],
    },
  };
}

export default async function Home() {
  return (
    <>
      {/* Hero Slideshow Section - Above the fold, no animation wrapper for faster LCP */}
      <HeroSlideShow />

      {/* HSK Levels Section */}
      <AnimatedSection variant="fadeInUp">
        <HSKLevelsSection />
      </AnimatedSection>

      {/* Why Choose Us Section */}
      <AnimatedSection variant="fadeInUp">
        <WhyChooseUsSection />
      </AnimatedSection>

      {/* Below-fold sections wrapped in Suspense for streaming */}
      <Suspense fallback={null}>
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
      </Suspense>
    </>
  );
}
