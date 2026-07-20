"use client";

import { useEffect } from "react";

// Register the service worker so the admin PWA is installable and can receive
// web-push appointment notifications.
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration failures */
      });
    }
  }, []);
  return null;
}
