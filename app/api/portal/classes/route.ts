import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CLASS_STATUS } from "@/constants/portal/roles"
import type { Prisma } from "@prisma/client"

// GET - Fetch classes with server-side filtering & pagination
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
    const status = searchParams.get("status") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10")))

    // Build where clause
    const where: Prisma.PortalClassWhereInput = {
      teacherId: user.id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { className: { contains: search, mode: "insensitive" as const } },
          { classCode: { contains: search, mode: "insensitive" as const } },
          { level: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.portalClass.findMany({
        where,
        include: {
          teacher: { select: { name: true, email: true } },
          enrollments: { include: { student: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.portalClass.count({ where }),
    ])

    return NextResponse.json({ items, total })
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
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { className, classCode, description, level, startDate, endDate } = body

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
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        teacherId: user.id,
        status: CLASS_STATUS.ACTIVE,
      },
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Tạo lớp học thất bại" }, { status: 500 })
  }
}
