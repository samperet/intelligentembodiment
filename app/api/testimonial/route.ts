import { NextResponse } from "next/server";
import { addTestimonial, isR2Configured } from "@/lib/r2";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const quote = typeof body?.quote === "string" ? body.quote.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (quote.length < 10) {
    return NextResponse.json(
      { error: "Please share a little more about your experience." },
      { status: 400 },
    );
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email doesn't look right." },
      { status: 400 },
    );
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error:
          "Sharing isn't available right now. Please email your kind words directly.",
      },
      { status: 503 },
    );
  }

  try {
    await addTestimonial({ name, quote, email: email || undefined });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not save: ${String(err?.message || err)}` },
      { status: 500 },
    );
  }

  // Notify the practitioner (best-effort; never blocks the thank-you).
  try {
    await sendEmail({
      to: [process.env.OWNER_EMAIL || site.email],
      subject: `New testimonial from ${name} — pending approval`,
      html: `<p>A new testimonial was submitted and is awaiting your approval in the admin.</p>
             <p><strong>${escapeHtml(name)}</strong>${
               email ? ` &lt;${escapeHtml(email)}&gt;` : ""
             }</p>
             <blockquote style="border-left:3px solid #c0896d;padding-left:12px;color:#555">${escapeHtml(
               quote,
             )}</blockquote>`,
      text: `New testimonial from ${name}${email ? ` (${email})` : ""}:\n\n${quote}\n\nApprove it in /admin.`,
      replyTo: email || undefined,
    });
  } catch {
    /* ignore email failures */
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
