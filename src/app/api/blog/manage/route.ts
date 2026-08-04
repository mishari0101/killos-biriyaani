import { getSession } from "@/lib/auth/session";
import { listBlogs } from "@/lib/blog/service";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

/** Admin list: all posts (including drafts) with search, status, featured and
    category filters. Kept separate from the public /api/blog GET so the site
    only ever receives published posts. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  try {
    const url = new URL(request.url);
    const search = asString(url.searchParams.get("search"));
    const status = asEnum(url.searchParams.get("status"), ["published", "draft"]);
    const featured = asEnum(url.searchParams.get("featured"), ["featured", "regular"]);
    const category = asString(url.searchParams.get("category"));

    const result = await listBlogs({ search, status, featured, category });
    return Response.json({ ok: true, ...result }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/blog/manage failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the blog posts." },
      { status: 500, headers: NO_STORE }
    );
  }
}
