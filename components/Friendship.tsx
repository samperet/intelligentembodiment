import fs from "node:fs";
import path from "node:path";

// Photos: drop images into public/imagery/friendship and they appear here,
// in file-name order (the first is the feature image). Until there are any,
// an illustration of the yurt on the bay stands in.
const PHOTO_DIR = "imagery/friendship";

// Flip book: paste its share/embed link (e.g. from Heyzine or FlipHTML5) to
// show it below the photos.
const FLIPBOOK_URL = "";

function photos(): { src: string; alt: string }[] {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", PHOTO_DIR))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => ({
        src: `/${PHOTO_DIR}/${f}`,
        alt: `Friendship, Maine: ${f
          .replace(/\.[^.]+$/, "")
          .replace(/^\d+[-_ ]*/, "")
          .replace(/[-_]+/g, " ")
          .trim() || "camp on the bay"}`,
      }));
  } catch {
    return [];
  }
}

export function Friendship() {
  const [feature, ...more] = photos();

  return (
    <section id="friendship" className="ie-section relative overflow-hidden px-6">
      <div className="relative mx-auto max-w-container">
        <div className="mx-auto grid max-w-[1040px] items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-2">
          <div className="text-center md:text-left">
            <span className="eyebrow block">Friendship, Maine</span>
            <h2
              className="mt-3 font-serif text-ink-900"
              style={{ fontSize: "clamp(34px,4.6vw,56px)", lineHeight: 1.05 }}
            >
              Friendship
            </h2>
            <p
              className="mt-3 font-serif italic text-copper-800"
              style={{ fontSize: "clamp(19px,2.2vw,24px)", lineHeight: 1.35 }}
            >
              Our camp on the bay
            </p>
            <div className="mt-6 space-y-4 font-sans text-[18px] leading-[1.75] text-ink-500">
              <p>
                On the coast of Maine, in a town called Friendship, there’s a
                yurt on the bay that our family built by hand: two brothers,
                their mother, and the rest of us.
              </p>
              <p>
                It’s off-grid: no power lines, just the tide, the wind, and the
                light on the water. And it’s a lot of fun.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 -right-3 h-full w-full rounded-[18px] border border-copper-300"
            />
            {feature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={feature.src}
                alt={feature.alt}
                className="relative aspect-[4/3] w-full rounded-[18px] object-cover shadow-md"
              />
            ) : (
              <YurtOnTheBay className="relative aspect-[4/3] w-full rounded-[18px] shadow-md" />
            )}
          </div>
        </div>

        {more.length > 0 && (
          <ul className="mx-auto mt-[clamp(36px,5vw,64px)] grid max-w-[1040px] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {more.map((p) => (
              <li key={p.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-[12px] object-cover shadow-sm"
                />
              </li>
            ))}
          </ul>
        )}

        {FLIPBOOK_URL && (
          <div className="mx-auto mt-[clamp(36px,5vw,64px)] max-w-[1040px]">
            <iframe
              src={FLIPBOOK_URL}
              title="Friendship, Maine flip book"
              allowFullScreen
              loading="lazy"
              className="aspect-[4/3] w-full rounded-[18px] border border-[color:var(--border)] bg-paper-2 shadow-sm sm:aspect-[16/10]"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/** A yurt on the bay at dusk, in the site's indigo and copper. */
function YurtOnTheBay({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Illustration of a yurt among spruce trees above a bay"
      className={className}
    >
      <defs>
        <linearGradient id="fr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3E3D3" />
          <stop offset="1" stopColor="#FCF9F3" />
        </linearGradient>
        <linearGradient id="fr-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5B5790" />
          <stop offset="1" stopColor="#3A366F" />
        </linearGradient>
        <clipPath id="fr-clip">
          <rect width="480" height="360" rx="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#fr-clip)">
        <rect width="480" height="360" fill="url(#fr-sky)" />
        {/* sun */}
        <circle cx="352" cy="118" r="34" fill="#C0896D" opacity="0.5" />
        {/* far shore */}
        <path d="M0 200 C60 184 110 190 160 196 S270 184 330 192 S430 186 480 194 V214 H0Z" fill="#3A366F" opacity="0.18" />
        {/* bay */}
        <rect y="206" width="480" height="154" fill="url(#fr-water)" />
        <g stroke="#FCF9F3" strokeLinecap="round" opacity="0.35" strokeWidth="2">
          <path d="M40 236 h46 M120 252 h30 M300 230 h56 M380 248 h40 M210 274 h52 M60 292 h38 M330 300 h48" />
        </g>
        {/* sun's path on the water */}
        <g stroke="#E6C3AE" strokeLinecap="round" opacity="0.55" strokeWidth="3">
          <path d="M336 222 h32 M330 238 h44 M340 254 h24" />
        </g>
        {/* point of land */}
        <path d="M0 214 C40 196 90 188 150 192 C200 196 236 210 262 236 C276 250 250 262 214 266 C150 272 60 270 0 276Z" fill="#2E2A5C" />
        {/* spruces */}
        <g fill="#24204B">
          <path d="M28 214 l16 -58 l16 58Z M36 186 l8 -40 l8 40Z" />
          <path d="M56 206 l20 -74 l20 74Z M66 168 l10 -50 l10 50Z" />
          <path d="M176 206 l14 -50 l14 50Z M182 180 l8 -34 l8 34Z" />
          <path d="M196 214 l18 -64 l18 64Z" />
        </g>
        {/* yurt: round lattice wall, shallow cone roof, crown ring */}
        <g>
          <path d="M84 232 v-28 h96 v28 q-48 6 -96 0Z" fill="#FCF9F3" />
          <g stroke="#C0896D" strokeWidth="1.2" opacity="0.5">
            <path d="M88 206 l18 24 M102 206 l18 25 M116 206 l18 26 M130 206 l18 26 M144 206 l18 25 M158 206 l18 24 M92 230 l18 -24 M106 231 l18 -25 M120 232 l18 -26 M134 232 l18 -26 M148 231 l18 -25 M162 230 l16 -22" />
          </g>
          <path d="M76 206 L122 184 h20 L188 206 q-56 6 -112 0Z" fill="#C0896D" />
          <path d="M76 206 q56 6 112 0" fill="none" stroke="#9E6B52" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M120 184 h24" stroke="#9E6B52" strokeWidth="5" strokeLinecap="round" />
          <path d="M124 234 v-20 a8 8 0 0 1 16 0 v20Z" fill="#3A366F" />
          {/* woodstove pipe and smoke */}
          <path d="M160 196 v-26" stroke="#24204B" strokeWidth="4" />
          <path d="M160 164 c-8 -10 8 -16 0 -26 c-8 -10 8 -16 0 -26" fill="none" stroke="#FCF9F3" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>
        {/* solar panel on its stand */}
        <g>
          <path d="M200 234 l4 -14 M216 234 l-2 -10" stroke="#24204B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M194 222 l8 -16 h22 l-8 16Z" fill="#5B5790" stroke="#FCF9F3" strokeWidth="1.2" />
          <path d="M198 214 h22 M205 222 l8 -16" stroke="#FCF9F3" strokeWidth="0.8" opacity="0.7" />
        </g>
        {/* a small boat */}
        <g transform="translate(300 270)">
          <path d="M0 0 h40 l-6 8 h-28Z" fill="#FCF9F3" />
          <path d="M18 0 v-26 l14 22Z" fill="#E6C3AE" />
        </g>
      </g>
    </svg>
  );
}
