import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 600;

export const metadata = {
  title: "Danh sách khóa học tiếng Trung | HSK 1–6",
  description:
    "Danh sách các khóa học tiếng Trung từ HSK 1 đến HSK 6, lộ trình rõ ràng.",
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: { category: true },
  });

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Các khóa học tiếng Trung</h1>
      <ul className="mt-6 space-y-4">
        {courses.map((c) => (
          <li key={c.id}>
            <Link href={`/courses/${c.slug}`} className="text-xl text-blue-600">
              {c.title}
            </Link>
            <p className="text-gray-600">{c.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
