import { getSession } from "@/lib/auth/session";
import {
  createReservation,
  DuplicateReservationError,
  listReservations,
  resolveBranchName,
  toReservationInput,
} from "@/lib/reservations/service";
import { validateReservation } from "@/lib/reservations/validate";
import {
  type ReservationPeriodFilter,
  type ReservationSortKey,
  type ReservationStatusFilter,
} from "@/lib/reservations/types";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const PUBLIC_LIMIT = 5;
const PUBLIC_WINDOW_MS = 10 * 60 * 1000;

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
    const status = asEnum<ReservationStatusFilter>(url.searchParams.get("status"), [
      "all",
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ]);
    const period = asEnum<ReservationPeriodFilter>(url.searchParams.get("period"), [
      "all",
      "today",
      "upcoming",
      "past",
    ]);
    const sort = asEnum<ReservationSortKey>(url.searchParams.get("sort"), [
      "newest",
      "oldest",
      "date",
      "guests",
    ]);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "24", 10) || 24)
    );

    const result = await listReservations({ search, status, period, sort, page, pageSize });
    return Response.json({ ok: true, ...result }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/reservations failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the reservations." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
  const check = consumeRateLimit(`reservations:${clientIp(request)}`, {
    limit: PUBLIC_LIMIT,
    windowMs: PUBLIC_WINDOW_MS,
  });
  if (!check.allowed) {
    return Response.json(
      {
        ok: false,
        error: "Too many reservation requests. Please try again in a few minutes.",
      },
      {
        status: 429,
        headers: {
          ...NO_STORE,
          "Retry-After": String(Math.max(1, Math.ceil(check.retryAfterMs / 1000))),
        },
      }
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

  const data = toReservationInput(body as Record<string, unknown>);
  if (!data.branch) {
    data.branch = await resolveBranchName();
  }

  const errors = validateReservation(data);
  if (Object.keys(errors).length > 0) {
    const [field, message] = Object.entries(errors)[0];
    return Response.json(
      { ok: false, field, error: message },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const item = await createReservation(data);
    return Response.json(
      { ok: true, item: { number: item.number } },
      { status: 201, headers: NO_STORE }
    );
  } catch (error) {
    if (error instanceof DuplicateReservationError) {
      return Response.json(
        { ok: false, error: "This slot is already booked for this phone number." },
        { status: 409, headers: NO_STORE }
      );
    }
    console.error("POST /api/reservations failed:", error);
    return Response.json(
      { ok: false, error: "Could not save your reservation. Please try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
