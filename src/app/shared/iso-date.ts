/**
 * Date helpers. Dates are handled as "yyyy-MM-dd" strings (they compare correctly as text and
 * match the API format), computed in UTC so time zones and daylight saving cannot shift a day.
 */

const pad = (n: number): string => String(n).padStart(2, '0');

export function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Today in the local time zone. */
export function todayIso(now: Date = new Date()): string {
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Tomorrow: the earliest rental start allowed by the API. */
export function tomorrowIso(now: Date = new Date()): string {
  return addDays(todayIso(now), 1);
}

/** Inclusive number of days between two dates (same day = 1). */
export function inclusiveDays(startIso: string, endIso: string): number {
  const [y1, m1, d1] = startIso.split('-').map(Number);
  const [y2, m2, d2] = endIso.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000) + 1;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Monday-first weekday index (0 = Monday ... 6 = Sunday) of the given date. */
export function weekdayMondayFirst(year: number, month: number, day: number): number {
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}
