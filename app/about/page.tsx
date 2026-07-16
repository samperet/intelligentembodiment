import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Stat } from "@/components/brand";
import { aboutPillars, lineageTeachers, stats } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mackensie Satya Priya, nearly three decades of devoted practice in yoga, bodywork, and the art of healing.",
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

      {/* Four pillars */}
      <section className="ie-section px-6">
        <div className="mx-auto max-w-container">
          <div className="grid gap-6 sm:grid-cols-2">
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

      {/* Lineage + wider path, indigo */}
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
        </div>
      </section>
    </>
  );
}
