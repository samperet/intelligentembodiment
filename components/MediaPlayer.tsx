"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { artistSlug, formatDuration, type MediaTrack } from "@/lib/mediaShared";

const POS_KEY = "ie_media_pos";

const programKey = (t: MediaTrack) => `${t.artist || ""}\u0000${t.album || ""}`;

type Program = { key: string; name: string; duration: number; items: { t: MediaTrack; i: number }[] };
type Artist = { slug: string; name: string; programs: Program[]; count: number; duration: number };

export function MediaPlayer({
  tracks,
  covers,
  initialArtist,
}: {
  tracks: MediaTrack[];
  covers: Record<string, string>; // artist slug → cover URL
  initialArtist?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration ?? 0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoplay = useRef(false);
  const resumeAt = useRef<number | null>(null);

  const current = tracks[index];

  // Artist → program → tracks, keeping the catalog order.
  const artists = useMemo(() => {
    const list: Artist[] = [];
    tracks.forEach((t, i) => {
      const slug = artistSlug(t.artist);
      let a = list.find((x) => x.slug === slug);
      if (!a) list.push((a = { slug, name: t.artist || "Recordings", programs: [], count: 0, duration: 0 }));
      const key = programKey(t);
      let p = a.programs.find((x) => x.key === key);
      if (!p) a.programs.push((p = { key, name: t.album || "Recordings", duration: 0, items: [] }));
      p.items.push({ t, i });
      p.duration += t.duration ?? 0;
      a.count += 1;
      a.duration += t.duration ?? 0;
    });
    return list;
  }, [tracks]);

  // ── Views: all artists ⇄ one artist, with a player sheet on top ─────────
  // Kept in the URL (?artist=…) and browser history, so Back works, including
  // the Android back gesture in the installed app.
  const [artist, setArtist] = useState<string | null>(
    initialArtist && artists.some((a) => a.slug === initialArtist) ? initialArtist : null,
  );
  const [sheet, setSheet] = useState(false);
  const shown = artists.find((a) => a.slug === artist);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const slug = new URLSearchParams(window.location.search).get("artist");
      setArtist(slug && artists.some((a) => a.slug === slug) ? slug : null);
      setSheet(Boolean(e.state?.ieSheet));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [artists]);

  const openArtist = (slug: string) => {
    window.history.pushState({ ieArtist: true }, "", `/media?artist=${slug}`);
    setArtist(slug);
    window.scrollTo(0, 0);
  };

  const allArtists = () => {
    if (window.history.state?.ieArtist) window.history.back();
    else {
      window.history.replaceState(null, "", "/media");
      setArtist(null);
    }
    window.scrollTo(0, 0);
  };

  const openSheet = () => {
    window.history.pushState({ ...window.history.state, ieSheet: true }, "");
    setSheet(true);
  };

  const closeSheet = useCallback(() => {
    if (window.history.state?.ieSheet) window.history.back();
    else setSheet(false);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheet, closeSheet]);

  // ── Programs: expand the one that's playing ──────────────────────────────
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (current) setOpen((o) => (o.has(programKey(current)) ? o : new Set(o).add(programKey(current))));
  }, [current]);

  const toggleProgram = (key: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  // ── Playback ──────────────────────────────────────────────────────────────

  // Resume where this listener left off (per device).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
      const i = tracks.findIndex((t) => t.slug === saved?.slug);
      if (i >= 0) {
        setIndex(i);
        setDuration(tracks[i].duration ?? 0);
        if (saved.t > 5) {
          resumeAt.current = saved.t;
          setStarted(true);
        }
      }
    } catch {
      /* storage unavailable */
    }
  }, [tracks]);

  const savePosition = useCallback((t: number) => {
    try {
      if (current) localStorage.setItem(POS_KEY, JSON.stringify({ slug: current.slug, t }));
    } catch {
      /* storage unavailable */
    }
  }, [current]);

  // Start the next track once its source has been swapped in.
  useEffect(() => {
    setError(null);
    setTime(resumeAt.current ?? 0);
    if (autoplay.current) {
      autoplay.current = false;
      audioRef.current?.play().catch(() => {});
    }
  }, [index]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setError("This track couldn’t be played."));
    else a.pause();
  }, []);

  const go = useCallback(
    (i: number, play = true) => {
      if (i < 0 || i >= tracks.length) return;
      resumeAt.current = null;
      if (i === index) {
        if (audioRef.current) audioRef.current.currentTime = 0;
        if (play) audioRef.current?.play().catch(() => {});
        return;
      }
      autoplay.current = play;
      setDuration(tracks[i].duration ?? 0);
      setIndex(i);
    },
    [index, tracks],
  );

  const prev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) a.currentTime = 0;
    else go(index - 1, !a?.paused);
  }, [go, index]);

  const next = useCallback(() => go(index + 1, !audioRef.current?.paused), [go, index]);

  const skip = (delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.min(Math.max(0, a.currentTime + delta), duration || a.duration || 0);
  };

  const cover = current ? covers[artistSlug(current.artist)] : undefined;

  // Lock-screen / headphone controls.
  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist || "",
      album: current.album || "Intelligent Embodiment",
      artwork: [
        cover
          ? { src: cover, sizes: "512x512" }
          : { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    });
    const set = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        /* unsupported action */
      }
    };
    set("play", () => audioRef.current?.play());
    set("pause", () => audioRef.current?.pause());
    set("previoustrack", index > 0 ? prev : null);
    set("nexttrack", index < tracks.length - 1 ? next : null);
    set("seekbackward", () => skip(-15));
    set("seekforward", () => skip(15));
    set("seekto", (d) => {
      if (audioRef.current && d.seekTime != null) audioRef.current.currentTime = d.seekTime;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, cover, index, prev, next, tracks.length]);

  if (!current) {
    return (
      <>
        <Hero />
        <p className="mx-auto mb-24 max-w-[520px] rounded-xl bg-sand px-6 py-5 text-center font-sans text-[16px] text-ink-500">
          The library is being prepared. Please check back soon.
        </p>
      </>
    );
  }

  const at = scrub ?? time;
  const pct = duration ? Math.min(100, (at / duration) * 100) : 0;
  const subtitle = [current.artist, current.album].filter(Boolean).join(" · ");
  const commitScrub = () => {
    if (scrub != null && audioRef.current) audioRef.current.currentTime = scrub;
    setScrub(null);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={`/api/media/stream/${current.slug}`}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const a = e.currentTarget;
          if (Number.isFinite(a.duration)) setDuration(a.duration);
          if (resumeAt.current != null) {
            a.currentTime = resumeAt.current;
            resumeAt.current = null;
          }
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setTime(t);
          if (Math.floor(t) % 5 === 0) savePosition(t);
        }}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={(e) => {
          setPlaying(false);
          savePosition(e.currentTarget.currentTime);
        }}
        onEnded={() => {
          savePosition(0);
          // Play on through a program, but stop at its end.
          const following = tracks[index + 1];
          if (following && programKey(following) === programKey(current)) go(index + 1, true);
          else setPlaying(false);
        }}
        onError={(e) => {
          setPlaying(false);
          setError(
            e.currentTarget.canPlayType(current.type)
              ? "This track couldn’t be loaded. Please try again in a moment."
              : "This browser can’t play this recording. Please try Safari, Chrome, or Edge.",
          );
        }}
      />

      {!shown ? (
        /* ── All artists ───────────────────────────────────────────────── */
        <>
          <Hero />
          <section className="px-6">
            <div className="mx-auto grid max-w-[860px] grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8">
              {artists.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => openArtist(a.slug)}
                  className="group text-left focus:outline-none"
                >
                  <Cover
                    src={covers[a.slug]}
                    className="aspect-square w-full rounded-2xl shadow-md transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-focus-visible:ring-4 group-focus-visible:ring-copper-300"
                  />
                  <span className="mt-4 block font-serif text-[22px] leading-tight text-ink-900 transition group-hover:text-copper-800 sm:text-[28px]">
                    {a.name}
                  </span>
                  <span className="mt-1 block font-sans text-[13px] text-ink-400">
                    {a.programs.length} program{a.programs.length === 1 ? "" : "s"} · {a.count} recording
                    {a.count === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* ── One artist ────────────────────────────────────────────────── */
        <section className="px-6 pt-[clamp(28px,5vw,56px)]">
          <div className="mx-auto max-w-[860px]">
            <button
              type="button"
              onClick={allArtists}
              className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-sans text-[14px] text-ink-500 transition hover:text-copper-800"
            >
              <Chevron dir="left" />
              All artists
            </button>

            <header className="mt-5 flex items-center gap-5 sm:gap-7">
              <Cover src={covers[shown.slug]} className="h-28 w-28 flex-none rounded-2xl shadow-md sm:h-40 sm:w-40" />
              <div className="min-w-0">
                <span className="eyebrow block">Artist</span>
                <h1 className="mt-2 font-serif text-[34px] leading-[1.05] text-ink-900 sm:text-[48px]">{shown.name}</h1>
                <p className="mt-2 font-sans text-[13px] text-ink-400">
                  {shown.count} recording{shown.count === 1 ? "" : "s"}
                  {shown.duration > 0 && ` · ${formatTotal(shown.duration)}`}
                </p>
              </div>
            </header>

            <div className="mt-8 space-y-3">
              {shown.programs.map((p) => {
                const isOpen = open.has(p.key) || shown.programs.length === 1;
                const panel = `program-${p.items[0].t.slug}`;
                return (
                  <div key={p.key} className="rounded-xl border border-[color:var(--border)] bg-paper-2/60">
                    <button
                      type="button"
                      onClick={() => toggleProgram(p.key)}
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-4 text-left transition hover:bg-white/60 sm:px-5"
                    >
                      <span className="min-w-0">
                        <span className="block font-serif text-[21px] leading-snug text-ink-900">{p.name}</span>
                        <span className="mt-0.5 block font-sans text-[13px] text-ink-400">
                          {p.items.length} recording{p.items.length === 1 ? "" : "s"}
                          {p.duration > 0 && ` · ${formatTotal(p.duration)}`}
                        </span>
                      </span>
                      <Chevron dir={isOpen ? "up" : "down"} />
                    </button>
                    {isOpen && (
                      <ol id={panel} className="px-1.5 pb-2 sm:px-2">
                        {p.items.map(({ t, i }) => {
                          const active = i === index;
                          return (
                            <li key={t.slug}>
                              <button
                                type="button"
                                onClick={() => (active ? toggle() : go(i, true))}
                                aria-current={active ? "true" : undefined}
                                className={`grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-lg px-3 py-3.5 text-left transition ${
                                  active ? "bg-white shadow-sm" : "hover:bg-white/60"
                                }`}
                              >
                                <span className="flex justify-center font-sans text-[14px] tabular-nums text-ink-400">
                                  {active && playing ? (
                                    <span className="ie-eq" aria-hidden="true">
                                      <span />
                                      <span />
                                      <span />
                                    </span>
                                  ) : (
                                    t.track ?? i + 1
                                  )}
                                </span>
                                <span
                                  className={`font-serif text-[19px] leading-snug ${
                                    active ? "text-copper-800" : "text-ink-900"
                                  }`}
                                >
                                  {t.title}
                                </span>
                                <span className="font-sans text-[13px] tabular-nums text-ink-400">
                                  {formatDuration(t.duration)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Room to scroll the last items clear of the mini player. */}
      <div className={started ? "h-40" : "h-[clamp(64px,9vw,110px)]"} aria-hidden="true" />

      {/* ── Mini player ──────────────────────────────────────────────────── */}
      {started && !sheet && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto relative mx-auto flex max-w-[860px] items-center gap-2 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white/95 p-2 pr-2.5 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={openSheet}
              aria-label="Open the player"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
            >
              <Cover src={cover} spin={playing} className="h-12 w-12 flex-none rounded-lg" />
              <span className="min-w-0">
                <span className="block truncate font-serif text-[17px] leading-tight text-ink-900">
                  {current.title}
                </span>
                <span className={`block truncate font-sans text-[12px] ${error ? "text-copper-900" : "text-ink-400"}`}>
                  {error || subtitle}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-copper-700 text-white transition hover:bg-copper-800"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <IconButton label="Next" onClick={next} disabled={index >= tracks.length - 1}>
              <Next />
            </IconButton>
            <span
              className="absolute bottom-0 left-0 h-[3px] bg-copper-700/70 transition-[width]"
              style={{ width: `${pct}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* ── Full player ──────────────────────────────────────────────────── */}
      {sheet && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-900/40 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={closeSheet}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Now playing"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[94vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-paper-2 px-6 pb-[calc(28px+env(safe-area-inset-bottom))] pt-3 shadow-xl sm:rounded-3xl sm:pb-8"
          >
            <div className="flex items-center justify-between">
              <IconButton label="Close the player" onClick={closeSheet}>
                <Chevron dir="down" />
              </IconButton>
              <span className="eyebrow">{playing ? "Now playing" : "Ready"}</span>
              <span className="w-11" />
            </div>

            <Cover
              src={cover}
              spin={playing}
              className="mx-auto mt-3 aspect-square w-full max-w-[320px] rounded-2xl shadow-md"
            />

            <div className="mt-6 text-center">
              <h2 className="font-serif text-[28px] leading-[1.15] text-ink-900">{current.title}</h2>
              {subtitle && <p className="mt-1 font-sans text-[14px] text-ink-500">{subtitle}</p>}
            </div>

            <div className="mt-5">
              <input
                type="range"
                aria-label="Seek"
                min={0}
                max={duration || 0}
                step={0.5}
                value={at}
                onChange={(e) => setScrub(Number(e.target.value))}
                onPointerUp={commitScrub}
                onKeyUp={commitScrub}
                className="ie-range w-full"
                style={{ ["--pct" as string]: `${pct}%` }}
              />
              <div className="mt-1 flex justify-between font-sans text-[12px] tabular-nums text-ink-400">
                <span>{formatDuration(at)}</span>
                <span>{formatDuration(duration || current.duration)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 sm:gap-4">
              <IconButton label="Back 15 seconds" onClick={() => skip(-15)}>
                <Skip15 back />
              </IconButton>
              <IconButton label="Previous" onClick={prev}>
                <Prev />
              </IconButton>
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-copper-700 text-white shadow-md transition hover:bg-copper-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-copper-300"
              >
                {playing ? <Pause /> : <Play />}
              </button>
              <IconButton label="Next" onClick={next} disabled={index >= tracks.length - 1}>
                <Next />
              </IconButton>
              <IconButton label="Forward 15 seconds" onClick={() => skip(15)}>
                <Skip15 />
              </IconButton>
            </div>
            {error && (
              <p className="mt-4 rounded-lg bg-copper-50 px-4 py-2.5 text-center font-sans text-[14px] text-copper-900">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <PageHero
      eyebrow="Client Library"
      title={
        <>
          The listening <em className="text-copper-800">room</em>
        </>
      }
      lead="Prayers and teachings to return to between sessions."
    />
  );
}

/** An artist's cover, or the mandala on indigo when there isn't one. */
function Cover({ src, spin, className = "" }: { src?: string; spin?: boolean; className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-indigo-700 ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/mandala.png"
          alt=""
          className="ie-spin absolute inset-[12%] h-[76%] w-[76%] object-contain"
          style={{ filter: "brightness(0) invert(1)", animationPlayState: spin ? "running" : "paused" }}
        />
      )}
    </span>
  );
}

/** "4 hr 12 min" / "38 min" */
function formatTotal(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`;
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-500 transition hover:bg-white hover:text-copper-800 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function Chevron({ dir }: { dir: "up" | "down" | "left" }) {
  const rotate = { up: "rotate-180", down: "", left: "rotate-90" }[dir];
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`flex-none text-ink-400 transition-transform ${rotate}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const svg = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true };

function Play({ size = 28 }: { size?: number }) {
  return (
    <svg {...svg} width={size} height={size}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}
function Pause({ size = 28 }: { size?: number }) {
  return (
    <svg {...svg} width={size} height={size}>
      <rect x="6" y="5" width="4" height="14" rx="1.2" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" />
    </svg>
  );
}
function Prev() {
  return (
    <svg {...svg}>
      <rect x="5" y="5" width="2.4" height="14" rx="1" />
      <path d="M19 6.1v11.8a.9.9 0 0 1-1.38.76L9.1 12.76a.9.9 0 0 1 0-1.52l8.52-5.9A.9.9 0 0 1 19 6.1Z" />
    </svg>
  );
}
function Next() {
  return (
    <svg {...svg}>
      <rect x="16.6" y="5" width="2.4" height="14" rx="1" />
      <path d="M5 6.1v11.8a.9.9 0 0 0 1.38.76l8.52-5.9a.9.9 0 0 0 0-1.52L6.38 5.34A.9.9 0 0 0 5 6.1Z" />
    </svg>
  );
}
function Skip15({ back }: { back?: boolean }) {
  return (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <g transform={back ? undefined : "translate(24 0) scale(-1 1)"}>
        <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
        <path d="M4.2 3.8v3.4h3.4" />
      </g>
      <text
        x="12"
        y="15.4"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
        fontFamily="Jost, sans-serif"
      >
        15
      </text>
    </svg>
  );
}
