-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "videoThumbnail" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HSKLevel" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- CreateTable
CREATE TABLE "PageMetadata" (
    "id" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT DEFAULT 'website',
    "twitterCard" TEXT DEFAULT 'summary_large_image',
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "canonicalUrl" TEXT,
    "robots" TEXT DEFAULT 'index, follow',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageMetadata_pagePath_key" ON "PageMetadata"("pagePath");

-- CreateIndex
CREATE INDEX "PageMetadata_pagePath_idx" ON "PageMetadata"("pagePath");
