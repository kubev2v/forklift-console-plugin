import { DateTime } from 'luxon';

/**
 * Converts a given ISO date string in a known format and timezone to a UTC ISO string.
 *
 * @param {string} isoDateString - The ISO date string in a known format and timezone.
 * @returns {string} The equivalent UTC ISO string if date is valid or undefined otherwise.
 */
export function convertToUTC(isoDateString: string): string | undefined {
  const date = DateTime.fromISO(isoDateString);
  return date.isValid ? date.toUTC().toISO() : undefined;
}
