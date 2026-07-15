// Minimal, dependency-free timezone helpers built on the Intl API.
// Everything the booking engine needs to translate between a practice-local
// "wall clock" time and absolute UTC instants, across DST.

/** Milliseconds that `timeZone` is offset from UTC at the given instant. */
export function timeZoneOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  // 'hour' can come back as 24 at midnight in some environments.
  const hour = map.hour === 24 ? 0 : map.hour;
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    hour,
    map.minute,
    map.second,
  );
  return asUTC - date.getTime();
}

/** Convert a practice-local wall-clock time into the absolute UTC instant. */
export function zonedWallTimeToUtc(
  wall: { year: number; month: number; day: number; hour: number; minute: number },
  timeZone: string,
): Date {
  const naive = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
  );
  // Two passes to settle DST boundaries.
  let offset = timeZoneOffsetMs(timeZone, new Date(naive));
  let instant = naive - offset;
  offset = timeZoneOffsetMs(timeZone, new Date(instant));
  instant = naive - offset;
  return new Date(instant);
}

/** The weekday (0=Sun…6=Sat) that `date` falls on within `timeZone`. */
export function weekdayInTimeZone(date: Date, timeZone: string): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
}

/** Format an instant for display in the practice timezone. */
export function formatInTimeZone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(date);
}

/** Today's date in the practice timezone, as YYYY-MM-DD. */
export function todayInTimeZone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts; // en-CA yields YYYY-MM-DD
}

/** Parse a YYYY-MM-DD string into its numeric parts. */
export function parseISODate(dateStr: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}
