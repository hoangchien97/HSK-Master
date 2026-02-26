/**
 * Brand constants — single source of truth
 */
export const BRAND_NAME = 'Ruby HSK';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hskmaster.edu.vn';

/** Supabase-hosted share-preview image — always reachable by social crawlers */
export const DEFAULT_IMAGE_PREVIEW =
  'https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/sign/metadata/share-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMjI2MTBhZi03OGEzLTQ4MTAtYTM1NC1lNWViNjg2YmVjMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZXRhZGF0YS9zaGFyZS1wcmV2aWV3LnBuZyIsImlhdCI6MTc3MjA4ODE4OSwiZXhwIjoxODAzNjI0MTg5fQ.8IjHHwzUywcAFvuNmo9nn-02NbcSRDJd0km6V09iL4Q';

/**
 * Structured OG image object — used everywhere for maximum platform compatibility
 * (Facebook, Zalo, Messenger, Teams, Twitter, Telegram, LINE, LinkedIn…)
 *
 * Platforms like MS Teams and Facebook **require** width + height + type
 * to render the preview without fetching the image first.
 */
export const OG_IMAGE = {
  url: DEFAULT_IMAGE_PREVIEW,
  secureUrl: DEFAULT_IMAGE_PREVIEW,
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: 'Ruby HSK – Trung tâm tiếng Trung uy tín tại Hà Nội',
} as const;
