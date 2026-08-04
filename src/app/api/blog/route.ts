import { getSession } from "@/lib/auth/session";
import { createBlog, listPublicBlogs, toBlogInput } from "@/lib/blog/service";
import { validateBlog } from "@/lib/blog/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** Public list: published posts only (featured first, then display order). */
export async function GET() {
  try {
    const items = await listPublicBlogs();
    return Response.json({ ok: true, items }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/blog failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the blog posts." },
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
    const item = await createBlog(data);
    return Response.json({ ok: true, item }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/blog failed:", error);
    return Response.json(
      { ok: false, error: "Could not create the blog post." },
      { status: 500, headers: NO_STORE }
    );
  }
}
