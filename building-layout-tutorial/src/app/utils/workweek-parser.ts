/**
 * Workweek Parser Utility
 *
 * Utilities for parsing, formatting, and validating ISO 8601 week dates
 * in YYYYWW format (e.g., "202525" = year 2025, week 25).
 *
 * Uses date-fns library for correct ISO week handling.
 */

import { getISOWeek, getISOWeekYear, setISOWeek, startOfISOWeekYear } from 'date-fns';

/**
 * Regular expression for validating YYYYWW format.
 * - YYYY: 4-digit year
 * - WW: 2-digit week number (01-53)
 */
export const WORKWEEK_REGEX = /^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/;

/**
 * Parse a workweek string (YYYYWW) to a Date object.
 *
 * @param weekString - Workweek in YYYYWW format (e.g., "202525")
 * @returns Date object representing the start of that ISO week (Monday)
 * @throws Error if weekString format is invalid
 *
 * @example
 * ```typescript
 * const date = parseWorkweek('202525');
 * // Returns: Date object for Monday of week 25, 2025
 * ```
 */
export function parseWorkweek(weekString: string): Date {
  if (!WORKWEEK_REGEX.test(weekString)) {
    throw new Error(
      `Invalid workweek format: "${weekString}". Expected YYYYWW (e.g., "202525")`
    );
  }

  const year = parseInt(weekString.substring(0, 4), 10);
  const week = parseInt(weekString.substring(4, 6), 10);

  if (week < 1 || week > 53) {
    throw new Error(
      `Invalid week number: ${week}. Must be between 01-53`
    );
  }

  // Get the start of the ISO year (Monday of week 1)
  // ISO week 1 is the week containing the first Thursday
  const startOfYear = startOfISOWeekYear(new Date(year, 0, 4));

  // Set to the specific week
  return setISOWeek(startOfYear, week);
}

/**
 * Format a Date object to workweek string (YYYYWW).
 *
 * @param date - Date to convert
 * @returns Workweek string in YYYYWW format
 *
 * @example
 * ```typescript
 * const workweek = formatWorkweek(new Date('2025-06-16'));
 * // Returns: "202525" (week 25 of 2025)
 * ```
 */
export function formatWorkweek(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}${week.toString().padStart(2, '0')}`;
}

/**
 * Validate a workweek string format.
 *
 * @param weekString - Workweek string to validate
 * @returns True if valid YYYYWW format, false otherwise
 *
 * @example
 * ```typescript
 * validateWorkweek('202525'); // true
 * validateWorkweek('2025W25'); // false (wrong format)
 * validateWorkweek('202554'); // false (week 54 invalid)
 * ```
 */
export function validateWorkweek(weekString: string): boolean {
  if (!WORKWEEK_REGEX.test(weekString)) {
    return false;
  }

  const week = parseInt(weekString.substring(4, 6), 10);
  return week >= 1 && week <= 53;
}

/**
 * Get an array of workweek strings between start and end (inclusive).
 *
 * @param startWeek - Start workweek in YYYYWW format
 * @param endWeek - End workweek in YYYYWW format
 * @returns Array of workweek strings
 * @throws Error if either workweek format is invalid
 *
 * @example
 * ```typescript
 * const weeks = getWeekRange('202501', '202503');
 * // Returns: ['202501', '202502', '202503']
 * ```
 */
export function getWeekRange(startWeek: string, endWeek: string): string[] {
  const weeks: string[] = [];
  let current = parseWorkweek(startWeek);
  const end = parseWorkweek(endWeek);

  while (current <= end) {
    weeks.push(formatWorkweek(current));
    // Add 7 days to move to next week
    current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return weeks;
}
