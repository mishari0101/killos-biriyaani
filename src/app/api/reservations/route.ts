import {
  validateReservationFields,
  type ReservationFormValues,
} from "@/lib/contact";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function coerce(body: unknown): ReservationFormValues {
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    name: typeof b.name === "string" ? b.name : "",
    phone: typeof b.phone === "string" ? b.phone : "",
    guests: b.guests != null ? String(b.guests) : "",
    date: typeof b.date === "string" ? b.date : "",
    time: typeof b.time === "string" ? b.time : "",
    occasion: typeof b.occasion === "string" ? b.occasion : "",
    request: typeof b.request === "string" ? b.request : "",
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." },
      { status: 400, headers: NO_STORE }
    );
  }

  const values = coerce(body);
  const errors = validateReservationFields(values);
  if (Object.keys(errors).length > 0) {
    const [field, message] = Object.entries(errors)[0];
    return Response.json(
      { ok: false, field, error: message },
      { status: 400, headers: NO_STORE }
    );
  }

  const payload = {
    name: values.name.trim(),
    phone: values.phone.replace(/\D/g, ""),
    guests: Number(values.guests),
    date: values.date,
    time: values.time,
    ...(values.occasion ? { occasion: values.occasion } : {}),
    ...(values.request.trim() ? { request: values.request.trim() } : {}),
  };

  const url = process.env.RESERVATIONS_API_URL;

  if (!url) {
    console.warn(
      "[api/reservations] No RESERVATIONS_API_URL configured; reservation accepted in demo mode.",
      payload
    );
    return Response.json(
      { ok: true, accepted: true, queued: true },
      { status: 201, headers: NO_STORE }
    );
  }

  try {
    const token = process.env.RESERVATIONS_API_TOKEN;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Reservations API responded ${res.status}`);
    const data = await res.json().catch(() => ({}));
    return Response.json(
      { ok: true, ...(data && typeof data === "object" ? data : {}) },
      { status: 201, headers: NO_STORE }
    );
  } catch (error) {
    console.error("[api/reservations]", error);
    return Response.json(
      {
        ok: false,
        error: "Could not reach the reservation service. Please try again.",
      },
      { status: 502, headers: NO_STORE }
    );
  }
}
