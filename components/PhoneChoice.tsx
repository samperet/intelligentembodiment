"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * Global handler: intercept clicks on any `tel:` link across the site and,
 * instead of dialing straight away, offer a choice to Call or Text (with real
 * tel: and sms: links). Mounted once in the layout so every phone link — nav,
 * footer, booking notices, popups — gets the behavior without extra markup.
 */
export function PhoneChoice() {
  const [tel, setTel] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.(
        'a[href^="tel:"]',
      ) as HTMLAnchorElement | null;
      if (!a) return;
      // Don't intercept the modal's own Call/Text links.
      if (a.closest("[data-phone-modal]")) return;
      e.preventDefault();
      setTel(a.getAttribute("href"));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!tel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTel(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [tel]);

  if (!tel) return null;
  const sms = tel.replace(/^tel:/, "sms:");

  return (
    <div
      data-phone-modal
      role="dialog"
      aria-modal="true"
      aria-label="Call or text"
      className="fixed inset-0 z-[110] flex items-center justify-center px-5"
    >
      <div
        className="absolute inset-0 bg-ink-900/55 backdrop-blur-sm"
        onClick={() => setTel(null)}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-xs rounded-2xl bg-paper-2 p-7 text-center shadow-xl ring-1 ring-[color:var(--border)]">
        <button
          type="button"
          onClick={() => setTel(null)}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[20px] leading-none text-ink-400 transition hover:bg-copper-50 hover:text-copper-800"
        >
          ×
        </button>
        <h2 className="font-serif text-[26px] text-ink-900">Call or text</h2>
        <p className="mt-1 font-sans text-[15px] text-ink-500">{site.phone}</p>
        <div className="mt-6 grid gap-3">
          <a
            href={tel}
            onClick={() => setTel(null)}
            className="btn btn-primary btn-md"
          >
            Call
          </a>
          <a
            href={sms}
            onClick={() => setTel(null)}
            className="btn btn-secondary btn-md"
          >
            Text
          </a>
        </div>
      </div>
    </div>
  );
}
