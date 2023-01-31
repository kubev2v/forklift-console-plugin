/**
 * Uses native string localCompare method with numeric option enabled.
 *
 * @param locale to be used by string comparator
 */
export const localeCompare = (a: string, b: string, locale: string): number =>
  a.localeCompare(b, locale, { numeric: true });
