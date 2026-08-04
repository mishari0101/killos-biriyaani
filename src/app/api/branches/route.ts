import { getSession } from "@/lib/auth/session";
import { createBranch, listBranches, toBranchInput } from "@/lib/branches/service";
import { validateBranch } from "@/lib/branches/validate";

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

    const result = await listBranches({ search, visibility, featured, page, pageSize });
    return Response.json({ ok: true, ...result }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/branches failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the branches." },
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
      { ok: false, error: "Branch payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toBranchInput(body as Record<string, unknown>);
  const errors = validateBranch(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const item = await createBranch(data);
    return Response.json({ ok: true, item }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/branches failed:", error);
    return Response.json(
      { ok: false, error: "Could not create the branch." },
      { status: 500, headers: NO_STORE }
    );
  }
}
