import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { ASSIGNMENT_STATUS } from "@/lib/constants/roles"

const prisma = new PrismaClient()

// GET - Fetch assignments for the authenticated teacher
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
      include: {
        assignments: {
          include: {
            class: true,
            submissions: {
              include: {
                student: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user.assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new assignment
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
    const { title, description, classId, assignmentType, dueDate, maxScore } = body

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

    const newAssignment = await prisma.portalAssignment.create({
      data: {
        title,
        description: description || null,
        classId,
        teacherId: user.id,
        assignmentType: assignmentType || "HOMEWORK",
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore || 100,
        status: ASSIGNMENT_STATUS.ACTIVE,
      },
    })

    return NextResponse.json(newAssignment, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Tạo bài tập thất bại" }, { status: 500 })
  }
}
