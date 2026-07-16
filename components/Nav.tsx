"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { site } from "@/lib/site";

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

        <nav className="hidden items-center gap-[28px] md:flex">
          <a
            href={site.phoneHref}
            className="inline-flex items-center gap-1.5 font-sans text-[12px] text-ink-700 transition hover:text-copper-800"
          >
            <span className="text-copper-800">
              <Icon name="phone" size={14} />
            </span>
            {site.phone}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-1.5 font-sans text-[12px] text-ink-700 transition hover:text-copper-800"
          >
            <span className="text-copper-800">
              <Icon name="mail" size={14} />
            </span>
            {site.email}
          </a>
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
          <a
            href={site.phoneHref}
            className="flex items-center gap-2.5 border-b border-[color:var(--border)] py-3 font-sans text-[14px] text-ink-700"
          >
            <span className="text-copper-800">
              <Icon name="phone" size={15} />
            </span>
            {site.phone}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-2.5 border-b border-[color:var(--border)] py-3 font-sans text-[14px] text-ink-700"
          >
            <span className="text-copper-800">
              <Icon name="mail" size={15} />
            </span>
            {site.email}
          </a>
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
