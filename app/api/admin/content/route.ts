import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { isR2Configured } from "@/lib/r2";
import type { Recipe, Writing } from "@/lib/content";
import {
  getCustomRecipes,
  getCustomWritings,
  addCustomRecipe,
  deleteCustomRecipe,
  addCustomWriting,
  deleteCustomWriting,
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
    return NextResponse.json({
      ok: true,
      r2Configured: isR2Configured(),
      recipes,
      writings,
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
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not save: ${String(err?.message || err)}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
