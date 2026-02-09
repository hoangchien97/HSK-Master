import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST - Enroll a student to a class (by email search)
export async function POST(
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
    const { studentEmail } = body

    if (!studentEmail) {
      return NextResponse.json(
        { error: "Student email is required" },
        { status: 400 }
      )
    }

    // Check if class exists
    const classData = await prisma.portalClass.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Only teacher of the class or admin can enroll students
    if (
      user.role !== "SYSTEM_ADMIN" &&
      classData.teacherId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find student by email
    const student = await prisma.portalUser.findUnique({
      where: { email: studentEmail },
      select: { id: true, role: true, fullName: true, email: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if user is a student
    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      )
    }

    // Check if class is full
    if (classData._count.enrollments >= classData.maxStudents) {
      return NextResponse.json(
        { error: "Class is full" },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.portalClassEnrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: student.id,
          classId: classId,
        },
      },
    })

    if (existingEnrollment) {
      if (existingEnrollment.status === "ENROLLED") {
        return NextResponse.json(
          { error: "Student is already enrolled in this class" },
          { status: 400 }
        )
      } else {
        // Re-enroll if previously dropped
        const updatedEnrollment = await prisma.portalClassEnrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: "ENROLLED",
            enrolledAt: new Date(),
          },
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        })

        return NextResponse.json(updatedEnrollment, { status: 201 })
      }
    }

    // Create enrollment
    const enrollment = await prisma.portalClassEnrollment.create({
      data: {
        studentId: student.id,
        classId: classId,
        status: "ENROLLED",
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("Error enrolling student:", error)
    return NextResponse.json(
      { error: "Failed to enroll student" },
      { status: 500 }
    )
  }
}

// DELETE - Remove student from class (soft delete)
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
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      )
    }

    // Check if class exists and user has permission
    const classData = await prisma.portalClass.findUnique({
      where: { id: classId },
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Only teacher of the class or admin can remove students
    if (
      user.role !== "SYSTEM_ADMIN" &&
      classData.teacherId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find enrollment
    const enrollment = await prisma.portalClassEnrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: studentId,
          classId: classId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Soft delete by setting status to DROPPED
    await prisma.portalClassEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "DROPPED",
      },
    })

    return NextResponse.json({ message: "Student removed successfully" })
  } catch (error) {
    console.error("Error removing student:", error)
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    )
  }
}
