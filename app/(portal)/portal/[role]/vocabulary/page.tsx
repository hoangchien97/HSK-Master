import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import VocabularyClient from "./VocabularyClient"

const prisma = new PrismaClient()

async function getVocabularyData(email: string) {
  // Get HSK levels
  const hskLevels = await prisma.hSKLevel.findMany({
    where: { isActive: true },
    orderBy: { level: "asc" },
  })

  // Get student's vocabulary progress
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      vocabularies: true,
    },
  })

  return {
    hskLevels: hskLevels.map((level) => ({
      id: level.id,
      level: level.level,
      name: level.title,
      description: level.description,
      vocabularyCount: level.vocabularyCount,
    })),
    progress: user?.vocabularies || [],
    studentId: user?.id,
  }
}

export default async function StudentVocabularyPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const { hskLevels, progress, studentId } = await getVocabularyData(session.user.email)

  return (
    <VocabularyClient
      hskLevels={hskLevels}
      progress={progress}
      studentId={studentId || ""}
    />
  )
}
