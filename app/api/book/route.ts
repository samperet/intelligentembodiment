import { NextResponse } from "next/server";
import { getService, isServiceBookable, site, TIMEZONE } from "@/lib/site";
import {
  createCalendarEvent,
  isGoogleConfigured,
} from "@/lib/google";
import { isSlotStillOpen } from "@/lib/availability";
import { getBookingSettings } from "@/lib/r2";
import { sendPushToAdmins } from "@/lib/push";
import { buildICS } from "@/lib/ics";
import { sendEmail } from "@/lib/email";
import { bookingClientEmail, bookingOwnerEmail } from "@/lib/emails";
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
  // Campaign attribution (utm tags captured on the client). Optional.
  const source =
    typeof payload?.source === "string" && payload.source.trim()
      ? payload.source.trim().slice(0, 200)
      : null;

  // ── Validation ──────────────────────────────────────────────────────────
  const service = getService(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Please choose a session." }, { status: 400 });
  }

  // ── Booking window (per category) ─────────────────────────────────────────
  const settings = await getBookingSettings();
  if (!isServiceBookable(service, settings)) {
    return NextResponse.json(
      {
        error:
          service.category === "phone"
            ? "Initial consults aren’t being booked online right now. Please call or text to arrange one."
            : "New massage appointments aren’t being booked online right now. Please call or text to arrange one.",
      },
      { status: 403 },
    );
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
    source ? `Source: ${source}` : null,
  ].filter(Boolean);
  const description = descriptionLines.join("\n");

  // ── Book it ─────────────────────────────────────────────────────────────
  try {
    let eventLink: string | null = null;

    if (isGoogleConfigured()) {
      // Guard against a double-book between availability load and submit.
      const open = await isSlotStillOpen(startDate, service);
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

    // Confirmation to the client (with the calendar invite attached).
    const clientEmail = bookingClientEmail({
      name: name.trim(),
      service: service.name,
      price: service.price,
      when: whenLabel,
    });
    await sendEmail({
      to: [email],
      subject: clientEmail.subject,
      html: clientEmail.html,
      text: clientEmail.text,
      icsContent: ics,
      replyTo: site.email,
    });

    // Notification to the practitioner.
    const ownerEmail = bookingOwnerEmail({
      name: name.trim(),
      email,
      phone,
      service: service.name,
      price: service.price,
      when: whenLabel,
      notes: source ? `${notes ? `${notes}\n` : ""}Source: ${source}` : notes,
    });
    await sendEmail({
      to: [process.env.OWNER_EMAIL || site.email],
      subject: ownerEmail.subject,
      html: ownerEmail.html,
      text: ownerEmail.text,
      icsContent: ics,
      replyTo: email,
    });

    // Push notification to the practitioner's installed admin app.
    try {
      await sendPushToAdmins({
        title: `New booking · ${service.name}`,
        body: `${name.trim()} — ${whenLabel}${source ? ` (via ${source})` : ""}`,
        url: "/admin",
        tag: `booking-${startDate.getTime()}`,
      });
    } catch {
      /* never block the booking on a push failure */
    }

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
