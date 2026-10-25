import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { MediaGate } from "@/components/MediaGate";
import { MediaInstallQuiet } from "@/components/MediaInstallQuiet";
import { MediaPlayer } from "@/components/MediaPlayer";
import { canAccessMedia, listMediaCovers, listMediaTracks, mediaConfigured } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "IE | media" },
  icons: {
    icon: [
      { url: "/icons/media-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/media-favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/media-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/media-apple-touch-icon.png",
  },
  robots: { index: false, follow: false },
  // Installs as its own app ("IE | media"), separate from the admin app.
  manifest: "/media.webmanifest",
  appleWebApp: {
    capable: true,
    title: "IE | media",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6EFE4",
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: { artist?: string };
}) {
  const jar = cookies();
  if (!canAccessMedia((name) => jar.get(name)?.value)) {
    return (
      <div data-media-app>
        <MediaInstallQuiet />
        <MediaGate configured={mediaConfigured()} />
      </div>
    );
  }

  const [tracks, covers] = await Promise.all([listMediaTracks(), listMediaCovers()]);

  return (
    <div data-media-app>
      <MediaInstallQuiet />
      <MediaPlayer tracks={tracks} covers={covers} initialArtist={searchParams.artist} />
    </div>
  );
}
