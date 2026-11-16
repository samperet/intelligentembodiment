import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { checkCalendar } from "@/lib/google";

export const dynamic = "force-dynamic";

// POST → test that bookings can be written to the practice calendar.
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json(await checkCalendar());
}
