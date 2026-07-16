import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { writings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writings",
  description:
    "Essays and poems by Mackensie Satya Priya, on embodiment, vulnerability, motherhood, and the path of the heart.",
};

export default function WritingsPage() {
  return (
    <>
      <PageHero
        eyebrow="The Blog"
        title={
          <>
            Writings <em className="text-copper-800">along the way</em>
          </>
        }
        lead="Essays and poems on embodiment, vulnerability, motherhood, and the path of the heart."
      />

      <section className="px-6 pb-[clamp(64px,9vw,110px)]">
        <div className="mx-auto max-w-[820px]">
          <div className="space-y-6">
            {writings.map((w) => (
              <Link
                key={w.slug}
                href={`/writings/${w.slug}`}
                className="group block rounded-xl border border-[color:var(--border)] bg-paper-2 p-8 transition hover:border-[color:var(--border-strong)] hover:shadow-md sm:p-10"
              >
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-ink-400">
                  {new Date(w.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {w.kind}
                </p>
                <h2 className="mt-3 font-serif text-[32px] leading-[1.1] text-ink-900 transition group-hover:text-copper-900">
                  {w.title}
                </h2>
                <p className="mt-3 max-w-[62ch] font-serif text-[18px] italic leading-[1.6] text-ink-500">
                  {w.excerpt}
                </p>
                <span className="mt-5 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-copper-800">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
