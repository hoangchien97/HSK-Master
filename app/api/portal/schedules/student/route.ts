import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ENROLLMENT_STATUS } from "@/constants/portal/roles"
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
        status: ENROLLMENT_STATUS.ENROLLED,
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
          },
        },
        series: {
          select: {
            teacherId: true,
            isGoogleSynced: true,
            isRecurring: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    })

    // Map to backward-compat shape
    const mapped = schedules.map(s => ({
      id: s.id,
      classId: s.classId,
      seriesId: s.seriesId,
      title: s.title,
      description: s.description,
      startTime: s.startAt,
      endTime: s.endAt,
      status: s.status,
      location: s.location,
      meetingLink: s.meetingLink,
      syncedToGoogle: s.series?.isGoogleSynced ?? false,
      isRecurring: s.series?.isRecurring ?? false,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      class: s.class,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Error fetching student schedules:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
