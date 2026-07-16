import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWidget } from "@/components/BookingWidget";
import { Eyebrow } from "@/components/brand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Session",
  description: `Book a 60- or 90-minute massage with ${site.practitioner} at ${site.name}.`,
};

export default function BookPage({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  return (
    <div className="px-6 py-16">
      <div className="ie-container mb-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          width={72}
          height={72}
          className="mx-auto mb-6"
        />
        <Eyebrow align="center">Book a Session</Eyebrow>
        <h1
          className="mt-3 font-serif text-ink-900"
          style={{ fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.05 }}
        >
          Reserve your session
        </h1>
      </div>
      <Suspense>
        <BookingWidget initialService={searchParams.service} />
      </Suspense>
    </div>
  );
}
