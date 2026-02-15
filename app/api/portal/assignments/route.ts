import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { ASSIGNMENT_STATUS } from "@/constants/portal/roles"
import type { Prisma } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch assignments with server-side filtering & pagination
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const classId = searchParams.get("classId") || ""
    const status = searchParams.get("status") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10")))

    // Build where clause
    const where: Prisma.PortalAssignmentWhereInput = {
      teacherId: user.id,
      ...(search && {
        title: { contains: search, mode: "insensitive" as const },
      }),
      ...(classId && { classId }),
      ...(status && { status }),
    }

    const [items, total, classes] = await Promise.all([
      prisma.portalAssignment.findMany({
        where,
        include: {
          class: true,
          submissions: { include: { student: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.portalAssignment.count({ where }),
      // Also return teacher's active classes for filter dropdown
      prisma.portalClass.findMany({
        where: { teacherId: user.id, status: "ACTIVE" },
        select: { id: true, className: true, classCode: true },
        orderBy: { className: "asc" },
      }),
    ])

    return NextResponse.json({ items, total, classes })
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
    const { title, description, classId, dueDate, maxScore } = body

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
        assignmentType: "HOMEWORK",
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore || 100,
        status: ASSIGNMENT_STATUS.DRAFT,
      },
    })

    return NextResponse.json(newAssignment, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Tạo bài tập thất bại" }, { status: 500 })
  }
}
