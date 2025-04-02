import { DateTime, Interval } from 'luxon';

/**
 * Converts a given ISO date time string to UTC+00:00 time zone.
 *
 * @param {string} isoDateString - The ISO date time string
 * @returns {string} The equivalent UTC+00:00 date time ISO string if input is valid or undefined otherwise.
 */
export const changeTimeZoneToUTCZero = (isoDateString: string): string | undefined => {
  const date = DateTime.fromISO(isoDateString);
  return date.isValid ? date.toUTC().toISO() : undefined;
};

/**
 * Converts a given ISO date time string to ISO date string(no time).
 *
 * @param {string} isoDateString - The ISO date time string
 * @returns {string} The equivalent ISO date string if input is valid or undefined otherwise.
 */
export const changeFormatToISODate = (isoDateString: string): string | undefined => {
  // preserve the original zone
  const date = DateTime.fromISO(isoDateString, { setZone: true, zone: 'utc' });
  return date.isValid ? date.toISODate() : undefined;
};

/**
 * Prints JS Date instance as ISO date format (no time)
 * @param date
 * @returns ISO date string if input is valid or undefined otherwise.
 */
export const toISODate = (date: Date): string | undefined => {
  const dt = DateTime.fromJSDate(date);
  return dt.isValid ? dt.toISODate() : undefined;
};

export const isValidDate = (isoDateString: string) => DateTime.fromISO(isoDateString).isValid;

/**
 *
 * @param isoDateString
 * @returns JS Date instance  if input is valid or undefined otherwise.
 */
export const parseISOtoJSDate = (isoDateString: string): Date | undefined => {
  const date = DateTime.fromISO(isoDateString);
  return date.isValid ? date.toJSDate() : undefined;
};

/**
 *
 * @param dateTime ISO date time formatted string (with time zone)
 * @param calendarDate local date as ISO date formatted string (no time, no time zone)
 * @returns true if both dates are on the same day in UTC+00:00
 */
export const areSameDayInUTCZero = (dateTime: string, calendarDate: string): boolean => {
  // calendar date has no zone - during conversion to UTC the local zone is used
  // which results in shifting to previous day for zones with positive offsets
  return DateTime.fromISO(dateTime).toUTC().hasSame(DateTime.fromISO(calendarDate), 'day');
};

/**
 *
 * @param interval ISO time interval with date part only (no time, no time zone) interpreted as closed range (both start and and included)
 * @param date  ISO date time
 * @returns true if the provided date is in the time interval
 */
export const isInClosedRange = (interval: string, date: string): boolean => {
  const { end, start } = Interval.fromISO(interval);
  return Interval.fromDateTimes(start, end.plus({ days: 1 })).contains(
    DateTime.fromISO(date).toUTC().setZone('local', { keepCalendarTime: true }),
  );
};

/**
 *
 * @param interval ISO time interval
 * @returns true if valid
 */
export const isValidInterval = (interval: string): boolean => Interval.fromISO(interval).isValid;

/**
 *
 * @param from start date (inclusive)
 * @param to end date (exclusive)
 * @returns ISO time interval with date part only (no time, no time zone)
 */
export const toISODateInterval = (from: Date, to: Date): string | undefined => {
  const target = Interval.fromDateTimes(DateTime.fromJSDate(from), DateTime.fromJSDate(to));
  return target.isValid ? target.toISODate() : undefined;
};

export const abbreviateInterval = (isoInterval: string): string | undefined => {
  const interval = Interval.fromISO(isoInterval);
  if (!interval.isValid) {
    return undefined;
  }
  return `${interval.start.toFormat('MM-dd')}/${interval.end.toFormat('MM-dd')}`;
};
