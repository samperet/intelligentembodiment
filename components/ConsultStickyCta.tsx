"use client";

import { useEffect, useState } from "react";

// Phone-width booking bar for the consult landing page: it appears once the
// visitor scrolls past the hero and steps aside while the booking section is
// on screen, so there is always one clear next step.
export function ConsultStickyCta({ price }: { price: number }) {
  const [pastHero, setPastHero] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const book = document.getElementById("book");
    const io = book
      ? new IntersectionObserver(([e]) => setBookingVisible(e.isIntersecting), {
          rootMargin: "0px 0px -20% 0px",
        })
      : null;
    if (book && io) io.observe(book);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  const show = pastHero && !bookingVisible;

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] transition duration-300 sm:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <a
        href="#book"
        tabIndex={show ? 0 : -1}
        className="flex items-center justify-between rounded-full bg-indigo-800 px-6 py-4 text-white shadow-lg ring-1 ring-copper-300/40"
      >
        <span className="font-sans text-[17px] font-medium uppercase tracking-[0.12em]">
          Book my consult
        </span>
        <span className="font-serif text-[22px] italic text-copper-300">${price}</span>
      </a>
    </div>
  );
}
