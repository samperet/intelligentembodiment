import { site } from "@/lib/site";

const query = encodeURIComponent(site.address);
const MAP_EMBED = `https://www.google.com/maps?q=${query}&z=14&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

export function OfficeLocation() {
  return (
    <section id="location" className="ie-section bg-paper-2 px-6">
      <div className="mx-auto max-w-[1040px]">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="eyebrow block">The Office · Shelburne, VT</span>
          <h2
            className="mt-3 font-serif text-ink-900"
            style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.08 }}
          >
            A healing place in itself
          </h2>
          <p className="mt-5 font-sans text-[18px] leading-[1.75] text-ink-500">
            Sessions take place among open fields in Shelburne, with views
            across the meadows to the mountains. The land holds a healing
            atmosphere of its own, and it was once home to the All Souls
            Interface Gathering.
          </p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/imagery/shelburne-office-sunset.webp"
          alt="Sunset over the meadows of the office land in Shelburne, Vermont, with wildflowers in front and the lake and mountains beyond"
          width={1672}
          height={941}
          loading="lazy"
          className="mt-[clamp(32px,5vw,52px)] aspect-[4/3] w-full rounded-[18px] object-cover shadow-md sm:aspect-[16/9]"
        />

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="flex flex-col justify-center rounded-[18px] border border-[color:var(--border)] bg-white p-7 text-center md:text-left">
            <span className="eyebrow block">Address</span>
            <p className="mt-3 font-serif text-[24px] leading-snug text-ink-900">
              291 Bostwick Farm Road
              <br />
              Shelburne, VT
            </p>
            <p className="mt-3 font-sans text-[14px] leading-[1.6] text-ink-400">
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
