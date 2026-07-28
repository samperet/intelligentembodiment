"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The writing desk — a distraction-free, Medium-inspired editor at
 * /admin/write. Huge serif title, page-like body, autosaved local draft,
 * Write/Preview toggle, one Publish button. Editing a built-in piece keeps
 * its slug, so publishing overrides the original on the site.
 */

type Draft = {
  slug: string | null;
  title: string;
  kind: "essay" | "poem";
  date: string;
  excerpt: string;
  body: string;
};

const fresh = (): Draft => ({
  slug: null,
  title: "",
  kind: "essay",
  date: new Date().toISOString().slice(0, 10),
  excerpt: "",
  body: "",
});

const draftKey = (slug: string | null) => `ie_desk_${slug ?? "new"}`;

export function WriteDesk() {
  const [state, setState] = useState<"checking" | "ready">("checking");
  const [d, setD] = useState<Draft>(fresh());
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [dirty, setDirty] = useState(false);
  const [restored, setRestored] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadedSlug = useRef<string | null>(null);

  // Auth check + load the piece (or a local draft).
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("slug");
    loadedSlug.current = slug;
    (async () => {
      try {
        const s = await fetch("/api/admin/session").then((r) => r.json());
        if (!s?.authed) {
          window.location.href = "/admin";
          return;
        }
        // A locally saved draft wins; otherwise load the server copy.
        const raw = localStorage.getItem(draftKey(slug));
        if (raw) {
          const parsed = JSON.parse(raw) as Draft;
          setD({ ...parsed, slug });
          setRestored(true);
        } else if (slug) {
          const res = await fetch("/api/admin/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get-writing", slug }),
          });
          const data = await res.json();
          if (res.ok && data.writing) {
            setD({
              slug,
              title: data.writing.title || "",
              kind: data.writing.kind === "poem" ? "poem" : "essay",
              date: data.writing.date || fresh().date,
              excerpt: data.writing.excerpt || "",
              body: data.writing.body || "",
            });
          }
        }
      } catch {
        /* fall through to a blank desk */
      }
      setState("ready");
    })();
  }, []);

  // Autosave the draft locally (debounced).
  useEffect(() => {
    if (state !== "ready" || !dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(loadedSlug.current), JSON.stringify(d));
      } catch {
        /* storage full/unavailable */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [d, dirty, state]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setD((cur) => ({ ...cur, [key]: value }));
    setDirty(true);
    setPublished(null);
    setError(null);
  }

  async function discardDraft() {
    localStorage.removeItem(draftKey(loadedSlug.current));
    window.location.reload();
  }

  async function publish() {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-writing",
          writing: { ...d, slug: loadedSlug.current ?? undefined },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not publish.");
      localStorage.removeItem(draftKey(loadedSlug.current));
      loadedSlug.current = data.slug;
      setPublished(data.slug);
      setDirty(false);
      setRestored(false);
      window.history.replaceState(null, "", `/admin/write?slug=${data.slug}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  }

  if (state === "checking") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="font-sans text-[15px] text-ink-400">Opening the desk…</p>
      </div>
    );
  }

  const paragraphs = d.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const stanzas = d.body
    .split(/\n\s*\n/)
    .map((st) => st.split("\n").map((l) => l.trim()).filter(Boolean))
    .filter((st) => st.length);

  return (
    <div className="min-h-screen">
      {/* ── Desk bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-5 py-3">
          <a
            href="/admin"
            className="font-sans text-[14px] text-ink-500 transition hover:text-copper-800"
          >
            ← Admin
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden font-sans text-[13px] text-ink-400 sm:inline">
              {published
                ? "Published ✓"
                : dirty
                  ? "Draft saved on this device"
                  : " "}
            </span>
            <div className="flex rounded-full border border-[color:var(--border-strong)] p-0.5">
              {(["write", "preview"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-4 py-1.5 font-sans text-[13px] capitalize transition ${
                    mode === m ? "bg-indigo-700 text-paper-2" : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={publish}
              disabled={publishing || !d.title.trim()}
              className="btn btn-primary btn-sm"
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      {(restored || published || error) && (
        <div className="mx-auto max-w-[720px] px-6 pt-4">
          {restored && !published && (
            <p className="rounded-lg bg-sand px-4 py-2.5 font-sans text-[13px] text-ink-600">
              Unpublished draft restored from this device.{" "}
              <button type="button" onClick={discardDraft} className="text-copper-800 underline">
                Discard and reload the published version
              </button>
            </p>
          )}
          {published && (
            <p className="rounded-lg bg-sand px-4 py-2.5 font-sans text-[13px] text-ink-600">
              Live on the site.{" "}
              <a
                href={`/writings/${published}`}
                target="_blank"
                rel="noreferrer"
                className="text-copper-800 underline"
              >
                View it →
              </a>{" "}
              (updates may take up to an hour to appear)
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-copper-50 px-4 py-2.5 font-sans text-[13px] text-copper-900">
              {error}
            </p>
          )}
        </div>
      )}

      {mode === "write" ? (
        /* ── Write ──────────────────────────────────────────────────────── */
        <div className="mx-auto max-w-[720px] px-6 pb-32 pt-[clamp(32px,6vw,64px)]">
          <div
            className="ie-grow font-serif"
            style={{ fontSize: "clamp(34px,5vw,46px)", lineHeight: 1.15 }}
            data-replica={d.title}
          >
            <textarea
              rows={1}
              value={d.title}
              onChange={(e) => set("title", e.target.value.replace(/\n/g, " "))}
              placeholder="Title"
              className="w-full border-0 bg-transparent text-ink-900 outline-none placeholder:text-ink-900/25"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[13px] text-ink-400">
            <select
              value={d.kind}
              onChange={(e) => set("kind", e.target.value === "poem" ? "poem" : "essay")}
              className="cursor-pointer border-0 bg-transparent uppercase tracking-[0.14em] text-ink-400 outline-none hover:text-copper-800"
            >
              <option value="essay">Essay</option>
              <option value="poem">Poem</option>
            </select>
            <input
              type="date"
              value={d.date}
              onChange={(e) => set("date", e.target.value)}
              className="border-0 bg-transparent text-ink-400 outline-none hover:text-copper-800"
            />
            <button
              type="button"
              onClick={() => setShowDetails((s) => !s)}
              className="uppercase tracking-[0.14em] transition hover:text-copper-800"
            >
              {showDetails ? "– excerpt" : "+ excerpt"}
            </button>
          </div>

          {showDetails && (
            <textarea
              rows={2}
              value={d.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Excerpt shown on the Writings page (auto-generated if left blank)"
              className="mt-3 w-full resize-none rounded-lg border border-[color:var(--border)] bg-paper-2 px-4 py-3 font-sans text-[14px] text-ink-600 outline-none placeholder:text-ink-400/60"
            />
          )}

          <div
            className="ie-grow mt-8 font-serif"
            style={{ fontSize: "20px", lineHeight: 1.8 }}
            data-replica={d.body}
          >
            <textarea
              rows={8}
              value={d.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder={d.kind === "poem" ? "Let it fall in lines…" : "Tell the story…"}
              className="w-full border-0 bg-transparent text-ink-800 outline-none placeholder:text-ink-900/25"
            />
          </div>
          <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.14em] text-ink-400/70">
            {d.kind === "poem"
              ? "A blank line begins a new stanza"
              : "A blank line begins a new paragraph"}
          </p>
        </div>
      ) : (
        /* ── Preview (rendered like the live page) ──────────────────────── */
        <article className="px-6 pb-32">
          <header className="pb-[clamp(28px,4vw,44px)] pt-[clamp(40px,6vw,72px)] text-center">
            <div className="mx-auto max-w-[720px]">
              <span className="eyebrow block" style={{ textAlign: "center" }}>
                {new Date(`${d.date}T12:00:00`).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {d.kind}
              </span>
              <h1
                className="mt-4 font-serif text-ink-900"
                style={{ fontSize: "clamp(36px,5.2vw,58px)", lineHeight: 1.06 }}
              >
                {d.title || "Untitled"}
              </h1>
            </div>
          </header>
          <div className="mx-auto max-w-[680px]">
            {d.kind === "poem" ? (
              <div className="space-y-7 text-center">
                {stanzas.map((stanza, i) => (
                  <p key={i} className="font-serif text-[21px] leading-[1.75] text-ink-700">
                    {stanza.map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < stanza.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "font-serif text-[22px] italic leading-[1.65] text-ink-700"
                        : "font-sans text-[16.5px] leading-[1.8] text-ink-700"
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
            <p className="mt-10 text-right font-sans text-[13px] font-semibold uppercase tracking-[0.16em] text-copper-800">
              Mackensie Satya Priya
            </p>
          </div>
        </article>
      )}
    </div>
  );
}
