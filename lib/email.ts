// Optional transactional email via Resend (https://resend.com).
// If RESEND_API_KEY is unset this is a no-op, Google Calendar already emails
// the invite to both parties when the event is created.

// The verified "from" address. Override with EMAIL_FROM if desired; the
// domain must be verified in Resend.
const FROM =
  process.env.EMAIL_FROM ||
  "Intelligent Embodiment <notifications@intelligentembodiment.com>";

// Accept either RESEND_API_KEY (standard) or RESEND_API (fallback).
function resendKey(): string | undefined {
  return process.env.RESEND_API_KEY || process.env.RESEND_API;
}

export function isEmailConfigured(): boolean {
  return Boolean(resendKey());
}

type SendArgs = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  icsContent?: string;
  replyTo?: string;
};

export async function sendEmail(args: SendArgs): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  const body: Record<string, unknown> = {
    from: FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  };
  if (args.replyTo) body.reply_to = args.replyTo;
  if (args.icsContent) {
    body.attachments = [
      {
        filename: "appointment.ics",
        content: Buffer.from(args.icsContent).toString("base64"),
        content_type: "text/calendar; method=REQUEST",
      },
    ];
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `Resend send failed (${res.status}) from "${FROM}" to ${args.to.join(", ")}: ${detail}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend request threw:", err);
    return false;
  }
}
