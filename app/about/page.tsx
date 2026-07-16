import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Rule, Stat } from "@/components/brand";
import { aboutPillars, lineageTeachers, stats } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mackensie Satya Priya — nearly three decades of devoted practice in yoga, bodywork, and the art of healing.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Healer · Teacher · Guide"
        title={
          <>
            Nearly three decades of{" "}
            <em className="text-copper-800">devoted practice</em>
          </>
        }
        lead="Some practitioners accumulate credentials. Others accumulate wisdom. A rare few are devoted enough to gather both — and to live what they teach."
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

      {/* Foundation */}
      <section className="ie-section bg-paper-2 px-6">
        <div className="mx-auto grid max-w-container items-center gap-[clamp(36px,5vw,80px)] md:grid-cols-2">
          <div>
            <Eyebrow bracketed>The Foundation</Eyebrow>
            <h2
              className="mt-4 font-serif text-ink-900"
              style={{ fontSize: "clamp(28px,3.8vw,44px)", lineHeight: 1.1 }}
            >
              Two parallel rivers
            </h2>
            <div className="mt-5 space-y-4 font-sans text-[16px] leading-[1.75] text-ink-500">
              <p>
                For nearly thirty years, two parallel rivers have shaped this
                work: the precision and inspiration of yoga — Hatha, Kripalu,
                Anusara, Ashtanga — and the intimate intelligence of touch:
                massage therapy, polarity therapy, craniosacral therapy, Temple
                Lomi. Each tradition absorbed not as a technique, but as a
                language of the body&apos;s deeper intelligence.
              </p>
              <p>
                Seven-to-ten-day silent meditation retreats, year after year,
                weren&apos;t spiritual tourism. They were a practitioner&apos;s
                commitment to sanity — to understanding, with clarity, who we
                really are beneath the noise.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/hands-oil.jpg"
              alt="The intimate intelligence of touch"
              className="block w-full object-cover"
              style={{ height: "clamp(300px,40vw,460px)" }}
            />
          </div>
        </div>
      </section>

      {/* Four pillars */}
      <section className="ie-section px-6">
        <div className="mx-auto max-w-container">
          <div className="text-center">
            <Eyebrow align="center">The Work</Eyebrow>
            <h2
              className="mt-3 font-serif text-ink-900"
              style={{ fontSize: "clamp(28px,3.8vw,44px)", lineHeight: 1.1 }}
            >
              Four threads, one weave
            </h2>
          </div>
          <div className="mt-[clamp(32px,5vw,56px)] grid gap-6 sm:grid-cols-2">
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
                <h3 className="mt-4 font-serif text-[24px] text-ink-900">
                  {p.title}
                </h3>
                <p className="mt-2 font-sans text-[15px] leading-[1.7] text-ink-500">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lineage + wider path — indigo */}
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
          <div className="mx-auto mt-6 flex max-w-[720px] flex-wrap justify-center gap-x-5 gap-y-2.5">
            {lineageTeachers.map((t, i) => (
              <span key={t} className="inline-flex items-center gap-5">
                <span className="font-serif text-[18px] text-white/80">{t}</span>
                {i < lineageTeachers.length - 1 && (
                  <span className="text-copper-500">·</span>
                )}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-[clamp(40px,6vw,64px)] max-w-[620px]">
            <Eyebrow align="center" paper>
              The Wider Path
            </Eyebrow>
            <p className="mt-5 font-serif text-[19px] italic leading-[1.65] text-white/85">
              Ayurveda and holistic health. Women&apos;s Qi Gong with Daisy
              Lee. Seven years with Sufi guides in Hawai&apos;i, immersed in
              the joyful practices of the Ruhaniat order — finding a connection
              that ran beneath doctrine, into something more essential.
              Spiritual pilgrimages in Hawaii and on the mainland. Not as
              escape — as return.
            </p>
          </div>
        </div>
      </section>

      {/* Closing quote + CTA */}
      <section className="px-6 py-[clamp(64px,9vw,110px)] text-center">
        <div className="mx-auto max-w-[760px]">
          <div
            className="font-serif text-copper-300"
            style={{ fontSize: "72px", lineHeight: 0.6, height: "38px" }}
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <blockquote
            className="font-serif italic text-ink-900"
            style={{ fontSize: "clamp(22px,2.8vw,30px)", lineHeight: 1.45 }}
          >
            Today, the deepest work is helping women get to the root cause of
            illness — exploring where emotion, energy, and physicality
            intersect. Not managing symptoms. Uncovering patterns. Reclaiming
            vitality from the inside out.
          </blockquote>
          <p className="mt-5 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-copper-800">
            The work this life has been preparing
          </p>

          <div className="mx-auto mt-[clamp(40px,6vw,64px)] max-w-[520px]">
            <Rule ornament="mandala" />
            <h2
              className="mt-8 font-serif text-ink-900"
              style={{ fontSize: "clamp(26px,3.4vw,38px)", lineHeight: 1.1 }}
            >
              Ready to begin your path?
            </h2>
            <p className="mt-4 font-sans text-[15px] leading-[1.7] text-ink-500">
              Whether you&apos;re navigating chronic imbalance, seeking deeper
              embodiment, or feeling a quiet pull toward transformation — this
              work is designed for you.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              <Link href="/book" className="btn btn-primary btn-lg">
                Book a Session
              </Link>
              <a href={`mailto:${site.email}`} className="btn btn-secondary btn-lg">
                Inquire
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
