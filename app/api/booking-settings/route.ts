import { NextResponse } from "next/server";
import { getBookingSettings } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Public, read-only. The client calendar uses these to decide which days
// are selectable and how far ahead booking is allowed.
export async function GET() {
  const settings = await getBookingSettings();
  return NextResponse.json({ settings });
}
