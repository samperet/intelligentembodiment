import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  isR2Configured,
  getMediaLibrary,
  saveMediaLibrary,
  deleteObject,
} from "@/lib/r2";
import { listDriveAudio, parseDriveLink, probeDriveAudio, type DriveFile } from "@/lib/drive";
import { mediaConfigured, sortTracks } from "@/lib/media";
import {
  MEDIA_CHUNK_BYTES,
  MEDIA_SLUG,
  parseTrackFilename,
  type MediaTrack,
} from "@/lib/mediaShared";

export const dynamic = "force-dynamic";
// A Drive import reads the header of every file in the folder.
export const maxDuration = 60;

const text = (v: unknown, max = 160) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
const num = (v: unknown) => {
  const n = Number(v);
  return v !== "" && v != null && Number.isFinite(n) && n >= 0 ? n : undefined;
};

const slugify = (s: string) =>
  `${s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "track"}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Add every audio file in a shared Drive folder (or a single shared file).
 * Subfolders become programs unless one is given; files already in the
 * library are skipped, so a folder can be re-imported to pick up new ones.
 */
async function importFromDrive(body: any, items: MediaTrack[]) {
  const link = parseDriveLink(String(body.link || ""));
  if (!link) throw new Error("That doesn’t look like a Google Drive link.");

  let title = "";
  let files: DriveFile[] = [];
  if (link.kind !== "file") {
    const listed = await listDriveAudio(link.id);
    title = listed.title;
    files = listed.files;
  }
  if (!files.length && link.kind !== "folder") files = [{ id: link.id, name: "", path: [] }];
  if (!files.length) throw new Error("No audio files found. Is the folder shared as “Anyone with the link”?");

  const have = new Set(items.map((t) => t.drive).filter(Boolean));
  const todo = files.filter((f) => !have.has(f.id));
  const artist = text(body.artist) || title || undefined;
  const programOf = (f: DriveFile) =>
    text(body.album) || (f.path.length ? f.path.join(" — ") : title) || undefined;

  // Number tracks by file-name order within each program.
  const byName = (a: DriveFile, b: DriveFile) => a.name.localeCompare(b.name, undefined, { numeric: true });
  const numbers = new Map<string, number>();
  const groups = new Map<string, DriveFile[]>();
  for (const f of files) groups.set(programOf(f) || "", [...(groups.get(programOf(f) || "") || []), f]);
  groups.forEach((g) => g.sort(byName).forEach((f, i) => numbers.set(f.id, i + 1)));

  const added: MediaTrack[] = [];
  const failed: string[] = [];
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let f; (f = queue.shift()); ) {
        const info = await probeDriveAudio(f.id).catch(() => null);
        if (!info) {
          failed.push(f.name || f.id);
          continue;
        }
        const name = f.name || info.name || "Recording";
        const { title: trackTitle } = parseTrackFilename(name);
        added.push({
          slug: slugify(trackTitle),
          title: text(trackTitle) || "Recording",
          artist,
          album: programOf(f),
          track: files.length > 1 ? numbers.get(f.id) : undefined,
          duration: info.duration,
          size: info.size,
          type: info.type,
          parts: 0,
          drive: f.id,
          added: new Date().toISOString(),
        });
      }
    }),
  );
  return { added, failed, skipped: files.length - todo.length };
}

// POST { action: "list" | "add" | "drive" | "update" | "delete", … }
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

    if (body.action === "drive") {
      let r: Awaited<ReturnType<typeof importFromDrive>>;
      try {
        r = await importFromDrive(body, items);
      } catch (err: any) {
        return NextResponse.json({ error: String(err?.message || err) }, { status: 400 });
      }
      // Re-read so edits made while the folder was being scanned aren't lost.
      const next = [...(await getMediaLibrary<MediaTrack>()), ...r.added];
      if (r.added.length) await saveMediaLibrary(next);
      return NextResponse.json({
        ok: true,
        ...status,
        added: r.added.length,
        skipped: r.skipped,
        failed: r.failed,
        tracks: sortTracks(next),
      });
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
