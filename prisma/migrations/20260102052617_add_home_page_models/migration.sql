-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "image" TEXT,
ADD COLUMN     "instructor" TEXT,
ADD COLUMN     "instructorAvatar" TEXT,
ADD COLUMN     "originalPrice" TEXT,
ADD COLUMN     "price" TEXT,
ADD COLUMN     "rating" TEXT,
ADD COLUMN     "students" TEXT,
ADD COLUMN     "tag" TEXT;

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryCtaText" TEXT NOT NULL,
    "primaryCtaHref" TEXT NOT NULL,
    "secondaryCtaText" TEXT,
    "secondaryCtaHref" TEXT,
    "overlayGradient" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HSKLevel" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vocabularyCount" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "targetIcon" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "bgGradient" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HSKLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "iconBg" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtaStat" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CtaStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HSKLevel_level_key" ON "HSKLevel"("level");
