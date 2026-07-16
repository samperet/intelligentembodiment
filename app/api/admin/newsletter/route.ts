import { NextResponse } from "next/server";
import { isR2Configured, listSubscribers, r2Bucket } from "@/lib/r2";
import { isAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) {
    return NextResponse.json(
      { error: "Admin is not configured. Set ADMIN_PASSWORD in the environment." },
      { status: 500 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isAuthorized(request, body?.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json({
      ok: true,
      r2Configured: false,
      entries: [],
      note: "R2 is not configured. Set CLOUDFLARE_API, CLOUDFLARE_ACCOUNT_ID, and R2_BUCKET.",
    });
  }

  try {
    const entries = await listSubscribers();
    return NextResponse.json({
      ok: true,
      r2Configured: true,
      bucket: r2Bucket(),
      count: entries.length,
      entries,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        r2Configured: true,
        entries: [],
        error: `Could not read from R2: ${String(err?.message || err)}`,
      },
      { status: 500 },
    );
  }
}
