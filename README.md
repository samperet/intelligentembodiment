# Intelligent Embodiment

Marketing site and online booking for **Intelligent Embodiment** — the somatic
bodywork practice of Mackensie Satya Priya Grant in Burlington, VT.
_"Awake in the Body."_

Clients can book a **60-minute ($120)** or **90-minute ($180)** massage, choose
an open time, and have the appointment written straight to the practice's
**Google Calendar** with an invitation emailed to both parties.

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Hosting:** Vercel (recommended) — connected to this GitHub repo
- **Calendar:** Google Calendar API via a service account
- **Assets:** self-contained (SVG mandala); optionally served from Cloudflare R2

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

The site works with **no configuration** in "demo mode": every working-hour
slot shows as open and bookings return success without touching a real
calendar. Add the Google credentials below to make bookings live.

## How booking works

1. **Client picks a session** (60 or 90 min) on `/book`.
2. **Picks a date** — only bookable weekdays (default Tue–Sat) are selectable.
3. `GET /api/availability` generates start times within working hours, removes
   anything that collides with existing calendar events (Google _free/busy_)
   plus a buffer, and respects a minimum lead time.
4. **Client picks a time and enters details**, then `POST /api/book`:
   - re-checks the slot is still open (double-booking guard),
   - creates the calendar event and invites the client,
   - optionally emails a confirmation with an `.ics` attachment.

All availability logic and business details live in **`lib/site.ts`** — edit
prices, hours, buffer, timezone, and bookable weekdays there.

---

## Setup: Google Calendar sync

The site writes to **one** calendar using a Google **service account** (no
per-visitor Google login required).

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create (or pick) a project.
2. **APIs & Services → Library → enable "Google Calendar API".**
3. **APIs & Services → Credentials → Create credentials → Service account.**
   Give it a name; no roles are required.
4. Open the service account → **Keys → Add key → JSON**. A key file downloads.
   From it you need `client_email` and `private_key`.
5. In **Google Calendar** (as Mackensie), open the target calendar's
   **Settings → Share with specific people → Add** the service account's
   `client_email`, with permission **"Make changes to events."**
6. Copy that calendar's ID from **Settings → Integrate calendar → Calendar ID**
   (often the account's email address).
7. Set the environment variables (locally in `.env.local`, and in Vercel):

   | Variable | Value |
   |---|---|
   | `GOOGLE_CLIENT_EMAIL` | the service account's `client_email` |
   | `GOOGLE_PRIVATE_KEY` | the `private_key` string (keep the `\n` escapes, wrap in quotes) |
   | `GOOGLE_CALENDAR_ID` | the calendar ID from step 6 |
   | `OWNER_EMAIL` | where practitioner notifications go |

> **Tip:** when pasting `GOOGLE_PRIVATE_KEY` into Vercel, paste the value with
> literal `\n` sequences and wrap the whole thing in double quotes. The code
> converts `\n` back into real newlines.

Once these are set, `calendarConnected` becomes `true` and bookings appear on
the calendar immediately.

## Optional: email confirmations (Resend)

Google already emails calendar invites. For branded confirmation emails, add a
free [Resend](https://resend.com) account:

- Verify your sending domain in Resend.
- Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `Intelligent Embodiment <hello@intelligentembodiment.com>`).

If these are unset, this feature is simply skipped.

## Optional: images on Cloudflare R2

The site ships with no bitmap images (the mandala is SVG), so R2 is optional.
To serve photography from R2:

1. Create an R2 bucket and enable its public `r2.dev` URL (or a custom domain).
2. Set `NEXT_PUBLIC_ASSET_HOST` to that host (e.g. `https://pub-xxxx.r2.dev`).
3. Reference images as `` `${process.env.NEXT_PUBLIC_ASSET_HOST}/photo.jpg` ``.
   `next.config.mjs` already allows `*.r2.dev` and `*.r2.cloudflarestorage.com`
   for the Next.js image optimizer.

---

## Deploying to Vercel

1. Push this repo to GitHub (already on branch
   `claude/embodiment-website-booking-fesh28`; merge to `main` when ready).
2. In [Vercel](https://vercel.com/new), **Import** the GitHub repo. Framework
   preset **Next.js** is auto-detected — no build settings needed.
3. Add the environment variables from the tables above under
   **Settings → Environment Variables** (Production + Preview).
4. Deploy. Then **Settings → Domains → add `intelligentembodiment.com`** and
   point your DNS at Vercel as instructed.

Every push to the connected branch creates a preview deploy; merges to the
production branch go live.

## Project structure

```
app/
  layout.tsx              Root layout, fonts, nav/footer
  page.tsx                Home (hero, sessions, about, CTA)
  book/page.tsx           Booking page
  api/availability/route.ts   GET open slots for a date + session
  api/book/route.ts           POST to create the booking
components/
  BookingWidget.tsx       Client booking flow (session → date/time → details)
  Nav.tsx, Footer.tsx, Mandala.tsx
lib/
  site.ts                 Business details, services, hours  ← edit here
  time.ts                 Timezone-safe date helpers (Intl-based)
  availability.ts         Slot generation + double-booking guard
  google.ts               Google Calendar service-account client
  ics.ts                  .ics invite builder
  email.ts                Optional Resend confirmations
```
