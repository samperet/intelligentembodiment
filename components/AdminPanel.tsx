"use client";

import { useState, useEffect } from "react";
import { AdminNotifications } from "./AdminNotifications";
import { AdminContent } from "./AdminContent";

type Subscriber = { name: string; email: string; date: string };
type TestimonialStatus = "pending" | "approved" | "rejected";
type TestimonialSub = {
  id: string;
  name: string;
  quote: string;
  email?: string;
  date: string;
  status: TestimonialStatus;
};
type BookingSettings = {
  acceptingMassage: boolean;
  acceptingPhone: boolean;
  weekdays: number[];
  dayStartHour: number;
  dayEndHour: number;
  slotIntervalMinutes: number;
  bufferMinutes: number;
  bookingWindowDays: number;
  minLeadHours: number;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function hourLabel(h: number): string {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [entries, setEntries] = useState<Subscriber[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [settingsOk, setSettingsOk] = useState(false);
  const [persisted, setPersisted] = useState<boolean | null>(null);

  const [copied, setCopied] = useState(false);
  const [booting, setBooting] = useState(true);

  const [testimonials, setTestimonials] = useState<TestimonialSub[]>([]);
  const [tBusy, setTBusy] = useState<string | null>(null);

  // Auto-authenticate from the session cookie (set by the hidden type-anywhere
  // login or a previous sign-in) so no password prompt is needed.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.authed) return load("");
        setBooting(false);
      })
      .catch(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function authenticate(value: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Incorrect password.");
      await load(""); // cookie is set now; load via session
    } catch (e: any) {
      setError(e.message);
      setAuthed(false);
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setEntries([]);
    setSettings(null);
    setPassword("");
  }

  async function testimonialAction(
    id: string,
    payload: { status?: TestimonialStatus; action?: "delete" },
  ) {
    setTBusy(id);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id, ...payload }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.entries)) setTestimonials(data.entries);
    } catch {
      /* ignore */
    } finally {
      setTBusy(null);
    }
  }

  async function load(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const [subsRes, setRes, tRes] = await Promise.all([
        fetch("/api/admin/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        }),
        fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        }),
      ]);
      const subs = await subsRes.json();
      if (!subsRes.ok) throw new Error(subs.error || "Something went wrong.");
      const set = await setRes.json();
      const tj = await tRes.json();
      setEntries(subs.entries || []);
      setNote(subs.error || subs.note || null);
      if (set?.settings) setSettings(set.settings);
      setPersisted(typeof set?.persisted === "boolean" ? set.persisted : null);
      setTestimonials(Array.isArray(tj?.entries) ? tj.entries : []);
      setAuthed(true);
    } catch (e: any) {
      setError(e.message);
      setAuthed(false);
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    setSettingsMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      // data.settings is the value read back from R2, so the editor now
      // reflects exactly what persisted.
      if (data.settings) setSettings(data.settings);
      if (data.verified === false) {
        setSettingsOk(false);
        setPersisted(false);
        setSettingsMsg(
          data.warning ||
            "Saved, but the value could not be read back — it may not have persisted.",
        );
      } else {
        setSettingsOk(true);
        setPersisted(true);
        setSettingsMsg("Saved.");
      }
    } catch (e: any) {
      setSettingsOk(false);
      setSettingsMsg(e.message);
    } finally {
      setSavingSettings(false);
    }
  }

  function set<K extends keyof BookingSettings>(key: K, value: BookingSettings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
    setSettingsMsg(null);
  }

  function toggleDay(d: number) {
    if (!settings) return;
    const has = settings.weekdays.includes(d);
    const next = has
      ? settings.weekdays.filter((x) => x !== d)
      : [...settings.weekdays, d].sort((a, b) => a - b);
    set("weekdays", next);
  }

  async function copyEmails() {
    const emails = entries.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
    } catch {
      // Fallback for browsers without clipboard permission.
      const ta = document.createElement("textarea");
      ta.value = emails;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function csv() {
    const rows = [
      ["Name", "Email", "Date"],
      ...entries.map((s) => [s.name, s.email, s.date]),
    ];
    const out = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([out], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (booting) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm items-center justify-center px-6">
        <p className="font-sans text-[16px] text-ink-400">Loading…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
        <h1 className="text-center font-serif text-[36px] text-ink-900">Admin</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            authenticate(password);
          }}
          className="mt-8 space-y-4"
        >
          <label className="block">
            <span className="field-label">Password</span>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-copper-50 px-4 py-3 font-sans text-[16px] text-copper-900">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary btn-md w-full">
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={signOut}
          className="font-sans text-[15px] text-ink-400 underline transition hover:text-copper-800"
        >
          Sign out
        </button>
      </div>
      {/* ── Booking availability ─────────────────────────────────────────── */}
      <section>
        <h1 className="font-serif text-[34px] text-ink-900">
          Booking Availability
        </h1>
        <p className="mt-1 font-sans text-[16px] text-ink-500">
          When clients are allowed to book. Times are in the practice timezone
          (Eastern).
        </p>
        {persisted === false && (
          <p className="mt-3 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[16px] text-copper-900">
            These are the built-in defaults, nothing is saved to R2 yet. If a
            save doesn&apos;t stick, the CLOUDFLARE_API token likely needs R2
            Object Read &amp; Write permission for this bucket.
          </p>
        )}

        {settings && (
          <div className="mt-6 space-y-6 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
            <div className="space-y-3">
              <Toggle
                label="Accepting massage clients"
                on={settings.acceptingMassage}
                onText="60 & 90 minute massage sessions are bookable online."
                offText="Massage booking is paused — visitors are asked to call."
                onToggle={() => set("acceptingMassage", !settings.acceptingMassage)}
              />
              <Toggle
                label="Accepting initial consults"
                on={settings.acceptingPhone}
                onText="Initial consults are bookable online."
                offText="Initial consults are paused — visitors are asked to call."
                onToggle={() => set("acceptingPhone", !settings.acceptingPhone)}
              />
            </div>

            <div>
              <span className="field-label">Bookable days</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {DAYS.map((label, d) => {
                  const on = settings.weekdays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`rounded-full border px-4 py-2 font-sans text-[15px] transition ${
                        on
                          ? "border-copper-800 bg-copper-700 text-white"
                          : "border-[color:var(--border-strong)] bg-white text-ink-700 hover:border-copper-700"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label={`Opens — ${hourLabel(settings.dayStartHour)}`}
                value={settings.dayStartHour}
                min={0}
                max={23}
                onChange={(v) => set("dayStartHour", v)}
              />
              <NumberField
                label={`Closes — ${hourLabel(settings.dayEndHour)}`}
                value={settings.dayEndHour}
                min={1}
                max={24}
                onChange={(v) => set("dayEndHour", v)}
              />
              <SelectField
                label="Time-slot interval (min)"
                value={settings.slotIntervalMinutes}
                options={[15, 20, 30, 45, 60]}
                onChange={(v) => set("slotIntervalMinutes", v)}
              />
              <NumberField
                label="Buffer between sessions (min)"
                value={settings.bufferMinutes}
                min={0}
                max={120}
                onChange={(v) => set("bufferMinutes", v)}
              />
              <NumberField
                label="Book up to (days ahead)"
                value={settings.bookingWindowDays}
                min={1}
                max={365}
                onChange={(v) => set("bookingWindowDays", v)}
              />
              <NumberField
                label="Minimum notice (hours)"
                value={settings.minLeadHours}
                min={0}
                max={720}
                onChange={(v) => set("minLeadHours", v)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={saveSettings}
                disabled={savingSettings}
                className="btn btn-primary btn-md"
              >
                {savingSettings ? "Saving…" : "Save availability"}
              </button>
              {settingsMsg && (
                <span
                  className={`font-sans text-[16px] ${
                    settingsOk ? "text-sage" : "text-copper-900"
                  }`}
                >
                  {settingsMsg}
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Appointment notifications ────────────────────────────────────── */}
      <AdminNotifications />

      {/* ── Writings & recipes editor ────────────────────────────────────── */}
      <AdminContent />

      {/* ── Testimonials approval ────────────────────────────────────────── */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-[28px] text-ink-900">Testimonials</h2>
            <p className="mt-1 font-sans text-[15px] text-ink-500">
              {testimonials.filter((t) => t.status === "pending").length} awaiting
              review · {testimonials.filter((t) => t.status === "approved").length}{" "}
              published
            </p>
          </div>
        </div>

        {testimonials.length === 0 ? (
          <p className="mt-8 font-sans text-[16px] text-ink-500">
            No testimonials submitted yet. Share the{" "}
            <a href="/share" className="text-copper-800 underline">
              /share
            </a>{" "}
            page to collect them.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {[...testimonials]
              .sort((a, b) => {
                const rank = { pending: 0, approved: 1, rejected: 2 } as const;
                return rank[a.status] - rank[b.status];
              })
              .map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-[color:var(--border)] bg-paper-2 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="font-serif text-[19px] text-ink-900">
                        {t.name}
                      </span>
                      {t.email && (
                        <a
                          href={`mailto:${t.email}`}
                          className="ml-2 font-sans text-[14px] text-copper-800 underline"
                        >
                          {t.email}
                        </a>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-sans text-[12px] font-medium uppercase tracking-[0.12em] ${
                        t.status === "approved"
                          ? "bg-sage-bg text-sage"
                          : t.status === "rejected"
                            ? "bg-ink-900/10 text-ink-500"
                            : "bg-copper-100 text-copper-900"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <blockquote className="mt-3 font-serif text-[19px] italic leading-[1.6] text-ink-700">
                    “{t.quote}”
                  </blockquote>
                  <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    {t.status !== "approved" && (
                      <button
                        type="button"
                        disabled={tBusy === t.id}
                        onClick={() =>
                          testimonialAction(t.id, { status: "approved" })
                        }
                        className="btn btn-primary btn-sm"
                      >
                        Approve
                      </button>
                    )}
                    {t.status === "approved" && (
                      <button
                        type="button"
                        disabled={tBusy === t.id}
                        onClick={() =>
                          testimonialAction(t.id, { status: "pending" })
                        }
                        className="btn btn-secondary btn-sm"
                      >
                        Unpublish
                      </button>
                    )}
                    {t.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={tBusy === t.id}
                        onClick={() =>
                          testimonialAction(t.id, { status: "rejected" })
                        }
                        className="btn btn-ghost btn-sm"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={tBusy === t.id}
                      onClick={() => testimonialAction(t.id, { action: "delete" })}
                      className="font-sans text-[13px] text-ink-400 underline transition hover:text-copper-800"
                    >
                      Delete
                    </button>
                    <span className="ml-auto font-sans text-[13px] text-ink-400">
                      {new Date(t.date).toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* ── Newsletter subscribers ───────────────────────────────────────── */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-[30px] text-ink-900">
              Newsletter Subscribers
            </h2>
            <p className="mt-1 font-sans text-[16px] text-ink-500">
              {entries.length}{" "}
              {entries.length === 1 ? "subscriber" : "subscribers"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => load(password)}
              className="btn btn-secondary btn-sm"
            >
              Refresh
            </button>
            {entries.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={copyEmails}
                  className="btn btn-secondary btn-sm"
                >
                  {copied ? "Copied!" : "Copy emails"}
                </button>
                <button type="button" onClick={csv} className="btn btn-primary btn-sm">
                  Download CSV
                </button>
              </>
            )}
          </div>
        </div>

        {note && (
          <p className="mt-6 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[16px] text-copper-900">
            {note}
          </p>
        )}

        {entries.length === 0 ? (
          <p className="mt-8 font-sans text-[17px] text-ink-500">
            No subscribers yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg border border-[color:var(--border)]">
            <table className="w-full border-collapse text-left font-sans text-[16px]">
              <thead>
                <tr className="border-b border-[color:var(--border)] bg-paper-2">
                  <th className="px-4 py-3 font-medium uppercase tracking-[0.12em] text-ink-500">
                    Name
                  </th>
                  <th className="px-4 py-3 font-medium uppercase tracking-[0.12em] text-ink-500">
                    Email
                  </th>
                  <th className="px-4 py-3 font-medium uppercase tracking-[0.12em] text-ink-500">
                    Signed up
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((s, i) => (
                  <tr
                    key={`${s.email}-${i}`}
                    className="border-b border-[color:var(--border)] last:border-0"
                  >
                    <td className="px-4 py-3 text-ink-900">{s.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${s.email}`}
                        className="text-copper-800 underline"
                      >
                        {s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {new Date(s.date).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Toggle({
  label,
  on,
  onText,
  offText,
  onToggle,
}: {
  label: string;
  on: boolean;
  onText: string;
  offText: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[color:var(--border)] bg-white p-4">
      <div>
        <span className="block font-serif text-[20px] text-ink-900">{label}</span>
        <span className="mt-0.5 block font-sans text-[15px] text-ink-500">
          {on ? onText : offText}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative mt-1 inline-flex h-7 w-12 flex-none items-center rounded-full transition ${
          on ? "bg-copper-700" : "bg-ink-400/40"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="field-input"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="field-input"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
