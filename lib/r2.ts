// Cloudflare R2 storage via the REST API (single Bearer token).
// Used to persist newsletter (retreat interest) signups.
//
// Requires env:
//   CLOUDFLARE_API          — a Cloudflare API token with R2 read/write
//   CLOUDFLARE_ACCOUNT_ID   — your Cloudflare account id
//   R2_BUCKET               — the bucket name (default "intelligent-embodiment")

import {
  defaultBookingSettings,
  normalizeBookingSettings,
  type BookingSettings,
} from "./site";

const BASE = "https://api.cloudflare.com/client/v4";
const SUBS_KEY = "newsletter/subscribers.json";
const SETTINGS_KEY = "booking/settings.json";

export type Subscriber = { name: string; email: string; date: string };

function cfg() {
  return {
    token: process.env.CLOUDFLARE_API,
    account: process.env.CLOUDFLARE_ACCOUNT_ID,
    bucket: process.env.R2_BUCKET || "intelligent-embodiment",
  };
}

export function isR2Configured(): boolean {
  const c = cfg();
  return Boolean(c.token && c.account && c.bucket);
}

export function r2Bucket(): string {
  return cfg().bucket;
}

function objectUrl(key: string): string {
  const c = cfg();
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${BASE}/accounts/${c.account}/r2/buckets/${c.bucket}/objects/${encoded}`;
}

async function getJson<T>(key: string): Promise<T | null> {
  const res = await fetch(objectUrl(key), {
    headers: { Authorization: `Bearer ${cfg().token}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`R2 GET ${res.status}: ${t.slice(0, 300)}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function putJson(key: string, data: unknown): Promise<void> {
  const res = await fetch(objectUrl(key), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${cfg().token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`R2 PUT ${res.status}: ${t.slice(0, 300)}`);
  }
}

/** Append a newsletter subscriber (deduped by email). */
export async function addSubscriber(sub: Subscriber): Promise<void> {
  const list = (await getJson<Subscriber[]>(SUBS_KEY)) || [];
  const exists = list.some(
    (s) => s.email.toLowerCase() === sub.email.toLowerCase(),
  );
  if (!exists) {
    list.push(sub);
    await putJson(SUBS_KEY, list);
  }
}

/** Read all newsletter subscribers (newest first). */
export async function listSubscribers(): Promise<Subscriber[]> {
  const list = (await getJson<Subscriber[]>(SUBS_KEY)) || [];
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Effective booking settings: the stored overrides merged over the code
 * defaults. Never throws — falls back to defaults if R2 is unset or errors,
 * so availability generation is always safe.
 */
export async function getBookingSettings(): Promise<BookingSettings> {
  if (!isR2Configured()) return defaultBookingSettings;
  try {
    const stored = await getJson<Partial<BookingSettings>>(SETTINGS_KEY);
    return normalizeBookingSettings(stored);
  } catch {
    return defaultBookingSettings;
  }
}

/**
 * The raw stored settings, or null when nothing has been persisted yet
 * (or R2 is unset). Lets callers distinguish "saved overrides" from
 * "falling back to code defaults".
 */
export async function getStoredBookingSettings(): Promise<Partial<BookingSettings> | null> {
  if (!isR2Configured()) return null;
  return getJson<Partial<BookingSettings>>(SETTINGS_KEY);
}

/**
 * Persist booking settings (validated/clamped), then read the object back
 * to confirm the write actually landed. R2 is strongly consistent for
 * read-after-write, so a missing read-back means the write did not persist
 * — almost always a token without R2 *write* permission. We return that
 * `verified` flag rather than throwing, so a genuinely-working save never
 * breaks on a transient hiccup. Requires R2.
 */
export async function saveBookingSettings(
  input: Partial<BookingSettings>,
): Promise<{ settings: BookingSettings; verified: boolean }> {
  const clean = normalizeBookingSettings(input);
  await putJson(SETTINGS_KEY, clean);
  const stored = await getJson<Partial<BookingSettings>>(SETTINGS_KEY);
  return {
    settings: normalizeBookingSettings(stored ?? clean),
    verified: stored !== null,
  };
}
