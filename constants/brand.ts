/**
 * Brand constants — single source of truth
 */
export const BRAND_NAME = 'Ruby HSK';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'https://hskmaster.edu.vn';

/**
 * Self-hosted OG preview image — served from /public/preview/
 * Social crawlers (Zalo, Facebook, Telegram…) work best with same-domain images.
 * Next.js resolves this path via metadataBase → absolute URL.
 * Recommended size: 1200×630 px, PNG or JPG.
 */
export const DEFAULT_IMAGE_PREVIEW = '/preview/thumb.png';

/**
 * Structured OG image object — used everywhere for maximum platform compatibility
 * (Facebook, Zalo, Messenger, Teams, Twitter, Telegram, LINE, LinkedIn…)
 *
 * Platforms like MS Teams and Facebook **require** width + height + type
 * to render the preview without fetching the image first.
 */
export const OG_IMAGE = {
  url: DEFAULT_IMAGE_PREVIEW,
  width: 1536,
  height: 1024,
  type: 'image/png',
  alt: 'Ruby HSK – Trung tâm tiếng Trung uy tín tại Hà Nội',
} as const;
