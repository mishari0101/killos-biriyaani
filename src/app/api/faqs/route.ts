import { seedFaqs, type FaqItem } from "@/lib/content/faqs";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function toFaq(raw: unknown): FaqItem | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;
  const question = typeof f.question === "string" ? f.question.trim() : "";
  const answer = typeof f.answer === "string" ? f.answer.trim() : "";
  if (!question || !answer) return null;
  return {
    id:
      typeof f.id === "string" && f.id
        ? f.id
        : `faq-${question.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    question,
    answer,
    enabled: f.enabled !== false,
  };
}

function normalize(payload: unknown): FaqItem[] {
  let list: unknown;
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    list = obj.faqs ?? obj.data ?? obj.items ?? [];
  }
  if (!Array.isArray(list)) return [];
  return list
    .map(toFaq)
    .filter((f): f is FaqItem => f !== null)
    .filter((f) => f.enabled);
}

export async function GET() {
  const url = process.env.FAQS_API_URL;

  if (!url) {
    return Response.json(seedFaqs, { headers: NO_STORE });
  }

  try {
    const token = process.env.FAQS_API_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`FAQs API responded ${res.status}`);
    const items = normalize(await res.json());
    return Response.json(items.length ? items : seedFaqs, {
      headers: NO_STORE,
    });
  } catch (error) {
    console.error("[api/faqs]", error);
    return Response.json(seedFaqs, { headers: NO_STORE });
  }
}
