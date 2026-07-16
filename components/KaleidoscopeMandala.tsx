"use client";

import { useEffect, useRef } from "react";

/**
 * A true mirrored kaleidoscope of the mandala, rendered to a canvas behind the
 * page header. The circle is divided into `petals * 2` wedges that converge at
 * the center; adjacent wedges are mirror reflections of each other, so each
 * petal-width (360/petals) is a mirrored pair. The source sampling is driven by
 * cursor movement — no autonomous animation, so it's calm until you move.
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

    // Cursor-driven targets (eased toward each frame).
    let tRot = 0;
    let tPan = 0;
    let tZoom = 1;
    let rot = 0;
    let pan = 0;
    let zoom = 1;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / Math.max(1, window.innerWidth); // 0..1
      const ny = e.clientY / Math.max(1, window.innerHeight);
      tRot = (nx - 0.5) * Math.PI; // spin the source
      tPan = (ny - 0.5) * 0.5; // slide the source in/out
      tZoom = 1 + (ny - 0.5) * 0.35; // and zoom it a touch
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const seg = Math.max(2, Math.round(petals) * 2);
    const ang = (Math.PI * 2) / seg;

    let raf = 0;
    const frame = () => {
      rot += (tRot - rot) * 0.08;
      pan += (tPan - pan) * 0.08;
      zoom += (tZoom - zoom) * 0.08;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (ready && W > 0 && H > 0) {
        const cx = W * 0.5;
        const cy = H * 0.34; // sit high in the header like a backdrop
        const R =
          Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.15;
        const s = R * 1.7 * zoom; // source draw size

        for (let i = 0; i < seg; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(i * ang);
          // Mirror every other wedge so shared edges reflect seamlessly.
          if (i % 2 === 1) {
            ctx.rotate(ang);
            ctx.scale(1, -1);
          }
          // Clip to one wedge [0, ang] (slight overlap hides hairline seams).
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, R, -0.008, ang + 0.008);
          ctx.closePath();
          ctx.clip();
          // Draw the source, spun and panned by the cursor.
          ctx.rotate(rot * 0.5);
          ctx.drawImage(img, -s / 2, -s / 2 + pan * R, s, s);
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, [petals]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
