import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Lightweight check so the admin page can auto-authenticate from the session
// cookie without prompting for a password.
export async function GET(request: Request) {
  return NextResponse.json({
    authed: isAdminRequest(request),
    configured: Boolean(process.env.ADMIN_PASSWORD),
  });
}
