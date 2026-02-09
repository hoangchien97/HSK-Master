import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import {
  UserRole,
  UserStatus,
  ClassStatus,
  EnrollmentStatus,
  ScheduleStatus,
  AttendanceStatus,
} from "@/enums/portal"

const prisma = new PrismaClient()

export async function seedPortal() {
  console.log("\n��� Seeding portal data...")

  // ============= Clear existing portal data =============
  console.log("���️  Clearing existing portal data...")
  await prisma.portalQuizAttempt.deleteMany()
  await prisma.portalQuiz.deleteMany()
  await prisma.portalBookmark.deleteMany()
  await prisma.portalVocabulary.deleteMany()
  await prisma.portalLearningProgress.deleteMany()
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
  const admin = await prisma.portalUser.create({
    data: {
      name: "admin",
      fullName: "Admin HSK Ruby",
      email: "admin@hskmaster.com",
      password: hashedPassword,
      role: UserRole.SYSTEM_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      phoneNumber: "0900000000",
      biography: "Quản trị viên hệ thống HSK Ruby",
    },
  })

  // Create 5 Teachers
  const teachers = await Promise.all([
    prisma.portalUser.create({
      data: {
        name: "nguyen-van-an",
        fullName: "Nguyễn Văn An",
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
        name: "tran-thi-binh",
        fullName: "Trần Thị Bình",
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
        name: "le-minh-chau",
        fullName: "Lê Minh Châu",
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
        name: "pham-thu-dung",
        fullName: "Phạm Thu Dung",
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
        name: "vo-quang-em",
        fullName: "Võ Quang Em",
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
    studentNames.map((name, index) => {
      const slug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/\s+/g, "-")

      return prisma.portalUser.create({
        data: {
          name: slug,
          fullName: name,
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
    { name: "HSK 1 - Lớp Sáng T2-T4-T6", code: "HSK1-246-SANG", level: "HSK1", teacher: teachers[0], max: 15, desc: "Lớp HSK 1 buổi sáng: T2, T4, T6 từ 8h-10h. Người mới bắt đầu." },
    { name: "HSK 1 - Lớp Tối T3-T5-T7", code: "HSK1-357-TOI", level: "HSK1", teacher: teachers[0], max: 17, desc: "Lớp HSK 1 buổi tối: T3, T5, T7 từ 18h30-20h30." },
    { name: "HSK 2 - Lớp Sáng T2-T4-T6", code: "HSK2-246-SANG", level: "HSK2", teacher: teachers[1], max: 16, desc: "Lớp HSK 2 buổi sáng: T2, T4, T6 từ 8h-10h. Dành cho học viên hoàn thành HSK 1." },
    { name: "HSK 2 - Lớp Tối T3-T5-T7", code: "HSK2-357-TOI", level: "HSK2", teacher: teachers[1], max: 15, desc: "Lớp HSK 2 buổi tối: T3, T5, T7 từ 18h30-20h30." },
    { name: "HSK 3 - Lớp Chiều T2-T4", code: "HSK3-24-CHIEU", level: "HSK3", teacher: teachers[2], max: 15, desc: "Lớp HSK 3 buổi chiều: T2, T4 từ 14h-17h. Cần nền tảng HSK 2." },
    { name: "HSK 3 - Lớp Tối T3-T5", code: "HSK3-35-TOI", level: "HSK3", teacher: teachers[2], max: 16, desc: "Lớp HSK 3 buổi tối: T3, T5 từ 18h30-21h." },
    { name: "HSK 4 - Lớp Sáng T2-T4-T6", code: "HSK4-246-SANG", level: "HSK4", teacher: teachers[4], max: 12, desc: "Lớp HSK 4 buổi sáng: T2, T4, T6 từ 8h-11h. Cần hoàn thành HSK 3." },
    { name: "HSK 4 - Lớp Tối T3-T5-T7", code: "HSK4-357-TOI", level: "HSK4", teacher: teachers[4], max: 15, desc: "Lớp HSK 4 buổi tối: T3, T5, T7 từ 18h30-21h30." },
    { name: "HSK 5 - Lớp Chiều T2-T4", code: "HSK5-24-CHIEU", level: "HSK5", teacher: teachers[4], max: 10, desc: "Lớp HSK 5 buổi chiều: T2, T4 từ 14h-17h. Trình độ HSK 4." },
    { name: "HSK 6 - Lớp Tối T3-T5", code: "HSK6-35-TOI", level: "HSK6", teacher: teachers[4], max: 8, desc: "Lớp HSK 6 buổi tối: T3, T5 từ 18h30-21h30. Trình độ HSK 5." },
    { name: "Giao tiếp cơ bản - Cuối tuần", code: "GT-CN-SANG", level: "BASIC", teacher: teachers[3], max: 20, desc: "Lớp giao tiếp cơ bản: CN 9h-12h. Tập trung nói và nghe." },
    { name: "Giao tiếp nâng cao - Cuối tuần", code: "GT-T7-CHIEU", level: "ADVANCED", teacher: teachers[3], max: 15, desc: "Lớp giao tiếp nâng cao: T7 14h-17h. Thực hành đàm thoại." },
    { name: "Tiếng Trung thương mại", code: "BUSINESS-35-TOI", level: "BUSINESS", teacher: teachers[4], max: 12, desc: "Lớp tiếng Trung thương mại: T3, T5 từ 19h-21h." },
    { name: "Luyện thi HSK 3 - Intensive", code: "HSK3-INT-SANG", level: "HSK3", teacher: teachers[2], max: 16, desc: "Khóa luyện thi HSK 3 chuyên sâu: T2-T6 từ 8h-10h." },
    { name: "Luyện thi HSK 5 - Intensive", code: "HSK5-INT-TOI", level: "HSK5", teacher: teachers[4], max: 12, desc: "Khóa luyện thi HSK 5 chuyên sâu: T2-T6 từ 18h30-20h30." },
    // Additional 10 classes to reach 25 total — for pagination testing
    { name: "HSK 1 - Lớp Chiều T2-T4", code: "HSK1-24-CHIEU", level: "HSK1", teacher: teachers[0], max: 18, desc: "Lớp HSK 1 buổi chiều: T2, T4 từ 14h-16h. Người mới bắt đầu." },
    { name: "HSK 2 - Lớp Cuối tuần", code: "HSK2-T7-SANG", level: "HSK2", teacher: teachers[1], max: 20, desc: "Lớp HSK 2 cuối tuần: T7 9h-12h. Tiến độ chậm cho người bận." },
    { name: "HSK 3 - Lớp Sáng T2-T4-T6", code: "HSK3-246-SANG", level: "HSK3", teacher: teachers[2], max: 14, desc: "Lớp HSK 3 buổi sáng: T2, T4, T6 từ 8h-10h." },
    { name: "HSK 4 - Lớp Chiều T3-T5", code: "HSK4-35-CHIEU", level: "HSK4", teacher: teachers[4], max: 12, desc: "Lớp HSK 4 buổi chiều: T3, T5 từ 14h-17h." },
    { name: "HSK 1 - Lớp Online T2-T4-T6", code: "HSK1-246-OL", level: "HSK1", teacher: teachers[0], max: 25, desc: "Lớp HSK 1 online: T2, T4, T6 từ 20h-21h30." },
    { name: "HSK 2 - Lớp Online T3-T5-T7", code: "HSK2-357-OL", level: "HSK2", teacher: teachers[1], max: 25, desc: "Lớp HSK 2 online: T3, T5, T7 từ 20h-21h30." },
    { name: "Giao tiếp du lịch - Cuối tuần", code: "GT-DL-T7", level: "BASIC", teacher: teachers[3], max: 20, desc: "Lớp giao tiếp du lịch: T7 9h-11h30. Hội thoại thực tế." },
    { name: "HSK 5 - Lớp Sáng T3-T5-T7", code: "HSK5-357-SANG", level: "HSK5", teacher: teachers[4], max: 10, desc: "Lớp HSK 5 buổi sáng: T3, T5, T7 từ 8h-11h." },
    { name: "Tiếng Trung Y khoa", code: "MED-24-TOI", level: "ADVANCED", teacher: teachers[3], max: 10, desc: "Lớp tiếng Trung chuyên ngành Y khoa: T2, T4 từ 19h-21h." },
    { name: "Luyện viết Hán tự - Cuối tuần", code: "HANTU-CN", level: "BASIC", teacher: teachers[2], max: 18, desc: "Lớp luyện viết Hán tự: CN 14h-16h30. Từ nét cơ bản đến chữ phức tạp." },
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
          maxStudents: cls.max,
          status: ClassStatus.ACTIVE,
        },
      })
    )
  )

  console.log(`✅ Created 25 classes`)

  // ============= Enroll students (varied distribution) =============
  console.log("��� Enrolling students into classes...")
  const enrollments: any[] = []

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

  await prisma.portalClassEnrollment.createMany({ data: enrollments })
  console.log(`✅ Created ${enrollments.length} enrollments`)

  // ============= Portal Schedules =============
  console.log("��� Creating class schedules...")
  const schedules: any[] = []

  // Helper to create schedules for a class
  const createSchedules = (
    cls: any,
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
          description: cls.description,
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

  console.log("\n✅ Portal seeding completed!")
}
