import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { DEFAULT_IMAGE_PREVIEW, OG_IMAGE, SITE_URL } from "@/constants/brand";

/**
 * Build a fully-qualified OG image **object** that every social platform can
 * parse without fetching the image first.
 *
 * - Facebook / Messenger: need og:image + og:image:width + og:image:height
 * - MS Teams: need og:image:type, falls back to page-scraping without it
 * - Twitter: needs twitter:image (absolute URL)
 * - Zalo / Telegram / LINE / LinkedIn: need og:image (absolute URL)
 */
function toOgImage(img?: string | null) {
  const url = img && img.startsWith("http") ? img : DEFAULT_IMAGE_PREVIEW;
  return {
    url,
    secureUrl: url,
    width: 1200,
    height: 630,
    type: url.endsWith(".jpg") || url.endsWith(".jpeg") ? "image/jpeg" : "image/png",
    alt: OG_IMAGE.alt,
  };
}

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

    const ogImg = toOgImage(pageMetadata.ogImage);
    const twitterImg = toOgImage(pageMetadata.twitterImage || pageMetadata.ogImage);
    const pageUrl = pagePath === "/" ? SITE_URL : `${SITE_URL}${pagePath}`;

    return {
      title: pageMetadata.title,
      description: pageMetadata.description,
      keywords: pageMetadata.keywords || undefined,
      robots: pageMetadata.robots || undefined,
      openGraph: {
        title: pageMetadata.ogTitle || pageMetadata.title,
        description: pageMetadata.ogDescription || pageMetadata.description,
        url: pageUrl,
        siteName: "Ruby HSK",
        locale: "vi_VN",
        images: [ogImg],
        type: (pageMetadata.ogType as "website" | "article") || "website",
      },
      twitter: {
        card: (pageMetadata.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
        title: pageMetadata.twitterTitle || pageMetadata.ogTitle || pageMetadata.title,
        description: pageMetadata.twitterDescription || pageMetadata.ogDescription || pageMetadata.description,
        images: [twitterImg],
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
    url: SITE_URL,
    siteName: "Ruby HSK",
    locale: "vi_VN",
    images: [OG_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};
