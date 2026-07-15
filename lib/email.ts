// Optional transactional email via Resend (https://resend.com).
// If RESEND_API_KEY is unset this is a no-op — Google Calendar already emails
// the invite to both parties when the event is created.

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
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
    from: process.env.EMAIL_FROM,
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
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
