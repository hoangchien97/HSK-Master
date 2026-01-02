import 'dotenv/config'
import { PrismaClient, Prisma } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding full education data...")

  // Clear existing data
  await prisma.vocabulary.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.heroSlide.deleteMany()
  await prisma.hSKLevel.deleteMany()
  await prisma.feature.deleteMany()
  await prisma.ctaStat.deleteMany()

  // ============= Categories =============
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

  const specialized = await prisma.category.create({
    data: {
      name: "Tiếng Trung Chuyên Ngành",
      slug: "tieng-trung-chuyen-nganh",
      description: "Các khóa học tiếng Trung chuyên ngành như kinh doanh, du lịch, dịch thuật. Phù hợp cho người đi làm và học viên có nhu cầu chuyên sâu.",
    },
  })

  // ============= Courses =============
  const hsk1 = await prisma.course.create({
    data: {
      title: "HSK 1 – Tiếng Trung cho người mới bắt đầu",
      slug: "hsk-1",
      description: "Khoá học HSK 1 dành cho người chưa biết gì về tiếng Trung. Lộ trình bài bản, dễ hiểu.",
      level: "HSK 1",
      categoryId: basic.id,
    },
  })

  const hsk2 = await prisma.course.create({
    data: {
      title: "HSK 2 – Giao tiếp tiếng Trung cơ bản",
      slug: "hsk-2",
      description: "Nâng cao kỹ năng giao tiếp, mở rộng từ vựng và mẫu câu thông dụng.",
      level: "HSK 2",
      categoryId: basic.id,
    },
  })

  // Course section courses
  await prisma.course.createMany({
    data: [
      {
        title: "Nhập Môn Tiếng Trung Căn Bản Tốc",
        slug: "nhap-mon-tieng-trung",
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop",
        instructor: "Cô Bảo Anh",
        instructorAvatar: "https://i.pravatar.cc/150?img=5",
        price: "499,000₫",
        students: "30 học viên",
        rating: "3 sao",
        level: "beginner",
        tag: "Bán chạy",
        categoryId: basic.id,
      },
      {
        title: "Luyện Giải Đề HSK 4 & 5 HSKK",
        slug: "luyen-giai-de-hsk-4-5",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
        instructor: "Fredy Pham",
        instructorAvatar: "https://i.pravatar.cc/150?img=12",
        price: "1,299,000₫",
        originalPrice: "1,999,000₫",
        students: "35 học viên",
        rating: "5 sao",
        level: "intermediate",
        tag: "Phổ biến HSK 4",
        categoryId: advanced.id,
      },
      {
        title: "Tiếng Trung Kinh Doanh",
        slug: "tieng-trung-kinh-doanh",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
        instructor: "Cô Ngọc",
        instructorAvatar: "https://i.pravatar.cc/150?img=9",
        price: "699,000₫",
        students: "30 học viên",
        rating: "29 sao",
        level: "advanced",
        categoryId: specialized.id,
      },
      {
        title: "Tiếng Trung qua Phim Ảnh",
        slug: "tieng-trung-qua-phim-anh",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
        instructor: "Mai Linh",
        instructorAvatar: "https://i.pravatar.cc/150?img=20",
        price: "599,000₫",
        students: "30 học viên",
        rating: "3 sao",
        level: "beginner",
        tag: "Mới nhất",
        categoryId: basic.id,
      },
      {
        title: "Biện Pháp Dịch Trung - Việt",
        slug: "bien-phap-dich-trung-viet",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
        instructor: "Kiều Phạm",
        instructorAvatar: "https://i.pravatar.cc/150?img=32",
        price: "2,499,000₫",
        students: "35 học viên",
        rating: "5 sao",
        level: "advanced",
        categoryId: specialized.id,
      },
      {
        title: "Ngữ pháp HSK 1 Từng Nội dung",
        slug: "ngu-phap-hsk-1",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
        instructor: "Cô Thi",
        instructorAvatar: "https://i.pravatar.cc/150?img=44",
        price: "699,000₫",
        students: "35 học viên",
        rating: "5 sao",
        level: "beginner",
        tag: "Phổ biến HSK 1",
        categoryId: basic.id,
      },
    ]
  })

  // ============= Lessons =============
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

  // ============= Vocabulary =============
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

  // ============= Hero Slides =============
  await prisma.heroSlide.createMany({
    data: [
      {
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=800&fit=crop",
        badge: "Khóa học mới 2024",
        badgeColor: "bg-yellow-500 text-black",
        title: "Chinh phục HSK 1 - HSK 6",
        description: "Hệ thống bài giảng video chất lượng cao. Tích hợp AI luyện phát âm và học từ để thi phòng phù hợp nhất Việt Nam.",
        primaryCtaText: "Xem lộ trình",
        primaryCtaHref: "#courses",
        secondaryCtaText: "Thử học miễn phí",
        secondaryCtaHref: "/courses",
        overlayGradient: "from-black/80 via-black/40 to-transparent",
        order: 1,
      },
      {
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&h=800&fit=crop",
        badge: "Tài liệu chất lượng",
        badgeColor: "bg-white text-red-600",
        title: "Tài liệu học tập đầy đủ",
        description: "Kho tài liệu phong phú với hàng ngàn bài tập, từ vựng và mẹo học tập hiệu quả.",
        primaryCtaText: "Khám phá ngay",
        primaryCtaHref: "/vocabulary",
        overlayGradient: "from-red-900/90 via-red-800/50 to-transparent",
        order: 2,
      },
      {
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=800&fit=crop",
        badge: "Cộng đồng học tập",
        badgeColor: "bg-blue-500 text-white",
        title: "Học cùng cộng đồng",
        description: "Tham gia cộng đồng học viên năng động, chia sẻ kinh nghiệm và cùng tiến bộ.",
        primaryCtaText: "Tham gia ngay",
        primaryCtaHref: "/contact",
        overlayGradient: "from-blue-900/90 via-blue-800/50 to-transparent",
        order: 3,
      },
    ]
  })

  // ============= HSK Levels =============
  await prisma.hSKLevel.createMany({
    data: [
      {
        level: 1,
        title: "HSK 1",
        badge: "~3 tháng",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
        description: "Nhìn vào cô ấy chẳng mệt gì đâu. Làm mệt với tâm trí thôi mà sao hết như làm máy.",
        vocabularyCount: "150 từ",
        targetAudience: "Mới bắt đầu",
        targetIcon: "group",
        accentColor: "border-orange-200 bg-orange-50 text-orange-600 dark:bg-surface-dark dark:border-orange-900 dark:text-orange-400",
        bgGradient: "bg-gradient-to-br from-orange-400 to-yellow-300",
        href: "/courses/hsk-1",
        order: 1,
      },
      {
        level: 2,
        title: "HSK 2",
        badge: "~3-4 tháng",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
        description: "Giao tiếp cơ bản trong ngày thường. Nội dung của mỗi sư đại như bài học giúp bạn nắm.",
        vocabularyCount: "300 từ",
        targetAudience: "Sơ cấp",
        targetIcon: "trending_up",
        accentColor: "border-orange-200 bg-orange-50 text-orange-600 dark:bg-surface-dark dark:border-orange-900 dark:text-orange-400",
        bgGradient: "bg-gradient-to-br from-orange-400 to-yellow-300",
        href: "/courses/hsk-2",
        order: 2,
      },
      {
        level: 3,
        title: "HSK 3",
        badge: "~4-5 tháng",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        description: "Bước vào giao tiếp cấp. Giao tiếp và viết thành thạo hơn bình thường sao cho học với tâm.",
        vocabularyCount: "600 từ",
        targetAudience: "Trung cấp",
        targetIcon: "school",
        accentColor: "border-red-200 bg-red-50 text-red-600 dark:bg-surface-dark dark:border-red-900 dark:text-red-400",
        bgGradient: "bg-gradient-to-br from-red-400 to-orange-400",
        href: "/courses/hsk-3",
        order: 3,
      },
      {
        level: 4,
        title: "HSK 4",
        badge: "~5-6 tháng",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        description: "Sẵn sàng cho môi trường du học. Du sĩ tại máy và đại các chúng sẽ trong tình sẽ cấp.",
        vocabularyCount: "1200 từ",
        targetAudience: "Du học/Làm việc",
        targetIcon: "work",
        accentColor: "border-red-200 bg-red-50 text-red-600 dark:bg-surface-dark dark:border-red-900 dark:text-red-400",
        bgGradient: "bg-gradient-to-br from-red-500 to-red-400",
        href: "/courses/hsk-4",
        order: 4,
      },
      {
        level: 5,
        title: "HSK 5",
        badge: "~6-8 tháng",
        badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
        description: "Thành thạo vào ngôn đối tài. Đọc báo, xem phim, giao tiếp một ngành dĩnh đại sĩ.",
        vocabularyCount: "2500 từ",
        targetAudience: "Cao cấp",
        targetIcon: "stars",
        accentColor: "border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-surface-dark dark:border-indigo-900 dark:text-indigo-400",
        bgGradient: "bg-gradient-to-br from-purple-500 to-indigo-500",
        href: "/courses/hsk-5",
        order: 5,
      },
      {
        level: 6,
        title: "HSK 6",
        badge: "~8-12 tháng",
        badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
        description: "Đạt chân các ngữ giá cao. Hiểu cấu kể đến văn đại thị hải nghị một ngành kính loại.",
        vocabularyCount: "5000+ từ",
        targetAudience: "Chuyên gia",
        targetIcon: "psychology",
        accentColor: "border-blue-200 bg-blue-50 text-blue-600 dark:bg-surface-dark dark:border-blue-900 dark:text-blue-400",
        bgGradient: "bg-gradient-to-br from-indigo-600 to-blue-600",
        href: "/courses/hsk-6",
        order: 6,
      },
    ]
  })

  // ============= Features (Why Choose Us) =============
  await prisma.feature.createMany({
    data: [
      {
        icon: "📚",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        title: "HSK 1-6 Hoàn chỉnh",
        description: "Chương trình học từ cơ bản đến nâng cao",
        order: 1,
      },
      {
        icon: "👥",
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        title: "Lớp học nhỏ",
        description: "Tối đa 4-6 học viên để đảm bảo chất lượng",
        order: 2,
      },
      {
        icon: "🏅",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        title: "5 năm kinh nghiệm",
        description: "Giáo viên có kinh nghiệm và tận tâm",
        order: 3,
      },
      {
        icon: "⏰",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-600 dark:text-orange-400",
        title: "Linh hoạt thời gian",
        description: "Lịch học phù hợp với công việc của bạn",
        order: 4,
      },
    ]
  })

  // ============= CTA Stats =============
  await prisma.ctaStat.createMany({
    data: [
      {
        value: "10,000+",
        label: "Học viên",
        order: 1,
      },
      {
        value: "5 năm",
        label: "Kinh nghiệm",
        order: 2,
      },
      {
        value: "98%",
        label: "Hài lòng",
        order: 3,
      },
    ]
  })

  console.log("✅ Seed FULL completed with all home page data!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
