import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/portal/schedules/student - Get schedules for enrolled classes
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get student's enrolled classes
    const enrollments = await prisma.portalClassEnrollment.findMany({
      where: {
        studentId: userId,
        status: "ENROLLED",
      },
      select: {
        classId: true,
      },
    })

    const classIds = enrollments.map((e) => e.classId)

    // Get schedules for enrolled classes
    const schedules = await prisma.portalSchedule.findMany({
      where: {
        classId: {
          in: classIds,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        class: {
          select: {
            id: true,
            className: true,
            classCode: true,
            level: true,
            maxStudents: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching student schedules:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
