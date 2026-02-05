import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { SCHEDULE_STATUS, USER_ROLE } from "@/lib/constants/roles"
import { generateRecurringSessions, validateRecurrenceRule, type RecurrenceRule } from "@/lib/utils/recurrence"

const prisma = new PrismaClient()

// POST - Create schedule(s) with optional recurrence
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    })

    if (!user || (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN)) {
      return NextResponse.json({ error: "Chỉ giáo viên mới có thể tạo lịch" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, classId, startTime, endTime, location, meetingLink, recurrence, syncToGoogle } = body

    // Verify the class belongs to this teacher (or admin can create for any class)
    const classItem = await prisma.portalClass.findFirst({
      where: {
        id: classId,
        ...(user.role === USER_ROLE.TEACHER ? { teacherId: user.id } : {}),
      },
    })

    if (!classItem) {
      return NextResponse.json({ error: "Lớp học không hợp lệ" }, { status: 400 })
    }

    // If recurrence is provided, generate multiple sessions
    if (recurrence) {
      const recurrenceRule: RecurrenceRule = {
        frequency: recurrence.frequency,
        interval: recurrence.interval,
        weekdays: recurrence.weekdays,
        endDate: new Date(recurrence.endDate),
      }

      const validation = validateRecurrenceRule(recurrenceRule)
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const sessions = generateRecurringSessions(
        {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          title,
          classId,
          teacherId: user.id,
          location,
        },
        recurrenceRule
      )

      // Create all sessions in a transaction
      const createdSessions = await prisma.$transaction(
        sessions.map(session =>
          prisma.portalSchedule.create({
            data: {
              title: session.title,
              description: description || null,
              classId: session.classId,
              teacherId: session.teacherId,
              startTime: session.startTime,
              endTime: session.endTime,
              location: session.location || null,
              meetingLink: meetingLink || null,
              status: SCHEDULE_STATUS.SCHEDULED,
              // TODO: Re-enable after migration
              // syncedToGoogle: false,
              // googleEventId: null,
            },
          })
        )
      )

      // Note: For recurring schedules, Google Calendar sync is manual
      // User can sync individual sessions later if needed
      
      return NextResponse.json({
        success: true,
        count: createdSessions.length,
        schedules: createdSessions,
        message: syncToGoogle 
          ? `Đã tạo ${createdSessions.length} buổi học. Lưu ý: Lịch lặp không tự động đồng bộ Google Calendar. Bạn có thể đồng bộ từng buổi học sau.`
          : undefined,
      })
    }

    // Create single schedule
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
        // TODO: Re-enable after migration
        // syncedToGoogle: false,
        // googleEventId: null,
      },
    })

    // TODO: Re-enable Google sync after migration
    // If Google sync is requested, sync to Google Calendar
    // if (syncToGoogle) {
    //   try {
    //     // Call Google Calendar sync API
    //     const syncResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/portal/google-calendar/sync`, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ scheduleId: newSchedule.id }),
    //     })

    //     if (syncResponse.ok) {
    //       const syncData = await syncResponse.json()
    //       return NextResponse.json({
    //         ...newSchedule,
    //         googleEventId: syncData.googleEventId,
    //         googleEventLink: syncData.googleEventLink,
    //         syncedToGoogle: true,
    //         message: 'Đã tạo buổi học và đồng bộ với Google Calendar',
    //       }, { status: 201 })
    //     } else {
    //       // Schedule created but sync failed
    //       return NextResponse.json({
    //         ...newSchedule,
    //         warning: 'Đã tạo buổi học nhưng đồng bộ Google Calendar thất bại',
    //       }, { status: 201 })
    //     }
    //   } catch (syncError) {
    //     console.error('Google Calendar sync error:', syncError)
    //     // Return schedule anyway, sync can be retried
    //     return NextResponse.json({
    //       ...newSchedule,
    //       warning: 'Đã tạo buổi học nhưng đồng bộ Google Calendar thất bại',
    //     }, { status: 201 })
    //   }
    // }

    return NextResponse.json(newSchedule, { status: 201 })
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Tạo lịch thất bại" }, { status: 500 })
  }
}
