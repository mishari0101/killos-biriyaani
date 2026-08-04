import { getSession } from "@/lib/auth/session";
import { deleteFaq, FaqNotFoundError, toFaqInput, updateFaq } from "@/lib/faqs/service";
import { validateFaq } from "@/lib/faqs/validate";

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
    return Response.json({ ok: false, error: "Invalid item id." }, { status: 400, headers: NO_STORE });
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
      { ok: false, error: "FAQ payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toFaqInput(body as Record<string, unknown>);
  const errors = validateFaq(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const item = await updateFaq(id, data);
    return Response.json({ ok: true, item }, { status: 200, headers: NO_STORE });
  } catch (error) {
    if (error instanceof FaqNotFoundError) {
      return Response.json(
        { ok: false, error: "FAQ not found." },
        { status: 404, headers: NO_STORE }
      );
    }
    console.error(`PUT /api/faqs/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not update the FAQ." },
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
    return Response.json({ ok: false, error: "Invalid item id." }, { status: 400, headers: NO_STORE });
  }

  try {
    await deleteFaq(id);
    return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
  } catch (error) {
    if (error instanceof FaqNotFoundError) {
      return Response.json(
        { ok: false, error: "FAQ not found." },
        { status: 404, headers: NO_STORE }
      );
    }
    console.error(`DELETE /api/faqs/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not delete the FAQ." },
      { status: 500, headers: NO_STORE }
    );
  }
}
