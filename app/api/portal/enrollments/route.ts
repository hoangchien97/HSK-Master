import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ENROLLMENT_STATUS, USER_ROLE } from "@/app/constants/portal/roles"

// POST - Add student to class by email
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { classId, studentEmail } = body

    // Find the student by email
    const student = await prisma.portalUser.findUnique({
      where: { email: studentEmail },
    })

    if (!student) {
      return NextResponse.json({ error: "Không tìm thấy học viên với email này" }, { status: 404 })
    }

    if (student.role !== USER_ROLE.STUDENT) {
      return NextResponse.json({ error: "Người dùng này không phải là học viên" }, { status: 400 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.portalClassEnrollment.findFirst({
      where: {
        classId,
        studentId: student.id,
      },
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: "Học viên đã được thêm vào lớp" }, { status: 400 })
    }

    // Check class capacity
    const classWithEnrollments = await prisma.portalClass.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          where: { status: ENROLLMENT_STATUS.ENROLLED },
        },
      },
    })

    if (!classWithEnrollments) {
      return NextResponse.json({ error: "Lớp học không tồn tại" }, { status: 404 })
    }

    if (classWithEnrollments.enrollments.length >= classWithEnrollments.maxStudents) {
      return NextResponse.json({ error: "Lớp học đã đầy" }, { status: 400 })
    }

    // Create enrollment
    const enrollment = await prisma.portalClassEnrollment.create({
      data: {
        classId,
        studentId: student.id,
        status: ENROLLMENT_STATUS.ENROLLED,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            name: true,
            email: true,
            image: true,
            phoneNumber: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error("Error adding student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove student from class
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json({ error: "enrollmentId is required" }, { status: 400 })
    }

    // Soft delete by updating status
    await prisma.portalClassEnrollment.update({
      where: { id: enrollmentId },
      data: { status: ENROLLMENT_STATUS.DROPPED },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Search students by email
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ students: [] })
    }

    const students = await prisma.portalUser.findMany({
      where: {
        role: USER_ROLE.STUDENT,
        email: {
          contains: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        fullName: true,
        name: true,
        email: true,
        image: true,
      },
      take: 5,
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error searching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
