// TEMPORARY: replace Howard Wills's cover with his portrait. Only this exact
// image is accepted (checked against its SHA-256). Remove once done.
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { canAccessMedia, cookieReader } from "@/lib/media";
import { getMediaCovers, isR2Configured, putObject, saveMediaCovers } from "@/lib/r2";

export const dynamic = "force-dynamic";

const SLUG = "howard-wills";
const SHA256 = "d75c8531cc8b2317e557c14dd62cf0ff5394469d87c1b404df88728b6a2776a9";

// POST   (raw JPEG bytes)
export async function POST(request: Request) {
  if (!canAccessMedia(cookieReader(request)) || !isR2Configured()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const bytes = Buffer.from(await request.arrayBuffer());
  if (createHash("sha256").update(bytes).digest("hex") !== SHA256) {
    return NextResponse.json({ error: "Unknown cover." }, { status: 400 });
  }
  await putObject(
    `media/covers/${SLUG}`,
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "image/jpeg",
  );
  const index = await getMediaCovers();
  index[SLUG] = { type: "image/jpeg", v: Date.now().toString(36) };
  await saveMediaCovers(index);
  return NextResponse.json({ ok: true });
}
