import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { SCHEDULE_STATUS } from "@/lib/constants/roles"

const prisma = new PrismaClient()

// POST - Create a new schedule
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

    const body = await request.json()
    const { title, description, classId, startTime, endTime, location, meetingLink } = body

    // Verify the class belongs to this teacher
    const classItem = await prisma.portalClass.findFirst({
      where: {
        id: classId,
        teacherId: user.id,
      },
    })

    if (!classItem) {
      return NextResponse.json({ error: "Lớp học không hợp lệ" }, { status: 400 })
    }

    const newSchedule = await prisma.portalSchedule.create({
      data: {
        title,
        description: description || null,
        classId,
        teacherId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || null,
        meetingLink: meetingLink || null,
        status: SCHEDULE_STATUS.SCHEDULED,
      },
    })

    return NextResponse.json(newSchedule, { status: 201 })
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Tạo lịch thất bại" }, { status: 500 })
  }
}
