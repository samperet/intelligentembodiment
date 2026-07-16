import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { recipes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Nourishing Ayurvedic recipes and rituals from Mackensie Satya Priya: Kitchari, Agni Nectar, Ghee-Soaked Dates, Digestive Teas, and Abhyanga.",
};

export default function RecipesPage() {
  return (
    <>
      <PageHero
        eyebrow="From the Ayurvedic Kitchen"
        title={
          <>
            Recipes <em className="text-copper-800">&amp; rituals</em>
          </>
        }
        lead="The most-loved pages from years of practice: simple, warming nourishment to tend your digestive fire and build deep reserves."
      />

      <section className="px-6 pb-[clamp(64px,9vw,110px)]">
        <div className="mx-auto max-w-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <Link
                key={r.slug}
                href={`/recipes/${r.slug}`}
                className="group flex flex-col rounded-xl border border-[color:var(--border)] bg-paper-2 p-8 transition hover:border-[color:var(--border-strong)] hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="eyebrow">{r.tag}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mandala.png"
                    alt=""
                    width={28}
                    height={28}
                    className="opacity-30 transition group-hover:rotate-45 group-hover:opacity-60"
                  />
                </div>
                <h2 className="mt-4 font-serif text-[28px] leading-[1.1] text-ink-900 transition group-hover:text-copper-900">
                  {r.title}
                </h2>
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
            </Link>
            , the story behind the kitchen.
          </p>
        </div>
      </section>
    </>
  );
}
