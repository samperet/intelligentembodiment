"use client";

import { useState } from "react";

export function RetreatInterest() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/retreat-interest", {
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
      <p className="mx-auto mt-8 max-w-[46ch] font-serif text-[21px] italic leading-[1.6] text-copper-800">
        Thank you, {form.name.trim().split(" ")[0]}. You&apos;ll be among the
        first to hear when a new retreat opens.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
    >
      <label className="sr-only" htmlFor="retreat-name">
        Your name
      </label>
      <input
        id="retreat-name"
        type="text"
        required
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="field-input sm:flex-1"
      />
      <label className="sr-only" htmlFor="retreat-email">
        Email address
      </label>
      <input
        id="retreat-email"
        type="email"
        required
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="field-input sm:flex-1"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-primary btn-md whitespace-nowrap disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Notify Me"}
      </button>
      {error && (
        <p className="w-full text-center font-sans text-[15px] text-copper-800 sm:absolute">
          {error}
        </p>
      )}
    </form>
  );
}
