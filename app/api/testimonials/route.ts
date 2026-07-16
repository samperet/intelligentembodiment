import { NextResponse } from "next/server";
import { listApprovedTestimonials } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Public: approved testimonials to append to the on-site carousel.
export async function GET() {
  const testimonials = await listApprovedTestimonials();
  return NextResponse.json({ testimonials });
}
