"use client";

import { useEffect } from "react";

/**
 * Hidden admin login. There is no visible field — just start typing the admin
 * password anywhere on the site. Keystrokes are buffered and posted to the
 * login endpoint (the server holds the password); on a match the session
 * cookie is set and we jump to /admin, already authenticated.
 */
export function AdminHotkey() {
  useEffect(() => {
    // Already on the admin page; its own form/session handles auth.
    if (window.location.pathname.startsWith("/admin")) return;

    let buffer = "";
    let timer: ReturnType<typeof setTimeout> | undefined;
    let checking = false;

    async function tryLogin() {
      if (checking || buffer.length < 3) return;
      checking = true;
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: buffer }),
        });
        if (res.ok) {
          buffer = "";
          window.location.href = "/admin";
          return;
        }
      } catch {
        /* ignore network errors, keep buffering */
      } finally {
        checking = false;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      // Don't hijack real typing in fields, or modifier combos.
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter") {
        void tryLogin();
        return;
      }
      if (e.key.length === 1) {
        buffer = (buffer + e.key).slice(-64);
        clearTimeout(timer);
        timer = setTimeout(() => void tryLogin(), 450);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
