import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  isR2Configured,
  getMediaLibrary,
  saveMediaLibrary,
  deleteObject,
} from "@/lib/r2";
import { mediaConfigured, sortTracks } from "@/lib/media";
import { MEDIA_CHUNK_BYTES, MEDIA_SLUG, type MediaTrack } from "@/lib/mediaShared";

export const dynamic = "force-dynamic";

const text = (v: unknown, max = 160) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
const num = (v: unknown) => {
  const n = Number(v);
  return v !== "" && v != null && Number.isFinite(n) && n >= 0 ? n : undefined;
};

// POST { action: "list" | "add" | "update" | "delete", … }
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const status = { r2Configured: isR2Configured(), passwordSet: mediaConfigured() };

  if (body?.action === "list") {
    const tracks = status.r2Configured
      ? sortTracks(await getMediaLibrary<MediaTrack>().catch(() => []))
      : [];
    return NextResponse.json({ ok: true, ...status, tracks });
  }

  if (!status.r2Configured) {
    return NextResponse.json({ error: "R2 isn’t configured." }, { status: 400 });
  }

  try {
    const items = await getMediaLibrary<MediaTrack>();

    if (body.action === "add") {
      const f = body.track || {};
      const slug = String(f.slug || "");
      const size = num(f.size);
      const title = text(f.title);
      if (!MEDIA_SLUG.test(slug) || !size || !title) {
        return NextResponse.json({ error: "Missing track details." }, { status: 400 });
      }
      if (items.some((t) => t.slug === slug)) {
        return NextResponse.json({ error: "That track already exists." }, { status: 409 });
      }
      const track: MediaTrack = {
        slug,
        title,
        artist: text(f.artist),
        album: text(f.album),
        track: num(f.track),
        duration: num(f.duration),
        size,
        type: text(f.type, 60) || "audio/mpeg",
        parts: Math.ceil(size / MEDIA_CHUNK_BYTES),
        added: new Date().toISOString(),
      };
      await saveMediaLibrary([...items, track]);
      return NextResponse.json({ ok: true, ...status, tracks: sortTracks([...items, track]) });
    }

    if (body.action === "update") {
      const f = body.track || {};
      const next = items.map((t) =>
        t.slug === f.slug
          ? {
              ...t,
              title: text(f.title) || t.title,
              artist: text(f.artist),
              album: text(f.album),
              track: num(f.track),
            }
          : t,
      );
      await saveMediaLibrary(next);
      return NextResponse.json({ ok: true, ...status, tracks: sortTracks(next) });
    }

    if (body.action === "delete") {
      const t = items.find((x) => x.slug === body.slug);
      if (!t) return NextResponse.json({ error: "Not found." }, { status: 404 });
      const next = items.filter((x) => x.slug !== t.slug);
      await saveMediaLibrary(next);
      await Promise.all(
        Array.from({ length: t.parts }, (_, i) =>
          deleteObject(`media/files/${t.slug}/${i}`).catch(() => {}),
        ),
      );
      return NextResponse.json({ ok: true, ...status, tracks: sortTracks(next) });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not save: ${String(err?.message || err)}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
