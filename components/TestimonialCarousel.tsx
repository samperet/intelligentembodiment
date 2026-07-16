"use client";

import { useRef, useState } from "react";
import { testimonials } from "@/lib/content";

export function TestimonialCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(testimonials.length - 1, i));
    const el = track.children[clamped] as HTMLElement | undefined;
    if (!el) return;
    track.scrollTo({
      left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2,
      behavior: "smooth",
    });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const c = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setIndex(best);
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="ie-swipe flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {testimonials.map((t, i) => (
          <figure
            key={i}
            className="w-full flex-none snap-center px-1 text-center"
          >
            <div className="mx-auto max-w-[760px]">
              <div
                className="font-serif text-copper-500"
                style={{ fontSize: "58px", lineHeight: 0.6, height: "32px" }}
                aria-hidden="true"
              >
                &ldquo;
              </div>
              <blockquote className="font-serif text-[20px] italic leading-[1.55] text-ink-700 sm:text-[23px]">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-copper-800">
                {t.author}
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-9 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-strong)] text-[18px] text-ink-700 transition hover:border-copper-700 hover:text-copper-800 disabled:opacity-30 disabled:hover:border-[color:var(--border-strong)] disabled:hover:text-ink-700"
        >
          ‹
        </button>
        <div className="flex gap-2.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === index}
              className={`h-2 w-2 rounded-full transition ${
                i === index
                  ? "bg-copper-700"
                  : "bg-ink-900/15 hover:bg-ink-900/30"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === testimonials.length - 1}
          aria-label="Next testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-strong)] text-[18px] text-ink-700 transition hover:border-copper-700 hover:text-copper-800 disabled:opacity-30 disabled:hover:border-[color:var(--border-strong)] disabled:hover:text-ink-700"
        >
          ›
        </button>
      </div>
    </div>
  );
}
