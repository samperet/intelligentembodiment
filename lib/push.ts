import webpush from "web-push";
import { site } from "./site";
import { listPushSubscriptions, removePushSubscription } from "./r2";

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function vapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}

let configured = false;
function ensureConfigured() {
  if (configured || !pushConfigured()) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || `mailto:${site.email}`,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

type Payload = { title: string; body: string; url?: string; tag?: string };

/**
 * Send a push to every stored admin subscription. Never throws — expired /
 * unsubscribed endpoints (404/410) are pruned. No-op if push or R2 is unset.
 */
export async function sendPushToAdmins(payload: Payload): Promise<number> {
  if (!pushConfigured()) return 0;
  ensureConfigured();
  const subs = await listPushSubscriptions();
  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as any, JSON.stringify(payload));
        sent += 1;
      } catch (err: any) {
        const code = err?.statusCode;
        if (code === 404 || code === 410) {
          await removePushSubscription(sub.endpoint).catch(() => {});
        }
      }
    }),
  );
  return sent;
}
