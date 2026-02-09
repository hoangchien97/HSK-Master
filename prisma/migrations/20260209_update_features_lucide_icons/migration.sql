-- AlterTable: Update Feature model to use Lucide icons
-- Step 1: Add new iconName column
ALTER TABLE "Feature" ADD COLUMN "iconName" TEXT;

-- Step 2: Migrate existing data (map Material Icons to Lucide icons)
UPDATE "Feature" SET "iconName" = 'GraduationCap' WHERE "icon" = 'school';
UPDATE "Feature" SET "iconName" = 'BookOpen' WHERE "icon" = 'auto_stories';
UPDATE "Feature" SET "iconName" = 'Users' WHERE "icon" = 'groups';
UPDATE "Feature" SET "iconName" = 'Award' WHERE "icon" = 'workspace_premium';

-- Step 3: Make iconName required (NOT NULL)
ALTER TABLE "Feature" ALTER COLUMN "iconName" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "Feature" DROP COLUMN "icon";
ALTER TABLE "Feature" DROP COLUMN "iconBg";
ALTER TABLE "Feature" DROP COLUMN "iconColor";
