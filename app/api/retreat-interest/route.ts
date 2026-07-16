import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { retreatClientEmail, retreatOwnerEmail } from "@/lib/emails";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const owner = process.env.OWNER_EMAIL || site.email;

  // Always log so the signup is captured in server logs even if email isn't
  // configured yet. When Resend is set up, the owner also gets an email.
  console.log(`Retreat interest signup: ${name} <${email}>`);

  // Notify the practitioner.
  const ownerMail = retreatOwnerEmail({ name, email });
  await sendEmail({
    to: [owner],
    subject: ownerMail.subject,
    html: ownerMail.html,
    text: ownerMail.text,
    replyTo: email,
  });

  // Confirm to the subscriber.
  const clientMail = retreatClientEmail({ name });
  await sendEmail({
    to: [email],
    subject: clientMail.subject,
    html: clientMail.html,
    text: clientMail.text,
    replyTo: site.email,
  });

  return NextResponse.json({ ok: true, notified: isEmailConfigured() });
}
