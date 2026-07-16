import { NextResponse } from "next/server";
import { getService, site, TIMEZONE } from "@/lib/site";
import {
  createCalendarEvent,
  isGoogleConfigured,
} from "@/lib/google";
import { isSlotStillOpen } from "@/lib/availability";
import { buildICS } from "@/lib/ics";
import { sendEmail } from "@/lib/email";
import { formatInTimeZone } from "@/lib/time";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { serviceId, start, name, email, phone, notes } = payload ?? {};

  // ── Validation ──────────────────────────────────────────────────────────
  const service = getService(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Please choose a session." }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }
  const startDate = new Date(start);
  if (!start || Number.isNaN(startDate.getTime())) {
    return NextResponse.json(
      { error: "Please choose a time." },
      { status: 400 },
    );
  }
  if (startDate.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "That time is in the past. Please pick another." },
      { status: 400 },
    );
  }

  const endDate = new Date(
    startDate.getTime() + service.durationMinutes * 60 * 1000,
  );

  const whenLabel = `${formatInTimeZone(startDate, TIMEZONE, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })} at ${formatInTimeZone(startDate, TIMEZONE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;

  const summary = `${service.name}, ${name.trim()}`;
  const descriptionLines = [
    `Booking via ${site.url}`,
    `Session: ${service.name} ($${service.price})`,
    `Client: ${name.trim()}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    notes ? `Notes: ${notes}` : null,
  ].filter(Boolean);
  const description = descriptionLines.join("\n");

  // ── Book it ─────────────────────────────────────────────────────────────
  try {
    let eventLink: string | null = null;

    if (isGoogleConfigured()) {
      // Guard against a double-book between availability load and submit.
      const open = await isSlotStillOpen(startDate, service.durationMinutes);
      if (!open) {
        return NextResponse.json(
          {
            error:
              "Sorry, that time was just taken. Please choose another slot.",
          },
          { status: 409 },
        );
      }
      try {
        const created = await createCalendarEvent({
          summary,
          description,
          start: startDate,
          end: endDate,
          attendeeName: name.trim(),
          attendeeEmail: email,
          location: site.address,
        });
        eventLink = created.htmlLink;
      } catch (calErr) {
        // Calendar is misconfigured (bad key / not shared / API off). Don't
        // fail the booking — fall through to the email/ICS fallback so the
        // request still reaches the practitioner.
        console.error("createCalendarEvent failed; using email fallback:", calErr);
      }
    }

    // Build an ICS invite and (optionally) send confirmation emails. When
    // Google is connected it already emails invites; this is a belt-and-braces
    // copy and the primary channel when Google isn't configured yet.
    const ics = buildICS({
      uid: `${startDate.getTime()}-${service.id}@intelligentembodiment.com`,
      summary,
      description,
      location: site.address,
      start: startDate,
      end: endDate,
      organizerEmail: process.env.OWNER_EMAIL || site.email,
      attendeeEmail: email,
      attendeeName: name.trim(),
    });

    const clientHtml = confirmationHtml({
      name: name.trim(),
      service: service.name,
      price: service.price,
      when: whenLabel,
      address: site.address,
    });
    const clientText = `Hi ${name.trim()},\n\nYour ${service.name} with ${site.practitioner} is confirmed for ${whenLabel} at ${site.address}.\n\nWith care,\n${site.name}`;

    await sendEmail({
      to: [email],
      subject: `Confirmed: ${service.name} on ${formatInTimeZone(startDate, TIMEZONE, { month: "short", day: "numeric" })}`,
      html: clientHtml,
      text: clientText,
      icsContent: ics,
      replyTo: site.email,
    });

    // Notify the practitioner (in addition to the calendar invite).
    await sendEmail({
      to: [process.env.OWNER_EMAIL || site.email],
      subject: `New booking: ${service.name}, ${name.trim()} (${whenLabel})`,
      html: `<p>New booking received.</p><pre>${description}</pre>`,
      text: `New booking received.\n\n${description}`,
      icsContent: ics,
      replyTo: email,
    });

    return NextResponse.json({
      ok: true,
      when: whenLabel,
      service: service.name,
      price: service.price,
      calendarConnected: isGoogleConfigured(),
      eventLink,
    });
  } catch (err) {
    console.error("booking error", err);
    return NextResponse.json(
      {
        error:
          "We couldn't complete your booking. Please try again, or call to book directly.",
      },
      { status: 500 },
    );
  }
}

function confirmationHtml(o: {
  name: string;
  service: string;
  price: number;
  when: string;
  address: string;
}): string {
  return `
  <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3a2e26">
    <h2 style="color:#9a5632;font-weight:500">Your session is confirmed</h2>
    <p>Dear ${o.name},</p>
    <p>Thank you for booking. I look forward to meeting you on the table.</p>
    <table style="margin:20px 0;font-family:Arial,sans-serif;font-size:14px">
      <tr><td style="padding:4px 16px 4px 0;color:#9a5632">Session</td><td>${o.service} ($${o.price})</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#9a5632">When</td><td>${o.when}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#9a5632">Where</td><td>${o.address}</td></tr>
    </table>
    <p style="font-size:13px;color:#6b5b4d">A calendar invitation is attached. If you need to reschedule, simply reply to this email.</p>
    <p style="margin-top:24px">With care,<br/>${site.practitioner}<br/><em>${site.name}</em></p>
  </div>`;
}
