import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow, Rule } from "@/components/brand";
import { writings } from "@/lib/content";
import { getAllWritings, getWritingMerged } from "@/lib/contentStore";

// Built-in writings are prerendered; admin-added slugs render on demand.
export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return writings.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const w = await getWritingMerged(params.slug);
  if (!w) return {};
  return { title: `${w.title} · Writings`, description: w.excerpt };
}

export default async function WritingPage({
  params,
}: {
  params: { slug: string };
}) {
  const w = await getWritingMerged(params.slug);
  if (!w) notFound();

  const date = new Date(w.date + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // The next writing in the list (wraps back to the first at the end).
  const all = await getAllWritings();
  const idx = all.findIndex((x) => x.slug === w.slug);
  const next = all[(idx + 1) % all.length];

  return (
    <article className="px-6 pb-[clamp(56px,8vw,96px)]">
      <header className="relative overflow-hidden pb-[clamp(28px,4vw,44px)] pt-[clamp(56px,8vw,96px)] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-40%] w-[min(560px,110%)] -translate-x-1/2 select-none opacity-[0.045]"
        />
        <div className="relative mx-auto max-w-[720px]">
          <Eyebrow align="center">
            {date} · {w.kind}
          </Eyebrow>
          <h1
            className="mt-4 font-serif text-ink-900"
            style={{ fontSize: "clamp(36px,5.2vw,58px)", lineHeight: 1.06 }}
          >
            {w.title}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-[680px]">
        {w.kind === "poem" && w.stanzas ? (
          <div className="space-y-7 text-center">
            {w.stanzas.map((stanza, i) => (
              <p
                key={i}
                className="font-serif text-[21px] leading-[1.75] text-ink-700"
              >
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
            {w.paragraphs?.map((p, i) => (
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

        <div className="mt-12">
          <Rule ornament="mandala" />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link href="/writings" className="btn btn-secondary btn-md">
              ← All writings
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              {w.related && (
                <Link href={w.related.href} className="btn btn-ghost btn-md">
                  {w.related.label} →
                </Link>
              )}
              {next && next.slug !== w.slug && (
                <Link
                  href={`/writings/${next.slug}`}
                  className="btn btn-primary btn-md"
                >
                  Next: {next.title} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
