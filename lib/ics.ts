import { site } from "./site";

function toICSDate(d: Date): string {
  // UTC basic format: YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildICS(opts: {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(opts.start)}`,
    `DTEND:${toICSDate(opts.end)}`,
    `SUMMARY:${escapeICS(opts.summary)}`,
    `DESCRIPTION:${escapeICS(opts.description)}`,
    `LOCATION:${escapeICS(opts.location)}`,
    `ORGANIZER;CN=${escapeICS(site.name)}:mailto:${opts.organizerEmail}`,
    `ATTENDEE;CN=${escapeICS(opts.attendeeName)};RSVP=TRUE:mailto:${opts.attendeeEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // ICS wants CRLF line endings.
  return lines.join("\r\n");
}
