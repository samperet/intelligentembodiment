"use client";

import { useEffect, useState } from "react";

type Item = { slug: string; title: string };

const emptyWriting = {
  title: "",
  kind: "essay",
  date: "",
  excerpt: "",
  body: "",
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
  const [writings, setWritings] = useState<Item[]>([]);
  const [r2, setR2] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"writing" | "recipe">("writing");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [w, setW] = useState({ ...emptyWriting });
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
    if (Array.isArray(d.writings)) setWritings(d.writings);
    if (typeof d.r2Configured === "boolean") setR2(d.r2Configured);
    return d;
  }

  useEffect(() => {
    post({ action: "list" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(action: string, body: any, reset: () => void, label: string) {
    setBusy(true);
    setMsg(null);
    try {
      await post({ action, ...body });
      setOk(true);
      setMsg(label);
      reset();
    } catch (e: any) {
      setOk(false);
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function del(action: string, slug: string) {
    setBusy(true);
    setMsg(null);
    try {
      await post({ action, slug });
    } catch (e: any) {
      setOk(false);
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-14">
      <h2 className="font-serif text-[28px] text-ink-900">
        Writings &amp; Recipes
      </h2>
      <p className="mt-1 font-sans text-[15px] text-ink-500">
        Publish a new writing or recipe. It appears on the site within the hour.
      </p>

      {r2 === false && (
        <p className="mt-4 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
          R2 isn’t configured, so new content can’t be saved. Set{" "}
          <code>CLOUDFLARE_API</code>, <code>CLOUDFLARE_ACCOUNT_ID</code>, and{" "}
          <code>R2_BUCKET</code>.
        </p>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {(["writing", "recipe"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setMsg(null);
            }}
            className={`rounded-full border px-5 py-2 font-sans text-[14px] transition ${
              tab === t
                ? "border-copper-800 bg-copper-700 text-white"
                : "border-[color:var(--border-strong)] bg-white text-ink-700 hover:border-copper-700"
            }`}
          >
            {t === "writing" ? "Writing" : "Recipe"}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
        {tab === "writing" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit("add-writing", { writing: w }, () => setW({ ...emptyWriting }), "Writing published.");
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" value={w.title} onChange={(v) => setW({ ...w, title: v })} required />
              <label className="block">
                <span className="field-label">Type</span>
                <select
                  value={w.kind}
                  onChange={(e) => setW({ ...w, kind: e.target.value })}
                  className="field-input"
                >
                  <option value="essay">Essay</option>
                  <option value="poem">Poem</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Date (optional)</span>
                <input
                  type="date"
                  value={w.date}
                  onChange={(e) => setW({ ...w, date: e.target.value })}
                  className="field-input"
                />
              </label>
              <Field label="Excerpt (optional)" value={w.excerpt} onChange={(v) => setW({ ...w, excerpt: v })} />
            </div>
            <label className="block">
              <span className="field-label">
                {w.kind === "poem" ? "Poem (blank line = new stanza)" : "Body (blank line = new paragraph)"}
              </span>
              <textarea
                rows={8}
                required
                value={w.body}
                onChange={(e) => setW({ ...w, body: e.target.value })}
                className="field-input"
              />
            </label>
            <Submit busy={busy} label="Publish writing" />
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit("add-recipe", { recipe: r }, () => setR({ ...emptyRecipe }), "Recipe published.");
            }}
            className="space-y-4"
          >
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
            <Submit busy={busy} label="Publish recipe" />
          </form>
        )}
        {msg && (
          <p className={`mt-3 font-sans text-[14px] ${ok ? "text-sage" : "text-copper-900"}`}>{msg}</p>
        )}
      </div>

      {/* Existing custom items */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <CustomList
          heading="Your writings"
          items={writings}
          onDelete={(slug) => del("delete-writing", slug)}
          hrefBase="/writings"
          busy={busy}
        />
        <CustomList
          heading="Your recipes"
          items={recipes}
          onDelete={(slug) => del("delete-recipe", slug)}
          hrefBase="/recipes"
          busy={busy}
        />
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

function Submit({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button type="submit" disabled={busy} className="btn btn-primary btn-md">
      {busy ? "Saving…" : label}
    </button>
  );
}

function CustomList({
  heading,
  items,
  onDelete,
  hrefBase,
  busy,
}: {
  heading: string;
  items: Item[];
  onDelete: (slug: string) => void;
  hrefBase: string;
  busy: boolean;
}) {
  return (
    <div>
      <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.16em] text-ink-500">
        {heading}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 font-sans text-[14px] text-ink-400">None yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li
              key={it.slug}
              className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--border)] bg-white px-4 py-2.5"
            >
              <a
                href={`${hrefBase}/${it.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-[17px] text-ink-900 hover:text-copper-800"
              >
                {it.title}
              </a>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete(it.slug)}
                className="font-sans text-[13px] text-ink-400 underline transition hover:text-copper-800"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
