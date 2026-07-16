/**
 * Decorative animated backdrop: several mandalas rotating at different speeds
 * and directions while the whole group slowly shifts hue, giving a
 * kaleidoscope shimmer. Pure CSS (see globals.css), respects reduced-motion.
 */
export function MandalaKaleidoscope() {
  return (
    <div className="ie-kaleido" aria-hidden="true">
      {(["a", "b", "c"] as const).map((k) => (
        <div key={k} className={`ie-kaleido__layer ie-kaleido__layer--${k}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mandala.png" alt="" />
        </div>
      ))}
    </div>
  );
}
