// TEMPORARY: confirm in production that bookings can be written to the
// practice calendar (creates and deletes a private test event). Remove
// right after use.
import { NextResponse } from "next/server";
import { canAccessMedia, cookieReader } from "@/lib/media";
import { checkCalendar } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!canAccessMedia(cookieReader(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await checkCalendar());
}
