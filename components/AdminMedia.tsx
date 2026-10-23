"use client";

import { useEffect, useRef, useState } from "react";
import {
  MEDIA_CHUNK_BYTES,
  formatDuration,
  mediaMimeType,
  mp4Duration,
  parseTrackFilename,
  type MediaTrack,
} from "@/lib/mediaShared";

type Queued = {
  id: string;
  file: File;
  title: string;
  track: string;
  status: "ready" | "uploading" | "done" | "error";
  progress: number; // 0..1
  error?: string;
};

const slugify = (s: string) =>
  `${s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "track"}-${Math.random().toString(36).slice(2, 6)}`;

/** Read a file's duration in the browser (best effort). */
async function readDuration(file: File): Promise<number | undefined> {
  const fromAudio = await audioDuration(file);
  if (fromAudio) return fromAudio;
  if (!/\.(m4a|mp4)$/i.test(file.name)) return undefined;
  return mp4Duration(new DataView(await file.arrayBuffer()));
}

function audioDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    const done = (d?: number) => {
      URL.revokeObjectURL(url);
      resolve(d && Number.isFinite(d) ? d : undefined);
    };
    a.preload = "metadata";
    a.onloadedmetadata = () => done(a.duration);
    a.onerror = () => done();
    setTimeout(() => done(), 5000);
    a.src = url;
  });
}

async function api(payload: unknown) {
  const res = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export function AdminMedia() {
  const [tracks, setTracks] = useState<MediaTrack[]>([]);
  const [r2, setR2] = useState<boolean | null>(null);
  const [passwordSet, setPasswordSet] = useState<boolean | null>(null);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<MediaTrack | null>(null);
  const [drive, setDrive] = useState({ link: "", artist: "", album: "" });
  const [driveMsg, setDriveMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const apply = (d: any) => {
    if (Array.isArray(d.tracks)) setTracks(d.tracks);
    if (typeof d.r2Configured === "boolean") setR2(d.r2Configured);
    if (typeof d.passwordSet === "boolean") setPasswordSet(d.passwordSet);
  };

  useEffect(() => {
    api({ action: "list" })
      .then((d) => {
        apply(d);
        const first = (d.tracks as MediaTrack[])?.[0];
        if (first) {
          setArtist(first.artist || "");
          setAlbum(first.album || "");
        }
      })
      .catch((e) => setMsg(e.message));
  }, []);

  function choose(files: FileList | null) {
    if (!files) return;
    const added: Queued[] = Array.from(files).map((file) => {
      const p = parseTrackFilename(file.name);
      return {
        id: Math.random().toString(36).slice(2),
        file,
        title: p.title,
        track: p.track != null ? String(p.track) : "",
        status: "ready",
        progress: 0,
      };
    });
    setQueue((q) => [...q, ...added]);
    setMsg(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const patch = (id: string, p: Partial<Queued>) =>
    setQueue((q) => q.map((x) => (x.id === id ? { ...x, ...p } : x)));

  async function uploadAll() {
    setBusy(true);
    setMsg(null);
    for (const item of queue.filter((x) => x.status === "ready" || x.status === "error")) {
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      try {
        const slug = slugify(item.title);
        const parts = Math.ceil(item.file.size / MEDIA_CHUNK_BYTES);
        for (let i = 0; i < parts; i++) {
          const chunk = item.file.slice(i * MEDIA_CHUNK_BYTES, (i + 1) * MEDIA_CHUNK_BYTES);
          const res = await fetch(`/api/admin/media/part?slug=${slug}&part=${i}`, {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: chunk,
          });
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.error || `Upload failed (${res.status}).`);
          }
          patch(item.id, { progress: (i + 1) / parts });
        }
        const d = await api({
          action: "add",
          track: {
            slug,
            title: item.title,
            track: item.track,
            artist,
            album,
            size: item.file.size,
            type: mediaMimeType(item.file.name, item.file.type),
            duration: await readDuration(item.file),
          },
        });
        apply(d);
        patch(item.id, { status: "done", progress: 1 });
      } catch (e: any) {
        patch(item.id, { status: "error", error: e.message });
      }
    }
    setQueue((q) => q.filter((x) => x.status !== "done"));
    setBusy(false);
  }

  async function importDrive() {
    setBusy(true);
    setDriveMsg("Reading the Drive folder…");
    try {
      const d = await api({ action: "drive", ...drive });
      apply(d);
      const parts = [`Added ${d.added} recording${d.added === 1 ? "" : "s"}.`];
      if (d.skipped) parts.push(`${d.skipped} already in the library.`);
      if (d.failed?.length) parts.push(`Couldn’t read: ${d.failed.join(", ")}.`);
      setDriveMsg(parts.join(" "));
      if (d.added) setDrive({ link: "", artist: "", album: "" });
    } catch (e: any) {
      setDriveMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(t: MediaTrack) {
    if (!window.confirm(`Remove “${t.title}” from the listening room?`)) return;
    setBusy(true);
    try {
      apply(await api({ action: "delete", slug: t.slug }));
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setBusy(true);
    try {
      apply(await api({ action: "update", track: editing }));
      setEditing(null);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  const pending = queue.some((x) => x.status === "ready" || x.status === "error");

  return (
    <div>
      {r2 === false && (
        <p className="mb-4 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
          R2 isn’t configured, so audio can’t be stored. Set{" "}
          <code>CLOUDFLARE_API</code>, <code>CLOUDFLARE_ACCOUNT_ID</code>, and{" "}
          <code>R2_BUCKET</code>.
        </p>
      )}
      {passwordSet === false && (
        <p className="mb-4 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
          Listeners can’t sign in yet. Set <code>MEDIA_PASSWORD</code> (or <code>MEDIA_KEY</code>) in the
          site’s environment variables.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[14px] text-ink-500">
          Share <strong className="text-ink-700">intelligentembodiment.com/media</strong>{" "}
          with clients, along with the listening-room password.
        </p>
        <a href="/media" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
          Open the room →
        </a>
      </div>

      {/* Library */}
      <div className="mt-6">
        <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.16em] text-ink-500">
          In the library
        </h3>
        {tracks.length === 0 ? (
          <p className="mt-3 font-sans text-[14px] text-ink-400">No recordings yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tracks.map((t, i) => {
              const group = [t.artist, t.album].filter(Boolean).join(" · ");
              const prevGroup = i > 0 ? [tracks[i - 1].artist, tracks[i - 1].album].filter(Boolean).join(" · ") : null;
              const heading = group !== prevGroup && (
                <li key={`h-${t.slug}`} className="pt-3 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-ink-500">
                  {group || "Recordings"}
                </li>
              );
              const row = editing?.slug === t.slug ? (
                <li
                  key={t.slug}
                  className="grid gap-3 rounded-lg border border-copper-300 bg-white p-4 sm:grid-cols-[4.5rem_1fr]"
                >
                  <input
                    aria-label="Track number"
                    inputMode="numeric"
                    value={editing.track ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, track: e.target.value === "" ? undefined : Number(e.target.value) || 0 })
                    }
                    className="field-input"
                  />
                  <input
                    aria-label="Title"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="field-input"
                  />
                  <input
                    aria-label="Artist"
                    placeholder="Artist"
                    value={editing.artist || ""}
                    onChange={(e) => setEditing({ ...editing, artist: e.target.value })}
                    className="field-input sm:col-start-2"
                  />
                  <input
                    aria-label="Program"
                    placeholder="Program"
                    value={editing.album || ""}
                    onChange={(e) => setEditing({ ...editing, album: e.target.value })}
                    className="field-input sm:col-start-2"
                  />
                  <div className="flex gap-3 sm:col-start-2">
                    <button type="button" disabled={busy} onClick={saveEdit} className="btn btn-primary btn-sm">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={t.slug}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--border)] bg-white px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-[17px] text-ink-900">
                      {t.track != null && <span className="mr-2 text-ink-400">{t.track}.</span>}
                      {t.title}
                    </p>
                    <p className="font-sans text-[12px] text-ink-400">
                      {[
                        formatDuration(t.duration),
                        `${(t.size / 1048576).toFixed(1)} MB`,
                        t.drive ? "Google Drive" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(t)}
                      className="font-sans text-[13px] font-medium text-copper-800 underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(t)}
                      className="font-sans text-[13px] text-ink-400 underline transition hover:text-copper-800"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
              return [heading, row];
            })}
          </ul>
        )}
      </div>

      {/* Google Drive */}
      <div className="mt-8 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
        <h3 className="font-serif text-[21px] text-ink-900">Add from Google Drive</h3>
        <p className="mt-1 font-sans text-[14px] text-ink-500">
          Paste a folder (or file) shared as “Anyone with the link”. Recordings
          stream from Drive, so nothing is uploaded. Leave Artist blank to use
          the folder’s name, and Program blank to use each subfolder’s name.
          Importing the same folder again adds only new files.
        </p>
        <label className="mt-4 block">
          <span className="field-label">Drive link</span>
          <input
            value={drive.link}
            placeholder="https://drive.google.com/drive/folders/…"
            onChange={(e) => setDrive({ ...drive, link: e.target.value })}
            className="field-input"
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Artist</span>
            <input
              value={drive.artist}
              onChange={(e) => setDrive({ ...drive, artist: e.target.value })}
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Program</span>
            <input
              value={drive.album}
              onChange={(e) => setDrive({ ...drive, album: e.target.value })}
              className="field-input"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy || !drive.link.trim() || r2 === false}
            onClick={importDrive}
            className="btn btn-primary btn-md"
          >
            Add from Drive
          </button>
          {driveMsg && <span className="font-sans text-[14px] text-ink-700">{driveMsg}</span>}
        </div>
      </div>

      {/* Upload */}
      <div className="mt-8 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
        <h3 className="font-serif text-[21px] text-ink-900">Upload recordings</h3>
        <p className="mt-1 font-sans text-[14px] text-ink-500">
          MP3 or M4A. Titles and track numbers are read from the file names and
          can be adjusted before uploading.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Artist</span>
            <input value={artist} onChange={(e) => setArtist(e.target.value)} className="field-input" />
          </label>
          <label className="block">
            <span className="field-label">Program</span>
            <input value={album} onChange={(e) => setAlbum(e.target.value)} className="field-input" />
          </label>
        </div>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[color:var(--border-strong)] bg-white px-6 py-8 text-center transition hover:border-copper-700">
          <span className="font-sans text-[15px] font-medium text-copper-800">Choose audio files</span>
          <span className="mt-1 font-sans text-[13px] text-ink-400">You can select several at once</span>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.m4a,.mp3"
            multiple
            onChange={(e) => choose(e.target.files)}
            className="sr-only"
          />
        </label>

        {queue.length > 0 && (
          <ul className="mt-4 space-y-2">
            {queue.map((q) => (
              <li key={q.id} className="rounded-lg border border-[color:var(--border)] bg-white p-3">
                <div className="grid grid-cols-[4rem_1fr_auto] items-center gap-3">
                  <input
                    aria-label="Track number"
                    inputMode="numeric"
                    value={q.track}
                    disabled={q.status === "uploading"}
                    onChange={(e) => patch(q.id, { track: e.target.value.replace(/\D/g, "") })}
                    className="field-input !py-2"
                  />
                  <input
                    aria-label="Title"
                    value={q.title}
                    disabled={q.status === "uploading"}
                    onChange={(e) => patch(q.id, { title: e.target.value })}
                    className="field-input !py-2"
                  />
                  {q.status !== "uploading" && (
                    <button
                      type="button"
                      onClick={() => setQueue((all) => all.filter((x) => x.id !== q.id))}
                      className="font-sans text-[13px] text-ink-400 underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {(q.status === "uploading" || q.progress > 0) && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-copper-700 transition-all"
                      style={{ width: `${Math.round(q.progress * 100)}%` }}
                    />
                  </div>
                )}
                {q.error && (
                  <p className="mt-2 font-sans text-[13px] text-copper-900">{q.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy || !pending || r2 === false}
            onClick={uploadAll}
            className="btn btn-primary btn-md"
          >
            {busy ? "Uploading…" : `Upload ${queue.filter((x) => x.status !== "done").length || ""}`.trim()}
          </button>
          {msg && <span className="font-sans text-[14px] text-copper-900">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
