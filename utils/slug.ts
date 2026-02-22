/**
 * Generate a URL-friendly slug from Vietnamese/Chinese text.
 * Handles diacritics, special characters, and ensures uniqueness via suffix.
 */

const VIETNAMESE_MAP: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
  â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  đ: 'd',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
}

/**
 * Convert Vietnamese text to ASCII-friendly slug
 */
export function generateSlug(text: string): string {
  let slug = text.toLowerCase().trim()

  // Replace Vietnamese characters
  slug = slug
    .split('')
    .map((char) => VIETNAMESE_MAP[char] || char)
    .join('')

  // Remove non-ASCII characters (Chinese, etc.)
  slug = slug.replace(/[^\x00-\x7F]/g, '')

  // Replace special characters with hyphens
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'untitled'
}

/**
 * Generate a unique slug by checking against existing slugs in the database.
 * Appends a numeric suffix if the slug already exists.
 */
export async function generateUniqueSlug(
  title: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let suffix = 1

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix++
    if (suffix > 100) {
      // Fallback: append timestamp
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }

  return slug
}
