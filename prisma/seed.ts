import { PrismaClient, Prisma } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding education data...");

  const category = await prisma.category.create({
    data: {
      name: "Tiếng Trung Cơ Bản",
      slug: "tieng-trung-co-ban",
    },
  });

  const course = await prisma.course.create({
    data: {
      title: "HSK 1",
      slug: "hsk-1",
      description: "Khoá học HSK 1 cho người mới bắt đầu",
      level: "HSK 1",
      categoryId: category.id,
    },
  });

  const lesson = await prisma.lesson.create({
    data: {
      title: "Bài 1: Chào hỏi",
      order: 1,
      courseId: course.id,
    },
  });

  await prisma.vocabulary.createMany({
    data: [
      {
        word: "你好",
        pinyin: "nǐ hǎo",
        meaning: "Xin chào",
        lessonId: lesson.id,
      },
      {
        word: "谢谢",
        pinyin: "xiè xie",
        meaning: "Cảm ơn",
        lessonId: lesson.id,
      },
    ],
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
