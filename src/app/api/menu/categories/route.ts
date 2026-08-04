import { getSession } from "@/lib/auth/session";
import {
  createMenuCategory,
  listMenuCategories,
  toMenuCategoryInput,
  MenuCategoryConflictError,
} from "@/lib/menu/service";
import { validateMenuCategory } from "@/lib/menu/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  try {
    const categories = await listMenuCategories();
    return Response.json({ ok: true, categories }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/menu/categories failed:", error);
    return Response.json(
      { ok: false, error: "Could not load categories." },
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
      { ok: false, error: "Category payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toMenuCategoryInput(body as Record<string, unknown>);
  const errors = validateMenuCategory(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const category = await createMenuCategory(data);
    return Response.json({ ok: true, category }, { status: 201, headers: NO_STORE });
  } catch (error) {
    if (error instanceof MenuCategoryConflictError) {
      return Response.json(
        { ok: false, error: error.message, errors: { [error.field]: error.message } },
        { status: 409, headers: NO_STORE }
      );
    }
    console.error("POST /api/menu/categories failed:", error);
    return Response.json(
      { ok: false, error: "Could not create the category." },
      { status: 500, headers: NO_STORE }
    );
  }
}
