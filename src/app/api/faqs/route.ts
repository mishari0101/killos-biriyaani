import { getSession } from "@/lib/auth/session";
import { seedFaqs, type FaqItem } from "@/lib/content/faqs";
import { createFaq, listPublicFaqs, toFaqInput } from "@/lib/faqs/service";
import { validateFaq } from "@/lib/faqs/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** Map a DB FAQ row onto the public wire shape used by the FAQ accordion. */
function toPublicItem(row: { id: number; question: string; answer: string; visible: boolean }): FaqItem {
  return {
    id: String(row.id),
    question: row.question,
    answer: row.answer,
    enabled: row.visible,
  };
}

/** Public list: visible FAQs only (featured first, then display order).
    Falls back to the built-in static FAQs so the section is never empty. */
export async function GET() {
  try {
    const rows = await listPublicFaqs();
    const items = rows.map(toPublicItem);
    return Response.json(items.length ? items : seedFaqs, { headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/faqs failed:", error);
    return Response.json(seedFaqs, { headers: NO_STORE });
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
    const item = await createFaq(data);
    return Response.json({ ok: true, item }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/faqs failed:", error);
    return Response.json(
      { ok: false, error: "Could not create the FAQ." },
      { status: 500, headers: NO_STORE }
    );
  }
}
