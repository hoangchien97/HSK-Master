import type { Metadata } from "next";
import { submitContact } from "./actions";
import { ContactInfo, ContactForm, FAQ_DATA } from "@/app/components/landing/contact";
import { Breadcrumb } from "@/app/components/landing/shared";
import { AnimatedSection } from "@/app/components/landing/shared/AnimatedSection";
import { getPageMetadata } from "@/app/services/metadata.service";
import { generateFAQSchema } from "@/app/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/contact");
  return metadata || {
    title: "Liên hệ - HSK Master | Tư vấn khóa học tiếng Trung",
    description:
      "Liên hệ HSK Master để được tư vấn lộ trình học tiếng Trung và đăng ký khóa học phù hợp. Hotline: 0965 322 136",
  };
}

export default function ContactPage() {
  const faqSchema = generateFAQSchema(
    FAQ_DATA.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  );

  return (
    <main className="flex-1">
      {/* Organization Schema - Already exists, keep it */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "HSK Master",
            url: "https://hskmaster.edu.vn",
            logo: "https://hskmaster.edu.vn/logo.png",
            address: {
              "@type": "PostalAddress",
              streetAddress:
                "Số 4 Xóm Cầu Lão, Xã Ô Diên, Huyện Đan Phượng, Thành Phố Hà Nội",
              addressLocality: "Hà Nội",
              addressRegion: "HN",
              addressCountry: "VN",
            },
            telephone: "0965322136",
            openingHours: "Mo-Su 08:00-21:00",
          }),
        }}
      />
      {/* FAQ Schema - New */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* Breadcrumb Section */}
      <div className="bg-gray-50 dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Liên hệ", href: "/contact" },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <AnimatedSection variant="fadeInUp" className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3">
            Liên hệ với chúng tôi <span className="block text-xl sm:text-2xl font-medium text-text-secondary-light dark:text-text-secondary-dark mt-1">联系我们</span>
          </h1>
          <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
            Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về lộ trình học HSK và các khóa học tiếng Trung.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <AnimatedSection variant="slideInLeft" className="flex flex-col gap-8">
            <ContactInfo />
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border-light dark:border-border-dark shadow-sm relative bg-gray-100 dark:bg-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.0686896934486!2d105.71234267503273!3d21.08894998054054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b32ca0bb49%3A0x91f2fb14e5cc8e10!2zWMOzbSBD4bqndSBMw6JvLCDDlCBEacOqbiwgxJBhbiBQaMaw4bujbmcsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1735650000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection variant="slideInRight">
            <ContactForm submitAction={submitContact} />
          </AnimatedSection>
        </div>
      </div>
    </main>
  );
}
