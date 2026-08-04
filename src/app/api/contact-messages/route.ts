import { getSession } from "@/lib/auth/session";
import {
  createContactMessage,
  DuplicateContactMessageError,
  listContactMessages,
  resolveBranchName,
  toContactMessageInput,
} from "@/lib/contact-messages/service";
import { validateContactMessage } from "@/lib/contact-messages/validate";
import {
  type ContactMessagePeriodFilter,
  type ContactMessageSortKey,
  type ContactMessageStatusFilter,
} from "@/lib/contact-messages/types";
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
    const status = asEnum<ContactMessageStatusFilter>(url.searchParams.get("status"), [
      "all",
      "NEW",
      "READ",
      "REPLIED",
      "CLOSED",
      "SPAM",
    ]);
    const period = asEnum<ContactMessagePeriodFilter>(url.searchParams.get("period"), [
      "all",
      "today",
      "week",
      "month",
    ]);
    const sort = asEnum<ContactMessageSortKey>(url.searchParams.get("sort"), [
      "newest",
      "oldest",
      "name",
      "status",
    ]);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "24", 10) || 24)
    );

    const result = await listContactMessages({ search, status, period, sort, page, pageSize });
    return Response.json({ ok: true, ...result }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/contact-messages failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the messages." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
  const check = consumeRateLimit(`contact:${clientIp(request)}`, {
    limit: PUBLIC_LIMIT,
    windowMs: PUBLIC_WINDOW_MS,
  });
  if (!check.allowed) {
    return Response.json(
      {
        ok: false,
        error: "Too many message requests. Please try again in a few minutes.",
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
      { ok: false, error: "Message payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toContactMessageInput(body as Record<string, unknown>);
  if (!data.branch) {
    data.branch = await resolveBranchName();
  }

  const errors = validateContactMessage(data);
  if (Object.keys(errors).length > 0) {
    const [field, message] = Object.entries(errors)[0];
    return Response.json(
      { ok: false, field, error: message },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const item = await createContactMessage(data);
    return Response.json(
      { ok: true, item: { number: item.number } },
      { status: 201, headers: NO_STORE }
    );
  } catch (error) {
    if (error instanceof DuplicateContactMessageError) {
      return Response.json(
        { ok: false, error: "We just received a very similar message from this number." },
        { status: 409, headers: NO_STORE }
      );
    }
    console.error("POST /api/contact-messages failed:", error);
    return Response.json(
      { ok: false, error: "Could not send your message. Please try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
