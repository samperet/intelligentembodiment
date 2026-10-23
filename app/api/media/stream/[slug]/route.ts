import { canAccessMedia, cookieReader } from "@/lib/media";
import { driveRange } from "@/lib/drive";
import { getMediaLibrary, getObject, isR2Configured } from "@/lib/r2";
import { MEDIA_CHUNK_BYTES, MEDIA_SLUG, type MediaTrack } from "@/lib/mediaShared";

export const dynamic = "force-dynamic";

// The catalog is tiny but read on every range request; keep it briefly.
let cache: { at: number; items: MediaTrack[] } | null = null;

async function findTrack(slug: string): Promise<MediaTrack | undefined> {
  const fresh = cache && Date.now() - cache.at < 60_000;
  let hit = fresh ? cache!.items.find((t) => t.slug === slug) : undefined;
  if (!hit) {
    const items = await getMediaLibrary<MediaTrack>();
    cache = { at: Date.now(), items };
    hit = items.find((t) => t.slug === slug);
  }
  return hit;
}

/** Parse a single "bytes=" range against `size`. null = unsatisfiable. */
function parseRange(header: string | null, size: number): [number, number] | null {
  if (!header) return [0, size - 1];
  const m = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (m[1] === "" && m[2] === "")) return null;
  let start: number;
  let end: number;
  if (m[1] === "") {
    // Suffix range: the last N bytes.
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) return null;
  return [start, end];
}

async function guard(request: Request, slug: string) {
  if (!canAccessMedia(cookieReader(request))) {
    return { error: new Response("Unauthorized", { status: 401 }) };
  }
  if (!MEDIA_SLUG.test(slug) || !isR2Configured()) {
    return { error: new Response("Not found", { status: 404 }) };
  }
  const track = await findTrack(slug);
  if (!track) return { error: new Response("Not found", { status: 404 }) };
  return { track };
}

const baseHeaders = (track: MediaTrack) => ({
  "Accept-Ranges": "bytes",
  "Content-Type": track.type,
  "Cache-Control": "private, max-age=3600",
  "X-Content-Type-Options": "nosniff",
});

export async function HEAD(request: Request, { params }: { params: { slug: string } }) {
  const g = await guard(request, params.slug);
  if (g.error) return g.error;
  return new Response(null, {
    status: 200,
    headers: { ...baseHeaders(g.track), "Content-Length": String(g.track.size) },
  });
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const g = await guard(request, params.slug);
  if (g.error) return g.error;
  const track = g.track;

  const range = parseRange(request.headers.get("range"), track.size);
  if (!range) {
    return new Response(null, {
      status: 416,
      headers: { ...baseHeaders(track), "Content-Range": `bytes */${track.size}` },
    });
  }

  // Serve at most one stored part per response; the player asks for the next
  // range as it plays, so long tracks stream in 3 MB steps.
  const [start, requestedEnd] = range;

  if (track.drive) {
    const end = Math.min(requestedEnd, start + MEDIA_CHUNK_BYTES - 1);
    let res: Response;
    try {
      res = await driveRange(track.drive, start, end);
    } catch {
      return new Response("Drive unavailable", { status: 502 });
    }
    // Anything but the exact range asked for (an HTML quota or sign-in page,
    // or the whole file) is not passed through.
    if (res.status !== 206 || !res.headers.get("content-range")?.startsWith(`bytes ${start}-${end}/`)) {
      res.body?.cancel().catch(() => {});
      return new Response("Drive unavailable", { status: 502 });
    }
    return new Response(res.body, {
      status: 206,
      headers: {
        ...baseHeaders(track),
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${track.size}`,
      },
    });
  }

  const part = Math.floor(start / MEDIA_CHUNK_BYTES);
  const partStart = part * MEDIA_CHUNK_BYTES;
  const partEnd = Math.min(partStart + MEDIA_CHUNK_BYTES, track.size) - 1;
  const end = Math.min(requestedEnd, partEnd);

  let bytes: ArrayBuffer | null;
  try {
    bytes = await getObject(`media/files/${track.slug}/${part}`);
  } catch {
    return new Response("Storage unavailable", { status: 502 });
  }
  if (!bytes) return new Response("Not found", { status: 404 });

  const body = bytes.slice(start - partStart, end - partStart + 1);
  return new Response(body, {
    status: 206,
    headers: {
      ...baseHeaders(track),
      "Content-Length": String(body.byteLength),
      "Content-Range": `bytes ${start}-${end}/${track.size}`,
    },
  });
}
