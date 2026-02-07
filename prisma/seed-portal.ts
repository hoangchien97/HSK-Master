import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import {
  USER_ROLE,
  STATUS,
  CLASS_STATUS,
  SCHEDULE_STATUS,
  ENROLLMENT_STATUS,
} from '../app/constants/portal/roles'

const prisma = new PrismaClient()

export async function seedPortal() {
  console.log("\n🔐 Seeding portal data...")

  // ============= Clear existing portal data =============
  console.log("🗑️  Clearing existing portal data...")
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
  console.log("👥 Creating portal users...")

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create Admin User
  const admin = await prisma.portalUser.create({
    data: {
      name: "admin",
      fullName: "Admin HSK Master",
      email: "admin@hskmaster.com",
      password: hashedPassword,
      role: USER_ROLE.SYSTEM_ADMIN,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      phoneNumber: "0900000000",
      biography: "Quản trị viên hệ thống HSK Master",
    },
  })

  // Create Teachers
  const teacher1 = await prisma.portalUser.create({
    data: {
      name: "nguyen-van-an",
      fullName: "Nguyễn Văn An",
      email: "teacher1@hskmaster.com",
      password: hashedPassword,
      role: USER_ROLE.TEACHER,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1",
      phoneNumber: "0901234567",
      biography: "Giáo viên tiếng Trung với 5 năm kinh nghiệm giảng dạy HSK. Chuyên môn: HSK 1-3, Giao tiếp cơ bản.",
    },
  })

  const teacher2 = await prisma.portalUser.create({
    data: {
      name: "tran-thi-binh",
      fullName: "Trần Thị Bình",
      email: "teacher2@hskmaster.com",
      password: hashedPassword,
      role: USER_ROLE.TEACHER,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2",
      phoneNumber: "0907654321",
      biography: "Tốt nghiệp Đại học Bắc Kinh, 8 năm kinh nghiệm. Chuyên môn: HSK 4-6, Tiếng Trung thương mại.",
    },
  })

  // Create Students
  const student1 = await prisma.portalUser.create({
    data: {
      name: "le-van-cuong",
      fullName: "Lê Văn Cường",
      email: "student1@gmail.com",
      password: hashedPassword,
      role: USER_ROLE.STUDENT,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student1",
      phoneNumber: "0901000001",
      dateOfBirth: new Date(1995, 0, 15),
      address: "1 Đường ABC, Quận 1, TP.HCM",
    },
  })

  const student2 = await prisma.portalUser.create({
    data: {
      name: "pham-thi-dung",
      fullName: "Phạm Thị Dung",
      email: "student2@gmail.com",
      password: hashedPassword,
      role: USER_ROLE.STUDENT,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student2",
      phoneNumber: "0901000002",
      dateOfBirth: new Date(1996, 1, 20),
      address: "2 Đường ABC, Quận 2, TP.HCM",
    },
  })

  const student3 = await prisma.portalUser.create({
    data: {
      name: "hoang-van-em",
      fullName: "Hoàng Văn Em",
      email: "student3@gmail.com",
      password: hashedPassword,
      role: USER_ROLE.STUDENT,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student3",
      phoneNumber: "0901000003",
      dateOfBirth: new Date(1997, 2, 10),
      address: "3 Đường ABC, Quận 3, TP.HCM",
    },
  })

  const student4 = await prisma.portalUser.create({
    data: {
      name: "ngo-thi-hoa",
      fullName: "Ngô Thị Hoa",
      email: "student4@gmail.com",
      password: hashedPassword,
      role: USER_ROLE.STUDENT,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student4",
      phoneNumber: "0901000004",
      dateOfBirth: new Date(1998, 3, 5),
      address: "4 Đường ABC, Quận 4, TP.HCM",
    },
  })

  const student5 = await prisma.portalUser.create({
    data: {
      name: "do-van-khoa",
      fullName: "Đỗ Văn Khoa",
      email: "student5@gmail.com",
      password: hashedPassword,
      role: USER_ROLE.STUDENT,
      status: STATUS.ACTIVE,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student5",
      phoneNumber: "0901000005",
      dateOfBirth: new Date(1999, 4, 25),
      address: "5 Đường ABC, Quận 5, TP.HCM",
    },
  })

  console.log(`✅ Created 1 admin, 2 teachers and 5 students`)

  // ============= Portal Classes =============
  console.log("🏫 Creating classes...")
  const class1 = await prisma.portalClass.create({
    data: {
      className: "HSK 1 - Lớp Sáng T2-T4-T6",
      classCode: "HSK1-246-SANG",
      description: "Lớp học HSK 1 buổi sáng: Thứ 2, 4, 6 từ 8h-10h. Phù hợp cho người mới bắt đầu.",
      teacherId: teacher1.id,
      level: "HSK1",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-05-01"),
      maxStudents: 15,
      status: CLASS_STATUS.ACTIVE,
    },
  })

  const class2 = await prisma.portalClass.create({
    data: {
      className: "HSK 2 - Lớp Tối T3-T5-T7",
      classCode: "HSK2-357-TOI",
      description: "Lớp học HSK 2 buổi tối: Thứ 3, 5, 7 từ 18h30-20h30. Dành cho học viên đã hoàn thành HSK 1.",
      teacherId: teacher1.id,
      level: "HSK2",
      startDate: new Date("2026-02-03"),
      endDate: new Date("2026-05-15"),
      maxStudents: 15,
      status: CLASS_STATUS.ACTIVE,
    },
  })

  const class3 = await prisma.portalClass.create({
    data: {
      className: "HSK 3 - Lớp Chiều T2-T4",
      classCode: "HSK3-24-CHIEU",
      description: "Lớp học HSK 3 buổi chiều: Thứ 2, 4 từ 14h-17h. Học viên cần có nền tảng HSK 2.",
      teacherId: teacher2.id,
      level: "HSK3",
      startDate: new Date("2026-02-02"),
      endDate: new Date("2026-06-30"),
      maxStudents: 12,
      status: CLASS_STATUS.ACTIVE,
    },
  })

  const class4 = await prisma.portalClass.create({
    data: {
      className: "Giao tiếp cơ bản - Cuối tuần",
      classCode: "GT-CN-SANG",
      description: "Lớp giao tiếp tiếng Trung cơ bản: Chủ nhật 9h-12h. Tập trung vào kỹ năng nói và nghe.",
      teacherId: teacher2.id,
      level: "BASIC",
      startDate: new Date("2026-02-07"),
      endDate: new Date("2026-05-30"),
      maxStudents: 20,
      status: CLASS_STATUS.ACTIVE,
    },
  })

  console.log(`✅ Created 4 classes`)

  // ============= Portal Class Enrollments =============
  console.log("📝 Enrolling students into classes...")
  await prisma.portalClassEnrollment.createMany({
    data: [
      // Class 1 (HSK 1)
      { classId: class1.id, studentId: student1.id, status: ENROLLMENT_STATUS.ENROLLED },
      { classId: class1.id, studentId: student2.id, status: ENROLLMENT_STATUS.ENROLLED },
      { classId: class1.id, studentId: student3.id, status: ENROLLMENT_STATUS.ENROLLED },
      { classId: class1.id, studentId: student4.id, status: ENROLLMENT_STATUS.ENROLLED },
      // Class 2 (HSK 2)
      { classId: class2.id, studentId: student2.id, status: ENROLLMENT_STATUS.ENROLLED },
      { classId: class2.id, studentId: student5.id, status: ENROLLMENT_STATUS.ENROLLED },
      // Class 3 (HSK 3)
      { classId: class3.id, studentId: student3.id, status: ENROLLMENT_STATUS.ENROLLED },
      { classId: class3.id, studentId: student4.id, status: ENROLLMENT_STATUS.ENROLLED },
      // Class 4 (Giao tiếp)
      { classId: class4.id, studentId: student1.id, status: ENROLLMENT_STATUS.ENROLLED },
      { classId: class4.id, studentId: student4.id, status: ENROLLMENT_STATUS.ENROLLED },
      { classId: class4.id, studentId: student5.id, status: ENROLLMENT_STATUS.ENROLLED },
    ],
  })
  console.log(`✅ Created 11 enrollments`)

  // ============= Portal Schedules =============
  console.log("📅 Creating class schedules...")
  await prisma.portalSchedule.createMany({
    data: [
      // Class 1 schedules
      {
        classId: class1.id,
        teacherId: teacher1.id,
        title: "Bài 1: Chào hỏi cơ bản",
        startTime: new Date("2026-02-02T08:00:00"),
        endTime: new Date("2026-02-02T10:00:00"),
        location: "Phòng 301",
        status: SCHEDULE_STATUS.SCHEDULED
      },
      {
        classId: class1.id,
        teacherId: teacher1.id,
        title: "Bài 2: Giới thiệu bản thân",
        startTime: new Date("2026-02-04T08:00:00"),
        endTime: new Date("2026-02-04T10:00:00"),
        location: "Phòng 301",
        status: SCHEDULE_STATUS.SCHEDULED
      },
      {
        classId: class1.id,
        teacherId: teacher1.id,
        title: "Bài 3: Số đếm 1-10",
        startTime: new Date("2026-02-06T08:00:00"),
        endTime: new Date("2026-02-06T10:00:00"),
        location: "Phòng 301",
        status: SCHEDULE_STATUS.SCHEDULED
      },
      // Class 2 schedules
      {
        classId: class2.id,
        teacherId: teacher1.id,
        title: "Bài 1: Hỏi đường",
        startTime: new Date("2026-02-03T18:30:00"),
        endTime: new Date("2026-02-03T20:30:00"),
        location: "Phòng 302",
        status: SCHEDULE_STATUS.SCHEDULED
      },
      {
        classId: class2.id,
        teacherId: teacher1.id,
        title: "Bài 2: Mua sắm",
        startTime: new Date("2026-02-05T18:30:00"),
        endTime: new Date("2026-02-05T20:30:00"),
        location: "Phòng 302",
        status: SCHEDULE_STATUS.SCHEDULED
      },
      // Class 3 schedules
      {
        classId: class3.id,
        teacherId: teacher2.id,
        title: "Bài 1: Văn hóa Trung Quốc",
        startTime: new Date("2026-02-02T14:00:00"),
        endTime: new Date("2026-02-02T17:00:00"),
        location: "Phòng 303",
        status: SCHEDULE_STATUS.SCHEDULED
      },
      {
        classId: class3.id,
        teacherId: teacher2.id,
        title: "Bài 2: Du lịch",
        startTime: new Date("2026-02-04T14:00:00"),
        endTime: new Date("2026-02-04T17:00:00"),
        location: "Phòng 303",
        status: SCHEDULE_STATUS.SCHEDULED
      },
      // Class 4 schedule
      {
        classId: class4.id,
        teacherId: teacher2.id,
        title: "Chủ đề 1: Giao tiếp hàng ngày",
        startTime: new Date("2026-02-07T09:00:00"),
        endTime: new Date("2026-02-07T12:00:00"),
        location: "Phòng 304",
        status: SCHEDULE_STATUS.SCHEDULED
      },
    ],
  })
  console.log(`✅ Created 8 schedules`)

  console.log("\n🎉 Portal seeding completed successfully!")
  console.log("==================================================")
  console.log("📊 Summary:")
  console.log("   - Users: 8 (1 admin, 2 teachers, 5 students)")
  console.log("   - Classes: 4")
  console.log("   - Enrollments: 11")
  console.log("   - Schedules: 8")
  console.log("==================================================")
  console.log("\n📧 Login credentials:")
  console.log("   Admin: admin@hskmaster.com / password123")
  console.log("   Teacher 1: teacher1@hskmaster.com / password123")
  console.log("   Teacher 2: teacher2@hskmaster.com / password123")
  console.log("   Students: student1@gmail.com - student5@gmail.com / password123")
  console.log("==================================================\n")
}
