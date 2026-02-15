import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed HSK 1 vocabulary data for practice feature.
 * Run with: npx tsx prisma/seed-vocabulary.ts
 */
async function main() {
  console.log("🌱 Seeding HSK vocabulary data...")

  // Get HSK 1 lessons
  const hsk1Course = await prisma.course.findFirst({
    where: { slug: "hsk-1" },
    include: { lessons: { orderBy: { order: "asc" } } },
  })

  if (!hsk1Course) {
    console.error("❌ HSK 1 course not found. Please run the main seed first.")
    return
  }

  const lessons = hsk1Course.lessons
  const lessonMap: Record<number, string> = {}
  for (const l of lessons) {
    lessonMap[l.order] = l.id
  }

  console.log(`📚 Found ${lessons.length} HSK 1 lessons`)

  // Clear existing vocabulary for these lessons
  await prisma.vocabulary.deleteMany({
    where: { lessonId: { in: lessons.map((l) => l.id) } },
  })

  // =================== HSK 1 VOCABULARY ===================

  type VocabEntry = {
    word: string
    pinyin: string
    meaning: string
    wordType?: string
  }

  const hsk1Vocab: Record<number, VocabEntry[]> = {
    // Bài 1: Giới thiệu làm quen Tiếng Trung
    1: [
      { word: "汉语", pinyin: "hànyǔ", meaning: "tiếng Trung", wordType: "danh từ" },
      { word: "中文", pinyin: "zhōngwén", meaning: "tiếng Trung (viết)", wordType: "danh từ" },
      { word: "中国", pinyin: "zhōngguó", meaning: "Trung Quốc", wordType: "danh từ" },
      { word: "字", pinyin: "zì", meaning: "chữ, ký tự", wordType: "danh từ" },
      { word: "笔", pinyin: "bǐ", meaning: "bút", wordType: "danh từ" },
      { word: "书", pinyin: "shū", meaning: "sách", wordType: "danh từ" },
      { word: "人", pinyin: "rén", meaning: "người", wordType: "danh từ" },
      { word: "大", pinyin: "dà", meaning: "lớn, to", wordType: "tính từ" },
      { word: "小", pinyin: "xiǎo", meaning: "nhỏ, bé", wordType: "tính từ" },
      { word: "一", pinyin: "yī", meaning: "một", wordType: "số từ" },
      { word: "二", pinyin: "èr", meaning: "hai", wordType: "số từ" },
      { word: "三", pinyin: "sān", meaning: "ba", wordType: "số từ" },
      { word: "写", pinyin: "xiě", meaning: "viết", wordType: "động từ" },
    ],

    // Bài 2: Xin chào 你好
    2: [
      { word: "你", pinyin: "nǐ", meaning: "bạn", wordType: "đại từ" },
      { word: "好", pinyin: "hǎo", meaning: "tốt, khỏe", wordType: "tính từ" },
      { word: "你好", pinyin: "nǐ hǎo", meaning: "xin chào", wordType: "thành ngữ" },
      { word: "我", pinyin: "wǒ", meaning: "tôi", wordType: "đại từ" },
      { word: "他", pinyin: "tā", meaning: "anh ấy", wordType: "đại từ" },
      { word: "她", pinyin: "tā", meaning: "cô ấy", wordType: "đại từ" },
      { word: "是", pinyin: "shì", meaning: "là", wordType: "động từ" },
      { word: "不", pinyin: "bù", meaning: "không", wordType: "phó từ" },
      { word: "四", pinyin: "sì", meaning: "bốn", wordType: "số từ" },
      { word: "五", pinyin: "wǔ", meaning: "năm", wordType: "số từ" },
      { word: "六", pinyin: "liù", meaning: "sáu", wordType: "số từ" },
      { word: "七", pinyin: "qī", meaning: "bảy", wordType: "số từ" },
      { word: "八", pinyin: "bā", meaning: "tám", wordType: "số từ" },
      { word: "九", pinyin: "jiǔ", meaning: "chín", wordType: "số từ" },
      { word: "十", pinyin: "shí", meaning: "mười", wordType: "số từ" },
    ],

    // Bài 3: Tiếng Trung không khó lắm 汉语不太难
    3: [
      { word: "爸爸", pinyin: "bàba", meaning: "bố", wordType: "danh từ" },
      { word: "妈妈", pinyin: "māma", meaning: "mẹ", wordType: "danh từ" },
      { word: "哥哥", pinyin: "gēge", meaning: "anh trai", wordType: "danh từ" },
      { word: "姐姐", pinyin: "jiějie", meaning: "chị gái", wordType: "danh từ" },
      { word: "弟弟", pinyin: "dìdi", meaning: "em trai", wordType: "danh từ" },
      { word: "妹妹", pinyin: "mèimei", meaning: "em gái", wordType: "danh từ" },
      { word: "难", pinyin: "nán", meaning: "khó", wordType: "tính từ" },
      { word: "太", pinyin: "tài", meaning: "quá", wordType: "phó từ" },
      { word: "很", pinyin: "hěn", meaning: "rất", wordType: "phó từ" },
      { word: "也", pinyin: "yě", meaning: "cũng", wordType: "phó từ" },
      { word: "的", pinyin: "de", meaning: "của (trợ từ)", wordType: "trợ từ" },
      { word: "家", pinyin: "jiā", meaning: "nhà, gia đình", wordType: "danh từ" },
    ],

    // Bài 4: Hẹn ngày mai gặp lại 明天见
    4: [
      { word: "明天", pinyin: "míngtiān", meaning: "ngày mai", wordType: "danh từ" },
      { word: "今天", pinyin: "jīntiān", meaning: "hôm nay", wordType: "danh từ" },
      { word: "昨天", pinyin: "zuótiān", meaning: "hôm qua", wordType: "danh từ" },
      { word: "见", pinyin: "jiàn", meaning: "gặp", wordType: "động từ" },
      { word: "再见", pinyin: "zàijiàn", meaning: "tạm biệt", wordType: "thành ngữ" },
      { word: "说", pinyin: "shuō", meaning: "nói", wordType: "động từ" },
      { word: "英语", pinyin: "yīngyǔ", meaning: "tiếng Anh", wordType: "danh từ" },
      { word: "日语", pinyin: "rìyǔ", meaning: "tiếng Nhật", wordType: "danh từ" },
      { word: "韩语", pinyin: "hányǔ", meaning: "tiếng Hàn", wordType: "danh từ" },
      { word: "去", pinyin: "qù", meaning: "đi", wordType: "động từ" },
      { word: "哪儿", pinyin: "nǎr", meaning: "ở đâu", wordType: "đại từ" },
      { word: "学校", pinyin: "xuéxiào", meaning: "trường học", wordType: "danh từ" },
    ],

    // Bài 6: Bạn đi đâu? 你去哪儿？
    6: [
      { word: "商店", pinyin: "shāngdiàn", meaning: "cửa hàng", wordType: "danh từ" },
      { word: "医院", pinyin: "yīyuàn", meaning: "bệnh viện", wordType: "danh từ" },
      { word: "饭店", pinyin: "fàndiàn", meaning: "nhà hàng, khách sạn", wordType: "danh từ" },
      { word: "星期", pinyin: "xīngqī", meaning: "tuần", wordType: "danh từ" },
      { word: "星期一", pinyin: "xīngqī yī", meaning: "thứ Hai", wordType: "danh từ" },
      { word: "星期二", pinyin: "xīngqī èr", meaning: "thứ Ba", wordType: "danh từ" },
      { word: "星期三", pinyin: "xīngqī sān", meaning: "thứ Tư", wordType: "danh từ" },
      { word: "星期天", pinyin: "xīngqītiān", meaning: "Chủ nhật", wordType: "danh từ" },
      { word: "上", pinyin: "shàng", meaning: "trên", wordType: "danh từ" },
      { word: "下", pinyin: "xià", meaning: "dưới", wordType: "danh từ" },
      { word: "前", pinyin: "qián", meaning: "trước", wordType: "danh từ" },
      { word: "后", pinyin: "hòu", meaning: "sau", wordType: "danh từ" },
    ],

    // Bài 7: Đây là thầy Vương 这是王老师
    7: [
      { word: "老师", pinyin: "lǎoshī", meaning: "thầy/cô giáo", wordType: "danh từ" },
      { word: "学生", pinyin: "xuéshēng", meaning: "học sinh", wordType: "danh từ" },
      { word: "同学", pinyin: "tóngxué", meaning: "bạn học", wordType: "danh từ" },
      { word: "这", pinyin: "zhè", meaning: "đây, này", wordType: "đại từ" },
      { word: "那", pinyin: "nà", meaning: "đó, kia", wordType: "đại từ" },
      { word: "谁", pinyin: "shéi", meaning: "ai", wordType: "đại từ" },
      { word: "医生", pinyin: "yīshēng", meaning: "bác sĩ", wordType: "danh từ" },
      { word: "工作", pinyin: "gōngzuò", meaning: "công việc, làm việc", wordType: "danh từ" },
      { word: "谢谢", pinyin: "xièxie", meaning: "cảm ơn", wordType: "động từ" },
      { word: "不客气", pinyin: "bú kèqi", meaning: "không có gì", wordType: "thành ngữ" },
      { word: "对不起", pinyin: "duìbuqǐ", meaning: "xin lỗi", wordType: "thành ngữ" },
      { word: "没关系", pinyin: "méi guānxi", meaning: "không sao", wordType: "thành ngữ" },
    ],

    // Bài 8: Tôi học tiếng Trung 我学汉语
    8: [
      { word: "学", pinyin: "xué", meaning: "học", wordType: "động từ" },
      { word: "什么", pinyin: "shénme", meaning: "cái gì", wordType: "đại từ" },
      { word: "名字", pinyin: "míngzi", meaning: "tên", wordType: "danh từ" },
      { word: "叫", pinyin: "jiào", meaning: "gọi, tên là", wordType: "động từ" },
      { word: "国", pinyin: "guó", meaning: "nước, quốc gia", wordType: "danh từ" },
      { word: "美国", pinyin: "měiguó", meaning: "Mỹ", wordType: "danh từ" },
      { word: "越南", pinyin: "yuènán", meaning: "Việt Nam", wordType: "danh từ" },
      { word: "朋友", pinyin: "péngyǒu", meaning: "bạn bè", wordType: "danh từ" },
      { word: "认识", pinyin: "rènshi", meaning: "quen biết", wordType: "động từ" },
      { word: "高兴", pinyin: "gāoxìng", meaning: "vui, vui mừng", wordType: "tính từ" },
      { word: "请", pinyin: "qǐng", meaning: "mời, xin", wordType: "động từ" },
      { word: "请问", pinyin: "qǐngwèn", meaning: "xin hỏi", wordType: "động từ" },
    ],

    // Bài 9: Bạn ăn gì? 你吃什么？
    9: [
      { word: "吃", pinyin: "chī", meaning: "ăn", wordType: "động từ" },
      { word: "喝", pinyin: "hē", meaning: "uống", wordType: "động từ" },
      { word: "米饭", pinyin: "mǐfàn", meaning: "cơm", wordType: "danh từ" },
      { word: "面条", pinyin: "miàntiáo", meaning: "mì", wordType: "danh từ" },
      { word: "水", pinyin: "shuǐ", meaning: "nước", wordType: "danh từ" },
      { word: "茶", pinyin: "chá", meaning: "trà", wordType: "danh từ" },
      { word: "咖啡", pinyin: "kāfēi", meaning: "cà phê", wordType: "danh từ" },
      { word: "菜", pinyin: "cài", meaning: "rau, món ăn", wordType: "danh từ" },
      { word: "鸡蛋", pinyin: "jīdàn", meaning: "trứng gà", wordType: "danh từ" },
      { word: "想", pinyin: "xiǎng", meaning: "muốn, nghĩ", wordType: "động từ" },
      { word: "要", pinyin: "yào", meaning: "muốn, cần", wordType: "động từ" },
      { word: "还是", pinyin: "háishi", meaning: "hay là", wordType: "liên từ" },
    ],

    // Bài 10: Một cân táo bao nhiêu tiền? 一斤苹果多少钱？
    10: [
      { word: "苹果", pinyin: "píngguǒ", meaning: "táo", wordType: "danh từ" },
      { word: "香蕉", pinyin: "xiāngjiāo", meaning: "chuối", wordType: "danh từ" },
      { word: "西瓜", pinyin: "xīguā", meaning: "dưa hấu", wordType: "danh từ" },
      { word: "葡萄", pinyin: "pútao", meaning: "nho", wordType: "danh từ" },
      { word: "多少", pinyin: "duōshao", meaning: "bao nhiêu", wordType: "đại từ" },
      { word: "钱", pinyin: "qián", meaning: "tiền", wordType: "danh từ" },
      { word: "块", pinyin: "kuài", meaning: "đồng (tiền)", wordType: "lượng từ" },
      { word: "斤", pinyin: "jīn", meaning: "cân (0.5kg)", wordType: "lượng từ" },
      { word: "个", pinyin: "gè", meaning: "cái (lượng từ)", wordType: "lượng từ" },
      { word: "买", pinyin: "mǎi", meaning: "mua", wordType: "động từ" },
      { word: "卖", pinyin: "mài", meaning: "bán", wordType: "động từ" },
      { word: "贵", pinyin: "guì", meaning: "đắt", wordType: "tính từ" },
      { word: "便宜", pinyin: "piányi", meaning: "rẻ", wordType: "tính từ" },
    ],

    // Bài 11: Bạn sống ở đâu? 你住在哪儿？
    11: [
      { word: "住", pinyin: "zhù", meaning: "ở, sống", wordType: "động từ" },
      { word: "在", pinyin: "zài", meaning: "ở, tại", wordType: "giới từ" },
      { word: "哪", pinyin: "nǎ", meaning: "nào", wordType: "đại từ" },
      { word: "这儿", pinyin: "zhèr", meaning: "ở đây", wordType: "đại từ" },
      { word: "那儿", pinyin: "nàr", meaning: "ở đó", wordType: "đại từ" },
      { word: "电话", pinyin: "diànhuà", meaning: "điện thoại", wordType: "danh từ" },
      { word: "号码", pinyin: "hàomǎ", meaning: "số", wordType: "danh từ" },
      { word: "零", pinyin: "líng", meaning: "số không", wordType: "số từ" },
      { word: "百", pinyin: "bǎi", meaning: "trăm", wordType: "số từ" },
      { word: "千", pinyin: "qiān", meaning: "nghìn", wordType: "số từ" },
      { word: "北京", pinyin: "Běijīng", meaning: "Bắc Kinh", wordType: "danh từ" },
      { word: "河内", pinyin: "Hénèi", meaning: "Hà Nội", wordType: "danh từ" },
    ],

    // Bài 12: Chúng tôi đều là du học sinh 我们都是留学生
    12: [
      { word: "我们", pinyin: "wǒmen", meaning: "chúng tôi", wordType: "đại từ" },
      { word: "你们", pinyin: "nǐmen", meaning: "các bạn", wordType: "đại từ" },
      { word: "他们", pinyin: "tāmen", meaning: "họ", wordType: "đại từ" },
      { word: "都", pinyin: "dōu", meaning: "đều", wordType: "phó từ" },
      { word: "留学生", pinyin: "liúxuéshēng", meaning: "du học sinh", wordType: "danh từ" },
      { word: "男", pinyin: "nán", meaning: "nam", wordType: "tính từ" },
      { word: "女", pinyin: "nǚ", meaning: "nữ", wordType: "tính từ" },
      { word: "几", pinyin: "jǐ", meaning: "mấy", wordType: "đại từ" },
      { word: "岁", pinyin: "suì", meaning: "tuổi", wordType: "lượng từ" },
      { word: "多大", pinyin: "duō dà", meaning: "bao nhiêu tuổi", wordType: "đại từ" },
      { word: "年", pinyin: "nián", meaning: "năm", wordType: "danh từ" },
      { word: "月", pinyin: "yuè", meaning: "tháng", wordType: "danh từ" },
    ],

    // Bài 14: Đây có phải là thuốc bắc không? 这是中药吗？
    14: [
      { word: "吗", pinyin: "ma", meaning: "không? (trợ từ hỏi)", wordType: "trợ từ" },
      { word: "呢", pinyin: "ne", meaning: "còn...thì sao? (trợ từ)", wordType: "trợ từ" },
      { word: "有", pinyin: "yǒu", meaning: "có", wordType: "động từ" },
      { word: "没有", pinyin: "méiyǒu", meaning: "không có", wordType: "phó từ" },
      { word: "中药", pinyin: "zhōngyào", meaning: "thuốc bắc", wordType: "danh từ" },
      { word: "东西", pinyin: "dōngxi", meaning: "đồ vật", wordType: "danh từ" },
      { word: "桌子", pinyin: "zhuōzi", meaning: "bàn", wordType: "danh từ" },
      { word: "椅子", pinyin: "yǐzi", meaning: "ghế", wordType: "danh từ" },
      { word: "杯子", pinyin: "bēizi", meaning: "cốc, ly", wordType: "danh từ" },
      { word: "本", pinyin: "běn", meaning: "cuốn (lượng từ)", wordType: "lượng từ" },
      { word: "把", pinyin: "bǎ", meaning: "cái (lượng từ)", wordType: "lượng từ" },
      { word: "些", pinyin: "xiē", meaning: "một số, vài", wordType: "lượng từ" },
    ],

    // Bài 15: Xe của bạn là cái mới hay cũ? 你的车是新的还是旧的？
    15: [
      { word: "车", pinyin: "chē", meaning: "xe", wordType: "danh từ" },
      { word: "新", pinyin: "xīn", meaning: "mới", wordType: "tính từ" },
      { word: "旧", pinyin: "jiù", meaning: "cũ", wordType: "tính từ" },
      { word: "多", pinyin: "duō", meaning: "nhiều", wordType: "tính từ" },
      { word: "少", pinyin: "shǎo", meaning: "ít", wordType: "tính từ" },
      { word: "漂亮", pinyin: "piàoliang", meaning: "đẹp", wordType: "tính từ" },
      { word: "坐", pinyin: "zuò", meaning: "ngồi, đi (xe)", wordType: "động từ" },
      { word: "开", pinyin: "kāi", meaning: "lái, mở", wordType: "động từ" },
      { word: "出租车", pinyin: "chūzūchē", meaning: "taxi", wordType: "danh từ" },
      { word: "公共汽车", pinyin: "gōnggòng qìchē", meaning: "xe buýt", wordType: "danh từ" },
      { word: "火车", pinyin: "huǒchē", meaning: "tàu hỏa", wordType: "danh từ" },
      { word: "飞机", pinyin: "fēijī", meaning: "máy bay", wordType: "danh từ" },
    ],

    // Bài 16: Công ty có bao nhiêu nhân viên? 公司有多少员工？
    16: [
      { word: "公司", pinyin: "gōngsī", meaning: "công ty", wordType: "danh từ" },
      { word: "员工", pinyin: "yuángōng", meaning: "nhân viên", wordType: "danh từ" },
      { word: "经理", pinyin: "jīnglǐ", meaning: "giám đốc", wordType: "danh từ" },
      { word: "服务员", pinyin: "fúwùyuán", meaning: "phục vụ viên", wordType: "danh từ" },
      { word: "司机", pinyin: "sījī", meaning: "tài xế", wordType: "danh từ" },
      { word: "护士", pinyin: "hùshi", meaning: "y tá", wordType: "danh từ" },
      { word: "做", pinyin: "zuò", meaning: "làm", wordType: "động từ" },
      { word: "能", pinyin: "néng", meaning: "có thể", wordType: "động từ" },
      { word: "会", pinyin: "huì", meaning: "biết, sẽ", wordType: "động từ" },
      { word: "可以", pinyin: "kěyǐ", meaning: "có thể, được phép", wordType: "động từ" },
      { word: "喜欢", pinyin: "xǐhuan", meaning: "thích", wordType: "động từ" },
      { word: "忙", pinyin: "máng", meaning: "bận", wordType: "tính từ" },
    ],
  }

  // Build vocabulary entries
  const vocabEntries: {
    lessonId: string
    word: string
    pinyin: string
    meaning: string
    wordType: string | null
  }[] = []

  for (const [order, words] of Object.entries(hsk1Vocab)) {
    const lessonId = lessonMap[Number(order)]
    if (!lessonId) {
      console.warn(`⚠️  No lesson found for order ${order}, skipping...`)
      continue
    }
    for (const w of words) {
      vocabEntries.push({
        lessonId,
        word: w.word,
        pinyin: w.pinyin,
        meaning: w.meaning,
        wordType: w.wordType || null,
      })
    }
  }

  if (vocabEntries.length > 0) {
    await prisma.vocabulary.createMany({ data: vocabEntries })
    console.log(`✅ Created ${vocabEntries.length} HSK 1 vocabulary items`)
  }

  // =================== HSK 2 VOCABULARY (top lessons) ===================
  const hsk2Course = await prisma.course.findFirst({
    where: { slug: "hsk-2" },
    include: { lessons: { orderBy: { order: "asc" } } },
  })

  if (hsk2Course) {
    const hsk2LessonMap: Record<number, string> = {}
    for (const l of hsk2Course.lessons) hsk2LessonMap[l.order] = l.id

    // Clear existing
    await prisma.vocabulary.deleteMany({
      where: { lessonId: { in: hsk2Course.lessons.map((l) => l.id) } },
    })

    const hsk2Vocab: Record<number, VocabEntry[]> = {
      // Bài 2: Bây giờ mấy giờ rồi? 现在几点了？
      2: [
        { word: "现在", pinyin: "xiànzài", meaning: "bây giờ", wordType: "danh từ" },
        { word: "点", pinyin: "diǎn", meaning: "giờ (thời gian)", wordType: "lượng từ" },
        { word: "分", pinyin: "fēn", meaning: "phút", wordType: "lượng từ" },
        { word: "半", pinyin: "bàn", meaning: "nửa, rưỡi", wordType: "số từ" },
        { word: "早上", pinyin: "zǎoshang", meaning: "buổi sáng", wordType: "danh từ" },
        { word: "中午", pinyin: "zhōngwǔ", meaning: "buổi trưa", wordType: "danh từ" },
        { word: "下午", pinyin: "xiàwǔ", meaning: "buổi chiều", wordType: "danh từ" },
        { word: "晚上", pinyin: "wǎnshang", meaning: "buổi tối", wordType: "danh từ" },
        { word: "了", pinyin: "le", meaning: "rồi (trợ từ)", wordType: "trợ từ" },
        { word: "起床", pinyin: "qǐchuáng", meaning: "thức dậy", wordType: "động từ" },
        { word: "睡觉", pinyin: "shuìjiào", meaning: "ngủ", wordType: "động từ" },
        { word: "上班", pinyin: "shàngbān", meaning: "đi làm", wordType: "động từ" },
      ],

      // Bài 3: Hôm nay thứ mấy? 今天星期几？
      3: [
        { word: "星期四", pinyin: "xīngqī sì", meaning: "thứ Năm", wordType: "danh từ" },
        { word: "星期五", pinyin: "xīngqī wǔ", meaning: "thứ Sáu", wordType: "danh từ" },
        { word: "星期六", pinyin: "xīngqī liù", meaning: "thứ Bảy", wordType: "danh từ" },
        { word: "号", pinyin: "hào", meaning: "ngày (trong tháng)", wordType: "lượng từ" },
        { word: "日", pinyin: "rì", meaning: "ngày", wordType: "danh từ" },
        { word: "上个月", pinyin: "shàng gè yuè", meaning: "tháng trước", wordType: "danh từ" },
        { word: "下个月", pinyin: "xià gè yuè", meaning: "tháng sau", wordType: "danh từ" },
        { word: "生日", pinyin: "shēngrì", meaning: "sinh nhật", wordType: "danh từ" },
        { word: "快乐", pinyin: "kuàilè", meaning: "vui vẻ, hạnh phúc", wordType: "tính từ" },
        { word: "祝", pinyin: "zhù", meaning: "chúc", wordType: "động từ" },
      ],

      // Bài 4: Thời tiết hôm nay thế nào? 今天天气怎么样？
      4: [
        { word: "天气", pinyin: "tiānqì", meaning: "thời tiết", wordType: "danh từ" },
        { word: "怎么样", pinyin: "zěnmeyàng", meaning: "thế nào", wordType: "đại từ" },
        { word: "热", pinyin: "rè", meaning: "nóng", wordType: "tính từ" },
        { word: "冷", pinyin: "lěng", meaning: "lạnh", wordType: "tính từ" },
        { word: "下雨", pinyin: "xià yǔ", meaning: "mưa", wordType: "động từ" },
        { word: "下雪", pinyin: "xià xuě", meaning: "tuyết rơi", wordType: "động từ" },
        { word: "晴天", pinyin: "qíngtiān", meaning: "trời nắng", wordType: "danh từ" },
        { word: "阴天", pinyin: "yīntiān", meaning: "trời âm u", wordType: "danh từ" },
        { word: "风", pinyin: "fēng", meaning: "gió", wordType: "danh từ" },
        { word: "暖和", pinyin: "nuǎnhuo", meaning: "ấm áp", wordType: "tính từ" },
        { word: "凉快", pinyin: "liángkuai", meaning: "mát mẻ", wordType: "tính từ" },
        { word: "穿", pinyin: "chuān", meaning: "mặc (quần áo)", wordType: "động từ" },
      ],

      // Bài 5: Tôi muốn uống cà phê 我想喝咖啡
      5: [
        { word: "牛奶", pinyin: "niúnǎi", meaning: "sữa bò", wordType: "danh từ" },
        { word: "果汁", pinyin: "guǒzhī", meaning: "nước ép", wordType: "danh từ" },
        { word: "啤酒", pinyin: "píjiǔ", meaning: "bia", wordType: "danh từ" },
        { word: "杯", pinyin: "bēi", meaning: "cốc (lượng từ)", wordType: "lượng từ" },
        { word: "瓶", pinyin: "píng", meaning: "chai (lượng từ)", wordType: "lượng từ" },
        { word: "给", pinyin: "gěi", meaning: "cho, đưa", wordType: "động từ" },
        { word: "来", pinyin: "lái", meaning: "đến", wordType: "động từ" },
        { word: "等", pinyin: "děng", meaning: "đợi", wordType: "động từ" },
        { word: "好吃", pinyin: "hǎochī", meaning: "ngon (đồ ăn)", wordType: "tính từ" },
        { word: "好喝", pinyin: "hǎohē", meaning: "ngon (đồ uống)", wordType: "tính từ" },
      ],

      // Bài 6: Đi mua sắm 去购物
      6: [
        { word: "购物", pinyin: "gòuwù", meaning: "mua sắm", wordType: "động từ" },
        { word: "衣服", pinyin: "yīfu", meaning: "quần áo", wordType: "danh từ" },
        { word: "裤子", pinyin: "kùzi", meaning: "quần", wordType: "danh từ" },
        { word: "鞋", pinyin: "xié", meaning: "giày", wordType: "danh từ" },
        { word: "颜色", pinyin: "yánsè", meaning: "màu sắc", wordType: "danh từ" },
        { word: "红", pinyin: "hóng", meaning: "đỏ", wordType: "tính từ" },
        { word: "白", pinyin: "bái", meaning: "trắng", wordType: "tính từ" },
        { word: "黑", pinyin: "hēi", meaning: "đen", wordType: "tính từ" },
        { word: "大小", pinyin: "dàxiǎo", meaning: "kích cỡ", wordType: "danh từ" },
        { word: "试", pinyin: "shì", meaning: "thử", wordType: "động từ" },
        { word: "件", pinyin: "jiàn", meaning: "cái (quần áo)", wordType: "lượng từ" },
        { word: "条", pinyin: "tiáo", meaning: "cái (quần, khăn)", wordType: "lượng từ" },
      ],

      // Bài 7: Gia đình tôi có 4 người 我家有四口人
      7: [
        { word: "口", pinyin: "kǒu", meaning: "miệng; người (gia đình)", wordType: "lượng từ" },
        { word: "儿子", pinyin: "érzi", meaning: "con trai", wordType: "danh từ" },
        { word: "女儿", pinyin: "nǚér", meaning: "con gái", wordType: "danh từ" },
        { word: "丈夫", pinyin: "zhàngfu", meaning: "chồng", wordType: "danh từ" },
        { word: "妻子", pinyin: "qīzi", meaning: "vợ", wordType: "danh từ" },
        { word: "爷爷", pinyin: "yéye", meaning: "ông nội", wordType: "danh từ" },
        { word: "奶奶", pinyin: "nǎinai", meaning: "bà nội", wordType: "danh từ" },
        { word: "和", pinyin: "hé", meaning: "và", wordType: "liên từ" },
        { word: "跟", pinyin: "gēn", meaning: "với, và", wordType: "giới từ" },
        { word: "爱", pinyin: "ài", meaning: "yêu", wordType: "động từ" },
        { word: "可爱", pinyin: "kěài", meaning: "dễ thương", wordType: "tính từ" },
      ],

      // Bài 8: Sở thích của tôi 我的爱好
      8: [
        { word: "爱好", pinyin: "àihào", meaning: "sở thích", wordType: "danh từ" },
        { word: "看", pinyin: "kàn", meaning: "xem, nhìn", wordType: "động từ" },
        { word: "看书", pinyin: "kàn shū", meaning: "đọc sách", wordType: "động từ" },
        { word: "听", pinyin: "tīng", meaning: "nghe", wordType: "động từ" },
        { word: "听音乐", pinyin: "tīng yīnyuè", meaning: "nghe nhạc", wordType: "động từ" },
        { word: "唱歌", pinyin: "chàng gē", meaning: "hát", wordType: "động từ" },
        { word: "跳舞", pinyin: "tiào wǔ", meaning: "nhảy múa", wordType: "động từ" },
        { word: "打球", pinyin: "dǎ qiú", meaning: "đánh bóng", wordType: "động từ" },
        { word: "游泳", pinyin: "yóuyǒng", meaning: "bơi", wordType: "động từ" },
        { word: "跑步", pinyin: "pǎobù", meaning: "chạy bộ", wordType: "động từ" },
        { word: "电影", pinyin: "diànyǐng", meaning: "phim", wordType: "danh từ" },
        { word: "电视", pinyin: "diànshì", meaning: "tivi", wordType: "danh từ" },
      ],
    }

    const hsk2Entries: typeof vocabEntries = []
    for (const [order, words] of Object.entries(hsk2Vocab)) {
      const lid = hsk2LessonMap[Number(order)]
      if (!lid) continue
      for (const w of words) {
        hsk2Entries.push({
          lessonId: lid,
          word: w.word,
          pinyin: w.pinyin,
          meaning: w.meaning,
          wordType: w.wordType || null,
        })
      }
    }

    if (hsk2Entries.length > 0) {
      await prisma.vocabulary.createMany({ data: hsk2Entries })
      console.log(`✅ Created ${hsk2Entries.length} HSK 2 vocabulary items`)
    }
  }

  console.log("🎉 Vocabulary seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
