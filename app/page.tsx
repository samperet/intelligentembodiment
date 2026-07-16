import Link from "next/link";
import { Eyebrow, Rule, Stat } from "@/components/brand";
import { testimonials, writings, stats } from "@/lib/content";

const offerings = [
  {
    n: "01",
    title: "Massage",
    href: "/massage",
    lead: "Bodywork with intuitive insight",
    body: "Specializing with women, Mackensie brings three decades of experienced bodywork to the table — addressing physical tension and pain with a skilled understanding of anatomy, while often revealing the deeper emotional root causes beneath.",
    detail: "$120 / 60 min · $180 / 90 min",
    cta: "Book a session",
    tone: "copper" as const,
  },
  {
    n: "02",
    title: "Yoga",
    href: "/yoga",
    lead: "Breath-guided, poetry-inspired",
    body: "Full of the wisdom and technology of the Anusara principles — classes that are truly profound and powerful, a doorway into the depths of your own being. Practice with the free video library, or arrange private and group instruction.",
    detail: "Private & group instruction · free practice videos",
    cta: "Enter the practice",
    tone: "indigo" as const,
  },
  {
    n: "03",
    title: "Health Coaching",
    href: "/health-coaching",
    lead: "Root-cause wellness & Ayurveda",
    body: "Helping women get to the root cause of illness — exploring where emotion, energy, and physicality intersect. Not managing symptoms: uncovering patterns and reclaiming vitality from the inside out, with nourishment from the Ayurvedic kitchen.",
    detail: "Consultations · Ayurvedic recipes & rituals",
    cta: "Explore health coaching",
    tone: "sand" as const,
  },
];

const toneBg: Record<string, string> = {
  copper: "bg-copper-50",
  indigo: "bg-indigo-50",
  sand: "bg-sand",
};

export default function HomePage() {
  const featured = writings.slice(0, 2);
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative overflow-hidden px-6 text-center"
        style={{ padding: "clamp(84px,13vh,160px) 24px clamp(64px,9vh,120px)" }}
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
          <Eyebrow align="center">Intelligent Embodiment · Burlington, VT</Eyebrow>
          <h1
            className="mt-5 font-serif text-ink-900"
            style={{ fontSize: "clamp(44px,7.4vw,84px)", lineHeight: 1.02 }}
          >
            Awake <em className="text-copper-800">in</em> the Body
          </h1>
          <p className="lead mt-6 max-w-[40ch]">
            The body keeps its own intelligence. This work — massage, yoga, and
            root-cause health coaching — is simply to help you listen.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Link href="/book" className="btn btn-primary btn-lg">
              Book a Session
            </Link>
            <Link href="/#offerings" className="btn btn-secondary btn-lg">
              Explore the Work
            </Link>
          </div>
          <div className="mt-[54px] w-[min(420px,80%)]">
            <Rule ornament="dot" />
          </div>
        </div>
      </section>

      {/* ── Offerings — numbered editorial rows ──────────────────────────── */}
      <section id="offerings" className="px-6 pb-[clamp(64px,9vw,110px)]">
        <div className="mx-auto max-w-container">
          <div className="mb-[clamp(36px,5vw,56px)] text-center">
            <Eyebrow align="center">Three Ways In</Eyebrow>
            <h2
              className="mt-3 font-serif text-ink-900"
              style={{ fontSize: "clamp(32px,4.4vw,52px)", lineHeight: 1.08 }}
            >
              The offerings
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {offerings.map((o) => (
              <Link
                key={o.n}
                href={o.href}
                className={`group flex flex-col rounded-xl ${toneBg[o.tone]} p-8 transition hover:shadow-md sm:p-10`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-serif text-[15px] italic text-copper-800">
                    {o.n}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mandala.png"
                    alt=""
                    width={34}
                    height={34}
                    className="opacity-40 transition duration-500 group-hover:rotate-45 group-hover:opacity-70"
                  />
                </div>
                <h3 className="mt-6 font-serif text-[34px] leading-[1.05] text-ink-900">
                  {o.title}
                </h3>
                <p className="mt-2 font-serif text-[18px] italic text-copper-800">
                  {o.lead}
                </p>
                <p className="mt-4 flex-1 font-sans text-[15px] leading-[1.7] text-ink-500">
                  {o.body}
                </p>
                <p className="mt-5 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-ink-400">
                  {o.detail}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-copper-800 transition group-hover:gap-3">
                  {o.cta} <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── About teaser + stats ─────────────────────────────────────────── */}
      <section className="ie-section bg-paper-2 px-6">
        <div className="mx-auto grid max-w-container items-center gap-[clamp(40px,6vw,88px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="overflow-hidden rounded-lg shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/hands-oil.jpg"
              alt="Intuitive bodywork"
              className="block w-full object-cover"
              style={{ height: "clamp(320px,42vw,480px)" }}
            />
          </div>
          <div>
            <Eyebrow bracketed>Healer · Teacher · Guide</Eyebrow>
            <h2
              className="mt-4 font-serif text-ink-900"
              style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
            >
              Nearly three decades of devoted practice
            </h2>
            <p className="mt-5 font-sans text-[16px] leading-[1.75] text-ink-500">
              Some practitioners accumulate credentials. Others accumulate
              wisdom. A rare few are devoted enough to gather both — and to
              live what they teach. Mackensie Satya Priya has woven thirty
              years of yoga, sacred touch, and intuitive insight into work that
              meets every layer of the human experience.
            </p>
            <Link href="/about" className="btn btn-secondary btn-md mt-8">
              Meet Mackensie
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-[clamp(48px,7vw,80px)] max-w-container">
          <Rule ornament="mandala" />
          <div className="mt-[clamp(36px,5vw,56px)] grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials — indigo band ───────────────────────────────────── */}
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

      {/* ── Writings teaser ──────────────────────────────────────────────── */}
      <section className="ie-section px-6">
        <div className="mx-auto max-w-container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>From the Writings</Eyebrow>
              <h2
                className="mt-3 font-serif text-ink-900"
                style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
              >
                Words along the way
              </h2>
            </div>
            <Link href="/writings" className="btn btn-ghost btn-md">
              All writings →
            </Link>
          </div>
          <div className="mt-[clamp(32px,4vw,48px)] grid gap-6 md:grid-cols-2">
            {featured.map((w) => (
              <Link
                key={w.slug}
                href={`/writings/${w.slug}`}
                className="group rounded-xl border border-[color:var(--border)] bg-paper-2 p-8 transition hover:border-[color:var(--border-strong)] hover:shadow-md sm:p-10"
              >
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-ink-400">
                  {new Date(w.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {w.kind}
                </p>
                <h3 className="mt-3 font-serif text-[28px] leading-[1.15] text-ink-900 transition group-hover:text-copper-900">
                  {w.title}
                </h3>
                <p className="mt-3 font-serif text-[17px] italic leading-[1.6] text-ink-500">
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
