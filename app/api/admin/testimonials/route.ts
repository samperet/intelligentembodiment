import { NextResponse } from "next/server";
import {
  isR2Configured,
  listTestimonials,
  setTestimonialStatus,
  deleteTestimonial,
} from "@/lib/r2";
import { isAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// POST { password? }                    → list all submissions
// POST { password?, id, status }        → set status (approved|rejected|pending)
// POST { password?, id, action:"delete"} → delete a submission
export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
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
    if (body?.action === "delete" && typeof body?.id === "string") {
      const entries = await deleteTestimonial(body.id);
      return NextResponse.json({ ok: true, entries });
    }
    if (
      typeof body?.id === "string" &&
      ["pending", "approved", "rejected"].includes(body?.status)
    ) {
      const entries = await setTestimonialStatus(body.id, body.status);
      return NextResponse.json({ ok: true, entries });
    }
    const entries = await listTestimonials();
    return NextResponse.json({ ok: true, r2Configured: true, entries });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not access testimonials: ${String(err?.message || err)}` },
      { status: 500 },
    );
  }
}
