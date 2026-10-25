import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { coverUrls } from "@/lib/media";
import { deleteObject, getMediaCovers, isR2Configured, putObject, saveMediaCovers } from "@/lib/r2";
import { MEDIA_COVER_BYTES, MEDIA_SLUG } from "@/lib/mediaShared";

export const dynamic = "force-dynamic";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/admin/media/cover?artist=<slug>   (raw image bytes) → set the cover
// POST /api/admin/media/cover?artist=<slug>&remove=1           → remove it
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isR2Configured()) {
    return NextResponse.json({ error: "R2 isn’t configured." }, { status: 400 });
  }
  const url = new URL(request.url);
  const slug = url.searchParams.get("artist") || "";
  if (!MEDIA_SLUG.test(slug)) {
    return NextResponse.json({ error: "Invalid artist." }, { status: 400 });
  }

  try {
    const index = await getMediaCovers();
    if (url.searchParams.get("remove")) {
      delete index[slug];
      await saveMediaCovers(index);
      await deleteObject(`media/covers/${slug}`).catch(() => {});
      return NextResponse.json({ ok: true, covers: coverUrls(index) });
    }

    const type = (request.headers.get("content-type") || "").split(";")[0].trim();
    if (!TYPES.includes(type)) {
      return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 400 });
    }
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MEDIA_COVER_BYTES) {
      return NextResponse.json({ error: "That image is too large." }, { status: 400 });
    }
    await putObject(`media/covers/${slug}`, bytes, type);
    index[slug] = { type, v: Date.now().toString(36) };
    await saveMediaCovers(index);
    return NextResponse.json({ ok: true, covers: coverUrls(index) });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not save: ${String(err?.message || err)}` },
      { status: 502 },
    );
  }
}
