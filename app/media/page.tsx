import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { PageHero } from "@/components/PageHero";
import { MediaGate } from "@/components/MediaGate";
import { MediaInstallQuiet } from "@/components/MediaInstallQuiet";
import { MediaPlayer } from "@/components/MediaPlayer";
import { canAccessMedia, listMediaTracks, mediaConfigured } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listening Room",
  robots: { index: false, follow: false },
  // Installs as its own app ("Listening Room"), separate from the admin app.
  manifest: "/media.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Listening Room",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6EFE4",
};

export default async function MediaPage() {
  const jar = cookies();
  if (!canAccessMedia((name) => jar.get(name)?.value)) {
    return (
      <div data-media-app>
        <MediaInstallQuiet />
        <MediaGate configured={mediaConfigured()} />
      </div>
    );
  }

  const tracks = await listMediaTracks();

  return (
    <div data-media-app>
      <MediaInstallQuiet />
      <PageHero
        eyebrow="Client Library"
        title={
          <>
            The listening <em className="text-copper-800">room</em>
          </>
        }
        lead="Prayers and teachings to return to between sessions."
      />
      <section className="px-6 pb-[clamp(64px,9vw,110px)]">
        <MediaPlayer tracks={tracks} />
      </section>
    </div>
  );
}
