import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "./Icon";
import { Eyebrow } from "./brand";

export function Footer() {
  return (
    <footer id="contact" className="bg-paper px-6 pb-12 pt-[clamp(72px,12vw,128px)]">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow align="center">Begin</Eyebrow>
        <h2
          className="mt-4 font-serif text-ink-900"
          style={{ fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.05 }}
        >
          Come home to your body
        </h2>
        <p className="mx-auto mt-[18px] max-w-[46ch] font-sans text-[16px] leading-[1.7] text-ink-500">
          Book online, or reach out directly to arrange a session,
          consultation, or class. Additional slots are often available on
          request.
        </p>
        <div className="mt-[34px] flex flex-wrap justify-center gap-3.5">
          <Link href="/book" className="btn btn-primary btn-lg">
            Book Online
          </Link>
          <a href={site.phoneHref} className="btn btn-secondary btn-lg">
            <Icon name="phone" size={16} />
            {site.phone}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-[clamp(56px,8vw,96px)] flex max-w-container flex-wrap items-center justify-between gap-6 border-t border-[color:var(--border)] pt-[34px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wordmark-copper.png"
          alt="Intelligent Embodiment"
          height={44}
          className="h-[44px] w-auto"
        />
        <div className="flex flex-wrap gap-6 font-sans text-[13px] text-ink-500">
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2"
          >
            <span className="text-copper-800">
              <Icon name="mail" size={15} />
            </span>
            {site.email}
          </a>
          <a
            href={site.addressMapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2"
          >
            <span className="text-copper-800">
              <Icon name="map-pin" size={15} />
            </span>
            {site.address}
          </a>
        </div>
        <div className="flex gap-3.5">
          <a
            href="https://www.paypal.com/paypalme/mackensiegrant"
            target="_blank"
            rel="noreferrer"
            className="font-sans text-[12px] uppercase tracking-[0.14em] text-ink-700"
          >
            PayPal
          </a>
          <span className="font-sans text-[12px] uppercase tracking-[0.14em] text-ink-700">
            Venmo
          </span>
        </div>
      </div>
      <p className="mx-auto mt-[18px] max-w-container font-sans text-[12px] text-ink-400">
        © {new Date().getFullYear()} {site.name} · {site.tagline}
      </p>
    </footer>
  );
}
