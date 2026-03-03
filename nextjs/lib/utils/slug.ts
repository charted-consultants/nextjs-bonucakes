/**
 * Slug generation utilities
 * Vietnamese-friendly URL slug generation
 */

import { prisma } from '@/lib/prisma';

/**
 * Vietnamese character mapping for slug generation
 * Maps Vietnamese characters to their ASCII equivalents
 */
const vietnameseMap: Record<string, string> = {
  // Lowercase vowels with diacritics
  'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
  'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
  'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
  'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
  'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
  'đ': 'd',
  // Uppercase vowels with diacritics
  'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
  'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
  'Đ': 'D',
};

/**
 * Convert Vietnamese text to URL-friendly slug
 * @param text - Text to convert to slug (Vietnamese or English)
 * @returns URL-safe slug
 *
 * @example
 * slugify("Bánh mì đặc biệt") => "banh-mi-dac-biet"
 * slugify("Cà phê sữa đá") => "ca-phe-sua-da"
 * slugify("Special Bread") => "special-bread"
 */
export function slugify(text: string): string {
  if (!text) return '';

  let slug = text.trim();

  // Replace Vietnamese characters with ASCII equivalents
  for (const [viet, ascii] of Object.entries(vietnameseMap)) {
    slug = slug.replace(new RegExp(viet, 'g'), ascii);
  }

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Remove any remaining non-alphanumeric characters (except spaces and hyphens)
  slug = slug.replace(/[^a-z0-9\s-]/g, '');

  // Replace multiple spaces or hyphens with a single hyphen
  slug = slug.replace(/[\s-]+/g, '-');

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Generate a unique slug for a product
 * If the slug already exists, appends a number (e.g., "banh-mi-2")
 *
 * @param baseText - The text to generate slug from (usually product name)
 * @param excludeId - Optional product ID to exclude from uniqueness check (for updates)
 * @returns A unique slug
 *
 * @example
 * await generateUniqueSlug("Bánh mì") => "banh-mi"
 * await generateUniqueSlug("Bánh mì") => "banh-mi-2" (if "banh-mi" exists)
 */
export async function generateUniqueSlug(
  baseText: string,
  excludeId?: number
): Promise<string> {
  const baseSlug = slugify(baseText);

  if (!baseSlug) {
    throw new Error('Cannot generate slug from empty text');
  }

  // Check if base slug is available
  const where = excludeId
    ? { slug: baseSlug, id: { not: excludeId } }
    : { slug: baseSlug };

  const existing = await prisma.product.findFirst({ where });

  if (!existing) {
    return baseSlug;
  }

  // Find a unique slug by appending numbers
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (true) {
    const where = excludeId
      ? { slug: uniqueSlug, id: { not: excludeId } }
      : { slug: uniqueSlug };

    const exists = await prisma.product.findFirst({ where });

    if (!exists) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;

    // Safety check to prevent infinite loops
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
}

/**
 * Check if a slug is available for use
 * @param slug - The slug to check
 * @param excludeId - Optional product ID to exclude from check
 * @returns true if slug is available, false if already in use
 */
export async function isSlugAvailable(
  slug: string,
  excludeId?: number
): Promise<boolean> {
  if (!slug) return false;

  const where = excludeId
    ? { slug, id: { not: excludeId } }
    : { slug };

  const existing = await prisma.product.findFirst({ where });
  return !existing;
}

/**
 * Validate slug format
 * Ensures slug only contains lowercase letters, numbers, and hyphens
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function isValidSlugFormat(slug: string): boolean {
  if (!slug) return false;

  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  return slugPattern.test(slug);
}
