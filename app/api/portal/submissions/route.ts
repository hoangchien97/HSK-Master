import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

// POST - Submit assignment
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
    const { assignmentId, content } = body

    if (!assignmentId || !content?.trim()) {
      return NextResponse.json({ error: "Thiếu thông tin bài nộp" }, { status: 400 })
    }

    // Check if assignment exists and student is enrolled in the class
    const assignment = await prisma.portalAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          include: {
            enrollments: {
              where: { studentId: user.id },
            },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Bài tập không tồn tại" }, { status: 404 })
    }

    if (assignment.class.enrollments.length === 0) {
      return NextResponse.json(
        { error: "Bạn không được ghi danh trong lớp này" },
        { status: 403 }
      )
    }

    // Check if already submitted
    const existingSubmission = await prisma.portalAssignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId: user.id,
      },
    })

    if (existingSubmission) {
      // Update existing submission
      const updated = await prisma.portalAssignmentSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          submittedAt: new Date(),
        },
      })
      return NextResponse.json(updated)
    }

    // Create new submission
    const submission = await prisma.portalAssignmentSubmission.create({
      data: {
        assignmentId,
        studentId: user.id,
        content,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return NextResponse.json({ error: "Nộp bài thất bại" }, { status: 500 })
  }
}
