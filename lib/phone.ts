// Cell numbers on bookings, checked the same way in the form and on the server.

/**
 * A readable, checked cell number, or null if it doesn't look like one.
 * US/Canada numbers (10 digits, or 11 starting with 1) come back as
 * "(802) 555-0123"; numbers written with a leading "+" are accepted as
 * international ("+44 7700 900123" → "+447700900123").
 */
export function normalizeCell(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+") && !raw.startsWith("+1")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  const us = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (us.length !== 10 || /^[01]/.test(us)) return null;
  return `(${us.slice(0, 3)}) ${us.slice(3, 6)}-${us.slice(6)}`;
}
