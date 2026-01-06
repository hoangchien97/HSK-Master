import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding full education data...")

  // Clear existing data
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
  // Create HSK 1-6 main courses
  const hskCourses = await prisma.course.createMany({
    data: [
      {
        title: "HSK 1 – Tiếng Trung cho người mới bắt đầu",
        slug: "hsk-1",
        description: "Khóa học HSK 1 dành cho người mới bắt đầu. Làm quen với tiếng Trung từ con số 0, học cách chào hỏi và giao tiếp cơ bản.",
        level: "HSK 1",
        badgeText: "Mới bắt đầu",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
        vocabularyCount: 150,
        grammarCount: 45,
        lessonCount: 25,
        durationHours: 40,
        categoryId: basic.id,
      },
      {
        title: "HSK 2 – Giao tiếp tiếng Trung cơ bản",
        slug: "hsk-2",
        description: "Giao tiếp cơ bản trong cuộc sống hàng ngày. Nâng cao kỹ năng giao tiếp, mở rộng từ vựng và mẫu câu thông dụng.",
        level: "HSK 2",
        badgeText: "Sơ cấp",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
        vocabularyCount: 300,
        grammarCount: 60,
        lessonCount: 20,
        durationHours: 60,
        categoryId: basic.id,
      },
      {
        title: "HSK 3 – Tiếng Trung trung cấp",
        slug: "hsk-3",
        description: "Bước vào giao tiếp nâng cao. Giao tiếp và viết thành thạo hơn trong các tình huống thường gặp.",
        level: "HSK 3",
        badgeText: "Trung cấp",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        vocabularyCount: 600,
        grammarCount: 80,
        lessonCount: 25,
        durationHours: 80,
        categoryId: basic.id,
      },
      {
        title: "HSK 4 – Sẵn sàng du học và làm việc",
        slug: "hsk-4",
        description: "Sẵn sàng cho môi trường du học và làm việc. Giao tiếp tự tin trong các tình huống phức tạp.",
        level: "HSK 4",
        badgeText: "Du học/Làm việc",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        vocabularyCount: 1200,
        grammarCount: 120,
        lessonCount: 30,
        durationHours: 100,
        categoryId: advanced.id,
      },
      {
        title: "HSK 5 – Tiếng Trung cao cấp",
        slug: "hsk-5",
        description: "Thành thạo giao tiếp chuyên sâu. Đọc báo, xem phim, giao tiếp trong môi trường chuyên nghiệp.",
        level: "HSK 5",
        badgeText: "Cao cấp",
        badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
        vocabularyCount: 2500,
        grammarCount: 150,
        lessonCount: 35,
        durationHours: 120,
        categoryId: advanced.id,
      },
      {
        title: "HSK 6 – Trình độ chuyên gia",
        slug: "hsk-6",
        description: "Đạt trình độ gần như người bản ngữ. Hiểu và sử dụng tiếng Trung trong mọi tình huống phức tạp.",
        level: "HSK 6",
        badgeText: "Chuyên gia",
        badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
        vocabularyCount: 5000,
        grammarCount: 200,
        lessonCount: 40,
        durationHours: 150,
        categoryId: advanced.id,
      },
    ],
  })

  // Get HSK 1 course for lessons
  const hsk1 = await prisma.course.findUnique({
    where: { slug: "hsk-1" },
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
  const lessons = await prisma.lesson.createMany({
    data: [
      {
        title: "Giới thiệu làm quen Tiếng Trung",
        titleChinese: "",
        description: "Các nét và quy tắc viết trong tiếng Trung",
        order: 1,
        courseId: hsk1!.id,
        isLocked: false,
        progress: 75,
      },
      {
        title: "Tiếng Trung không khó lắm",
        titleChinese: "",
        description: "Từ vựng về các thành viên trong gia đình, Cấu trúc câu 不太 + ADJ, Cách hỏi và trả lời với từ 吗？",
        order: 2,
        courseId: hsk1!.id,
        isLocked: false,
        progress: 60,
      },
      {
        title: "Hẹn ngày mai gặp lại",
        titleChinese: "",
        description: "Từ vựng về các ngôn ngữ, Hỏi đáp đi đâu làm gì",
        order: 3,
        courseId: hsk1!.id,
        isLocked: false,
        progress: 0,
      },
      {
        title: "Học nghe nói bài 1, 2, 3",
        titleChinese: "",
        description: "Nắm được cách phân biệt của các vận mẫu và thanh mẫu bài 1,2,3",
        order: 4,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Bạn đi đâu?",
        titleChinese: "你去哪儿？",
        description: "Hỏi đáp đi đâu với chữ 哪儿, Hỏi đáp về thứ trong tuần với từ 几, Cách nói lời tạm biệt, xin lỗi",
        order: 5,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Đây là thầy Vương",
        titleChinese: "这是王老师",
        description: "Hỏi đáp về công việc, sức khỏe, Cách nói lời cảm ơn",
        order: 6,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Tôi học tiếng Trung",
        titleChinese: "我学汉语",
        description: "Hỏi đáp về họ tên, quốc gia, Hỏi đáp với từ 什么",
        order: 7,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Học nghe nói bài 4, 5, 6",
        titleChinese: "",
        description: "Nắm được cách phân biệt của các vận mẫu và thanh mẫu bài 4,5",
        order: 8,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "KIỂM TRA LẦN 1",
        titleChinese: "",
        description: "Kiểm tra tổng hợp kiến thức các bài đã học",
        order: 9,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Bạn ăn gì?",
        titleChinese: "你吃什么？",
        description: "Từ vựng về các món ăn, Hỏi đáp về ăn uống, Từ vựng về các buổi trong ngày",
        order: 10,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Một cân táo bao nhiêu tiền?",
        titleChinese: "一斤苹果多少钱？",
        description: "Từ vựng về hoa quả, Cách hỏi về số lượng với từ 多少 và 几, Cách hỏi về số tiền với từ 多少钱",
        order: 11,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Tôi đổi nhân dân tệ",
        titleChinese: "我换人民币",
        description: "Từ vựng về loại tiền tệ, Cách nói số tiền từ hàng chục tới hàng vạn",
        order: 12,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Học nghe nói bài 7, 8, 9",
        titleChinese: "",
        description: "Luyện phản xạ nghe các bài 7, 8, 9",
        order: 13,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Bạn sống ở đâu?",
        titleChinese: "你住在哪儿？",
        description: "Hỏi đáp về nơi sống với từ 住, Cách hỏi đáp về số điện thoại",
        order: 14,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Chúng tôi đều là du học sinh",
        titleChinese: "我们都是留学生",
        description: "Cách giới thiệu về bản thân, Cách dùng của chữ 都 và 也",
        order: 15,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Bạn học ở đâu?",
        titleChinese: "你在哪儿学习？",
        description: "Từ vựng về các kỹ năng trong tiếng Trung, Cách dùng của từ 怎么样、但是",
        order: 16,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Học nghe nói bài 10, 11, 12",
        titleChinese: "",
        description: "Luyện phản xạ nghe các bài 10, 11, 12",
        order: 17,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "KIỂM TRA LẦN 2",
        titleChinese: "",
        description: "Kiểm tra tổng hợp kiến thức các bài đã học",
        order: 18,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Đây có phải là thuốc bắc không?",
        titleChinese: "这是中药吗？",
        description: "Từ vựng về các đồ vật cơ bản, Làm quen với lượng từ",
        order: 19,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Xe của bạn là cái mới hay là cái cũ?",
        titleChinese: "你的车是新的还是旧的？",
        description: "Từ vựng về các loại xe và động từ đi kèm, Cách dùng của 有一点儿、还是",
        order: 20,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Công ty của bạn có bao nhiêu nhân viên?",
        titleChinese: "你的公司有多少员工？",
        description: "Từ vựng về nghề nghiệp, Cách dùng từ 只、大概, Cách nói về sự ước lượng",
        order: 21,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "Học nghe nói bài 13, 14, 15",
        titleChinese: "",
        description: "Luyện phản xạ nghe các bài 13, 14, 15",
        order: 22,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "KIỂM TRA LẦN 3",
        titleChinese: "",
        description: "Kiểm tra tổng hợp kiến thức các bài đã học",
        order: 23,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
      {
        title: "ÔN TẬP",
        titleChinese: "",
        description: "Ôn tập tổng hợp toàn bộ khóa học",
        order: 24,
        courseId: hsk1!.id,
        isLocked: true,
        progress: 0,
      },
    ],
  })

  const lesson1 = await prisma.lesson.findFirst({
    where: { courseId: hsk1!.id, order: 1 },
  })
  const lesson2 = await prisma.lesson.findFirst({
    where: { courseId: hsk1!.id, order: 2 },
  })

  // ============= Vocabulary =============
  await prisma.vocabulary.createMany({
    data: [
      {
        word: "你好",
        pinyin: "nǐ hǎo",
        meaning: "Xin chào",
        lessonId: lesson1!.id,
      },
      {
        word: "再见",
        pinyin: "zài jiàn",
        meaning: "Tạm biệt",
        lessonId: lesson1!.id,
      },
      {
        word: "我",
        pinyin: "wǒ",
        meaning: "Tôi",
        lessonId: lesson1!.id,
      },
      {
        word: "你",
        pinyin: "nǐ",
        meaning: "Bạn",
        lessonId: lesson1!.id,
      },
      {
        word: "他",
        pinyin: "tā",
        meaning: "Anh ấy",
        lessonId: lesson1!.id,
      },
      {
        word: "谢谢",
        pinyin: "xiè xiè",
        meaning: "Cảm ơn",
        lessonId: lesson2!.id,
      },
      {
        word: "对不起",
        pinyin: "duì bù qǐ",
        meaning: "Xin lỗi",
        lessonId: lesson2!.id,
      },
      {
        word: "没关系",
        pinyin: "méi guān xì",
        meaning: "Không sao",
        lessonId: lesson2!.id,
      },
    ],
  })

  // ============= Grammar Points =============
  await prisma.grammarPoint.createMany({
    data: [
      {
        title: 'Câu "Shi" (是)',
        titleChinese: "是",
        description: "Cấu trúc câu cơ bản sử dụng 是 (là) để nhận dạng và định nghĩa.",
        order: 1,
        courseId: hsk1!.id,
      },
      {
        title: 'Câu hỏi với "Ma" (吗)',
        titleChinese: "吗",
        description: "Tạo câu hỏi yes/no bằng cách thêm 吗 vào cuối câu khẳng định.",
        order: 2,
        courseId: hsk1!.id,
      },
      {
        title: 'Diễn đạt sở hữu với "De" (的)',
        titleChinese: "的",
        description: "Sử dụng 的 để thể hiện sở hữu và mối quan hệ giữa các danh từ.",
        order: 3,
        courseId: hsk1!.id,
      },
      {
        title: 'Phủ định với "Bu" (不)',
        titleChinese: "不",
        description: "Phủ định động từ và tính từ sử dụng 不 (không).",
        order: 4,
        courseId: hsk1!.id,
      },
      {
        title: 'Số đếm và Lượng từ',
        titleChinese: "量词",
        description: "Học cách đếm và sử dụng lượng từ phù hợp với danh từ.",
        order: 5,
        courseId: hsk1!.id,
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

  // ============= Photo Albums =============
  const album1 = await prisma.album.create({
    data: {
      title: "Lớp học HSK 1 vui vẻ",
      description: "Ảnh lớp học HSK cấp độ 1",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
      photoCount: 2,
      order: 1,
    },
  })

  await prisma.photo.createMany({
    data: [
      {
        albumId: album1.id,
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop",
        title: "Học viên trong lớp",
        description: "Các bạn học viên đang học tiếng Trung",
        order: 1,
      },
      {
        albumId: album1.id,
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop",
        title: "Hoạt động nhóm",
        description: "Học viên thảo luận và làm bài tập nhóm",
        order: 2,
      },
    ]
  })

  const album2 = await prisma.album.create({
    data: {
      title: "Thực hành thư pháp",
      description: "Ảnh hoạt động văn hóa",
      thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
      photoCount: 2,
      order: 2,
    },
  })

  await prisma.photo.createMany({
    data: [
      {
        albumId: album2.id,
        url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&h=1080&fit=crop",
        title: "Viết thư pháp",
        description: "Học viên thực hành viết chữ Hán",
        order: 1,
      },
      {
        albumId: album2.id,
        url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1920&h=1080&fit=crop",
        title: "Học từ vựng",
        description: "Luyện tập từ vựng và phát âm",
        order: 2,
      },
    ]
  })

  const album3 = await prisma.album.create({
    data: {
      title: "Hoạt động ngoại khóa",
      description: "Các hoạt động văn hóa và giao lưu",
      thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      photoCount: 2,
      order: 3,
    },
  })

  await prisma.photo.createMany({
    data: [
      {
        albumId: album3.id,
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop",
        title: "Thảo luận nhóm",
        description: "Học viên thảo luận dự án",
        order: 1,
      },
      {
        albumId: album3.id,
        url: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1920&h=1080&fit=crop",
        title: "Học cùng giáo viên",
        description: "Giáo viên hướng dẫn học viên",
        order: 2,
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
