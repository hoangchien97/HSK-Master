import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import BookmarksClient from "./BookmarksClient"

const prisma = new PrismaClient()

async function getStudentBookmarks(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      itemProgress: {
        where: { status: "MASTERED" },
        include: {
          vocabulary: {
            include: { lesson: { include: { course: true } } },
          },
        },
      },
    },
  })

  // Convert itemProgress to bookmark format for UI
  const bookmarks = user?.itemProgress.map((ip) => ({
    id: ip.id,
    vocabulary: {
      id: ip.vocabulary.id,
      hanzi: ip.vocabulary.word,
      pinyin: ip.vocabulary.pinyin,
      meaning: ip.vocabulary.meaningVi || ip.vocabulary.meaning,
      hskLevel: ip.vocabulary.lesson?.course
        ? { level: parseInt(ip.vocabulary.lesson.course.level?.replace("HSK", "") || "0"), name: ip.vocabulary.lesson.course.title }
        : null,
    },
    mastered: ip.status === "MASTERED",
    reviewCount: ip.seenCount,
    lastReviewedAt: ip.lastSeenAt,
  })) || []

  return {
    bookmarks,
    studentId: user?.id,
  }
}

export default async function StudentBookmarksPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const { bookmarks, studentId } = await getStudentBookmarks(session.user.email)

  return <BookmarksClient bookmarks={bookmarks} studentId={studentId || ""} />
}
