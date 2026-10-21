import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { isR2Configured, putObject } from "@/lib/r2";
import { MEDIA_CHUNK_BYTES, MEDIA_SLUG } from "@/lib/mediaShared";

export const dynamic = "force-dynamic";

// POST /api/admin/media/part?slug=…&part=N  (raw bytes, ≤ 3 MB)
// One piece of an audio file; the catalog entry is added once all parts land.
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isR2Configured()) {
    return NextResponse.json({ error: "R2 isn’t configured." }, { status: 400 });
  }
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const part = Number(url.searchParams.get("part"));
  if (!MEDIA_SLUG.test(slug) || !Number.isInteger(part) || part < 0 || part > 500) {
    return NextResponse.json({ error: "Invalid part." }, { status: 400 });
  }
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > MEDIA_CHUNK_BYTES) {
    return NextResponse.json({ error: "Invalid part size." }, { status: 400 });
  }
  try {
    await putObject(`media/files/${slug}/${part}`, bytes, "application/octet-stream");
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Upload failed: ${String(err?.message || err)}` },
      { status: 502 },
    );
  }
}
