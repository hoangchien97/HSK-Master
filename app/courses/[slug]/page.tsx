import { prisma } from "@/lib/prisma";

export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
  });

  return {
    title: course?.title,
    description: course?.description,
  };
}

export default async function CourseDetail({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: true },
  });

  if (!course) return <p>Không tìm thấy khóa học</p>;

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="mt-2">{course.description}</p>

      <h2 className="mt-6 text-xl font-semibold">Danh sách bài học</h2>
      <ul className="mt-3 list-disc ml-6">
        {course.lessons.map((l) => (
          <li key={l.id}>{l.title}</li>
        ))}
      </ul>
    </main>
  );
}
