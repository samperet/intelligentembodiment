import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { isR2Configured } from "@/lib/r2";
import { writings as builtinWritings, type Recipe, type Writing } from "@/lib/content";
import {
  getCustomRecipes,
  getCustomWritings,
  addCustomRecipe,
  deleteCustomRecipe,
  addCustomWriting,
  deleteCustomWriting,
  getWritingMerged,
  recipeSlugsTaken,
  writingSlugsTaken,
  slugify,
  uniqueSlug,
} from "@/lib/contentStore";

export const dynamic = "force-dynamic";

const lines = (s: unknown): string[] =>
  typeof s === "string"
    ? s
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];
const paras = (s: unknown): string[] =>
  typeof s === "string"
    ? s
        .split(/\n\s*\n/)
        .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
        .filter(Boolean)
    : [];

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 500 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isAuthorized(request, body?.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const action = body?.action;

  // Reads work without R2 (return empty); writes require R2.
  if (action === "list") {
    const [recipes, writings] = await Promise.all([
      getCustomRecipes(),
      getCustomWritings(),
    ]);
    const customSlugs = new Set(writings.map((w) => w.slug));
    const builtinSlugs = new Set(builtinWritings.map((w) => w.slug));
    const allWritings = [
      ...writings.map((w) => ({
        slug: w.slug,
        title: w.title,
        date: w.date,
        kind: w.kind,
        // "edited" = overrides a built-in original; "yours" = brand new.
        status: builtinSlugs.has(w.slug) ? "edited" : "yours",
        draft: !!w.draft,
      })),
      ...builtinWritings
        .filter((w) => !customSlugs.has(w.slug))
        .map((w) => ({
          slug: w.slug,
          title: w.title,
          date: w.date,
          kind: w.kind,
          status: "original",
          draft: false,
        })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1));
    return NextResponse.json({
      ok: true,
      r2Configured: isR2Configured(),
      recipes,
      writings,
      allWritings,
    });
  }

  // Load one writing (built-in, custom, or draft) into the editor.
  if (action === "get-writing") {
    const w = await getWritingMerged(String(body.slug || ""), {
      includeDrafts: true,
    });
    if (!w) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const text =
      w.kind === "poem" && w.stanzas
        ? w.stanzas.map((st) => st.join("\n")).join("\n\n")
        : (w.paragraphs || []).join("\n\n");
    return NextResponse.json({
      ok: true,
      writing: { ...w, draft: !!w.draft, body: text },
    });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "R2 isn’t configured, so content can’t be saved. Set CLOUDFLARE_API, CLOUDFLARE_ACCOUNT_ID, and R2_BUCKET." },
      { status: 400 },
    );
  }

  try {
    if (action === "add-recipe") {
      const f = body.recipe || {};
      const title = String(f.title || "").trim();
      if (title.length < 2)
        return NextResponse.json({ error: "A title is required." }, { status: 400 });
      const custom = await getCustomRecipes();
      const slug = uniqueSlug(slugify(title), recipeSlugsTaken(custom));
      const intro = paras(f.intro);
      const meta: Recipe["meta"] = {};
      if (f.servings) meta.servings = String(f.servings).trim();
      if (f.servingSize) meta.servingSize = String(f.servingSize).trim();
      if (f.prepTime) meta.prepTime = String(f.prepTime).trim();
      const recipe: Recipe = {
        slug,
        title,
        tag: String(f.tag || "Recipe").trim(),
        intro: intro.length ? intro : [""],
        ...(Object.keys(meta).length ? { meta } : {}),
        ...(lines(f.ingredients).length ? { ingredients: lines(f.ingredients) } : {}),
        ...(lines(f.directions).length ? { directions: lines(f.directions) } : {}),
        ...(typeof f.image === "string" && f.image.trim()
          ? { image: f.image.trim() }
          : {}),
      };
      await addCustomRecipe(recipe);
      return NextResponse.json({ ok: true, recipes: await getCustomRecipes() });
    }

    if (action === "delete-recipe") {
      await deleteCustomRecipe(String(body.slug || ""));
      return NextResponse.json({ ok: true, recipes: await getCustomRecipes() });
    }

    // Save from the writing desk. An explicit slug keeps its identity —
    // matching a built-in slug overrides that original on the site.
    if (action === "save-writing") {
      const f = body.writing || {};
      const title = String(f.title || "").trim();
      if (title.length < 2)
        return NextResponse.json({ error: "A title is required." }, { status: 400 });
      const kind: Writing["kind"] = f.kind === "poem" ? "poem" : "essay";
      const custom = await getCustomWritings();
      const explicit =
        typeof f.slug === "string" && /^[a-z0-9-]{2,80}$/.test(f.slug)
          ? f.slug
          : null;
      const slug =
        explicit ?? uniqueSlug(slugify(title), writingSlugsTaken(custom));
      const bodyText = String(f.body || "");
      const paragraphs = paras(bodyText);
      const excerpt =
        String(f.excerpt || "").trim() || (paragraphs[0] || "").slice(0, 180);
      const date =
        typeof f.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f.date)
          ? f.date
          : new Date().toISOString().slice(0, 10);
      const original = builtinWritings.find((w) => w.slug === slug);
      const writing: Writing = {
        slug,
        title,
        date,
        kind,
        excerpt,
        ...(f.draft ? { draft: true } : {}),
        // Preserve a built-in original's related link across edits.
        ...(original?.related ? { related: original.related } : {}),
        ...(kind === "poem"
          ? {
              stanzas: bodyText
                .split(/\n\s*\n/)
                .map((st) => st.split("\n").map((l) => l.trim()).filter(Boolean))
                .filter((st) => st.length),
            }
          : { paragraphs: paragraphs.length ? paragraphs : [""] }),
      };
      await addCustomWriting(writing);
      return NextResponse.json({ ok: true, slug });
    }

    if (action === "add-writing") {
      const f = body.writing || {};
      const title = String(f.title || "").trim();
      if (title.length < 2)
        return NextResponse.json({ error: "A title is required." }, { status: 400 });
      const kind: Writing["kind"] = f.kind === "poem" ? "poem" : "essay";
      const custom = await getCustomWritings();
      const slug = uniqueSlug(slugify(title), writingSlugsTaken(custom));
      const bodyText = String(f.body || "");
      const paragraphs = paras(bodyText);
      const excerpt =
        String(f.excerpt || "").trim() ||
        (paragraphs[0] || "").slice(0, 180);
      const date =
        typeof f.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f.date)
          ? f.date
          : new Date().toISOString().slice(0, 10);
      const writing: Writing = {
        slug,
        title,
        date,
        kind,
        excerpt,
        ...(kind === "poem"
          ? {
              stanzas: bodyText
                .split(/\n\s*\n/)
                .map((st) => st.split("\n").map((l) => l.trim()).filter(Boolean))
                .filter((st) => st.length),
            }
          : { paragraphs: paragraphs.length ? paragraphs : [""] }),
      };
      await addCustomWriting(writing);
      return NextResponse.json({ ok: true, writings: await getCustomWritings() });
    }

    if (action === "delete-writing") {
      await deleteCustomWriting(String(body.slug || ""));
      return NextResponse.json({ ok: true, writings: await getCustomWritings() });
    }

    // Publish/unpublish from the list. Drafting a built-in original creates a
    // draft override (hiding it from the site); publishing restores it.
    if (action === "set-draft") {
      const slug = String(body.slug || "");
      const draft = !!body.draft;
      const custom = await getCustomWritings();
      const own = custom.find((w) => w.slug === slug);
      if (own) {
        const { draft: _prev, ...rest } = own;
        await addCustomWriting({ ...rest, ...(draft ? { draft: true } : {}) });
      } else if (draft) {
        const w = await getWritingMerged(slug, { includeDrafts: true });
        if (!w)
          return NextResponse.json({ error: "Not found." }, { status: 404 });
        await addCustomWriting({ ...w, draft: true });
      }
      return NextResponse.json({ ok: true });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not save: ${String(err?.message || err)}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
