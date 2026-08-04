import { getSession } from "@/lib/auth/session";
import {
  deleteReservation,
  ReservationNotFoundError,
  toReservationInput,
  updateReservation,
  updateReservationNotes,
  updateReservationStatus,
} from "@/lib/reservations/service";
import { MAX_NOTES, validateReservation } from "@/lib/reservations/validate";
import { isReservationStatus, type ReservationStatus } from "@/lib/reservations/types";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const BOOKING_FIELDS = [
  "name",
  "phone",
  "email",
  "branch",
  "guests",
  "date",
  "time",
  "occasion",
  "request",
] as const;

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
}

function notFound() {
  return Response.json(
    { ok: false, error: "Reservation not found." },
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
      { ok: false, error: "Invalid reservation id." },
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
      { ok: false, error: "Reservation payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const record = body as Record<string, unknown>;
  const hasBookingFields = BOOKING_FIELDS.some((key) => record[key] !== undefined);

  try {
    if (hasBookingFields) {
      const data = toReservationInput(record);
      const errors = validateReservation(data);
      if (Object.keys(errors).length > 0) {
        return Response.json(
          { ok: false, error: "Some fields are invalid.", errors },
          { status: 422, headers: NO_STORE }
        );
      }
      const item = await updateReservation(id, data);
      return Response.json({ ok: true, item }, { status: 200, headers: NO_STORE });
    }

    if (typeof record.status === "string") {
      if (!isReservationStatus(record.status)) {
        return Response.json(
          { ok: false, error: "Invalid reservation status." },
          { status: 422, headers: NO_STORE }
        );
      }
      const item = await updateReservationStatus(id, record.status as ReservationStatus);
      return Response.json({ ok: true, item }, { status: 200, headers: NO_STORE });
    }

    if (typeof record.notes === "string") {
      if (record.notes.length > MAX_NOTES) {
        return Response.json(
          { ok: false, error: `Internal notes must be ${MAX_NOTES} characters or fewer.` },
          { status: 422, headers: NO_STORE }
        );
      }
      const item = await updateReservationNotes(id, record.notes);
      return Response.json({ ok: true, item }, { status: 200, headers: NO_STORE });
    }

    return Response.json(
      { ok: false, error: "Nothing to update." },
      { status: 400, headers: NO_STORE }
    );
  } catch (error) {
    if (error instanceof ReservationNotFoundError) return notFound();
    console.error(`PUT /api/reservations/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not update the reservation." },
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
      { ok: false, error: "Invalid reservation id." },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    await deleteReservation(id);
    return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
  } catch (error) {
    if (error instanceof ReservationNotFoundError) return notFound();
    console.error(`DELETE /api/reservations/${id} failed:`, error);
    return Response.json(
      { ok: false, error: "Could not delete the reservation." },
      { status: 500, headers: NO_STORE }
    );
  }
}
