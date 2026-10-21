"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDuration, type MediaTrack } from "@/lib/mediaShared";

const POS_KEY = "ie_media_pos";

export function MediaPlayer({ tracks }: { tracks: MediaTrack[] }) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration ?? 0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoplay = useRef(false);
  const resumeAt = useRef<number | null>(null);

  const current = tracks[index];

  // Resume where this listener left off (per device).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
      const i = tracks.findIndex((t) => t.slug === saved?.slug);
      if (i >= 0) {
        setIndex(i);
        setDuration(tracks[i].duration ?? 0);
        if (saved.t > 5) resumeAt.current = saved.t;
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

  // Lock-screen / headphone controls.
  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist || "",
      album: current.album || "Intelligent Embodiment",
      artwork: [{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
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
  }, [current, index, prev, next, tracks.length]);

  async function lock() {
    await fetch("/api/media/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => {});
    router.refresh();
  }

  if (!current) {
    return (
      <p className="mx-auto max-w-[520px] rounded-xl bg-sand px-6 py-5 text-center font-sans text-[16px] text-ink-500">
        The library is being prepared. Please check back soon.
      </p>
    );
  }

  const shown = scrub ?? time;
  const pct = duration ? Math.min(100, (shown / duration) * 100) : 0;

  // Group the list by album, keeping the catalog order.
  const groups: { album: string; artist?: string; items: { t: MediaTrack; i: number }[] }[] = [];
  tracks.forEach((t, i) => {
    const album = t.album || "Recordings";
    const g = groups.find((x) => x.album === album);
    if (g) g.items.push({ t, i });
    else groups.push({ album, artist: t.artist, items: [{ t, i }] });
  });

  return (
    <div className="mx-auto max-w-[860px]">
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
        onPlay={() => setPlaying(true)}
        onPause={(e) => {
          setPlaying(false);
          savePosition(e.currentTarget.currentTime);
        }}
        onEnded={() => {
          savePosition(0);
          if (index < tracks.length - 1) go(index + 1, true);
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

      {/* ── Now playing ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-paper-2 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center">
          <div className="relative flex h-40 w-40 flex-none items-center justify-center rounded-full bg-indigo-700 shadow-md sm:h-44 sm:w-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mandala.png"
              alt=""
              className="ie-spin h-[80%] w-[80%] object-contain"
              style={{
                filter: "brightness(0) invert(1)",
                animationPlayState: playing ? "running" : "paused",
              }}
            />
          </div>

          <div className="w-full min-w-0 flex-1 text-center sm:text-left">
            <span className="eyebrow block">{playing ? "Now playing" : "Ready"}</span>
            <h2 className="mt-2 font-serif text-[28px] leading-[1.15] text-ink-900 sm:text-[32px]">
              {current.title}
            </h2>
            {(current.artist || current.album) && (
              <p className="mt-1 font-sans text-[14px] text-ink-500">
                {[current.artist, current.album].filter(Boolean).join(" · ")}
              </p>
            )}

            <div className="mt-5">
              <input
                type="range"
                aria-label="Seek"
                min={0}
                max={duration || 0}
                step={0.5}
                value={shown}
                onChange={(e) => setScrub(Number(e.target.value))}
                onPointerUp={() => {
                  if (scrub != null && audioRef.current) audioRef.current.currentTime = scrub;
                  setScrub(null);
                }}
                onKeyUp={() => {
                  if (scrub != null && audioRef.current) audioRef.current.currentTime = scrub;
                  setScrub(null);
                }}
                className="ie-range w-full"
                style={{ ["--pct" as string]: `${pct}%` }}
              />
              <div className="mt-1 flex justify-between font-sans text-[12px] tabular-nums text-ink-400">
                <span>{formatDuration(shown)}</span>
                <span>{formatDuration(duration || current.duration)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start sm:gap-4">
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
              <p className="mt-4 rounded-lg bg-copper-50 px-4 py-2.5 font-sans text-[14px] text-copper-900">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Track list ─────────────────────────────────────────────────── */}
      {groups.map((g) => (
        <div key={g.album} className="mt-10">
          <div className="border-b border-[color:var(--border)] pb-3">
            <h3 className="font-serif text-[22px] text-ink-900">{g.album}</h3>
            {g.artist && (
              <p className="font-sans text-[13px] uppercase tracking-[0.14em] text-ink-400">
                {g.artist}
              </p>
            )}
          </div>
          <ol className="mt-2">
            {g.items.map(({ t, i }) => {
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
        </div>
      ))}

      <div className="mt-12 flex flex-col items-center gap-4 text-center">
        <p className="max-w-[56ch] font-sans text-[13px] leading-[1.7] text-ink-400">
          These recordings are shared for your personal practice. Please
          don&apos;t copy or pass them along.
        </p>
        <button
          type="button"
          onClick={lock}
          className="font-sans text-[13px] text-ink-400 underline transition hover:text-copper-800"
        >
          Lock the library on this device
        </button>
      </div>
    </div>
  );
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
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-500 transition hover:bg-white hover:text-copper-800 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

const svg = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true };

function Play() {
  return (
    <svg {...svg} width={28} height={28}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}
function Pause() {
  return (
    <svg {...svg} width={28} height={28}>
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
