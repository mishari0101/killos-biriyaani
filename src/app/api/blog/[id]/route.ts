import { getSession } from "@/lib/auth/session";
import { deleteBlog, BlogNotFoundError, toBlogInput, updateBlog } from "@/lib/blog/service";
import { validateBlog } from "@/lib/blog/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return Response.json({ ok: false, error: "Invalid post id." }, { status: 400, headers: NO_STORE });
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
      { ok: false, error: "Blog payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toBlogInput(body as Record<string, unknown>);
  const errors = validateBlog(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const item = await updateBlog(id, data);
    return Response.json({ ok: true, item }, { status: 200, headers: NO_STORE });
  } catch (error) {
    if (error instanceof BlogNotFoundError) {
      return Response.json(
        { ok: false, error: "Blog post not found." },
        { status: 404, headers: NO_STORE }
      );
    }
    console.error(`PUT /api/blog/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not update the blog post." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return Response.json({ ok: false, error: "Invalid post id." }, { status: 400, headers: NO_STORE });
  }

  try {
    await deleteBlog(id);
    return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
  } catch (error) {
    if (error instanceof BlogNotFoundError) {
      return Response.json(
        { ok: false, error: "Blog post not found." },
        { status: 404, headers: NO_STORE }
      );
    }
    console.error(`DELETE /api/blog/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not delete the blog post." },
      { status: 500, headers: NO_STORE }
    );
  }
}
