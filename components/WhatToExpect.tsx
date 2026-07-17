"use client";

import { useEffect, useState } from "react";

export function WhatToExpect({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "font-sans text-[15px] text-copper-800 underline underline-offset-4 transition hover:text-copper-900"
        }
      >
        What to expect in a session
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="What to expect in a session"
          className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8"
        >
          <div
            className="absolute inset-0 bg-ink-900/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-paper-2 p-8 text-center shadow-xl ring-1 ring-[color:var(--border)] sm:p-10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[22px] leading-none text-ink-400 transition hover:bg-copper-50 hover:text-copper-800"
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mandala.png"
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="mx-auto mb-5 opacity-70"
            />
            <h2 className="font-serif text-[30px] text-ink-900">
              What to expect
            </h2>
            <div className="mt-5 space-y-4 text-left font-sans text-[16px] leading-[1.75] text-ink-600">
              <p>
                Every session begins with a conversation. Guided by intuition,
                Mackensie will ask questions and listen closely for what your
                body and your story are asking for.
              </p>
              <p>
                From there you&apos;ll explore the work together and discuss
                potential next steps, so you leave with a clear sense of how to
                continue if it serves you.
              </p>
              <p className="rounded-lg bg-sand px-5 py-4 text-ink-700">
                <strong className="text-ink-900">
                  Every session comes with a money-back guarantee.
                </strong>{" "}
                If it doesn&apos;t serve you, you don&apos;t pay.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary btn-md mt-8"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
