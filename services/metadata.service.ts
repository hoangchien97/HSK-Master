import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

/**
 * Get page metadata from database
 * @param pagePath - The page path (e.g., "/", "/about", "/contact")
 * @returns Metadata object for Next.js or null if not found
 */
export async function getPageMetadata(pagePath: string): Promise<Metadata | null> {
  try {
    const pageMetadata = await prisma.pageMetadata.findUnique({
      where: {
        pagePath,
        isActive: true
      },
    });

    if (!pageMetadata) {
      console.warn(`No metadata found for path: ${pagePath}`);
      return null;
    }

    return {
      title: pageMetadata.title,
      description: pageMetadata.description,
      keywords: pageMetadata.keywords || undefined,
      robots: pageMetadata.robots || undefined,
      openGraph: {
        title: pageMetadata.ogTitle || pageMetadata.title,
        description: pageMetadata.ogDescription || pageMetadata.description,
        images: pageMetadata.ogImage ? [pageMetadata.ogImage] : undefined,
        type: (pageMetadata.ogType as "website" | "article") || "website",
      },
      twitter: {
        card: (pageMetadata.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
        title: pageMetadata.twitterTitle || pageMetadata.ogTitle || pageMetadata.title,
        description: pageMetadata.twitterDescription || pageMetadata.ogDescription || pageMetadata.description,
        images: pageMetadata.twitterImage || pageMetadata.ogImage ? [pageMetadata.twitterImage || pageMetadata.ogImage!] : undefined,
      },
      alternates: pageMetadata.canonicalUrl ? {
        canonical: pageMetadata.canonicalUrl,
      } : undefined,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${pagePath}:`, error);
    return null;
  }
}

/**
 * Get default metadata as fallback
 */
export const DEFAULT_METADATA: Metadata = {
  title: "Ruby HSK - Trung tâm tiếng Trung uy tín tại Hà Nội",
  description: "Trung tâm tiếng Trung Ruby HSK - Đào tạo HSK 1-6, giao tiếp, thương mại. Cam kết đầu ra.",
  keywords: "học tiếng Trung, HSK, trung tâm tiếng Trung Hà Nội",
  openGraph: {
    title: "Ruby HSK - Trung tâm tiếng Trung uy tín",
    description: "Học tiếng Trung chất lượng cao với Ruby HSK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};
