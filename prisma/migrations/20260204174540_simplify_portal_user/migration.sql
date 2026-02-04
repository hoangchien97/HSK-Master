/*
  Warnings:

  - You are about to drop the `portal_students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portal_teachers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `portal_users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `portal_users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "portal_assignment_submissions" DROP CONSTRAINT "portal_assignment_submissions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_assignments" DROP CONSTRAINT "portal_assignments_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "portal_attendances" DROP CONSTRAINT "portal_attendances_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_attendances" DROP CONSTRAINT "portal_attendances_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "portal_bookmarks" DROP CONSTRAINT "portal_bookmarks_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_class_enrollments" DROP CONSTRAINT "portal_class_enrollments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_classes" DROP CONSTRAINT "portal_classes_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "portal_learning_progress" DROP CONSTRAINT "portal_learning_progress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_quiz_attempts" DROP CONSTRAINT "portal_quiz_attempts_studentId_fkey";

-- DropForeignKey
ALTER TABLE "portal_schedules" DROP CONSTRAINT "portal_schedules_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "portal_students" DROP CONSTRAINT "portal_students_userId_fkey";

-- DropForeignKey
ALTER TABLE "portal_teachers" DROP CONSTRAINT "portal_teachers_userId_fkey";

-- DropForeignKey
ALTER TABLE "portal_vocabularies" DROP CONSTRAINT "portal_vocabularies_studentId_fkey";

-- AlterTable
ALTER TABLE "portal_users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "biography" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "portal_students";

-- DropTable
DROP TABLE "portal_teachers";

-- CreateIndex
CREATE UNIQUE INDEX "portal_users_name_key" ON "portal_users"("name");

-- AddForeignKey
ALTER TABLE "portal_classes" ADD CONSTRAINT "portal_classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "portal_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_class_enrollments" ADD CONSTRAINT "portal_class_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_schedules" ADD CONSTRAINT "portal_schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "portal_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_attendances" ADD CONSTRAINT "portal_attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_attendances" ADD CONSTRAINT "portal_attendances_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "portal_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_assignments" ADD CONSTRAINT "portal_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "portal_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_assignment_submissions" ADD CONSTRAINT "portal_assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_learning_progress" ADD CONSTRAINT "portal_learning_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_vocabularies" ADD CONSTRAINT "portal_vocabularies_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_bookmarks" ADD CONSTRAINT "portal_bookmarks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_quiz_attempts" ADD CONSTRAINT "portal_quiz_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
