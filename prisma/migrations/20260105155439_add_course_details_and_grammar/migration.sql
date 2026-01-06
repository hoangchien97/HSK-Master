-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "badgeColor" TEXT,
ADD COLUMN     "badgeText" TEXT,
ADD COLUMN     "durationHours" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "grammarCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lessonCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vocabularyCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "titleChinese" TEXT;

-- CreateTable
CREATE TABLE "GrammarPoint" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleChinese" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrammarPoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GrammarPoint" ADD CONSTRAINT "GrammarPoint_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
