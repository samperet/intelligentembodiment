import { NextResponse } from "next/server";
import { getService } from "@/lib/site";
import { getAvailableSlots } from "@/lib/availability";
import { isGoogleConfigured } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("service");

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: "Missing date or service parameter." },
      { status: 400 },
    );
  }

  const service = getService(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Unknown service." }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(date, service.durationMinutes);
    return NextResponse.json({
      date,
      service: service.id,
      slots,
      // When Google isn't wired up yet, all working-hour slots show as open.
      calendarConnected: isGoogleConfigured(),
    });
  } catch (err) {
    console.error("availability error", err);
    return NextResponse.json(
      { error: "Could not load availability. Please try again." },
      { status: 500 },
    );
  }
}
