import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { ItemProgressStatus } from "@/enums/portal/common"

const prisma = new PrismaClient()

/**
 * DELETE /api/portal/vocabulary-progress/[id]
 * Removes (resets) a student's vocabulary progress entry (e.g. un-bookmark / un-master).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Ensure the progress entry belongs to the authenticated user
  const progress = await prisma.portalItemProgress.findUnique({
    where: { id },
    select: { student: { select: { email: true } } },
  })

  if (!progress) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (progress.student.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Reset the progress entry instead of deleting, so history is preserved
  await prisma.portalItemProgress.update({
    where: { id },
    data: {
      status: ItemProgressStatus.NEW,
      masteryScore: 0,
      seenCount: 0,
      correctCount: 0,
      wrongCount: 0,
      lastSeenAt: null,
      nextReviewAt: null,
    },
  })

  return NextResponse.json({ success: true })
}
