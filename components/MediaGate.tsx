"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MediaGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/media/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="px-6 pb-[clamp(72px,10vw,120px)] pt-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-[460px] rounded-2xl border border-[color:var(--border)] bg-paper-2 px-7 py-10 text-center shadow-sm sm:px-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mandala.png"
            alt=""
            className="h-[74%] w-[74%] object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
        <span className="eyebrow mt-6 block">Client Library</span>
        <h1 className="mt-3 font-serif text-[34px] leading-[1.1] text-ink-900">
          A quiet place to listen
        </h1>
        <p className="mt-3 font-sans text-[16px] leading-[1.65] text-ink-500">
          These recordings are shared with Mackensie&apos;s clients. Enter the
          password you were given.
        </p>

        {configured ? (
          <form onSubmit={submit} className="mt-7 space-y-4 text-left">
            <label className="block">
              <span className="field-label">Password</span>
              <input
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-copper-50 px-4 py-2.5 font-sans text-[14px] text-copper-900">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !password.trim()}
              className="btn btn-primary btn-md w-full"
            >
              {busy ? "Opening…" : "Enter"}
            </button>
          </form>
        ) : (
          <p className="mt-7 rounded-lg bg-sand px-4 py-3 font-sans text-[15px] text-ink-700">
            The listening room isn&apos;t open yet. Please check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
