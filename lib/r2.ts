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
const TESTIMONIALS_KEY = "testimonials/submissions.json";
const PUSH_KEY = "push/subscriptions.json";
const CONTENT_RECIPES_KEY = "content/recipes.json";
const CONTENT_WRITINGS_KEY = "content/writings.json";

export type Subscriber = { name: string; email: string; date: string };

export type TestimonialStatus = "pending" | "approved" | "rejected";
export type TestimonialSubmission = {
  id: string;
  name: string;
  quote: string;
  email?: string;
  date: string;
  status: TestimonialStatus;
};

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

// ── Testimonials (collected via the public share page, approved in admin) ─────

function randomId(): string {
  // Timestamp + random suffix; crypto.randomUUID isn't guaranteed on every
  // runtime, so keep it dependency-free.
  return `t_${Date.now().toString(36)}_${Math.round(
    Math.random() * 1e9,
  ).toString(36)}`;
}

/** Append a new testimonial submission (status: pending). Requires R2. */
export async function addTestimonial(input: {
  name: string;
  quote: string;
  email?: string;
}): Promise<TestimonialSubmission> {
  const list = (await getJson<TestimonialSubmission[]>(TESTIMONIALS_KEY)) || [];
  const sub: TestimonialSubmission = {
    id: randomId(),
    name: input.name.trim().slice(0, 120),
    quote: input.quote.trim().slice(0, 2000),
    email: input.email?.trim().slice(0, 200) || undefined,
    date: new Date().toISOString(),
    status: "pending",
  };
  list.push(sub);
  await putJson(TESTIMONIALS_KEY, list);
  return sub;
}

/** All submissions, newest first. */
export async function listTestimonials(): Promise<TestimonialSubmission[]> {
  const list = (await getJson<TestimonialSubmission[]>(TESTIMONIALS_KEY)) || [];
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Update one submission's status. Returns the updated list. Requires R2. */
export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<TestimonialSubmission[]> {
  const list = (await getJson<TestimonialSubmission[]>(TESTIMONIALS_KEY)) || [];
  const next = list.map((t) => (t.id === id ? { ...t, status } : t));
  await putJson(TESTIMONIALS_KEY, next);
  return [...next].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Delete one submission. Returns the updated list. Requires R2. */
export async function deleteTestimonial(
  id: string,
): Promise<TestimonialSubmission[]> {
  const list = (await getJson<TestimonialSubmission[]>(TESTIMONIALS_KEY)) || [];
  const next = list.filter((t) => t.id !== id);
  await putJson(TESTIMONIALS_KEY, next);
  return [...next].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Approved testimonials in display shape ({ quote, author }), newest first. */
export async function listApprovedTestimonials(): Promise<
  { quote: string; author: string }[]
> {
  if (!isR2Configured()) return [];
  try {
    const list =
      (await getJson<TestimonialSubmission[]>(TESTIMONIALS_KEY)) || [];
    return list
      .filter((t) => t.status === "approved")
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((t) => ({ quote: t.quote, author: t.name }));
  } catch {
    return [];
  }
}

// ── Web-push subscriptions ────────────────────────────────────────────────────
export type PushSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  expirationTime?: number | null;
};

export async function addPushSubscription(sub: PushSub): Promise<void> {
  if (!isR2Configured()) return;
  const list = (await getJson<PushSub[]>(PUSH_KEY)) || [];
  if (!list.some((s) => s.endpoint === sub.endpoint)) {
    list.push(sub);
    await putJson(PUSH_KEY, list);
  }
}

export async function listPushSubscriptions(): Promise<PushSub[]> {
  if (!isR2Configured()) return [];
  try {
    return (await getJson<PushSub[]>(PUSH_KEY)) || [];
  } catch {
    return [];
  }
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  if (!isR2Configured()) return;
  const list = (await getJson<PushSub[]>(PUSH_KEY)) || [];
  const next = list.filter((s) => s.endpoint !== endpoint);
  if (next.length !== list.length) await putJson(PUSH_KEY, next);
}

// ── Custom content (writings & recipes added via the admin editor) ────────────
export async function listCustomRecipes<T>(): Promise<T[]> {
  if (!isR2Configured()) return [];
  try {
    return (await getJson<T[]>(CONTENT_RECIPES_KEY)) || [];
  } catch {
    return [];
  }
}
export async function saveCustomRecipes<T>(items: T[]): Promise<void> {
  await putJson(CONTENT_RECIPES_KEY, items);
}
export async function listCustomWritings<T>(): Promise<T[]> {
  if (!isR2Configured()) return [];
  try {
    return (await getJson<T[]>(CONTENT_WRITINGS_KEY)) || [];
  } catch {
    return [];
  }
}
export async function saveCustomWritings<T>(items: T[]): Promise<void> {
  await putJson(CONTENT_WRITINGS_KEY, items);
}
