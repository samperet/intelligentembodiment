"use client";

import { useState } from "react";

// A collapsible admin panel section. Everything starts collapsed so the
// admin reads as a tidy table of contents.
export function AdminSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-[color:var(--border)] bg-paper-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/60"
      >
        <span>
          <span className="block font-serif text-[24px] leading-tight text-ink-900">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block font-sans text-[14px] text-ink-500">
              {subtitle}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={`flex-none font-serif text-[22px] text-copper-800 transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        >
          ›
        </span>
      </button>
      {open && (
        <div className="border-t border-[color:var(--border)] bg-paper px-6 py-6">
          {children}
        </div>
      )}
    </section>
  );
}
