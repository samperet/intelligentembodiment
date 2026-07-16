import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Rule } from "@/components/brand";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Massage",
  description:
    "Intuitive massage therapy with Mackensie Satya Priya in Burlington, VT, craniosacral, polarity, and Temple Lomi woven into sessions of 60 or 90 minutes.",
};

const threads = [
  {
    title: "Skilled Anatomy",
    body: "Sessions address physical tension and pain with a practiced understanding of the body's structure, three decades of hands-on work across craniosacral, polarity therapy, and Temple Lomi.",
  },
  {
    title: "Intuitive Insight",
    body: "Specializing with women, the work often reveals what lives beneath the tension, the deeper emotional root causes that ask to be heard before the body can truly soften.",
  },
  {
    title: "Sacred Pace",
    body: "Nothing is rushed. Each session meets you where you are that day, body, energy, and insight woven into one unhurried hour (or a spacious ninety minutes).",
  },
];

export default function MassagePage() {
  return (
    <>
      <PageHero
        eyebrow="Offering 01 · Bodywork"
        title={
          <>
            Hands that <em className="text-copper-800">listen</em>
          </>
        }
        lead="Experienced bodywork with intuitive insights, addressing physical tension while often revealing the deeper roots beneath it."
      />

      {/* Photo + threads */}
      <section className="px-6 pb-[clamp(56px,8vw,96px)]">
        <div className="mx-auto grid max-w-container items-center gap-[clamp(36px,5vw,72px)] md:grid-cols-2">
          <div className="overflow-hidden rounded-lg shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/hands-oil.jpg"
              alt="Warm-oil bodywork"
              className="block w-full object-cover"
              style={{ height: "clamp(320px,44vw,500px)" }}
            />
          </div>
          <div className="space-y-8">
            {threads.map((t) => (
              <div key={t.title}>
                <h3 className="font-serif text-[24px] text-ink-900">{t.title}</h3>
                <p className="mt-2 font-sans text-[15px] leading-[1.7] text-ink-500">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="ie-section bg-sand px-6">
        <div className="mx-auto max-w-container text-center">
          <Eyebrow align="center">Sessions & Rates</Eyebrow>
          <h2
            className="mt-3 font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
          >
            Choose your time on the table
          </h2>
          <div className="mx-auto mt-[clamp(32px,4vw,48px)] grid max-w-3xl gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex flex-col rounded-xl border border-[color:var(--border)] bg-paper-2 p-8 text-left shadow-sm"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-[30px] text-ink-900">
                    {s.durationMinutes} minutes
                  </span>
                  <span className="font-serif text-[24px] italic text-copper-800">
                    ${s.price}
                  </span>
                </div>
                <p className="mt-3 flex-1 font-sans text-[15px] leading-[1.65] text-ink-500">
                  {s.blurb}
                </p>
                <Link
                  href={`/book?service=${s.id}`}
                  className="btn btn-primary btn-md mt-6 self-start"
                >
                  Book {s.durationMinutes} min
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 font-sans text-[14px] text-ink-500">
            Additional slots often available, text or call{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
            . Sessions held at {site.address}.
          </p>
        </div>
      </section>

      {/* Abhyanga cross-link */}
      <section className="px-6 py-[clamp(48px,7vw,80px)]">
        <div className="mx-auto max-w-[720px] text-center">
          <Rule ornament="mandala" />
          <p className="mt-8 font-serif text-[20px] italic leading-[1.6] text-ink-500">
            Between sessions, keep the nervous system nourished with{" "}
            <Link href="/recipes/abhyanga" className="text-copper-800 underline">
              Abhyanga
            </Link>
            , the Ayurvedic warm-oil self-massage.
          </p>
        </div>
      </section>
    </>
  );
}
