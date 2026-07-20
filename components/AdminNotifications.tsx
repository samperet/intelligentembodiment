"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function AdminNotifications() {
  const [supported, setSupported] = useState(true);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const supp =
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(supp);
    fetch("/api/push/public-key")
      .then((r) => r.json())
      .then((d) => {
        setConfigured(!!d.configured);
        setPublicKey(d.key || null);
      })
      .catch(() => setConfigured(false));
    if (supp) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((s) => setEnabled(!!s))
        .catch(() => {});
    }
  }, []);

  async function enable() {
    setBusy(true);
    setMsg(null);
    try {
      if (!publicKey) throw new Error("Notifications aren’t configured yet.");
      const perm = await Notification.requestPermission();
      if (perm !== "granted")
        throw new Error("Permission was blocked. Allow notifications in your settings.");
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
      }
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", subscription: sub.toJSON() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not enable.");
      setEnabled(true);
      setOk(true);
      setMsg("Notifications enabled on this device.");
    } catch (e: any) {
      setOk(false);
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send.");
      setOk(data.sent > 0);
      setMsg(
        data.sent > 0
          ? `Sent to ${data.sent} device${data.sent === 1 ? "" : "s"}.`
          : "No devices are subscribed yet.",
      );
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
        Appointment Notifications
      </h2>
      <p className="mt-1 font-sans text-[15px] text-ink-500">
        Get a push notification the moment a session is booked. Install this
        page to your home screen first, then enable it here.
      </p>

      {configured === false && (
        <p className="mt-4 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
          Notifications aren’t configured yet. Set{" "}
          <code>VAPID_PUBLIC_KEY</code>, <code>VAPID_PRIVATE_KEY</code>, and{" "}
          <code>VAPID_SUBJECT</code> in the environment (and R2 to store
          devices).
        </p>
      )}
      {!supported && (
        <p className="mt-4 rounded-lg bg-copper-50 px-4 py-3 font-sans text-[14px] text-copper-900">
          This browser doesn’t support push notifications. On iPhone, install
          the app to your Home Screen (Share → Add to Home Screen) and open it
          from there.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={enable}
          disabled={busy || !supported || configured === false}
          className="btn btn-primary btn-md"
        >
          {enabled ? "Re-enable on this device" : "Enable notifications"}
        </button>
        {enabled && (
          <button
            type="button"
            onClick={test}
            disabled={busy}
            className="btn btn-secondary btn-md"
          >
            Send test
          </button>
        )}
        {msg && (
          <span
            className={`font-sans text-[14px] ${ok ? "text-sage" : "text-copper-900"}`}
          >
            {msg}
          </span>
        )}
      </div>
    </section>
  );
}
