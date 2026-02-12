import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch class detail with enrollments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { classId } = await params

    // Fetch class with enrollments
    const classData = await prisma.portalClass.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          where: {
            status: "ENROLLED",
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
          orderBy: {
            enrolledAt: "asc",
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Check if user has access to this class
    if (
      user.role === "TEACHER" &&
      classData.teacherId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If student, check if enrolled
    if (user.role === "STUDENT") {
      const isEnrolled = classData.enrollments.some(
        (e) => e.studentId === user.id
      )
      if (!isEnrolled) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.json(classData)
  } catch (error) {
    console.error("Error fetching class detail:", error)
    return NextResponse.json(
      { error: "Failed to fetch class detail" },
      { status: 500 }
    )
  }
}

// PUT - Update class details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { classId } = await params
    const body = await request.json()

    // Check if class exists and user has permission
    const existingClass = await prisma.portalClass.findUnique({
      where: { id: classId },
    })

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Only teacher of the class or admin can update
    if (
      user.role !== "SYSTEM_ADMIN" &&
      existingClass.teacherId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const {
      className,
      description,
      level,
      startDate,
      endDate,
      status,
    } = body

    const updatedClass = await prisma.portalClass.update({
      where: { id: classId },
      data: {
        ...(className && { className }),
        ...(description !== undefined && { description }),
        ...(level !== undefined && { level }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
        ...(status && { status }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            schedules: true,
          },
        },
      },
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    )
  }
}

// DELETE - Delete class (soft delete by setting status to CANCELLED)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { classId } = await params

    // Check if class exists and user has permission
    const existingClass = await prisma.portalClass.findUnique({
      where: { id: classId },
    })

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Only admin can delete classes
    if (user.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete by setting status to CANCELLED
    await prisma.portalClass.update({
      where: { id: classId },
      data: {
        status: "CANCELLED",
      },
    })

    return NextResponse.json({ message: "Class deleted successfully" })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    )
  }
}
