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
  address: "33 Main St, Burlington, VT",
  addressMapUrl: "https://maps.google.com/?q=33+Main+St+Burlington+VT",
  url: "https://intelligentembodiment.com",
  description:
    "Intuitive massage therapy with Mackensie Grant in Burlington, VT. Bodywork that addresses physical tension and its deeper roots, in sessions of 60 or 90 minutes.",
};

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  blurb: string;
};

// Bookable sessions. Add more here if desired.
export const services: Service[] = [
  {
    id: "massage-60",
    name: "60 Min Massage",
    durationMinutes: 60,
    price: 120,
    blurb:
      "A focused hour of integrative bodywork, craniosacral, polarity, and intuitive touch to release tension and restore ease.",
  },
  {
    id: "massage-90",
    name: "90 Min Massage",
    durationMinutes: 90,
    price: 180,
    blurb:
      "A spacious ninety minutes for whole-body release and deep nervous-system rest, working with both physical holding and its emotional roots.",
  },
  {
    id: "phone-consultation",
    name: "Phone Consultation",
    durationMinutes: 60,
    price: 75,
    blurb:
      "A focused conversation by phone to explore your health, discuss what you're navigating, and find the right next step.",
  },
];

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
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
  acceptingBookings: boolean; // master on/off for new appointments
  weekdays: number[]; // 0=Sun … 6=Sat
  dayStartHour: number; // 0–23
  dayEndHour: number; // 0–24, exclusive end
  slotIntervalMinutes: number;
  bufferMinutes: number;
  bookingWindowDays: number;
  minLeadHours: number;
};

export const defaultBookingSettings: BookingSettings = {
  acceptingBookings: true,
  weekdays: AVAILABLE_WEEKDAYS,
  dayStartHour: DAY_START_HOUR,
  dayEndHour: DAY_END_HOUR,
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
  return {
    acceptingBookings:
      typeof s.acceptingBookings === "boolean"
        ? s.acceptingBookings
        : d.acceptingBookings,
    weekdays,
    dayStartHour,
    dayEndHour,
    slotIntervalMinutes: clampInt(s.slotIntervalMinutes, 5, 120, d.slotIntervalMinutes),
    bufferMinutes: clampInt(s.bufferMinutes, 0, 120, d.bufferMinutes),
    bookingWindowDays: clampInt(s.bookingWindowDays, 1, 365, d.bookingWindowDays),
    minLeadHours: clampInt(s.minLeadHours, 0, 720, d.minLeadHours),
  };
}
