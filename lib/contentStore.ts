// Server-only: merges built-in writings/recipes with items added via the admin
// editor (stored in R2). Public pages read through these; the admin API writes.
import {
  recipes as builtinRecipes,
  writings as builtinWritings,
  getRecipe as getBuiltinRecipe,
  getWriting as getBuiltinWriting,
  type Recipe,
  type Writing,
} from "./content";
import {
  listCustomRecipes,
  saveCustomRecipes,
  listCustomWritings,
  saveCustomWritings,
} from "./r2";

// ── Recipes ───────────────────────────────────────────────────────────────
export async function getCustomRecipes(): Promise<Recipe[]> {
  return listCustomRecipes<Recipe>();
}
export async function getAllRecipes(): Promise<Recipe[]> {
  const custom = await getCustomRecipes();
  return [...custom, ...builtinRecipes];
}
export async function getRecipeMerged(slug: string): Promise<Recipe | undefined> {
  const custom = await getCustomRecipes();
  return custom.find((r) => r.slug === slug) ?? getBuiltinRecipe(slug);
}
export async function addCustomRecipe(r: Recipe): Promise<void> {
  const custom = await getCustomRecipes();
  await saveCustomRecipes([r, ...custom.filter((x) => x.slug !== r.slug)]);
}
export async function deleteCustomRecipe(slug: string): Promise<void> {
  const custom = await getCustomRecipes();
  await saveCustomRecipes(custom.filter((x) => x.slug !== slug));
}
export function recipeSlugsTaken(custom: Recipe[]): string[] {
  return [...builtinRecipes, ...custom].map((r) => r.slug);
}

// ── Writings ──────────────────────────────────────────────────────────────
export async function getCustomWritings(): Promise<Writing[]> {
  return listCustomWritings<Writing>();
}
export async function getAllWritings(): Promise<Writing[]> {
  const custom = await getCustomWritings();
  return [...custom, ...builtinWritings].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
}
export async function getWritingMerged(slug: string): Promise<Writing | undefined> {
  const custom = await getCustomWritings();
  return custom.find((w) => w.slug === slug) ?? getBuiltinWriting(slug);
}
export async function addCustomWriting(w: Writing): Promise<void> {
  const custom = await getCustomWritings();
  await saveCustomWritings([w, ...custom.filter((x) => x.slug !== w.slug)]);
}
export async function deleteCustomWriting(slug: string): Promise<void> {
  const custom = await getCustomWritings();
  await saveCustomWritings(custom.filter((x) => x.slug !== slug));
}
export function writingSlugsTaken(custom: Writing[]): string[] {
  return [...builtinWritings, ...custom].map((w) => w.slug);
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "untitled"
  );
}
export function uniqueSlug(base: string, taken: string[]): string {
  let slug = base;
  let i = 2;
  while (taken.includes(slug)) slug = `${base}-${i++}`;
  return slug;
}
