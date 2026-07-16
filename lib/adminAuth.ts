// Shared admin auth: a session cookie whose value is a hash of ADMIN_PASSWORD.
// The plaintext password is never sent back to the client, and the cookie is
// HttpOnly so client JS can't read it either.
import { createHash } from "crypto";

const COOKIE_NAME = "ie_admin";

/** A stable, non-reversible token derived from the configured password. */
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`ie:${pw}`).digest("hex");
}

/** True when the request carries a valid admin session cookie. */
export function isAdminRequest(request: Request): boolean {
  const token = adminToken();
  if (!token) return false;
  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)ie_admin=([^;]+)/);
  return Boolean(m && m[1] === token);
}

/** True if `value` is (or ends with) the admin password — powers both the
 *  explicit form and the type-anywhere hidden login. */
export function passwordMatches(value: unknown): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(
    pw &&
      typeof value === "string" &&
      value.length > 0 &&
      (value === pw || value.endsWith(pw)),
  );
}

/** Authorized if a valid session cookie is present OR an exact password is
 *  posted in the request body (back-compat with the form's direct posts). */
export function isAuthorized(request: Request, postedPassword?: unknown): boolean {
  if (isAdminRequest(request)) return true;
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(
    pw && typeof postedPassword === "string" && postedPassword === pw,
  );
}

export function adminSetCookie(): string {
  const token = adminToken();
  if (!token) return "";
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=2592000", // 30 days
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function adminClearCookie(): string {
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}
