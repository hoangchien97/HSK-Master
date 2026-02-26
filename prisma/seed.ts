import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { seedPortal } from './seed-portal'
import { seedVocabulary } from './seed-vocabulary'
import { generateSlug } from '@/utils/slug'

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
      lessonCount: 15,
      duration: "6–8 tuần",
      targetAudience: "Người mới bắt đầu",
      targetIcon: "school",
      accentColor: "orange",
      bgGradient: "from-orange-50 to-orange-100/50",
      href: "/courses/hsk-1",
      order: 1,
      metaTitle: "HSK 1 – Tiếng Trung cho người mới bắt đầu | Ruby HSK",
      metaDescription: "Lộ trình HSK 1: 15 bài học, 150 từ vựng, hoàn thành trong 6–8 tuần. Phù hợp người chưa biết tiếng Trung.",
      keywords: "HSK 1, học tiếng Trung cơ bản, lộ trình HSK 1, tiếng Trung sơ cấp, HSK 1 online",
    },
    {
      level: 2,
      title: "HSK 2",
      badge: "Sơ cấp",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      description: "Giao tiếp cơ bản trong cuộc sống hàng ngày. Nâng cao kỹ năng giao tiếp, mở rộng từ vựng và mẫu câu thông dụng.",
      vocabularyCount: "300 từ",
      lessonCount: 15,
      duration: "8–10 tuần",
      targetAudience: "Người có nền tảng cơ bản",
      targetIcon: "chat",
      accentColor: "orange",
      bgGradient: "from-orange-50 to-orange-100/50",
      href: "/courses/hsk-2",
      order: 2,
      metaTitle: "HSK 2 – Giao tiếp tiếng Trung cơ bản | Ruby HSK",
      metaDescription: "Lộ trình HSK 2: 15 bài học, 300 từ vựng, hoàn thành trong 8–10 tuần. Giao tiếp tự tin trong cuộc sống hàng ngày.",
      keywords: "HSK 2, giao tiếp tiếng Trung, lộ trình HSK 2, tiếng Trung cơ bản, học HSK 2 online",
    },
    {
      level: 3,
      title: "HSK 3",
      badge: "Trung cấp",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      description: "Bước vào giao tiếp nâng cao. Giao tiếp và viết thành thạo hơn trong các tình huống thường gặp.",
      vocabularyCount: "600 từ",
      lessonCount: 20,
      duration: "10–12 tuần",
      targetAudience: "Người có nền tảng vững",
      targetIcon: "trending_up",
      accentColor: "red",
      bgGradient: "from-red-50 to-red-100/50",
      href: "/courses/hsk-3",
      order: 3,
      metaTitle: "HSK 3 – Tiếng Trung trung cấp | Ruby HSK",
      metaDescription: "Lộ trình HSK 3: 20 bài học, 600 từ vựng, hoàn thành trong 10–12 tuần. Giao tiếp tự tin trong nhiều tình huống.",
      keywords: "HSK 3, tiếng Trung trung cấp, lộ trình HSK 3, luyện thi HSK 3, học HSK 3 Hà Nội",
    },
    {
      level: 4,
      title: "HSK 4",
      badge: "Trung cấp",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      description: "Sẵn sàng cho môi trường du học và làm việc. Giao tiếp tự tin trong các tình huống phức tạp.",
      vocabularyCount: "1.200 từ",
      lessonCount: 20,
      duration: "3–4 tháng",
      targetAudience: "Người chuẩn bị du học/làm việc",
      targetIcon: "work",
      accentColor: "red",
      bgGradient: "from-red-50 to-red-100/50",
      href: "/courses/hsk-4",
      order: 4,
      metaTitle: "HSK 4 – Du học & Làm việc tại Trung Quốc | Ruby HSK",
      metaDescription: "Lộ trình HSK 4: 20 bài học, 1.200 từ vựng, hoàn thành trong 3–4 tháng. Luyện đề chuyên sâu, cam kết đầu ra.",
      keywords: "HSK 4, du học Trung Quốc, lộ trình HSK 4, luyện thi HSK 4, tiếng Trung du học",
    },
    {
      level: 5,
      title: "HSK 5",
      badge: "Cao cấp",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
      description: "Thành thạo giao tiếp chuyên sâu. Đọc báo, xem phim, giao tiếp trong môi trường chuyên nghiệp.",
      vocabularyCount: "2.500 từ",
      lessonCount: 25,
      duration: "4–5 tháng",
      targetAudience: "Người cần trình độ chuyên nghiệp",
      targetIcon: "business_center",
      accentColor: "indigo",
      bgGradient: "from-indigo-50 to-indigo-100/50",
      href: "/courses/hsk-5",
      order: 5,
      metaTitle: "HSK 5 – Tiếng Trung cao cấp chuyên nghiệp | Ruby HSK",
      metaDescription: "Lộ trình HSK 5: 25 bài học, 2.500 từ vựng, hoàn thành trong 4–5 tháng. Đọc báo, xem phim, giao tiếp chuyên nghiệp.",
      keywords: "HSK 5, tiếng Trung cao cấp, lộ trình HSK 5, luyện thi HSK 5, tiếng Trung chuyên nghiệp",
    },
    {
      level: 6,
      title: "HSK 6",
      badge: "Chuyên gia",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      description: "Đạt trình độ gần như người bản ngữ. Phân tích cấu trúc bài thi chuyên sâu, tăng tốc điểm số.",
      vocabularyCount: "5.000+ từ",
      lessonCount: 25,
      duration: "5–6 tháng",
      targetAudience: "Người cần trình độ chuyên gia",
      targetIcon: "emoji_events",
      accentColor: "blue",
      bgGradient: "from-blue-50 to-blue-100/50",
      href: "/courses/hsk-6",
      order: 6,
      metaTitle: "HSK 6 – Trình độ chuyên gia gần người bản ngữ | Ruby HSK",
      metaDescription: "Lộ trình HSK 6: 25 bài học, 5.000+ từ vựng, hoàn thành trong 5–6 tháng. Phân tích cấu trúc bài thi, tăng tốc điểm số.",
      keywords: "HSK 6, tiếng Trung chuyên gia, lộ trình HSK 6, luyện thi HSK 6, trình độ cao nhất HSK",
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
      level: "HSK 1",
      badgeText: "Mới bắt đầu",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      vocabularyCount: 150,
      grammarCount: 45,
      lessonCount: 15,
      lectures: 15,
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
      level: "HSK 2",
      badgeText: "Sơ cấp",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      vocabularyCount: 300,
      grammarCount: 60,
      lessonCount: 15,
      lectures: 15,
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
      level: "HSK 4",
      badgeText: "Du học/Làm việc",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      vocabularyCount: 1200,
      grammarCount: 120,
      lessonCount: 20,
      lectures: 20,
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
      level: "HSK 5",
      badgeText: "Cao cấp",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
      vocabularyCount: 2500,
      grammarCount: 150,
      lessonCount: 25,
      lectures: 25,
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
      level: "HSK 6",
      badgeText: "Chuyên gia",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      vocabularyCount: 5000,
      grammarCount: 200,
      lessonCount: 25,
      lectures: 25,
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
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
      instructorAvatar: "https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg",
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

  // HSK 1 Lessons (15 bài — HSK Standard Course)
  const hsk1Lessons = [
    { title: "Giới thiệu làm quen Tiếng Trung", titleChinese: "汉语入门", description: "Các nét và quy tắc viết trong tiếng Trung", order: 1, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Xin chào", titleChinese: "你好", description: "Cách nói xin chào với từ 你好, Cách đếm số từ 1-99", order: 2, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Tiếng Trung không khó lắm", titleChinese: "汉语不太难", description: "Từ vựng về các thành viên trong gia đình, Cấu trúc câu 不太 + ADJ", order: 3, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Hẹn ngày mai gặp lại", titleChinese: "明天见", description: "Từ vựng về các ngôn ngữ, Hỏi đáp đi đâu làm gì", order: 4, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Luyện nghe nói cơ bản", titleChinese: "听说练习", description: "Nắm được cách phân biệt của các vận mẫu và thanh mẫu", order: 5, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Bạn đi đâu?", titleChinese: "你去哪儿？", description: "Hỏi đáp đi đâu với chữ 哪儿, Hỏi đáp về thứ trong tuần", order: 6, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Đây là thầy Vương", titleChinese: "这是王老师", description: "Hỏi đáp về công việc, sức khỏe, Cách nói lời cảm ơn", order: 7, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Tôi học tiếng Trung", titleChinese: "我学汉语", description: "Hỏi đáp về họ tên, quốc gia, Hỏi đáp với từ 什么", order: 8, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Bạn ăn gì?", titleChinese: "你吃什么？", description: "Từ vựng về các món ăn, Hỏi đáp về ăn uống", order: 9, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Một cân táo bao nhiêu tiền?", titleChinese: "一斤苹果多少钱？", description: "Từ vựng về hoa quả, Cách hỏi về số lượng", order: 10, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Bạn sống ở đâu?", titleChinese: "你住在哪儿？", description: "Hỏi đáp về nơi sống, Cách hỏi đáp về số điện thoại", order: 11, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Chúng tôi đều là du học sinh", titleChinese: "我们都是留学生", description: "Cách giới thiệu về bản thân, Cách dùng của chữ 都 và 也", order: 12, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Đây có phải là thuốc bắc không?", titleChinese: "这是中药吗？", description: "Từ vựng về các đồ vật cơ bản, Làm quen với lượng từ", order: 13, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Xe của bạn là mới hay cũ?", titleChinese: "你的车是新的还是旧的？", description: "Từ vựng về các loại xe và động từ đi kèm", order: 14, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
    { title: "Công ty có bao nhiêu nhân viên?", titleChinese: "公司有多少员工？", description: "Từ vựng về nghề nghiệp, Cách nói về sự ước lượng", order: 15, courseId: courseMap["hsk-1"], isLocked: false, progress: 0 },
  ]

  // HSK 2 Lessons (15 bài — HSK Standard Course)
  const hsk2Lessons = [
    { title: "Ôn tập HSK 1", titleChinese: "复习 HSK 1", description: "Ôn tập lại kiến thức HSK 1", order: 1, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Bây giờ mấy giờ rồi?", titleChinese: "现在几点了？", description: "Học cách hỏi và trả lời về thời gian", order: 2, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Hôm nay thứ mấy?", titleChinese: "今天星期几？", description: "Từ vựng về ngày trong tuần, tháng trong năm", order: 3, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Thời tiết hôm nay thế nào?", titleChinese: "今天天气怎么样？", description: "Từ vựng về thời tiết, Cách mô tả thời tiết", order: 4, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Tôi muốn uống cà phê", titleChinese: "我想喝咖啡", description: "Cấu trúc 想 + động từ, Từ vựng về đồ uống", order: 5, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Đi mua sắm", titleChinese: "去购物", description: "Từ vựng về mua sắm, Cách hỏi giá và mặc cả", order: 6, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Gia đình tôi có 4 người", titleChinese: "我家有四口人", description: "Từ vựng về thành viên gia đình", order: 7, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Sở thích của tôi", titleChinese: "我的爱好", description: "Từ vựng về sở thích, hoạt động giải trí", order: 8, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Đi bệnh viện", titleChinese: "去医院", description: "Từ vựng về sức khỏe và bệnh viện", order: 9, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Phương tiện giao thông", titleChinese: "交通工具", description: "Từ vựng về các loại xe và phương tiện", order: 10, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Đi du lịch", titleChinese: "去旅游", description: "Từ vựng về du lịch, khách sạn", order: 11, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Học ở thư viện", titleChinese: "在图书馆学习", description: "Từ vựng về học tập, thư viện", order: 12, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Cuối tuần làm gì?", titleChinese: "周末做什么？", description: "Từ vựng về hoạt động cuối tuần", order: 13, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Mua điện thoại mới", titleChinese: "买新手机", description: "Từ vựng về đồ điện tử, Cách so sánh sản phẩm", order: 14, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
    { title: "Thể dục thể thao", titleChinese: "体育运动", description: "Từ vựng về thể thao, Cách diễn đạt sở thích thể thao", order: 15, courseId: courseMap["hsk-2"], isLocked: false, progress: 0 },
  ]

  // HSK 3 Lessons (20 bài — HSK Standard Course)
  const hsk3Lessons = [
    { title: "Ôn tập HSK 2", titleChinese: "复习 HSK 2", description: "Ôn tập lại kiến thức HSK 2", order: 1, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi thích uống trà", titleChinese: "我喜欢喝茶", description: "Cách diễn đạt sở thích với 喜欢, Từ vựng về đồ uống", order: 2, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Căn hộ bao nhiêu tiền một tháng?", titleChinese: "这套公寓一个月多少钱？", description: "Từ vựng về thuê nhà, Cách hỏi về giá thuê", order: 3, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Bạn có thể giúp tôi không?", titleChinese: "你能帮我吗？", description: "Cách yêu cầu giúp đỡ với 能, 可以, Từ vựng về nhờ vả", order: 4, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi đang học tiếng Trung", titleChinese: "我正在学汉语", description: "Cấu trúc đang làm gì với 正在, Thể tiếp diễn", order: 5, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Chúng ta đi ăn nhà hàng nhé", titleChinese: "我们去饭店吃饭吧", description: "Từ vựng về nhà hàng, Cách rủ rê với 吧", order: 6, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi đã từng đến Trung Quốc", titleChinese: "我去过中国", description: "Cấu trúc kinh nghiệm với 过, Từ vựng về du lịch", order: 7, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Thời tiết mùa xuân rất đẹp", titleChinese: "春天的天气很好", description: "Từ vựng về 4 mùa, Cách mô tả thời tiết", order: 8, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tháng sau tôi sẽ đi du lịch", titleChinese: "下个月我要去旅游", description: "Thì tương lai với 要, 会, 将, Kế hoạch tương lai", order: 9, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi đã làm xong bài tập", titleChinese: "我做完作业了", description: "Cấu trúc hoàn thành với 完, 好, Từ vựng về học tập", order: 10, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Càng học càng thấy hay", titleChinese: "越学越有意思", description: "Cấu trúc 越...越..., So sánh và đối chiếu", order: 11, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Nếu trời mưa thì không đi", titleChinese: "如果下雨就不去", description: "Câu điều kiện với 如果...就..., Từ vựng về thời tiết", order: 12, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi vừa học vừa làm", titleChinese: "我一边学习一边工作", description: "Cấu trúc 一边...一边..., Hoạt động đồng thời", order: 13, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi bị ốm rồi", titleChinese: "我生病了", description: "Từ vựng về bệnh tật, Cách diễn đạt trạng thái", order: 14, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "So với năm ngoái tôi tiến bộ nhiều", titleChinese: "跟去年相比，我进步了很多", description: "So sánh với 比, 跟...相比, Từ vựng về tiến bộ", order: 15, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tôi bị người ta phê bình", titleChinese: "我被人批评了", description: "Câu bị động với 被, Từ vựng về cảm xúc", order: 16, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Mặc dù mệt nhưng rất vui", titleChinese: "虽然累但很开心", description: "Cấu trúc 虽然...但是..., Diễn đạt nhượng bộ", order: 17, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Cuộc sống ở thành phố", titleChinese: "城市生活", description: "Từ vựng về đô thị, So sánh thành phố và nông thôn", order: 18, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Kế hoạch tương lai", titleChinese: "未来计划", description: "Từ vựng về kế hoạch, Cách diễn đạt mong muốn", order: 19, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
    { title: "Tổng hợp luyện tập HSK 3", titleChinese: "HSK 3 综合练习", description: "Luyện đề và kỹ năng làm bài thi HSK 3", order: 20, courseId: courseMap["hsk-3"], isLocked: false, progress: 0 },
  ]

  // HSK 4 Lessons (20 bài — HSK Standard Course)
  const hsk4Lessons = [
    { title: "Ôn tập HSK 3", titleChinese: "复习 HSK 3", description: "Ôn tập lại kiến thức HSK 3", order: 1, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Tôi đang chuẩn bị đi du học", titleChinese: "我准备去留学", description: "Từ vựng về du học, Cách diễn đạt kế hoạch", order: 2, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Dù khó khăn cũng phải cố gắng", titleChinese: "尽管困难也要努力", description: "Cấu trúc nhượng bộ với 尽管...也..., 虽然...但是...", order: 3, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Thành công là nhờ nỗ lực", titleChinese: "成功是因为努力", description: "Cấu trúc nhân quả với 因为...所以..., 由于", order: 4, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Tôi sắp tốt nghiệp rồi", titleChinese: "我快毕业了", description: "Từ vựng về tốt nghiệp, Cấu trúc sắp sửa với 快...了", order: 5, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Văn hóa Trung Quốc rất phong phú", titleChinese: "中国文化很丰富", description: "Từ vựng về văn hóa, Cách diễn đạt đặc điểm", order: 6, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Chỉ cần có ý chí là được", titleChinese: "只要有意志就行", description: "Cấu trúc 只要...就..., Điều kiện đủ", order: 7, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Bất kể ai cũng thích du lịch", titleChinese: "无论谁都喜欢旅游", description: "Cấu trúc 无论...都..., 不管...也...", order: 8, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Không những học tiếng Trung mà còn học văn hóa", titleChinese: "不但学汉语而且学文化", description: "Cấu trúc 不但...而且..., Diễn đạt bổ sung", order: 9, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Với tư cách là sinh viên", titleChinese: "作为学生", description: "Từ vựng về vai trò, Cách dùng 作为", order: 10, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Theo ý kiến tôi", titleChinese: "依我看", description: "Cách bày tỏ quan điểm, Từ vựng về ý kiến", order: 11, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Về vấn đề môi trường", titleChinese: "关于环境问题", description: "Từ vựng về môi trường, Cách thảo luận vấn đề", order: 12, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Đối với vấn đề này", titleChinese: "对于这个问题", description: "Cách sử dụng 对于, 关于, Phân tích vấn đề", order: 13, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Dựa vào kinh nghiệm", titleChinese: "根据经验", description: "Từ vựng về kinh nghiệm, Cách dùng 根据", order: 14, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Phát triển kinh tế", titleChinese: "发展经济", description: "Từ vựng về kinh tế, Xu hướng phát triển", order: 15, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Xã hội hiện đại", titleChinese: "现代社会", description: "Từ vựng về xã hội, Vấn đề xã hội", order: 16, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Quan hệ quốc tế", titleChinese: "国际关系", description: "Từ vựng về chính trị quốc tế, Quan hệ ngoại giao", order: 17, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Kỹ năng đọc hiểu nâng cao", titleChinese: "高级阅读技巧", description: "Luyện kỹ năng đọc hiểu cho HSK 4", order: 18, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Kỹ năng viết và diễn đạt", titleChinese: "写作与表达", description: "Luyện kỹ năng viết câu và diễn đạt ý", order: 19, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
    { title: "Tổng hợp luyện tập HSK 4", titleChinese: "HSK 4 综合练习", description: "Luyện đề và kỹ năng làm bài thi HSK 4", order: 20, courseId: courseMap["hsk-4"], isLocked: false, progress: 0 },
  ]

  // HSK 5 Lessons (25 bài — HSK Standard Course)
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
    { title: "Nghệ thuật và thẩm mỹ", titleChinese: "艺术与审美", description: "Từ vựng nghệ thuật, Giá trị thẩm mỹ", order: 11, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Y học và sức khỏe", titleChinese: "医疗健康", description: "Từ vựng y tế, Chăm sóc sức khỏe", order: 12, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Truyền thông đại chúng", titleChinese: "大众传媒", description: "Từ vựng truyền thông, Mạng xã hội", order: 13, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Quan hệ nhân sự", titleChinese: "人际关系", description: "Từ vựng giao tiếp, Văn hóa ứng xử", order: 14, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Du lịch và văn hóa", titleChinese: "旅游文化", description: "Từ vựng du lịch, Điểm đến nổi tiếng", order: 15, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Thể thao và giải trí", titleChinese: "体育娱乐", description: "Từ vựng thể thao, Hoạt động giải trí", order: 16, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Khởi nghiệp và đổi mới", titleChinese: "创业创新", description: "Từ vựng kinh doanh, Tinh thần đổi mới", order: 17, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Đô thị hóa", titleChinese: "城市化", description: "Từ vựng đô thị, Phát triển đô thị", order: 18, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Tâm lý học ứng dụng", titleChinese: "应用心理学", description: "Từ vựng tâm lý học, Ứng dụng trong đời sống", order: 19, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Triết học và tư tưởng", titleChinese: "哲学与思想", description: "Tư tưởng Trung Quốc, Triết học đông tây", order: 20, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Ngoại giao và hợp tác", titleChinese: "外交合作", description: "Từ vựng ngoại giao, Quan hệ quốc tế", order: 21, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Nghệ thuật ngôn ngữ", titleChinese: "语言艺术", description: "Tu từ học, Nghệ thuật diễn đạt", order: 22, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Kỹ năng viết luận", titleChinese: "写作技巧", description: "Luyện kỹ năng viết bài luận HSK 5", order: 23, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Thi thử HSK 5", titleChinese: "HSK 5 模拟考试", description: "Thi thử toàn bộ bài thi HSK 5", order: 24, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
    { title: "Tổng hợp từ vựng HSK 5", titleChinese: "HSK 5 词汇总结", description: "Tổng hợp và ôn tập toàn bộ từ vựng HSK 5", order: 25, courseId: courseMap["hsk-5"], isLocked: false, progress: 0 },
  ]

  // HSK 6 Lessons (25 bài — HSK Standard Course)
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
    { title: "Tâm lý học xã hội", titleChinese: "社会心理学", description: "Hành vi xã hội, Tâm lý đám đông", order: 12, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Đổi mới sáng tạo", titleChinese: "创新创造", description: "Tinh thần đổi mới, Sáng tạo công nghệ", order: 13, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Pháp luật và đạo đức", titleChinese: "法律与道德", description: "Hệ thống pháp luật, Đạo đức xã hội", order: 14, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Văn hóa doanh nghiệp", titleChinese: "企业文化", description: "Quản trị doanh nghiệp, Văn hóa tổ chức", order: 15, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Quan hệ quốc tế", titleChinese: "国际关系", description: "Ngoại giao đa phương, Hợp tác khu vực", order: 16, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Chủ nghĩa nhân văn", titleChinese: "人文主义", description: "Giá trị nhân văn, Phát triển con người", order: 17, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Khoa học công nghệ tiên tiến", titleChinese: "前沿科技", description: "AI, Sinh học, Vật lý lượng tử", order: 18, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Lịch sử văn minh", titleChinese: "文明史", description: "Văn minh Trung Hoa, Giao lưu văn hóa", order: 19, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Ngôn ngữ học ứng dụng", titleChinese: "应用语言学", description: "Phân tích ngôn ngữ, Ngữ pháp ứng dụng", order: 20, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Kinh tế số và thương mại điện tử", titleChinese: "数字经济与电子商务", description: "Từ vựng công nghệ số, Kinh doanh trực tuyến", order: 21, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Kỹ năng đọc hiểu chuyên sâu", titleChinese: "深度阅读技巧", description: "Đọc hiểu văn bản phức tạp, Phân tích sâu", order: 22, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Kỹ năng viết luận nâng cao", titleChinese: "高级写作技巧", description: "Viết luận học thuật, Nghị luận chuyên sâu", order: 23, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Thi thử HSK 6", titleChinese: "HSK 6 模拟考试", description: "Thi thử toàn bộ bài thi HSK 6", order: 24, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
    { title: "Tổng hợp kiến thức HSK 6", titleChinese: "HSK 6 知识总结", description: "Tổng hợp và ôn tập toàn bộ kiến thức HSK 6", order: 25, courseId: courseMap["hsk-6"], isLocked: false, progress: 0 },
  ]

  const allLessons = [
    ...hsk1Lessons,
    ...hsk2Lessons,
    ...hsk3Lessons,
    ...hsk4Lessons,
    ...hsk5Lessons,
    ...hsk6Lessons,
  ]

  // Generate unique slugs for all lessons
  const usedLessonSlugs = new Set<string>()
  const allLessonsWithSlugs = allLessons.map((l) => {
    let slug = generateSlug(l.title)
    let suffix = 1
    while (usedLessonSlugs.has(slug)) {
      slug = `${generateSlug(l.title)}-${suffix}`
      suffix++
    }
    usedLessonSlugs.add(slug)
    return { ...l, slug }
  })

  await prisma.lesson.createMany({ data: allLessonsWithSlugs })
  console.log(`✅ Created ${allLessons.length} lessons`)

  // ============= Hero Slides =============
  console.log("🖼️  Creating hero slides...")
  await prisma.heroSlide.createMany({
    data: [
      {
        image: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1920&h=1080&fit=crop&q=80",
        badge: "Khai giảng tháng 2/2026",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
        title: "Chinh Phục HSK 1-6 Cùng Cô Ngọc",
        description: "Lộ trình học tiếng Trung bài bản từ cơ bản đến nâng cao. Phương pháp giảng dạy hiện đại, lớp học sinh động và thân thiện.",
        primaryCtaText: "Đăng ký ngay",
        primaryCtaHref: "/courses",
        secondaryCtaText: "Xem khóa học",
        secondaryCtaHref: "/courses",
        overlayGradient: "bg-gradient-to-r from-black/60 to-black/30",
        order: 1,
        isActive: true,
      },
      {
        image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1920&h=1080&fit=crop&q=80",
        badge: "Ưu đãi đặc biệt",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        title: "Học Tiếng Trung Giao Tiếp Thực Tế",
        description: "Luyện phát âm chuẩn, giao tiếp tự tin trong mọi tình huống. Áp dụng ngay vào cuộc sống hàng ngày và công việc.",
        primaryCtaText: "Tìm hiểu thêm",
        primaryCtaHref: "/about",
        secondaryCtaText: "Liên hệ",
        secondaryCtaHref: "/contact",
        overlayGradient: "bg-gradient-to-r from-black/50 to-transparent",
        order: 2,
        isActive: true,
      },
      {
        image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1920&h=1080&fit=crop&q=80",
        badge: "Chương trình mới",
        badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
        title: "Khám Phá Văn Hóa Trung Hoa",
        description: "Học tiếng Trung không chỉ là ngôn ngữ — hòa mình vào văn hóa, lịch sử và nghệ thuật thư pháp Trung Quốc.",
        primaryCtaText: "Khám phá ngay",
        primaryCtaHref: "/courses",
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
        iconName: "GraduationCap",
        title: "Giáo viên giàu kinh nghiệm",
        description: "Đội ngũ giảng viên bản ngữ và Việt Nam với nhiều năm kinh nghiệm giảng dạy tiếng Trung.",
        order: 1,
        isActive: true,
      },
      {
        iconName: "BookOpen",
        title: "Giáo trình chuẩn quốc tế",
        description: "Sử dụng giáo trình HSK chính thống, cập nhật theo chuẩn mới nhất của Hanban.",
        order: 2,
        isActive: true,
      },
      {
        iconName: "Users",
        title: "Lớp học nhỏ, tương tác cao",
        description: "Lớp học tối đa 15 học viên, đảm bảo giáo viên chăm sóc từng học viên.",
        order: 3,
        isActive: true,
      },
      {
        iconName: "Award",
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
        description: "Hình ảnh các buổi học sinh động, tương tác và đầy năng lượng tại trung tâm",
        thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop&q=80",
        photoCount: 8,
        order: 1,
        isActive: true,
      },
      {
        title: "Sự kiện văn hóa Trung Hoa",
        description: "Trải nghiệm văn hóa Trung Quốc qua các hoạt động thư pháp, ẩm thực và lễ hội",
        thumbnail: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=300&fit=crop&q=80",
        photoCount: 6,
        order: 2,
        isActive: true,
      },
      {
        title: "Lễ tốt nghiệp & Trao chứng chỉ",
        description: "Những khoảnh khắc tự hào khi học viên hoàn thành khóa học và nhận chứng chỉ HSK",
        thumbnail: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop&q=80",
        photoCount: 5,
        order: 3,
        isActive: true,
      },
    ],
  })
  console.log(`✅ Created ${albums.length} albums`)

  // Album 1: Hoạt động lớp học — real Unsplash photos of classrooms & learning
  const album1Photos = [
    { url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=800&fit=crop&q=80", title: "Giờ học trên lớp", description: "Học viên chăm chú nghe giảng bài" },
    { url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&h=800&fit=crop&q=80", title: "Thảo luận nhóm", description: "Các bạn học viên thảo luận bài tập nhóm" },
    { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop&q=80", title: "Luyện viết chữ Hán", description: "Thực hành viết chữ Hán trên lớp" },
    { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop&q=80", title: "Làm việc nhóm", description: "Học viên cùng nhau hoàn thành bài tập" },
    { url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop&q=80", title: "Giờ luyện nghe", description: "Phòng học với thiết bị luyện nghe hiện đại" },
    { url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=800&fit=crop&q=80", title: "Không gian học tập", description: "Lớp học rộng rãi, thoáng mát" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=800&fit=crop&q=80", title: "Bài thuyết trình", description: "Học viên thuyết trình bằng tiếng Trung" },
    { url: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&h=800&fit=crop&q=80", title: "Giờ ôn tập", description: "Ôn luyện trước kỳ thi HSK" },
  ].map((p, i) => ({ albumId: albums[0].id, ...p, order: i + 1 }))

  // Album 2: Sự kiện văn hóa — real Unsplash photos of Chinese culture
  const album2Photos = [
    { url: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&h=800&fit=crop&q=80", title: "Thư pháp Trung Quốc", description: "Trải nghiệm nghệ thuật thư pháp truyền thống" },
    { url: "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=1200&h=800&fit=crop&q=80", title: "Ẩm thực Trung Hoa", description: "Thưởng thức các món ăn truyền thống" },
    { url: "https://images.unsplash.com/photo-1513673054901-2b5f51551112?w=1200&h=800&fit=crop&q=80", title: "Đèn lồng đỏ", description: "Trang trí lễ hội Tết Nguyên Đán" },
    { url: "https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=1200&h=800&fit=crop&q=80", title: "Trà đạo", description: "Tìm hiểu nghệ thuật pha trà Trung Quốc" },
    { url: "https://images.unsplash.com/photo-1611329695518-1763fc1cc4ef?w=1200&h=800&fit=crop&q=80", title: "Cắt giấy nghệ thuật", description: "Học nghệ thuật cắt giấy truyền thống" },
    { url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&h=800&fit=crop&q=80", title: "Trung thu", description: "Lễ hội Trung thu cùng học viên" },
  ].map((p, i) => ({ albumId: albums[1].id, ...p, order: i + 1 }))

  // Album 3: Lễ tốt nghiệp — real Unsplash photos of graduation/celebration
  const album3Photos = [
    { url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=800&fit=crop&q=80", title: "Lễ trao chứng chỉ", description: "Học viên nhận chứng chỉ HSK" },
    { url: "https://images.unsplash.com/photo-1627556704302-624286467c65?w=1200&h=800&fit=crop&q=80", title: "Niềm vui tốt nghiệp", description: "Khoảnh khắc hạnh phúc ngày tốt nghiệp" },
    { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&q=80", title: "Buổi lễ trang trọng", description: "Buổi lễ tốt nghiệp diễn ra trang trọng" },
    { url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&h=800&fit=crop&q=80", title: "Ảnh kỷ niệm", description: "Chụp ảnh kỷ niệm cùng thầy cô và bạn bè" },
    { url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1200&h=800&fit=crop&q=80", title: "Chúc mừng học viên", description: "Cô giáo chúc mừng học viên xuất sắc" },
  ].map((p, i) => ({ albumId: albums[2].id, ...p, order: i + 1 }))

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
        title: "Ruby HSK - Trung tâm tiếng Trung uy tín tại Hà Nội | Luyện thi HSK 1-6",
        description: "Trung tâm tiếng Trung Ruby HSK - Đào tạo HSK 1-6, giao tiếp, thương mại. Giáo viên 8+ năm kinh nghiệm. Cam kết đầu ra. Học thử miễn phí.",
        keywords: "học tiếng Trung, HSK, trung tâm tiếng Trung Hà Nội, luyện thi HSK, học tiếng Trung online",
        ogTitle: "Ruby HSK - Trung tâm tiếng Trung uy tín #1 Hà Nội",
        ogDescription: "Học tiếng Trung chất lượng cao với Ruby HSK. Lộ trình cá nhân hóa, giáo viên giàu kinh nghiệm, cam kết đầu ra.",
        ogImage: "/preview/thumb.png",
        twitterTitle: "Ruby HSK - Học tiếng Trung chuyên nghiệp",
        twitterDescription: "Trung tâm tiếng Trung hàng đầu Hà Nội. Đào tạo HSK 1-6, cam kết đầu ra.",
        twitterImage: "/preview/thumb.png",
      },
      {
        pagePath: "/about",
        pageName: "Giới thiệu",
        title: "Giới thiệu Ruby HSK - Trung tâm tiếng Trung chuẩn quốc tế Hà Nội",
        description: "Tìm hiểu về Ruby HSK - Trung tâm tiếng Trung chuyên nghiệp với đội ngũ giáo viên 8+ năm kinh nghiệm. Phương pháp giảng dạy hiện đại, cam kết chất lượng.",
        keywords: "giới thiệu Ruby HSK, trung tâm tiếng Trung uy tín, giáo viên tiếng Trung giỏi, học tiếng Trung Hà Nội",
        ogTitle: "Về Ruby HSK - Đào tạo tiếng Trung chuyên nghiệp",
        ogDescription: "Giáo viên giàu kinh nghiệm, phương pháp giảng dạy hiện đại, môi trường học tập chuyên nghiệp.",
        ogImage: "/preview/thumb.png",
      },
      {
        pagePath: "/contact",
        pageName: "Liên hệ",
        title: "Liên hệ Ruby HSK - Tư vấn khóa học tiếng Trung miễn phí | Hotline 0965322136",
        description: "Liên hệ Ruby HSK để được tư vấn lộ trình học tiếng Trung phù hợp. Hotline: 0965322136. Địa chỉ: Hà Nội. Tư vấn miễn phí, học thử 2 buổi.",
        keywords: "liên hệ Ruby HSK, tư vấn học tiếng Trung, đăng ký học HSK, hotline tiếng Trung Hà Nội",
        ogTitle: "Liên hệ tư vấn khóa học tiếng Trung",
        ogDescription: "Đăng ký tư vấn miễn phí và học thử. Hotline: 0965322136",
        ogImage: "/preview/thumb.png",
      },
      {
        pagePath: "/courses",
        pageName: "Danh sách khóa học",
        title: "Khóa học tiếng Trung - HSK 1-6, Giao tiếp, Thương mại | Ruby HSK",
        description: "Khám phá các khóa học tiếng Trung chất lượng cao tại Ruby HSK: HSK 1-6, Giao tiếp thực tế, Thương mại. Lộ trình cá nhân hóa, cam kết đầu ra.",
        keywords: "khóa học tiếng Trung, học HSK online, tiếng Trung giao tiếp, tiếng Trung thương mại, khóa học HSK",
        ogTitle: "Danh sách khóa học tiếng Trung chất lượng cao",
        ogDescription: "HSK 1-6, Giao tiếp, Thương mại. Giáo viên giàu kinh nghiệm, lộ trình rõ ràng.",
        ogImage: "/preview/thumb.png",
      },
    ],
  })
  console.log("✅ Created page metadata")

  // ============= Seed Vocabulary from JSON files =============
  await seedVocabulary()

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
