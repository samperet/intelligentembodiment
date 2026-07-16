import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { practiceVideos } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "A free library of short yoga teachings and guided practices with Mackensie Satya Priya — down dog, hip opening, breath expansion, and more.",
};

export default function VideosPage() {
  return (
    <>
      <PageHero
        eyebrow="The Practice Library"
        title={
          <>
            Practice with Mackensie — <em className="text-copper-800">free</em>
          </>
        }
        lead="Short teachings and guided practices, filmed with love. Roll out a mat, or simply watch and absorb."
      />

      <section className="ie-section bg-indigo-700 px-6">
        <div className="mx-auto max-w-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {practiceVideos.map((v) => (
              <figure
                key={v.youtubeId}
                className="overflow-hidden rounded-xl bg-indigo-800 shadow-md"
              >
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                    title={v.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
                <figcaption className="p-5">
                  <h2 className="font-serif text-[20px] text-paper-2">
                    {v.title}
                  </h2>
                  {v.note && (
                    <p className="mt-1.5 font-sans text-[13px] leading-[1.6] text-white/65">
                      {v.note}
                    </p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
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
            <Link href="/yoga" className="btn btn-primary btn-lg">
              About the Yoga
            </Link>
            <a href={`mailto:${site.email}`} className="btn btn-secondary btn-lg">
              Enquire by Email
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
