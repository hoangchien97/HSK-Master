import type { Metadata } from "next";
import { getPageMetadata } from "@/services/metadata.service";
import { DEFAULT_IMAGE_PREVIEW } from "@/constants/brand";
import {
  AboutHero,
  TeacherProfile,
  TeachingPhilosophy,
  WhyChooseUs,
  Environment,
} from "@/components/landing/about";
import { AnimatedSection } from "@/components/landing/shared/AnimatedSection";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/about");
  return (
    metadata || {
      title: "Giới thiệu",
      description: "Tìm hiểu về HSK Master - Trung tâm tiếng Trung uy tín",
      openGraph: {
        title: "Giới thiệu | Ruby HSK",
        description: "Tìm hiểu về HSK Master - Trung tâm tiếng Trung uy tín",
        url: "/about",
        images: [DEFAULT_IMAGE_PREVIEW],
      },
      twitter: {
        card: "summary_large_image",
        title: "Giới thiệu | Ruby HSK",
        description: "Tìm hiểu về HSK Master - Trung tâm tiếng Trung uy tín",
        images: [DEFAULT_IMAGE_PREVIEW],
      },
    }
  );
}

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <AnimatedSection variant="fadeInUp">
          <AboutHero />
        </AnimatedSection>

        {/* Teacher Profile */}
        <AnimatedSection variant="fadeInUp">
          <TeacherProfile />
        </AnimatedSection>

        {/* Teaching Philosophy */}
        <AnimatedSection variant="fadeInUp">
          <TeachingPhilosophy />
        </AnimatedSection>

        {/* Why Choose Us */}
        <AnimatedSection variant="fadeInUp">
          <WhyChooseUs />
        </AnimatedSection>

        {/* Environment */}
        <AnimatedSection variant="fadeInUp">
          <Environment />
        </AnimatedSection>
      </div>
    </main>
  );
}
