-- Phase 1: Schema cleanups
-- Table names follow Prisma convention: PascalCase for models without @@map

-- 1-A: HSKLevel.vocabularyCount String → Int
-- Data contains values like "150 từ" so strip non-numeric chars before casting
ALTER TABLE "HSKLevel" ALTER COLUMN "vocabularyCount" TYPE INTEGER USING regexp_replace("vocabularyCount", '[^0-9]', '', 'g')::INTEGER;

-- 1-B: Add updatedAt to Lesson (DEFAULT CURRENT_TIMESTAMP covers existing 120 rows)
ALTER TABLE "Lesson" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 1-B: Add updatedAt to portal_vocabulary (@@map used — DEFAULT covers existing 5000 rows)
ALTER TABLE "portal_vocabulary" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 1-B: Add updatedAt to Photo (DEFAULT CURRENT_TIMESTAMP covers existing 19 rows)
ALTER TABLE "Photo" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 1-B: Add updatedAt to GrammarPoint
ALTER TABLE "GrammarPoint" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 1-C: RegistrationStatus enum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONTACTED', 'ENROLLED', 'CANCELLED');

-- 1-C: Registration.status field (default PENDING covers existing rows)
ALTER TABLE "Registration" ADD COLUMN "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING';
