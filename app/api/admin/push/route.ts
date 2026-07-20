import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import {
  isR2Configured,
  addPushSubscription,
  removePushSubscription,
} from "@/lib/r2";
import { sendPushToAdmins, pushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";

// POST { action: "subscribe", subscription }  → store this device's push sub
// POST { action: "unsubscribe", endpoint }    → remove it
// POST { action: "test" }                      → send a test notification
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isAuthorized(request, body?.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const action = body?.action;

  if (action === "subscribe") {
    if (!pushConfigured()) {
      return NextResponse.json(
        { error: "Notifications aren’t configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY." },
        { status: 400 },
      );
    }
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "R2 isn’t configured, so subscriptions can’t be stored." },
        { status: 400 },
      );
    }
    if (!body?.subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
    }
    try {
      await addPushSubscription(body.subscription);
      return NextResponse.json({ ok: true });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Could not save: ${String(err?.message || err)}` },
        { status: 500 },
      );
    }
  }

  if (action === "unsubscribe") {
    if (typeof body?.endpoint === "string") {
      await removePushSubscription(body.endpoint).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "test") {
    const sent = await sendPushToAdmins({
      title: "Intelligent Embodiment",
      body: "Test notification — you’re all set 🌿",
      url: "/admin",
      tag: "ie-test",
    });
    return NextResponse.json({ ok: true, sent });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
