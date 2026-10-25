// TEMPORARY one-time import of the two seed artist covers (the artwork
// embedded in the recordings). Only these exact images are accepted: each is
// checked against its SHA-256. Remove this route once the import is done.
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { canAccessMedia, cookieReader } from "@/lib/media";
import { getMediaCovers, isR2Configured, putObject, saveMediaCovers } from "@/lib/r2";

export const dynamic = "force-dynamic";

const COVERS: Record<string, string> = {
  "howard-wills": "2edaedf4ef1b5982366f24c79a812e481e3c641a24da5c036b42f777ab7e0a4a",
  "marisa-peer": "b9f42e64222b6e164de916fc00bb1de55cc50efe61757876c9009336f931c8bb",
};

// POST ?artist=<slug>   (raw JPEG bytes)
export async function POST(request: Request) {
  if (!canAccessMedia(cookieReader(request)) || !isR2Configured()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("artist") || "";
  const bytes = Buffer.from(await request.arrayBuffer());
  if (!COVERS[slug] || createHash("sha256").update(bytes).digest("hex") !== COVERS[slug]) {
    return NextResponse.json({ error: "Unknown cover." }, { status: 400 });
  }
  const index = await getMediaCovers();
  if (index[slug]) return NextResponse.json({ ok: true, already: true });
  await putObject(
    `media/covers/${slug}`,
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "image/jpeg",
  );
  index[slug] = { type: "image/jpeg", v: Date.now().toString(36) };
  await saveMediaCovers(index);
  return NextResponse.json({ ok: true });
}
