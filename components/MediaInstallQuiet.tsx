"use client";

import { useEffect } from "react";

// The listening room can be installed from the browser menu (or Share → Add
// to Home Screen), but it's for personal use, so Chrome's automatic install
// banner is suppressed rather than offered to every listener.
export function MediaInstallQuiet() {
  useEffect(() => {
    const quiet = (e: Event) => e.preventDefault();
    window.addEventListener("beforeinstallprompt", quiet);
    return () => window.removeEventListener("beforeinstallprompt", quiet);
  }, []);
  return null;
}
