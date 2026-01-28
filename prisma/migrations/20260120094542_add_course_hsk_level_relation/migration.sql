-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "hskLevelId" TEXT;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_hskLevelId_fkey" FOREIGN KEY ("hskLevelId") REFERENCES "HSKLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
