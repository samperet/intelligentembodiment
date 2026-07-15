import Link from "next/link";
import { site, services } from "@/lib/site";
import { Mandala } from "@/components/Mandala";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-16 text-copper-200/60 sm:-right-10">
          <Mandala className="h-[36rem] w-[36rem]" spin />
        </div>
        <div className="container-tight relative grid min-h-[78vh] items-center py-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow">Somatic Bodywork · Burlington, VT</p>
            <h1 className="mt-6 text-5xl leading-[1.05] sm:text-7xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-clay/75">
              Integrative massage and intuitive bodywork with{" "}
              {site.practitioner} — meeting physical tension and the deeper
              emotional roots it protects, so the body can soften and return
              home to itself.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/book" className="btn-primary">
                Book a session
              </Link>
              <Link href="/#services" className="btn-ghost">
                Explore sessions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sessions / Services ──────────────────────────────────────────── */}
      <section id="services" className="scroll-mt-20 py-16">
        <div className="container-tight">
          <p className="eyebrow">Sessions</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">
            Two ways to be met on the table
          </h2>
          <p className="mt-4 max-w-2xl text-clay/70">
            Each session weaves craniosacral therapy, polarity work, and
            intuitive touch — thirty years of practice, tuned to what your
            body is asking for that day.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="group flex flex-col rounded-2xl border border-copper-100 bg-white/60 p-8 transition hover:border-copper-300 hover:shadow-lg hover:shadow-copper-100/40"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl">{s.name}</h3>
                  <span className="font-serif text-2xl text-copper-600">
                    ${s.price}
                  </span>
                </div>
                <p className="mt-1 text-sm uppercase tracking-[0.2em] text-copper-400">
                  {s.durationMinutes} minutes
                </p>
                <p className="mt-5 flex-1 leading-relaxed text-clay/75">
                  {s.blurb}
                </p>
                <Link
                  href={`/book?service=${s.id}`}
                  className="btn-ghost mt-7 self-start !px-5 !py-2 !text-xs"
                >
                  Book {s.durationMinutes} min
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-clay/60">
            Also offered in person: health &amp; nutrition consultations,
            women&apos;s heart circles, yoga and Qi Gong instruction, and
            intuitive root-cause consulting. Reach out to arrange.
          </p>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="scroll-mt-20 bg-sand-100 py-20">
        <div className="container-tight grid items-center gap-12 md:grid-cols-[1fr_1.2fr]">
          <div className="relative mx-auto text-copper-400">
            <Mandala className="h-72 w-72" />
          </div>
          <div>
            <p className="eyebrow">About</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">{site.practitioner}</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-clay/75">
              <p>
                Mackensie brings thirty years of deep spiritual practice and
                bodywork to the table — craniosacral therapy, polarity therapy,
                and a listening, intuitive touch.
              </p>
              <p>
                Her work is shaped by twenty-eight years of teaching yoga, five
                teacher trainings, and seven vipassana retreats. Sessions tend
                to the whole person: the tight shoulder and the story it holds,
                the physical symptom and its quieter root.
              </p>
              <p>
                The invitation is simple — to become, more and more, awake in
                the body.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              <Stat value="30 yrs" label="Bodywork" />
              <Stat value="28 yrs" label="Teaching yoga" />
              <Stat value="7" label="Vipassana retreats" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container-tight text-center">
          <div className="mx-auto mb-6 w-fit text-copper-400">
            <Mandala className="h-16 w-16" />
          </div>
          <h2 className="mx-auto max-w-2xl text-4xl leading-tight sm:text-5xl">
            Give your body an hour to remember its ease.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-clay/70">
            Choose a 60- or 90-minute session and pick a time that works for
            you. Your appointment is confirmed to the calendar right away.
          </p>
          <Link href="/book" className="btn-primary mt-9">
            Book a session
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-copper-600">{value}</p>
      <p className="text-xs uppercase tracking-[0.2em] text-clay/60">{label}</p>
    </div>
  );
}
