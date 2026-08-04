import { getSession } from "@/lib/auth/session";
import { reorderBlogs } from "@/lib/blog/service";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function PUT(request: Request) {
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

  if (!body || typeof body !== "object" || !Array.isArray((body as { items?: unknown }).items)) {
    return Response.json(
      { ok: false, error: "Reorder payload must include an items array." },
      { status: 400, headers: NO_STORE }
    );
  }

  const entries: { id: number; displayOrder: number }[] = [];
  for (const raw of (body as { items: unknown[] }).items) {
    if (!raw || typeof raw !== "object") {
      return Response.json(
        { ok: false, error: "Reorder entries must be objects." },
        { status: 400, headers: NO_STORE }
      );
    }
    const record = raw as Record<string, unknown>;
    const id = Number(record.id);
    const displayOrder = Number(record.displayOrder);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(displayOrder) || displayOrder < 0) {
      return Response.json(
        { ok: false, error: "Each entry needs a positive id and a whole displayOrder." },
        { status: 422, headers: NO_STORE }
      );
    }
    entries.push({ id, displayOrder });
  }

  if (entries.length === 0) {
    return Response.json(
      { ok: false, error: "Nothing to reorder." },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    await reorderBlogs(entries);
    return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("PUT /api/blog/reorder failed:", error);
    return Response.json(
      { ok: false, error: "Could not reorder the blog posts." },
      { status: 500, headers: NO_STORE }
    );
  }
}
