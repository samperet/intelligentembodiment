import Link from "next/link";
import {
  Eyebrow,
  SectionHeading,
  Stat,
  Rule,
  OfferingCard,
  type Offering,
} from "@/components/brand";

const stats = [
  { value: "28", label: "Years Teaching Yoga" },
  { value: "30", label: "Years of Bodywork" },
  { value: "5", label: "Teacher Trainings" },
  { value: "7", label: "Vipassana Retreats" },
];

const offerings: Offering[] = [
  {
    eyebrow: "Bodywork",
    title: "Massage Therapy",
    price: "$120 / 60 min",
    note: "$180 / 90 min",
    description:
      "Specializing with women, Mackensie brings experienced bodywork with intuitive insights — addressing physical tension while often revealing deeper emotional root causes.",
    tone: "copper",
    cta: "Book a Session",
    href: "/book",
  },
  {
    eyebrow: "Energy & Insight",
    title: "Intuitive Consultation",
    price: "By session",
    note: "text or call to arrange",
    description:
      "Medical-intuitive sessions to address the full spectrum of your health and well-being, drawn from thirty years of somatic and energetic practice.",
    tone: "indigo",
    cta: "Enquire",
    href: "/#contact",
  },
  {
    eyebrow: "Practice",
    title: "Yoga & Qi Gong",
    price: "Private & group",
    note: "instruction",
    description:
      "Embodied instruction in the Anusara lineage and Qi Gong — grounded in anatomy, opened toward the subtle body.",
    tone: "sand",
    cta: "Enquire",
    href: "/#contact",
  },
];

const teachers = [
  "Richard Freeman", "John Friend", "Darren Rhodes", "Noah Maze",
  "Neesha Zollinger", "Marc St. Pierre", "Myra Lewin", "Skeeter Tichnor",
  "Caroline Myss", "Daisy Lee", "Christian Pankhurst", "Skylar Acemesis",
  "Sufi Ruhaniat Order",
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative overflow-hidden px-6 text-center"
        style={{ padding: "clamp(80px,12vh,150px) 24px clamp(60px,8vh,110px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-8%] w-[min(760px,120%)] -translate-x-1/2 select-none opacity-[0.05]"
        />
        <div className="relative mx-auto flex max-w-[860px] animate-fade-up flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mandala.png"
            alt="Intelligent Embodiment"
            width={116}
            height={116}
            className="mb-[30px]"
          />
          <Eyebrow align="center">Awake in the Body</Eyebrow>
          <h1
            className="mt-[18px] font-serif text-ink-900"
            style={{ fontSize: "clamp(46px,8vw,88px)", lineHeight: 0.98 }}
          >
            Intelligent
            <br />
            Embodiment
          </h1>
          <p className="lead mt-[22px] max-w-[34ch]">
            Three decades of devoted practice — bodywork, yoga, and intuitive
            insight, with Mackensie Satya&nbsp;Priya.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Link href="/book" className="btn btn-primary btn-lg">
              Book a Session
            </Link>
            <Link href="/#offerings" className="btn btn-secondary btn-lg">
              Explore Offerings
            </Link>
          </div>
          <div className="mt-[54px] w-[min(420px,80%)]">
            <Rule ornament="dot" />
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="ie-section px-6">
        <div className="mx-auto grid max-w-container items-center gap-[clamp(40px,6vw,88px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <SectionHeading
              eyebrow="About Mackensie Satya Priya"
              bracketed
              title="Three decades of devoted practice"
            />
            <div className="ie-prose mt-[26px] space-y-4 font-sans text-[16px] leading-[1.75] text-ink-500">
              <p>
                Mackensie has woven thirty years of deep spiritual practice into
                an offering that addresses multiple layers of the human
                experience. Her early studies in Craniosacral, Polarity therapy
                and Temple Lomi built a foundation of somatic and energetic
                principles.
              </p>
              <p>
                Her years as an advanced Anusara yoga teacher honed an embodied
                understanding of the body&apos;s physical and mechanical
                aspects. Seeking to address her own pain, her practice evolved
                toward Qi Gong and, eventually, the intuitive insights she now
                channels into deeper wisdom — helping clients reach the root
                causes of their own pain and suffering.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/hands-oil.jpg"
              alt="Intuitive bodywork"
              className="block w-full object-cover"
              style={{ height: "clamp(340px,46vw,520px)" }}
            />
          </div>
        </div>

        <div className="mx-auto mt-[clamp(48px,7vw,88px)] max-w-container">
          <Rule ornament="mandala" />
          <div className="mt-[clamp(40px,6vw,64px)] grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Offerings ────────────────────────────────────────────────────── */}
      <section id="offerings" className="ie-section bg-sand px-6">
        <div className="mx-auto max-w-container">
          <SectionHeading
            align="center"
            eyebrow="Awake in the Body"
            title="Ways to work together"
            lead="Every session meets you where you are — body, energy, and insight woven into one."
          />
          <div className="mt-[clamp(40px,6vw,64px)] grid gap-6 md:grid-cols-3">
            {offerings.map((o) => (
              <OfferingCard key={o.title} o={o} />
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {[
              "Health & Nutrition Consultations",
              "Women's Group / Heart Circle",
              "Yoga & Qi Gong Instruction",
            ].map((b) => (
              <span
                key={b}
                className="rounded-full border border-[color:var(--border)] bg-paper-2 px-4 py-2 font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-ink-500"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lineage ──────────────────────────────────────────────────────── */}
      <section
        id="lineage"
        className="ie-section relative overflow-hidden bg-indigo-700 px-6"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-20%] right-[-6%] w-[460px] opacity-[0.06]"
          style={{ filter: "brightness(0) invert(1)" }}
        />
        <div className="relative mx-auto max-w-[900px] text-center">
          <figure className="mx-auto max-w-[60ch]">
            <div
              className="font-serif text-copper-500"
              style={{ fontSize: "64px", lineHeight: 0.6, height: "34px" }}
              aria-hidden="true"
            >
              &ldquo;
            </div>
            <blockquote
              className="font-serif italic text-paper-2"
              style={{ fontSize: "clamp(21px,2.4vw,28px)", lineHeight: 1.45 }}
            >
              The body keeps its own intelligence. My work is simply to help you
              listen.
            </blockquote>
            <figcaption className="mt-5">
              <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-copper-500">
                Mackensie Satya Priya
              </div>
              <div className="mt-[5px] font-sans text-[13px] text-white/60">
                Intelligent Embodiment · Burlington, VT
              </div>
            </figcaption>
          </figure>

          <div className="mt-[clamp(48px,7vw,80px)]">
            <Eyebrow align="center" paper>
              Lineage Teachings
            </Eyebrow>
            <div className="mx-auto mt-[22px] flex max-w-[720px] flex-wrap justify-center gap-x-5 gap-y-2.5">
              {teachers.map((t, i) => (
                <span key={t} className="inline-flex items-center gap-5">
                  <span className="font-serif text-[18px] text-white/80">
                    {t}
                  </span>
                  {i < teachers.length - 1 && (
                    <span className="text-copper-500">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
