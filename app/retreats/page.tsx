import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Previous Retreats",
  description:
    "A look back at past retreats, gatherings, women's circles, and immersions with Mackensie Satya Priya.",
};

// Curated event posters (in intended order), plus anything later dropped into
// public/imagery/retreats. Each is verified on disk so nothing renders broken.
const CURATED_POSTERS: { file: string; alt: string }[] = [
  { file: "Ignite-Your-Heart_Facebook.jpg", alt: "Ignite Your Heart — Maui Yoga Retreat" },
  { file: "desire.jpg", alt: "Exploring the Sacred Art of Desire" },
  { file: "OTL2.jpg", alt: "Opening to Love — a HeartIQ event" },
  { file: "Opening-to-Love-Dec-16-2018_HeartIQ.jpg", alt: "Opening to Love — day-long immersion" },
  { file: "she-womens-weekend.jpg", alt: "she — a women's weekend" },
  { file: "Yoga-Poster-Binder-Clips.png", alt: "Yoga with Mackensie" },
];

function exists(rel: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", rel));
}

function retreatPosters(): { src: string; alt: string }[] {
  const out = CURATED_POSTERS.map((p) => ({
    src: `/imagery/${p.file}`,
    alt: p.alt,
  })).filter((p) => exists(p.src));

  // Append any extra posters added later under /imagery/retreats.
  try {
    const dir = path.join(process.cwd(), "public", "imagery", "retreats");
    for (const f of fs.readdirSync(dir).sort()) {
      if (/\.(jpe?g|png|webp)$/i.test(f))
        out.push({ src: `/imagery/retreats/${f}`, alt: "Retreat poster" });
    }
  } catch {
    /* no extra folder */
  }
  return out;
}

export default function RetreatsPage() {
  const posters = retreatPosters();

  return (
    <>
      <PageHero
        eyebrow="Gatherings & Immersions"
        title={
          <>
            Previous <em className="text-copper-800">retreats</em>
          </>
        }
        lead="Moments from past retreats, women's circles, and immersions."
      />

      <section className="px-6 pb-[clamp(64px,10vw,128px)]">
        <div className="mx-auto max-w-container">
          {posters.length === 0 ? (
            <p className="mx-auto max-w-[46ch] text-center font-sans text-[17px] leading-[1.7] text-ink-500">
              Posters from past gatherings will appear here soon. To hear about
              what&apos;s next,{" "}
              <Link href="/about#newsletter" className="text-copper-800 underline">
                join the list
              </Link>
              .
            </p>
          ) : (
            <div className="[column-gap:1.5rem] sm:columns-2 lg:columns-3">
              {posters.map((p) => (
                <div
                  key={p.src}
                  className="mb-6 overflow-hidden rounded-2xl shadow-md ring-1 ring-[color:var(--border)] [break-inside:avoid]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} className="w-full" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-[clamp(40px,6vw,72px)] text-center">
            <Link href="/about" className="btn btn-secondary btn-md">
              ← Back to About
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
