// Server-only: access control and catalog for the password-protected /media
// listening room. The password lives in MEDIA_PASSWORD (never in the repo);
// the session cookie holds a hash of it, so changing the password signs
// everyone out.
import { createHash } from "crypto";
import { adminToken } from "./adminAuth";
import { getMediaCovers, getMediaLibrary, type MediaCoverIndex } from "./r2";
import type { MediaTrack } from "./mediaShared";

const COOKIE_NAME = "ie_media";

// Forgiving match: "Awake in the Body" works as well as "awakeinthebody".
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

// MEDIA_PASSWORD is canonical; MEDIA_KEY is also accepted, in any casing
// (e.g. "Media_Key"), since env var names are case-sensitive.
function mediaPassword(): string | undefined {
  if (process.env.MEDIA_PASSWORD) return process.env.MEDIA_PASSWORD;
  const key = Object.keys(process.env).find((k) =>
    ["MEDIA_PASSWORD", "MEDIA_KEY"].includes(k.toUpperCase()),
  );
  return key ? process.env[key] || undefined : undefined;
}

export function mediaConfigured(): boolean {
  return Boolean(mediaPassword());
}

function mediaToken(): string | null {
  const pw = mediaPassword();
  if (!pw) return null;
  return createHash("sha256").update(`ie-media:${normalize(pw)}`).digest("hex");
}

export function mediaPasswordMatches(value: unknown): boolean {
  const pw = mediaPassword();
  if (!pw || typeof value !== "string") return false;
  const v = normalize(value);
  return v.length > 0 && v === normalize(pw);
}

/** Listeners with the media cookie, or a signed-in admin, may listen. */
export function canAccessMedia(getCookie: (name: string) => string | undefined): boolean {
  const m = mediaToken();
  if (m && getCookie(COOKIE_NAME) === m) return true;
  const a = adminToken();
  return Boolean(a && getCookie("ie_admin") === a);
}

export function cookieReader(request: Request) {
  const header = request.headers.get("cookie") || "";
  return (name: string) =>
    header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
}

function cookie(value: string, maxAge: number): string {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function mediaSetCookie(): string {
  const token = mediaToken();
  return token ? cookie(token, 60 * 60 * 24 * 90) : "";
}

export function mediaClearCookie(): string {
  return cookie("", 0);
}

/** Catalog order: artist, then program (album), then track number. */
export function sortTracks(items: MediaTrack[]): MediaTrack[] {
  return [...items].sort(
    (a, b) =>
      (a.artist || "").localeCompare(b.artist || "") ||
      (a.album || "").localeCompare(b.album || "") ||
      (a.track ?? 999) - (b.track ?? 999) ||
      a.title.localeCompare(b.title, undefined, { numeric: true }) ||
      a.added.localeCompare(b.added),
  );
}

export async function listMediaTracks(): Promise<MediaTrack[]> {
  try {
    return sortTracks(await getMediaLibrary<MediaTrack>());
  } catch {
    return [];
  }
}

/** Artist slug → cover URL (versioned, so a new cover is never served stale). */
export function coverUrls(index: MediaCoverIndex): Record<string, string> {
  return Object.fromEntries(
    Object.entries(index).map(([slug, c]) => [slug, `/api/media/cover/${slug}?v=${c.v}`]),
  );
}

export async function listMediaCovers(): Promise<Record<string, string>> {
  try {
    return coverUrls(await getMediaCovers());
  } catch {
    return {};
  }
}
