import { NextResponse } from "next/server";
import { passwordMatches, adminSetCookie, adminClearCookie } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// POST { value } — value is either the exact password (form) or a buffer of
// keystrokes ending with it (the type-anywhere hidden login). On a match we
// set the session cookie so /admin loads without prompting again.
export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin is not configured." },
      { status: 500 },
    );
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!passwordMatches(body?.value)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", adminSetCookie());
  return res;
}

// DELETE — sign out (clear the session cookie).
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", adminClearCookie());
  return res;
}
