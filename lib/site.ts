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
  email: "mackensie11@gmail.com",
  address: "33 Main St, Burlington, VT",
  addressMapUrl: "https://maps.google.com/?q=33+Main+St+Burlington+VT",
  url: "https://intelligentembodiment.com",
  description:
    "Somatic bodywork, yoga, and intuitive consulting with Mackensie Grant in Burlington, VT. Massage therapy that addresses physical tension and its deeper roots.",
};

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  blurb: string;
};

// The two bookable massage sessions. Add more here if desired.
export const services: Service[] = [
  {
    id: "massage-60",
    name: "60-Minute Massage",
    durationMinutes: 60,
    price: 120,
    blurb:
      "A focused hour of integrative bodywork — craniosacral, polarity, and intuitive touch to release tension and restore ease.",
  },
  {
    id: "massage-90",
    name: "90-Minute Massage",
    durationMinutes: 90,
    price: 180,
    blurb:
      "A spacious ninety minutes for whole-body release and deep nervous-system rest, working with both physical holding and its emotional roots.",
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
