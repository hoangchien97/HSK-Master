import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import BookmarksClient from "./BookmarksClient"

const prisma = new PrismaClient()

async function getStudentBookmarks(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      student: {
        include: {
          bookmarks: true,
          vocabularies: {
            where: { mastery: "MASTERED" },
          },
        },
      },
    },
  })

  // Convert vocabularies to bookmark format for UI
  const bookmarks = user?.student?.vocabularies.map((v) => ({
    id: v.id,
    vocabulary: {
      id: v.id,
      hanzi: v.word,
      pinyin: v.pinyin,
      meaning: v.meaning,
      hskLevel: v.level ? { level: parseInt(v.level.replace("HSK", "")), name: v.level } : null,
    },
    mastered: v.mastery === "MASTERED",
    reviewCount: v.reviewCount,
    lastReviewedAt: v.lastReviewedAt,
  })) || []

  return {
    bookmarks,
    studentId: user?.student?.id,
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
