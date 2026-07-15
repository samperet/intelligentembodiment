import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWidget } from "@/components/BookingWidget";
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
    <div className="py-14">
      <div className="container-tight mb-10 text-center">
        <p className="eyebrow">Booking</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Reserve your session</h1>
        <p className="mx-auto mt-4 max-w-xl text-clay/70">
          Choose a session, pick a time that suits you, and you&apos;ll receive
          a confirmation right away. All times shown in Eastern Time.
        </p>
      </div>
      <div className="container-tight">
        <Suspense>
          <BookingWidget initialService={searchParams.service} />
        </Suspense>
      </div>
    </div>
  );
}
