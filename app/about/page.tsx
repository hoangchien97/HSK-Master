import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu Trung tâm tiếng Trung | Lộ trình HSK bài bản",
  description:
    "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao, giảng viên giàu kinh nghiệm, lộ trình học rõ ràng.",
  openGraph: {
    title: "Giới thiệu Trung tâm tiếng Trung",
    description: "Học tiếng Trung bài bản – luyện thi HSK – giao tiếp thực tế.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="container mx-auto p-6 prose max-w-none">
      <h1>Giới thiệu Trung tâm tiếng Trung</h1>

      <p>
        Trung tâm tiếng Trung của chúng tôi được thành lập với mục tiêu giúp học
        viên chinh phục tiếng Trung một cách bài bản và hiệu quả.
      </p>

      <h2>Sứ mệnh</h2>
      <p>
        Mang đến lộ trình học tiếng Trung từ cơ bản đến nâng cao, tập trung vào
        giao tiếp và luyện thi HSK.
      </p>

      <h2>Giá trị cốt lõi</h2>
      <ul>
        <li>Giảng viên giàu kinh nghiệm</li>
        <li>Lộ trình rõ ràng, dễ theo</li>
        <li>Tài liệu chuẩn HSK</li>
        <li>Hỗ trợ học viên tận tâm</li>
      </ul>

      <h2>Đối tượng học viên</h2>
      <p>
        Người mới bắt đầu, sinh viên, người đi làm, người có nhu cầu học tiếng
        Trung để du học hoặc làm việc.
      </p>
    </main>
  );
}
