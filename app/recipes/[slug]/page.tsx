import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow, Rule } from "@/components/brand";
import { recipes, getRecipe } from "@/lib/content";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

// A recipe photo shows when public/imagery/recipe-<slug>.jpg is present.
function recipePhoto(slug: string): string | null {
  const rel = `/imagery/recipe-${slug}.jpg`;
  return fs.existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const r = getRecipe(params.slug);
  if (!r) return {};
  return {
    title: `${r.title} · Recipes`,
    description: r.intro[0],
  };
}

export default function RecipePage({ params }: { params: { slug: string } }) {
  const r = getRecipe(params.slug);
  if (!r) notFound();
  const photo = recipePhoto(r.slug);

  return (
    <article className="px-6 pb-[clamp(56px,8vw,96px)]">
      {/* Header */}
      <header className="relative overflow-hidden pb-[clamp(32px,5vw,56px)] pt-[clamp(56px,8vw,96px)] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-40%] w-[min(560px,110%)] -translate-x-1/2 select-none opacity-[0.045]"
        />
        <div className="relative mx-auto max-w-[720px]">
          <Eyebrow align="center">From the Ayurvedic Kitchen · {r.tag}</Eyebrow>
          <h1
            className="mt-4 font-serif text-ink-900"
            style={{ fontSize: "clamp(38px,5.4vw,60px)", lineHeight: 1.05 }}
          >
            {r.title}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-[720px]">
        {photo && (
          <div className="mb-[clamp(28px,4vw,44px)] overflow-hidden rounded-2xl shadow-md ring-1 ring-[color:var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={r.title}
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
        )}
        {/* Intro */}
        <div className="space-y-4">
          {r.intro.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-serif text-[22px] italic leading-[1.6] text-ink-500"
                  : "font-sans text-[18px] leading-[1.75] text-ink-500"
              }
            >
              {p}
            </p>
          ))}
        </div>

        {/* Meta strip */}
        {r.meta && (
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 rounded-lg bg-sand px-6 py-4">
            {r.meta.servings && <Meta k="Servings" v={r.meta.servings} />}
            {r.meta.servingSize && (
              <Meta k="Serving size" v={r.meta.servingSize} />
            )}
            {r.meta.prepTime && <Meta k="Prep time" v={r.meta.prepTime} />}
          </div>
        )}

        {/* Benefits */}
        {r.benefits && (
          <section className="mt-10">
            <h2 className="font-serif text-[28px] text-ink-900">
              Daily self-massage helps to…
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {r.benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2.5 font-sans text-[17px] leading-[1.6] text-ink-500"
                >
                  <span className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full bg-copper-700" />
                  {b}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Ingredients */}
        {r.ingredients && (
          <section className="mt-10 rounded-xl border border-[color:var(--border)] bg-paper-2 p-8">
            <h2 className="font-serif text-[28px] text-ink-900">Ingredients</h2>
            <ul className="mt-4 space-y-2.5">
              {r.ingredients.map((ing) => (
                <li
                  key={ing}
                  className="flex items-start gap-2.5 font-sans text-[17px] leading-[1.6] text-ink-700"
                >
                  <span className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full bg-copper-700" />
                  {ing}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Directions */}
        {r.directions && (
          <section className="mt-10">
            <h2 className="font-serif text-[28px] text-ink-900">Directions</h2>
            <ol className="mt-5 space-y-5">
              {r.directions.map((d, i) => (
                <li key={i} className="flex gap-5">
                  <span className="font-serif text-[24px] italic leading-[1.3] text-copper-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-sans text-[17px] leading-[1.7] text-ink-500">
                    {d}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {r.note && (
          <p className="mt-8 font-serif text-[19px] italic text-ink-500">
            {r.note}
          </p>
        )}

        {/* Footer nav */}
        <div className="mt-14">
          <Rule ornament="mandala" />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link href="/recipes" className="btn btn-secondary btn-md">
              ← All recipes
            </Link>
            {r.slug === "kitchari" && (
              <Link
                href="/writings/how-i-came-to-kitchari"
                className="btn btn-ghost btn-md"
              >
                Read the story behind it →
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-ink-400">
        {k}
      </span>
      <span className="font-serif text-[20px] text-ink-900">{v}</span>
    </div>
  );
}
