import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Eyebrow, Rule } from "@/components/brand";
import { PageHero } from "@/components/PageHero";
import { BookingWidget } from "@/components/BookingWidget";
import { site } from "@/lib/site";
import { testimonials } from "@/lib/content";

export const metadata: Metadata = {
  title: "Medical Intuition",
  description:
    "What is medical intuition? Learn how Mackensie Satya Priya combines three decades of bodywork with trained intuitive insight, and book a risk-free initial consult.",
};

const steps = [
  {
    title: "A guided conversation",
    body: "You talk, she listens — with more than her ears. Guided by intuition, Mackensie asks questions that often land surprisingly close to what's really going on.",
  },
  {
    title: "Patterns come into focus",
    body: "Physical symptoms, emotional history, and energetic patterns are read together, looking for the root beneath the recurring pain or fatigue.",
  },
  {
    title: "Clear next steps",
    body: "You leave with a picture of what your body is asking for and practical next steps — bodywork, practices, or questions worth bringing to your doctor.",
  },
];

const faqs = [
  {
    q: "Is this a replacement for my doctor?",
    a: "No — and anyone who tells you otherwise should worry you. Medical intuition complements medical care. Many clients bring what they discover in a session to their physicians as better questions.",
  },
  {
    q: "What if I'm skeptical?",
    a: "Healthy skepticism is welcome. That's exactly why the first consult is risk-free: if it doesn't serve you, you don't pay. Judge it by your own experience, not anyone's claims.",
  },
  {
    q: "What happens on the call?",
    a: "It's a relaxed hour by phone. Mackensie will ask questions guided by intuition, reflect what she perceives, and discuss potential next steps with you.",
  },
  {
    q: "How is Mackensie qualified?",
    a: "Three decades of professional bodywork (craniosacral, polarity, Temple Lomi), 28 years teaching yoga, and formal training in medical intuition with Skylar Acamesis.",
  },
];

export default function MedicalIntuitionPage() {
  return (
    <>
      <PageHero
        eyebrow="Medical Intuition · Charlotte, VT"
        title={
          <>
            When your body knows{" "}
            <em className="text-copper-800">something deeper</em>
          </>
        }
        lead="Some pain has a story that scans and labs don't tell. Medical intuition listens for it."
      />

      {/* What it is */}
      <section className="px-6 pb-[clamp(48px,7vw,80px)]">
        <div className="mx-auto max-w-[760px]">
          <div className="space-y-5 font-sans text-[19px] leading-[1.8] text-ink-700">
            <p>
              Medical intuition is the trained practice of perceiving patterns
              in the body — physical, emotional, and energetic — that underlie
              chronic pain, fatigue, and illness. It doesn&apos;t replace your
              doctor. It asks a different question:{" "}
              <em>why is this happening, and what is it connected to?</em>
            </p>
            <p>
              After thirty years of hands-on bodywork, Mackensie kept noticing
              the same thing: her hands and her intuition found the story
              beneath the symptom — the grief held in a shoulder, the old fear
              living in a gut. Clients kept asking how she knew. Training with
              medical intuitive Skylar Acamesis gave that perception structure,
              language, and discipline.
            </p>
          </div>
        </div>
      </section>

      {/* How a session works */}
      <section className="bg-sand px-6 py-[clamp(48px,7vw,88px)]">
        <div className="mx-auto max-w-container">
          <Eyebrow align="center">How it works</Eyebrow>
          <h2
            className="mt-3 text-center font-serif text-ink-900"
            style={{ fontSize: "clamp(28px,3.8vw,44px)", lineHeight: 1.1 }}
          >
            One hour. Three movements.
          </h2>
          <div className="mx-auto mt-[clamp(28px,4vw,44px)] grid max-w-[1020px] gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="rounded-xl border border-[color:var(--border)] bg-paper-2 p-7 text-center"
              >
                <span className="font-serif text-[30px] italic text-copper-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-serif text-[24px] text-ink-900">
                  {s.title}
                </h3>
                <p className="mt-2 font-sans text-[16px] leading-[1.7] text-ink-500">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 py-[clamp(48px,7vw,88px)]">
        <div className="mx-auto max-w-[760px] text-center">
          <div
            className="font-serif text-copper-500"
            style={{ fontSize: "58px", lineHeight: 0.6, height: "32px" }}
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <blockquote className="font-serif text-[24px] italic leading-[1.55] text-ink-700">
            {testimonials[0].quote.length > 220
              ? testimonials[0].quote.slice(0, testimonials[0].quote.indexOf(".", 120) + 1)
              : testimonials[0].quote}
          </blockquote>
          <p className="mt-5 font-sans text-[14px] font-semibold uppercase tracking-[0.16em] text-copper-800">
            {testimonials[0].author}
          </p>
        </div>
      </section>

      {/* Risk-free offer + booking */}
      <section id="book" className="bg-sand px-6 py-[clamp(56px,8vw,96px)]">
        <div className="mx-auto max-w-container">
          <div className="text-center">
            <Eyebrow align="center">Risk-free</Eyebrow>
            <h2
              className="mt-3 font-serif text-ink-900"
              style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.08 }}
            >
              Book an initial consult
            </h2>
            <p className="lead mx-auto mt-4 max-w-[52ch]">
              A one-hour call with Mackensie. If it doesn&apos;t serve you, you
              don&apos;t pay — every session carries a money-back guarantee.
            </p>
          </div>
          <div className="mt-[clamp(32px,4vw,48px)]">
            <Suspense>
              <BookingWidget initialService="phone-consultation" />
            </Suspense>
          </div>
          <p className="mt-8 text-center font-sans text-[15px] text-ink-500">
            Prefer to talk first?{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-[clamp(48px,7vw,88px)]">
        <div className="mx-auto max-w-[760px]">
          <Eyebrow align="center">Good questions</Eyebrow>
          <div className="mt-8 space-y-8">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-serif text-[24px] text-ink-900">{f.q}</h3>
                <p className="mt-2 font-sans text-[17px] leading-[1.75] text-ink-600">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Rule ornament="mandala" />
            <p className="mt-6 text-center font-sans text-[13px] leading-[1.7] text-ink-400">
              Medical intuition is a complementary practice and is not a
              substitute for professional medical diagnosis or treatment.
              Always consult your physician about medical concerns.
            </p>
            <div className="mt-8 text-center">
              <Link href="/about" className="btn btn-secondary btn-md">
                Meet Mackensie
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
