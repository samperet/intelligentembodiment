import { NextResponse } from "next/server";
import {
  isR2Configured,
  getBookingSettings,
  getStoredBookingSettings,
  saveBookingSettings,
} from "@/lib/r2";

export const dynamic = "force-dynamic";

// POST { password }               → read current settings
// POST { password, settings }     → validate + save (requires R2)
export async function POST(request: Request) {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) {
    return NextResponse.json(
      { error: "Admin is not configured. Set ADMIN_PASSWORD." },
      { status: 500 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body?.password !== "string" || body.password !== adminPw) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  if (body?.settings) {
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            "R2 is not configured, so settings can't be saved. Set CLOUDFLARE_API, CLOUDFLARE_ACCOUNT_ID, and R2_BUCKET.",
        },
        { status: 400 },
      );
    }
    try {
      const { settings, verified } = await saveBookingSettings(body.settings);
      return NextResponse.json({
        ok: true,
        saved: true,
        verified,
        settings,
        ...(verified
          ? {}
          : {
              warning:
                "R2 accepted the request but the value could not be read back, so it likely did not persist. The CLOUDFLARE_API token probably needs R2 Object Read & Write permission (not read-only) for this bucket.",
            }),
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Could not save settings: ${String(err?.message || err)}` },
        { status: 500 },
      );
    }
  }

  const stored = await getStoredBookingSettings();
  const settings = await getBookingSettings();
  return NextResponse.json({
    ok: true,
    settings,
    r2Configured: isR2Configured(),
    persisted: stored !== null,
  });
}
