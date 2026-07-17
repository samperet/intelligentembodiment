import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Stat } from "@/components/brand";
import { RetreatInterest } from "@/components/RetreatInterest";
import { aboutPillars, lineageTeachers, getStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mackensie Satya Priya, three decades of devoted practice in yoga, bodywork, and the art of healing.",
};

// Regenerate at most daily so the auto-calculated year figures stay current.
export const revalidate = 86400;

// Candid photos surfaced only when the file is actually present in
// public/imagery, so a missing file never renders a broken box.
const galleryCandidates: { file: string; alt: string; caption: string }[] = [
  {
    file: "mackensie-grass.jpg",
    alt: "Portrait of Mackensie Satya Priya Grant resting in the grass",
    caption: "Mackensie",
  },
  {
    file: "yoga-class.jpg",
    alt: "Mackensie teaching a yoga class, guiding a student through a pose",
    caption: "In the teaching seat",
  },
  {
    file: "family.jpg",
    alt: "Mackensie with her family on a summer evening in Vermont",
    caption: "Life in Vermont",
  },
];
const gallery = galleryCandidates.filter((p) =>
  fs.existsSync(path.join(process.cwd(), "public", "imagery", p.file)),
);
const galleryCols =
  gallery.length >= 3
    ? "sm:grid-cols-3"
    : gallery.length === 2
      ? "sm:grid-cols-2"
      : "mx-auto max-w-[760px]";

// Featured wide photo (a retreat river crossing).
const RIVER = "/imagery/DSC01452.jpg";
const river = fs.existsSync(path.join(process.cwd(), "public", RIVER))
  ? RIVER
  : null;

export default function AboutPage() {
  const stats = getStats();
  return (
    <>
      <PageHero
        eyebrow="Healer · Teacher · Guide"
        title={
          <>
            Three decades of{" "}
            <em className="text-copper-800">devoted practice</em>
          </>
        }
      />

      {/* Stats */}
      <section className="px-6 pb-[clamp(48px,7vw,80px)]">
        <div className="mx-auto max-w-container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured photo */}
      {river && (
        <section className="px-6 pb-[clamp(48px,7vw,80px)]">
          <div className="mx-auto max-w-[1040px]">
            <figure className="overflow-hidden rounded-2xl shadow-md ring-1 ring-[color:var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={river}
                alt="Mackensie leading a river crossing on retreat"
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>
          </div>
        </section>
      )}

      {/* Her path — narrative bio */}
      <section className="px-6 pb-[clamp(48px,7vw,80px)]">
        <div className="mx-auto max-w-[760px]">
          <Eyebrow align="center">My Path</Eyebrow>
          <div className="mt-6 space-y-5 font-sans text-[19px] leading-[1.8] text-ink-700">
            <p>
              Integrating credentials with lived wisdom, Mackensie has woven
              thirty years of deep spiritual practice into an offering that
              addresses multiple layers of the human experience. Her early
              studies included Craniosacral, Polarity therapy and Temple Lomi,
              building a foundation of somatic and energetic principles. Her
              many years as an advanced Anusara yoga teacher honed her embodied
              understanding of the physical and mechanical aspects of the body.
            </p>
            <p>
              Looking for ways to address her own pain, her practice evolved
              towards Qi Gong, where she could focus on more subtle aspects of
              the energetic body. This eventually paved the way for her
              introduction to Skylar Acamesis, Medical Intuitive, where she
              learned tools and techniques to channel the intuitive insights
              that were always present across her patient interactions into
              deeper wisdom and clarity that often help her clients address the
              actual root causes of their own pain and suffering.
            </p>
          </div>
        </div>
      </section>

      {/* Four pillars */}
      <section className="ie-section px-6">
        <div className="mx-auto max-w-container">
          <h2
            className="mb-[clamp(28px,4vw,48px)] text-center font-serif text-ink-900"
            style={{ fontSize: "clamp(28px,3.8vw,44px)", lineHeight: 1.1 }}
          >
            Teacher, Facilitator, Intuitive
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {aboutPillars.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-[color:var(--border)] bg-paper-2 p-8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mandala.png"
                  alt=""
                  width={30}
                  height={30}
                  className="opacity-50"
                />
                <h3 className="mt-4 font-serif text-[26px] text-ink-900">
                  {p.title}
                </h3>
                <p className="mt-2 font-sans text-[17px] leading-[1.7] text-ink-500">
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* Candid photos */}
          {gallery.length > 0 && (
            <div className={`mt-[clamp(36px,5vw,56px)] grid gap-5 ${galleryCols}`}>
              {gallery.map((p) => (
                <figure key={p.file} className="group">
                  <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-[color:var(--border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/imagery/${p.file}`}
                      alt={p.alt}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
                    />
                  </div>
                  <figcaption className="mt-3 text-center font-sans text-[13px] font-medium uppercase tracking-[0.16em] text-ink-500">
                    {p.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lineage + wider path, indigo */}
      <section className="ie-section relative overflow-hidden bg-indigo-700 px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-22%] right-[-7%] w-[440px] opacity-[0.06]"
          style={{ filter: "brightness(0) invert(1)" }}
        />
        <div className="relative mx-auto max-w-[900px] text-center">
          <Eyebrow align="center" paper>
            Lineage & Teachers
          </Eyebrow>
          <div className="mx-auto mt-6 flex max-w-[760px] flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
            {lineageTeachers.map((t, i) => (
              <span key={t.name} className="inline-flex items-center gap-5">
                {t.url ? (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-serif text-[22px] text-white/90 no-underline hover:text-white/90"
                  >
                    {t.name}
                  </a>
                ) : (
                  <span className="font-serif text-[22px] text-white/90">
                    {t.name}
                  </span>
                )}
                {i < lineageTeachers.length - 1 && (
                  <span className="text-copper-500">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter signup (moved from home) */}
      <section id="newsletter" className="ie-section bg-sand px-6">
        <div className="mx-auto max-w-container text-center">
          <Eyebrow align="center">Stay in Touch</Eyebrow>
          <h2
            className="mt-3 font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.08 }}
          >
            Retreats &amp; gatherings
          </h2>
          <p className="lead mx-auto mt-4 max-w-[46ch]">
            Hear about retreats, events, women&apos;s circles, and immersions.
          </p>
          <RetreatInterest />
          <div className="mt-8">
            <Link href="/retreats" className="btn btn-secondary btn-md">
              See previous retreats
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
