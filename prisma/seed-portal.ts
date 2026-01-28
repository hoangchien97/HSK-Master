import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Role constants (since role is a String field in schema)
const ROLE = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN'
} as const

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
  await prisma.portalStudent.deleteMany()
  await prisma.portalTeacher.deleteMany()
  await prisma.portalUser.deleteMany()
  console.log("✅ Cleared existing portal data")

  // ============= Portal Users =============
  console.log("👥 Creating portal users...")
  
  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create Admin/Teacher Users
  const teachers = await prisma.portalUser.createManyAndReturn({
    data: [
      {
        email: "teacher1@hskmaster.com",
        name: "Thầy Nguyễn Văn An",
        password: hashedPassword,
        role: ROLE.TEACHER,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1",
      },
      {
        email: "teacher2@hskmaster.com",
        name: "Cô Trần Thị Bình",
        password: hashedPassword,
        role: ROLE.TEACHER,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2",
      },
      {
        email: "admin@hskmaster.com",
        name: "Admin HSK Master",
        password: hashedPassword,
        role: ROLE.TEACHER, // Teachers are also admins
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      },
    ],
  })

  // Create Student Users
  const students = await prisma.portalUser.createManyAndReturn({
    data: [
      {
        email: "student1@gmail.com",
        name: "Lê Văn Cường",
        password: hashedPassword,
        role: ROLE.STUDENT,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student1",
      },
      {
        email: "student2@gmail.com",
        name: "Phạm Thị Dung",
        password: hashedPassword,
        role: ROLE.STUDENT,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student2",
      },
      {
        email: "student3@gmail.com",
        name: "Hoàng Văn Em",
        password: hashedPassword,
        role: ROLE.STUDENT,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student3",
      },
      {
        email: "student4@gmail.com",
        name: "Ngô Thị Hoa",
        password: hashedPassword,
        role: ROLE.STUDENT,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student4",
      },
      {
        email: "student5@gmail.com",
        name: "Đỗ Văn Khoa",
        password: hashedPassword,
        role: ROLE.STUDENT,
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=student5",
      },
    ],
  })

  console.log(`✅ Created ${teachers.length} teachers and ${students.length} students`)

  // ============= Portal Teachers =============
  console.log("👨‍🏫 Creating teacher profiles...")
  const teacherProfiles = await prisma.portalTeacher.createManyAndReturn({
    data: [
      {
        userId: teachers[0].id,
        teacherCode: "GV001",
        firstName: "Văn An",
        lastName: "Nguyễn",
        phoneNumber: "0901234567",
        biography: "Giáo viên tiếng Trung với 5 năm kinh nghiệm giảng dạy HSK. Chuyên môn: HSK 1-3, Giao tiếp cơ bản.",
        specialization: "HSK 1-3, Giao tiếp",
      },
      {
        userId: teachers[1].id,
        teacherCode: "GV002",
        firstName: "Thị Bình",
        lastName: "Trần",
        phoneNumber: "0907654321",
        biography: "Tốt nghiệp Đại học Bắc Kinh, 8 năm kinh nghiệm. Chuyên môn: HSK 4-6, Tiếng Trung thương mại.",
        specialization: "HSK 4-6, Thương mại",
      },
      {
        userId: teachers[2].id,
        teacherCode: "GV000",
        firstName: "HSK Master",
        lastName: "Admin",
        phoneNumber: "0909999999",
        biography: "Quản trị viên hệ thống HSK Master. Quản lý và điều phối các khóa học.",
        specialization: "Quản trị hệ thống",
      },
    ],
  })
  console.log(`✅ Created ${teacherProfiles.length} teacher profiles`)

  // ============= Portal Students =============
  console.log("👨‍🎓 Creating student profiles...")
  const studentNames = [
    { firstName: "Văn Cường", lastName: "Lê" },
    { firstName: "Thị Dung", lastName: "Phạm" },
    { firstName: "Văn Em", lastName: "Hoàng" },
    { firstName: "Thị Hoa", lastName: "Ngô" },
    { firstName: "Văn Khoa", lastName: "Đỗ" },
  ]
  const studentProfiles = await prisma.portalStudent.createManyAndReturn({
    data: students.map((student, index) => ({
      userId: student.id,
      studentCode: `HS${String(index + 1).padStart(4, '0')}`, // HS0001, HS0002, etc.
      firstName: studentNames[index].firstName,
      lastName: studentNames[index].lastName,
      phoneNumber: `090${String(1000000 + index)}`,
      dateOfBirth: new Date(1995 + index, index % 12, (index * 7) % 28 + 1),
      address: `${index + 1} Đường ABC, Quận ${index + 1}, TP.HCM`,
    })),
  })
  console.log(`✅ Created ${studentProfiles.length} student profiles`)

  // ============= Portal Classes =============
  console.log("🏫 Creating classes...")
  const classes = await prisma.portalClass.createManyAndReturn({
    data: [
      {
        className: "HSK 1 - Lớp Sáng T2-T4-T6",
        classCode: "HSK1-246-SANG",
        description: "Lớp học HSK 1 buổi sáng: Thứ 2, 4, 6 từ 8h-10h. Phù hợp cho người mới bắt đầu.",
        teacherId: teacherProfiles[0].id,
        level: "HSK1",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-05-01"),
        maxStudents: 15,
        status: "ACTIVE",
      },
      {
        className: "HSK 2 - Lớp Tối T3-T5-T7",
        classCode: "HSK2-357-TOI",
        description: "Lớp học HSK 2 buổi tối: Thứ 3, 5, 7 từ 18h30-20h30. Dành cho học viên đã hoàn thành HSK 1.",
        teacherId: teacherProfiles[0].id,
        level: "HSK2",
        startDate: new Date("2026-02-03"),
        endDate: new Date("2026-05-15"),
        maxStudents: 15,
        status: "ACTIVE",
      },
      {
        className: "HSK 3 - Lớp Chiều T2-T4",
        classCode: "HSK3-24-CHIEU",
        description: "Lớp học HSK 3 buổi chiều: Thứ 2, 4 từ 14h-17h. Học viên cần có nền tảng HSK 2.",
        teacherId: teacherProfiles[1].id,
        level: "HSK3",
        startDate: new Date("2026-02-02"),
        endDate: new Date("2026-06-30"),
        maxStudents: 12,
        status: "ACTIVE",
      },
      {
        className: "Giao tiếp cơ bản - Cuối tuần",
        classCode: "GT-CN-SANG",
        description: "Lớp giao tiếp tiếng Trung cơ bản: Chủ nhật 9h-12h. Tập trung vào kỹ năng nói và nghe.",
        teacherId: teacherProfiles[1].id,
        level: "BASIC",
        startDate: new Date("2026-02-07"),
        endDate: new Date("2026-05-30"),
        maxStudents: 20,
        status: "ACTIVE",
      },
    ],
  })
  console.log(`✅ Created ${classes.length} classes`)

  // ============= Portal Class Enrollments =============
  console.log("📝 Enrolling students into classes...")
  const enrollments = await prisma.portalClassEnrollment.createManyAndReturn({
    data: [
      // HSK1 class - 4 students
      { classId: classes[0].id, studentId: studentProfiles[0].id, status: "ENROLLED" },
      { classId: classes[0].id, studentId: studentProfiles[1].id, status: "ENROLLED" },
      { classId: classes[0].id, studentId: studentProfiles[2].id, status: "ENROLLED" },
      { classId: classes[0].id, studentId: studentProfiles[3].id, status: "ENROLLED" },
      
      // HSK2 class - 3 students
      { classId: classes[1].id, studentId: studentProfiles[1].id, status: "ENROLLED" },
      { classId: classes[1].id, studentId: studentProfiles[4].id, status: "ENROLLED" },
      
      // HSK3 class - 2 students
      { classId: classes[2].id, studentId: studentProfiles[2].id, status: "ENROLLED" },
      { classId: classes[2].id, studentId: studentProfiles[3].id, status: "ENROLLED" },
      
      // Giao tiếp - 3 students
      { classId: classes[3].id, studentId: studentProfiles[0].id, status: "ENROLLED" },
      { classId: classes[3].id, studentId: studentProfiles[3].id, status: "ENROLLED" },
      { classId: classes[3].id, studentId: studentProfiles[4].id, status: "ENROLLED" },
    ],
  })
  console.log(`✅ Created ${enrollments.length} enrollments`)

  // ============= Portal Schedules =============
  console.log("📅 Creating class schedules...")
  const schedules = await prisma.portalSchedule.createManyAndReturn({
    data: [
      // HSK1 - Thứ 2, 4, 6
      { 
        classId: classes[0].id, 
        teacherId: teacherProfiles[0].id,
        title: "Bài 1: Chào hỏi cơ bản",
        startTime: new Date("2026-02-02T08:00:00"),
        endTime: new Date("2026-02-02T10:00:00"),
        location: "Phòng 301",
        status: "SCHEDULED"
      },
      { 
        classId: classes[0].id, 
        teacherId: teacherProfiles[0].id,
        title: "Bài 2: Giới thiệu bản thân",
        startTime: new Date("2026-02-04T08:00:00"),
        endTime: new Date("2026-02-04T10:00:00"),
        location: "Phòng 301",
        status: "SCHEDULED"
      },
      { 
        classId: classes[0].id, 
        teacherId: teacherProfiles[0].id,
        title: "Bài 3: Số đếm 1-10",
        startTime: new Date("2026-02-06T08:00:00"),
        endTime: new Date("2026-02-06T10:00:00"),
        location: "Phòng 301",
        status: "SCHEDULED"
      },
      
      // HSK2 - Thứ 3, 5, 7
      { 
        classId: classes[1].id, 
        teacherId: teacherProfiles[0].id,
        title: "Bài 1: Hỏi đường",
        startTime: new Date("2026-02-03T18:30:00"),
        endTime: new Date("2026-02-03T20:30:00"),
        location: "Phòng 302",
        status: "SCHEDULED"
      },
      { 
        classId: classes[1].id, 
        teacherId: teacherProfiles[0].id,
        title: "Bài 2: Mua sắm",
        startTime: new Date("2026-02-05T18:30:00"),
        endTime: new Date("2026-02-05T20:30:00"),
        location: "Phòng 302",
        status: "SCHEDULED"
      },
      
      // HSK3 - Thứ 2, 4
      { 
        classId: classes[2].id, 
        teacherId: teacherProfiles[1].id,
        title: "Bài 1: Văn hóa Trung Quốc",
        startTime: new Date("2026-02-02T14:00:00"),
        endTime: new Date("2026-02-02T17:00:00"),
        location: "Phòng 303",
        status: "SCHEDULED"
      },
      { 
        classId: classes[2].id, 
        teacherId: teacherProfiles[1].id,
        title: "Bài 2: Du lịch",
        startTime: new Date("2026-02-04T14:00:00"),
        endTime: new Date("2026-02-04T17:00:00"),
        location: "Phòng 303",
        status: "SCHEDULED"
      },
      
      // Giao tiếp - Chủ nhật
      { 
        classId: classes[3].id, 
        teacherId: teacherProfiles[1].id,
        title: "Chủ đề 1: Giao tiếp hàng ngày",
        startTime: new Date("2026-02-07T09:00:00"),
        endTime: new Date("2026-02-07T12:00:00"),
        location: "Phòng 304",
        status: "SCHEDULED"
      },
    ],
  })
  console.log(`✅ Created ${schedules.length} schedules`)

  // ============= Portal Attendance (sample) =============
  console.log("✅ Creating attendance records...")
  // Create attendance for completed schedules (if any)
  // For now, just log - we'll add more when classes start
  console.log("ℹ️  Attendance records will be created as classes progress")

  // ============= Portal Assignments =============
  console.log("📋 Creating assignments...")
  const assignments = await prisma.portalAssignment.createManyAndReturn({
    data: [
      {
        classId: classes[0].id,
        teacherId: teacherProfiles[0].id,
        title: "Bài tập tuần 1: Luyện viết chữ Hán cơ bản",
        description: "Viết mỗi chữ 20 lần: 你好 (nǐ hǎo), 我 (wǒ), 是 (shì), 中国人 (zhōng guó rén)",
        assignmentType: "HOMEWORK",
        dueDate: new Date("2026-02-08"),
        maxScore: 10,
        attachments: [],
      },
      {
        classId: classes[0].id,
        teacherId: teacherProfiles[0].id,
        title: "Kiểm tra giữa kỳ HSK 1",
        description: "Bài kiểm tra bao gồm: Nghe (20%), Đọc (40%), Viết (40%). Thời gian: 60 phút.",
        assignmentType: "QUIZ",
        dueDate: new Date("2026-03-15"),
        maxScore: 100,
        attachments: [],
      },
      {
        classId: classes[1].id,
        teacherId: teacherProfiles[0].id,
        title: "Bài tập hội thoại: Mua sắm",
        description: "Tạo đoạn hội thoại mua sắm với người bán hàng (tối thiểu 10 câu). Sử dụng các từ vựng đã học.",
        assignmentType: "HOMEWORK",
        dueDate: new Date("2026-02-10"),
        maxScore: 15,
        attachments: [],
      },
      {
        classId: classes[2].id,
        teacherId: teacherProfiles[1].id,
        title: "Thuyết trình: Văn hóa Trung Quốc",
        description: "Chuẩn bị bài thuyết trình 5-7 phút về một khía cạnh văn hóa Trung Quốc (tết, ẩm thực, kiến trúc, v.v.)",
        assignmentType: "PROJECT",
        dueDate: new Date("2026-03-01"),
        maxScore: 50,
        attachments: [],
      },
    ],
  })
  console.log(`✅ Created ${assignments.length} assignments`)

  // ============= Portal Assignment Submissions (sample) =============
  console.log("📤 Creating sample assignment submissions...")
  const submissions = await prisma.portalAssignmentSubmission.createManyAndReturn({
    data: [
      {
        assignmentId: assignments[0].id,
        studentId: studentProfiles[0].id,
        content: "Đã hoàn thành viết 20 lần mỗi chữ. File đính kèm.",
        attachments: [],
        submittedAt: new Date("2026-02-07"),
        score: 9,
        feedback: "Rất tốt! Chữ viết rõ ràng và đúng nét.",
        status: "GRADED",
      },
      {
        assignmentId: assignments[0].id,
        studentId: studentProfiles[1].id,
        content: "Hoàn thành bài tập. Đính kèm ảnh.",
        attachments: [],
        submittedAt: new Date("2026-02-08"),
        score: 8,
        feedback: "Tốt! Cần chú ý nét viết chữ 国.",
        status: "GRADED",
      },
      {
        assignmentId: assignments[2].id,
        studentId: studentProfiles[1].id,
        content: "A: 你好，我想买一件衣服。\nB: 好的，你要什么颜色的？\n...",
        attachments: [],
        submittedAt: new Date("2026-02-09"),
        score: 14,
        feedback: "Xuất sắc! Hội thoại tự nhiên và sử dụng từ vựng đa dạng.",
        status: "GRADED",
      },
    ],
  })
  console.log(`✅ Created ${submissions.length} submissions`)

  // ============= Portal Learning Progress =============
  console.log("📈 Creating learning progress...")
  const progressRecords = await prisma.portalLearningProgress.createManyAndReturn({
    data: [
      // Student 1 - HSK1 level
      {
        studentId: studentProfiles[0].id,
        skillType: "LISTENING",
        level: "HSK1",
        score: 25,
        timeSpent: 120,
        notes: "Hoàn thành 5/20 bài nghe",
      },
      {
        studentId: studentProfiles[0].id,
        skillType: "SPEAKING",
        level: "HSK1",
        score: 30,
        timeSpent: 90,
        notes: "Luyện phát âm: 你好, 谢谢, 再见",
      },
      {
        studentId: studentProfiles[0].id,
        skillType: "READING",
        level: "HSK1",
        score: 20,
        timeSpent: 150,
        notes: "Nhận biết được 30/150 từ HSK1",
      },
      {
        studentId: studentProfiles[0].id,
        skillType: "WRITING",
        level: "HSK1",
        score: 15,
        timeSpent: 180,
        notes: "Viết được 20 chữ Hán cơ bản",
      },
      
      // Student 2 - HSK2 level
      {
        studentId: studentProfiles[1].id,
        skillType: "LISTENING",
        level: "HSK2",
        score: 40,
        timeSpent: 240,
        notes: "Hoàn thành 12/30 bài nghe",
      },
      {
        studentId: studentProfiles[1].id,
        skillType: "SPEAKING",
        level: "HSK2",
        score: 45,
        timeSpent: 200,
        notes: "Giao tiếp tốt trong các tình huống cơ bản",
      },
    ],
  })
  console.log(`✅ Created ${progressRecords.length} progress records`)

  // ============= Portal Vocabulary =============
  console.log("📖 Creating portal vocabulary...")
  const vocabularyList = await prisma.portalVocabulary.createManyAndReturn({
    data: [
      {
        studentId: studentProfiles[0].id,
        word: "你好",
        pinyin: "nǐ hǎo",
        meaning: "Xin chào",
        example: "你好，我叫王明。(Xin chào, tôi tên là Vương Minh.)",
        level: "HSK1",
        mastery: "LEARNING",
        reviewCount: 3,
      },
      {
        studentId: studentProfiles[0].id,
        word: "谢谢",
        pinyin: "xiè xie",
        meaning: "Cảm ơn",
        example: "谢谢你的帮助。(Cảm ơn sự giúp đỡ của bạn.)",
        level: "HSK1",
        mastery: "LEARNING",
        reviewCount: 2,
      },
      {
        studentId: studentProfiles[0].id,
        word: "再见",
        pinyin: "zài jiàn",
        meaning: "Tạm biệt",
        example: "再见，明天见！(Tạm biệt, hẹn gặp lại ngày mai!)",
        level: "HSK1",
        mastery: "MASTERED",
        reviewCount: 5,
      },
      {
        studentId: studentProfiles[1].id,
        word: "学习",
        pinyin: "xué xí",
        meaning: "Học tập",
        example: "我每天学习汉语。(Tôi học tiếng Trung mỗi ngày.)",
        level: "HSK2",
        mastery: "LEARNING",
        reviewCount: 4,
      },
      {
        studentId: studentProfiles[2].id,
        word: "了解",
        pinyin: "liǎo jiě",
        meaning: "Hiểu biết, tìm hiểu",
        example: "我想了解中国文化。(Tôi muốn tìm hiểu văn hóa Trung Quốc.)",
        level: "HSK3",
        mastery: "NEW",
        reviewCount: 1,
      },
    ],
  })
  console.log(`✅ Created ${vocabularyList.length} vocabulary entries`)

  // ============= Portal Bookmarks =============
  console.log("🔖 Creating bookmarks...")
  const bookmarks = await prisma.portalBookmark.createManyAndReturn({
    data: [
      {
        studentId: studentProfiles[0].id,
        resourceType: "VOCABULARY",
        resourceId: vocabularyList[0].id,
        notes: "Từ này rất quan trọng!",
      },
      {
        studentId: studentProfiles[0].id,
        resourceType: "VOCABULARY",
        resourceId: vocabularyList[1].id,
      },
      {
        studentId: studentProfiles[1].id,
        resourceType: "VOCABULARY",
        resourceId: vocabularyList[3].id,
        notes: "Cần ôn lại cách dùng",
      },
    ],
  })
  console.log(`✅ Created ${bookmarks.length} bookmarks`)

  // ============= Portal Quizzes =============
  console.log("❓ Creating quizzes...")
  const quizzes = await prisma.portalQuiz.createManyAndReturn({
    data: [
      {
        title: "Quiz HSK 1 - Tuần 1",
        description: "Kiểm tra từ vựng và ngữ pháp bài 1-3",
        level: "HSK1",
        questionCount: 3,
        timeLimit: 15,
        passingScore: 70,
        quizType: "VOCABULARY",
        questions: {
          questions: [
            {
              question: "你好 có nghĩa là gì?",
              options: ["Tạm biệt", "Xin chào", "Cảm ơn", "Xin lỗi"],
              correctAnswer: 1,
            },
            {
              question: "Chọn cách đọc đúng của 谢谢:",
              options: ["xiè xiè", "shè shè", "jié jié", "qiè qiè"],
              correctAnswer: 0,
            },
            {
              question: "'我是学生' có nghĩa là gì?",
              options: ["Tôi là giáo viên", "Tôi là học sinh", "Bạn là học sinh", "Anh ấy là học sinh"],
              correctAnswer: 1,
            },
          ]
        },
        status: "ACTIVE",
      },
      {
        title: "Quiz HSK 2 - Mua sắm",
        description: "Từ vựng và hội thoại về mua sắm",
        level: "HSK2",
        questionCount: 2,
        timeLimit: 10,
        passingScore: 70,
        quizType: "VOCABULARY",
        questions: {
          questions: [
            {
              question: "'多少钱?' có nghĩa là gì?",
              options: ["Bao nhiêu cái?", "Bao nhiêu tiền?", "Mấy giờ?", "Ở đâu?"],
              correctAnswer: 1,
            },
            {
              question: "Chọn câu đúng khi muốn mua áo:",
              options: ["我要买衣服", "我卖衣服", "你买衣服", "他买衣服"],
              correctAnswer: 0,
            },
          ]
        },
        status: "ACTIVE",
      },
    ],
  })
  console.log(`✅ Created ${quizzes.length} quizzes`)

  // ============= Portal Quiz Attempts =============
  console.log("📝 Creating quiz attempts...")
  const quizAttempts = await prisma.portalQuizAttempt.createManyAndReturn({
    data: [
      {
        quizId: quizzes[0].id,
        studentId: studentProfiles[0].id,
        answers: { answers: [1, 0, 1] }, // 2/3 correct
        score: 66.67,
        correctCount: 2,
        incorrectCount: 1,
        timeSpent: 12,
        passed: false,
      },
      {
        quizId: quizzes[0].id,
        studentId: studentProfiles[1].id,
        answers: { answers: [1, 0, 1] }, // 3/3 correct
        score: 100,
        correctCount: 3,
        incorrectCount: 0,
        timeSpent: 10,
        passed: true,
      },
    ],
  })
  console.log(`✅ Created ${quizAttempts.length} quiz attempts`)

  // ============= Summary =============
  console.log("\n✅ Portal seeding completed!")
  console.log("=".repeat(50))
  console.log("📊 Portal Summary:")
  console.log(`   - Teachers: ${teachers.length}`)
  console.log(`   - Students: ${students.length}`)
  console.log(`   - Classes: ${classes.length}`)
  console.log(`   - Enrollments: ${enrollments.length}`)
  console.log(`   - Schedules: ${schedules.length}`)
  console.log(`   - Assignments: ${assignments.length}`)
  console.log(`   - Submissions: ${submissions.length}`)
  console.log(`   - Progress Records: ${progressRecords.length}`)
  console.log(`   - Vocabulary: ${vocabularyList.length}`)
  console.log(`   - Bookmarks: ${bookmarks.length}`)
  console.log(`   - Quizzes: ${quizzes.length}`)
  console.log(`   - Quiz Attempts: ${quizAttempts.length}`)
  console.log("=".repeat(50))
  console.log("\n🔑 Test Accounts:")
  console.log("   Teacher: teacher1@hskmaster.com / password123")
  console.log("   Student: student1@gmail.com / password123")
  console.log("=".repeat(50))
}
