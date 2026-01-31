import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

// GET - Fetch classes for the authenticated teacher
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
      include: {
        teacher: {
          include: {
            classes: {
              include: {
                enrollments: {
                  include: {
                    student: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    })

    if (!user?.teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(user.teacher.classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new class
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
    const { className, classCode, description, level, maxStudents, startDate, endDate } = body

    // Check if class code already exists
    const existingClass = await prisma.portalClass.findUnique({
      where: { classCode },
    })

    if (existingClass) {
      return NextResponse.json({ error: "Mã lớp đã tồn tại" }, { status: 400 })
    }

    const newClass = await prisma.portalClass.create({
      data: {
        className,
        classCode,
        description: description || null,
        level: level || null,
        maxStudents: maxStudents || 20,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        teacherId: user.teacher.id,
        status: "ACTIVE",
      },
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Tạo lớp học thất bại" }, { status: 500 })
  }
}
