import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

// DELETE - Remove vocabulary
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the vocabulary belongs to this student
    const vocabulary = await prisma.portalVocabulary.findFirst({
      where: {
        id,
        studentId: user.id,
      },
    })

    if (!vocabulary) {
      return NextResponse.json({ error: "Từ vựng không tồn tại" }, { status: 404 })
    }

    // Delete the vocabulary entry
    await prisma.portalVocabulary.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Đã xóa từ vựng" })
  } catch (error) {
    console.error("Error removing vocabulary:", error)
    return NextResponse.json({ error: "Xóa từ vựng thất bại" }, { status: 500 })
  }
}

// PUT - Update vocabulary progress (toggle mastery, update review count)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const vocabulary = await prisma.portalVocabulary.findFirst({
      where: {
        id,
        studentId: user.id,
      },
    })

    if (!vocabulary) {
      return NextResponse.json({ error: "Từ vựng không tồn tại" }, { status: 404 })
    }

    const updated = await prisma.portalVocabulary.update({
      where: { id },
      data: {
        mastery: body.mastery ?? vocabulary.mastery,
        reviewCount: body.incrementReview
          ? { increment: 1 }
          : body.reviewCount ?? vocabulary.reviewCount,
        lastReviewedAt: body.incrementReview ? new Date() : vocabulary.lastReviewedAt,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating vocabulary:", error)
    return NextResponse.json({ error: "Cập nhật thất bại" }, { status: 500 })
  }
}
