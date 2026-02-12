import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { USER_ROLE } from "@/constants/portal/roles"

// GET - Fetch attendance matrix for a class in a month
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const month = searchParams.get("month") // format: YYYY-MM

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 })
    }

    // Verify teacher owns this class (or is admin)
    if (user.role === USER_ROLE.TEACHER) {
      const cls = await prisma.portalClass.findFirst({
        where: { id: classId, teacherId: user.id },
      })
      if (!cls) {
        return NextResponse.json({ error: "Lớp học không hợp lệ" }, { status: 403 })
      }
    }

    // Get class with enrollments
    const classData = await prisma.portalClass.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          where: { status: "ENROLLED" },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
          orderBy: {
            student: { name: "asc" },
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: "Lớp học không tồn tại" }, { status: 404 })
    }

    // Determine date range for the month
    let startDate: Date
    let endDate: Date

    if (month) {
      const [year, mon] = month.split("-").map(Number)
      startDate = new Date(year, mon - 1, 1)
      endDate = new Date(year, mon, 0, 23, 59, 59, 999)
    } else {
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    // Get schedules for this class in the month
    const schedules = await prisma.portalSchedule.findMany({
      where: {
        classId,
        startTime: { gte: startDate, lte: endDate },
      },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        title: true,
        status: true,
      },
    })

    // Get attendance records for this class in the month
    const attendances = await prisma.portalAttendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        notes: true,
      },
    })

    // Build attendance map: { studentId: { "YYYY-MM-DD": { status, notes, id } } }
    const attendanceMap: Record<string, Record<string, { id: string; status: string; notes: string | null }>> = {}
    attendances.forEach((a) => {
      const dateKey = a.date.toISOString().split("T")[0]
      if (!attendanceMap[a.studentId]) {
        attendanceMap[a.studentId] = {}
      }
      attendanceMap[a.studentId][dateKey] = {
        id: a.id,
        status: a.status,
        notes: a.notes,
      }
    })

    return NextResponse.json({
      class: {
        id: classData.id,
        className: classData.className,
        classCode: classData.classCode,
        level: classData.level,
      },
      students: classData.enrollments.map((e) => ({
        id: e.student.id,
        name: e.student.name,
        image: e.student.image,
        email: e.student.email,
      })),
      schedules: schedules.map((s) => ({
        id: s.id,
        date: s.startTime.toISOString().split("T")[0],
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        title: s.title,
        status: s.status,
      })),
      attendanceMap,
      month: month || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`,
    })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Không thể tải dữ liệu điểm danh" }, { status: 500 })
  }
}

// POST - Save attendance records (batch upsert)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN) {
      return NextResponse.json({ error: "Chỉ giáo viên mới có thể điểm danh" }, { status: 403 })
    }

    const body = await request.json()
    const { classId, records } = body as {
      classId: string
      records: Array<{ studentId: string; date: string; status: string; notes?: string }>
    }

    if (!classId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }

    // Verify teacher owns this class
    if (user.role === USER_ROLE.TEACHER) {
      const cls = await prisma.portalClass.findFirst({
        where: { id: classId, teacherId: user.id },
      })
      if (!cls) {
        return NextResponse.json({ error: "Lớp học không hợp lệ" }, { status: 403 })
      }
    }

    // Upsert attendance records in transaction
    const results = await prisma.$transaction(
      records.map((record) => {
        const attendanceDate = new Date(record.date + "T00:00:00.000Z")
        return prisma.portalAttendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: record.studentId,
              classId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status.toUpperCase(),
            notes: record.notes || null,
            teacherId: user.id,
          },
          create: {
            studentId: record.studentId,
            classId,
            teacherId: user.id,
            date: attendanceDate,
            status: record.status.toUpperCase(),
            notes: record.notes || null,
          },
        })
      })
    )

    return NextResponse.json(
      { message: "Điểm danh thành công", count: results.length },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving attendance:", error)
    return NextResponse.json({ error: "Lưu điểm danh thất bại" }, { status: 500 })
  }
}
