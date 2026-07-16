import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { practiceVideos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "A free library of short yoga teachings and guided practices with Mackensie Satya Priya, down dog, hip opening, breath expansion, and more.",
};

export default function VideosPage() {
  return (
    <>
      <PageHero title="Video Library" />

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

    </>
  );
}
