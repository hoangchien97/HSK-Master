import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import {
  UserRole,
  UserStatus,
  ClassStatus,
  AssignmentStatus,
  SubmissionStatus,
  ItemProgressStatus,
  PracticeMode,
} from "@/enums/portal"
import { generateSlug } from "@/utils/slug"

const prisma = new PrismaClient()

export async function seedPortal() {
  console.log("\n🏫 Seeding portal data...")

  // ============= Clear existing portal data =============
  console.log("🗑️  Clearing existing portal data...")
  // Practice-related tables (must clear before users)
  await prisma.portalPracticeAttempt.deleteMany()
  await prisma.portalPracticeSession.deleteMany()
  await prisma.portalItemProgress.deleteMany()
  await prisma.portalLessonProgress.deleteMany()
  // Portal tables
  await prisma.portalAssignmentSubmission.deleteMany()
  await prisma.portalAssignment.deleteMany()
  await prisma.portalAttendance.deleteMany()
  await prisma.portalSchedule.deleteMany()
  await prisma.portalScheduleSeries.deleteMany()
  await prisma.portalClassEnrollment.deleteMany()
  await prisma.portalClass.deleteMany()
  await prisma.portalUser.deleteMany()
  console.log("✅ Cleared existing portal data")

  // ============= Portal Users =============
  console.log("👤 Creating portal users...")
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create Admin
  await prisma.portalUser.create({
    data: {
      name: "Admin Ruby HSK",
      username: "admin",
      email: "admin@hskmaster.com",
      password: hashedPassword,
      role: UserRole.SYSTEM_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      phoneNumber: "0900000000",
      biography: "Quản trị viên hệ thống Ruby HSK",
    },
  })

  // Create 1 Teacher
  const teachers = [
    await prisma.portalUser.create({
      data: {
        name: "Nguyễn Văn An",
        username: "nguyenan",
        email: "teacher1@hskmaster.com",
        password: hashedPassword,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1",
        phoneNumber: "0901234567",
        biography: "Giáo viên tiếng Trung với 5 năm kinh nghiệm. Chuyên môn: HSK 1-3, Giao tiếp.",
      },
    }),
  ]

  // Create 10 Students
  const studentNames = [
    "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em", "Ngô Thị Hoa", "Đỗ Văn Khoa",
    "Trần Minh Giang", "Vũ Thu Hà", "Bùi Văn Hùng", "Đặng Thị Lan", "Lý Quốc Khánh",
  ]

  const students = await Promise.all(
    studentNames.map(async (name, index) => {
      // userName = họ + tên (first word + last word, no diacritics, lowercase)
      const parts = name.trim().split(/\s+/)
      const ho = parts[0]
      const ten = parts[parts.length - 1]
      const baseUsername = (ho + ten)
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")

      // Check unique: append number if needed
      let username = baseUsername
      let suffix = 1
      while (await prisma.portalUser.findUnique({ where: { username } })) {
        username = `${baseUsername}${suffix}`
        suffix++
      }

      return prisma.portalUser.create({
        data: {
          name: name,
          username,
          email: `student${index + 1}@gmail.com`,
          password: hashedPassword,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: new Date(),
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=student${index + 1}`,
          phoneNumber: `090${String(1000000 + index).slice(1)}`,
          dateOfBirth: new Date(1995 + (index % 10), index % 12, (index % 28) + 1),
          address: `${index + 1} Đường ABC, Quận ${(index % 12) + 1}, TP.HCM`,
        },
      })
    })
  )

  console.log(`✅ Created 1 admin, 1 teacher, 10 students`)

  // ============= Portal Classes (2 classes) =============
  console.log("📚 Creating 2 classes...")

  const classesData = [
    { name: "HSK 1 - Lớp Sáng T2-T4-T6", code: "HSK1-246-SANG", level: "HSK1", teacher: teachers[0], desc: "Lớp HSK 1 buổi sáng: T2, T4, T6 từ 8h-10h. Người mới bắt đầu." },
    { name: "HSK 1 - Lớp Tối T3-T5-T7", code: "HSK1-357-TOI", level: "HSK1", teacher: teachers[0], desc: "Lớp HSK 1 buổi tối: T3, T5, T7 từ 18h30-20h30." },
  ]

  const classes = await Promise.all(
    classesData.map((cls) =>
      prisma.portalClass.create({
        data: {
          className: cls.name,
          classCode: cls.code,
          description: cls.desc,
          teacherId: cls.teacher.id,
          level: cls.level,
          startDate: new Date("2026-02-01"),
          endDate: new Date("2026-06-30"),
          status: ClassStatus.ACTIVE,
        },
      })
    )
  )

  console.log(`✅ Created 2 classes`)

  // ============= Enrollments (cleared) =============
  const enrollments: { classId: string; studentId: string; status: string }[] = []
  console.log(`✅ Created 0 enrollments (cleared)`)

  // ============= Schedule Series & Schedules (cleared) =============
  console.log(`✅ Created 0 schedule series & 0 schedules (cleared)`)

  // ============= Portal Assignments =============
  console.log("📝 Creating assignments...")

  const assignmentTemplates = [
    // HSK 1
    { title: "Bài tập từ vựng HSK 1 - Tuần 1", desc: "Học thuộc 30 từ vựng HSK 1 cơ bản: chào hỏi, số đếm, gia đình. Hoàn thành bài tập trong file đính kèm.", type: "HOMEWORK", maxScore: 100, tags: ["từ-vựng", "HSK1"] },
    { title: "Kiểm tra nghe HSK 1 - Bài 1", desc: "Nghe và chọn đáp án đúng. 20 câu hỏi, mỗi câu 5 điểm.", type: "LISTENING", maxScore: 100, tags: ["nghe", "HSK1"] },
    { title: "Luyện viết Hán tự cơ bản", desc: "Viết mỗi chữ 10 lần: 人、大、小、上、下、中、日、月. Chụp ảnh bài viết và nộp.", type: "WRITING", maxScore: 50, tags: ["viết", "hán-tự"] },
    { title: "Bài đọc hiểu HSK 1 - Bài 1", desc: "Đọc đoạn văn ngắn và trả lời 10 câu hỏi. Chú ý ngữ pháp 是...的 và 在.", type: "READING", maxScore: 100, tags: ["đọc-hiểu", "HSK1"] },
    { title: "Kiểm tra giữa kỳ HSK 1", desc: "Kiểm tra tổng hợp: Nghe (30đ) + Đọc (30đ) + Viết (40đ). Thời gian: 60 phút.", type: "QUIZ", maxScore: 100, tags: ["kiểm-tra", "HSK1"] },
    // HSK 2
    { title: "Bài tập từ vựng HSK 2 - Tuần 1", desc: "Ôn tập 50 từ vựng HSK 2: thời tiết, giao thông, mua sắm. Làm bài tập kết hợp từ.", type: "HOMEWORK", maxScore: 100, tags: ["từ-vựng", "HSK2"] },
    { title: "Dự án nhóm: Hội thoại mua sắm", desc: "Nhóm 3-4 người, quay video hội thoại mua sắm tại cửa hàng (3-5 phút). Sử dụng ít nhất 20 từ vựng HSK 2.", type: "PROJECT", maxScore: 100, tags: ["dự-án", "giao-tiếp", "HSK2"] },
    { title: "Luyện nói HSK 2 - Tự giới thiệu", desc: "Ghi âm bài tự giới thiệu 2 phút: tên, tuổi, quê, sở thích, công việc. Phát âm rõ ràng, thanh điệu chính xác.", type: "SPEAKING", maxScore: 80, tags: ["nói", "phát-âm", "HSK2"] },
    { title: "Bài tập ngữ pháp HSK 3 - 把字句", desc: "Hoàn thành 20 câu sử dụng cấu trúc 把字句. Phân biệt với câu bình thường.", type: "HOMEWORK", maxScore: 100, tags: ["ngữ-pháp", "HSK3"] },
    { title: "Quiz từ vựng cuối tuần", desc: "20 câu trắc nghiệm từ vựng, 10 câu điền từ. Thời gian 15 phút.", type: "QUIZ", maxScore: 50, tags: ["quiz", "từ-vựng"] },
  ]

  // Track used slugs for assignment uniqueness
  const usedAssignmentSlugs = new Set<string>()
  function getUniqueAssignmentSlug(title: string): string {
    let slug = generateSlug(title)
    let suffix = 1
    while (usedAssignmentSlugs.has(slug)) {
      slug = `${generateSlug(title)}-${suffix}`
      suffix++
    }
    usedAssignmentSlugs.add(slug)
    return slug
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAssignments: any[] = []

  // Create 3-5 assignments per class
  for (let ci = 0; ci < classes.length; ci++) {
    const cls = classes[ci]
    const numAssignments = 3 + (ci % 3) // 3, 4, or 5

    for (let ai = 0; ai < numAssignments; ai++) {
      const template = assignmentTemplates[(ci * 3 + ai) % assignmentTemplates.length]
      const dueDate = new Date("2026-02-15")
      dueDate.setDate(dueDate.getDate() + ai * 7 + ci) // Spread due dates

      const assignment = await prisma.portalAssignment.create({
        data: {
          classId: cls.id,
          teacherId: cls.teacherId,
          title: template.title,
          slug: getUniqueAssignmentSlug(template.title),
          description: template.desc,
          assignmentType: template.type,
          dueDate,
          maxScore: template.maxScore,
          attachments: [],
          tags: template.tags || [],
          status: ai === 0 && ci < 1 ? AssignmentStatus.DRAFT : AssignmentStatus.PUBLISHED,
        },
      })
      allAssignments.push({ ...assignment, classIndex: ci })
    }
  }

  console.log(`✅ Created ${allAssignments.length} assignments`)

  // ============= Portal Assignment Submissions =============
  console.log("📤 Creating assignment submissions...")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSubmissions: any[] = []

  for (const assignment of allAssignments) {
    // Only active assignments get submissions
    if (assignment.status === AssignmentStatus.DRAFT) continue

    // Find enrolled students in this class
    const classEnrollments = enrollments.filter((e) => e.classId === assignment.classId)
    const submitCount = Math.max(1, Math.floor(classEnrollments.length * 0.1))

    for (let si = 0; si < submitCount; si++) {
      const enrollment = classEnrollments[si]
      if (!enrollment) continue

      const isLate = Math.random() < 0.15
      const isGraded = Math.random() < 0.6

      const submittedAt = new Date(assignment.dueDate)
      if (isLate) {
        submittedAt.setHours(submittedAt.getHours() + Math.floor(Math.random() * 48) + 1)
      } else {
        submittedAt.setHours(submittedAt.getHours() - Math.floor(Math.random() * 72) - 1)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const submissionData: any = {
        assignmentId: assignment.id,
        studentId: enrollment.studentId,
        content: `Bài làm của học viên cho "${assignment.title}". Em đã hoàn thành theo yêu cầu.`,
        attachments: [],
        submittedAt,
        status: SubmissionStatus.SUBMITTED,
      }

      if (isGraded && !isLate) {
        const scorePercent = 0.5 + Math.random() * 0.5
        submissionData.score = Math.round(assignment.maxScore * scorePercent * 10) / 10
        submissionData.status = SubmissionStatus.GRADED
        const feedbacks = [
          "Bài làm tốt, cần chú ý thêm thanh điệu.",
          "Rất tốt! Ngữ pháp chính xác, từ vựng phong phú.",
          "Khá, cần cải thiện phần viết chữ Hán.",
          "Tốt, nhưng cần luyện thêm phần nghe.",
        ]
        submissionData.feedback = feedbacks[si % feedbacks.length]
      }

      allSubmissions.push(submissionData)
    }
  }

  // Batch insert all submissions at once
  if (allSubmissions.length > 0) {
    await prisma.portalAssignmentSubmission.createMany({ data: allSubmissions, skipDuplicates: true })
  }

  console.log(`✅ Created ${allSubmissions.length} submissions`)

  // ============= Practice Data for student1@gmail.com =============
  console.log("📖 Seeding practice data for student1@gmail.com...")

  const student1 = students[0] // student1@gmail.com = "Lê Văn Cường"

  // Get HSK 1 course with lessons & vocabularies
  const hsk1Course = await prisma.course.findFirst({
    where: { slug: "hsk-1" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { vocabularies: { select: { id: true } } },
      },
    },
  })

  if (hsk1Course && hsk1Course.lessons.length > 0) {
    let practiceItemCount = 0
    let practiceSessionCount = 0

    // Seed progress for the first 3 lessons (reduced from 6)
    const lessonProgressConfigs = [
      { lessonIndex: 0, masteryPercent: 85, learnedPct: 1.0, masteredPct: 0.85, timeSec: 1800 },
      { lessonIndex: 1, masteryPercent: 70, learnedPct: 1.0, masteredPct: 0.7, timeSec: 1500 },
      { lessonIndex: 2, masteryPercent: 45, learnedPct: 0.9, masteredPct: 0.45, timeSec: 1200 },
    ]

    for (const config of lessonProgressConfigs) {
      const lesson = hsk1Course.lessons[config.lessonIndex]
      if (!lesson || lesson.vocabularies.length === 0) continue

      const vocabIds = lesson.vocabularies.map((v) => v.id)
      const totalVocab = vocabIds.length
      const learnedCount = Math.round(totalVocab * config.learnedPct)
      const masteredCount = Math.round(totalVocab * config.masteredPct)

      // Create lesson-level progress
      await prisma.portalLessonProgress.create({
        data: {
          studentId: student1.id,
          lessonId: lesson.id,
          learnedCount,
          masteredCount,
          totalTimeSec: config.timeSec,
          masteryPercent: config.masteryPercent,
        },
      })

      // Create item-level progress for vocabularies
      for (let vi = 0; vi < vocabIds.length; vi++) {
        const vocabId = vocabIds[vi]
        let masteryScore = 0
        let status: string = ItemProgressStatus.NEW
        let seenCount = 0
        let correctCount = 0
        let wrongCount = 0

        if (vi < masteredCount) {
          // MASTERED items
          masteryScore = 0.8 + Math.random() * 0.2 // 0.8-1.0
          status = ItemProgressStatus.MASTERED
          seenCount = 5 + Math.floor(Math.random() * 10)
          correctCount = Math.floor(seenCount * 0.85)
          wrongCount = seenCount - correctCount
        } else if (vi < learnedCount) {
          // LEARNING items
          masteryScore = 0.2 + Math.random() * 0.5 // 0.2-0.7
          status = ItemProgressStatus.LEARNING
          seenCount = 2 + Math.floor(Math.random() * 5)
          correctCount = Math.floor(seenCount * 0.6)
          wrongCount = seenCount - correctCount
        } else {
          continue // NEW — no progress record needed
        }

        const now = new Date()
        const lastSeenAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // within 7 days

        await prisma.portalItemProgress.create({
          data: {
            studentId: student1.id,
            vocabularyId: vocabId,
            seenCount,
            correctCount,
            wrongCount,
            masteryScore,
            status,
            lastSeenAt,
            nextReviewAt: new Date(lastSeenAt.getTime() + (status === ItemProgressStatus.MASTERED ? 3 : 1) * 24 * 60 * 60 * 1000),
          },
        })
        practiceItemCount++
      }

      // Create some practice sessions for the lesson
      const sessionModes = [PracticeMode.LOOKUP, PracticeMode.FLASHCARD, PracticeMode.QUIZ]
      for (const mode of sessionModes) {
        if (Math.random() < 0.7) { // 70% chance per mode
          const startedAt = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
          const durationSec = 120 + Math.floor(Math.random() * 600)

          await prisma.portalPracticeSession.create({
            data: {
              studentId: student1.id,
              lessonId: lesson.id,
              mode,
              startedAt,
              endedAt: new Date(startedAt.getTime() + durationSec * 1000),
              durationSec,
            },
          })
          practiceSessionCount++
        }
      }
    }

    console.log(`✅ Created practice data: ${practiceItemCount} item progress, ${practiceSessionCount} sessions`)
  } else {
    console.log("⚠️  HSK 1 course or vocabulary not found — skipping practice seed. Run seed-vocabulary.ts first.")
  }

  console.log("\n✅ Portal seeding completed!")
}

// Self-execute when run directly (not when imported from seed.ts)
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`
if (isMainModule) {
  seedPortal()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Portal seed failed:", e)
      process.exit(1)
    })
}
