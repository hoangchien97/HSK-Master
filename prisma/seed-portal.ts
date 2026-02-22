import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import {
  UserRole,
  UserStatus,
  ClassStatus,
  EnrollmentStatus,
  ScheduleStatus,
  AssignmentStatus,
  SubmissionStatus,
  ItemProgressStatus,
  PracticeMode,
} from "@/enums/portal"
import { generateSlug } from "@/utils/slug"

const prisma = new PrismaClient()

export async function seedPortal() {
  console.log("\n��� Seeding portal data...")

  // ============= Clear existing portal data =============
  console.log("���️  Clearing existing portal data...")  // Practice-related tables (must clear before users)
  await prisma.portalPracticeAttempt.deleteMany()
  await prisma.portalPracticeSession.deleteMany()
  await prisma.portalItemProgress.deleteMany()
  await prisma.portalLessonProgress.deleteMany()
  // Portal tables
  await prisma.portalAssignmentSubmission.deleteMany()
  await prisma.portalAssignment.deleteMany()
  await prisma.portalAttendance.deleteMany()
  await prisma.portalSchedule.deleteMany()
  await prisma.portalClassEnrollment.deleteMany()
  await prisma.portalClass.deleteMany()
  await prisma.portalUser.deleteMany()
  console.log("✅ Cleared existing portal data")

  // ============= Portal Users =============
  console.log("��� Creating portal users...")
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

  // Create 5 Teachers
  const teachers = await Promise.all([
    prisma.portalUser.create({
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
    prisma.portalUser.create({
      data: {
        name: "Trần Thị Bình",
        username: "tranbinh",
        email: "teacher2@hskmaster.com",
        password: hashedPassword,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2",
        phoneNumber: "0907654321",
        biography: "Tốt nghiệp Đại học Bắc Kinh, 8 năm kinh nghiệm. Chuyên môn: HSK 4-6.",
      },
    }),
    prisma.portalUser.create({
      data: {
        name: "Lê Minh Châu",
        username: "lechau",
        email: "teacher3@hskmaster.com",
        password: hashedPassword,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3",
        phoneNumber: "0908765432",
        biography: "Chuyên gia ngữ pháp tiếng Trung, 6 năm giảng dạy HSK 3-5.",
      },
    }),
    prisma.portalUser.create({
      data: {
        name: "Phạm Thu Dung",
        username: "phamdung",
        email: "teacher4@hskmaster.com",
        password: hashedPassword,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher4",
        phoneNumber: "0909876543",
        biography: "Giáo viên dạy giao tiếp và văn hóa Trung Quốc, 4 năm kinh nghiệm.",
      },
    }),
    prisma.portalUser.create({
      data: {
        name: "Võ Quang Em",
        username: "voem",
        email: "teacher5@hskmaster.com",
        password: hashedPassword,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher5",
        phoneNumber: "0910987654",
        biography: "Chuyên gia HSK 5-6, tiếng Trung thương mại, 10 năm kinh nghiệm.",
      },
    }),
  ])

  // Create 50 Students
  const studentNames = [
    "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em", "Ngô Thị Hoa", "Đỗ Văn Khoa",
    "Trần Minh Giang", "Vũ Thu Hà", "Bùi Văn Hùng", "Đặng Thị Lan", "Lý Quốc Khánh",
    "Mai Thị Linh", "Nguyễn Hoàng Long", "Phan Thị Mai", "Đinh Văn Nam", "Hồ Thị Nga",
    "Cao Minh Phúc", "Dương Thị Quỳnh", "Tôn Văn Sơn", "Lưu Thị Tâm", "Võ Minh Tuấn",
    "Lê Thị Uyên", "Trương Văn Vũ", "Phùng Thị Xuân", "Huỳnh Văn Yên", "Đào Thị Ánh",
    "Châu Minh Bảo", "Ông Thị Cẩm", "Thái Văn Đạt", "La Thị Diệu", "Mạc Văn Đức",
    "Nghiêm Thị Hương", "Hà Văn Kha", "Tạ Thị Kiều", "Lâm Văn Lợi", "Từ Thị Mỹ",
    "Hoàng Văn Ngọc", "Đoàn Thị Oanh", "Trịnh Văn Phong", "Vương Thị Quế", "Lục Văn Sáng",
    "Ninh Thị Thảo", "Đàm Văn Thịnh", "Cung Thị Uyên", "Triệu Văn Vinh", "Lã Thị Yến",
    "Khương Minh An", "Trang Thị Bích", "Ưng Văn Cường", "Kiều Thị Diễm", "Bành Văn Hải",
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

  console.log(`✅ Created 1 admin, 5 teachers, 50 students`)

  // ============= Portal Classes (25 classes) =============
  console.log("��� Creating 25 classes...")

  const classesData = [
    { name: "HSK 1 - Lớp Sáng T2-T4-T6", code: "HSK1-246-SANG", level: "HSK1", teacher: teachers[0], desc: "Lớp HSK 1 buổi sáng: T2, T4, T6 từ 8h-10h. Người mới bắt đầu." },
    { name: "HSK 1 - Lớp Tối T3-T5-T7", code: "HSK1-357-TOI", level: "HSK1", teacher: teachers[0], desc: "Lớp HSK 1 buổi tối: T3, T5, T7 từ 18h30-20h30." },
    { name: "HSK 2 - Lớp Sáng T2-T4-T6", code: "HSK2-246-SANG", level: "HSK2", teacher: teachers[1], desc: "Lớp HSK 2 buổi sáng: T2, T4, T6 từ 8h-10h. Dành cho học viên hoàn thành HSK 1." },
    { name: "HSK 2 - Lớp Tối T3-T5-T7", code: "HSK2-357-TOI", level: "HSK2", teacher: teachers[1], desc: "Lớp HSK 2 buổi tối: T3, T5, T7 từ 18h30-20h30." },
    { name: "HSK 3 - Lớp Chiều T2-T4", code: "HSK3-24-CHIEU", level: "HSK3", teacher: teachers[2], desc: "Lớp HSK 3 buổi chiều: T2, T4 từ 14h-17h. Cần nền tảng HSK 2." },
    { name: "HSK 3 - Lớp Tối T3-T5", code: "HSK3-35-TOI", level: "HSK3", teacher: teachers[2], desc: "Lớp HSK 3 buổi tối: T3, T5 từ 18h30-21h." },
    { name: "HSK 4 - Lớp Sáng T2-T4-T6", code: "HSK4-246-SANG", level: "HSK4", teacher: teachers[4], desc: "Lớp HSK 4 buổi sáng: T2, T4, T6 từ 8h-11h. Cần hoàn thành HSK 3." },
    { name: "HSK 4 - Lớp Tối T3-T5-T7", code: "HSK4-357-TOI", level: "HSK4", teacher: teachers[4], desc: "Lớp HSK 4 buổi tối: T3, T5, T7 từ 18h30-21h30." },
    { name: "HSK 5 - Lớp Chiều T2-T4", code: "HSK5-24-CHIEU", level: "HSK5", teacher: teachers[4], desc: "Lớp HSK 5 buổi chiều: T2, T4 từ 14h-17h. Trình độ HSK 4." },
    { name: "HSK 6 - Lớp Tối T3-T5", code: "HSK6-35-TOI", level: "HSK6", teacher: teachers[4], desc: "Lớp HSK 6 buổi tối: T3, T5 từ 18h30-21h30. Trình độ HSK 5." },
    { name: "Giao tiếp cơ bản - Cuối tuần", code: "GT-CN-SANG", level: "BASIC", teacher: teachers[3], desc: "Lớp giao tiếp cơ bản: CN 9h-12h. Tập trung nói và nghe." },
    { name: "Giao tiếp nâng cao - Cuối tuần", code: "GT-T7-CHIEU", level: "ADVANCED", teacher: teachers[3], desc: "Lớp giao tiếp nâng cao: T7 14h-17h. Thực hành đàm thoại." },
    { name: "Tiếng Trung thương mại", code: "BUSINESS-35-TOI", level: "BUSINESS", teacher: teachers[4], desc: "Lớp tiếng Trung thương mại: T3, T5 từ 19h-21h." },
    { name: "Luyện thi HSK 3 - Intensive", code: "HSK3-INT-SANG", level: "HSK3", teacher: teachers[2], desc: "Khóa luyện thi HSK 3 chuyên sâu: T2-T6 từ 8h-10h." },
    { name: "Luyện thi HSK 5 - Intensive", code: "HSK5-INT-TOI", level: "HSK5", teacher: teachers[4], desc: "Khóa luyện thi HSK 5 chuyên sâu: T2-T6 từ 18h30-20h30." },
    // Additional 10 classes to reach 25 total — for pagination testing
    { name: "HSK 1 - Lớp Chiều T2-T4", code: "HSK1-24-CHIEU", level: "HSK1", teacher: teachers[0], desc: "Lớp HSK 1 buổi chiều: T2, T4 từ 14h-16h. Người mới bắt đầu." },
    { name: "HSK 2 - Lớp Cuối tuần", code: "HSK2-T7-SANG", level: "HSK2", teacher: teachers[1], desc: "Lớp HSK 2 cuối tuần: T7 9h-12h. Tiến độ chậm cho người bận." },
    { name: "HSK 3 - Lớp Sáng T2-T4-T6", code: "HSK3-246-SANG", level: "HSK3", teacher: teachers[2], desc: "Lớp HSK 3 buổi sáng: T2, T4, T6 từ 8h-10h." },
    { name: "HSK 4 - Lớp Chiều T3-T5", code: "HSK4-35-CHIEU", level: "HSK4", teacher: teachers[4], desc: "Lớp HSK 4 buổi chiều: T3, T5 từ 14h-17h." },
    { name: "HSK 1 - Lớp Online T2-T4-T6", code: "HSK1-246-OL", level: "HSK1", teacher: teachers[0], desc: "Lớp HSK 1 online: T2, T4, T6 từ 20h-21h30." },
    { name: "HSK 2 - Lớp Online T3-T5-T7", code: "HSK2-357-OL", level: "HSK2", teacher: teachers[1], desc: "Lớp HSK 2 online: T3, T5, T7 từ 20h-21h30." },
    { name: "Giao tiếp du lịch - Cuối tuần", code: "GT-DL-T7", level: "BASIC", teacher: teachers[3], desc: "Lớp giao tiếp du lịch: T7 9h-11h30. Hội thoại thực tế." },
    { name: "HSK 5 - Lớp Sáng T3-T5-T7", code: "HSK5-357-SANG", level: "HSK5", teacher: teachers[4], desc: "Lớp HSK 5 buổi sáng: T3, T5, T7 từ 8h-11h." },
    { name: "Tiếng Trung Y khoa", code: "MED-24-TOI", level: "ADVANCED", teacher: teachers[3], desc: "Lớp tiếng Trung chuyên ngành Y khoa: T2, T4 từ 19h-21h." },
    { name: "Luyện viết Hán tự - Cuối tuần", code: "HANTU-CN", level: "BASIC", teacher: teachers[2], desc: "Lớp luyện viết Hán tự: CN 14h-16h30. Từ nét cơ bản đến chữ phức tạp." },
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

  console.log(`✅ Created 25 classes`)

  // ============= Enroll students (varied distribution) =============
  console.log("��� Enrolling students into classes...")
  const enrollments: { classId: string; studentId: string; status: string }[] = []

  // Distribute students across classes (15-17 per class)
  let studentIndex = 0
  classes.forEach((cls, classIndex) => {
    const studentsPerClass = 15 + (classIndex % 3) // 15, 16, or 17
    for (let i = 0; i < studentsPerClass && studentIndex < students.length; i++) {
      enrollments.push({
        classId: cls.id,
        studentId: students[studentIndex].id,
        status: EnrollmentStatus.ENROLLED,
      })
      studentIndex++
      if (studentIndex >= students.length) studentIndex = 0 // wrap around
    }
  })

  // Ensure student1 (Lê Văn Cường) is enrolled in at least one class per HSK level
  // The round-robin above may skip HSK3 and HSK5 for student1
  const student1Id = students[0].id
  const student1ClassIds = new Set(
    enrollments.filter((e) => e.studentId === student1Id).map((e) => e.classId),
  )
  const student1HskLevels = new Set(
    [...student1ClassIds].map((classId) => {
      const idx = classes.findIndex((c) => c.id === classId)
      return idx >= 0 ? classesData[idx].level : null
    }).filter(Boolean),
  )

  // Add enrollments for missing HSK levels
  for (const cls of classesData) {
    if (!cls.level.startsWith("HSK")) continue
    if (student1HskLevels.has(cls.level)) continue
    const classRecord = classes[classesData.indexOf(cls)]
    if (classRecord && !student1ClassIds.has(classRecord.id)) {
      enrollments.push({
        classId: classRecord.id,
        studentId: student1Id,
        status: EnrollmentStatus.ENROLLED,
      })
      student1HskLevels.add(cls.level)
      student1ClassIds.add(classRecord.id)
    }
  }

  await prisma.portalClassEnrollment.createMany({ data: enrollments })
  console.log(`✅ Created ${enrollments.length} enrollments`)

  // ============= Portal Schedules =============
  console.log("��� Creating class schedules...")
  const schedules: { classId: string; teacherId: string; title: string; description: string; startTime: Date; endTime: Date; status: string }[] = []

  // Helper to create schedules for a class
  const createSchedules = (
    cls: { id: string; teacherId: string; className: string; description: string | null },
    weekdays: number[],
    startHour: number,
    endHour: number
  ) => {
    const start = new Date("2026-02-01")
    const end = new Date("2026-03-31")

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (weekdays.includes(d.getDay())) {
        const startTime = new Date(d)
        startTime.setHours(startHour, 0, 0, 0)
        const endTime = new Date(d)
        endTime.setHours(endHour, 0, 0, 0)

        schedules.push({
          classId: cls.id,
          teacherId: cls.teacherId,
          title: `${cls.className} - Buổi học`,
          description: cls.description ?? "",
          startTime,
          endTime,
          status: ScheduleStatus.SCHEDULED,
        })
      }
    }
  }

  // Class 0: HSK1-246-SANG (Mon/Wed/Fri 8-10)
  createSchedules(classes[0], [1, 3, 5], 8, 10)
  // Class 1: HSK1-357-TOI (Tue/Thu/Sat 18:30-20:30)
  createSchedules(classes[1], [2, 4, 6], 18, 20)
  // Class 2: HSK2-246-SANG (Mon/Wed/Fri 8-10)
  createSchedules(classes[2], [1, 3, 5], 8, 10)
  // Class 3: HSK2-357-TOI (Tue/Thu/Sat 18:30-20:30)
  createSchedules(classes[3], [2, 4, 6], 18, 20)
  // Class 4: HSK3-24-CHIEU (Mon/Wed 14-17)
  createSchedules(classes[4], [1, 3], 14, 17)
  // Class 5: HSK3-35-TOI (Tue/Thu 18:30-21)
  createSchedules(classes[5], [2, 4], 18, 21)
  // Class 6: HSK4-246-SANG (Mon/Wed/Fri 8-11)
  createSchedules(classes[6], [1, 3, 5], 8, 11)
  // Class 7: HSK4-357-TOI (Tue/Thu/Sat 18:30-21:30)
  createSchedules(classes[7], [2, 4, 6], 18, 21)
  // Class 8: HSK5-24-CHIEU (Mon/Wed 14-17)
  createSchedules(classes[8], [1, 3], 14, 17)
  // Class 9: HSK6-35-TOI (Tue/Thu 18:30-21:30)
  createSchedules(classes[9], [2, 4], 18, 21)
  // Class 10: GT-CN-SANG (Sun 9-12)
  createSchedules(classes[10], [0], 9, 12)
  // Class 11: GT-T7-CHIEU (Sat 14-17)
  createSchedules(classes[11], [6], 14, 17)
  // Class 12: BUSINESS-35-TOI (Tue/Thu 19-21)
  createSchedules(classes[12], [2, 4], 19, 21)
  // Class 13: HSK3-INT-SANG (Mon-Fri 8-10)
  createSchedules(classes[13], [1, 2, 3, 4, 5], 8, 10)
  // Class 14: HSK5-INT-TOI (Mon-Fri 18:30-20:30)
  createSchedules(classes[14], [1, 2, 3, 4, 5], 18, 20)
  // Class 15: HSK1-24-CHIEU (Mon/Wed 14-16)
  createSchedules(classes[15], [1, 3], 14, 16)
  // Class 16: HSK2-T7-SANG (Sat 9-12)
  createSchedules(classes[16], [6], 9, 12)
  // Class 17: HSK3-246-SANG (Mon/Wed/Fri 8-10)
  createSchedules(classes[17], [1, 3, 5], 8, 10)
  // Class 18: HSK4-35-CHIEU (Tue/Thu 14-17)
  createSchedules(classes[18], [2, 4], 14, 17)
  // Class 19: HSK1-246-OL Online (Mon/Wed/Fri 20-21:30)
  createSchedules(classes[19], [1, 3, 5], 20, 21)
  // Class 20: HSK2-357-OL Online (Tue/Thu/Sat 20-21:30)
  createSchedules(classes[20], [2, 4, 6], 20, 21)
  // Class 21: GT-DL-T7 (Sat 9-11:30)
  createSchedules(classes[21], [6], 9, 11)
  // Class 22: HSK5-357-SANG (Tue/Thu/Sat 8-11)
  createSchedules(classes[22], [2, 4, 6], 8, 11)
  // Class 23: MED-24-TOI (Mon/Wed 19-21)
  createSchedules(classes[23], [1, 3], 19, 21)
  // Class 24: HANTU-CN (Sun 14-16:30)
  createSchedules(classes[24], [0], 14, 16)

  await prisma.portalSchedule.createMany({ data: schedules })
  console.log(`✅ Created ${schedules.length} schedules`)

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
    // HSK 3
    { title: "Bài tập ngữ pháp HSK 3 - 把字句", desc: "Hoàn thành 20 câu sử dụng cấu trúc 把字句. Phân biệt với câu bình thường.", type: "HOMEWORK", maxScore: 100, tags: ["ngữ-pháp", "HSK3"] },
    { title: "Kiểm tra đọc hiểu HSK 3", desc: "3 bài đọc dài, mỗi bài 5 câu hỏi. Tổng 15 câu, thời gian 30 phút.", type: "READING", maxScore: 75, tags: ["đọc-hiểu", "HSK3"] },
    { title: "Bài viết HSK 3 - Kể về kỳ nghỉ", desc: "Viết bài văn 200-300 chữ kể về kỳ nghỉ gần nhất. Sử dụng ít nhất 5 cấu trúc ngữ pháp HSK 3.", type: "WRITING", maxScore: 100, tags: ["viết", "HSK3"] },
    // HSK 4-5
    { title: "Phân tích bài báo tiếng Trung", desc: "Đọc bài báo đính kèm, tóm tắt nội dung (150 chữ) và nêu ý kiến cá nhân (200 chữ).", type: "READING", maxScore: 100, tags: ["đọc-hiểu", "HSK4"] },
    { title: "Kiểm tra tổng hợp HSK 4", desc: "Đề thi mô phỏng HSK 4: Nghe (45 câu) + Đọc (40 câu) + Viết (15 câu). Thời gian: 105 phút.", type: "QUIZ", maxScore: 300, tags: ["kiểm-tra", "HSK4"] },
    { title: "Thuyết trình: Văn hóa Trung Quốc", desc: "Thuyết trình 5-7 phút về một khía cạnh văn hóa Trung Quốc (lễ hội, ẩm thực, phong tục...). Chuẩn bị slide.", type: "SPEAKING", maxScore: 100, tags: ["thuyết-trình", "văn-hóa"] },
    // Business / Advanced
    { title: "Bài tập tiếng Trung thương mại - Email", desc: "Viết 3 email thương mại: hỏi giá, đặt hàng, khiếu nại. Mỗi email 100-150 chữ.", type: "WRITING", maxScore: 90, tags: ["thương-mại", "viết"] },
    { title: "Luyện thi HSK 5 - Đề số 1", desc: "Làm đề thi thử HSK 5 đầy đủ. Nộp bài và tự chấm theo đáp án.", type: "QUIZ", maxScore: 300, tags: ["luyện-thi", "HSK5"] },
    // Communication
    { title: "Bài tập giao tiếp: Đặt phòng khách sạn", desc: "Ghi âm hội thoại đặt phòng khách sạn (check-in, hỏi dịch vụ, check-out). 3-4 phút.", type: "SPEAKING", maxScore: 80, tags: ["giao-tiếp", "nói"] },
    { title: "Bài tập từ vựng giao tiếp du lịch", desc: "Học 40 từ vựng chủ đề du lịch và hoàn thành bài tập điền từ.", type: "HOMEWORK", maxScore: 100, tags: ["từ-vựng", "du-lịch"] },
    // General
    { title: "Luyện viết chữ Hán - Bộ thủ", desc: "Luyện viết 20 bộ thủ thường gặp. Mỗi bộ thủ viết 5 lần kèm ví dụ chữ chứa bộ thủ đó.", type: "WRITING", maxScore: 60, tags: ["viết", "hán-tự", "bộ-thủ"] },
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

  // Create 3-5 assignments per class (first 15 classes to keep it manageable)
  for (let ci = 0; ci < Math.min(classes.length, 15); ci++) {
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
          status: ai === 0 && ci < 3 ? AssignmentStatus.DRAFT : AssignmentStatus.PUBLISHED,
        },
      })
      allAssignments.push({ ...assignment, classIndex: ci })
    }
  }

  console.log(`✅ Created ${allAssignments.length} assignments`)

  // ============= Portal Assignment Submissions =============
  console.log("📤 Creating assignment submissions...")

  let submissionCount = 0

  for (const assignment of allAssignments) {
    // Only active assignments get submissions
    if (assignment.status === AssignmentStatus.DRAFT) continue

    // Find enrolled students in this class
    const classEnrollments = enrollments.filter((e) => e.classId === assignment.classId)
    // 40-70% of students submit
    const submitCount = Math.floor(classEnrollments.length * (0.4 + Math.random() * 0.3))

    for (let si = 0; si < submitCount; si++) {
      const enrollment = classEnrollments[si]
      if (!enrollment) continue

      const isLate = Math.random() < 0.15 // 15% chance of late submission
      const isGraded = Math.random() < 0.6 // 60% chance of being graded

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
        // Score between 50-100% of maxScore
        const scorePercent = 0.5 + Math.random() * 0.5
        submissionData.score = Math.round(assignment.maxScore * scorePercent * 10) / 10
        submissionData.status = SubmissionStatus.GRADED
        const feedbacks = [
          "Bài làm tốt, cần chú ý thêm thanh điệu.",
          "Rất tốt! Ngữ pháp chính xác, từ vựng phong phú.",
          "Khá, cần cải thiện phần viết chữ Hán.",
          "Tốt, nhưng cần luyện thêm phần nghe.",
          "Xuất sắc! Tiếp tục phát huy.",
          "Cần ôn lại phần ngữ pháp 把字句 và 被字句.",
          "Bài viết có tiến bộ rõ rệt so với lần trước.",
          "Phát âm tốt, cần chú ý thêm thanh 3 và thanh 4.",
        ]
        submissionData.feedback = feedbacks[si % feedbacks.length]
      }

      try {
        await prisma.portalAssignmentSubmission.create({ data: submissionData })
        submissionCount++
      } catch {
        // Skip duplicate submissions (same student + assignment)
      }
    }
  }

  console.log(`✅ Created ${submissionCount} submissions`)

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

    // Seed progress for the first 6 lessons (varying levels of mastery)
    const lessonProgressConfigs = [
      { lessonIndex: 0, masteryPercent: 85, learnedPct: 1.0, masteredPct: 0.85, timeSec: 1800 },
      { lessonIndex: 1, masteryPercent: 70, learnedPct: 1.0, masteredPct: 0.7, timeSec: 1500 },
      { lessonIndex: 2, masteryPercent: 45, learnedPct: 0.9, masteredPct: 0.45, timeSec: 1200 },
      { lessonIndex: 3, masteryPercent: 20, learnedPct: 0.6, masteredPct: 0.2, timeSec: 600 },
      { lessonIndex: 4, masteryPercent: 10, learnedPct: 0.3, masteredPct: 0.1, timeSec: 300 },
      { lessonIndex: 5, masteryPercent: 0, learnedPct: 0.1, masteredPct: 0, timeSec: 60 },
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
