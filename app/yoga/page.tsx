import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Eyebrow } from "@/components/brand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Yoga",
  description:
    "Anusara-lineage yoga with Mackensie Satya Priya — breath-guided, poetry-inspired classes, private and group instruction, and a free practice video library.",
};

export default function YogaPage() {
  return (
    <>
      <PageHero
        eyebrow="Offering 02 · Practice"
        title={
          <>
            Breath-guided, <em className="text-copper-800">poetry-inspired</em>
          </>
        }
        lead="Full of the wisdom and technology of the Anusara principles — a yoga that is truly profound, powerful, and a doorway into the depths of your own being."
      />

      {/* Intro */}
      <section className="px-6 pb-[clamp(48px,7vw,80px)]">
        <div className="mx-auto grid max-w-container gap-[clamp(32px,5vw,64px)] md:grid-cols-3">
          {[
            {
              title: "The Lineage",
              body: "Five teacher trainings with senior teachers including Richard Freeman, John Friend, and Darren Rhodes — Hatha, Kripalu, Anusara, and Ashtanga absorbed not as technique but as a language of the body's deeper intelligence.",
            },
            {
              title: "The Classes",
              body: "Grounded in anatomy, opened toward the subtle body. Breath-guided and poetry-inspired, rooted in the true spirit of yoga — to breathe and move with the divine essence of life. All levels welcome unless otherwise noted.",
            },
            {
              title: "Qi Gong",
              body: "Alongside asana, Mackensie teaches women's Qi Gong in the lineage of Daisy Lee — slower, subtler currents for the energetic body. Private and group instruction available on request.",
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

      {/* Practice library teaser */}
      <section className="ie-section bg-indigo-700 px-6 text-center">
        <div className="mx-auto max-w-[640px]">
          <Eyebrow align="center" paper>
            The Practice Library
          </Eyebrow>
          <h2
            className="mt-3 font-serif text-paper-2"
            style={{ fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.1 }}
          >
            Practice with Mackensie — free
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] font-serif text-[18px] italic leading-[1.55] text-white/75">
            A library of short teachings and guided practices, filmed with
            love — down dog, hip opening, breath expansion, and more. Roll out
            a mat, or simply watch and absorb.
          </p>
          <Link href="/videos" className="btn btn-primary btn-lg mt-8">
            Watch the Practice Videos
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-[clamp(56px,8vw,96px)] text-center">
        <div className="mx-auto max-w-[640px]">
          <h2
            className="font-serif text-ink-900"
            style={{ fontSize: "clamp(28px,3.6vw,42px)", lineHeight: 1.1 }}
          >
            Practice together, in person
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] font-sans text-[16px] leading-[1.7] text-ink-500">
            Private sessions and group classes are arranged directly — reach
            out to find a time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <a href={`mailto:${site.email}`} className="btn btn-primary btn-lg">
              Enquire by Email
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
