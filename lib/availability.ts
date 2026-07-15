import {
  TIMEZONE,
  DAY_START_HOUR,
  DAY_END_HOUR,
  SLOT_INTERVAL_MINUTES,
  BUFFER_MINUTES,
  AVAILABLE_WEEKDAYS,
  MIN_LEAD_HOURS,
} from "./site";
import {
  parseISODate,
  weekdayInTimeZone,
  zonedWallTimeToUtc,
  formatInTimeZone,
} from "./time";
import { getBusyIntervals, type BusyInterval } from "./google";

export type Slot = {
  /** UTC ISO start instant. */
  start: string;
  /** UTC ISO end instant (session only, excludes buffer). */
  end: string;
  /** Human label in practice-local time, e.g. "9:30 AM". */
  label: string;
};

function overlaps(
  aStart: Date,
  aEnd: Date,
  intervals: BusyInterval[],
): boolean {
  return intervals.some((b) => aStart < b.end && aEnd > b.start);
}

/**
 * Available start times for a given local date and session duration.
 * Filters out slots that: fall outside working hours, start too soon
 * (min lead time), or collide with existing calendar events (+buffer).
 */
export async function getAvailableSlots(
  dateStr: string,
  durationMinutes: number,
  now: Date = new Date(),
): Promise<Slot[]> {
  const parsed = parseISODate(dateStr);
  if (!parsed) return [];

  // Build the day's start/end instants to bound the freebusy query and
  // confirm the date is a bookable weekday.
  const dayOpen = zonedWallTimeToUtc(
    { ...parsed, hour: DAY_START_HOUR, minute: 0 },
    TIMEZONE,
  );
  const weekday = weekdayInTimeZone(dayOpen, TIMEZONE);
  if (!AVAILABLE_WEEKDAYS.includes(weekday)) return [];

  const dayClose = zonedWallTimeToUtc(
    { ...parsed, hour: DAY_END_HOUR, minute: 0 },
    TIMEZONE,
  );

  const busy = await getBusyIntervals(dayOpen, dayClose);
  const minStart = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);

  const slots: Slot[] = [];
  const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;

  for (
    let offset = 0;
    offset + durationMinutes <= totalMinutes;
    offset += SLOT_INTERVAL_MINUTES
  ) {
    const hour = DAY_START_HOUR + Math.floor(offset / 60);
    const minute = offset % 60;
    const start = zonedWallTimeToUtc({ ...parsed, hour, minute }, TIMEZONE);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const endWithBuffer = new Date(
      end.getTime() + BUFFER_MINUTES * 60 * 1000,
    );

    if (start < minStart) continue;
    if (overlaps(start, endWithBuffer, busy)) continue;

    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      label: formatInTimeZone(start, TIMEZONE, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    });
  }

  return slots;
}

/** Re-check a single proposed slot right before booking (race guard). */
export async function isSlotStillOpen(
  start: Date,
  durationMinutes: number,
): Promise<boolean> {
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const endWithBuffer = new Date(end.getTime() + BUFFER_MINUTES * 60 * 1000);
  const busy = await getBusyIntervals(
    new Date(start.getTime() - BUFFER_MINUTES * 60 * 1000),
    endWithBuffer,
  );
  return !overlaps(start, endWithBuffer, busy);
}
