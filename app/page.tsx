import Link from "next/link";
import { Eyebrow, Rule, Stat } from "@/components/brand";
import { RetreatInterest } from "@/components/RetreatInterest";
import { services, site } from "@/lib/site";
import { testimonials, stats } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative overflow-hidden px-6 text-center"
        style={{ padding: "clamp(84px,13vh,160px) 24px clamp(56px,8vh,104px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-10%] w-[min(820px,130%)] -translate-x-1/2 select-none opacity-[0.05]"
        />
        <div className="relative mx-auto flex max-w-[880px] animate-fade-up flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mandala.png" alt="" width={104} height={104} className="mb-7" />
          <Eyebrow align="center">Massage Therapy · Burlington, VT</Eyebrow>
          <h1
            className="mt-5 font-serif text-ink-900"
            style={{ fontSize: "clamp(44px,7.4vw,84px)", lineHeight: 1.02 }}
          >
            Awake <em className="text-copper-800">in</em> the Body
          </h1>
          <p className="lead mt-6 max-w-[42ch]">
            Intuitive massage with Mackensie Satya Priya. Three decades of
            skilled bodywork that meets physical tension, and the deeper roots
            beneath it.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Link href="/book" className="btn btn-primary btn-lg">
              Book a Session
            </Link>
          </div>
          <div className="mt-[54px] w-[min(420px,80%)]">
            <Rule ornament="dot" />
          </div>
        </div>
      </section>

      {/* ── The work ─────────────────────────────────────────────────────── */}
      <section className="px-6 pb-[clamp(56px,8vw,96px)]">
        <div className="mx-auto grid max-w-container items-center gap-[clamp(36px,5vw,72px)] md:grid-cols-2">
          <div className="overflow-hidden rounded-lg shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/hands-oil.jpg"
              alt="Intuitive bodywork"
              className="block w-full object-cover"
              style={{ height: "clamp(320px,44vw,500px)" }}
            />
          </div>
          <div>
            <Eyebrow bracketed>Hands that listen</Eyebrow>
            <h2
              className="mt-4 font-serif text-ink-900"
              style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
            >
              Experienced bodywork, intuitive insight
            </h2>
            <div className="mt-5 space-y-4 font-sans text-[16px] leading-[1.75] text-ink-500">
              <p>
                Specializing with women, Mackensie brings a skilled
                understanding of anatomy to every session, drawing on
                craniosacral therapy, polarity therapy, and Temple Lomi.
              </p>
              <p>
                Sessions address physical tension and pain, yet often lead to
                insight around deeper emotional root causes. Nothing is rushed.
                Each hour meets you exactly where you are that day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sessions ─────────────────────────────────────────────────────── */}
      <section id="sessions" className="ie-section bg-sand px-6">
        <div className="mx-auto max-w-container text-center">
          <Eyebrow align="center">Sessions &amp; Rates</Eyebrow>
          <h2
            className="mt-3 font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.08 }}
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
            Additional slots often available. Text or call{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
            . Sessions held at {site.address}.
          </p>
        </div>
      </section>

      {/* ── About teaser + stats ─────────────────────────────────────────── */}
      <section className="ie-section px-6">
        <div className="mx-auto max-w-container">
          <div className="mx-auto max-w-[720px] text-center">
            <Eyebrow align="center">Healer · Teacher · Guide</Eyebrow>
            <h2
              className="mt-3 font-serif text-ink-900"
              style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
            >
              Nearly three decades of devoted practice
            </h2>
            <p className="mt-5 font-sans text-[16px] leading-[1.75] text-ink-500">
              Some practitioners accumulate credentials. Others accumulate
              wisdom. A rare few are devoted enough to gather both, and to live
              what they teach.
            </p>
            <Link href="/about" className="btn btn-secondary btn-md mt-8">
              Meet Mackensie
            </Link>
          </div>
          <div className="mt-[clamp(44px,6vw,72px)]">
            <Rule ornament="mandala" />
            <div className="mt-[clamp(36px,5vw,56px)] grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Retreats ─────────────────────────────────────────────────────── */}
      <section id="retreats" className="ie-section bg-sand px-6">
        <div className="mx-auto max-w-container text-center">
          <Eyebrow align="center">Retreats</Eyebrow>
          <h2
            className="mt-3 font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.08 }}
          >
            Gatherings &amp; immersions
          </h2>
          <p className="lead mx-auto mt-4 max-w-[44ch]">
            There are no retreats currently scheduled.
          </p>
          <p className="mx-auto mt-3 max-w-[50ch] font-sans text-[15px] leading-[1.7] text-ink-500">
            Leave your name and email to be among the first to hear about future
            retreats, women&apos;s circles, and immersions.
          </p>
          <RetreatInterest />
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="ie-section relative overflow-hidden bg-indigo-700 px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-24%] right-[-8%] w-[440px] opacity-[0.06]"
          style={{ filter: "brightness(0) invert(1)" }}
        />
        <div className="relative mx-auto max-w-container">
          <Eyebrow align="center" paper>
            In Their Words
          </Eyebrow>
          <div className="mt-[clamp(32px,5vw,56px)] grid gap-10 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.author} className="text-center md:text-left">
                <div
                  className="font-serif text-copper-500"
                  style={{ fontSize: "56px", lineHeight: 0.6, height: "30px" }}
                  aria-hidden="true"
                >
                  &ldquo;
                </div>
                <blockquote className="font-serif text-[18px] italic leading-[1.55] text-paper-2">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-copper-500">
                  {t.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
