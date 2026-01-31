import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

// POST - Save attendance records
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
      include: { teacher: true },
    })

    if (!user?.teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const body = await request.json()
    const { classId, date, attendance } = body

    // Verify the class belongs to this teacher
    const classItem = await prisma.portalClass.findFirst({
      where: {
        id: classId,
        teacherId: user.teacher.id,
      },
    })

    if (!classItem) {
      return NextResponse.json({ error: "Lớp học không hợp lệ" }, { status: 400 })
    }

    const attendanceDate = new Date(date)

    // Delete existing attendance for this date and class
    await prisma.portalAttendance.deleteMany({
      where: {
        classId,
        date: {
          gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
          lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
        },
      },
    })

    // Create new attendance records
    const attendanceRecords = await Promise.all(
      attendance.map(
        (record: { studentId: string; status: string }) =>
          prisma.portalAttendance.create({
            data: {
              studentId: record.studentId,
              classId,
              teacherId: user.teacher!.id,
              date: new Date(date),
              status: record.status.toUpperCase(),
            },
          })
      )
    )

    return NextResponse.json(
      { message: "Điểm danh thành công", count: attendanceRecords.length },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving attendance:", error)
    return NextResponse.json({ error: "Lưu điểm danh thất bại" }, { status: 500 })
  }
}
