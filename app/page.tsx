import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Trung tâm tiếng Trung uy tín | Lộ trình HSK bài bản",
  description:
    "Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao. Đăng ký học thử miễn phí.",
};

export default async function Home() {
  const courses = await prisma.course.findMany({
    include: { category: true },
  });

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-4xl font-bold">
        Trung tâm tiếng Trung – Lộ trình HSK bài bản
      </h1>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Khoá học nổi bật</h2>
        <ul className="mt-4 space-y-3">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                href={`/courses/${c.slug}`}
                className="text-blue-600 underline"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
