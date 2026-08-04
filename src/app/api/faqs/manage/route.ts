import { getSession } from "@/lib/auth/session";
import { listFaqs } from "@/lib/faqs/service";

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

/** Admin list: all FAQs (including hidden) with search, visibility and
    featured filters. Kept separate from the public /api/faqs GET so the site
    only ever receives visible items. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  try {
    const url = new URL(request.url);
    const search = asString(url.searchParams.get("search"));
    const visibility = asEnum(url.searchParams.get("visibility"), ["visible", "hidden"]);
    const featured = asEnum(url.searchParams.get("featured"), ["featured", "regular"]);

    const result = await listFaqs({ search, visibility, featured });
    return Response.json({ ok: true, ...result }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/faqs/manage failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the FAQs." },
      { status: 500, headers: NO_STORE }
    );
  }
}
