import { getSession } from "@/lib/auth/session";
import { listMenuItems, createMenuItem, toMenuItemInput } from "@/lib/menu/service";
import { validateMenuItem } from "@/lib/menu/validate";
import type { MenuSort } from "@/lib/menu/types";

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
    const category = asString(url.searchParams.get("category"));
    const availability = asEnum(url.searchParams.get("availability"), ["available", "unavailable"]);
    const featured = asEnum(url.searchParams.get("featured"), ["featured", "regular"]);
    const sort = asEnum<MenuSort>(url.searchParams.get("sort"), [
      "order",
      "name",
      "price-asc",
      "price-desc",
      "newest",
    ]);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "12", 10) || 12));

    const result = await listMenuItems({
      search,
      category,
      availability,
      featured,
      sort,
      page,
      pageSize,
    });
    return Response.json({ ok: true, ...result }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/menu failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the menu." },
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
      { ok: false, error: "Menu item payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toMenuItemInput(body as Record<string, unknown>);
  const errors = validateMenuItem(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const item = await createMenuItem(data);
    return Response.json({ ok: true, item }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/menu failed:", error);
    return Response.json(
      { ok: false, error: "Could not create the menu item." },
      { status: 500, headers: NO_STORE }
    );
  }
}
