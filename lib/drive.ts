// Server-only: stream library audio straight from Google Drive. Files must be
// shared as "Anyone with the link"; the Drive file ids stay on the server, and
// listeners only ever see /api/media/stream/<slug>.
import { mediaMimeType, mp4Duration } from "./mediaShared";

const DRIVE_ID = /^[A-Za-z0-9_-]{10,100}$/;
const AUDIO_FILE = /\.(mp3|m4a|mp4|aac|wav)$/i;

/** Folder or file id from a Drive share link (or a bare id). */
export function parseDriveLink(link: string): { id: string; kind: "file" | "folder" | "unknown" } | null {
  const s = link.trim();
  const folder = s.match(/\/folders\/([A-Za-z0-9_-]+)/);
  if (folder) return { id: folder[1], kind: "folder" };
  const file = s.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  if (file) return { id: file[1], kind: "file" };
  const param = s.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (param) return { id: param[1], kind: "unknown" };
  return DRIVE_ID.test(s) ? { id: s, kind: "unknown" } : null;
}

const downloadUrl = (id: string) =>
  `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;

/** Fetch bytes start..end (inclusive) of a Drive file. */
export function driveRange(id: string, start: number, end: number): Promise<Response> {
  return fetch(downloadUrl(id), {
    headers: { Range: `bytes=${start}-${end}` },
    cache: "no-store",
  });
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

type Entry = { id: string; name: string; folder: boolean };

/** One level of a public folder, via Drive's embeddable folder view. */
async function listFolder(id: string): Promise<{ title: string; entries: Entry[] }> {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Drive folder unavailable (${res.status}).`);
  const html = await res.text();
  const entries: Entry[] = [];
  const re = /class="flip-entry" id="entry-([A-Za-z0-9_-]+)"[\s\S]*?<a href="([^"]*)"[\s\S]*?flip-entry-title">([^<]*)</g;
  for (let m; (m = re.exec(html)); ) {
    entries.push({ id: m[1], name: decode(m[3]), folder: m[2].includes("/folders/") });
  }
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] || "").trim();
  return { title, entries };
}

export type DriveFile = { id: string; name: string; path: string[] };

/** Every audio file under a public folder, with its subfolder path. */
export async function listDriveAudio(
  folderId: string,
  limit = 300,
): Promise<{ title: string; files: DriveFile[] }> {
  const root = await listFolder(folderId);
  const files: DriveFile[] = [];
  const walk = async (entries: Entry[], path: string[], depth: number) => {
    for (const e of entries) {
      if (files.length >= limit) return;
      if (e.folder) {
        if (depth < 4) await walk((await listFolder(e.id)).entries, [...path, e.name], depth + 1);
      } else if (AUDIO_FILE.test(e.name)) {
        files.push({ id: e.id, name: e.name, path });
      }
    }
  };
  await walk(root.entries, [], 0);
  return { title: root.title, files };
}

const HEAD_BYTES = 128 * 1024;

/** Size, type, name, and (best effort) duration of a shared Drive file. */
export async function probeDriveAudio(
  id: string,
): Promise<{ name?: string; size: number; type: string; duration?: number } | null> {
  const res = await driveRange(id, 0, HEAD_BYTES - 1);
  const total = res.headers.get("content-range")?.match(/\/(\d+)$/)?.[1];
  const header = res.headers.get("content-type") || "";
  // A private file or a quota page comes back as HTML, not a byte range.
  if (res.status !== 206 || !total || header.startsWith("text/")) return null;
  const size = Number(total);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const name = res.headers
    .get("content-disposition")
    ?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1];
  const fileName = name ? decodeURIComponent(name) : undefined;
  const type = mediaMimeType(fileName || "", header);
  if (!type.startsWith("audio/")) return null;

  let duration: number | undefined;
  if (type === "audio/mpeg") duration = await mp3Duration(id, bytes, size);
  else if (type === "audio/mp4") duration = mp4Duration(new DataView(bytes.buffer));
  return { name: fileName, size, type, duration };
}

// ── MP3 duration from the first frame (Xing/Info, VBRI, or constant bitrate) ──

const KBPS = {
  v1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  v2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const RATES: Record<number, number[]> = {
  3: [44100, 48000, 32000], // MPEG 1
  2: [22050, 24000, 16000], // MPEG 2
  0: [11025, 12000, 8000], // MPEG 2.5
};

async function mp3Duration(id: string, head: Uint8Array, size: number): Promise<number | undefined> {
  let bytes = head;
  let offset = 0; // file position of bytes[0]
  let start = 0; // where the audio frames begin
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    // ID3v2 tag: syncsafe size, plus a 10-byte footer when flagged.
    start =
      10 +
      ((bytes[6] << 21) | (bytes[7] << 14) | (bytes[8] << 7) | bytes[9]) +
      (bytes[5] & 0x10 ? 10 : 0);
  }
  if (start + 4096 > bytes.length) {
    // Large embedded artwork: read the bytes just past the tag.
    const res = await driveRange(id, start, start + 16 * 1024 - 1);
    if (res.status !== 206) return undefined;
    bytes = new Uint8Array(await res.arrayBuffer());
    offset = start;
  }

  for (let i = start - offset; i + 4 < bytes.length; i++) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) continue;
    const version = (bytes[i + 1] >> 3) & 3;
    const layer = (bytes[i + 1] >> 1) & 3;
    const bitrateIdx = bytes[i + 2] >> 4;
    const rateIdx = (bytes[i + 2] >> 2) & 3;
    if (version === 1 || layer !== 1 || bitrateIdx === 0 || bitrateIdx === 15 || rateIdx === 3) continue;
    const mpeg1 = version === 3;
    const sampleRate = RATES[version][rateIdx];
    const samplesPerFrame = mpeg1 ? 1152 : 576;
    const mono = bytes[i + 3] >> 6 === 3;
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    const tag = (at: number) =>
      at + 4 <= bytes.length ? String.fromCharCode(...bytes.subarray(at, at + 4)) : "";

    const xing = i + 4 + (mpeg1 ? (mono ? 17 : 32) : mono ? 9 : 17);
    if ((tag(xing) === "Xing" || tag(xing) === "Info") && xing + 12 <= bytes.length) {
      if (view.getUint32(xing + 4) & 1) {
        return (view.getUint32(xing + 8) * samplesPerFrame) / sampleRate;
      }
    }
    if (tag(i + 36) === "VBRI" && i + 54 <= bytes.length) {
      return (view.getUint32(i + 50) * samplesPerFrame) / sampleRate;
    }
    const kbps = (mpeg1 ? KBPS.v1 : KBPS.v2)[bitrateIdx];
    return ((size - (offset + i)) * 8) / (kbps * 1000);
  }
  return undefined;
}
