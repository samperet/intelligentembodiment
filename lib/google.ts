import { google, type calendar_v3 } from "googleapis";
import { TIMEZONE } from "./site";

export type BusyInterval = { start: Date; end: Date };

/** True when Google service-account credentials are present in the env. */
export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_CALENDAR_ID,
  );
}

function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || "primary";
}

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // Private keys stored in env keep their newlines as literal "\n".
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n",
  );
  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credentials are not configured.");
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function getClient(): calendar_v3.Calendar {
  return google.calendar({ version: "v3", auth: getAuth() });
}

/**
 * Busy intervals on the practice calendar between two instants.
 * Resilient by design: if the Google credentials are missing OR the Calendar
 * call fails (bad key, calendar not shared, API disabled, transient outage),
 * this returns [] so the booking page still shows open times instead of
 * breaking. The failure is logged, and createCalendarEvent will surface the
 * real problem at booking time.
 */
export async function getBusyIntervals(
  timeMin: Date,
  timeMax: Date,
): Promise<BusyInterval[]> {
  if (!isGoogleConfigured()) return [];
  try {
    const calendar = getClient();
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: TIMEZONE,
        items: [{ id: getCalendarId() }],
      },
    });
    const cal = res.data.calendars?.[getCalendarId()];
    if (cal?.errors?.length) {
      // e.g. calendar not shared with the service account ("notFound").
      console.error("Google Calendar freebusy errors:", cal.errors);
      return [];
    }
    const busy = cal?.busy ?? [];
    return busy
      .filter((b) => b.start && b.end)
      .map((b) => ({ start: new Date(b.start!), end: new Date(b.end!) }));
  } catch (err) {
    console.error("Google Calendar freebusy failed; serving open slots:", err);
    return [];
  }
}

export type CreateBookingInput = {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  attendeeName: string;
  attendeeEmail: string;
  location?: string;
};

export type CreatedEvent = {
  id: string;
  htmlLink: string | null;
  /** Whether Google also emailed the client an invitation. */
  invited: boolean;
};

/**
 * Google refuses attendee invitations from a service account unless it has
 * Workspace domain-wide delegation, which a personal Gmail calendar can't
 * grant. That must never keep the booking off the calendar.
 */
function isInviteRefusal(err: unknown): boolean {
  const e = err as { code?: number; message?: string; errors?: { reason?: string }[] };
  return (
    e?.code === 403 &&
    (/delegation|invite attendees/i.test(e.message || "") ||
      (e.errors || []).some((x) => x.reason === "forbiddenForServiceAccounts"))
  );
}

/**
 * Create the booking on the practice calendar. Tries to invite the client
 * too; if Google won't allow that, creates the event without the invitation
 * (the client still gets the site's own confirmation email).
 */
export async function createCalendarEvent(
  input: CreateBookingInput,
): Promise<CreatedEvent> {
  const calendar = getClient();
  const requestBody: calendar_v3.Schema$Event = {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: { dateTime: input.start.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: input.end.toISOString(), timeZone: TIMEZONE },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 120 },
      ],
    },
  };
  try {
    const res = await calendar.events.insert({
      calendarId: getCalendarId(),
      sendUpdates: "all",
      requestBody: {
        ...requestBody,
        attendees: [{ email: input.attendeeEmail, displayName: input.attendeeName }],
      },
    });
    return { id: res.data.id!, htmlLink: res.data.htmlLink ?? null, invited: true };
  } catch (err) {
    if (!isInviteRefusal(err)) throw err;
    const res = await calendar.events.insert({
      calendarId: getCalendarId(),
      sendUpdates: "none",
      requestBody,
    });
    return { id: res.data.id!, htmlLink: res.data.htmlLink ?? null, invited: false };
  }
}

export type CalendarCheck = { ok: boolean; message: string };

/**
 * Prove the booking calendar works end to end: read free/busy, then create
 * and immediately delete a private test event (no guests, no notifications).
 */
export async function checkCalendar(): Promise<CalendarCheck> {
  if (!isGoogleConfigured()) {
    return {
      ok: false,
      message:
        "Google Calendar isn't set up: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_CALENDAR_ID are needed.",
    };
  }
  const calendarId = getCalendarId();
  let calendar: calendar_v3.Calendar;
  try {
    calendar = getClient();
    const now = new Date();
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: new Date(now.getTime() + 86400000).toISOString(),
        items: [{ id: calendarId }],
      },
    });
    const errs = fb.data.calendars?.[calendarId]?.errors;
    if (errs?.length) {
      return {
        ok: false,
        message:
          errs[0].reason === "notFound"
            ? `The calendar ${calendarId} isn't shared with the booking service account (${process.env.GOOGLE_CLIENT_EMAIL}). Share it with "Make changes to events" permission.`
            : `Google couldn't read the calendar: ${errs.map((e) => e.reason).join(", ")}.`,
      };
    }
  } catch (err: any) {
    return { ok: false, message: `Google rejected the connection: ${String(err?.message || err)}` };
  }

  try {
    // A quiet hour well in the future, removed right away.
    const start = new Date(Date.now() + 400 * 86400000);
    start.setUTCHours(8, 0, 0, 0);
    const created = await calendar.events.insert({
      calendarId,
      sendUpdates: "none",
      requestBody: {
        summary: "Website booking test (auto-deleted)",
        start: { dateTime: start.toISOString() },
        end: { dateTime: new Date(start.getTime() + 15 * 60000).toISOString() },
        reminders: { useDefault: false },
      },
    });
    await calendar.events.delete({ calendarId, eventId: created.data.id!, sendUpdates: "none" });
  } catch (err: any) {
    return {
      ok: false,
      message: `The calendar can be read but not written to. Give the service account "Make changes to events" permission. (${String(err?.message || err)})`,
    };
  }

  return { ok: true, message: `Connected: bookings will be added to ${calendarId}.` };
}
