import { Allura } from "next/font/google";
import { site } from "@/lib/site";

// Handwritten face for the photographer's autograph on the photo.
const autograph = Allura({ weight: "400", subsets: ["latin"], display: "swap" });

const PHOTO_CREDIT = {
  name: "Shawn McGrath",
  url: "https://www.google.com/maps/contrib/105723441655519311194/photos/@41.4648607,-72.5963201,179655m/data=!3m2!1e3!4b1!4m3!8m2!3m1!1e1?entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D",
};

const query = encodeURIComponent(site.address);
const MAP_EMBED = `https://www.google.com/maps?q=${query}&z=14&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

export function OfficeLocation() {
  return (
    <section id="location" className="ie-section bg-paper-2 px-6">
      <div className="mx-auto max-w-[1040px]">
        <div className="mx-auto max-w-[720px] text-center">
          <h2
            className="font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.08 }}
          >
            A healing place in itself
          </h2>
          <p className="mt-5 font-sans text-[20px] leading-[1.75] text-ink-500">
            The office overlooks rolling meadows leading to a mountainscape
            vista above Lake Champlain. The land holds a healing atmosphere of
            its own, and it was once home to the All Souls Interfaith
            Gathering.
          </p>
        </div>

        <figure className="relative mt-[clamp(32px,5vw,52px)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/imagery/shelburne-office-mcgrath.webp"
            alt="Sunset over the meadows of the office land in Shelburne, Vermont, with wildflowers in front and Lake Champlain and the mountains beyond. Photo by Shawn McGrath."
            width={1170}
            height={666}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-[18px] object-cover shadow-md sm:aspect-[16/9]"
          />
          {/* The IE mandala, die-cut white like a sticker on the print. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mandala.png"
            alt=""
            aria-hidden="true"
            width={84}
            height={84}
            className="pointer-events-none absolute left-3 top-3 w-[60px] -rotate-[8deg] select-none sm:left-5 sm:top-5 sm:w-[84px]"
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 1px 1px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            }}
          />
          {PHOTO_CREDIT.name && (
            <figcaption className="absolute bottom-2.5 right-4 sm:bottom-3.5 sm:right-5">
              <a
                href={PHOTO_CREDIT.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Photo by ${PHOTO_CREDIT.name}`}
                className={`${autograph.className} inline-block text-[22px] leading-none text-white/90 transition duration-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)] hover:-translate-y-[2px] hover:text-white hover:[text-shadow:0_4px_10px_rgba(0,0,0,0.6)] focus-visible:-translate-y-[2px] sm:text-[26px]`}
              >
                {PHOTO_CREDIT.name}
              </a>
            </figcaption>
          )}
        </figure>

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="flex flex-col justify-center rounded-[18px] border border-[color:var(--border)] bg-white p-7 text-center md:text-left">
            <span className="eyebrow block">Address</span>
            <p className="mt-3 font-serif text-[24px] leading-snug text-ink-900">
              291 Bostwick Farm Road
              <br />
              Shelburne, VT
            </p>
            <p className="mt-3 font-sans text-[16px] leading-[1.6] text-ink-400">
              Medical intuition consults are by phone.
            </p>
            <a
              href={DIRECTIONS}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-md mt-6 self-center md:self-start"
            >
              Get directions
            </a>
          </div>
          <iframe
            src={MAP_EMBED}
            title={`Map of ${site.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full rounded-[18px] border border-[color:var(--border)] bg-sand shadow-sm md:aspect-auto md:min-h-[320px]"
          />
        </div>
      </div>
    </section>
  );
}
