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

export type CreatedEvent = { id: string; htmlLink: string | null };

/** Create the booking on the practice calendar and invite the client. */
export async function createCalendarEvent(
  input: CreateBookingInput,
): Promise<CreatedEvent> {
  const calendar = getClient();
  const res = await calendar.events.insert({
    calendarId: getCalendarId(),
    sendUpdates: "all",
    requestBody: {
      summary: input.summary,
      description: input.description,
      location: input.location,
      start: { dateTime: input.start.toISOString(), timeZone: TIMEZONE },
      end: { dateTime: input.end.toISOString(), timeZone: TIMEZONE },
      attendees: [
        { email: input.attendeeEmail, displayName: input.attendeeName },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 120 },
        ],
      },
    },
  });
  return { id: res.data.id!, htmlLink: res.data.htmlLink ?? null };
}
