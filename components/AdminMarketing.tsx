"use client";

import { useState } from "react";
import { site } from "@/lib/site";

const PAGES = [
  { label: "Medical Intuition (campaign page)", path: "/medical-intuition" },
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Share your experience", path: "/share" },
];
const SOURCES = ["instagram", "facebook", "google", "newsletter", "flyer", "referral"];
const MEDIUMS = ["paid", "organic", "email", "qr", "word-of-mouth"];

type CopyBlock = { label: string; text: string };
const COPY: { heading: string; note: string; blocks: CopyBlock[] }[] = [
  {
    heading: "Google Search ad",
    note: "Headlines ≤30 characters, descriptions ≤90. Mix and match.",
    blocks: [
      {
        label: "Headlines",
        text: "Medical Intuitive in Vermont\nWhen Pain Has a Deeper Story\nRisk-Free Intuitive Consult\n30 Years of Healing Hands\nFind the Root of Your Pain",
      },
      {
        label: "Descriptions",
        text: "A one-hour intuitive consult with a 30-year bodyworker. Money-back guarantee.\nMedical intuition complements your medical care. Book a risk-free initial consult.",
      },
    ],
  },
  {
    heading: "Instagram / Facebook",
    note: "Primary text for a paid ad or organic post.",
    blocks: [
      {
        label: "Story ad",
        text: "After thirty years of bodywork, I stopped ignoring what my hands kept finding: the story beneath the symptom. The grief a shoulder holds. The old fear living in a gut.\n\nMedical intuition gave that perception structure and discipline. It doesn't replace your doctor — it asks a different question: why is this happening, and what is it connected to?\n\nIf you've been circling the same pain for years, I'd be honored to listen. The first consult is risk-free: if it doesn't serve you, you don't pay.\n\n→ Link in bio · intelligentembodiment.com/medical-intuition",
      },
      {
        label: "Short post",
        text: "Some pain has a story that scans and labs don't tell. Medical intuition listens for it.\n\nOne-hour initial consult, fully risk-free — if it doesn't serve you, you don't pay.\n\nintelligentembodiment.com/medical-intuition",
      },
    ],
  },
  {
    heading: "Newsletter",
    note: "Send to the retreat-interest list from the admin (Copy emails).",
    blocks: [
      {
        label: "Announcement email",
        text: "Subject: Something I've finally put words to\n\nDear friends,\n\nFor thirty years my hands have been telling me things — where grief settles, where fear lives, why the same pain keeps returning. I've finally given that perception the training and structure it deserves: medical intuition, studied with Skylar Acamesis.\n\nI'm now offering initial consults by phone. One hour, guided by intuition, ending with clear next steps. And because trust is earned: if it doesn't serve you, you don't pay.\n\nBook at intelligentembodiment.com/medical-intuition — or just reply to this note.\n\nWith love,\nMackensie",
      },
    ],
  },
];

export function AdminMarketing() {
  const [page, setPage] = useState(PAGES[0].path);
  const [source, setSource] = useState(SOURCES[0]);
  const [medium, setMedium] = useState(MEDIUMS[0]);
  const [campaign, setCampaign] = useState("intuition-launch");
  const [copied, setCopied] = useState<string | null>(null);

  const link = `${site.url}${page}?utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign.trim() || "campaign")}`;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <section className="mt-14">
      <h2 className="font-serif text-[28px] text-ink-900">Marketing Studio</h2>
      <p className="mt-1 font-sans text-[15px] text-ink-500">
        Campaign links and ready-to-paste ad copy. Bookings that arrive through
        a tagged link show their source on the appointment.
      </p>

      {/* UTM link builder */}
      <div className="mt-6 rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
        <h3 className="font-serif text-[21px] text-ink-900">Campaign link builder</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Page</span>
            <select value={page} onChange={(e) => setPage(e.target.value)} className="field-input">
              {PAGES.map((p) => (
                <option key={p.path} value={p.path}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Where it will run (source)</span>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="field-input">
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Type (medium)</span>
            <select value={medium} onChange={(e) => setMedium(e.target.value)} className="field-input">
              {MEDIUMS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Campaign name</span>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="field-input"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="max-w-full flex-1 overflow-x-auto rounded-lg bg-white px-4 py-3 font-mono text-[13px] text-ink-700 ring-1 ring-[color:var(--border)]">
            {link}
          </code>
          <button type="button" onClick={() => copy(link, "link")} className="btn btn-primary btn-sm">
            {copied === "link" ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Ad copy library */}
      <div className="mt-6 space-y-6">
        {COPY.map((group) => (
          <div key={group.heading} className="rounded-lg border border-[color:var(--border)] bg-paper-2 p-6">
            <h3 className="font-serif text-[21px] text-ink-900">{group.heading}</h3>
            <p className="mt-1 font-sans text-[14px] text-ink-500">{group.note}</p>
            <div className="mt-4 space-y-4">
              {group.blocks.map((b) => (
                <div key={b.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="field-label !mb-0">{b.label}</span>
                    <button
                      type="button"
                      onClick={() => copy(b.text, b.label)}
                      className="btn btn-secondary btn-sm"
                    >
                      {copied === b.label ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg bg-white px-4 py-3 font-sans text-[14px] leading-[1.7] text-ink-700 ring-1 ring-[color:var(--border)]">
                    {b.text}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
