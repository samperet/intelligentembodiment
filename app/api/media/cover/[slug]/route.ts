import { canAccessMedia, cookieReader } from "@/lib/media";
import { getMediaCovers, getObject, isR2Configured } from "@/lib/r2";
import { MEDIA_SLUG } from "@/lib/mediaShared";

export const dynamic = "force-dynamic";

// GET /api/media/cover/<artist-slug>?v=…  → that artist's cover image.
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  if (!canAccessMedia(cookieReader(request))) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!MEDIA_SLUG.test(params.slug) || !isR2Configured()) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const cover = (await getMediaCovers())[params.slug];
    const bytes = cover && (await getObject(`media/covers/${params.slug}`));
    if (!cover || !bytes) return new Response("Not found", { status: 404 });
    return new Response(bytes, {
      headers: {
        "Content-Type": cover.type,
        // The URL carries the version, so it can be cached for good.
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Storage unavailable", { status: 502 });
  }
}
