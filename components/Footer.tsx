import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

const explore = [
  { label: "Massage", href: "/massage" },
  { label: "About", href: "/about" },
  { label: "Book a Session", href: "/book" },
];

const library = [
  { label: "Recipes", href: "/recipes" },
  { label: "Writings", href: "/writings" },
  { label: "Videos", href: "/videos" },
];

function FooterNav({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav>
      <h3 className="eyebrow">{heading}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="font-sans text-[14px] text-ink-700 transition hover:text-copper-800"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer
      id="contact"
      className="bg-paper px-6 pb-12 pt-[clamp(56px,9vw,104px)]"
    >
      <div className="mx-auto max-w-container">
        <div className="grid gap-x-8 gap-y-12 border-b border-[color:var(--border)] pb-[clamp(40px,6vw,64px)] md:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div>
            <Link href="/#top" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/wordmark-copper.png"
                alt="Intelligent Embodiment"
                height={44}
                className="h-[44px] w-auto"
              />
            </Link>
            <p className="mt-5 max-w-[30ch] font-serif text-[18px] italic leading-[1.5] text-ink-500">
              {site.tagline}. Intuitive massage therapy in Burlington, VT.
            </p>
            <Link href="/book" className="btn btn-primary btn-md mt-6">
              Book a Session
            </Link>
          </div>

          <FooterNav heading="Explore" links={explore} />
          <FooterNav heading="Library" links={library} />

          {/* Connect */}
          <div>
            <h3 className="eyebrow">Connect</h3>
            <ul className="mt-4 space-y-3 font-sans text-[14px] text-ink-700">
              <li>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-2.5 transition hover:text-copper-800"
                >
                  <span className="text-copper-800">
                    <Icon name="phone" size={15} />
                  </span>
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 transition hover:text-copper-800"
                >
                  <span className="text-copper-800">
                    <Icon name="mail" size={15} />
                  </span>
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.addressMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-2.5 transition hover:text-copper-800"
                >
                  <span className="mt-[2px] text-copper-800">
                    <Icon name="map-pin" size={15} />
                  </span>
                  {site.address}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              <a
                href="https://www.paypal.com/paypalme/mackensiegrant"
                target="_blank"
                rel="noreferrer"
                className="font-sans text-[12px] uppercase tracking-[0.14em] text-ink-500 transition hover:text-copper-800"
              >
                PayPal
              </a>
              <span className="font-sans text-[12px] uppercase tracking-[0.14em] text-ink-500">
                Venmo
              </span>
            </div>
          </div>
        </div>

        <p className="mt-[26px] font-sans text-[12px] text-ink-400">
          © {new Date().getFullYear()} {site.name} · {site.tagline}
        </p>
      </div>
    </footer>
  );
}
