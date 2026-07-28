"use client";

import { useEffect, useState } from "react";

type Item = { slug: string; title: string };
type WritingRow = {
  slug: string;
  title: string;
  date: string;
  kind: string;
  status: "original" | "edited" | "yours";
};

const emptyRecipe = {
  title: "",
  tag: "",
  intro: "",
  ingredients: "",
  directions: "",
  servings: "",
  prepTime: "",
};

export function AdminContent() {
  const [recipes, setRecipes] = useState<Item[]>([]);
  const [allWritings, setAllWritings] = useState<WritingRow[]>([]);
  const [r2, setR2] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [r, setR] = useState({ ...emptyRecipe });

  async function post(payload: any) {
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || "Could not save.");
    if (Array.isArray(d.recipes)) setRecipes(d.recipes);
    if (Array.isArray(d.allWritings)) setAllWritings(d.allWritings);
    if (typeof d.r2Configured === "boolean") setR2(d.r2Configured);
    return d;
  }

  const refresh = () => post({ action: "list" }).catch(() => {});

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addRecipe(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await post({ action: "add-recipe", recipe: r });
      setOk(true);
      setMsg("Recipe published.");
      setR({ ...emptyRecipe });
    } catch (err: any) {
      setOk(false);
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function del(action: string, slug: string) {
    setBusy(true);
    setMsg(null);
    try {
      await post({ action, slug });
      await refresh();
    } catch (err: any) {
      setOk(false);
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-14">
      <h2 className="font-serif text-[28px] text-ink-900">
        Writings &amp; Recipes
      </h2>

      {r2 === false && (
        <p className="mt-4 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
          R2 isn’t configured, so edits can’t be saved. Set{" "}
          <code>CLOUDFLARE_API</code>, <code>CLOUDFLARE_ACCOUNT_ID</code>, and{" "}
          <code>R2_BUCKET</code>.
        </p>
      )}

      {/* ── The writing desk ─────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
        <div>
          <h3 className="font-serif text-[21px] text-ink-900">The writing desk</h3>
          <p className="mt-1 font-sans text-[14px] text-ink-500">
            A quiet, full-page editor. Edits to an original replace it on the
            site; Revert brings the original back.
          </p>
        </div>
        <a href="/admin/write" className="btn btn-primary btn-md">
          Write ✍
        </a>
      </div>

      {/* All writings */}
      <div className="mt-5">
        <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.16em] text-ink-500">
          All writings
        </h3>
        {allWritings.length === 0 ? (
          <p className="mt-3 font-sans text-[14px] text-ink-400">Loading…</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {allWritings.map((w) => (
              <li
                key={w.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--border)] bg-white px-4 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <a
                    href={`/writings/${w.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate font-serif text-[17px] text-ink-900 hover:text-copper-800"
                  >
                    {w.title}
                  </a>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-sans text-[11px] font-medium uppercase tracking-[0.1em] ${
                      w.status === "yours"
                        ? "bg-sage-bg text-sage"
                        : w.status === "edited"
                          ? "bg-copper-100 text-copper-900"
                          : "bg-ink-900/5 text-ink-500"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/admin/write?slug=${w.slug}`}
                    className="font-sans text-[13px] font-medium text-copper-800 underline"
                  >
                    Edit
                  </a>
                  {w.status !== "original" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => del("delete-writing", w.slug)}
                      className="font-sans text-[13px] text-ink-400 underline transition hover:text-copper-800"
                    >
                      {w.status === "edited" ? "Revert" : "Delete"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Recipes ──────────────────────────────────────────────────────── */}
      <div className="mt-10 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
        <h3 className="font-serif text-[21px] text-ink-900">New recipe</h3>
        <form onSubmit={addRecipe} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" value={r.title} onChange={(v) => setR({ ...r, title: v })} required />
            <Field label="Tag / subtitle" value={r.tag} onChange={(v) => setR({ ...r, tag: v })} />
          </div>
          <label className="block">
            <span className="field-label">Intro (blank line = new paragraph)</span>
            <textarea rows={3} value={r.intro} onChange={(e) => setR({ ...r, intro: e.target.value })} className="field-input" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Ingredients (one per line)</span>
              <textarea rows={6} value={r.ingredients} onChange={(e) => setR({ ...r, ingredients: e.target.value })} className="field-input" />
            </label>
            <label className="block">
              <span className="field-label">Directions (one per line)</span>
              <textarea rows={6} value={r.directions} onChange={(e) => setR({ ...r, directions: e.target.value })} className="field-input" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Servings (optional)" value={r.servings} onChange={(v) => setR({ ...r, servings: v })} />
            <Field label="Prep time (optional)" value={r.prepTime} onChange={(v) => setR({ ...r, prepTime: v })} />
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary btn-md">
            {busy ? "Saving…" : "Publish recipe"}
          </button>
        </form>
        {msg && (
          <p className={`mt-3 font-sans text-[14px] ${ok ? "text-sage" : "text-copper-900"}`}>{msg}</p>
        )}
        {recipes.length > 0 && (
          <div className="mt-6">
            <h4 className="font-sans text-[13px] font-medium uppercase tracking-[0.16em] text-ink-500">
              Your recipes
            </h4>
            <ul className="mt-3 space-y-2">
              {recipes.map((it) => (
                <li
                  key={it.slug}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--border)] bg-white px-4 py-2.5"
                >
                  <a
                    href={`/recipes/${it.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-serif text-[17px] text-ink-900 hover:text-copper-800"
                  >
                    {it.title}
                  </a>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => del("delete-recipe", it.slug)}
                    className="font-sans text-[13px] text-ink-400 underline transition hover:text-copper-800"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
    </label>
  );
}
