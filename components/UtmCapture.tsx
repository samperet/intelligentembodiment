"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Remember where a visitor came from. If the URL carries utm_* tags (from an
 * ad or social post), store them for the session; the booking form sends them
 * along so each appointment shows which campaign brought the client.
 */
export function UtmCapture() {
  const params = useSearchParams();

  useEffect(() => {
    try {
      const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
      const found: Record<string, string> = {};
      for (const k of keys) {
        const v = params.get(k);
        if (v) found[k] = v.slice(0, 80);
      }
      if (Object.keys(found).length) {
        sessionStorage.setItem("ie_utm", JSON.stringify(found));
      }
    } catch {
      /* storage unavailable — fine */
    }
  }, [params]);

  return null;
}

/** Human-readable source string, e.g. "instagram / paid / spring-intuition". */
export function readUtmSource(): string | null {
  try {
    const raw = sessionStorage.getItem("ie_utm");
    if (!raw) return null;
    const u = JSON.parse(raw) as Record<string, string>;
    const parts = [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean);
    return parts.length ? parts.join(" / ") : null;
  } catch {
    return null;
  }
}
