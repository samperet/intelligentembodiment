// TEMPORARY one-time import of the Howard Wills recordings. Only these exact
// files can be written: every part is checked against its SHA-256 before it
// is stored. Remove this route once the import is done.
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { canAccessMedia, cookieReader } from "@/lib/media";
import { getMediaLibrary, isR2Configured, putObject, saveMediaLibrary } from "@/lib/r2";
import { MEDIA_CHUNK_BYTES, type MediaTrack } from "@/lib/mediaShared";

export const dynamic = "force-dynamic";

const ARTIST = "Howard Wills";
const ALBUM = "Exploring New Realms of Healing & Consciousness";

const IMPORTS: {
  slug: string;
  title: string;
  track: number;
  duration: number;
  size: number;
  type: string;
  parts: string[];
}[] = [
  {
    "slug": "introduction",
    "title": "Introduction",
    "track": 1,
    "duration": 61.81,
    "size": 2046920,
    "type": "audio/mp4",
    "parts": [
      "7742bb46d77ad8697aa91d96356be455664ae7ca3fa5ebd0346fd08209bf0c63"
    ]
  },
  {
    "slug": "cleansing-thru-peacemaking",
    "title": "Cleansing Thru Peacemaking",
    "track": 3,
    "duration": 293.99,
    "size": 10094844,
    "type": "audio/mp4",
    "parts": [
      "a005d3f98752f79c234813e0cdc02a2e870d4d8116581b4c0cf7e401df87944e",
      "84e3c81bed4c57972916e00818d3bf502711d6fc9c2ad6c0e0a447a42db50a0a",
      "a1c3d7a8b527cc0eff85c5e8041966191c511a14667b217d26f7b29ab8d68cd6",
      "3cbfc196b2001a9d21430eabe9e6632f3535f19c5dfd02cdfd8bb5e2c4a58d26"
    ]
  },
  {
    "slug": "learning-to-live-from-higher-intelligence",
    "title": "Learning To Live From Higher Intelligence",
    "track": 4,
    "duration": 146.24,
    "size": 5045233,
    "type": "audio/mp4",
    "parts": [
      "15f4da2355695549e61ac2eafbd7d2cc1a2aa5039c547b41dbe152771b4a0fe4",
      "486c09a665528d17b6188bf28b8231baec349ba0285a24b0684edd4b965145bf"
    ]
  },
  {
    "slug": "prayer-of-forgiveness",
    "title": "Prayer Of Forgiveness",
    "track": 7,
    "duration": 148.28,
    "size": 5137570,
    "type": "audio/mp4",
    "parts": [
      "69342625d6d1e71387d91bebba6cc77d3f9078cfeb6260c3a195341b94485830",
      "8aac00bcc0a9a2b609ddc1a8762679169611bdf89fd6758a9d067a246ec4088b"
    ]
  },
  {
    "slug": "prayer-of-personal-forgiveness",
    "title": "Prayer Of Personal Forgiveness",
    "track": 8,
    "duration": 164.33,
    "size": 5655725,
    "type": "audio/mp4",
    "parts": [
      "f848321321197b0f769f589f3b54b1430ff9f706b82fae6b84133a0f4bccbdc7",
      "22daa39fec9a88c060c7237ef5f1be2e85f808201a9ef927b16c0dd495871c38"
    ]
  }
];

// POST ?slug=…&part=N   (raw bytes)  → store one verified part
// POST ?slug=…&commit=1             → add the track to the library
export async function POST(request: Request) {
  if (!canAccessMedia(cookieReader(request)) || !isR2Configured()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const url = new URL(request.url);
  const item = IMPORTS.find((t) => t.slug === url.searchParams.get("slug"));
  if (!item) return NextResponse.json({ error: "Unknown track." }, { status: 404 });

  if (url.searchParams.get("commit")) {
    const items = await getMediaLibrary<MediaTrack>();
    if (items.some((t) => t.slug === item.slug)) {
      return NextResponse.json({ ok: true, already: true });
    }
    const track: MediaTrack = {
      slug: item.slug,
      title: item.title,
      artist: ARTIST,
      album: ALBUM,
      track: item.track,
      duration: item.duration,
      size: item.size,
      type: item.type,
      parts: Math.ceil(item.size / MEDIA_CHUNK_BYTES),
      added: new Date().toISOString(),
    };
    await saveMediaLibrary([...items, track]);
    return NextResponse.json({ ok: true });
  }

  const part = Number(url.searchParams.get("part"));
  if (!Number.isInteger(part) || part < 0 || part >= item.parts.length) {
    return NextResponse.json({ error: "Invalid part." }, { status: 400 });
  }
  const bytes = Buffer.from(await request.arrayBuffer());
  if (createHash("sha256").update(bytes).digest("hex") !== item.parts[part]) {
    return NextResponse.json({ error: "Part does not match." }, { status: 400 });
  }
  await putObject(`media/files/${item.slug}/${part}`, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "application/octet-stream");
  return NextResponse.json({ ok: true });
}
