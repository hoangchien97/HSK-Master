/*
  Warnings:

  - Changed the type of `value` on the `CtaStat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CtaStat" ADD COLUMN     "suffix" TEXT,
DROP COLUMN "value",
ADD COLUMN     "value" INTEGER NOT NULL;
