import type { Metadata } from "next";
import { getPageMetadata } from "../../services/metadata.service";
import {
  AboutHero,
  TeacherProfile,
  TeachingPhilosophy,
  WhyChooseUs,
  Environment,
} from "../../components/about";
import { AnimatedSection } from "../../components/shared/AnimatedSection";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/about");
  return (
    metadata || {
      title: "Giới thiệu",
      description: "Tìm hiểu về HSK Master - Trung tâm tiếng Trung uy tín",
    }
  );
}

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
