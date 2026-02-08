import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/app/lib/prisma"
import type { Prisma } from "@prisma/client"

// GET - Fetch students for the authenticated teacher with filtering & pagination
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
    const level = searchParams.get("level") || ""
    const classId = searchParams.get("classId") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10")))

    // Find all students enrolled in this teacher's classes
    const teacherClassIds = await prisma.portalClass.findMany({
      where: { teacherId: user.id },
      select: { id: true },
    })

    const classIds = teacherClassIds.map((c) => c.id)

    if (classIds.length === 0) {
      return NextResponse.json({ items: [], total: 0 })
    }

    // Build where clause for students
    const enrollmentFilter: Prisma.PortalClassEnrollmentWhereInput = {
      classId: classId ? { equals: classId } : { in: classIds },
      ...(level && {
        class: { level: { equals: level, mode: "insensitive" as const } },
      }),
    }

    const where: Prisma.PortalUserWhereInput = {
      enrollments: { some: enrollmentFilter },
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [students, total] = await Promise.all([
      prisma.portalUser.findMany({
        where,
        include: {
          enrollments: {
            where: { classId: { in: classIds } },
            include: {
              class: {
                select: { id: true, className: true, classCode: true, level: true },
              },
            },
          },
        },
        orderBy: { fullName: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.portalUser.count({ where }),
    ])

    // Transform to flat structure
    const items = students.map((s) => ({
      id: s.id,
      name: s.name,
      fullName: s.fullName,
      email: s.email,
      phoneNumber: s.phoneNumber,
      image: s.image,
      // Derive level from enrolled classes
      level: s.enrollments[0]?.class?.level ?? null,
      status: s.status,
      classes: s.enrollments.map((e) => e.class),
    }))

    return NextResponse.json({ items, total })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
