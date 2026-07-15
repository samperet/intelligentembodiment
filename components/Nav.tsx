import Link from "next/link";
import { site } from "@/lib/site";
import { Mandala } from "./Mandala";

const links = [
  { href: "/#services", label: "Sessions" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-copper-100/70 bg-sand-50/80 backdrop-blur">
      <nav className="container-tight flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-clay">
          <span className="text-copper-500">
            <Mandala className="h-8 w-8" />
          </span>
          <span className="font-serif text-lg leading-none tracking-tight">
            {site.name}
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-7 text-sm text-clay/80 sm:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition hover:text-copper-600"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/book" className="btn-primary !px-5 !py-2 !text-xs">
            Book
          </Link>
        </div>
      </nav>
    </header>
  );
}
