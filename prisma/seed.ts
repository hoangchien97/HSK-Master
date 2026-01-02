import 'dotenv/config'
import { PrismaClient, Prisma } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding full education data...")

  // Clear
  await prisma.vocabulary.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()

  // Categories
  const basic = await prisma.category.create({
    data: {
      name: "Tiếng Trung Cơ Bản",
      slug: "tieng-trung-co-ban",
      description: "Các khóa học tiếng Trung dành cho người mới bắt đầu, từ cơ bản đến trung cấp. Phù hợp cho học viên chưa có nền tảng hoặc muốn củng cố kiến thức nền.",
    },
  })

  const advanced = await prisma.category.create({
    data: {
      name: "Tiếng Trung Nâng Cao",
      slug: "tieng-trung-nang-cao",
      description: "Các khóa học tiếng Trung nâng cao, chuyên sâu cho học viên đã có nền tảng vững. Tập trung vào kỹ năng giao tiếp chuyên nghiệp và HSK cấp cao.",
    },
  })

  // Courses
  const hsk1 = await prisma.course.create({
    data: {
      title: "HSK 1 – Tiếng Trung cho người mới bắt đầu",
      slug: "hsk-1",
      description:
        "Khoá học HSK 1 dành cho người chưa biết gì về tiếng Trung. Lộ trình bài bản, dễ hiểu.",
      level: "HSK 1",
      categoryId: basic.id,
    },
  })

  const hsk2 = await prisma.course.create({
    data: {
      title: "HSK 2 – Giao tiếp tiếng Trung cơ bản",
      slug: "hsk-2",
      description:
        "Nâng cao kỹ năng giao tiếp, mở rộng từ vựng và mẫu câu thông dụng.",
      level: "HSK 2",
      categoryId: basic.id,
    },
  })

  // Lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Bài 1: Chào hỏi trong tiếng Trung",
      order: 1,
      courseId: hsk1.id,
    },
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      title: "Bài 2: Giới thiệu bản thân",
      order: 2,
      courseId: hsk1.id,
    },
  })

  // Vocabulary
  await prisma.vocabulary.createMany({
    data: [
      {
        word: "你好",
        pinyin: "nǐ hǎo",
        meaning: "Xin chào",
        lessonId: lesson1.id,
      },
      {
        word: "再见",
        pinyin: "zài jiàn",
        meaning: "Tạm biệt",
        lessonId: lesson1.id,
      },
      {
        word: "我",
        pinyin: "wǒ",
        meaning: "Tôi",
        lessonId: lesson2.id,
      },
      {
        word: "你",
        pinyin: "nǐ",
        meaning: "Bạn",
        lessonId: lesson2.id,
      },
    ],
  })

  console.log("✅ Seed FULL completed")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
