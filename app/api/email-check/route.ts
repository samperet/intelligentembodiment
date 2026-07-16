import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TEMPORARY diagnostic (deleted after use). Reports whether RESEND_API_KEY is
// present and what Resend returns for a send from the configured address.
// Uses Resend's test sink so no real inbox is emailed.
export async function GET() {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ||
    "Intelligent Embodiment <notifications@intelligentembodiment.com>";
  const ownerSet = Boolean(process.env.OWNER_EMAIL);

  if (!key) {
    return NextResponse.json({
      hasKey: false,
      from,
      ownerSet,
      note: "RESEND_API_KEY is not set in this deployment.",
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ["delivered@resend.dev"],
        subject: "Intelligent Embodiment email check",
        html: "<p>check</p>",
        text: "check",
      }),
    });
    const detail = await res.text();
    return NextResponse.json({
      hasKey: true,
      from,
      ownerSet,
      status: res.status,
      ok: res.ok,
      resend: detail.slice(0, 700),
    });
  } catch (err: any) {
    return NextResponse.json({ hasKey: true, from, ownerSet, threw: String(err) });
  }
}
