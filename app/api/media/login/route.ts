import { NextResponse } from "next/server";
import {
  mediaConfigured,
  mediaPasswordMatches,
  mediaSetCookie,
} from "@/lib/media";

export const dynamic = "force-dynamic";

// POST { password } → sign in to the listening room
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!mediaConfigured()) {
    return NextResponse.json(
      { error: "The listening room isn’t open yet." },
      { status: 503 },
    );
  }

  if (!mediaPasswordMatches(body?.password)) {
    // A small delay makes guessing slower without bothering real listeners.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json(
      { error: "That password doesn’t match. Please try again." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", mediaSetCookie());
  return res;
}
