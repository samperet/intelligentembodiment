"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { site } from "@/lib/site";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

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

        <div className="flex items-center gap-4 sm:gap-5">
          <a
            href={site.phoneHref}
            aria-label={`Call ${site.phone}`}
            className="inline-flex items-center gap-1.5 text-ink-700 transition hover:text-copper-800"
          >
            <span className="text-copper-800">
              <Icon name="phone" size={17} />
            </span>
            <span className="hidden font-sans text-[12px] md:inline">
              {site.phone}
            </span>
          </a>
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.email}`}
            className="inline-flex items-center gap-1.5 text-ink-700 transition hover:text-copper-800"
          >
            <span className="text-copper-800">
              <Icon name="mail" size={17} />
            </span>
            <span className="hidden font-sans text-[12px] md:inline">
              {site.email}
            </span>
          </a>
          <Link href="/#book" className="btn btn-primary btn-sm">
            Book
          </Link>
        </div>
      </div>
    </header>
  );
}
