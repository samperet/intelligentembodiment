import { NextResponse } from "next/server";
import { vapidPublicKey, pushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";

// Public: the browser needs the VAPID public key to subscribe.
export async function GET() {
  return NextResponse.json({
    key: vapidPublicKey(),
    configured: pushConfigured(),
  });
}
