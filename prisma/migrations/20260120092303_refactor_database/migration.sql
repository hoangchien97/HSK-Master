/*
  Warnings:

  - You are about to drop the column `originalPrice` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `students` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "originalPrice",
DROP COLUMN "price",
DROP COLUMN "rating",
DROP COLUMN "students";

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "isLocked" SET DEFAULT false;
