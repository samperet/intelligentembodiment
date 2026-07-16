import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { TestimonialForm } from "@/components/TestimonialForm";

export const metadata: Metadata = {
  title: "Share Your Experience",
  description:
    "Share your experience of working with Mackensie Satya Priya. With your permission, your words may appear on the site.",
};

export default function SharePage() {
  return (
    <>
      <PageHero
        eyebrow="In Your Words"
        title={
          <>
            Share your <em className="text-copper-800">experience</em>
          </>
        }
        lead="If your time with Mackensie moved something in you, she would be honored to hear it."
      />
      <section className="px-6 pb-[clamp(64px,10vw,128px)]">
        <TestimonialForm />
      </section>
    </>
  );
}
