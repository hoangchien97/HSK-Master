import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Breadcrumb } from "../components/shared";

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
    <main className="flex-1">
      {/* Breadcrumb Section */}
      <div className="bg-gray-50 dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Khóa học", href: "/courses" },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Các khóa học tiếng Trung
        </h1>
        <ul className="space-y-6">
          {courses.map((c) => (
            <li
              key={c.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Link href={`/courses/${c.slug}`} className="block group">
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors mb-2">
                  {c.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{c.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
