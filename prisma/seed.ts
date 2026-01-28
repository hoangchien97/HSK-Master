import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { seedPortal } from './seed-portal'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ============= Clear existing data =============
  console.log("🗑️  Clearing existing data...")
  await prisma.grammarPoint.deleteMany()
  await prisma.photo.deleteMany()
  await prisma.album.deleteMany()
  await prisma.vocabulary.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.heroSlide.deleteMany()
  await prisma.hSKLevel.deleteMany()
  await prisma.feature.deleteMany()
  await prisma.ctaStat.deleteMany()
  await prisma.review.deleteMany()
  await prisma.pageMetadata.deleteMany()
  console.log("✅ Cleared existing data")

  // ============= Categories =============
  console.log("📚 Creating categories...")
  const categories = await prisma.category.createManyAndReturn({
    data: [
      {
        name: "Luyện thi HSK",
        slug: "luyen-thi-hsk",
        description: "Các khóa học luyện thi HSK từ cấp độ 1 đến 6. Lộ trình rõ ràng, bài giảng chi tiết, luyện đề chuyên sâu giúp bạn đạt chứng chỉ HSK mục tiêu.",
      },
      {
        name: "Giao tiếp",
        slug: "giao-tiep",
        description: "Các khóa học tập trung vào kỹ năng giao tiếp thực tế. Phù hợp cho người muốn sử dụng tiếng Trung trong cuộc sống hàng ngày, du lịch và công việc.",
      },
      {
        name: "Tiếng Trung Thương mại",
        slug: "tieng-trung-thuong-mai",
        description: "Các khóa học tiếng Trung chuyên ngành kinh doanh, thương mại. Phù hợp cho doanh nhân, nhân viên văn phòng và người có nhu cầu giao tiếp trong môi trường công việc chuyên nghiệp.",
      },
    ],
  })

  const hskCategory = categories.find(c => c.slug === "luyen-thi-hsk")!
  const communicationCategory = categories.find(c => c.slug === "giao-tiep")!
  const businessCategory = categories.find(c => c.slug === "tieng-trung-thuong-mai")!
  console.log(`✅ Created ${categories.length} categories`)

  // ============= HSK Levels =============
  console.log("📊 Creating HSK levels...")
  const hskLevelsData = [
    {
      level: 1,
      title: "HSK 1",
      badge: "Sơ cấp",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      description: "Làm quen với tiếng Trung từ con số 0, học cách chào hỏi và giao tiếp cơ bản.",
      vocabularyCount: "150 từ",
      targetAudience: "Người mới bắt đầu",
      targetIcon: "school",
      accentColor: "orange",
      bgGradient: "from-orange-50 to-orange-100/50",
      href: "/courses/hsk-1",
      order: 1,
    },
    {
      level: 2,
      title: "HSK 2",
      badge: "Sơ cấp",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      description: "Giao tiếp cơ bản trong cuộc sống hàng ngày. Nâng cao kỹ năng giao tiếp, mở rộng từ vựng và mẫu câu thông dụng.",
      vocabularyCount: "300 từ",
      targetAudience: "Người có nền tảng cơ bản",
      targetIcon: "chat",
      accentColor: "orange",
      bgGradient: "from-orange-50 to-orange-100/50",
      href: "/courses/hsk-2",
      order: 2,
    },
    {
      level: 3,
      title: "HSK 3",
      badge: "Trung cấp",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      description: "Bước vào giao tiếp nâng cao. Giao tiếp và viết thành thạo hơn trong các tình huống thường gặp.",
      vocabularyCount: "600 từ",
      targetAudience: "Người có nền tảng vững",
      targetIcon: "trending_up",
      accentColor: "red",
      bgGradient: "from-red-50 to-red-100/50",
      href: "/courses/hsk-3",
      order: 3,
    },
    {
      level: 4,
      title: "HSK 4",
      badge: "Trung cấp",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      description: "Sẵn sàng cho môi trường du học và làm việc. Giao tiếp tự tin trong các tình huống phức tạp.",
      vocabularyCount: "1200 từ",
      targetAudience: "Người chuẩn bị du học/làm việc",
      targetIcon: "work",
      accentColor: "red",
      bgGradient: "from-red-50 to-red-100/50",
      href: "/courses/hsk-4",
      order: 4,
    },
    {
      level: 5,
      title: "HSK 5",
      badge: "Cao cấp",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
      description: "Thành thạo giao tiếp chuyên sâu. Đọc báo, xem phim, giao tiếp trong môi trường chuyên nghiệp.",
      vocabularyCount: "2500 từ",
      targetAudience: "Người cần trình độ chuyên nghiệp",
      targetIcon: "business_center",
      accentColor: "indigo",
      bgGradient: "from-indigo-50 to-indigo-100/50",
      href: "/courses/hsk-5",
      order: 5,
    },
    {
      level: 6,
      title: "HSK 6",
      badge: "Chuyên gia",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      description: "Đạt trình độ gần như người bản ngữ. Hiểu và sử dụng tiếng Trung trong mọi tình huống phức tạp.",
      vocabularyCount: "5000+ từ",
      targetAudience: "Người cần trình độ chuyên gia",
      targetIcon: "emoji_events",
      accentColor: "blue",
      bgGradient: "from-blue-50 to-blue-100/50",
      href: "/courses/hsk-6",
      order: 6,
    },
  ]

  const hskLevels = await prisma.hSKLevel.createManyAndReturn({ data: hskLevelsData })
  const hskLevelMap = Object.fromEntries(hskLevels.map(l => [l.level, l.id]))
  console.log(`✅ Created ${hskLevels.length} HSK levels`)

  // ============= Courses =============
  console.log("📖 Creating courses...")
  const coursesData = [
    // HSK 1-6 Courses
    {
      title: "HSK 1 – Tiếng Trung cho người mới bắt đầu",
      slug: "hsk-1",
      description: "Khóa học HSK 1 dành cho người mới bắt đầu. Làm quen với tiếng Trung từ con số 0, học cách chào hỏi và giao tiếp cơ bản.",
      image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "HSK 1",
      badgeText: "Mới bắt đầu",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      vocabularyCount: 150,
      grammarCount: 45,
      lessonCount: 18,
      lectures: 18,
      durationHours: 40,
      categoryId: hskCategory.id,
      hskLevelId: hskLevelMap[1],
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2024-01-01"),
      viewCount: 1250,
      enrollmentCount: 340,
      metaTitle: "Khóa học HSK 1 - Tiếng Trung cho người mới bắt đầu",
      metaDescription: "Học HSK 1 từ con số 0. 150 từ vựng, 45 điểm ngữ pháp, 18 bài học. Cam kết đầu ra. Giáo viên 8 năm kinh nghiệm.",
      keywords: "HSK 1, học tiếng Trung cơ bản, khóa học HSK 1, tiếng Trung sơ cấp, học tiếng Trung online",
      ogImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&h=630&fit=crop&q=80",
    },
    {
      title: "HSK 2 – Giao tiếp tiếng Trung cơ bản",
      slug: "hsk-2",
      description: "Giao tiếp cơ bản trong cuộc sống hàng ngày. Nâng cao kỹ năng giao tiếp, mở rộng từ vựng và mẫu câu thông dụng.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "HSK 2",
      badgeText: "Sơ cấp",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      vocabularyCount: 300,
      grammarCount: 60,
      lessonCount: 16,
      lectures: 16,
      durationHours: 60,
      categoryId: hskCategory.id,
      hskLevelId: hskLevelMap[2],
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2024-01-15"),
      viewCount: 980,
      enrollmentCount: 265,
      metaTitle: "Khóa học HSK 2 - Giao tiếp tiếng Trung cơ bản",
      metaDescription: "Học HSK 2 giao tiếp thực tế. 300 từ vựng, 60 điểm ngữ pháp, 16 bài học. Luyện nói, nghe, đọc, viết.",
      keywords: "HSK 2, giao tiếp tiếng Trung, học HSK 2 online, tiếng Trung cơ bản, khóa học HSK 2",
      ogImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop&q=80",
    },
    {
      title: "HSK 3 – Tiếng Trung trung cấp",
      slug: "hsk-3",
      description: "Bước vào giao tiếp nâng cao. Giao tiếp và viết thành thạo hơn trong các tình huống thường gặp.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "HSK 3",
      badgeText: "Trung cấp",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      vocabularyCount: 600,
      grammarCount: 80,
      lessonCount: 20,
      lectures: 20,
      durationHours: 80,
      categoryId: hskCategory.id,
      hskLevelId: hskLevelMap[3],
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2024-02-01"),
      viewCount: 850,
      enrollmentCount: 198,
      metaTitle: "Khóa học HSK 3 - Tiếng Trung trung cấp Hà Nội",
      metaDescription: "HSK 3 trung cấp với 600 từ vựng, 80 điểm ngữ pháp. Giao tiếp tự tin trong tình huống thực tế.",
      keywords: "HSK 3, tiếng Trung trung cấp, học HSK 3, khóa học HSK 3 Hà Nội, luyện thi HSK 3",
      ogImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop&q=80",
    },
    {
      title: "HSK 4 – Sẵn sàng du học và làm việc",
      slug: "hsk-4",
      description: "Sẵn sàng cho môi trường du học và làm việc. Giao tiếp tự tin trong các tình huống phức tạp.",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "HSK 4",
      badgeText: "Du học/Làm việc",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      vocabularyCount: 1200,
      grammarCount: 120,
      lessonCount: 22,
      lectures: 22,
      durationHours: 100,
      categoryId: hskCategory.id,
      hskLevelId: hskLevelMap[4],
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2024-02-15"),
      viewCount: 720,
      enrollmentCount: 156,
      metaTitle: "Khóa học HSK 4 - Du học Trung Quốc & Làm việc",
      metaDescription: "HSK 4 cho du học sinh. 1200 từ vựng, 120 điểm ngữ pháp. Giao tiếp tự tin trong môi trường học tập, làm việc.",
      keywords: "HSK 4, du học Trung Quốc, học HSK 4, luyện thi HSK 4, tiếng Trung du học",
      ogImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=630&fit=crop&q=80",
    },
    {
      title: "HSK 5 – Tiếng Trung cao cấp",
      slug: "hsk-5",
      description: "Thành thạo giao tiếp chuyên sâu. Đọc báo, xem phim, giao tiếp trong môi trường chuyên nghiệp.",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "HSK 5",
      badgeText: "Cao cấp",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
      vocabularyCount: 2500,
      grammarCount: 150,
      lessonCount: 24,
      lectures: 24,
      durationHours: 120,
      categoryId: hskCategory.id,
      hskLevelId: hskLevelMap[5],
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2024-03-01"),
      viewCount: 620,
      enrollmentCount: 112,
      metaTitle: "Khóa học HSK 5 - Tiếng Trung cao cấp chuyên nghiệp",
      metaDescription: "HSK 5 cao cấp với 2500 từ vựng. Đọc báo, xem phim, giao tiếp chuyên nghiệp. Cam kết đầu ra.",
      keywords: "HSK 5, tiếng Trung cao cấp, học HSK 5, luyện thi HSK 5, tiếng Trung chuyên nghiệp",
      ogImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=630&fit=crop&q=80",
    },
    {
      title: "HSK 6 – Trình độ chuyên gia",
      slug: "hsk-6",
      description: "Đạt trình độ gần như người bản ngữ. Hiểu và sử dụng tiếng Trung trong mọi tình huống phức tạp.",
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "HSK 6",
      badgeText: "Chuyên gia",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      vocabularyCount: 5000,
      grammarCount: 200,
      lessonCount: 26,
      lectures: 26,
      durationHours: 150,
      categoryId: hskCategory.id,
      hskLevelId: hskLevelMap[6],
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2024-03-15"),
      viewCount: 480,
      enrollmentCount: 78,
      metaTitle: "Khóa học HSK 6 - Trình độ chuyên gia gần như người bản ngữ",
      metaDescription: "HSK 6 đỉnh cao với 5000+ từ vựng. Đạt trình độ gần người bản ngữ. Giảng viên chuyên gia 8+ năm kinh nghiệm.",
      keywords: "HSK 6, tiếng Trung chuyên gia, học HSK 6, luyện thi HSK 6, trình độ cao nhất HSK",
      ogImage: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&h=630&fit=crop&q=80",
    },
    // Communication Course
    {
      title: "Tiếng Trung Giao tiếp Thực tế",
      slug: "tieng-trung-giao-tiep-thuc-te",
      description: "Khóa học tập trung vào kỹ năng giao tiếp thực tế trong cuộc sống hàng ngày. Phù hợp cho người muốn sử dụng tiếng Trung khi du lịch, mua sắm, ăn uống và giao lưu bạn bè.",
      image: "https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "Giao tiếp",
      badgeText: "Thực tế",
      badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
      vocabularyCount: 800,
      grammarCount: 60,
      lessonCount: 20,
      lectures: 20,
      durationHours: 50,
      categoryId: communicationCategory.id,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2024-04-01"),
      viewCount: 420,
      enrollmentCount: 89,
      metaTitle: "Tiếng Trung Giao tiếp Thực tế - Du lịch & Cuộc sống",
      metaDescription: "Học giao tiếp tiếng Trung thực tế cho du lịch, mua sắm. 800 từ vựng, 60 tình huống thường gặp.",
      keywords: "tiếng Trung giao tiếp, học giao tiếp tiếng Trung, tiếng Trung du lịch, tiếng Trung thực tế",
      ogImage: "https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=1200&h=630&fit=crop&q=80",
    },
    // Business Chinese Course
    {
      title: "Tiếng Trung Thương mại Chuyên nghiệp",
      slug: "tieng-trung-thuong-mai-chuyen-nghiep",
      description: "Khóa học tiếng Trung chuyên ngành kinh doanh. Học từ vựng, mẫu câu và kỹ năng giao tiếp trong môi trường văn phòng, đàm phán thương mại, viết email chuyên nghiệp.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop&q=80",
      instructor: "Cô Trần Hồng Ngọc",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      level: "Thương mại",
      badgeText: "Chuyên nghiệp",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
      vocabularyCount: 1500,
      grammarCount: 100,
      lessonCount: 25,
      lectures: 25,
      durationHours: 70,
      categoryId: businessCategory.id,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2024-04-15"),
      viewCount: 350,
      enrollmentCount: 62,
      metaTitle: "Tiếng Trung Thương mại - Kinh doanh & Đàm phán",
      metaDescription: "Khóa học tiếng Trung thương mại chuyên nghiệp. 1500 từ vựng kinh doanh, email, đàm phán.",
      keywords: "tiếng Trung thương mại, tiếng Trung kinh doanh, học tiếng Trung văn phòng, tiếng Trung chuyên ngành",
      ogImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop&q=80",
    },
  ]

  await prisma.course.createMany({ data: coursesData })
  console.log(`✅ Created ${coursesData.length} courses`)

  // Get course IDs for lessons
  const courses = await prisma.course.findMany({
    where: { slug: { in: ["hsk-1", "hsk-2", "hsk-3", "hsk-4", "hsk-5", "hsk-6"] } },
    select: { id: true, slug: true }
  })

  const courseMap = Object.fromEntries(courses.map(c => [c.slug, c.id]))

  // ============= Lessons =============
  console.log("📝 Creating lessons...")

  // HSK 1 Lessons
  const hsk1Lessons = [
    { title: "Giới thiệu làm quen Tiếng Trung", titleChinese: "汉语入门", description: "Các nét và quy tắc viết trong tiếng Trung", order: 1, courseId: courseMap["hsk-1"], isLocked: false, progress: 75 },
    { title: "Xin chào", titleChinese: "你好", description: "Cách nói xin chào với từ 你好, Cách đếm số từ 1-99", order: 2, courseId: courseMap["hsk-1"], isLocked: false, progress: 75 },
    { title: "Tiếng Trung không khó lắm", titleChinese: "汉语不太难", description: "Từ vựng về các thành viên trong gia đình, Cấu trúc câu 不太 + ADJ", order: 3, courseId: courseMap["hsk-1"], isLocked: false, progress: 60 },
    { title: "Hẹn ngày mai gặp lại", titleChinese: "明天见", description: "Từ vựng về các ngôn ngữ, Hỏi đáp đi đâu làm gì", order: 4, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Học nghe nói bài 1, 2, 3", titleChinese: "", description: "Nắm được cách phân biệt của các vận mẫu và thanh mẫu", order: 5, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Bạn đi đâu?", titleChinese: "你去哪儿？", description: "Hỏi đáp đi đâu với chữ 哪儿, Hỏi đáp về thứ trong tuần", order: 6, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Đây là thầy Vương", titleChinese: "这是王老师", description: "Hỏi đáp về công việc, sức khỏe, Cách nói lời cảm ơn", order: 7, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Tôi học tiếng Trung", titleChinese: "我学汉语", description: "Hỏi đáp về họ tên, quốc gia, Hỏi đáp với từ 什么", order: 8, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Bạn ăn gì?", titleChinese: "你吃什么？", description: "Từ vựng về các món ăn, Hỏi đáp về ăn uống", order: 9, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Một cân táo bao nhiêu tiền?", titleChinese: "一斤苹果多少钱？", description: "Từ vựng về hoa quả, Cách hỏi về số lượng", order: 10, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Bạn sống ở đâu?", titleChinese: "你住在哪儿？", description: "Hỏi đáp về nơi sống, Cách hỏi đáp về số điện thoại", order: 11, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Chúng tôi đều là du học sinh", titleChinese: "我们都是留学生", description: "Cách giới thiệu về bản thân, Cách dùng của chữ 都 và 也", order: 12, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA GIỮA KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp kiến thức các bài đã học", order: 13, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Đây có phải là thuốc bắc không?", titleChinese: "这是中药吗？", description: "Từ vựng về các đồ vật cơ bản, Làm quen với lượng từ", order: 14, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Xe của bạn là cái mới hay cũ?", titleChinese: "你的车是新的还是旧的？", description: "Từ vựng về các loại xe và động từ đi kèm", order: 15, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Công ty có bao nhiêu nhân viên?", titleChinese: "公司有多少员工？", description: "Từ vựng về nghề nghiệp, Cách nói về sự ước lượng", order: 16, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA CUỐI KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp toàn bộ kiến thức HSK 1", order: 17, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "ÔN TẬP TỔNG HỢP", titleChinese: "", description: "Ôn tập và củng cố toàn bộ kiến thức HSK 1", order: 18, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
  ]

  // HSK 2 Lessons
  const hsk2Lessons = [
    { title: "Ôn tập HSK 1", titleChinese: "复习 HSK 1", description: "Ôn tập lại kiến thức HSK 1", order: 1, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Bây giờ mấy giờ rồi?", titleChinese: "现在几点了？", description: "Học cách hỏi và trả lời về thời gian", order: 2, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Hôm nay thứ mấy?", titleChinese: "今天星期几？", description: "Từ vựng về ngày trong tuần, tháng trong năm", order: 3, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Thời tiết hôm nay thế nào?", titleChinese: "今天天气怎么样？", description: "Từ vựng về thời tiết, Cách mô tả thời tiết", order: 4, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Tôi muốn uống cà phê", titleChinese: "我想喝咖啡", description: "Cấu trúc 想 + động từ, Từ vựng về đồ uống", order: 5, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Đi mua sắm", titleChinese: "去购物", description: "Từ vựng về mua sắm, Cách hỏi giá và mặc cả", order: 6, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Gia đình tôi có 4 người", titleChinese: "我家有四口人", description: "Từ vựng về thành viên gia đình", order: 7, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Sở thích của tôi", titleChinese: "我的爱好", description: "Từ vựng về sở thích, hoạt động giải trí", order: 8, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA GIỮA KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp kiến thức nửa đầu khóa học", order: 9, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Đi bệnh viện", titleChinese: "去医院", description: "Từ vựng về sức khỏe và bệnh viện", order: 10, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Phương tiện giao thông", titleChinese: "交通工具", description: "Từ vựng về các loại xe và phương tiện", order: 11, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Đi du lịch", titleChinese: "去旅游", description: "Từ vựng về du lịch, khách sạn", order: 12, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Học ở thư viện", titleChinese: "在图书馆学习", description: "Từ vựng về học tập, thư viện", order: 13, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Cuối tuần làm gì?", titleChinese: "周末做什么？", description: "Từ vựng về hoạt động cuối tuần", order: 14, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA CUỐI KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp toàn bộ khóa học HSK 2", order: 15, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "ÔN TẬP TỔNG HỢP", titleChinese: "", description: "Ôn tập và củng cố toàn bộ kiến thức HSK 2", order: 16, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
  ]

  // HSK 3 Lessons
  const hsk3Lessons = [
    { title: "Ôn tập HSK 2", titleChinese: "复习 HSK 2", description: "Ôn tập lại kiến thức HSK 2", order: 1, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi thích uống trà", titleChinese: "我喜欢喝茶", description: "Cách diễn đạt sở thích với 喜欢, Từ vựng về đồ uống", order: 2, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Căn hộ này bao nhiêu tiền một tháng?", titleChinese: "这套公寓一个月多少钱？", description: "Từ vựng về thuê nhà, Cách hỏi về giá thuê", order: 3, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Bạn có thể giúp tôi không?", titleChinese: "你能帮我吗？", description: "Cách yêu cầu giúp đỡ với 能, 可以, Từ vựng về nhờ vả", order: 4, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi đang học tiếng Trung", titleChinese: "我正在学汉语", description: "Cấu trúc đang làm gì với 正在, Thể tiếp diễn", order: 5, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Chúng ta đi ăn nhà hàng nhé", titleChinese: "我们去饭店吃饭吧", description: "Từ vựng về nhà hàng, Cách rủ rê với 吧", order: 6, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi đã từng đến Trung Quốc", titleChinese: "我去过中国", description: "Cấu trúc kinh nghiệm với 过, Từ vựng về du lịch", order: 7, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Thời tiết mùa xuân rất đẹp", titleChinese: "春天的天气很好", description: "Từ vựng về 4 mùa, Cách mô tả thời tiết", order: 8, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi sẽ đi du lịch vào tháng sau", titleChinese: "下个月我要去旅游", description: "Thì tương lai với 要, 会, 将, Kế hoạch tương lai", order: 9, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA GIỮA KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp kiến thức nửa đầu khóa học", order: 10, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi đã làm xong bài tập", titleChinese: "我做完作业了", description: "Cấu trúc hoàn thành với 完, 好, Từ vựng về học tập", order: 11, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Càng học càng thấy hay", titleChinese: "越学越有意思", description: "Cấu trúc 越...越..., So sánh và đối chiếu", order: 12, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Nếu trời mưa thì không đi", titleChinese: "如果下雨就不去", description: "Câu điều kiện với 如果...就..., Từ vựng về thời tiết", order: 13, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi vừa học vừa làm", titleChinese: "我一边学习一边工作", description: "Cấu trúc 一边...一边..., Hoạt động đồng thời", order: 14, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi bị ốm rồi", titleChinese: "我生病了", description: "Từ vựng về bệnh tật, Cách diễn đạt trạng thái", order: 15, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "So với năm ngoái, tôi tiến bộ nhiều", titleChinese: "跟去年相比，我进步了很多", description: "So sánh với 比, 跟...相比, Từ vựng về tiến bộ", order: 16, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi bị người ta chê", titleChinese: "我被人批评了", description: "Câu bị động với 被, Từ vựng về cảm xúc", order: 17, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Luyện thi HSK 3 tổng hợp", titleChinese: "HSK 3 综合练习", description: "Luyện đề và kỹ năng làm bài thi HSK 3", order: 18, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA CUỐI KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp toàn bộ khóa học HSK 3", order: 19, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "ÔN TẬP TỔNG HỢP", titleChinese: "", description: "Ôn tập và củng cố toàn bộ kiến thức HSK 3", order: 20, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
  ]

  // HSK 4 Lessons
  const hsk4Lessons = [
    { title: "Ôn tập HSK 3", titleChinese: "复习 HSK 3", description: "Ôn tập lại kiến thức HSK 3", order: 1, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Tôi đang chuẩn bị đi du học", titleChinese: "我准备去留学", description: "Từ vựng về du học, Cách diễn đạt kế hoạch", order: 2, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Dù khó khăn cũng phải cố gắng", titleChinese: "尽管困难也要努力", description: "Cấu trúc nhượng bộ với 尽管...也..., 虽然...但是...", order: 3, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Thành công là nhờ nỗ lực", titleChinese: "成功是因为努力", description: "Cấu trúc nhân quả với 因为...所以..., 由于", order: 4, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Tôi sắp tốt nghiệp rồi", titleChinese: "我快毕业了", description: "Từ vựng về tốt nghiệp, Cấu trúc sắp sửa với 快...了", order: 5, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Văn hóa Trung Quốc rất phong phú", titleChinese: "中国文化很丰富", description: "Từ vựng về văn hóa, Cách diễn đạt đặc điểm", order: 6, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Chỉ cần có ý chí là được", titleChinese: "只要有意志就行", description: "Cấu trúc 只要...就..., Điều kiện đủ", order: 7, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Bất kể ai cũng thích du lịch", titleChinese: "无论谁都喜欢旅游", description: "Cấu trúc 无论...都..., 不管...也...", order: 8, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Tôi không những học tiếng Trung mà còn học văn hóa", titleChinese: "我不但学汉语而且学文化", description: "Cấu trúc 不但...而且..., Diễn đạt bổ sung", order: 9, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Với tư cách là sinh viên", titleChinese: "作为学生", description: "Từ vựng về vai trò, Cách dùng 作为", order: 10, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA GIỮA KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp kiến thức nửa đầu khóa học", order: 11, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Theo ý kiến tôi", titleChinese: "依我看", description: "Cách bày tỏ quan điểm, Từ vựng về ý kiến", order: 12, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Về vấn đề môi trường", titleChinese: "关于环境问题", description: "Từ vựng về môi trường, Cách thảo luận vấn đề", order: 13, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Đối với vấn đề này", titleChinese: "对于这个问题", description: "Cách sử dụng 对于, 关于, Phân tích vấn đề", order: 14, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Dựa vào kinh nghiệm", titleChinese: "根据经验", description: "Từ vựng về kinh nghiệm, Cách dùng 根据", order: 15, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Phát triển kinh tế", titleChinese: "发展经济", description: "Từ vựng về kinh tế, Xu hướng phát triển", order: 16, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Xã hội hiện đại", titleChinese: "现代社会", description: "Từ vựng về xã hội, Vấn đề xã hội", order: 17, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Quan hệ quốc tế", titleChinese: "国际关系", description: "Từ vựng về chính trị quốc tế, Quan hệ ngoại giao", order: 18, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Luyện thi HSK 4 tổng hợp", titleChinese: "HSK 4 综合练习", description: "Luyện đề và kỹ năng làm bài thi HSK 4", order: 19, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Kỹ năng đọc hiểu nâng cao", titleChinese: "高级阅读技巧", description: "Luyện kỹ năng đọc hiểu cho HSK 4", order: 20, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA CUỐI KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp toàn bộ khóa học HSK 4", order: 21, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "ÔN TẬP TỔNG HỢP", titleChinese: "", description: "Ôn tập và củng cố toàn bộ kiến thức HSK 4", order: 22, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
  ]

  // HSK 5 Lessons
  const hsk5Lessons = [
    { title: "Ôn tập HSK 4", titleChinese: "复习 HSK 4", description: "Ôn tập lại kiến thức HSK 4", order: 1, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Phân tích hiện tượng xã hội", titleChinese: "分析社会现象", description: "Từ vựng học thuật, Kỹ năng phân tích", order: 2, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Đọc báo hiểu tin tức", titleChinese: "读报了解新闻", description: "Từ vựng báo chí, Kỹ năng đọc báo", order: 3, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Văn học Trung Quốc", titleChinese: "中国文学", description: "Từ vựng văn học, Tác phẩm kinh điển", order: 4, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Lịch sử và truyền thống", titleChinese: "历史与传统", description: "Từ vựng lịch sử, Văn hóa truyền thống", order: 5, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Khoa học công nghệ", titleChinese: "科学技术", description: "Từ vựng khoa học, Công nghệ hiện đại", order: 6, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Giáo dục và đào tạo", titleChinese: "教育培训", description: "Từ vựng giáo dục, Hệ thống giáo dục", order: 7, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Kinh tế thị trường", titleChinese: "市场经济", description: "Từ vựng kinh tế, Thương mại quốc tế", order: 8, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Môi trường và bảo vệ", titleChinese: "环境保护", description: "Từ vựng môi trường, Phát triển bền vững", order: 9, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Văn hóa ẩm thực", titleChinese: "饮食文化", description: "Từ vựng ẩm thực, Đặc sản vùng miền", order: 10, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA GIỮA KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp kiến thức nửa đầu khóa học", order: 11, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Nghệ thuật và thẩm mỹ", titleChinese: "艺术与审美", description: "Từ vựng nghệ thuật, Giá trị thẩm mỹ", order: 12, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Y học và sức khỏe", titleChinese: "医疗健康", description: "Từ vựng y tế, Chăm sóc sức khỏe", order: 13, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Truyền thông đại chúng", titleChinese: "大众传媒", description: "Từ vựng truyền thông, Mạng xã hội", order: 14, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Quan hệ nhân sự", titleChinese: "人际关系", description: "Từ vựng giao tiếp, Văn hóa ứng xử", order: 15, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Du lịch và văn hóa", titleChinese: "旅游文化", description: "Từ vựng du lịch, Điểm đến nổi tiếng", order: 16, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Thể thao và giải trí", titleChinese: "体育娱乐", description: "Từ vựng thể thao, Hoạt động giải trí", order: 17, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Khởi nghiệp và đổi mới", titleChinese: "创业创新", description: "Từ vựng kinh doanh, Tinh thần đổi mới", order: 18, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Đô thị hóa", titleChinese: "城市化", description: "Từ vựng đô thị, Phát triển đô thị", order: 19, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Luyện thi HSK 5 tổng hợp", titleChinese: "HSK 5 综合练习", description: "Luyện đề và kỹ năng làm bài thi HSK 5", order: 20, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Kỹ năng viết luận", titleChinese: "写作技巧", description: "Luyện kỹ năng viết bài luận HSK 5", order: 21, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA CUỐI KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp toàn bộ khóa học HSK 5", order: 22, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "ÔN TẬP TỔNG HỢP", titleChinese: "", description: "Ôn tập và củng cố toàn bộ kiến thức HSK 5", order: 23, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Thi thử HSK 5", titleChinese: "HSK 5 模拟考试", description: "Thi thử toàn bộ bài thi HSK 5", order: 24, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
  ]

  // HSK 6 Lessons
  const hsk6Lessons = [
    { title: "Ôn tập HSK 5", titleChinese: "复习 HSK 5", description: "Ôn tập lại kiến thức HSK 5", order: 1, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Triết học Trung Quốc cổ đại", titleChinese: "中国古代哲学", description: "Tư tưởng Nho giáo, Đạo giáo, Phật giáo", order: 2, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Văn học kinh điển", titleChinese: "经典文学", description: "Tứ đại danh tác, Thơ Đường Tống", order: 3, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Thành ngữ và điển cố", titleChinese: "成语典故", description: "Thành ngữ Trung Quốc, Nguồn gốc điển cố", order: 4, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Chính trị đương đại", titleChinese: "当代政治", description: "Hệ thống chính trị, Chính sách đối ngoại", order: 5, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Kinh tế toàn cầu hóa", titleChinese: "经济全球化", description: "Xu hướng toàn cầu hóa, Hợp tác quốc tế", order: 6, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Khoa học và nhân văn", titleChinese: "科学与人文", description: "Mối quan hệ khoa học - nhân văn", order: 7, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Nghệ thuật đương đại", titleChinese: "当代艺术", description: "Hội họa, điêu khắc, kiến trúc hiện đại", order: 8, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Điện ảnh và văn hóa đại chúng", titleChinese: "电影与大众文化", description: "Điện ảnh Trung Quốc, Văn hóa đại chúng", order: 9, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Giáo dục và phát triển", titleChinese: "教育与发展", description: "Cải cách giáo dục, Phát triển nhân lực", order: 10, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Môi trường sinh thái", titleChinese: "生态环境", description: "Bảo vệ môi trường, Phát triển xanh", order: 11, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA GIỮA KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp kiến thức nửa đầu khóa học", order: 12, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Tâm lý học xã hội", titleChinese: "社会心理学", description: "Hành vi xã hội, Tâm lý đám đông", order: 13, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Đổi mới sáng tạo", titleChinese: "创新创造", description: "Tinh thần đổi mới, Sáng tạo công nghệ", order: 14, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Pháp luật và đạo đức", titleChinese: "法律与道德", description: "Hệ thống pháp luật, Đạo đức xã hội", order: 15, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Văn hóa doanh nghiệp", titleChinese: "企业文化", description: "Quản trị doanh nghiệp, Văn hóa tổ chức", order: 16, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Quan hệ quốc tế", titleChinese: "国际关系", description: "Ngoại giao đa phương, Hợp tác khu vực", order: 17, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Chủ nghĩa nhân văn", titleChinese: "人文主义", description: "Giá trị nhân văn, Phát triển con người", order: 18, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Khoa học công nghệ tiên tiến", titleChinese: "前沿科技", description: "AI, Sinh học, Vật lý lượng tử", order: 19, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Lịch sử văn minh", titleChinese: "文明史", description: "Văn minh Trung Hoa, Giao lưu văn hóa", order: 20, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Luyện thi HSK 6 tổng hợp", titleChinese: "HSK 6 综合练习", description: "Luyện đề và kỹ năng làm bài thi HSK 6", order: 21, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Kỹ năng đọc hiểu chuyên sâu", titleChinese: "深度阅读技巧", description: "Đọc hiểu văn bản phức tạp, phân tích sâu", order: 22, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Kỹ năng viết luận nâng cao", titleChinese: "高级写作技巧", description: "Viết luận học thuật, Nghị luận chuyên sâu", order: 23, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "KIỂM TRA CUỐI KHÓA", titleChinese: "", description: "Kiểm tra tổng hợp toàn bộ khóa học HSK 6", order: 24, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "ÔN TẬP TỔNG HỢP", titleChinese: "", description: "Ôn tập và củng cố toàn bộ kiến thức HSK 6", order: 25, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Thi thử HSK 6", titleChinese: "HSK 6 模拟考试", description: "Thi thử toàn bộ bài thi HSK 6", order: 26, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
  ]

  const allLessons = [
    ...hsk1Lessons,
    ...hsk2Lessons,
    ...hsk3Lessons,
    ...hsk4Lessons,
    ...hsk5Lessons,
    ...hsk6Lessons,
  ]

  await prisma.lesson.createMany({ data: allLessons })
  console.log(`✅ Created ${allLessons.length} lessons`)

  // ============= Hero Slides =============
  console.log("🖼️  Creating hero slides...")
  await prisma.heroSlide.createMany({
    data: [
      {
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop&q=80",
        badge: "Khai giảng tháng 2/2026",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
        title: "Chinh Phục HSK 1-6 Cùng Chúng Tôi",
        description: "Lộ trình học tiếng Trung bài bản từ cơ bản đến nâng cao. Giáo viên giàu kinh nghiệm, phương pháp giảng dạy hiện đại.",
        primaryCtaText: "Đăng ký ngay",
        primaryCtaHref: "/courses",
        secondaryCtaText: "Xem khóa học",
        secondaryCtaHref: "/courses",
        overlayGradient: "bg-gradient-to-r from-black/60 to-black/30",
        order: 1,
        isActive: true,
      },
      {
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop&q=80",
        badge: "Ưu đãi đặc biệt",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        title: "Học Tiếng Trung Giao Tiếp Thực Tế",
        description: "Tập trung vào kỹ năng giao tiếp, phát âm chuẩn. Áp dụng ngay vào cuộc sống và công việc.",
        primaryCtaText: "Tìm hiểu thêm",
        primaryCtaHref: "/about",
        secondaryCtaText: "Liên hệ",
        secondaryCtaHref: "/contact",
        overlayGradient: "bg-gradient-to-r from-black/50 to-transparent",
        order: 2,
        isActive: true,
      },
      {
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1920&h=1080&fit=crop&q=80",
        badge: "Chương trình mới",
        badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
        title: "Tiếng Trung Thương Mại Chuyên Nghiệp",
        description: "Nâng cao kỹ năng tiếng Trung trong môi trường kinh doanh. Từ vựng chuyên ngành, đàm phán, viết email.",
        primaryCtaText: "Khám phá ngay",
        primaryCtaHref: "/courses/tieng-trung-thuong-mai-chuyen-nghiep",
        secondaryCtaText: "Xem chi tiết",
        secondaryCtaHref: "/about",
        overlayGradient: "bg-gradient-to-br from-black/70 via-black/40 to-transparent",
        order: 3,
        isActive: true,
      },
    ],
  })
  console.log("✅ Created 3 hero slides")

  // ============= Features (Why Choose Us) =============
  console.log("✨ Creating features...")
  await prisma.feature.createMany({
    data: [
      {
        icon: "school",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-600 dark:text-orange-400",
        title: "Giáo viên giàu kinh nghiệm",
        description: "Đội ngũ giảng viên bản ngữ và Việt Nam với nhiều năm kinh nghiệm giảng dạy tiếng Trung.",
        order: 1,
        isActive: true,
      },
      {
        icon: "auto_stories",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        title: "Giáo trình chuẩn quốc tế",
        description: "Sử dụng giáo trình HSK chính thống, cập nhật theo chuẩn mới nhất của Hanban.",
        order: 2,
        isActive: true,
      },
      {
        icon: "groups",
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        title: "Lớp học nhỏ, tương tác cao",
        description: "Lớp học tối đa 15 học viên, đảm bảo giáo viên chăm sóc từng học viên.",
        order: 3,
        isActive: true,
      },
      {
        icon: "workspace_premium",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        title: "Cam kết đầu ra",
        description: "Cam kết đạt chứng chỉ HSK hoặc học lại miễn phí 100%.",
        order: 4,
        isActive: true,
      },
    ],
  })
  console.log("✅ Created 4 features")

  // ============= CTA Stats =============
  console.log("📈 Creating CTA stats...")
  await prisma.ctaStat.createMany({
    data: [
      { value: 500, suffix: "+", label: "Học viên", order: 1, isActive: true },
      { value: 95, suffix: "%", label: "Tỷ lệ đỗ HSK", order: 2, isActive: true },
      { value: 5, suffix: " năm", label: "Kinh nghiệm", order: 4, isActive: true },
    ],
  })
  console.log("✅ Created 4 CTA stats")

  // ============= Photo Albums =============
  console.log("📸 Creating photo albums...")
  const albums = await prisma.album.createManyAndReturn({
    data: [
      {
        title: "Hoạt động lớp học",
        description: "Hình ảnh các buổi học sinh động tại trung tâm",
        thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&q=80",
        photoCount: 8,
        order: 1,
        isActive: true,
      },
      {
        title: "Sự kiện văn hóa",
        description: "Các hoạt động văn hóa Trung Quốc tại trung tâm",
        thumbnail: "https://images.unsplash.com/photo-1528991435120-e73e05a58897?w=400&h=300&fit=crop&q=80",
        photoCount: 6,
        order: 2,
        isActive: true,
      },
      {
        title: "Lễ tốt nghiệp",
        description: "Những khoảnh khắc đáng nhớ trong lễ tốt nghiệp",
        thumbnail: "https://alfbzgjpjvrcfaxxvijl.supabase.co/storage/v1/object/sign/slides/ChatGPT%20Image%20Jan%2022,%202026,%2001_07_42%20PM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mMmYzNzRkNy05YWRkLTQ3NWMtYTQ0Yi05ZWNlNDRmZDUwMWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzbGlkZXMvQ2hhdEdQVCBJbWFnZSBKYW4gMjIsIDIwMjYsIDAxXzA3XzQyIFBNLnBuZyIsImlhdCI6MTc2OTA3MjAyMCwiZXhwIjoxODAwNjA4MDIwfQ.RbwyQMQcIxMTCv1nHAjr0IrSNgEjqGsGu_QOICbZpfU",
        photoCount: 5,
        order: 3,
        isActive: true,
      },
    ],
  })
  console.log(`✅ Created ${albums.length} albums`)

  // Album 1: Hoạt động lớp học
  const album1Photos = Array.from({ length: 8 }, (_, i) => ({
    albumId: albums[0].id,
    url: `https://images.unsplash.com/photo-${1516979187457 + i * 1000}-${i}?w=1200&h=800&fit=crop&q=80`,
    title: `Hoạt động lớp học ${i + 1}`,
    description: `Học viên tham gia hoạt động học tập`,
    order: i + 1,
  }))

  // Album 2: Sự kiện văn hóa
  const album2Photos = Array.from({ length: 6 }, (_, i) => ({
    albumId: albums[1].id,
    url: `https://images.unsplash.com/photo-${1528991435120 + i * 1000}-${i}?w=1200&h=800&fit=crop&q=80`,
    title: `Sự kiện văn hóa ${i + 1}`,
    description: `Hoạt động văn hóa Trung Quốc`,
    order: i + 1,
  }))

  // Album 3: Lễ tốt nghiệp
  const album3Photos = Array.from({ length: 5 }, (_, i) => ({
    albumId: albums[2].id,
    url: `https://images.unsplash.com/photo-${1523580494863 + i * 1000}-${i}?w=1200&h=800&fit=crop&q=80`,
    title: `Lễ tốt nghiệp ${i + 1}`,
    description: `Khoảnh khắc tốt nghiệp đáng nhớ`,
    order: i + 1,
  }))

  await prisma.photo.createMany({ data: [...album1Photos, ...album2Photos, ...album3Photos] })
  console.log("✅ Created 19 photos")

  // ============= Reviews =============
  console.log("⭐ Creating reviews...")
  await prisma.review.createMany({
    data: [
      {
        studentName: "Nguyễn Văn An",
        className: "HSK 4",
        content: "Lớp học rất chất lượng, giáo viên nhiệt tình. Mình đã đạt HSK 4 sau 6 tháng học.",
        rating: 5,
        isApproved: true,
      },
      {
        studentName: "Trần Thị Bình",
        className: "HSK 3",
        content: "Giáo trình rõ ràng, dễ hiểu. Lớp học nhỏ nên được thầy cô chăm sóc kỹ lưỡng.",
        rating: 5,
        isApproved: true,
      },
      {
        studentName: "Lê Minh Cường",
        className: "HSK 5",
        content: "Môi trường học tập chuyên nghiệp, giáo viên giàu kinh nghiệm. Rất hài lòng với khóa học.",
        rating: 5,
        isApproved: true,
      },
      {
        studentName: "Phạm Thu Duyên",
        className: "Giao tiếp",
        content: "Khóa giao tiếp rất thực tế, áp dụng được ngay vào công việc. Cảm ơn thầy cô!",
        rating: 5,
        isApproved: true,
      },
      {
        studentName: "Hoàng Văn Em",
        className: "HSK 2",
        content: "Mình mới học HSK 2 nhưng đã tiến bộ rất nhiều. Thầy cô dạy dễ hiểu, vui vẻ.",
        rating: 4,
        isApproved: true,
      },
    ],
  })
  console.log("✅ Created 5 reviews")

  // ============= Page Metadata =============
  console.log("📄 Creating page metadata...")
  await prisma.pageMetadata.createMany({
    data: [
      {
        pagePath: "/",
        pageName: "Trang chủ",
        title: "HSK Master - Trung tâm tiếng Trung uy tín tại Hà Nội | Luyện thi HSK 1-6",
        description: "Trung tâm tiếng Trung HSK Master - Đào tạo HSK 1-6, giao tiếp, thương mại. Giáo viên 8+ năm kinh nghiệm. Cam kết đầu ra. Học thử miễn phí.",
        keywords: "học tiếng Trung, HSK, trung tâm tiếng Trung Hà Nội, luyện thi HSK, học tiếng Trung online",
        ogTitle: "HSK Master - Trung tâm tiếng Trung uy tín #1 Hà Nội",
        ogDescription: "Học tiếng Trung chất lượng cao với HSK Master. Lộ trình cá nhân hóa, giáo viên giàu kinh nghiệm, cam kết đầu ra.",
        ogImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=630&fit=crop&q=80",
        twitterTitle: "HSK Master - Học tiếng Trung chuyên nghiệp",
        twitterDescription: "Trung tâm tiếng Trung hàng đầu Hà Nội. Đào tạo HSK 1-6, cam kết đầu ra.",
        twitterImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=630&fit=crop&q=80",
      },
      {
        pagePath: "/about",
        pageName: "Giới thiệu",
        title: "Giới thiệu HSK Master - Trung tâm tiếng Trung chuẩn quốc tế Hà Nội",
        description: "Tìm hiểu về HSK Master - Trung tâm tiếng Trung chuyên nghiệp với đội ngũ giáo viên 8+ năm kinh nghiệm. Phương pháp giảng dạy hiện đại, cam kết chất lượng.",
        keywords: "giới thiệu HSK Master, trung tâm tiếng Trung uy tín, giáo viên tiếng Trung giỏi, học tiếng Trung Hà Nội",
        ogTitle: "Về HSK Master - Đào tạo tiếng Trung chuyên nghiệp",
        ogDescription: "Giáo viên giàu kinh nghiệm, phương pháp giảng dạy hiện đại, môi trường học tập chuyên nghiệp.",
        ogImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop&q=80",
      },
      {
        pagePath: "/contact",
        pageName: "Liên hệ",
        title: "Liên hệ HSK Master - Tư vấn khóa học tiếng Trung miễn phí | Hotline 0965322136",
        description: "Liên hệ HSK Master để được tư vấn lộ trình học tiếng Trung phù hợp. Hotline: 0965322136. Địa chỉ: Hà Nội. Tư vấn miễn phí, học thử 2 buổi.",
        keywords: "liên hệ HSK Master, tư vấn học tiếng Trung, đăng ký học HSK, hotline tiếng Trung Hà Nội",
        ogTitle: "Liên hệ tư vấn khóa học tiếng Trung",
        ogDescription: "Đăng ký tư vấn miễn phí và học thử. Hotline: 0965322136",
        ogImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&q=80",
      },
      {
        pagePath: "/courses",
        pageName: "Danh sách khóa học",
        title: "Khóa học tiếng Trung - HSK 1-6, Giao tiếp, Thương mại | HSK Master",
        description: "Khám phá các khóa học tiếng Trung chất lượng cao tại HSK Master: HSK 1-6, Giao tiếp thực tế, Thương mại. Lộ trình cá nhân hóa, cam kết đầu ra.",
        keywords: "khóa học tiếng Trung, học HSK online, tiếng Trung giao tiếp, tiếng Trung thương mại, khóa học HSK",
        ogTitle: "Danh sách khóa học tiếng Trung chất lượng cao",
        ogDescription: "HSK 1-6, Giao tiếp, Thương mại. Giáo viên giàu kinh nghiệm, lộ trình rõ ràng.",
        ogImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop&q=80",
      },
      {
        pagePath: "/vocabulary",
        pageName: "Từ vựng",
        title: "Từ vựng tiếng Trung HSK - Học từ vựng theo cấp độ | HSK Master",
        description: "Kho từ vựng tiếng Trung HSK đầy đủ từ HSK 1-6. Có phiên âm, nghĩa, ví dụ. Học từ vựng hiệu quả, nhớ lâu.",
        keywords: "từ vựng HSK, học từ vựng tiếng Trung, từ vựng HSK 1-6, từ điển tiếng Trung",
        ogTitle: "Kho từ vựng tiếng Trung HSK đầy đủ",
        ogDescription: "Từ vựng HSK 1-6 với phiên âm, nghĩa, ví dụ. Miễn phí.",
        ogImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=630&fit=crop&q=80",
      },
    ],
  })
  console.log("✅ Created page metadata")

  console.log("\n🎉 Seeding completed successfully!")
  console.log("=".repeat(50))
  console.log(`📊 Summary:`)
  console.log(`   - Categories: ${categories.length}`)
  console.log(`   - Courses: ${coursesData.length}`)
  console.log(`   - Lessons: ${allLessons.length}`)
  console.log(`   - Hero Slides: 3`)
  console.log(`   - HSK Levels: 6`)
  console.log(`   - Features: 4`)
  console.log(`   - CTA Stats: 4`)
  console.log(`   - Albums: ${albums.length}`)
  console.log(`   - Photos: 19`)
  console.log(`   - Reviews: 5`)
  console.log("=".repeat(50))

  // Seed portal data
  await seedPortal()
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
