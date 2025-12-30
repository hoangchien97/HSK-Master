import type { Metadata } from "next";
import { submitContact } from "./actions";

export const metadata: Metadata = {
  title: "Liên hệ Trung tâm tiếng Trung | Tư vấn khóa học",
  description:
    "Liên hệ trung tâm tiếng Trung để được tư vấn lộ trình học và đăng ký khóa học phù hợp.",
};

export default function ContactPage() {
  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Trung tâm tiếng Trung ABC",
            "url": "https://abc.edu.vn",
            "logo": "https://abc.edu.vn/logo.png",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Cầu Giấy",
              "addressLocality": "Hà Nội",
              "addressRegion": "HN",
              "addressCountry": "VN"
            },
            "telephone": "0909000999",
            "openingHours": "Mo-Su 08:00-21:00"
          }),
        }}
      />

      <h1 className="text-3xl font-bold">Liên hệ với chúng tôi</h1>

      <p className="mt-2 text-gray-600">
        Để lại thông tin, chúng tôi sẽ liên hệ tư vấn miễn phí.
      </p>

      <form action={submitContact} className="mt-6 space-y-4">
        <input
          name="name"
          placeholder="Họ và tên"
          required
          className="w-full border p-2"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full border p-2"
        />

        <textarea
          name="message"
          placeholder="Nội dung liên hệ"
          required
          rows={4}
          className="w-full border p-2"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Gửi liên hệ
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Thông tin trung tâm</h2>
        <ul className="mt-2 text-gray-700">
          <li>📍 Địa chỉ: Hà Nội / TP.HCM</li>
          <li>📞 Hotline: 09xx xxx xxx</li>
          <li>✉️ Email: contact@trungtamhoctiengtrung.vn</li>
        </ul>
      </section>
    </main>
  );
}
