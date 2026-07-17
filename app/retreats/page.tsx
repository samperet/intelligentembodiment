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

// Every image dropped in public/imagery/retreats is shown, newest name last.
function retreatPosters(): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "imagery", "retreats");
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => `/imagery/retreats/${f}`);
  } catch {
    return [];
  }
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
              {posters.map((src) => (
                <div
                  key={src}
                  className="mb-6 overflow-hidden rounded-2xl shadow-md ring-1 ring-[color:var(--border)] [break-inside:avoid]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt="Retreat poster"
                    className="w-full"
                    loading="lazy"
                  />
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
