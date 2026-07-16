"use client";

import { useState } from "react";

type Subscriber = { name: string; email: string; date: string };

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [entries, setEntries] = useState<Subscriber[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setEntries(data.entries || []);
      setNote(data.error || data.note || null);
      setAuthed(true);
    } catch (e: any) {
      setError(e.message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  function downloadCsv() {
    const rows = [
      ["Name", "Email", "Date"],
      ...entries.map((s) => [s.name, s.email, s.date]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
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
        <h1 className="text-center font-serif text-[34px] text-ink-900">
          Admin
        </h1>
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
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md w-full"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[32px] text-ink-900">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 font-sans text-[14px] text-ink-500">
            {entries.length} {entries.length === 1 ? "subscriber" : "subscribers"}
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
            <button
              type="button"
              onClick={downloadCsv}
              className="btn btn-primary btn-sm"
            >
              Download CSV
            </button>
          )}
        </div>
      </div>

      {note && (
        <p className="mt-6 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
          {note}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="mt-10 font-sans text-[15px] text-ink-500">
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
    </div>
  );
}
