import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PageHero } from "@/components/PageHero";
import { MediaGate } from "@/components/MediaGate";
import { MediaPlayer } from "@/components/MediaPlayer";
import { canAccessMedia, listMediaTracks, mediaConfigured } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listening Room",
  robots: { index: false, follow: false },
};

export default async function MediaPage() {
  const jar = cookies();
  if (!canAccessMedia((name) => jar.get(name)?.value)) {
    return <MediaGate configured={mediaConfigured()} />;
  }

  const tracks = await listMediaTracks();

  return (
    <>
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
    </>
  );
}
