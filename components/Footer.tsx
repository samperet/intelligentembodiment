import Link from "next/link";
import { site } from "@/lib/site";
import { Mandala } from "./Mandala";

export function Footer() {
  return (
    <footer id="contact" className="mt-24 border-t border-copper-100 bg-sand-100">
      <div className="container-tight grid gap-10 py-16 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-3 text-copper-500">
            <Mandala className="h-10 w-10" />
            <div>
              <p className="font-serif text-xl text-clay">{site.name}</p>
              <p className="text-sm text-copper-600">{site.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-clay/70">
            {site.description}
          </p>
        </div>

        <div className="sm:justify-self-end">
          <h3 className="eyebrow mb-4">Visit &amp; Connect</h3>
          <ul className="space-y-2 text-sm text-clay/80">
            <li>
              <a
                href={site.addressMapUrl}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-copper-600"
              >
                {site.address}
              </a>
            </li>
            <li>
              <a
                href={site.phoneHref}
                className="transition hover:text-copper-600"
              >
                {site.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="transition hover:text-copper-600"
              >
                {site.email}
              </a>
            </li>
          </ul>
          <Link href="/book" className="btn-ghost mt-6 !px-5 !py-2 !text-xs">
            Book a session
          </Link>
        </div>
      </div>
      <div className="border-t border-copper-100 py-6">
        <p className="container-tight text-xs text-clay/50">
          © {new Date().getFullYear()} {site.name}. With {site.practitioner}.
        </p>
      </div>
    </footer>
  );
}
