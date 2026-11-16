import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookingWidget } from "@/components/BookingWidget";
import { ConsultStickyCta } from "@/components/ConsultStickyCta";
import { getService, site } from "@/lib/site";
import { getStats, testimonials } from "@/lib/content";

// A focused landing page for people new to Mackensie and to medical
// intuition (ads, social posts, referrals): what it is, who it's for, how
// the consult works, and booking, without the rest of the site's navigation.

export const metadata: Metadata = {
  title: { absolute: "Medical Intuition Consult · Intelligent Embodiment" },
  description:
    "A one-hour phone consult with Mackensie Satya Priya: thirty years of bodywork and formal training in medical intuition. $75, with a money-back guarantee.",
  alternates: { canonical: "/consult" },
  openGraph: {
    title: "Medical Intuition Consult with Mackensie Satya Priya",
    description:
      "Find the story beneath your symptoms. A one-hour phone consult, $75, with a money-back guarantee.",
    url: "/consult",
  },
};

const forYou = [
  "You live with pain, fatigue, or symptoms that keep returning, and you're looking for a deeper understanding of why.",
  "You sense that a stressful or emotional chapter of your life is tied up in what your body is feeling.",
  "You want to understand what your body may be asking for, not only quiet the symptom.",
  "You'd like a calm, attentive hour to be truly heard about your health.",
  "You're curious, maybe a little skeptical, and would rather experience it than read about it.",
];

const steps = [
  {
    title: "Book a time",
    body: "Choose a time below. You'll receive a confirmation and a calendar invitation. All you need is a quiet place to talk by phone.",
  },
  {
    title: "A guided conversation",
    body: "You talk, she listens, with more than her ears. Guided by intuition, Mackensie asks questions and reflects the patterns she perceives: physical, emotional, and energetic.",
  },
  {
    title: "Clear next steps",
    body: "You leave with a clearer picture of what your body may be asking for, and practical next steps: bodywork, practices, or questions worth bringing to your doctor.",
  },
];

export default function ConsultLandingPage() {
  const consult = getService("phone-consultation")!;
  const years = Object.fromEntries(getStats().map((s) => [s.label, s.value]));
  const bodyworkYears = years["Years of Bodywork"];
  const yogaYears = years["Years Teaching Yoga"];
  const words = testimonials.find((t) => t.author === "Ally G.") ?? testimonials[0];

  const faqs = [
    {
      q: "Is this a replacement for my doctor?",
      a: "No. Medical intuition complements medical care; it doesn't diagnose, prescribe, or treat. Many clients bring what they discover in a consult to their physicians as better questions.",
    },
    {
      q: "What if I'm skeptical?",
      a: "Healthy skepticism is welcome. That's why the consult carries a money-back guarantee: if it doesn't serve you, you don't pay. Judge it by your own experience.",
    },
    {
      q: "How can this work over the phone?",
      a: "Medical intuition doesn't rely on touch. Mackensie works through conversation and intuitive perception, so the consult is by phone, wherever you are. Times are shown in Eastern time.",
    },
    {
      q: "Do I need to prepare anything?",
      a: "No. A quiet, private place to talk is all you need. Some people like to jot down what's been on their mind about their health beforehand.",
    },
    {
      q: "What does it cost?",
      a: `The one-hour initial consult is $${consult.price}, with a money-back guarantee. If you'd like to continue afterward, follow-up calls are $${site.followUpCallRate} per hour, scheduled whenever you wish, with no obligation. ${site.cancellationPolicy}`,
    },
    {
      q: "Who is Mackensie?",
      a: `Mackensie Satya Priya has ${bodyworkYears} years of professional bodywork (craniosacral, polarity, Temple Lomi), ${yogaYears} years of teaching yoga, and formal training in medical intuition with Skylar Acamesis.`,
    },
  ];

  return (
    <>
      {/* ── Slim header: one way home, one way to book ─────────────────── */}
      <header className="border-b border-[color:var(--border)] bg-paper px-5 py-3.5">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mandala.png" alt="" width={40} height={40} />
            <span className="font-serif uppercase leading-[1.05] tracking-[0.14em] text-indigo-700 text-[17px] sm:text-[19px]">
              Intelligent
              <br />
              Embodiment
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <a
              href={site.phoneHref}
              className="hidden font-sans text-[17px] text-ink-700 transition hover:text-copper-800 sm:inline"
            >
              {site.phone}
            </a>
            <a href="#book" className="btn btn-primary btn-sm">
              Book
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-900 px-6 py-[clamp(56px,9vw,112px)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 w-[520px] select-none opacity-[0.07]"
          style={{ filter: "brightness(0) invert(1)" }}
        />
        <div className="relative mx-auto grid max-w-container items-center gap-[clamp(36px,6vw,72px)] md:grid-cols-[1.25fr_1fr]">
          <div className="text-center md:text-left">
            <span className="block font-sans text-[15px] font-medium uppercase tracking-[0.26em] text-copper-300">
              Medical Intuition · Initial Consult
            </span>
            <h1
              className="mt-4 font-serif text-white"
              style={{ fontSize: "clamp(40px,5.6vw,68px)", lineHeight: 1.04 }}
            >
              Find the story beneath{" "}
              <em className="text-copper-300">your symptoms</em>
            </h1>
            <p className="mx-auto mt-6 max-w-[40ch] font-sans text-[21px] leading-[1.65] text-indigo-100 md:mx-0">
              A one-hour phone consult with Mackensie Satya Priya, who brings{" "}
              {bodyworkYears} years of hands-on bodywork and formal training in
              medical intuition. Gentle, practical, and alongside your medical
              care, never instead of it.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row md:justify-start sm:justify-center">
              <a
                href="#book"
                className="btn btn-lg bg-paper-2 text-indigo-800 shadow-md hover:bg-white"
              >
                Book your consult · ${consult.price}
              </a>
              <a
                href="#how"
                className="font-sans text-[18px] text-indigo-100 underline underline-offset-4 transition hover:text-white"
              >
                How it works
              </a>
            </div>
            <ul className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-2 font-sans text-[17px] text-indigo-100 md:justify-start">
              <li>✓ 60 minutes, by phone</li>
              <li>✓ Money-back guarantee</li>
              <li>✓ {bodyworkYears} years of bodywork</li>
            </ul>
          </div>
          <div className="relative mx-auto w-[240px] sm:w-[300px] md:w-full md:max-w-[380px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 -right-3 h-full w-full rounded-[20px] border border-copper-300/50"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/mackensie-portrait.jpg"
              alt="Mackensie Satya Priya"
              width={380}
              height={475}
              className="relative aspect-[4/5] w-full rounded-[20px] object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ── Is this for you? ─────────────────────────────────────────────── */}
      <section className="px-6 py-[clamp(52px,8vw,96px)]">
        <div className="mx-auto max-w-[760px]">
          <span className="eyebrow block text-center">Is this for you?</span>
          <h2
            className="mt-3 text-center font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
          >
            People often come to medical intuition when&hellip;
          </h2>
          <ul className="mt-9 space-y-4">
            {forYou.map((item) => (
              <li
                key={item}
                className="flex gap-4 rounded-xl border border-[color:var(--border)] bg-paper-2 px-5 py-4 font-sans text-[19px] leading-[1.65] text-ink-700"
              >
                <span aria-hidden="true" className="mt-[3px] h-[18px] w-[18px] flex-none rotate-45 rounded-[3px] bg-copper-300" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center font-serif text-[23px] italic leading-[1.5] text-ink-500">
            If any of these sound familiar, an initial consult is a gentle,
            low-risk place to start.
          </p>
        </div>
      </section>

      {/* ── What it is, and isn't ────────────────────────────────────────── */}
      <section className="bg-sand px-6 py-[clamp(52px,8vw,96px)]">
        <div className="mx-auto max-w-[1000px]">
          <span className="eyebrow block text-center">Plain answers</span>
          <h2
            className="mt-3 text-center font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
          >
            What is medical intuition?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-paper-2 p-8 shadow-sm">
              <h3 className="font-serif text-[27px] text-ink-900">What it is</h3>
              <p className="mt-3 font-sans text-[19px] leading-[1.75] text-ink-600">
                A trained practice of perceiving patterns in the body,
                physical, emotional, and energetic, that may sit beneath
                chronic pain, fatigue, and illness. It asks a different
                question: <em>why is this happening, and what is it connected
                to?</em>
              </p>
            </div>
            <div className="rounded-2xl bg-paper-2 p-8 shadow-sm">
              <h3 className="font-serif text-[27px] text-ink-900">What it isn&apos;t</h3>
              <p className="mt-3 font-sans text-[19px] leading-[1.75] text-ink-600">
                It isn&apos;t a diagnosis, and it doesn&apos;t replace your
                doctor. Mackensie doesn&apos;t prescribe or treat. Many clients
                bring what they discover to their physicians as better
                questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How the consult works ────────────────────────────────────────── */}
      <section id="how" className="scroll-mt-4 px-6 py-[clamp(52px,8vw,96px)]">
        <div className="mx-auto max-w-container">
          <span className="eyebrow block text-center">How it works</span>
          <h2
            className="mt-3 text-center font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
          >
            One hour, by phone
          </h2>
          <ol className="mx-auto mt-10 grid max-w-[1020px] gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-xl border border-[color:var(--border)] bg-paper-2 p-7 text-center"
              >
                <span className="font-serif text-[32px] italic text-copper-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-serif text-[25px] text-ink-900">{s.title}</h3>
                <p className="mt-2 font-sans text-[18px] leading-[1.7] text-ink-500">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Meet Mackensie ───────────────────────────────────────────────── */}
      <section className="bg-paper-2 px-6 py-[clamp(52px,8vw,96px)]">
        <div className="mx-auto grid max-w-[960px] items-center gap-[clamp(32px,5vw,64px)] md:grid-cols-[minmax(0,320px)_1fr]">
          <div className="relative mx-auto w-[240px] md:w-full">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 -right-3 h-full w-full rounded-[16px] border border-copper-300"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/mackensie-harmonium.jpg"
              alt="Mackensie Satya Priya"
              loading="lazy"
              className="relative aspect-[4/5] w-full rounded-[16px] object-cover shadow-md"
            />
          </div>
          <div>
            <span className="eyebrow block text-center md:text-left">Meet Mackensie</span>
            <h2
              className="mt-3 text-center font-serif text-ink-900 md:text-left"
              style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.1 }}
            >
              Thirty years of listening to bodies
            </h2>
            <p className="mt-5 font-sans text-[19px] leading-[1.75] text-ink-600">
              For three decades, Mackensie&apos;s hands-on work kept revealing
              the same thing: the story beneath the symptom, the grief held in
              a shoulder, the old fear living in a gut. Clients kept asking how
              she knew. Formal training in medical intuition with Skylar
              Acamesis gave that perception structure, language, and
              discipline.
            </p>
            <ul className="mt-6 space-y-2.5 font-sans text-[18px] text-ink-700">
              <li>✓ {bodyworkYears} years of professional bodywork: craniosacral, polarity, Temple Lomi</li>
              <li>✓ {yogaYears} years teaching yoga, with five teacher trainings</li>
              <li>✓ Trained in medical intuition with Skylar Acamesis</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── In clients' words ────────────────────────────────────────────── */}
      <section className="px-6 py-[clamp(52px,8vw,96px)]">
        <figure className="mx-auto max-w-[760px] text-center">
          <div
            className="font-serif text-copper-500"
            style={{ fontSize: "58px", lineHeight: 0.6, height: "32px" }}
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <blockquote className="font-serif text-[24px] italic leading-[1.55] text-ink-700">
            {words.quote}
          </blockquote>
          <figcaption className="mt-5 font-sans text-[16px] uppercase tracking-[0.16em] text-copper-800">
            {words.author}
            <span className="mt-1 block normal-case tracking-normal text-ink-400">
              From Mackensie&apos;s retreats and women&apos;s circles
            </span>
          </figcaption>
        </figure>
      </section>

      {/* ── Book ─────────────────────────────────────────────────────────── */}
      <section id="book" className="scroll-mt-4 bg-sand px-6 py-[clamp(56px,8vw,104px)]">
        <div className="mx-auto max-w-container">
          <div className="text-center">
            <span className="eyebrow block">Risk-free</span>
            <h2
              className="mt-3 font-serif text-ink-900"
              style={{ fontSize: "clamp(32px,4.4vw,52px)", lineHeight: 1.06 }}
            >
              Book your initial consult
            </h2>
            <p className="lead mx-auto mt-4 max-w-[46ch]">
              One hour by phone, ${consult.price}. If it doesn&apos;t serve
              you, you don&apos;t pay.
            </p>
          </div>
          <div className="mt-[clamp(32px,4vw,48px)]">
            <Suspense>
              <BookingWidget only="phone" />
            </Suspense>
          </div>
          <p className="mt-8 text-center font-sans text-[18px] text-ink-500">
            Prefer to talk first? Call or text{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────────────── */}
      <section className="px-6 py-[clamp(52px,8vw,96px)]">
        <div className="mx-auto max-w-[760px]">
          <span className="eyebrow block text-center">Good questions</span>
          <h2
            className="mt-3 text-center font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.1 }}
          >
            Before you book
          </h2>
          <div className="mt-9 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-paper-2">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-[23px] text-ink-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="flex-none font-sans text-[26px] leading-none text-copper-700 transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 font-sans text-[19px] leading-[1.75] text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing call to action ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-900 px-6 py-[clamp(56px,8vw,96px)] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-24 w-[420px] select-none opacity-[0.07]"
          style={{ filter: "brightness(0) invert(1)" }}
        />
        <div className="relative mx-auto max-w-[640px]">
          <h2
            className="font-serif text-white"
            style={{ fontSize: "clamp(30px,4.2vw,48px)", lineHeight: 1.1 }}
          >
            Ready to hear what your body is saying?
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] font-sans text-[19px] leading-[1.65] text-indigo-100">
            One hour by phone with Mackensie. ${consult.price}, with a
            money-back guarantee.
          </p>
          <a
            href="#book"
            className="btn btn-lg mt-8 bg-paper-2 text-indigo-800 shadow-md hover:bg-white"
          >
            Book your consult
          </a>
        </div>
      </section>

      {/* ── Slim footer ──────────────────────────────────────────────────── */}
      <footer className="px-6 pb-28 pt-10 text-center sm:pb-12">
        <p className="mx-auto max-w-[62ch] font-sans text-[15px] leading-[1.7] text-ink-400">
          Medical intuition is a complementary practice and is not a substitute
          for professional medical diagnosis or treatment. Always consult your
          physician about medical concerns.
        </p>
        <p className="mt-5 font-sans text-[16px] text-ink-500">
          <a href={site.phoneHref} className="hover:text-copper-800">{site.phone}</a>
          {" · "}
          <a href={`mailto:${site.email}`} className="hover:text-copper-800">{site.email}</a>
          {" · "}
          <Link href="/" className="underline hover:text-copper-800">intelligentembodiment.com</Link>
        </p>
        <p className="mt-3 font-sans text-[14px] text-ink-400">
          © {new Date().getFullYear()} Intelligent Embodiment
        </p>
      </footer>

      <ConsultStickyCta price={consult.price} />
    </>
  );
}
