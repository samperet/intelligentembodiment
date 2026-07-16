"use client";

import { useState } from "react";

type Subscriber = { name: string; email: string; date: string };
type BookingSettings = {
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

  const [copied, setCopied] = useState(false);

  async function load(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const [subsRes, setRes] = await Promise.all([
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
      ]);
      const subs = await subsRes.json();
      if (!subsRes.ok) throw new Error(subs.error || "Something went wrong.");
      const set = await setRes.json();
      setEntries(subs.entries || []);
      setNote(subs.error || subs.note || null);
      if (set?.settings) setSettings(set.settings);
      setAuthed(true);
    } catch (e: any) {
      setError(e.message);
      setAuthed(false);
    } finally {
      setLoading(false);
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
      setSettings(data.settings);
      setSettingsMsg("Saved.");
    } catch (e: any) {
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

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
        <h1 className="text-center font-serif text-[34px] text-ink-900">Admin</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
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
            <p className="rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
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
      {/* ── Booking availability ─────────────────────────────────────────── */}
      <section>
        <h1 className="font-serif text-[32px] text-ink-900">
          Booking Availability
        </h1>
        <p className="mt-1 font-sans text-[14px] text-ink-500">
          When clients are allowed to book. Times are in the practice timezone
          (Eastern).
        </p>

        {settings && (
          <div className="mt-6 space-y-6 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
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
                      className={`rounded-full border px-4 py-2 font-sans text-[13px] transition ${
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
                  className={`font-sans text-[14px] ${
                    settingsMsg === "Saved."
                      ? "text-sage"
                      : "text-copper-900"
                  }`}
                >
                  {settingsMsg}
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Newsletter subscribers ───────────────────────────────────────── */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-[28px] text-ink-900">
              Newsletter Subscribers
            </h2>
            <p className="mt-1 font-sans text-[14px] text-ink-500">
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
          <p className="mt-6 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
            {note}
          </p>
        )}

        {entries.length === 0 ? (
          <p className="mt-8 font-sans text-[15px] text-ink-500">
            No subscribers yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg border border-[color:var(--border)]">
            <table className="w-full border-collapse text-left font-sans text-[14px]">
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
