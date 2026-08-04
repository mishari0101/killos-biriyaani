import { getSession } from "@/lib/auth/session";
import {
  ContactMessageNotFoundError,
  deleteContactMessage,
  updateContactMessageNotes,
  updateContactMessageStatus,
} from "@/lib/contact-messages/service";
import { MAX_NOTES } from "@/lib/contact-messages/validate";
import {
  isContactMessageStatus,
  type ContactMessageStatus,
} from "@/lib/contact-messages/types";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
}

function notFound() {
  return Response.json(
    { ok: false, error: "Message not found." },
    { status: 404, headers: NO_STORE }
  );
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return Response.json(
      { ok: false, error: "Invalid message id." },
      { status: 400, headers: NO_STORE }
    );
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
      { ok: false, error: "Message payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const record = body as Record<string, unknown>;

  try {
    if (typeof record.status === "string") {
      if (!isContactMessageStatus(record.status)) {
        return Response.json(
          { ok: false, error: "Invalid message status." },
          { status: 422, headers: NO_STORE }
        );
      }
      const item = await updateContactMessageStatus(id, record.status as ContactMessageStatus);
      return Response.json({ ok: true, item }, { status: 200, headers: NO_STORE });
    }

    if (typeof record.notes === "string") {
      if (record.notes.length > MAX_NOTES) {
        return Response.json(
          { ok: false, error: `Internal notes must be ${MAX_NOTES} characters or fewer.` },
          { status: 422, headers: NO_STORE }
        );
      }
      const item = await updateContactMessageNotes(id, record.notes);
      return Response.json({ ok: true, item }, { status: 200, headers: NO_STORE });
    }

    return Response.json(
      { ok: false, error: "Nothing to update." },
      { status: 400, headers: NO_STORE }
    );
  } catch (error) {
    if (error instanceof ContactMessageNotFoundError) return notFound();
    console.error(`PUT /api/contact-messages/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not update the message." },
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
    return Response.json(
      { ok: false, error: "Invalid message id." },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    await deleteContactMessage(id);
    return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
  } catch (error) {
    if (error instanceof ContactMessageNotFoundError) return notFound();
    console.error(`DELETE /api/contact-messages/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not delete the message." },
      { status: 500, headers: NO_STORE }
    );
  }
}
