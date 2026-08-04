import { getSession } from "@/lib/auth/session";
import { createGalleryItem, listGalleryItems, toGalleryItemInput } from "@/lib/gallery/service";
import { validateGalleryItem } from "@/lib/gallery/validate";

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
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "24", 10) || 24));

    const result = await listGalleryItems({ search, visibility, featured, page, pageSize });
    return Response.json({ ok: true, ...result }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/gallery failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the gallery." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." },
      { status: 400, headers: NO_STORE }
    );
  }

  if (!body || typeof body !== "object") {
    return Response.json(
      { ok: false, error: "Gallery item payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toGalleryItemInput(body as Record<string, unknown>);
  const errors = validateGalleryItem(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const item = await createGalleryItem(data);
    return Response.json({ ok: true, item }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/gallery failed:", error);
    return Response.json(
      { ok: false, error: "Could not create the gallery item." },
      { status: 500, headers: NO_STORE }
    );
  }
}
