"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";

const links = [
  { label: "Massage", href: "/massage" },
  { label: "Yoga", href: "/yoga" },
  { label: "Health Coaching", href: "/health-coaching" },
  { label: "About", href: "/about" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-[background,border-color] duration-[420ms]"
      style={{
        background: scrolled ? "rgba(248,243,235,0.86)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
      }}
    >
      <div className="ie-container flex items-center justify-between py-[18px]">
        <Link href="/#top" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mandala.png" alt="" width={38} height={38} />
          <span className="font-serif uppercase leading-[1.05] text-indigo-700 tracking-[0.14em] text-[16px]">
            Intelligent
            <br />
            Embodiment
          </span>
        </Link>

        <nav className="hidden items-center gap-[34px] md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-ink-700 transition hover:text-copper-800"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="btn btn-primary btn-sm">
            Book
          </Link>
        </nav>

        <button
          type="button"
          className="text-ink-700 md:hidden"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name={menuOpen ? "x" : "menu"} size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[color:var(--border)] bg-paper-2 px-6 pb-6 pt-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-[color:var(--border)] py-3 font-sans text-[14px] font-medium uppercase tracking-[0.14em] text-ink-700"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="btn btn-primary btn-md mt-4 w-full"
          >
            Book a Session
          </Link>
        </div>
      )}
    </header>
  );
}
