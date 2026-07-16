// ─────────────────────────────────────────────────────────────────────────────
// Branded transactional email templates (booking + retreat newsletter).
// Table-based, inline-styled HTML for broad email-client support, matching the
// site's copper / indigo / cream palette. Each builder returns { subject,
// html, text }.
// ─────────────────────────────────────────────────────────────────────────────

import { site } from "./site";

// Direct (non-redirecting) asset host so email clients render the image.
// The apex domain 308-redirects, which some clients won't follow for images.
const MANDALA = "https://www.intelligentembodiment.com/mandala.png";

// Palette (from the design system)
const COPPER = "#A66B4E";
const INDIGO = "#3A366F";
const INK = "#211F33";
const INK_SOFT = "#5B5772";
const MUTED = "#9A927F";
const PAPER = "#F1EAE0";
const CARD = "#FCF9F3";
const BORDER = "#E7DDCF";

const P = `font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${INK_SOFT};`;

export type Email = { subject: string; html: string; text: string };

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstName(name: string): string {
  return (name.trim().split(/\s+/)[0] || name).trim();
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${COPPER};width:110px;vertical-align:top;">${label}</td>
    <td style="padding:9px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.5;color:${INK};vertical-align:top;">${value}</td>
  </tr>`;
}

function signature(): string {
  return `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:17px;color:${COPPER};text-align:center;margin:28px 0 0;">With care,<br>Mackensie Satya Priya</p>`;
}

function shell(opts: {
  preheader: string;
  eyebrow: string;
  heading: string;
  inner: string;
}): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAPER};">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
    <tr><td align="center" style="padding:36px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

        <tr><td align="center" style="padding:4px 0 26px;">
          <img src="${MANDALA}" width="58" height="58" alt="" style="display:block;margin:0 auto 12px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;letter-spacing:3px;color:${INDIGO};text-transform:uppercase;">Intelligent&nbsp;Embodiment</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:${COPPER};margin-top:5px;">Awake in the Body</div>
        </td></tr>

        <tr><td style="background:${CARD};border:1px solid ${BORDER};border-radius:14px;padding:40px 38px 34px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${COPPER};text-align:center;">${esc(opts.eyebrow)}</div>
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:31px;line-height:1.15;color:${INK};text-align:center;margin:10px 0 24px;">${opts.heading}</h1>
          ${opts.inner}
        </td></tr>

        <tr><td align="center" style="padding:26px 20px 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.8;color:${INK_SOFT};">
          <a href="${site.phoneHref}" style="color:${INK_SOFT};text-decoration:none;">${site.phone}</a>
          &nbsp;&nbsp;&middot;&nbsp;&nbsp;
          <a href="mailto:${site.email}" style="color:${INK_SOFT};text-decoration:none;">${site.email}</a>
          <br>${esc(site.address)}
        </td></tr>
        <tr><td align="center" style="padding:2px 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};">© ${year} Intelligent Embodiment</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Booking: confirmation to the client ──────────────────────────────────────
export function bookingClientEmail(o: {
  name: string;
  service: string;
  price: number;
  when: string;
}): Email {
  const inner = `
    <p style="${P}text-align:center;margin:0 0 24px;">Dear ${esc(firstName(o.name))}, thank you for booking. I look forward to meeting you on the table.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};margin:0 0 22px;">
      ${detailRow("Session", `${esc(o.service)} &nbsp;&middot;&nbsp; $${o.price}`)}
      ${detailRow("When", esc(o.when))}
      ${detailRow("Where", esc(site.address))}
    </table>
    <p style="${P}text-align:center;font-size:13px;margin:0;">A calendar invitation is attached. Need to change your time? Simply reply to this email or call ${site.phone}.</p>
    ${signature()}`;
  return {
    subject: `Confirmed: ${o.service} on ${o.when}`,
    html: shell({
      preheader: `Your ${o.service} is confirmed for ${o.when}.`,
      eyebrow: "Your session is confirmed",
      heading: "You’re booked",
      inner,
    }),
    text: `Dear ${firstName(o.name)},

Thank you for booking. Your ${o.service} ($${o.price}) is confirmed for ${o.when} at ${site.address}.

A calendar invitation is attached. To reschedule, reply to this email or call ${site.phone}.

With care,
Mackensie Satya Priya
Intelligent Embodiment`,
  };
}

// ── Booking: notification to the practitioner ────────────────────────────────
export function bookingOwnerEmail(o: {
  name: string;
  email: string;
  phone?: string;
  service: string;
  price: number;
  when: string;
  notes?: string;
}): Email {
  const rows = [
    detailRow("Client", esc(o.name)),
    detailRow(
      "Email",
      `<a href="mailto:${esc(o.email)}" style="color:${INDIGO};">${esc(o.email)}</a>`,
    ),
    o.phone ? detailRow("Phone", esc(o.phone)) : "",
    detailRow("Session", `${esc(o.service)} &nbsp;&middot;&nbsp; $${o.price}`),
    detailRow("When", esc(o.when)),
    o.notes ? detailRow("Notes", esc(o.notes)) : "",
  ].join("");
  const inner = `
    <p style="${P}text-align:center;margin:0 0 24px;">A new session has been booked.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
      ${rows}
    </table>
    <p style="${P}text-align:center;font-size:13px;margin:22px 0 0;">The event has been added to your calendar. Reply to reach ${esc(firstName(o.name))} directly.</p>`;
  return {
    subject: `New booking: ${o.service}, ${o.name} (${o.when})`,
    html: shell({
      preheader: `${o.name} booked a ${o.service} for ${o.when}.`,
      eyebrow: "New booking",
      heading: "A new session",
      inner,
    }),
    text: `New booking\n\nClient: ${o.name}\nEmail: ${o.email}${o.phone ? `\nPhone: ${o.phone}` : ""}\nSession: ${o.service} ($${o.price})\nWhen: ${o.when}${o.notes ? `\nNotes: ${o.notes}` : ""}`,
  };
}

// ── Retreat newsletter: confirmation to the subscriber ───────────────────────
export function retreatClientEmail(o: { name: string }): Email {
  const inner = `
    <p style="${P}text-align:center;margin:0 0 18px;">Dear ${esc(firstName(o.name))}, thank you for your interest.</p>
    <p style="${P}text-align:center;margin:0 0 6px;">You&rsquo;ll be among the first to hear when a new retreat, women&rsquo;s circle, or immersion opens. There is nothing scheduled just yet, but beautiful gatherings are always taking shape. Until then, be well.</p>
    ${signature()}`;
  return {
    subject: "You’re on the list — Intelligent Embodiment retreats",
    html: shell({
      preheader: "We’ll be in touch when a new retreat opens.",
      eyebrow: "Retreats",
      heading: "You’re on the list",
      inner,
    }),
    text: `Dear ${firstName(o.name)},

Thank you for your interest. You'll be among the first to hear when a new retreat, women's circle, or immersion opens. Nothing is scheduled just yet, but beautiful gatherings are always taking shape. Until then, be well.

With care,
Mackensie Satya Priya
Intelligent Embodiment`,
  };
}

// ── Retreat newsletter: notification to the practitioner ─────────────────────
export function retreatOwnerEmail(o: { name: string; email: string }): Email {
  const inner = `
    <p style="${P}text-align:center;margin:0 0 24px;">Someone would like to hear about future retreats.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
      ${detailRow("Name", esc(o.name))}
      ${detailRow("Email", `<a href="mailto:${esc(o.email)}" style="color:${INDIGO};">${esc(o.email)}</a>`)}
    </table>`;
  return {
    subject: `New retreat interest: ${o.name}`,
    html: shell({
      preheader: `${o.name} joined the retreat list.`,
      eyebrow: "Retreats",
      heading: "New retreat interest",
      inner,
    }),
    text: `New retreat interest\n\nName: ${o.name}\nEmail: ${o.email}`,
  };
}
