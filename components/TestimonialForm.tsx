"use client";

import { useState } from "react";

export function TestimonialForm() {
  const [form, setForm] = useState({ name: "", email: "", quote: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (e: any) {
      setError(e.message);
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-[color:var(--border)] bg-paper-2 p-10 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          width={48}
          height={48}
          className="mx-auto mb-5 opacity-70"
        />
        <h2 className="font-serif text-[30px] text-ink-900">Thank you</h2>
        <p className="mx-auto mt-3 max-w-[42ch] font-sans text-[17px] leading-[1.7] text-ink-500">
          Your words mean a great deal, {form.name.trim().split(" ")[0]}.
          Mackensie will review your note before it appears on the site.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Your name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="field-label">Email (optional)</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="field-input"
          />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Your experience</span>
        <textarea
          required
          rows={6}
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          placeholder="Share what your time with Mackensie meant to you…"
          className="field-input"
        />
      </label>
      {error && (
        <p className="rounded-lg bg-copper-50 px-4 py-3 font-sans text-[15px] text-copper-900">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-primary btn-lg w-full sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Share my experience"}
      </button>
      <p className="font-sans text-[14px] text-ink-400">
        With your permission, your words may appear on this site. Nothing is
        published until Mackensie approves it.
      </p>
    </form>
  );
}
