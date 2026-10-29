// ─────────────────────────────────────────────────────────────────────────────
// Central place to edit business details, services, and booking availability.
// Change values here and the whole site + booking engine update accordingly.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Intelligent Embodiment",
  tagline: "Awake in the Body",
  practitioner: "Mackensie Satya Priya Grant",
  phone: "808.463.9195",
  phoneHref: "tel:+18084639195",
  email: "mackensie@intelligentembodiment.com",
  address: "291 Bostwick Farm Road, Shelburne, VT",
  addressMapUrl: "https://maps.google.com/?q=291+Bostwick+Farm+Road,+Shelburne,+VT",
  url: "https://intelligentembodiment.com",
  description:
    "Intuitive massage therapy with Mackensie Grant in Shelburne, VT. Bodywork that addresses physical tension and its deeper roots, in sessions of 60 or 90 minutes.",
  // Shown in the booking flow, confirmation email, and calendar invite.
  cancellationPolicy:
    "Please give at least 24 hours' notice to cancel or reschedule. Sessions canceled with less than 24 hours' notice are charged in full.",
};

export type ServiceCategory = "massage" | "phone";

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  blurb: string;
  category: ServiceCategory;
};

// Bookable sessions. Add more here if desired.
export const services: Service[] = [
  {
    id: "massage-60",
    name: "60 Min Massage",
    durationMinutes: 60,
    price: 120,
    category: "massage",
    blurb:
      "A focused hour of integrative bodywork, craniosacral, polarity, and intuitive touch to release tension and restore ease.",
  },
  {
    id: "massage-90",
    name: "90 Min Massage",
    durationMinutes: 90,
    price: 180,
    category: "massage",
    blurb:
      "A spacious ninety minutes for whole-body release and deep nervous-system rest, working with both physical holding and its emotional roots.",
  },
  {
    id: "phone-consultation",
    name: "Medical Intuition Initial Consult",
    durationMinutes: 60,
    price: 75,
    category: "phone",
    blurb:
      "A focused conversation by phone to explore your health, discuss what you're navigating, and find the right next step.",
  },
];

/** Where a session happens: the practice address, or by phone for consults. */
export function serviceLocation(service: Pick<Service, "category">): string {
  return service.category === "phone" ? "By phone" : site.address;
}

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

/** Whether a given service's category is currently accepting bookings. */
export function isServiceBookable(
  service: Pick<Service, "category">,
  settings: Pick<BookingSettings, "acceptingMassage" | "acceptingPhone">,
): boolean {
  return service.category === "phone"
    ? settings.acceptingPhone
    : settings.acceptingMassage;
}

// ── Booking availability ─────────────────────────────────────────────────────
// The IANA timezone the practice operates in. All slots are generated and
// stored against this zone regardless of where the visitor is browsing from.
export const TIMEZONE = "America/New_York";

// Days of week bookable (0 = Sunday … 6 = Saturday). Default: Tue–Sat.
export const AVAILABLE_WEEKDAYS = [2, 3, 4, 5, 6];

// Working window within an available day (24h clock, practice-local time).
export const DAY_START_HOUR = 9; // 9:00 AM
export const DAY_END_HOUR = 17; // 5:00 PM (last session must finish by this)

// Granularity that appointment start times are offered on (minutes).
export const SLOT_INTERVAL_MINUTES = 30;

// Buffer added after each session for reset/notes (minutes).
export const BUFFER_MINUTES = 15;

// How far ahead clients may book (days) and the minimum lead time (hours).
export const BOOKING_WINDOW_DAYS = 60;
export const MIN_LEAD_HOURS = 12;

// Editable booking parameters (overridable from /admin, persisted in R2).
export type BookingSettings = {
  acceptingMassage: boolean; // accept new massage clients
  acceptingPhone: boolean; // accept new phone consultations
  weekdays: number[]; // 0=Sun … 6=Sat
  dayStartHour: number; // 0–23, hours for days without their own
  dayEndHour: number; // 0–24, exclusive end
  // Per-weekday hours ("0"=Sun … "6"=Sat), in minutes after midnight.
  dayHours: Record<string, DayHours>;
  slotIntervalMinutes: number;
  bufferMinutes: number;
  bookingWindowDays: number;
  minLeadHours: number;
};

export type DayHours = { start: number; end: number };

export const defaultBookingSettings: BookingSettings = {
  acceptingMassage: true,
  acceptingPhone: true,
  weekdays: AVAILABLE_WEEKDAYS,
  dayStartHour: DAY_START_HOUR,
  dayEndHour: DAY_END_HOUR,
  dayHours: {},
  slotIntervalMinutes: SLOT_INTERVAL_MINUTES,
  bufferMinutes: BUFFER_MINUTES,
  bookingWindowDays: BOOKING_WINDOW_DAYS,
  minLeadHours: MIN_LEAD_HOURS,
};

/** Clamp/sanitize an incoming settings object to safe bounds. */
export function normalizeBookingSettings(
  input: Partial<BookingSettings> | null | undefined,
): BookingSettings {
  const d = defaultBookingSettings;
  const s = { ...d, ...(input ?? {}) };
  const clampInt = (v: unknown, min: number, max: number, fb: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb;
  };
  let weekdays = Array.isArray(s.weekdays)
    ? Array.from(new Set(s.weekdays.map((n) => Math.round(Number(n)))))
        .filter((n) => n >= 0 && n <= 6)
        .sort((a, b) => a - b)
    : d.weekdays;
  if (weekdays.length === 0) weekdays = d.weekdays;
  let dayStartHour = clampInt(s.dayStartHour, 0, 22, d.dayStartHour);
  let dayEndHour = clampInt(s.dayEndHour, 1, 24, d.dayEndHour);
  if (dayEndHour <= dayStartHour) dayEndHour = Math.min(24, dayStartHour + 1);
  const dayHours: Record<string, DayHours> = {};
  const rawHours = s.dayHours && typeof s.dayHours === "object" ? s.dayHours : {};
  for (let day = 0; day <= 6; day++) {
    const h = (rawHours as Record<string, Partial<DayHours>>)[String(day)];
    if (!h) continue;
    // Whole 5-minute steps within the day; the end must follow the start.
    const start = Math.round(clampInt(h.start, 0, 1435, NaN) / 5) * 5;
    const end = Math.round(clampInt(h.end, 5, 1440, NaN) / 5) * 5;
    if (start >= 0 && end > start) dayHours[String(day)] = { start, end };
  }
  // Accept the new per-category flags; fall back to the legacy single
  // `acceptingBookings` flag (or the default) for objects saved before the
  // split. Read from `input` (not `s`, which is spread over defaults).
  const raw = (input ?? {}) as Partial<BookingSettings> & {
    acceptingBookings?: unknown;
  };
  const legacyBool =
    typeof raw.acceptingBookings === "boolean" ? raw.acceptingBookings : undefined;
  const flag = (v: unknown, fb: boolean) =>
    typeof v === "boolean" ? v : legacyBool ?? fb;
  return {
    acceptingMassage: flag(raw.acceptingMassage, d.acceptingMassage),
    acceptingPhone: flag(raw.acceptingPhone, d.acceptingPhone),
    weekdays,
    dayStartHour,
    dayEndHour,
    dayHours,
    slotIntervalMinutes: clampInt(s.slotIntervalMinutes, 5, 120, d.slotIntervalMinutes),
    bufferMinutes: clampInt(s.bufferMinutes, 0, 120, d.bufferMinutes),
    bookingWindowDays: clampInt(s.bookingWindowDays, 1, 365, d.bookingWindowDays),
    minLeadHours: clampInt(s.minLeadHours, 0, 720, d.minLeadHours),
  };
}

/** A weekday's bookable hours, in minutes after midnight (practice time). */
export function hoursForWeekday(
  settings: Pick<BookingSettings, "dayHours" | "dayStartHour" | "dayEndHour">,
  weekday: number,
): DayHours {
  return (
    settings.dayHours?.[String(weekday)] ?? {
      start: settings.dayStartHour * 60,
      end: settings.dayEndHour * 60,
    }
  );
}
