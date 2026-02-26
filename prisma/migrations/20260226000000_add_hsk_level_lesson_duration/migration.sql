-- Add lessonCount and duration fields to HSKLevel
-- lessonCount: number of lessons per level (for overview display)
-- duration: estimated completion time (e.g., "6–8 tuần", "3–4 tháng")
-- Uses IF NOT EXISTS to be safe if columns were already added via db push
ALTER TABLE "HSKLevel" ADD COLUMN IF NOT EXISTS "lessonCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "HSKLevel" ADD COLUMN IF NOT EXISTS "duration" TEXT NOT NULL DEFAULT '';
