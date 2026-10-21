// Client-safe pieces of the media library, shared by the player, the admin
// uploader, and the API routes.

// Audio is stored in R2 as fixed-size parts so every upload request and every
// streamed range response stays under Vercel's 4.5 MB body limit.
export const MEDIA_CHUNK_BYTES = 3 * 1024 * 1024;

export type MediaTrack = {
  slug: string;
  title: string;
  artist?: string;
  album?: string;
  track?: number;
  duration?: number; // seconds
  size: number; // bytes
  type: string; // MIME type
  parts: number;
  added: string; // ISO
};

export const MEDIA_SLUG = /^[a-z0-9-]{1,80}$/;

/** "1-03_Cleansing_Thru_Peacemaking.m4a" → { track: 3, title: "Cleansing Thru Peacemaking" } */
export function parseTrackFilename(name: string): { track?: number; title: string } {
  const base = name.replace(/\.[a-z0-9]{2,4}$/i, "");
  const m = base.match(/^(?:\d{1,2}-)?(\d{1,3})[\s._-]+(.+)$/);
  const raw = m ? m[2] : base;
  const title = raw.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  return { track: m ? Number(m[1]) : undefined, title: title || base };
}

export function mediaMimeType(name: string, fallback: string): string {
  if (/\.m4a$/i.test(name) || /\.mp4$/i.test(name)) return "audio/mp4";
  if (/\.mp3$/i.test(name)) return "audio/mpeg";
  if (/\.wav$/i.test(name)) return "audio/wav";
  if (/\.ogg$/i.test(name)) return "audio/ogg";
  return fallback || "application/octet-stream";
}

export function formatDuration(seconds?: number): string {
  if (seconds == null || !Number.isFinite(seconds)) return "–:––";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
