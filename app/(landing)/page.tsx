import {
  HeroSlideShow,
  PainPointsSection,
  SolutionSection,
  HSKLevelsSection,
  WhyChooseUsSection,
  GallerySection,
  CTASection,
  ReviewsSection,
} from "@/components/landing";
import { AnimatedSection } from "@/components/landing/shared/AnimatedSection";
import { getPageMetadata } from "@/services/metadata.service";
import { generateFAQSchema } from "@/lib/structured-data";
import { FAQ_DATA } from "@/components/landing/contact/ContactFAQ";
import { Suspense } from "react";
import type { Metadata } from "next";
import { OG_IMAGE } from "@/constants/brand";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/");
  return metadata || {
    title: "Học HSK Online Bài Bản – Đậu Thật, Không Học Vẹt | Ruby HSK",
    description:
      "Lộ trình học HSK1→HSK6 rõ ràng, 500+ học viên, tỉ lệ đậu 92%. Đăng ký tư vấn miễn phí ngay hôm nay.",
    openGraph: {
      title: "Học HSK Online Bài Bản – Đậu Thật, Không Học Vẹt | Ruby HSK",
      description: "Lộ trình học HSK1→HSK6 rõ ràng, 500+ học viên, tỉ lệ đậu 92%. Đăng ký tư vấn miễn phí.",
      url: "/",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: "Học HSK Online Bài Bản – Đậu Thật, Không Học Vẹt | Ruby HSK",
      description: "Lộ trình học HSK1→HSK6 rõ ràng, 500+ học viên, tỉ lệ đậu 92%. Đăng ký tư vấn miễn phí.",
      images: [OG_IMAGE],
    },
  };
}

/** FAQ structured data for SEO (Google rich results) */
const faqSchema = generateFAQSchema(
  FAQ_DATA.map(({ question, answer }) => ({ question, answer }))
);

export default async function Home() {
  return (
    <>
      {/* FAQ JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Hero Slideshow – Above the fold, no animation wrapper for faster LCP */}
      <HeroSlideShow />

      {/* 2. Pain Points – "Bạn có đang gặp phải những điều này?" */}
      <AnimatedSection variant="fadeInUp">
        <PainPointsSection />
      </AnimatedSection>

      {/* 3. Solution – "Giải pháp từ Ruby HSK" */}
      <AnimatedSection variant="fadeInUp">
        <SolutionSection />
      </AnimatedSection>

      {/* 4. HSK Levels – Lộ trình học rõ ràng */}
      <AnimatedSection variant="fadeInUp">
        <HSKLevelsSection />
      </AnimatedSection>

      {/* 5. Why Choose Us */}
      <AnimatedSection variant="fadeInUp">
        <WhyChooseUsSection />
      </AnimatedSection>

      {/* Below-fold sections wrapped in Suspense for streaming */}
      <Suspense fallback={null}>
        {/* 6. Gallery */}
        <AnimatedSection variant="fadeInUp">
          <GallerySection />
        </AnimatedSection>

        {/* 7. Reviews / Social Proof */}
        <AnimatedSection variant="fadeInUp">
          <ReviewsSection />
        </AnimatedSection>

        {/* 8. CTA cuối trang */}
        <AnimatedSection variant="fadeInUp">
          <CTASection />
        </AnimatedSection>
      </Suspense>
    </>
  );
}
