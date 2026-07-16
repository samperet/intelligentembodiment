import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Rule } from "@/components/brand";
import { recipes } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Health Coaching",
  description:
    "Root-cause health coaching with Mackensie Satya Priya — medical intuition, Ayurveda, and nourishing recipes for reclaiming vitality from the inside out.",
};

export default function HealthCoachingPage() {
  return (
    <>
      <PageHero
        eyebrow="Offering 03 · Root-Cause Wellness"
        title={
          <>
            Vitality, <em className="text-copper-800">from the inside out</em>
          </>
        }
        lead="Not managing symptoms. Uncovering patterns — exploring where emotion, energy, and physicality intersect at the root of illness."
      />

      {/* Approach */}
      <section className="px-6 pb-[clamp(48px,7vw,80px)]">
        <div className="mx-auto grid max-w-container gap-[clamp(32px,5vw,64px)] md:grid-cols-3">
          {[
            {
              title: "Medical Intuition",
              body: "Trained with Skylar Acemesis, Mackensie works with the hidden patterns — emotional, energetic, physical — that live at the root of illness. Consultations address the full spectrum of your health and well-being.",
            },
            {
              title: "Ayurvedic Wisdom",
              body: "Years of study and lived practice in Ayurveda and holistic health: understanding your constitution, tending the digestive fire (Agni), and choosing nourishment that heals rather than merely trends.",
            },
            {
              title: "Whole-Person Coaching",
              body: "Today, the deepest work is helping women get to the root cause of illness. Sessions weave nutrition, daily rhythm, self-care rituals, and honest inquiry — reclaiming vitality from the inside out.",
            },
          ].map((c) => (
            <div key={c.title}>
              <h3 className="font-serif text-[24px] text-ink-900">{c.title}</h3>
              <p className="mt-2 font-sans text-[15px] leading-[1.7] text-ink-500">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recipes */}
      <section id="recipes" className="ie-section bg-sand px-6">
        <div className="mx-auto max-w-container">
          <div className="text-center">
            <Eyebrow align="center">From the Ayurvedic Kitchen</Eyebrow>
            <h2
              className="mt-3 font-serif text-ink-900"
              style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
            >
              Recipes & rituals
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] font-serif text-[18px] italic leading-[1.55] text-ink-500">
              The most-loved pages from years of practice — simple, warming
              nourishment to tend your digestive fire and build deep reserves.
            </p>
          </div>

          <div className="mt-[clamp(36px,5vw,56px)] grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r, i) => (
              <Link
                key={r.slug}
                href={`/recipes/${r.slug}`}
                className={`group flex flex-col rounded-xl border border-[color:var(--border)] bg-paper-2 p-8 transition hover:border-[color:var(--border-strong)] hover:shadow-md ${
                  i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <Eyebrow>{r.tag}</Eyebrow>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mandala.png"
                    alt=""
                    width={28}
                    height={28}
                    className="opacity-30 transition group-hover:rotate-45 group-hover:opacity-60"
                  />
                </div>
                <h3 className="mt-4 font-serif text-[28px] leading-[1.1] text-ink-900 transition group-hover:text-copper-900">
                  {r.title}
                </h3>
                <p className="mt-3 flex-1 font-sans text-[14px] leading-[1.65] text-ink-500">
                  {r.intro[0]}
                </p>
                <span className="mt-5 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-copper-800">
                  Open recipe →
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-10 text-center font-sans text-[14px] text-ink-500">
            Curious about your constitution? Read{" "}
            <Link href="/writings/how-i-came-to-kitchari" className="underline">
              How I Came to Kitchari
            </Link>{" "}
            — the story behind the kitchen.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-[clamp(56px,8vw,96px)] text-center">
        <div className="mx-auto max-w-[680px]">
          <Rule ornament="mandala" />
          <h2
            className="mt-8 font-serif text-ink-900"
            style={{ fontSize: "clamp(28px,3.6vw,42px)", lineHeight: 1.1 }}
          >
            Ready to find the root?
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] font-sans text-[16px] leading-[1.7] text-ink-500">
            Whether you&apos;re navigating chronic imbalance, seeking deeper
            embodiment, or feeling a quiet pull toward transformation — this
            work is designed for you. Consultations are arranged directly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <a href={`mailto:${site.email}`} className="btn btn-primary btn-lg">
              Begin an Enquiry
            </a>
            <a href={site.phoneHref} className="btn btn-secondary btn-lg">
              {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
