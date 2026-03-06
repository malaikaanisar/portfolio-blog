/**
 * Convert a tag name to a URL-safe slug.
 * e.g. "Digital Marketing Strategy" → "digital-marketing-strategy"
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}
