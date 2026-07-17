"use client";

import { useEffect, useRef } from "react";

/**
 * A mirrored kaleidoscope of the mandala behind the page header. The circle is
 * divided into `petals * 2` wedges converging at the center; adjacent wedges
 * are mirror reflections (a mirror seam per petal edge).
 *
 * Interaction: it only responds while the cursor is over the header. Moving the
 * mouse imparts angular momentum; when the cursor leaves, friction eases the
 * spin to a slow stop rather than snapping.
 */
export function KaleidoscopeMandala({
  petals = 8,
  className = "",
}: {
  petals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const img = new Image();
    let ready = false;
    img.onload = () => {
      ready = true;
    };
    img.src = "/mandala.png";

    let dpr = 1;
    let W = 0;
    let H = 0;
    const resize = () => {
      const r = parent.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // Angular position + velocity (momentum model). Impulses are only added
    // while a pointer (mouse or finger) moves over the header, so leaving or
    // lifting simply stops the input and friction glides the spin to rest.
    let angle = 0;
    let vel = 0;

    const MAX_VEL = 0.05;
    const IMPULSE_K = 0.00004; // spin added per px of horizontal motion
    const FRICTION = 0.965; // per-frame decay → gentle glide-down

    const addImpulse = (dx: number) => {
      vel += dx * IMPULSE_K;
      if (vel > MAX_VEL) vel = MAX_VEL;
      else if (vel < -MAX_VEL) vel = -MAX_VEL;
    };

    // `touch-action: pan-y` lets iOS keep vertical scrolling while streaming
    // horizontal drags to JS instead of cancelling the gesture as a scroll.
    const prevTouchAction = parent.style.touchAction;
    parent.style.touchAction = "pan-y";

    // Mouse / pen via pointer events. Skip touch here — iOS fires both pointer
    // and touch events, and touch is handled separately below to avoid
    // double-counting. Track the previous x per pointer to derive the delta.
    let lastX: number | null = null;
    let lastId: number | null = null;
    const onPointerMove = (e: PointerEvent) => {
      if (reduce || e.pointerType === "touch") return;
      if (e.pointerId !== lastId) {
        lastId = e.pointerId;
        lastX = e.clientX;
        return;
      }
      if (lastX === null) {
        lastX = e.clientX;
        return;
      }
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      addImpulse(dx);
    };
    const onPointerEnd = () => {
      lastX = null;
      lastId = null;
    };

    // Touch, handled natively for reliable iOS support.
    let touchX: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0]?.clientX ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (reduce) return;
      const x = e.touches[0]?.clientX;
      if (x == null) return;
      if (touchX == null) {
        touchX = x;
        return;
      }
      addImpulse(x - touchX);
      touchX = x;
    };
    const onTouchEnd = () => {
      touchX = null;
    };

    // Passive throughout: we never preventDefault, so vertical scroll is
    // unaffected — only the horizontal component spins the mandala.
    parent.addEventListener("pointermove", onPointerMove, { passive: true });
    parent.addEventListener("pointerleave", onPointerEnd);
    parent.addEventListener("pointerup", onPointerEnd);
    parent.addEventListener("pointercancel", onPointerEnd);
    parent.addEventListener("touchstart", onTouchStart, { passive: true });
    parent.addEventListener("touchmove", onTouchMove, { passive: true });
    parent.addEventListener("touchend", onTouchEnd, { passive: true });
    parent.addEventListener("touchcancel", onTouchEnd, { passive: true });

    const seg = Math.max(2, Math.round(petals) * 2);
    const ang = (Math.PI * 2) / seg;

    let raf = 0;
    const frame = () => {
      // Integrate + decay. Friction always applies, so momentum glides to rest
      // whether the cursor stopped moving or left the section entirely.
      angle += vel;
      vel *= FRICTION;
      if (Math.abs(vel) < 1e-5) vel = 0;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (ready && W > 0 && H > 0) {
        const cx = W * 0.5;
        const cy = H * 0.5;
        const R = Math.hypot(W, H); // clip well past the drawn image
        // Draw the mandala near its original header scale (~640px wide).
        const s = Math.min(660, W * 1.05);

        for (let i = 0; i < seg; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(i * ang);
          // Mirror every other wedge so shared edges reflect seamlessly.
          if (i % 2 === 1) {
            ctx.rotate(ang);
            ctx.scale(1, -1);
          }
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, R, -0.008, ang + 0.008);
          ctx.closePath();
          ctx.clip();
          ctx.rotate(angle);
          ctx.drawImage(img, -s / 2, -s / 2, s, s);
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.style.touchAction = prevTouchAction;
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerEnd);
      parent.removeEventListener("pointerup", onPointerEnd);
      parent.removeEventListener("pointercancel", onPointerEnd);
      parent.removeEventListener("touchstart", onTouchStart);
      parent.removeEventListener("touchmove", onTouchMove);
      parent.removeEventListener("touchend", onTouchEnd);
      parent.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [petals]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
